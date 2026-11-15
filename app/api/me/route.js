import { NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { redis, validUsername, dayKey } from "@/lib/db";
import { isStaff } from "@/lib/staff";
import { earnedHaven } from "@/lib/hbadges";
import { sanitize, itemsOf, cfg } from "@/lib/schema";
import { offloadImages } from "@/lib/storage";
import { bad, safe, sameOrigin, logError } from "@/lib/api";
import { limit, tooMany } from "@/lib/ratelimit";

const COOLDOWN = 7 * 864e5; // how long to wait between username changes

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

export const GET = safe("me.get", async () => {
  const id = await getSessionId();
  if (!id) return bad("unauthenticated", 401);
  const p = await redis.get(`profile:${id}`);
  if (!p) return bad("unauthenticated", 401);
  return NextResponse.json({ ...shape(p), ...(await extras(id, p)), staff: await isStaff(id), earned: await earnedHaven(id), restricted: !!(await redis.get(`ban:${id}`)) });
});

export const PUT = safe("me.put", async (req) => {
  if (!sameOrigin(req)) return bad("Blocked: this request came from another site.", 403);
  const id = await getSessionId();
  if (!id) return bad("unauthenticated", 401);
  const rl = await limit(`save:${id}`, 40, 60);
  if (!rl.ok) return bad(tooMany(rl), 429);
  if (await redis.get(`ban:${id}`)) return bad("Your account has been restricted by staff, so changes can't be saved.", 403);
  const text = await req.text();
  if (text.length > 4_000_000) return bad("That's too much data to save at once. Try a smaller image.", 413);
  let b;
  try { b = JSON.parse(text); } catch { return bad("Couldn't read that request."); }
  const profile = await redis.get(`profile:${id}`);
  if (!profile) return bad("unauthenticated", 401);

  let clean = sanitize(b);
  try { clean = await offloadImages(clean); } catch (e) { await logError("me.images", e); return bad("Couldn't save your pictures right now (image storage is offline). Try again in a minute, or save without the new picture.", 503); }

  const username = String(b.username || "").slice(0, 40).toLowerCase();
  if (!validUsername(username)) return bad("Usernames are 3–20 characters: letters, numbers, underscores.");
  const changed = username !== profile.username;
  if (changed && profile.username && Date.now() - (profile.usernameChangedAt || 0) < COOLDOWN && !(await isStaff(id))) {
    const when = new Date((profile.usernameChangedAt || 0) + COOLDOWN).toLocaleDateString("en-CA", { month: "long", day: "numeric" });
    return bad(`You can change your username again on ${when}.`, 429);
  }
  if (changed) {
    if (!(await redis.set(`username:${username}`, id, { nx: true }))) return bad("That username is taken.", 409);
    if (profile.username) await redis.del(`username:${profile.username}`);
  }
  const { views, clicks, days, music, extraBadges, staff, earned, ...rest } = profile;
  const next = { ...rest, username, ...clean, createdAt: profile.createdAt ?? Date.now(), updatedAt: Date.now(), ...(changed && profile.username ? { usernameChangedAt: Date.now() } : {}) };
  await redis.set(`profile:${id}`, next);
  return NextResponse.json({ ...shape(next), ...(await extras(id, next)), staff: await isStaff(id), earned: await earnedHaven(id) });
});

// "Delete my page": frees the username and removes the profile. (Signing in again starts a fresh one.)
export const DELETE = safe("me.delete", async (req) => {
  if (!sameOrigin(req)) return bad("Blocked: this request came from another site.", 403);
  const id = await getSessionId();
  if (!id) return bad("unauthenticated", 401);
  const p = await redis.get(`profile:${id}`);
  if (p?.username) await redis.del(`username:${p.username}`);
  await redis.del(`profile:${id}`);
  await redis.del(`presence:${id}`);
  for (const [k, t] of await redis.list("template:", 1000)) { // their templates go too
    if (t?.by?.id !== id) continue;
    await redis.del(k); await redis.del(`templateUses:${t.id}`); await redis.del(`templateImg:${t.id}:background`); await redis.del(`templateImg:${t.id}:banner`);
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("haven_session", "", { path: "/", maxAge: 0 });
  return res;
});
