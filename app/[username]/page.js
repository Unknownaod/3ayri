import { notFound } from "next/navigation";
import { redis, dayKey } from "@/lib/db";
import { guildMember } from "@/lib/discord";
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

// Pages saved before badges existed have no Discord flags. If the owner is in the bot's server, fetch them once (tried at most once a day) so their badges appear without a re-login.
async function withBadges({ id, p }) {
  if (p.discord?.flags !== undefined) return p;
  const key = `flagsTry:${id}:${dayKey()}`;
  if (await redis.get(key)) return p;
  await redis.set(key, 1);
  try {
    const m = await guildMember(id);
    const u = m.member?.user;
    if (!u) return p;
    const np = { ...p, discord: { ...p.discord, username: u.username, displayName: u.global_name || u.username, flags: u.public_flags ?? 0 } };
    await redis.set(`profile:${id}`, np);
    return np;
  } catch { return p; }
}

export default async function ProfilePage({ params }) {
  const f = await load((await params).username);
  if (!f?.p) notFound();
  const views = (await redis.get(`views:${f.id}`)) ?? 0; // counted by the browser (POST /api/view), not on render
  return <ProfileCard p={await withBadges(f)} views={views} />;
}
