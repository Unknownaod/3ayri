import { NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { redis, validUsername } from "@/lib/db";
import { isStaff, isFounder } from "@/lib/staff";
import { limit, tooMany } from "@/lib/ratelimit";
import { cfg } from "@/lib/schema";
import { bad, safe, sameOrigin } from "@/lib/api";

export const dynamic = "force-dynamic";
const str = (v, n) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);

async function staffId() { const id = await getSessionId().catch(() => null); return id && (await isStaff(id)) ? id : null; }
const lookup = async (who) => {
  const q = String(who || "").replace(/^@/, "").trim().toLowerCase();
  let id = /^\d{15,25}$/.test(q) ? q : await redis.get(`username:${q}`);
  const p = id && (await redis.get(`profile:${id}`));
  return p ? { id, p } : null;
};

// Everything staff may want to know about one account, without the heavy parts (uploaded pictures, music, custom CSS).
async function dossier(who) {
  const f = await lookup(who);
  if (!f) return { missing: String(who).slice(0, 40) };
  const { id, p } = f, c = cfg(p);
  const [views, ban, staff, tpls, reps] = await Promise.all([
    redis.get(`views:${id}`), redis.get(`ban:${id}`), isStaff(id),
    redis.list("template:", 1000), redis.list("report:", 2000),
  ]);
  const mine = reps.map(([, r]) => r).filter((r) => r?.type === "profile" && r.target === p.username).sort((a, b) => b.at - a.at);
  const remote = (x) => (x && !String(x).startsWith("data:") ? x : "");
  const cuts = (x) => (x && String(x).length > 120000 ? "big" : x ? "yes" : "");
  const links = [...(p.links || []), ...(p.socials || [])].filter((x) => x.type !== "header" && x.type !== "divider");
  return {
    id, username: p.username, name: p.name || p.displayName || p.username,
    avatar: remote(p.avatar) || (p.customAvatar ? `/api/img/${p.username}/customAvatar` : ""),
    discord: { username: p.discord?.username || "", nitro: !!p.discord?.nitro },
    bio: String(p.bio || "").slice(0, 300), tagline: String(p.tagline || "").slice(0, 120),
    createdAt: p.createdAt || 0, updatedAt: p.updatedAt || 0, usernameChangedAt: p.usernameChangedAt || 0,
    views: views || 0, linkCount: links.length,
    links: links.slice(0, 12).map((x) => ({ label: String(x.label || x.platform || x.type || "").slice(0, 40), url: String(x.url || x.href || "").slice(0, 160) })),
    hasBackground: !!cuts(p.background), hasVideo: !!p.bgVideo, hasMusic: !!(c.musicUrl || (p.tracks || []).length),
    discover: p.discover !== false, noindex: !!c.noindex,
    hidden: !!p.hidden, hiddenReason: p.hiddenReason || "",
    banned: !!ban, ban: ban ? { at: ban.at, by: ban.by, reason: ban.reason || "" } : null,
    staff: !!staff,
    templates: tpls.map(([, t]) => t).filter((t) => t?.by?.id === id).map((t) => ({ id: t.id, name: t.name, at: t.at })),
    reports: { open: mine.filter((r) => r.status === "open").length, total: mine.length, recent: mine.slice(0, 6).map((r) => ({ reason: r.reason, details: r.details, status: r.status, at: r.at, by: r.by })) },
  };
}

// Staff only. GET: open reports (grouped by target), recent errors, recent staff actions. ?user=<username> looks one page up.
export const GET = safe("mod.get", async (req) => {
  const me = await staffId();
  if (!me) return bad("Staff only.", 403);
  const u = new URL(req.url).searchParams.get("user");
  if (u) return NextResponse.json({ ...(await dossier(u)), founder: await isFounder(me) });
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
  const restricted = (await redis.list("ban:", 1000)).length;
  return NextResponse.json({ reports: list, errors, log, stats: { open: reports.length, targets: list.length, restricted, errors: errors.length } });
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

  // Reset (any staff): the account gets a generated name like user_48213 and the owner picks a new one. Staff never choose the name.
  // Set (founders only): a specific username. Both need a reason, are logged, and hold the old name for 30 days.
  if (action === "reset-username" || action === "set-username") {
    const rl = await limit(`modren:${me}`, 20, 3600);
    if (!rl.ok) return bad(tooMany(rl), 429);
    const reason = str(b.reason, 120);
    if (!reason) return bad("Add a reason first. It's saved in the moderation log.");
    if (action === "set-username" && !(await isFounder(me))) return bad("Only founders can choose a username.", 403);
    const f = await lookup(b.username || "");
    if (!f || !f.p.username) return bad("No page with that username.", 404);
    if (f.id === me) return bad("Change your own username from the editor.");
    if (await isFounder(f.id)) return bad("Founders can't be renamed here.");
    if (action === "reset-username" && (await isStaff(f.id))) return bad("That person is staff. Remove their staff role first.");
    const reset = action === "reset-username", old = f.p.username;
    let to = "";
    if (reset) {
      for (let i = 0; i < 6 && !to; i++) { const t = `user_${Math.floor(10000 + Math.random() * 90000)}`; if (await redis.set(`username:${t}`, f.id, { nx: true })) to = t; }
      if (!to) return bad("Couldn't find a free generated name. Try again.");
    } else {
      to = str(b.to, 40).toLowerCase();
      if (!validUsername(to)) return bad("Usernames are 3–20 characters: letters, numbers, underscores.");
      if (to === old) return bad("That's already their username.");
      const hold = await redis.get(`uhold:${to}`);
      if (hold && hold.id !== f.id) return bad("That name is being held for 30 days after a staff rename. Pick another.", 409);
      if (!(await redis.set(`username:${to}`, f.id, { nx: true }))) return bad("That username is taken.", 409);
    }
    try {
      await redis.set(`profile:${f.id}`, { ...f.p, username: to, usernameChangedAt: reset ? 0 : f.p.usernameChangedAt, usernameReset: { at: Date.now(), reset, from: old } });
    } catch (e) { await redis.del(`username:${to}`); throw e; }
    await redis.del(`username:${old}`);
    await redis.setex(`uhold:${old}`, { id: reset ? "-" : f.id, at: Date.now() }, 30 * 86400);   // a reset name can't be reclaimed, even by its old owner
    await closeReports("profile", old, "actioned");
    await note(`@${old} → @${to} · ${reason}`);
    return NextResponse.json({ ok: true, username: to });
  }
  return bad("Unknown action.");
});
