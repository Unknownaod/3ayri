import { redis } from "./db";
import { guildMember } from "./discord";
import { staffRoleIds } from "./staff";

// Haven's own badges. Nobody can add these by hand: they're read from Discord with the bot token.
//   staff    holds one of the staff roles (see lib/staff.js)
//   booster  boosts the server, or holds a role listed in BOOSTER_ROLE_IDS (comma separated role ids)
export const boosterRoleIds = () => String(process.env.BOOSTER_ROLE_IDS || "").split(",").map((x) => x.trim()).filter(Boolean);

const TTL = 10 * 60 * 1000;
const key = (id) => `hb:${id}`;

// -> ["staff", "booster"] (whichever apply). Cached for 10 minutes; if Discord can't be reached the last answer is kept.
export async function earnedHaven(id) {
  if (!id) return [];
  const c = await redis.get(key(id));
  if (c && typeof c.t === "number" && Date.now() - c.t < TTL) return c.v || [];
  let v = c?.v || [];
  try {
    const r = await guildMember(id);
    if (r.inGuild === false) v = [];
    else if (r.member) {
      const roles = r.member.roles || [];
      v = [];
      if (roles.some((x) => staffRoleIds().includes(x))) v.push("staff");
      if (r.member.premium_since || roles.some((x) => boosterRoleIds().includes(x))) v.push("booster");
    }
  } catch {}
  await redis.set(key(id), { v, t: Date.now() });
  return v;
}
