import { NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { redis, validUsername } from "@/lib/db";
import { PLATFORMS, THEMES, SHAPES, LAYOUTS, FONTS } from "@/lib/platforms";

const bad = (error, status = 400) => NextResponse.json({ error }, { status });
const img = (v, max = 900_000) => (typeof v === "string" && /^data:image\/(jpeg|png|webp);base64,/.test(v) && v.length < max ? v : "");
const url = (v) => (/^https?:\/\//i.test(v) ? String(v).slice(0, 300) : "");
const num = (v, lo, hi, d) => (Number.isFinite(+v) ? Math.min(hi, Math.max(lo, +v)) : d);
const pick = (v, list, d) => (list.includes(v) ? v : d);
const str = (v, n) => String(v || "").slice(0, n);

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

  const username = str(b.username, 40).toLowerCase();
  if (!validUsername(username)) return bad("Usernames are 3–20 characters: letters, numbers, underscores.");
  if (username !== profile.username) {
    if (!(await redis.set(`username:${username}`, id, { nx: true }))) return bad("That username is taken.", 409);
    if (profile.username) await redis.del(`username:${profile.username}`);
  }

  const color = (v, d) => (/^#[0-9a-f]{6}$/i.test(v) ? v : d);
  const socials = (Array.isArray(b.socials) ? b.socials : []).slice(0, 14)
    .map((s) => ({ type: s.type, url: url(s.url) })).filter((s) => PLATFORMS[s.type] && s.url);
  const links = (Array.isArray(b.links) ? b.links : []).slice(0, 12)
    .map((l) => ({ label: str(l.label, 40), url: url(l.url) })).filter((l) => l.label && l.url);

  const { views, clicks, ...rest } = profile;
  const next = {
    ...rest, username, socials, links,
    name: str(b.name, 32), bio: str(b.bio, 280), location: str(b.location, 40),
    accent: color(b.accent, "#e0a243"), bgColor: color(b.bgColor, ""),
    theme: pick(b.theme, THEMES, "dark"), avatarShape: pick(b.avatarShape, SHAPES, "circle"),
    layout: pick(b.layout, LAYOUTS, "center"), font: pick(b.font, Object.keys(FONTS), "sans"),
    cardOpacity: num(b.cardOpacity, 0, 100, 85), blur: num(b.blur, 0, 30, 12),
    banner: img(b.banner), background: img(b.background, 1_400_000), customAvatar: img(b.customAvatar),
    entry: !!b.entry, entryText: str(b.entryText, 30), typewriter: !!b.typewriter, tilt: !!b.tilt,
    presence: !!b.presence, showViews: b.showViews !== false,
    music: { url: url(b.music?.url), title: str(b.music?.title, 60) },
  };
  await redis.set(`profile:${id}`, next);
  return NextResponse.json({ ...next, ...(await extras(id, next)) });
}
