// app/api/giveaways/route.js
//
// Server-side only. Env vars (set in Vercel, none of them prefixed NEXT_PUBLIC_):
//   GREED_API_KEY       greed key with the giveaways:read scope
//   DISCORD_BOT_TOKEN   any bot token, used only to look up usernames and avatars
//   GUILD_ID            (optional) your server id, builds "enter in Discord" links
//   DISCORD_INVITE_URL  (optional) fallback invite link
//   GIVEAWAYS_DEBUG     (optional) set to 1, then open /api/giveaways?raw to see
//                       the raw greed response (handy for checking field names)

export const dynamic = "force-dynamic";

const GREED_API = "https://x.greed.best/v1";
const DISCORD_API = "https://discord.com/api/v10";
const MAX_ENDED = 30;
const USER_TTL = 60 * 60 * 1000; // resolved users are remembered for 1 hour
const RETRY_TTL = 5 * 60 * 1000; // failed lookups are retried after 5 minutes

const userCache = new Map(); // id -> { user, expires }

const first = (obj, keys) => {
  for (const k of keys) {
    if (obj?.[k] !== undefined && obj?.[k] !== null) return obj[k];
  }
  return undefined;
};

function toIso(value) {
  if (value === undefined || value === null || value === "") return null;
  const numeric =
    typeof value === "number" ? value : /^\d+$/.test(String(value)) ? Number(value) : null;
  const date = numeric !== null ? new Date(numeric < 1e12 ? numeric * 1000 : numeric) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function idOf(value) {
  if (value === undefined || value === null) return null;
  const raw = typeof value === "object" ? first(value, ["id", "userId", "user_id"]) : value;
  return raw === undefined || raw === null || raw === "" ? null : String(raw);
}

function defaultAvatar(id) {
  try {
    return `https://cdn.discordapp.com/embed/avatars/${Number((BigInt(id) >> 22n) % 6n)}.png`;
  } catch {
    return "https://cdn.discordapp.com/embed/avatars/0.png";
  }
}

function fallbackUser(id) {
  return { id, name: `User ${id.slice(-4)}`, username: null, avatar: defaultAvatar(id) };
}

async function lookupUser(id, token) {
  const cached = userCache.get(id);
  if (cached && cached.expires > Date.now()) return cached.user;

  let user = fallbackUser(id);
  let ttl = RETRY_TTL;

  if (token) {
    try {
      const res = await fetch(`${DISCORD_API}/users/${id}`, {
        headers: { Authorization: `Bot ${token}` },
        cache: "no-store",
      });
      if (res.ok) {
        const u = await res.json();
        const ext = u.avatar?.startsWith("a_") ? "gif" : "png";
        user = {
          id,
          name: u.global_name || u.username,
          username: u.username,
          avatar: u.avatar
            ? `https://cdn.discordapp.com/avatars/${id}/${u.avatar}.${ext}?size=64`
            : defaultAvatar(id),
        };
        ttl = USER_TTL;
      }
    } catch {
      // keep the fallback user
    }
  }

  userCache.set(id, { user, expires: Date.now() + ttl });
  return user;
}

async function resolveUsers(ids) {
  const token = process.env.DISCORD_BOT_TOKEN;
  const unique = [...new Set(ids.filter(Boolean))];
  const users = {};
  // small batches keep us well inside Discord's rate limits
  for (let i = 0; i < unique.length; i += 10) {
    const batch = await Promise.all(unique.slice(i, i + 10).map((id) => lookupUser(id, token)));
    for (const u of batch) users[u.id] = u;
  }
  return users;
}

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

  return {
    id,
    prize: String(first(g, ["prize", "title", "name"]) ?? "Giveaway"),
    ended,
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

function json(body, status = 200, cache = false) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": cache ? "public, s-maxage=30, stale-while-revalidate=60" : "no-store",
    },
  });
}

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
      inviteUrl: process.env.DISCORD_INVITE_URL ?? null,
      updatedAt: new Date().toISOString(),
    },
    200,
    true,
  );
}
