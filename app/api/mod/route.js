import { NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { redis } from "@/lib/db";
import { isStaff } from "@/lib/staff";
import { bad, safe, sameOrigin } from "@/lib/api";

export const dynamic = "force-dynamic";
const str = (v, n) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);

async function staffId() { const id = await getSessionId().catch(() => null); return id && (await isStaff(id)) ? id : null; }
const lookup = async (username) => {
  const id = await redis.get(`username:${String(username).toLowerCase()}`), p = id && (await redis.get(`profile:${id}`));
  return p ? { id, p } : null;
};

// Staff only. GET: open reports (grouped by target), recent errors, recent staff actions. ?user=<username> looks one page up.
export const GET = safe("mod.get", async (req) => {
  const me = await staffId();
  if (!me) return bad("Staff only.", 403);
  const u = new URL(req.url).searchParams.get("user");
  if (u) {
    const f = await lookup(u);
    if (!f) return bad("No page with that username.", 404);
    return NextResponse.json({ username: f.p.username, name: f.p.name || f.p.displayName, hidden: !!f.p.hidden, hiddenReason: f.p.hiddenReason || "", banned: !!(await redis.get(`ban:${f.id}`)) });
  }
  const reports = (await redis.list("report:", 2000)).map(([, r]) => r).filter((r) => r?.status === "open");
  const groups = new Map();
  for (const r of reports) {
    const k = `${r.type}:${r.target}`, g = groups.get(k) || { key: k, type: r.type, target: r.target, name: r.name, count: 0, reasons: {}, details: [], ids: [], latest: 0 };
    g.count++; g.reasons[r.reason] = (g.reasons[r.reason] || 0) + 1; g.ids.push(r.id); g.latest = Math.max(g.latest, r.at);
    if (r.details && g.details.length < 3) g.details.push(r.details);
    groups.set(k, g);
  }
  const list = [...groups.values()].sort((a, b) => b.count - a.count || b.latest - a.latest).slice(0, 100);
  for (const g of list) {
    if (g.type === "profile") { const f = await lookup(g.target); g.hidden = !!f?.p.hidden; g.gone = !f; }
    else g.gone = !(await redis.get(`template:${g.target}`));
  }
  const errors = (await redis.list("err:", 100)).map(([, e]) => e).sort((a, b) => b.at - a.at).slice(0, 30);
  const log = (await redis.list("modlog:", 200)).map(([, e]) => e).sort((a, b) => b.at - a.at).slice(0, 20);
  return NextResponse.json({ reports: list, errors, log });
});

// POST { action: hide | unhide | ban | unban | delete-template | dismiss, username?, id?, key?, reason? }
export const POST = safe("mod.post", async (req) => {
  if (!sameOrigin(req)) return bad("Blocked: this request came from another site.", 403);
  const me = await staffId();
  if (!me) return bad("Staff only.", 403);
  let b; try { b = JSON.parse(await req.text()); } catch { return bad("Couldn't read that request."); }
  const action = String(b.action), note = (what) => redis.setex(`modlog:${Date.now()}${Math.random().toString(36).slice(2, 4)}`, { at: Date.now(), by: me, action, what }, 90 * 86400);
  const closeReports = async (type, target, status) => {
    for (const [k, r] of await redis.list("report:", 2000)) if (r?.status === "open" && r.type === type && r.target === target) await redis.set(k, { ...r, status, closedBy: me, closedAt: Date.now() });
  };

  if (["hide", "unhide", "ban", "unban"].includes(action)) {
    const f = await lookup(b.username || "");
    if (!f) return bad("No page with that username.", 404);
    if (f.id === me) return bad("You can't do that to your own page.");
    if (action !== "unhide" && action !== "unban" && (await isStaff(f.id))) return bad("That person is staff. Remove their staff role first.");
    if (action === "hide") await redis.set(`profile:${f.id}`, { ...f.p, hidden: true, hiddenReason: str(b.reason, 120) });
    if (action === "unhide") await redis.set(`profile:${f.id}`, { ...f.p, hidden: false, hiddenReason: "" });
    if (action === "ban") { await redis.set(`ban:${f.id}`, { at: Date.now(), by: me, reason: str(b.reason, 120) }); await redis.set(`profile:${f.id}`, { ...f.p, hidden: true, hiddenReason: str(b.reason, 120) || "Account restricted" }); }
    if (action === "unban") { await redis.del(`ban:${f.id}`); await redis.set(`profile:${f.id}`, { ...f.p, hidden: false, hiddenReason: "" }); }
    if (action === "hide" || action === "ban") await closeReports("profile", f.p.username, "actioned");
    await note(`@${f.p.username}`);
    return NextResponse.json({ ok: true });
  }
  if (action === "delete-template") {
    const id = String(b.id || "");
    if (!/^[a-z0-9]{8}$/.test(id)) return bad("Bad template id.");
    await redis.del(`template:${id}`); await redis.del(`templateUses:${id}`); await redis.del(`templateImg:${id}:background`); await redis.del(`templateImg:${id}:banner`);
    await closeReports("template", id, "actioned"); await note(`template ${id}`);
    return NextResponse.json({ ok: true });
  }
  if (action === "dismiss") {
    const [type, target] = String(b.key || "").split(":");
    if (!["profile", "template"].includes(type) || !target) return bad("Bad report key.");
    await closeReports(type, target, "dismissed"); await note(`${type} ${target}`);
    return NextResponse.json({ ok: true });
  }
  return bad("Unknown action.");
});
