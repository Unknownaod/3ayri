// Discord cosmetics shown on a profile: the avatar decoration (the frame around the picture) and the server tag (the little
// tag next to a name). Both come straight from Discord's user data and are never typed in, so nobody can fake one.
//
// Discord user object (REST shape):  avatar_decoration_data = { asset, sku_id }   primary_guild = { identity_guild_id, identity_enabled, tag, badge }
// Saved on profile.discord as:       deco = "<asset hash>" | null                 tag = { t: "ABCD", g: "<guild id>", b: "<badge hash>" | null } | null
//
// A key that is missing from Discord's answer stays missing here (we don't know), and one that is present but empty becomes null
// (we know there's none), so a partial payload never wipes something that was saved earlier.

const HASH = /^[\w-]{1,80}$/;
const SNOWFLAKE = /^\d{5,25}$/;

export const decoUrl = (asset) => `/api/deco/${asset}`;   // our own copy, so the page can measure it (see app/api/deco)
export const tagBadgeUrl = (guildId, badge) => `https://cdn.discordapp.com/guild-tag-badges/${guildId}/${badge}.png`;

export function cosmeticsOf(u) {
  const out = {};
  if (!u || typeof u !== "object") return out;
  if ("avatar_decoration_data" in u) {
    const a = u.avatar_decoration_data?.asset;
    out.deco = typeof a === "string" && HASH.test(a) ? a : null;
  }
  if ("primary_guild" in u) {
    const g = u.primary_guild;
    const gid = String(g?.identity_guild_id ?? ""), tag = typeof g?.tag === "string" ? g.tag.trim().slice(0, 4) : "";
    out.tag = g && g.identity_enabled && tag && SNOWFLAKE.test(gid)
      ? { t: tag, g: gid, b: typeof g.badge === "string" && HASH.test(g.badge) ? g.badge : null }
      : null;
  }
  return out;
}
