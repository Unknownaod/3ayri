import { notFound } from "next/navigation";
import { redis } from "@/lib/db";
import ProfileCard from "../ProfileCard";
import "../profiles.css";

async function load(username) {
  const id = await redis.get(`username:${username.toLowerCase()}`);
  return id ? { id, p: await redis.get(`profile:${id}`) } : null;
}

export async function generateMetadata({ params }) {
  const f = await load((await params).username);
  if (!f) return {};
  const { p } = f, img = p.customAvatar || p.avatar;
  return {
    title: `${p.name || p.displayName} (@${p.username}) · Haven`,
    description: p.bio,
    themeColor: p.accent,
    openGraph: { title: p.name || p.displayName, description: p.bio, images: img && !img.startsWith("data:") ? [img] : [] },
  };
}

export default async function ProfilePage({ params }) {
  const f = await load((await params).username);
  if (!f) notFound();
  const views = await redis.incr(`views:${f.id}`);
  return <ProfileCard p={f.p} views={views} />;
}
