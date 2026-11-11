import { NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { redis, validUsername } from "@/lib/db";

export async function GET() {
  const id = await getSessionId();
  if (!id) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  return NextResponse.json(await redis.get(`profile:${id}`));
}

export async function PUT(req) {
  const id = await getSessionId();
  if (!id) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const b = await req.json();
  const profile = await redis.get(`profile:${id}`);

  const username = String(b.username || "").toLowerCase();
  if (!validUsername(username))
    return NextResponse.json({ error: "Usernames are 3–20 characters: letters, numbers, underscores." }, { status: 400 });

  if (username !== profile.username) {
    const claimed = await redis.set(`username:${username}`, id, { nx: true });
    if (!claimed) return NextResponse.json({ error: "That username is taken." }, { status: 409 });
    if (profile.username) await redis.del(`username:${profile.username}`);
  }

  const links = (Array.isArray(b.links) ? b.links : []).slice(0, 8)
    .map((l) => ({ label: String(l.label || "").slice(0, 30), url: String(l.url || "").slice(0, 300) }))
    .filter((l) => l.label && /^https?:\/\//i.test(l.url));

  const next = {
    ...profile, username,
    bio: String(b.bio || "").slice(0, 280),
    accent: /^#[0-9a-f]{6}$/i.test(b.accent) ? b.accent : "#e0a243",
    links,
  };
  await redis.set(`profile:${id}`, next);
  return NextResponse.json(next);
}
