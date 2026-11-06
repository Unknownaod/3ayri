// app/api/giveaways/route.js
//
// Server-side only. Env vars (set in Vercel, none prefixed NEXT_PUBLIC_):
//   GREED_API_KEY       greed key with the giveaways:read scope
//   DISCORD_BOT_TOKEN   any bot token, used only to look up usernames and avatars
//   GUILD_ID            (optional) your server id, builds links to the giveaway message
//   GIVEAWAYS_DEBUG     (optional) set to 1, then open /api/giveaways?raw to see
//                       the raw greed response (handy for checking field names)

import { GREED_API, first, toIso, idOf, resolveUsers, fallbackUser, json } from "./_lib";

export const dynamic = "force-dynamic";

const MAX_ENDED = 60;

// Maps whatever greed returns onto one stable shape. If the field names on your
// server differ, add them to the key lists below.
function normalize(g) {
  const endsAt = toIso(first(g, ["endsAt", "endAt", "endTime", "endDate", "ends_at", "end", "expiresAt"]));
  const endedAt = toIso(first(g, ["endedAt", "ended_at"]));
  const status = String(first(g, ["status", "state"]) ?? "").toLowerCase();
  const flag = first(g, ["ended", "isEnded"]);

  const ended =
    flag !== undefined
      ? Boolean(flag)
      : ["ended", "finished", "complete", "completed"].includes(status) ||
        Boolean(endedAt) ||
        (endsAt !== null && Date.parse(endsAt) <= Date.now());

  const winnerList = first(g, ["winners", "winnerIds", "winner_ids"]);
  const winnerIds = Array.isArray(winnerList) ? winnerList.map(idOf).filter(Boolean) : [];

  const entriesRaw = first(g, ["entryCount", "entriesCount", "entries", "participants"]);
  const entries = Array.isArray(entriesRaw)
    ? entriesRaw.length
    : Number.isFinite(Number(entriesRaw)) && entriesRaw !== undefined
      ? Number(entriesRaw)
      : null;

  const id = String(g.id ?? first(g, ["messageId", "message_id"]) ?? "");
  const channelId = idOf(first(g, ["channelId", "channel_id", "channel"]));
  const guildId = process.env.GUILD_ID;
  const link =
    first(g, ["url", "link"]) ??
    (guildId && channelId && id ? `https://discord.com/channels/${guildId}/${channelId}/${id}` : null);

  const description = first(g, ["description", "details", "requirements"]);

  return {
    id,
    prize: String(first(g, ["prize", "title", "name"]) ?? "Giveaway"),
    description: typeof description === "string" && description.trim() ? description.trim().slice(0, 600) : null,
    ended,
    startedAt: toIso(first(g, ["startedAt", "startAt", "startTime", "createdAt", "started_at", "created_at"])),
    endsAt,
    endedAt: endedAt ?? (ended ? endsAt : null),
    entries,
    winnerCount: Number(first(g, ["winnerCount", "winnersCount", "numWinners", "winner_count"])) || winnerIds.length || 1,
    hostId: idOf(first(g, ["hostId", "host", "hostedBy", "createdBy", "creatorId", "host_id"])),
    winnerIds,
    link,
  };
}

const byEndsAsc = (a, b) => (Date.parse(a.endsAt) || Infinity) - (Date.parse(b.endsAt) || Infinity);
const byEndedDesc = (a, b) => (Date.parse(b.endedAt) || 0) - (Date.parse(a.endedAt) || 0);

export async function GET(request) {
  const key = process.env.GREED_API_KEY;
  if (!key) return json({ error: "GREED_API_KEY is not set on the server." }, 500);

  let upstream;
  try {
    upstream = await fetch(`${GREED_API}/giveaways`, {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
  } catch {
    return json({ error: "Could not reach the greed API." }, 502);
  }

  if (!upstream.ok) {
    return upstream.status === 429
      ? json({ error: "greed is rate limiting this key. Try again in a minute." }, 503)
      : json({ error: `The greed API returned ${upstream.status}.` }, 502);
  }

  const body = await upstream.json();
  const rows = Array.isArray(body?.data)
    ? body.data
    : first(body?.data, ["giveaways", "items", "results"]) ?? [];

  if (process.env.GIVEAWAYS_DEBUG === "1" && new URL(request.url).searchParams.has("raw")) {
    return json({ dataKeys: Object.keys(body?.data ?? {}), sample: rows.slice(0, 2) });
  }

  const all = rows.map(normalize);
  const live = all.filter((g) => !g.ended).sort(byEndsAsc);
  const endedAll = all.filter((g) => g.ended).sort(byEndedDesc);
  const ended = endedAll.slice(0, MAX_ENDED);

  const users = await resolveUsers(
    [...live, ...ended].flatMap((g) => [g.hostId, ...g.winnerIds]),
  );
  const person = (id) => (id ? users[id] ?? fallbackUser(id) : null);

  const shape = ({ hostId, winnerIds, ...g }) => ({
    ...g,
    host: person(hostId),
    winners: winnerIds.map(person),
  });

  return json(
    {
      live: live.map(shape),
      ended: ended.map(shape),
      totalEnded: endedAll.length,
      updatedAt: new Date().toISOString(),
    },
    200,
    true,
  );
}
