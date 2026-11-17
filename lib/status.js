// lib/status.js — what the /status page shows.
//
// Every minute at most, one request runs the checks below and saves the result. Each check also adds to that day's counters, which is where
// the 90-day bars come from. Checks run when someone opens the page (it refreshes itself every minute) and when the bot pings /api/status.
import { redis } from "@/lib/db";
import { storageOn } from "@/lib/storage";

export const DAYS = 90;
const SLOW_MS = 2500;       // a check that works but takes longer than this counts as "slow"
const BOT_SLOW_S = 120;     // the bot writes a heartbeat every 30 seconds
const BOT_DOWN_S = 300;

export const PARTS = [
  { id: "site", name: "Website", desc: "Profile pages and the dashboard" },
  { id: "db", name: "Database", desc: "Where profiles and settings are saved" },
  { id: "discord", name: "Discord login", desc: "Signing in and reading your Discord info" },
  { id: "bot", name: "Discord bot", desc: "Live status, badges and server tags" },
  { id: "images", name: "Image server", desc: "Uploaded pictures and GIFs" },
];
export const activeParts = () => PARTS.filter((p) => p.id !== "images" || storageOn());

const timed = async (fn) => { const t = Date.now(); try { await fn(); return { ok: true, ms: Date.now() - t }; } catch { return { ok: false, ms: Date.now() - t }; } };
const grade = (r) => (!r.ok ? "down" : r.ms > SLOW_MS ? "slow" : "up");
const web = (url) => async () => { const r = await fetch(url, { signal: AbortSignal.timeout(5000), cache: "no-store" }); if (!r.ok) throw new Error(String(r.status)); };

async function runAll() {
  const [db, discord, images, beat] = await Promise.all([
    timed(() => redis.get("status:ping")),
    timed(web("https://discord.com/api/v10/gateway")),
    storageOn() ? timed(web(`${String(process.env.IMG_BASE_URL).replace(/\/+$/, "")}/health`)) : null,
    redis.get("bot:heartbeat").catch(() => null),
  ]);
  const age = beat ? (Date.now() - Number(beat)) / 1000 : Infinity;
  const out = { site: { s: "up", ms: 0 }, db: { s: grade(db), ms: db.ms }, discord: { s: grade(discord), ms: discord.ms },
    bot: { s: age > BOT_DOWN_S ? "down" : age > BOT_SLOW_S ? "slow" : "up", ms: null } };
  if (images) out.images = { s: grade(images), ms: images.ms };
  return out;
}

const day = (t = Date.now()) => new Date(t).toISOString().slice(0, 10);

// Runs the checks unless one already ran in the last minute, in which case the saved result is returned.
export async function current() {
  const minute = Math.floor(Date.now() / 60000);
  let last = null;
  try { last = await redis.get("status:last"); } catch {}
  let mine = false;
  try { mine = (await redis.incr(`status:lock:${minute}`, 120)) === 1; } catch { mine = !last; }
  if (!mine && last && Date.now() - last.at < 150000) return last;
  const items = await runAll();
  const now = { at: Date.now(), items };
  try {
    await redis.set("status:last", now);
    const d = day(), ttl = (DAYS + 10) * 86400;
    await Promise.all(Object.entries(items).flatMap(([id, v]) => [
      redis.incr(`st:${id}:${d}:n`, ttl), ...(v.s === "down" ? [redis.incr(`st:${id}:${d}:down`, ttl)] : []), ...(v.s === "slow" ? [redis.incr(`st:${id}:${d}:slow`, ttl)] : []),
    ]));
  } catch {}
  return now;
}

let memo = { at: 0, v: null };
// For each part: one entry per day for the last 90 days, oldest first: { d, n, down, slow }.
export async function history(ids) {
  if (memo.v && Date.now() - memo.at < 60000 && ids.every((i) => memo.v[i])) return memo.v;
  const days = Array.from({ length: DAYS }, (_, i) => day(Date.now() - (DAYS - 1 - i) * 86400000));
  const keys = ids.flatMap((id) => days.flatMap((d) => [`st:${id}:${d}:n`, `st:${id}:${d}:down`, `st:${id}:${d}:slow`]));
  let vals = []; try { vals = await redis.mget(keys); } catch {}
  const v = {}; let k = 0;
  for (const id of ids) v[id] = days.map((d) => ({ d, n: +vals[k++] || 0, down: +vals[k++] || 0, slow: +vals[k++] || 0 }));
  memo = { at: Date.now(), v };
  return v;
}

export const uptime = (rows) => { const n = rows.reduce((a, r) => a + r.n, 0), dn = rows.reduce((a, r) => a + r.down, 0); return n ? Math.max(0, 100 - (dn / n) * 100) : null; };

export function overall(items) {
  const bad = Object.entries(items).filter(([, v]) => v.s === "down").map(([k]) => k), slow = Object.values(items).some((v) => v.s === "slow");
  if (bad.includes("db") || bad.includes("site")) return "major";
  if (bad.length) return "partial";
  return slow ? "slow" : "ok";
}
