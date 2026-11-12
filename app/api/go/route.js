import { NextResponse } from "next/server";
import { redis } from "@/lib/db";

// Counts a click, then sends the visitor to the stored link.
export async function GET(req) {
  const q = new URL(req.url).searchParams;
  const u = q.get("u"), t = q.get("t") === "s" ? "s" : "l", i = Number(q.get("i"));
  const p = u ? await redis.get(`profile:${u}`) : null;
  const dest = p?.[t === "s" ? "socials" : "links"]?.[i]?.url;
  if (!dest) return NextResponse.redirect(new URL("/", req.url));
  await redis.incr(`clicks:${u}:${t}:${i}`);
  return NextResponse.redirect(dest);
}
