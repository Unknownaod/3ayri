import { NextResponse } from "next/server";
import { redis } from "@/lib/db";
import { safe, ipOf, bad } from "@/lib/api";
import { limit, tooMany } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

// Public site totals for the landing page. Recomputed at most once a minute per server.
let cache = { at: 0, data: null };
export const GET = safe("stats", async (req) => {
  const rl = await limit(`stats:${ipOf(req)}`, 60, 60);
  if (!rl.ok) return bad(tooMany(rl), 429);
  if (!cache.data || Date.now() - cache.at > 60000) cache = { at: Date.now(), data: await redis.stats() };
  return NextResponse.json(cache.data, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } });
});
