import { NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { redis } from "@/lib/db";
import { isStaff } from "@/lib/staff";
import { imgUrl, IMAGE_FIELDS } from "@/lib/templates";

export const dynamic = "force-dynamic";
const bad = (error, status = 400) => NextResponse.json({ error }, { status });
const ok = (id) => /^[a-z0-9]{8}$/.test(id);

// One template, with its design settings.
export async function GET(_req, { params }) {
  const id = (await params).id;
  const t = ok(id) && (await redis.get(`template:${id}`));
  if (!t) return bad("That template doesn't exist any more.", 404);
  return NextResponse.json({ id: t.id, name: t.name, cfg: { ...t.cfg, ...Object.fromEntries((t.imgs || []).map((f) => [f, imgUrl(t.id, f, t.at)])) } }, { headers: { "Cache-Control": "no-store" } });
}

// Counts one use (sent when someone applies the template).
export async function POST(_req, { params }) {
  const id = (await params).id;
  if (!ok(id) || !(await redis.get(`template:${id}`))) return bad("That template doesn't exist any more.", 404);
  if (!(await getSessionId())) return bad("Log in first.", 401);
  return NextResponse.json({ uses: await redis.incr(`templateUses:${id}`) });
}

// Owner can delete their own; staff can delete any.
export async function DELETE(_req, { params }) {
  const id = (await params).id;
  const sid = await getSessionId();
  if (!sid) return bad("Log in first.", 401);
  const t = ok(id) && (await redis.get(`template:${id}`));
  if (!t) return bad("That template doesn't exist any more.", 404);
  if (t.by?.id !== sid && !(await isStaff(sid))) return bad("You can only delete your own templates.", 403);
  await redis.del(`template:${id}`); await redis.del(`templateUses:${id}`);
  for (const f of IMAGE_FIELDS) await redis.del(`templateImg:${id}:${f}`);
  return NextResponse.json({ ok: true });
}
