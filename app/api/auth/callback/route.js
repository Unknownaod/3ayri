import { NextResponse } from "next/server";
import { makeToken } from "@/lib/session";
import { redis } from "@/lib/db";

export async function GET(req) {
  const redirectUri = process.env.DISCORD_REDIRECT_URI;
  const site = new URL(redirectUri).origin;

  const code = new URL(req.url).searchParams.get("code");
  if (!code) return NextResponse.redirect(`${site}/?error=discord`);

  const tok = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  }).then((r) => r.json());
  if (!tok.access_token) return NextResponse.redirect(`${site}/?error=discord`);

  const u = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${tok.access_token}` },
  }).then((r) => r.json());

  const existing = await redis.get(`profile:${u.id}`);
  const avatar = u.avatar ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=256` : null;
  await redis.set(`profile:${u.id}`, {
    username: null, bio: "", links: [], accent: "#e0a243",
    ...existing, discordId: u.id, displayName: u.global_name || u.username, avatar,
  });

  const res = NextResponse.redirect(`${site}/dashboard`);
  res.cookies.set("haven_session", makeToken(u.id), {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 30 * 86400,
  });
  return res;
}
