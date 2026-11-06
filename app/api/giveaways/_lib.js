
// app/api/giveaways/_lib.js
// Shared by the giveaways routes. The leading underscore keeps it out of routing.

export const GREED_API = "https://x.greed.best/v1";

const DISCORD_API = "https://discord.com/api/v10";
const USER_TTL = 60 * 60 * 1000;
const RETRY_TTL = 5 * 60 * 1000;

const userCache = new Map();

// Staff roles used by the giveaways frontend.
export const STAFF_ROLES = {
  founders: "1563603827863715915",
  communityManager: "1563603827855458414",
  admin: "1563603827855458413",
  moderator: "1563603827855458412",
  trialModerator: "1563603827855458411",
};

const STAFF_ROLE_IDS = new Set(Object.values(STAFF_ROLES));

export const first = (obj, keys) => {
  for (const k of keys) {
    if (obj?.[k] !== undefined && obj?.[k] !== null) return obj[k];
  }
  return undefined;
};

export function toIso(value) {
  if (value === undefined || value === null || value === "") return null;

  const numeric =
    typeof value === "number"
      ? value
      : /^\d+$/.test(String(value))
        ? Number(value)
        : null;

  const date =
    numeric !== null
      ? new Date(numeric < 1e12 ? numeric * 1000 : numeric)
      : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function idOf(value) {
  if (value === undefined || value === null) return null;

  const raw =
    typeof value === "object"
      ? first(value, ["id", "userId", "user_id"])
      : value;

  return raw === undefined || raw === null || raw === ""
    ? null
    : String(raw);
}

function defaultAvatar(id) {
  try {
    return `https://cdn.discordapp.com/embed/avatars/${Number(
      (BigInt(id) >> 22n) % 6n
    )}.png`;
  } catch {
    return "https://cdn.discordapp.com/embed/avatars/0.png";
  }
}

export function fallbackUser(id) {
  return {
    id,
    name: `User ${id.slice(-4)}`,
    username: null,
    avatar: defaultAvatar(id),
    roles: [],
    roleIds: [],
    isStaff: false,
  };
}

async function lookupUser(id, token) {
  const cached = userCache.get(id);

  if (cached && cached.expires > Date.now()) {
    return cached.user;
  }

  let user = fallbackUser(id);
  let ttl = RETRY_TTL;

  const guildId = process.env.DISCORD_GUILD_ID;

  if (token) {
    // Fetch Discord profile and server membership at the same time.
    const [profileResult, memberResult] = await Promise.allSettled([
      fetch(`${DISCORD_API}/users/${id}`, {
        headers: { Authorization: `Bot ${token}` },
        cache: "no-store",
      }),

      guildId
        ? fetch(`${DISCORD_API}/guilds/${guildId}/members/${id}`, {
            headers: { Authorization: `Bot ${token}` },
            cache: "no-store",
          })
        : Promise.resolve(null),
    ]);

    // Resolve username and avatar.
    if (
      profileResult.status === "fulfilled" &&
      profileResult.value?.ok
    ) {
      try {
        const u = await profileResult.value.json();
        const ext = u.avatar?.startsWith("a_") ? "gif" : "png";

        user = {
          ...user,
          name: u.global_name || u.username,
          username: u.username,
          avatar: u.avatar
            ? `https://cdn.discordapp.com/avatars/${id}/${u.avatar}.${ext}?size=64`
            : defaultAvatar(id),
        };

        ttl = USER_TTL;
      } catch {
        // Keep fallback profile.
      }
    }

    // Resolve the user's roles in your Discord server.
    if (
      memberResult.status === "fulfilled" &&
      memberResult.value?.ok
    ) {
      try {
        const member = await memberResult.value.json();

        const roleIds = Array.isArray(member.roles)
          ? member.roles.map(String)
          : [];

        user = {
          ...user,
          roleIds,
          roles: roleIds.map((roleId) => ({ id: roleId })),
          isStaff: roleIds.some((roleId) =>
            STAFF_ROLE_IDS.has(roleId)
          ),
        };

        ttl = USER_TTL;
      } catch {
        // Keep the user profile even if role parsing fails.
      }
    }
  }

  userCache.set(id, {
    user,
    expires: Date.now() + ttl,
  });

  return user;
}

export async function resolveUsers(ids) {
  const token = process.env.DISCORD_BOT_TOKEN;
  const unique = [...new Set(ids.filter(Boolean).map(String))];

  const users = {};

  // Small batches keep us well inside Discord's rate limits.
  for (let i = 0; i < unique.length; i += 10) {
    const batch = await Promise.all(
      unique
        .slice(i, i + 10)
        .map((id) => lookupUser(id, token))
    );

    for (const user of batch) {
      users[user.id] = user;
    }
  }

  return users;
}

export function json(body, status = 200, cache = false) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": cache
        ? "public, s-maxage=30, stale-while-revalidate=60"
        : "no-store",
    },
  });
}
