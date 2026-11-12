import { NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { redis } from "@/lib/db";
import { guildMember } from "@/lib/discord";

// Public: cached presence for a profile that turned it on. Cheap kv read, CDN-cached 10s.
export async function GET(req) {
  const u = new URL(req.url).searchParams.get("u");
  const p = u ? await redis.get(`profile:${u}`) : null;
  const data = p?.presence ? (await redis.get(`presence:${u}`)) || { status: "offline", act: null, custom: "" } : null;
  return NextResponse.json(data, { headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=20" } });
}

// "Read my Discord status" button: confirms you share a server with the bot, then reads what the bot sees.
export async function POST() {
  const id = await getSessionId();
  if (!id) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const m = await guildMember(id);
  if (m.error) return NextResponse.json({ ok: false, reason: "config", message: m.error });
  if (!m.inGuild) return NextResponse.json({ ok: false, reason: "not_in_server", message: "You're not in the server the bot is in. Join it, then try again.", invite: process.env.DISCORD_INVITE || null });
  const beat = await redis.get("bot:heartbeat");
  const botOnline = !!beat && Date.now() - beat < 120_000;
  const presence = await redis.get(`presence:${id}`);
  if (!botOnline && !presence) return NextResponse.json({ ok: false, reason: "bot_offline", message: "You're in the server, but the bot worker isn't running, so there's nothing to read yet." });
  // No record while the bot is online means the bot sees you as offline/invisible.
  return NextResponse.json({ ok: true, botOnline, nick: m.member.nick || m.member.user?.global_name || m.member.user?.username, presence: presence || { status: "offline", act: null, custom: "", ts: Date.now() } });
}
