// The site's public address, taken from DISCORD_REDIRECT_URI (https://yourdomain/api/auth/callback). Falls back to havenshq.xyz.
export const SITE = (() => { try { return new URL(process.env.DISCORD_REDIRECT_URI).origin; } catch { return "https://havenshq.xyz"; } })();
export const CONTACT = process.env.CONTACT_EMAIL || "";
export const SERVER_INVITE = process.env.DISCORD_INVITE || "";
