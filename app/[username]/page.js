import { notFound } from "next/navigation";
import { redis, dayKey } from "@/lib/db";
import { discordUser } from "@/lib/discord";
import { isStaff } from "@/lib/staff";
import { cfg } from "@/lib/schema";
import ProfileCard from "../ProfileCard";
import "../profiles.css";

export const dynamic = "force-dynamic";

async function load(username) {
  const id = await redis.get(`username:${username.toLowerCase()}`);
  return id ? { id, p: await redis.get(`profile:${id}`) } : null;
}
const fill = (t, p) => String(t).replace("{name}", p.name || p.displayName || p.username).replace("{username}", p.username);

export async function generateMetadata({ params }) {
  const f = await load((await params).username);
  if (!f?.p) return {};
  const { p } = f, c = cfg(p), img = p.customAvatar || p.avatar, remote = (u) => u && !u.startsWith("data:");
  let base; try { base = new URL(process.env.DISCORD_REDIRECT_URI).origin; } catch {}
  return {
    ...(base && { metadataBase: new URL(base) }),
    title: fill(c.tabTitle || "{name} (@{username}) · Haven", p),
    description: c.ogDesc || p.bio,
    ...(c.noindex && { robots: { index: false, follow: false } }),
    icons: remote(c.favicon || img) ? { icon: c.favicon || img } : undefined,
    openGraph: { title: p.name || p.displayName, description: c.ogDesc || p.bio, images: remote(img) ? [img] : [] },
  };
}
export async function generateViewport({ params }) {
  const f = await load((await params).username);
  return f?.p ? { themeColor: cfg(f.p).accent } : {};
}

// If a page has no badge flags stored (older pages, or flags saved as 0), ask Discord once a day and save what it says.
async function withBadges({ id, p }) {
  if (p.discord?.flags) return p;
  const key = `flagsTry:${id}:${dayKey()}`;
  if (await redis.get(key)) return p;
  await redis.set(key, 1);
  try {
    const u = await discordUser(id);
    if (!u || (!u.flags && !u.nitro)) return p;
    const np = { ...p, discord: { ...p.discord, ...u, nitro: u.nitro || p.discord?.nitro } };
    await redis.set(`profile:${id}`, np);
    return np;
  } catch { return p; }
}

export default async function ProfilePage({ params }) {
  const f = await load((await params).username);
  if (!f?.p) notFound();
  const views = (await redis.get(`views:${f.id}`)) ?? 0; // counted by the browser (POST /api/view), not on render
  const [p, staff] = await Promise.all([withBadges(f), isStaff(f.id)]);
  return <ProfileCard p={p} views={views} staff={staff} />;
}
