import { NextResponse } from "next/server";
import { redis, dayKey } from "@/lib/db";
import { getSessionId } from "@/lib/session";
import { safe, sameOrigin, ipOf } from "@/lib/api";
import { limit } from "@/lib/ratelimit";

// The profile page calls this once per browser session (so link-preview bots and crawlers don't inflate the count).
// The owner's own visits are not counted.
export const POST = safe("view", async (req) => {
  if (!sameOrigin(req)) return NextResponse.json({ error: "blocked" }, { status: 403 });
  if (!(await limit(`view:${ipOf(req)}`, 60, 60)).ok) return NextResponse.json({ views: 0, counted: false });
  let u = "";
  try { u = String((await req.json()).u || "").toLowerCase(); } catch {}
  const id = /^\d{5,25}$/.test(u) ? u : u ? await redis.get(`username:${u}`) : null;
  const prof = id && (await redis.get(`profile:${id}`));
  if (!id || !prof || prof.hidden) return NextResponse.json({ error: "not found" }, { status: 404 });
  if ((await getSessionId()) === id) return NextResponse.json({ views: (await redis.get(`views:${id}`)) || 0, counted: false });
  const [views] = await Promise.all([redis.incr(`views:${id}`), redis.incr(`views:${id}:${dayKey()}`)]);
  return NextResponse.json({ views, counted: true });
});
