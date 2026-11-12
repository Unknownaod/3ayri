import { NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { redis } from "@/lib/db";
import { guildMember } from "@/lib/discord";
import { cfg } from "@/lib/schema";

export const maxDuration = 15;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Public: cached presence for a profile that turned it on (only the parts its owner chose to show).
// Cheap kv read, CDN-cached 10s.
export async function GET(req) {
  const u = new URL(req.url).searchParams.get("u");
  const p = u ? await redis.get(`profile:${u}`) : null;
  let data = null;
  if (p?.presence) {
    const c = cfg(p), d = (await redis.get(`presence:${u}`)) || { status: "offline", act: null, custom: "" };
    const acts = (d.acts || (d.act ? [d.act] : [])).filter(() => c.presenceActivity);
    data = { status: d.status, custom: c.presenceCustom ? d.custom : "", ce: c.presenceCustom ? d.ce : undefined, plat: c.presencePlatform ? d.plat : undefined, act: acts[0] || null, acts, ts: d.ts };
  }
  return NextResponse.json(data, { headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=20" } });
}

// "Read my Discord status" button:
//  1. confirms you share a server with the bot (Discord REST, using the bot token)
//  2. asks the worker to look you up right now (presence_want), and waits a few seconds for its answer
//  3. refreshes your Discord name, avatar and badges, and returns what the bot sees
export async function POST() {
  const id = await getSessionId();
  if (!id) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const m = await guildMember(id);
  if (m.error) return NextResponse.json({ ok: false, reason: "config", message: m.error });
  if (!m.inGuild) return NextResponse.json({ ok: false, reason: "not_in_server", message: "You're not in the server the bot is in. Join it, then try again.", invite: process.env.DISCORD_INVITE || null });

  const beat = await redis.get("bot:heartbeat");
  const botOnline = !!beat && Date.now() - beat < 120_000;
  let presence = await redis.get(`presence:${id}`), fresh = false;

  if (botOnline) {
    await redis.set(`presence_want:${id}`, Date.now());
    for (let i = 0; i < 10; i++) {            // the worker deletes the request once it has written your presence
      await sleep(500);
      if (!(await redis.get(`presence_want:${id}`))) { presence = (await redis.get(`presence:${id}`)) || presence; fresh = true; break; }
    }
    if (!fresh) await redis.del(`presence_want:${id}`);
  } else if (!presence) {
    return NextResponse.json({ ok: false, reason: "bot_offline", message: "You're in the server, but the bot worker isn't running, so there's nothing to read yet." });
  }

  const u = m.member.user, prof = await redis.get(`profile:${id}`);
  const discord = { ...prof?.discord, username: u.username, displayName: u.global_name || u.username, flags: u.public_flags ?? prof?.discord?.flags ?? 0,
    avatar: u.avatar ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=256` : prof?.discord?.avatar };
  if (prof) await redis.set(`profile:${id}`, { ...prof, discord });
  return NextResponse.json({
    ok: true, botOnline, fresh, discord, nick: m.member.nick || u.global_name || u.username,
    presence: presence || { status: "offline", act: null, custom: "", ts: Date.now() },
  });
}
