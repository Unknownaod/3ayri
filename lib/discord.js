// Server-side check: is this user a member of YOUR Discord server (the one the bot is in)?
export async function guildMember(id) {
  const t = process.env.DISCORD_BOT_TOKEN, g = process.env.GUILD_ID || process.env.DISCORD_GUILD_ID;
  if (!t || !g) return { error: "Bot isn't configured (set DISCORD_BOT_TOKEN and DISCORD_GUILD_ID)." };
  const r = await fetch(`https://discord.com/api/v10/guilds/${g}/members/${id}`, { headers: { Authorization: `Bot ${t}` }, cache: "no-store" });
  if (r.status === 404) return { inGuild: false };
  if (!r.ok) return { error: `Discord answered ${r.status} — is the bot in the server?` };
  return { inGuild: true, member: await r.json() };
}

// Public profile of any Discord user (needs only the bot token, the person doesn't have to be in your server).
// Used to fill in badge flags. Animated avatars and banners need Nitro, so they count as evidence of it.
export async function discordUser(id) {
  const t = process.env.DISCORD_BOT_TOKEN;
  if (!t) return null;
  const r = await fetch(`https://discord.com/api/v10/users/${id}`, { headers: { Authorization: `Bot ${t}` }, cache: "no-store" });
  if (!r.ok) return null;
  const u = await r.json();
  return { username: u.username, displayName: u.global_name || u.username, flags: u.public_flags ?? 0, nitro: !!(u.banner || (u.avatar || "").startsWith("a_")) };
}
