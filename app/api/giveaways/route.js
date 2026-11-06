
import {
  GREED_API,
  first,
  toIso,
  idOf,
  resolveUsers,
  fallbackUser,
  json,
} from "./_lib";

export const dynamic = "force-dynamic";

const MAX_ENDED = 60;

// Supports either environment variable name.
const GUILD_ID =
  process.env.GUILD_ID ||
  process.env.DISCORD_GUILD_ID;

// Staff role IDs.
const STAFF_ROLE_IDS = new Set([
  "1563603827863715915", // Founder
  "1563603827855458414", // Community Manager
  "1563603827855458413", // Admin
  "1563603827855458412", // Mod
  "1563603827855458411", // Trial Mod

  // Optional additional role IDs from environment variables.
  ...(process.env.STAFF_ROLE_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean),
]);

function normalize(g) {
  const endsAt = toIso(
    first(g, [
      "endsAt", "endAt", "endTime", "endDate",
      "ends_at", "end", "expiresAt",
    ])
  );

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
  const winnerIds = Array.isArray(winnerList)
    ? winnerList.map(idOf).filter(Boolean)
    : [];

  const entriesRaw = first(g, [
    "entryCount", "entriesCount", "entries", "participants",
  ]);

  const entries = Array.isArray(entriesRaw)
    ? entriesRaw.length
    : Number.isFinite(Number(entriesRaw)) && entriesRaw !== undefined
      ? Number(entriesRaw)
      : null;

  const id = String(
    g.id ?? first(g, ["messageId", "message_id"]) ?? ""
  );

  const channelId = idOf(
    first(g, ["channelId", "channel_id", "channel"])
  );

  const link =
    first(g, ["url", "link"]) ??
    (GUILD_ID && channelId && id
      ? `https://discord.com/channels/${GUILD_ID}/${channelId}/${id}`
      : null);

  const description = first(g, [
    "description", "details", "requirements",
  ]);

  return {
    id,
    prize: String(first(g, ["prize", "title", "name"]) ?? "Giveaway"),
    description:
      typeof description === "string" && description.trim()
        ? description.trim().slice(0, 600)
        : null,
    ended,
    startedAt: toIso(
      first(g, [
        "startedAt", "startAt", "startTime",
        "createdAt", "started_at", "created_at",
      ])
    ),
    endsAt,
    endedAt: endedAt ?? (ended ? endsAt : null),
    entries,
    winnerCount:
      Number(
        first(g, [
          "winnerCount", "winnersCount",
          "numWinners", "winner_count",
        ])
      ) || winnerIds.length || 1,
    hostId: idOf(
      first(g, [
        "hostId", "host", "hostedBy",
        "createdBy", "creatorId", "host_id",
      ])
    ),
    winnerIds,
    link,
  };
}

const byEndsAsc = (a, b) =>
  (Date.parse(a.endsAt) || Infinity) -
  (Date.parse(b.endsAt) || Infinity);

const byEndedDesc = (a, b) =>
  (Date.parse(b.endedAt) || 0) -
  (Date.parse(a.endedAt) || 0);

// Discord API helper.
async function discordFetch(path) {
  const token = process.env.DISCORD_BOT_TOKEN;

  if (!token) {
    throw new Error("DISCORD_BOT_TOKEN is not configured.");
  }

  const response = await fetch(
    `https://discord.com/api/v10${path}`,
    {
      headers: {
        Authorization: `Bot ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(
      `Discord API returned ${response.status}: ${details.slice(0, 300)}`
    );
  }

  return response.json();
}

// Collect all role information from the Discord server.
async function collectServerRoles() {
  if (!GUILD_ID) {
    throw new Error("GUILD_ID or DISCORD_GUILD_ID is not configured.");
  }

  const roles = await discordFetch(
    `/guilds/${GUILD_ID}/roles`
  );

  const roleMap = {};

  const serverRoles = roles.map((role) => {
    const isStaffRole = STAFF_ROLE_IDS.has(role.id);

    const data = {
      id: role.id,
      name: role.name,
      color: role.color,
      hexColor: role.color
        ? `#${role.color.toString(16).padStart(6, "0")}`
        : "#000000",
      position: role.position,
      permissions: role.permissions,
      hoist: role.hoist,
      managed: role.managed,
      mentionable: role.mentionable,
      icon: role.icon
        ? `https://cdn.discordapp.com/role-icons/${role.id}/${role.icon}.png`
        : null,
      unicodeEmoji: role.unicode_emoji ?? null,
      isStaffRole,
    };

    roleMap[role.id] = data;

    return data;
  });

  return {
    serverRoles,
    roleMap,
  };
}

// Collect each user's Discord membership and assigned roles.
async function collectMembers(userIds, roleMap) {
  const members = {};

  await Promise.all(
    userIds.map(async (userId) => {
      try {
        const member = await discordFetch(
          `/guilds/${GUILD_ID}/members/${userId}`
        );

        const roleIds = Array.isArray(member.roles)
          ? member.roles.map(String)
          : [];

        const roles = roleIds.map(
          (roleId) =>
            roleMap[roleId] ?? {
              id: roleId,
              name: "Unknown role",
              isStaffRole: STAFF_ROLE_IDS.has(roleId),
            }
        );

        members[userId] = {
          roleIds,
          roles,
          isStaff: roles.some((role) => role.isStaffRole),
          joinedAt: member.joined_at ?? null,
          premiumSince: member.premium_since ?? null,
          pending: member.pending ?? false,
          communicationDisabledUntil:
            member.communication_disabled_until ?? null,
        };
      } catch (error) {
        console.error(
          `Could not fetch Discord member ${userId}:`,
          error.message
        );

        members[userId] = {
          roleIds: [],
          roles: [],
          isStaff: false,
          joinedAt: null,
          premiumSince: null,
          pending: false,
          communicationDisabledUntil: null,
          lookupFailed: true,
        };
      }
    })
  );

  return members;
}

export async function GET(request) {
  const key = process.env.GREED_API_KEY;

  if (!key) {
    return json({
      error: "GREED_API_KEY is not set on the server.",
    }, 500);
  }

  let upstream;

  try {
    upstream = await fetch(`${GREED_API}/giveaways`, {
      headers: {
        Authorization: `Bearer ${key}`,
      },
      cache: "no-store",
    });
  } catch {
    return json({
      error: "Could not reach the greed API.",
    }, 502);
  }

  if (!upstream.ok) {
    return upstream.status === 429
      ? json({
          error: "greed is rate limiting this key. Try again in a minute.",
        }, 503)
      : json({
          error: `The greed API returned ${upstream.status}.`,
        }, 502);
  }

  const body = await upstream.json();

  const rows = Array.isArray(body?.data)
    ? body.data
    : first(body?.data, ["giveaways", "items", "results"]) ?? [];

  if (
    process.env.GIVEAWAYS_DEBUG === "1" &&
    new URL(request.url).searchParams.has("raw")
  ) {
    return json({
      dataKeys: Object.keys(body?.data ?? {}),
      sample: rows.slice(0, 2),
    });
  }

  const all = rows.map(normalize);

  const live = all
    .filter((g) => !g.ended)
    .sort(byEndsAsc);

  const endedAll = all
    .filter((g) => g.ended)
    .sort(byEndedDesc);

  const ended = endedAll.slice(0, MAX_ENDED);

  // Collect every unique host and winner.
  const userIds = [
    ...new Set(
      [...live, ...ended]
        .flatMap((g) => [g.hostId, ...g.winnerIds])
        .filter(Boolean)
    ),
  ];

  let serverRoles = [];
  let roleMap = {};
  let members = {};

  try {
    const collected = await collectServerRoles();

    serverRoles = collected.serverRoles;
    roleMap = collected.roleMap;

    members = await collectMembers(userIds, roleMap);
  } catch (error) {
    console.error("Discord role collection failed:", error.message);
  }

  // Collect usernames and avatars.
  const users = await resolveUsers(userIds);

  // Combine user profiles with Discord server membership data.
  const person = (id) => {
    if (!id) return null;

    const user = users[id] ?? fallbackUser(id);
    const member = members[id];

    return {
      ...user,
      isStaff: member?.isStaff ?? false,
      roles: member?.roles ?? [],
      roleIds: member?.roleIds ?? [],
      joinedAt: member?.joinedAt ?? null,
      premiumSince: member?.premiumSince ?? null,
      pending: member?.pending ?? false,
      communicationDisabledUntil:
        member?.communicationDisabledUntil ?? null,
      lookupFailed: member?.lookupFailed ?? true,
    };
  };

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

      // Complete Discord server role information.
      serverRoles,

      // Staff role configuration.
      staffRoleIds: [...STAFF_ROLE_IDS],

      // Whether Discord role collection succeeded.
      discordDataAvailable: Object.keys(roleMap).length > 0,

      updatedAt: new Date().toISOString(),
    },
    200,
    true
  );
}
