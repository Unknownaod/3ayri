import { NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { redis, validUsername } from "@/lib/db";
import { sanitize } from "@/lib/schema";

const bad = (error, status = 400) => NextResponse.json({ error }, { status });

async function extras(id, p) {
  const cnt = (t, arr) => Promise.all((arr || []).map((_, i) => redis.get(`clicks:${id}:${t}:${i}`).then((v) => v || 0)));
  return { views: (await redis.get(`views:${id}`)) ?? 0, clicks: { s: await cnt("s", p.socials), l: await cnt("l", p.links) } };
}

export async function GET() {
  const id = await getSessionId();
  if (!id) return bad("unauthenticated", 401);
  const p = await redis.get(`profile:${id}`);
  return NextResponse.json({ ...p, ...(await extras(id, p)) });
}

export async function PUT(req) {
  const id = await getSessionId();
  if (!id) return bad("unauthenticated", 401);
  const b = await req.json();
  const profile = await redis.get(`profile:${id}`);
  const username = String(b.username || "").slice(0, 40).toLowerCase();
  if (!validUsername(username)) return bad("Usernames are 3–20 characters: letters, numbers, underscores.");
  if (username !== profile.username) {
    if (!(await redis.set(`username:${username}`, id, { nx: true }))) return bad("That username is taken.", 409);
    if (profile.username) await redis.del(`username:${profile.username}`);
  }
  const { views, clicks, music, ...rest } = profile;
  const next = { ...rest, username, ...sanitize(b) };
  await redis.set(`profile:${id}`, next);
  return NextResponse.json({ ...next, ...(await extras(id, next)) });
}
