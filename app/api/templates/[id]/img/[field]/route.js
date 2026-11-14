import { redis } from "@/lib/db";
import { IMAGE_FIELDS } from "@/lib/templates";

export const dynamic = "force-dynamic";
const TYPES = /^data:(image\/(?:png|jpe?g|gif|webp|avif));base64,([A-Za-z0-9+/=]+)$/;

// A template's uploaded background / banner, served as a normal image.
export async function GET(_req, { params }) {
  const { id, field } = await params;
  if (!/^[a-z0-9]{8}$/.test(id) || !IMAGE_FIELDS.includes(field)) return new Response("Not found", { status: 404 });
  const m = TYPES.exec((await redis.get(`templateImg:${id}:${field}`)) || "");
  if (!m) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(m[2], "base64"), { headers: { "Content-Type": m[1], "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800", "X-Content-Type-Options": "nosniff" } });
}
