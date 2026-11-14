"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import ProfileCard from "../ProfileCard";
import SiteNav from "../SiteNav";
import { Ico } from "@/lib/icons";
import { applyPreset, DESIGN_KEYS } from "@/lib/schema";
import "../shell.css";
import "../profiles.css";

// Cards in grids are still pictures: no particles, music, cursor effects or entry screen, so a grid stays light.
export const calm = (p) => ({ ...p, particles: "none", cursor: "default", cursorTrail: "none", entry: false, tilt: false, cardFloat: false, typewriter: false, tabTitle: "" });

const SAMPLE = {
  name: "Your name", username: "you", discordId: "demo", tagline: "your tagline", bio: "This is how your page will look with this template.",
  location: "", badges: [], presence: false, bannerHeight: 0,
  socials: [{ id: "a", type: "discord", url: "#" }, { id: "b", type: "spotify", url: "#" }, { id: "c", type: "github", url: "#" }],
  links: [{ id: "x", label: "Portfolio", url: "#", icon: "globe" }, { id: "y", label: "Twitch", url: "#", icon: "twitch" }, { id: "z", label: "Shop", url: "#", icon: "bag" }],
};
const preview = (t) => calm({ ...SAMPLE, ...applyPreset("Haven"), ...t.cfg });
const LINKED = ["background", "banner", "bgVideo"];
// Only the look of the page goes into a template: no names, links, text, music or uploaded files.
const designOf = (me) => Object.fromEntries([...DESIGN_KEYS, ...LINKED].filter((k) => me[k] !== undefined && !(typeof me[k] === "string" && me[k].startsWith("data:"))).map((k) => [k, me[k]]));

// Template browser. mode "dash": inside the dashboard (can publish + apply right here). mode "public": landing / /templates page.
export function TemplatesGallery({ mode = "public", me, user, flash = () => {}, onApply }) {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("popular");
  const [mine, setMine] = useState(false);
  const [state, setState] = useState("loading");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);

  const load = useCallback(async (silent) => {
    if (!silent) setState("loading");
    try {
      const r = await fetch(`/api/templates?q=${encodeURIComponent(q)}&sort=${sort}&mine=${mine ? 1 : 0}`, { cache: "no-store" });
      const j = await r.json();
      if (!alive.current) return;
      setItems(j.templates || []); setState("ok");
    } catch { if (alive.current && !silent) setState("error"); }
  }, [q, sort, mine]);

  useEffect(() => { const t = setTimeout(() => load(false), q ? 250 : 0); return () => clearTimeout(t); }, [load, q]);
  useEffect(() => { // stay current: refresh quietly every 30 s and when the tab is shown again
    const tick = () => document.visibilityState === "visible" && load(true);
    const id = setInterval(tick, 30000); document.addEventListener("visibilitychange", tick);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", tick); };
  }, [load]);

  async function publish() {
    if (busy) return;
    setBusy(true);
    try {
      const r = await fetch("/api/templates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, desc, cfg: designOf(me) }) });
      const j = await r.json();
      if (r.ok) { flash("Template published"); setName(""); setDesc(""); setMine(true); setSort("new"); load(true); }
      else flash(j.error || "Couldn't publish.");
    } catch { flash("Couldn't reach the server."); }
    setBusy(false);
  }
  async function remove(t) {
    if (!confirm(`Delete the template "${t.name}"?`)) return;
    const r = await fetch(`/api/templates/${t.id}`, { method: "DELETE" });
    if (r.ok) { setItems((l) => l.filter((x) => x.id !== t.id)); flash("Template deleted"); } else flash((await r.json().catch(() => ({}))).error || "Couldn't delete.");
  }
  function use(t) {
    if (mode === "dash") { onApply?.(t.cfg, t); fetch(`/api/templates/${t.id}`, { method: "POST" }).catch(() => {}); }
    else if (user) location.href = `/dashboard/${user.username || "me"}?template=${t.id}`;
    else location.href = "/api/auth/login";
  }
  const label = mode === "dash" ? "Apply template" : user ? "Use template" : "Log in to use";

  return (
    <div className="tp">
      {mode === "dash" && (
        <div className="fld tp-pub" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (name.trim().length >= 2) publish(); } }}>
          <span>Publish your design as a template</span>
          <small className="hint">Shares only the look of your page (colors, fonts, card, effects). Your name, links, text and uploaded pictures are never included. Save your page first so your username is set.</small>
          <div className="colrow">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Template name" maxLength={40} aria-label="Template name" required />
            <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Short description (optional)" maxLength={140} aria-label="Template description" />
            <button type="button" className="hp-btn gold sm" onClick={publish} disabled={busy || name.trim().length < 2}>{busy ? "Publishing…" : "Publish"}</button>
          </div>
        </div>
      )}
      <div className="tp-bar">
        <label className="dc-search"><Ico n="wand" size={15} /><input type="search" value={q} onKeyDown={(e) => e.key === "Enter" && e.preventDefault()} onChange={(e) => setQ(e.target.value)} placeholder="Search templates" aria-label="Search templates" /></label>
        <div className="seg" role="group" aria-label="Sort">
          <button type="button" className={sort === "popular" ? "on" : ""} aria-pressed={sort === "popular"} onClick={() => setSort("popular")}>Popular</button>
          <button type="button" className={sort === "new" ? "on" : ""} aria-pressed={sort === "new"} onClick={() => setSort("new")}>Newest</button>
        </div>
        {mode === "dash" && (
          <div className="seg" role="group" aria-label="Whose templates">
            <button type="button" className={!mine ? "on" : ""} aria-pressed={!mine} onClick={() => setMine(false)}>Everyone</button>
            <button type="button" className={mine ? "on" : ""} aria-pressed={mine} onClick={() => setMine(true)}>Mine</button>
          </div>
        )}
      </div>
      {state === "error" && <p className="empty dc-msg">Couldn't load templates. Check your connection and try again.</p>}
      {state === "ok" && items.length === 0 && <p className="empty dc-msg">{mine ? "You haven't published a template yet. Style your page, then publish it above." : q ? `No templates match "${q}".` : "No templates yet. Be the first to publish one."}</p>}
      <div className="dc-grid">
        {items.map((t) => (
          <div className="dc-card" key={t.id}>
            <div className="dc-view" aria-hidden="true"><ProfileCard p={preview(t)} views={0} preview /></div>
            <button type="button" className="dc-link" onClick={() => use(t)} aria-label={`${label}: ${t.name}`}><span>{label}</span></button>
            {t.canDelete && <button type="button" className="tp-del" onClick={() => remove(t)} aria-label={`Delete ${t.name}`} title="Delete"><Ico n="x" size={14} /></button>}
            <footer><b>{t.name}</b><small>{t.desc ? `${t.desc} · ` : ""}by @{t.by?.username || "unknown"} · {t.uses.toLocaleString()} use{t.uses === 1 ? "" : "s"}</small></footer>
          </div>
        ))}
        {state === "loading" && Array.from({ length: 6 }, (_, i) => <div className="dc-card dc-skel" key={`s${i}`} aria-hidden="true" />)}
      </div>
    </div>
  );
}

// The public /templates page.
export function TemplatesPage({ user, invite }) {
  return (
    <main className="lp">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;600;700;800&family=Bricolage+Grotesque:wght@600;800&display=swap" />
      <SiteNav active="/templates" user={user} invite={invite} />
      <section className="lp-sec" style={{ paddingTop: "8rem" }}>
        <h2>Templates</h2>
        <p className="lp-sub">Start from a look someone else made. Pick one and your page keeps your own name, links and text.</p>
        <TemplatesGallery mode="public" user={user} />
      </section>
    </main>
  );
}
