import { redis } from "./db";
import { guildMember } from "./discord";

// Staff = anyone in your server who has one of the role IDs in STAFF_ROLE_IDS (comma or space separated).
// The role is read from Discord with the bot token, so it can't be edited by the profile owner.
export const staffRoleIds = () => String(process.env.STAFF_ROLE_IDS || "").split(/[\s,;]+/).filter((x) => /^\d{5,25}$/.test(x));

const TTL = 10 * 60 * 1000;
const key = (id) => `staff:${id}`;
const fresh = (c) => c && typeof c.t === "number" && Date.now() - c.t < TTL;

// True if this Discord user has a staff role. Cached for 10 minutes. If Discord can't be reached, the last known answer is kept.
export async function isStaff(id) {
  if (!id || !staffRoleIds().length) return false;
  const c = await redis.get(key(id));
  if (fresh(c)) return !!c.v;
  let v = !!c?.v;
  try {
    const r = await guildMember(id);
    if (r.inGuild === false) v = false;
    else if (r.member) { const ids = staffRoleIds(); v = (r.member.roles || []).some((x) => ids.includes(x)); }
  } catch {}
  await redis.set(key(id), { v, t: Date.now() });
  return v;
}

// Cached answers only (no Discord calls), for lists like Discover. Returns a Set of user ids.
export async function staffSet(ids) {
  if (!ids.length || !staffRoleIds().length) return new Set();
  const vals = await redis.mget(ids.map(key));
  return new Set(ids.filter((_, i) => vals[i]?.v));
}
