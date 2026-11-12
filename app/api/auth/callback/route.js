import { NextResponse } from "next/server";
import { makeToken } from "@/lib/session";
import { redis } from "@/lib/db";

async function discordJson(res, what) {
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { throw new Error(`${what}: Discord returned status ${res.status}, not JSON`); }
}

export async function GET(req) {
  let step = "start";
  try {
    const redirectUri = process.env.DISCORD_REDIRECT_URI;
    const site = new URL(redirectUri).origin;
    const code = new URL(req.url).searchParams.get("code");
    if (!code) return NextResponse.redirect(`${site}/?error=discord`);

    step = "discord token";
    const tok = await discordJson(await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID, client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code", code, redirect_uri: redirectUri,
      }),
    }), "token");
    if (!tok.access_token) throw new Error("Discord rejected the sign-in code");

    step = "discord user";
    const u = await discordJson(await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tok.access_token}` },
    }), "user");

    step = "database";
    const existing = await redis.get(`profile:${u.id}`);
    const avatar = u.avatar ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=256` : null;
    await redis.set(`profile:${u.id}`, {
      username: null, bio: "", links: [], socials: [], accent: "#e0a243",
      ...existing, discordId: u.id, displayName: u.global_name || u.username, avatar,
      discord: { username: u.username, displayName: u.global_name || u.username, avatar, flags: u.public_flags || 0, nitro: (u.premium_type || 0) > 0 || !!u.banner || (u.avatar || "").startsWith("a_") },
    });

    step = "session cookie";
    const res = NextResponse.redirect(`${site}/dashboard`);
    res.cookies.set("haven_session", makeToken(u.id), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 30 * 86400 });
    return res;
  } catch (e) {
    console.error(`[auth callback] failed at "${step}":`, e);
    return new NextResponse(`Sign-in failed at "${step}". Check the Vercel logs.`, { status: 500 });
  }
}
