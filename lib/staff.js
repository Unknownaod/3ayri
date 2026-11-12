import { redis } from "./db";
import { guildMember } from "./discord";

// Same rule as the giveaways page: staff = a member of your server who holds one of these roles.
// The built-in list (Founder, Community Manager, Admin, Mod, Trial Mod) plus any IDs in STAFF_ROLE_IDS (comma separated).
// Roles are read from Discord with the bot token, so the profile owner can't change them.
const DEFAULT_STAFF = ["1563603827863715915", "1563603827855458414", "1563603827855458413", "1563603827855458412", "1563603827855458411"];
export const staffRoleIds = () => [...new Set([...DEFAULT_STAFF, ...String(process.env.STAFF_ROLE_IDS || "").split(",").map((x) => x.trim()).filter(Boolean)])];

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
