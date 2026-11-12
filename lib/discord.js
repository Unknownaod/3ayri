// Server-side check: is this user a member of YOUR Discord server (the one the bot is in)?
export async function guildMember(id) {
  const { DISCORD_BOT_TOKEN: t, DISCORD_GUILD_ID: g } = process.env;
  if (!t || !g) return { error: "Bot isn't configured (set DISCORD_BOT_TOKEN and DISCORD_GUILD_ID)." };
  const r = await fetch(`https://discord.com/api/v10/guilds/${g}/members/${id}`, { headers: { Authorization: `Bot ${t}` }, cache: "no-store" });
  if (r.status === 404) return { inGuild: false };
  if (!r.ok) return { error: `Discord answered ${r.status} — is the bot in the server?` };
  return { inGuild: true, member: await r.json() };
}
