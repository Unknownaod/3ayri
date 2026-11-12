import { NextResponse } from "next/server";
import { redis, dayKey } from "@/lib/db";
import { getSessionId } from "@/lib/session";

// The profile page calls this once per browser session (so link-preview bots and crawlers don't inflate the count).
// The owner's own visits are not counted.
export async function POST(req) {
  let u = "";
  try { u = String((await req.json()).u || "").toLowerCase(); } catch {}
  const id = /^\d{5,25}$/.test(u) ? u : u ? await redis.get(`username:${u}`) : null;
  if (!id || !(await redis.get(`profile:${id}`))) return NextResponse.json({ error: "not found" }, { status: 404 });
  if ((await getSessionId()) === id) return NextResponse.json({ views: (await redis.get(`views:${id}`)) || 0, counted: false });
  const [views] = await Promise.all([redis.incr(`views:${id}`), redis.incr(`views:${id}:${dayKey()}`)]);
  return NextResponse.json({ views, counted: true });
}
