import { NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { redis } from "@/lib/db";
import { bad, safe, sameOrigin, ipOf } from "@/lib/api";
import { limit, tooMany } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";
const REASONS = ["Impersonation", "Hateful or harassing", "Sexual or graphic content", "Scam or phishing", "Illegal content", "Spam", "Other"];
const str = (v, n) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);

// POST /api/report { type: "profile" | "template", target: <username | template id>, reason, details }
// Anyone can report (no login needed). Staff see reports in Dashboard > Moderation.
export const POST = safe("report", async (req) => {
  if (!sameOrigin(req)) return bad("Blocked: this request came from another site.", 403);
  let sid = null; try { sid = await getSessionId(); } catch {}
  const who = sid ? `u${sid}` : `ip${ipOf(req)}`;
  const rl = await limit(`report:${who}`, 8, 3600);
  if (!rl.ok) return bad("You've sent a lot of reports. Try again later.", 429);
  let b; try { b = JSON.parse(await req.text()); } catch { return bad("Couldn't read that request."); }
  const type = b.type === "template" ? "template" : "profile";
  const target = str(b.target, 40).toLowerCase();
  const reason = REASONS.includes(b.reason) ? b.reason : "Other";
  if (!/^[a-z0-9_]{3,40}$/.test(target)) return bad("That page or template doesn't exist.", 404);
  let name = target;
  if (type === "profile") {
    const id = await redis.get(`username:${target}`), p = id && (await redis.get(`profile:${id}`));
    if (!p) return bad("That page doesn't exist.", 404);
    if (sid && sid === id) return bad("You can't report your own page.");
    name = p.name || p.displayName || p.username;
  } else {
    const t = await redis.get(`template:${target}`);
    if (!t) return bad("That template doesn't exist any more.", 404);
    name = t.name;
  }
  const dupe = `repd:${who}:${type}:${target}`;
  if (await redis.get(dupe)) return NextResponse.json({ ok: true, duplicate: true });
  await redis.setex(dupe, 1, 86400);
  const r = { id: `${Date.now()}${Math.random().toString(36).slice(2, 5)}`, type, target, name, reason, details: str(b.details, 400), at: Date.now(), by: sid ? "user" : "guest", status: "open" };
  await redis.set(`report:${r.id}`, r);
  return NextResponse.json({ ok: true });
});
