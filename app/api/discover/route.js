import { NextResponse } from "next/server";
import { redis } from "@/lib/db";
import { isStaff } from "@/lib/staff";

const PAGE = 24;
const BIG = 120000;   // inline images bigger than this are left out of the list (the full page still has them)

// Public list of profile cards for the Discover tab: GET /api/discover?q=<search>&page=<n>
// Only profiles that picked a username and didn't turn "Show my page on the Discover tab" off.
const pub = (p) => {
  const o = { ...p };
  for (const k of ["discordId", "tracks", "musicUrl", "musicTitle", "musicArtist", "musicCover", "bgVideo", "music", "views", "clicks", "days", "customCss", "ogDesc", "createdAt", "updatedAt", "dashTheme"]) delete o[k];
  for (const k of ["background", "banner", "customAvatar", "thumb"]) if (typeof o[k] === "string" && o[k].startsWith("data:") && o[k].length > BIG) o[k] = "";
  o.socials = (p.socials || []).map(({ id, type, label }) => ({ id, type, label, url: "#" }));
  o.links = (p.links || []).filter((l) => !l.hidden && l.type !== "embed").map(({ id, type, label, icon, desc, badge, color, featured }) => ({ id, type, label, icon, desc, badge, color, featured, url: "#" }));
  o.discord = p.discord ? { username: p.discord.username, displayName: p.discord.displayName, avatar: p.discord.avatar, flags: p.discord.flags, nitro: p.discord.nitro } : undefined;
  return o;
};

export async function GET(req) {
  const sp = new URL(req.url).searchParams;
  const q = (sp.get("q") || "").trim().toLowerCase().slice(0, 40);
  const sort = ["new", "updated"].includes(sp.get("sort")) ? sp.get("sort") : "popular";
  const page = Math.max(0, parseInt(sp.get("page") || "0", 10) || 0);
  const rows = (await redis.list("profile:", 1000)).filter(([, p]) => p?.username && p.discover !== false);
  const views = await redis.mget(rows.map(([k]) => `views:${k.slice(8)}`));
  let list = rows.map(([k, p], i) => ({ id: k.slice(8), p, v: views[i] || 0 }));
  if (q) list = list.filter(({ p }) => `${p.username} ${p.name || ""} ${p.displayName || ""}`.toLowerCase().includes(q));
  const when = (p, k) => p[k] ?? p.updatedAt ?? 0;
  list.sort(sort === "new" ? (a, b) => when(b.p, "createdAt") - when(a.p, "createdAt") || b.v - a.v : sort === "updated" ? (a, b) => (b.p.updatedAt ?? 0) - (a.p.updatedAt ?? 0) || b.v - a.v : (a, b) => b.v - a.v);
  const slice = list.slice(page * PAGE, page * PAGE + PAGE);
  // Staff badges are looked up for the people on this page (cached for 10 minutes, so this is cheap after the first view).
  const staff = await Promise.all(slice.map((x) => isStaff(x.id).catch(() => false)));
  return NextResponse.json(
    { total: list.length, more: (page + 1) * PAGE < list.length, profiles: slice.map(({ p, v }, i) => ({ ...pub(p), views: v, staff: staff[i] })) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
