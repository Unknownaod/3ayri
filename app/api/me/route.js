import { NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { redis, validUsername, dayKey } from "@/lib/db";
import { sanitize, itemsOf, cfg } from "@/lib/schema";

const bad = (error, status = 400) => NextResponse.json({ error }, { status });

// Views (total + last 30 days) and click counts per item id, for the Stats tab.
async function extras(id, p) {
  const it = itemsOf(p);
  const ids = [...it.socials, ...it.links].filter((x) => x.type !== "header" && x.type !== "divider").map((x) => x.id);
  const days = Array.from({ length: 30 }, (_, i) => dayKey(Date.now() - (29 - i) * 864e5));
  const vals = await redis.mget([`views:${id}`, ...days.map((d) => `views:${id}:${d}`), ...ids.map((i) => `clicks:${id}:${i}`)]);
  const clicks = {};
  ids.forEach((i, n) => (clicks[i] = vals[31 + n] || 0));
  return { views: vals[0] || 0, days: days.map((d, n) => ({ d, v: vals[1 + n] || 0 })), clicks };
}

// What the dashboard receives: the saved profile, with legacy shapes (music:{url}, items without ids) upgraded.
const shape = (p) => ({ ...p, ...itemsOf(p), musicUrl: cfg(p).musicUrl, musicTitle: cfg(p).musicTitle });

export async function GET() {
  const id = await getSessionId();
  if (!id) return bad("unauthenticated", 401);
  const p = await redis.get(`profile:${id}`);
  if (!p) return bad("unauthenticated", 401);
  return NextResponse.json({ ...shape(p), ...(await extras(id, p)) });
}

export async function PUT(req) {
  const id = await getSessionId();
  if (!id) return bad("unauthenticated", 401);
  const text = await req.text();
  if (text.length > 4_000_000) return bad("That's too much data to save at once. Try a smaller image.", 413);
  let b;
  try { b = JSON.parse(text); } catch { return bad("Couldn't read that request."); }
  const profile = await redis.get(`profile:${id}`);
  if (!profile) return bad("unauthenticated", 401);

  const username = String(b.username || "").slice(0, 40).toLowerCase();
  if (!validUsername(username)) return bad("Usernames are 3–20 characters: letters, numbers, underscores.");
  if (username !== profile.username) {
    if (!(await redis.set(`username:${username}`, id, { nx: true }))) return bad("That username is taken.", 409);
    if (profile.username) await redis.del(`username:${profile.username}`);
  }
  const { views, clicks, days, music, ...rest } = profile;
  const next = { ...rest, username, ...sanitize(b) };
  await redis.set(`profile:${id}`, next);
  return NextResponse.json({ ...shape(next), ...(await extras(id, next)) });
}

// "Delete my page": frees the username and removes the profile. (Signing in again starts a fresh one.)
export async function DELETE() {
  const id = await getSessionId();
  if (!id) return bad("unauthenticated", 401);
  const p = await redis.get(`profile:${id}`);
  if (p?.username) await redis.del(`username:${p.username}`);
  await redis.del(`profile:${id}`);
  await redis.del(`presence:${id}`);
  const res = NextResponse.json({ ok: true });
  res.cookies.set("haven_session", "", { path: "/", maxAge: 0 });
  return res;
}
