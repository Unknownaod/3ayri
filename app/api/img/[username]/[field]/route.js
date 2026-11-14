import { redis } from "@/lib/db";

export const dynamic = "force-dynamic";

// Serves an uploaded picture (stored inside the profile as a data: string) as a normal image,
// so Discover can show big backgrounds without sending megabytes of text in the list.
// /api/img/<username>/<background|banner|customAvatar|thumb>?v=<updatedAt>
const FIELDS = ["background", "banner", "customAvatar"];
const TYPES = /^data:(image\/(?:png|jpe?g|gif|webp|avif));base64,([A-Za-z0-9+/=]+)$/;

export async function GET(_req, { params }) {
  const { username, field } = await params;
  if (!FIELDS.includes(field) || !/^[a-z0-9_]{3,20}$/i.test(username)) return new Response("Not found", { status: 404 });
  const id = await redis.get(`username:${username.toLowerCase()}`);
  const p = id && (await redis.get(`profile:${id}`));
  if (!p || p.discover === false) return new Response("Not found", { status: 404 });
  const m = TYPES.exec(p[field] || "");
  if (!m) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(m[2], "base64"), {
    headers: { "Content-Type": m[1], "Cache-Control": "public, max-age=300, stale-while-revalidate=3600", "X-Content-Type-Options": "nosniff" },
  });
}
