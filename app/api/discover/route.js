import { NextResponse } from "next/server";
import { redis } from "@/lib/db";

const PAGE = 24;
const BIG = 120000;   // inline images bigger than this are left out of the list (the full page still has them)

// Public list of profile cards for the Discover tab: GET /api/discover?q=<search>&page=<n>
// Only profiles that picked a username and didn't turn "Show my page on the Discover tab" off.
const pub = (p) => {
  const o = { ...p };
  for (const k of ["discordId", "tracks", "musicUrl", "musicTitle", "musicArtist", "musicCover", "bgVideo", "music", "views", "clicks", "days", "customCss", "ogDesc"]) delete o[k];
  for (const k of ["background", "banner", "customAvatar", "thumb"]) if (typeof o[k] === "string" && o[k].startsWith("data:") && o[k].length > BIG) o[k] = "";
  o.socials = (p.socials || []).map(({ id, type, label }) => ({ id, type, label, url: "#" }));
  o.links = (p.links || []).filter((l) => !l.hidden && l.type !== "embed").map(({ id, type, label, icon, desc, badge, color, featured }) => ({ id, type, label, icon, desc, badge, color, featured, url: "#" }));
  o.discord = p.discord ? { username: p.discord.username, displayName: p.discord.displayName, avatar: p.discord.avatar, flags: p.discord.flags, nitro: p.discord.nitro } : undefined;
  return o;
};

export async function GET(req) {
  const sp = new URL(req.url).searchParams;
  const q = (sp.get("q") || "").trim().toLowerCase().slice(0, 40);
  const page = Math.max(0, parseInt(sp.get("page") || "0", 10) || 0);
  const rows = (await redis.list("profile:", 1000)).filter(([, p]) => p?.username && p.discover !== false);
  const views = await redis.mget(rows.map(([k]) => `views:${k.slice(8)}`));
  let list = rows.map(([, p], i) => ({ p, v: views[i] || 0 }));
  if (q) list = list.filter(({ p }) => `${p.username} ${p.name || ""} ${p.displayName || ""}`.toLowerCase().includes(q));
  list.sort((a, b) => b.v - a.v);
  const slice = list.slice(page * PAGE, page * PAGE + PAGE);
  return NextResponse.json(
    { total: list.length, more: (page + 1) * PAGE < list.length, profiles: slice.map(({ p, v }) => ({ ...pub(p), views: v })) },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
}
