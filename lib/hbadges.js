import { redis } from "./db";
import { guildMember } from "./discord";
import { staffRoleIds } from "./staff";
import { isVerified } from "./verified";

// Haven's own badges. Nobody can add these by hand: they're read from Discord with the bot token (or, for verified, set by allowed staff).
//   staff     holds one of the staff roles (see lib/staff.js)
//   booster   boosts the server, or holds a role listed in BOOSTER_ROLE_IDS (comma separated role ids)
//   verified  given from the Moderation panel by whoever VERIFIED_BY allows (see lib/verified.js)
export const boosterRoleIds = () => String(process.env.BOOSTER_ROLE_IDS || "").split(",").map((x) => x.trim()).filter(Boolean);

const TTL = 10 * 60 * 1000;
const BOT_TTL = 6 * 60 * 60 * 1000;   // the worker keeps entries it wrote (src:"bot") up to date, so they stay valid longer
const key = (id) => `hb:${id}`;

// -> ["verified", "staff", "booster"] (whichever apply). The role-based ones are cached for 10 minutes (if Discord can't be reached
// the last answer is kept); verified is read fresh, so giving or removing it shows up straight away.
export async function earnedHaven(id) {
  if (!id) return [];
  const v = await roleBadges(id);
  return (await isVerified(id).catch(() => false)) ? ["verified", ...v] : v;
}

async function roleBadges(id) {
  const c = await redis.get(key(id));
  if (c && typeof c.t === "number" && Date.now() - c.t < (c.src === "bot" ? BOT_TTL : TTL)) return c.v || [];
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
