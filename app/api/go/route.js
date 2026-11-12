import { NextResponse } from "next/server";
import { redis } from "@/lib/db";
import { itemsOf } from "@/lib/schema";

// Counts a click, then sends the visitor to the stored link.
//   /api/go?u=<discord id or username>&k=<item id>
//   v5 links (?t=s|l&i=<index>) still work.
export async function GET(req) {
  const q = new URL(req.url).searchParams;
  const u = (q.get("u") || "").toLowerCase(), k = q.get("k");
  const id = /^\d{5,25}$/.test(u) ? u : u ? await redis.get(`username:${u}`) : null;
  const raw = id ? await redis.get(`profile:${id}`) : null;
  if (!raw) return NextResponse.redirect(new URL("/", req.url));
  const it = itemsOf(raw);

  let item, key;
  if (k) { item = [...it.links, ...it.socials].find((x) => x.id === k); key = k; }
  else { const t = q.get("t") === "s" ? "s" : "l", i = Number(q.get("i")); item = (t === "s" ? it.socials : it.links)[i]; key = `${t}:${i}`; }

  const dest = item?.url;
  if (!dest || !/^https?:\/\//i.test(dest)) return NextResponse.redirect(new URL("/", req.url));
  await redis.incr(`clicks:${id}:${key}`);
  return NextResponse.redirect(dest);
}
