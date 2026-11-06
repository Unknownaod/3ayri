// app/api/giveaways/[id]/entries/route.js
//
// Returns the people who entered one giveaway, a page at a time, with Discord
// names, avatars, and server roles resolved for just the page being returned.
// Query: ?offset=0&limit=48   (limit is capped at 100)

import {
  GREED_API,
  first,
  toIso,
  idOf,
  resolveUsers,
  fallbackUser,
  json,
} from "../../_lib";

export const dynamic = "force-dynamic";

const CACHE_MS = 60_000;
const cache = new Map();

// Entries and claims may be bare ids or objects.
const userIdOf = (e) => {
  if (e === null || typeof e !== "object") return idOf(e);

  const direct = first(e, ["userId", "user_id", "memberId"]);
  if (direct !== undefined) return String(direct);

  return e.user ? idOf(e.user) : idOf(e.id);
};

const DISCORD_API = "https://discord.com/api/v10";

const GUILD_ID =
  process.env.GUILD_ID || process.env.DISCORD_GUILD_ID;

// Fetch one member's roles from Discord.
async function fetchDiscordMember(userId, token) {
  if (!GUILD_ID || !token) return null;

  try {
    const res = await fetch(
      `${DISCORD_API}/guilds/${GUILD_ID}/members/${userId}`,
      {
        headers: {
          Authorization: `Bot ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) return null;

    const member = await res.json();

    return {
      roleIds: Array.isArray(member.roles) ? member.roles : [],
    };
  } catch {
    return null;
  }
}

// Resolve Discord roles for the entrants on this page.
async function resolveEntrantRoles(userIds) {
  const token = process.env.DISCORD_BOT_TOKEN;

  if (!token || !GUILD_ID || !userIds.length) {
    return {};
  }

  const results = await Promise.all(
    userIds.map(async (userId) => {
      const member = await fetchDiscordMember(userId, token);

      return [userId, member];
    })
  );

  return Object.fromEntries(
    results.filter(([, member]) => member !== null)
  );
}

async function loadEntries(id, key) {
  const hit = cache.get(id);

  if (hit && hit.expires > Date.now()) {
    return hit.value;
  }

  const res = await fetch(`${GREED_API}/giveaways/${id}/entries`, {
    headers: {
      Authorization: `Bearer ${key}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw Object.assign(new Error("upstream"), {
      status: res.status,
    });
  }

  const body = await res.json();
  const data = body?.data;

  const raw = Array.isArray(data)
    ? data
    : first(data, ["entries", "items", "results", "participants"]) ?? [];

  const claimsRaw = Array.isArray(data)
    ? []
    : first(data, ["claims"]) ?? [];

  const claimed = new Set(
    claimsRaw.map(userIdOf).filter(Boolean)
  );

  const seen = new Set();
  const rows = [];

  for (const e of raw) {
    const uid = userIdOf(e);

    if (!uid || seen.has(uid)) continue;

    seen.add(uid);

    rows.push({
      id: uid,
      enteredAt:
        e && typeof e === "object"
          ? toIso(
              first(e, [
                "enteredAt",
                "createdAt",
                "joinedAt",
                "timestamp",
                "entered_at",
              ])
            )
          : null,
      claimed: claimed.has(uid),
    });
  }

  const totalRaw = Array.isArray(data)
    ? undefined
    : first(data, [
        "total",
        "count",
        "entryCount",
        "totalEntries",
      ]);

  const total =
    totalRaw !== undefined &&
    Number.isFinite(Number(totalRaw))
      ? Number(totalRaw)
      : rows.length;

  const value = {
    rows,
    total: Math.max(total, rows.length),
    dataKeys: Array.isArray(data)
      ? []
      : Object.keys(data ?? {}),
    rawSample: raw.slice(0, 3),
  };

  if (cache.size > 50) cache.clear();

  cache.set(id, {
    value,
    expires: Date.now() + CACHE_MS,
  });

  return value;
}

export async function GET(request, { params }) {
  const { id } = await params;

  if (!/^\d{5,25}$/.test(id)) {
    return json(
      { error: "That isn’t a valid giveaway id." },
      400
    );
  }

  const key = process.env.GREED_API_KEY;

  if (!key) {
    return json(
      { error: "GREED_API_KEY is not set on the server." },
      500
    );
  }

  const sp = new URL(request.url).searchParams;

  const offset = Math.max(
    0,
    parseInt(sp.get("offset") ?? "0", 10) || 0
  );

  const limit = Math.min(
    100,
    Math.max(
      1,
      parseInt(sp.get("limit") ?? "48", 10) || 48
    )
  );

  let data;

  try {
    data = await loadEntries(id, key);
  } catch (e) {
    const status = e.status;

    if (status === 404) {
      return json(
        { error: "That giveaway wasn’t found." },
        404
      );
    }

    if (status === 401 || status === 403) {
      return json(
        {
          error:
            "The API key can’t read entries. Check that it has the giveaways:read scope.",
        },
        502
      );
    }

    if (status === 429) {
      return json(
        {
          error:
            "greed is rate limiting this key. Try again in a minute.",
        },
        503
      );
    }

    return json(
      { error: "Could not load entrants from greed." },
      502
    );
  }

  if (
    process.env.GIVEAWAYS_DEBUG === "1" &&
    sp.has("raw")
  ) {
    return json({
      dataKeys: data.dataKeys,
      sample: data.rawSample,
      total: data.total,
    });
  }

  const slice = data.rows.slice(
    offset,
    offset + limit
  );

  // Resolve names and avatars.
  const users = await resolveUsers(
    slice.map((r) => r.id)
  );

  // Resolve Discord server roles for these entrants.
  const memberRoles = await resolveEntrantRoles(
    slice.map((r) => r.id)
  );

  return json(
    {
      total: data.total,
      truncated: data.total > data.rows.length,
      offset,
      hasMore: offset + limit < data.rows.length,

      entries: slice.map((r) => {
        const user =
          users[r.id] ?? fallbackUser(r.id);

        const roleIds =
          memberRoles[r.id]?.roleIds ?? [];

        return {
          user: {
            ...user,

            // Used by the frontend's RoleBadges component.
            roleIds,

            // Also provide roles as objects for components that use them.
            roles: roleIds.map((roleId) => ({
              id: roleId,
            })),
          },

          enteredAt: r.enteredAt,
          claimed: r.claimed,
        };
      }),
    },
    200,
    true
  );
}

