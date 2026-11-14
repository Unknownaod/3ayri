import { NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { redis, validUsername } from "@/lib/db";
import { rid } from "@/lib/schema";
import { designOf, imgUrl, MAX_PER_PERSON } from "@/lib/templates";
import { isStaff } from "@/lib/staff";

export const dynamic = "force-dynamic";
const bad = (error, status = 400) => NextResponse.json({ error }, { status });
// Uploaded pictures are not inside the list: the design points at the template's own image URL.
const withImgs = (t) => ({ ...t.cfg, ...Object.fromEntries((t.imgs || []).map((f) => [f, imgUrl(t.id, f, t.at)])) });
const str = (v, n) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);

// GET /api/templates?q=&sort=popular|new&mine=1  (public; "mine" needs a login)
export async function GET(req) {
  const sp = new URL(req.url).searchParams;
  const q = str(sp.get("q"), 40).toLowerCase(), sort = sp.get("sort") === "new" ? "new" : "popular", mine = sp.get("mine") === "1";
  let sid = null; try { sid = await getSessionId(); } catch {}
  const staff = sid ? await isStaff(sid) : false;
  let rows = (await redis.list("template:", 1000)).map(([, t]) => t).filter((t) => t?.id && t.cfg);
  if (mine) rows = sid ? rows.filter((t) => t.by?.id === sid) : [];
  if (q) rows = rows.filter((t) => `${t.name} ${t.desc || ""} ${t.by?.username || ""} ${t.by?.name || ""}`.toLowerCase().includes(q));
  const uses = await redis.mget(rows.map((t) => `templateUses:${t.id}`));
  let list = rows.map((t, i) => ({ t, n: uses[i] || 0 }));
  list.sort((a, b) => (sort === "new" ? b.t.at - a.t.at : b.n - a.n || b.t.at - a.t.at));
  return NextResponse.json({
    templates: list.slice(0, 60).map(({ t, n }) => ({
      id: t.id, name: t.name, desc: t.desc, at: t.at, cfg: withImgs(t), uses: n,
      by: { name: t.by?.name, username: t.by?.username, avatar: t.by?.avatar },
      mine: !!sid && t.by?.id === sid, canDelete: !!sid && (t.by?.id === sid || staff),
    })),
  }, { headers: { "Cache-Control": "no-store" } });
}

// POST /api/templates { name, desc, cfg }  publishes the sender's current design
export async function POST(req) {
  const sid = await getSessionId();
  if (!sid) return bad("Log in to publish a template.", 401);
  const p = await redis.get(`profile:${sid}`);
  if (!p) return bad("Log in to publish a template.", 401);
  if (!p.username || !validUsername(p.username)) return bad("Pick a username and save before publishing a template.");
  let b; try { b = JSON.parse(await req.text()); } catch { return bad("Couldn't read that request."); }
  const name = str(b.name, 40);
  if (name.length < 2) return bad("Give your template a name (at least 2 characters).");
  const mineCount = (await redis.list("template:", 1000)).filter(([, t]) => t?.by?.id === sid).length;
  if (mineCount >= MAX_PER_PERSON) return bad(`You can have up to ${MAX_PER_PERSON} templates. Delete one first.`);
  const t = {
    id: rid(8), name, desc: str(b.desc, 140),
    by: { id: sid, name: p.name || p.displayName || p.username, username: p.username, avatar: p.avatar && !String(p.avatar).startsWith("data:") ? p.avatar : "" },
    at: Date.now(),
  };
  const d = designOf(b.cfg || p);
  t.cfg = d.cfg; t.imgs = Object.keys(d.images);
  if (Object.values(d.images).reduce((n, v) => n + v.length, 0) > 2_200_000) return bad("That background and banner are too big to share together. Use a link for one of them.");
  for (const [f, v] of Object.entries(d.images)) await redis.set(`templateImg:${t.id}:${f}`, v);
  await redis.set(`template:${t.id}`, t);
  return NextResponse.json({ ok: true, id: t.id });
}
