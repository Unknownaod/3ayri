import { NextResponse } from "next/server";
import { redis } from "@/lib/db";
import { isStaff } from "@/lib/staff";
import { safe, bad, ipOf } from "@/lib/api";
import { limit, tooMany } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";
const PAGE = 24;
const BIG = 120000;   // uploaded pictures bigger than this are served from /api/img instead of inside the list
const CACHE_MS = 10000;

// Public list of profile cards for the Discover tab: GET /api/discover?q=<search>&sort=popular|new|updated&page=<n>
// Only profiles that picked a username, didn't turn "Show my page on the Discover tab" off, and weren't hidden by staff.
const pub = (p) => {
  const o = { ...p };
  for (const k of ["discordId", "tracks", "musicUrl", "musicTitle", "musicArtist", "musicCover", "music", "views", "clicks", "days", "customCss", "ogDesc", "createdAt", "updatedAt", "dashTheme", "usernameChangedAt", "hidden", "hiddenReason"]) delete o[k];
  for (const k of ["background", "banner", "customAvatar"]) {
    if (o[k] === "__big__") o[k] = `/api/img/${p.username}/${k}?v=${p.updatedAt ?? 0}`;
    else if (typeof o[k] === "string" && o[k].startsWith("data:") && o[k].length > BIG) o[k] = `/api/img/${p.username}/${k}?v=${p.updatedAt ?? 0}`;
  }
  if (typeof o.thumb === "string" && o.thumb.startsWith("data:") && o.thumb.length > BIG) o.thumb = "";
  o.socials = (p.socials || []).map(({ id, type, label }) => ({ id, type, label, url: "#" }));
  o.links = (p.links || []).filter((l) => !l.hidden && l.type !== "embed").map(({ id, type, label, icon, desc, badge, color, featured }) => ({ id, type, label, icon, desc, badge, color, featured, url: "#" }));
  o.discord = p.discord ? { username: p.discord.username, displayName: p.discord.displayName, avatar: p.discord.avatar, flags: p.discord.flags, nitro: p.discord.nitro } : undefined;
  return o;
};

// Rows are shared for a few seconds between requests on the same server, so a busy Discover doesn't re-read the whole database each time.
let cache = { t: 0, rows: [] };
async function allRows() {
  if (Date.now() - cache.t < CACHE_MS) return cache.rows;
  const rows = (await redis.listProfiles(5000, BIG)).filter(([, p]) => p?.username && p.discover !== false && !p.hidden);
  const views = await redis.mget(rows.map(([k]) => `views:${k.slice(8)}`));
  cache = { t: Date.now(), rows: rows.map(([k, p], i) => ({ id: k.slice(8), p, v: views[i] || 0 })) };
  return cache.rows;
}

export const GET = safe("discover", async (req) => {
  const rl = await limit(`disc:${ipOf(req)}`, 90, 60);
  if (!rl.ok) return bad(tooMany(rl), 429);
  const sp = new URL(req.url).searchParams;
  const q = (sp.get("q") || "").trim().toLowerCase().slice(0, 40);
  const sort = ["new", "updated"].includes(sp.get("sort")) ? sp.get("sort") : "popular";
  const page = Math.min(200, Math.max(0, parseInt(sp.get("page") || "0", 10) || 0));
  let list = await allRows();
  if (q) list = list.filter(({ p }) => `${p.username} ${p.name || ""} ${p.displayName || ""}`.toLowerCase().includes(q));
  const when = (p, k) => p[k] ?? p.updatedAt ?? 0;
  list = [...list].sort(sort === "new" ? (a, b) => when(b.p, "createdAt") - when(a.p, "createdAt") || b.v - a.v : sort === "updated" ? (a, b) => (b.p.updatedAt ?? 0) - (a.p.updatedAt ?? 0) || b.v - a.v : (a, b) => b.v - a.v);
  const slice = list.slice(page * PAGE, page * PAGE + PAGE);
  // Staff badges are looked up for the people on this page (cached for 10 minutes, so this is cheap after the first view).
  const staff = await Promise.all(slice.map((x) => isStaff(x.id).catch(() => false)));
  return NextResponse.json(
    { total: list.length, more: (page + 1) * PAGE < list.length, profiles: slice.map(({ p, v }, i) => ({ ...pub(p), views: v, staff: staff[i] })) },
    { headers: { "Cache-Control": "no-store" } },
  );
});
