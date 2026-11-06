// app/api/giveaways/_lib.js
// Shared by the giveaways routes. The leading underscore keeps it out of routing.

export const GREED_API = "https://x.greed.best/v1";
const DISCORD_API = "https://discord.com/api/v10";
const USER_TTL = 60 * 60 * 1000; // resolved users are remembered for 1 hour
const RETRY_TTL = 5 * 60 * 1000; // failed lookups are retried after 5 minutes

const userCache = new Map(); // id -> { user, expires }

export const first = (obj, keys) => {
  for (const k of keys) {
    if (obj?.[k] !== undefined && obj?.[k] !== null) return obj[k];
  }
  return undefined;
};

export function toIso(value) {
  if (value === undefined || value === null || value === "") return null;
  const numeric =
    typeof value === "number" ? value : /^\d+$/.test(String(value)) ? Number(value) : null;
  const date = numeric !== null ? new Date(numeric < 1e12 ? numeric * 1000 : numeric) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function idOf(value) {
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

export function fallbackUser(id) {
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

export async function resolveUsers(ids) {
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

export function json(body, status = 200, cache = false) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": cache ? "public, s-maxage=30, stale-while-revalidate=60" : "no-store",
    },
  });
}
