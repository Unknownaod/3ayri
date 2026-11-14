"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProfileCard from "../ProfileCard";
import { Discover } from "./Landing";
import { TemplatesGallery } from "./Templates";
import { AppearanceTab } from "./Appearance";
import { dashStyle } from "@/lib/dashtheme";
import { SCHEMA, FIELDS, FONTS, cfg, fontsHref } from "@/lib/schema";
import { Ico } from "@/lib/icons";
import { BadgesEditor, LinksEditor, SocialsEditor, TracksEditor, SectionsEditor, PresetsBlock, FontPicker, DiscordBlock, compress } from "./panels";
import "../shell.css";
import "../profiles.css";

const NAV = [
  ["Content", [["Profile", "user"], ["Discord", "discord"], ["Links", "link"], ["Socials", "share"], ["Music", "music"]]],
  ["Design", [["Templates", "grid"], ["Theme", "palette"], ["Card", "card"], ["Avatar", "image"], ["Background", "globe2"], ["Effects", "sparkles"], ["Layout", "layout"]]],
  ["Site", [["Discover", "globe2"], ["Page", "globe"], ["Appearance", "palette"], ["Stats", "chart"], ["Account", "sliders"]]],
];
const EXTRAS = ["views", "days", "clicks"];
const clean = (m) => Object.fromEntries(Object.entries(m).filter(([k]) => !EXTRAS.includes(k)));
const NO_SHARE = ["img", "media", "text", "area"];

const shows = (f, c) => {
  const w = f.if;
  if (!w) return true;
  if (Array.isArray(w)) { const [k, v] = w; return v.startsWith("!") ? c[k] !== v.slice(1) : c[k] === v; }
  return !!c[w];
};

const SAMPLE = () => ({ status: "online", custom: "Sample status", plat: ["desktop"], acts: [{ kind: "game", title: "A game you play", sub: "Sample activity", start: Date.now() - 1800000 }] });

function Field({ k, f, me, c, set }) {
  const v = c[k];
  const [err, setErr] = useState("");
  if (f.t === "head") return <h3 className="sec-h">{f.label}</h3>;
  const hint = f.hint && <small className="hint">{f.hint}</small>;
  if (f.t === "seg") {
    return (
      <div className="fld"><span>{f.label}</span>
        {f.kind === "font" ? <FontPicker value={v} onChange={(o) => set(k, o)} opts={f.opts} />
          : <div className="seg">{f.opts.map((o) => <button type="button" key={o} className={v === o ? "on" : ""} aria-pressed={v === o} onClick={() => set(k, o)}>{o}</button>)}</div>}
        {hint}
      </div>
    );
  }
  if (f.t === "range") return <label className="fld"><span>{f.label} <b>{v}</b></span><input type="range" min={f.lo} max={f.hi} value={v} onChange={(e) => set(k, +e.target.value)} />{hint}</label>;
  if (f.t === "bool") return <label className="chk"><input type="checkbox" checked={!!v} onChange={(e) => set(k, e.target.checked)} />{f.label}</label>;
  if (f.t === "color") {
    return (
      <div className="fld"><span>{f.label}{f.clear && !me[k] && <small>default</small>}</span>
        <div className="colrow">
          <input type="color" value={v || f.pick || "#ffffff"} onChange={(e) => set(k, e.target.value)} aria-label={f.label} />
          <input value={me[k] || ""} placeholder={f.clear ? "auto" : f.pick} maxLength={7} onChange={(e) => /^#?[0-9a-f]{0,6}$/i.test(e.target.value) && set(k, e.target.value && !e.target.value.startsWith("#") ? `#${e.target.value}` : e.target.value)} aria-label={`${f.label} hex`} />
          {f.clear && me[k] && <button type="button" className="hp-ghost" onClick={() => set(k, "")}>Clear</button>}
        </div>
      </div>
    );
  }
  if (f.t === "img") {
    const data = typeof v === "string" && v.startsWith("data:");
    const up = async (file) => {
      setErr("");
      if (!file) return;
      if (!file.type.startsWith("image/")) return setErr("Choose an image file (PNG, JPG, GIF or WebP).");
      try {
        const out = await compress(file, f.max > 1e6 ? 1920 : f.max > 5e5 ? 1280 : 512, f.max);
        if (out.length > f.max) return setErr(`That file is too big (limit about ${Math.round(f.max / 1000)} KB). Use a smaller one, or paste a link instead.`);
        set(k, out);
      } catch { setErr("Couldn't read that image."); }
    };
    return (
      <div className="fld"><span>{f.label}</span>
        <div className="colrow">
          <input value={data ? "" : v || ""} placeholder={data ? "Uploaded image" : "https://… or upload"} onChange={(e) => set(k, e.target.value)} />
          <label className="hp-ghost up"><Ico n="upload" size={14} /> Upload<input type="file" accept="image/*" hidden onChange={(e) => { up(e.target.files?.[0]); e.target.value = ""; }} /></label>
          {v && <button type="button" className="hp-ghost" onClick={() => set(k, "")}>Remove</button>}
        </div>
        {err && <small className="warn">{err}</small>}{hint}
      </div>
    );
  }
  const Tag = f.t === "area" ? "textarea" : "input";
  return (
    <label className="fld"><span>{f.label}{f.max && f.t === "area" && <small>{(v || "").length}/{f.max}</small>}</span>
      <Tag className={f.kind === "code" ? "code" : ""} value={v || ""} onChange={(e) => set(k, e.target.value)} placeholder={f.ph} maxLength={f.max} rows={f.t === "area" ? (f.kind === "code" ? 8 : 4) : undefined} spellCheck={f.kind === "code" ? false : undefined} />
      {hint}
    </label>
  );
}

function StatsTab({ me }) {
  const days = me.days || [];
  const max = Math.max(1, ...days.map((d) => d.v));
  const items = [...(me.links || []).filter((l) => l.type === "link"), ...(me.socials || [])].map((x) => ({ id: x.id, name: x.label || x.url, n: me.clicks?.[x.id] || 0 })).sort((a, b) => b.n - a.n);
  const total = items.reduce((a, b) => a + b.n, 0), top = Math.max(1, items[0]?.n || 1), last30 = days.reduce((a, b) => a + b.v, 0);
  return (
    <div className="stack">
      <div className="stats"><div><b>{(me.views || 0).toLocaleString()}</b>Total views</div><div><b>{last30.toLocaleString()}</b>Last 30 days</div><div><b>{total.toLocaleString()}</b>Link clicks</div></div>
      <div className="fld"><span>Views per day</span>
        <svg className="chart" viewBox={`0 0 ${days.length * 10} 90`} preserveAspectRatio="none" role="img" aria-label="Views per day, last 30 days">
          {days.map((d, i) => <rect key={d.d} x={i * 10 + 1} width="8" y={86 - (d.v / max) * 80} height={Math.max(1, (d.v / max) * 80)} rx="1.5"><title>{`${d.d}: ${d.v} view${d.v === 1 ? "" : "s"}`}</title></rect>)}
        </svg>
        <div className="axis"><small>{days[0]?.d}</small><small>{days[days.length - 1]?.d}</small></div>
      </div>
      <div className="fld"><span>Clicks by link</span>
        {items.length === 0 && <p className="empty">Add links to see how they perform.</p>}
        {items.map((x) => <div className="bar" key={x.id}><em>{x.name}</em><u><s style={{ width: `${(x.n / top) * 100}%` }} /></u><b>{x.n}</b></div>)}
      </div>
    </div>
  );
}

function AccountTab({ me, patch, flash, logout }) {
  const [del, setDel] = useState("");
  const file = useRef(null);
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(clean(me), null, 2)], { type: "application/json" }), a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `haven-${me.username || "page"}.json`; a.click(); URL.revokeObjectURL(a.href);
  };
  const importJson = async (f) => {
    try {
      const o = JSON.parse(await f.text()), keep = {};
      for (const k of Object.keys(o)) if (FIELDS[k] || ["badges", "links", "socials", "tracks", "sections"].includes(k)) keep[k] = o[k];
      patch(keep); flash("Imported. Review it, then save.");
    } catch { flash("That file isn't a Haven export."); }
  };
  async function remove() {
    const r = await fetch("/api/me", { method: "DELETE" });
    if (r.ok) location.href = "/";
  }
  return (
    <div className="stack">
      <div className="fld"><span>Back up or move your page</span>
        <div className="seg"><button type="button" onClick={exportJson}><Ico n="download" size={14} /> Export as file</button>
          <button type="button" onClick={() => file.current?.click()}><Ico n="upload" size={14} /> Import a file</button></div>
        <input ref={file} type="file" accept="application/json" hidden onChange={(e) => { e.target.files?.[0] && importJson(e.target.files[0]); e.target.value = ""; }} />
      </div>
      <div className="fld"><span>Signed in</span><button type="button" className="hp-ghost" onClick={logout}>Sign out</button></div>
      <div className="fld danger"><span>Delete my page</span>
        <small className="hint">This removes your page and frees your username. Type <b>{me.username || "delete"}</b> to confirm.</small>
        <div className="colrow"><input value={del} onChange={(e) => setDel(e.target.value)} placeholder={me.username || "delete"} aria-label="Confirm username" />
          <button type="button" className="hp-ghost bad" disabled={del !== (me.username || "delete")} onClick={remove}>Delete page</button></div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [me, setMe] = useState(undefined);
  const [tab, setTab] = useState("Profile");
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [auto, setAuto] = useState(false);
  const [dev, setDev] = useState("desktop");
  const [pv, setPv] = useState(false);
  const [rd, setRd] = useState(null);
  const [, bump] = useState(0);
  const hist = useRef({ past: [], future: [], key: "", t: 0 });
  const saved = useRef("");
  const meRef = useRef(null);
  meRef.current = me;

  useEffect(() => {
    fetch("/api/me").then((r) => (r.ok ? r.json() : null)).then((d) => { if (d) saved.current = JSON.stringify(clean(d)); setMe(d); }).catch(() => setMe(null));
    try { setAuto(localStorage.getItem("haven.auto") === "1"); } catch {}
  }, []);

  useEffect(() => { if (me === null) location.replace("/dashboard"); }, [me]); // signed out: back to the landing page
  useEffect(() => { // arrived from the public Templates page: /dashboard/<you>?template=<id>
    if (!me) return;
    const id = new URLSearchParams(location.search).get("template");
    if (!id) return;
    history.replaceState(null, "", location.pathname);
    fetch(`/api/templates/${id}`).then((r) => (r.ok ? r.json() : null)).then((t) => {
      if (!t) return flash("That template doesn't exist any more.");
      applyTemplate(t.cfg, t);
      fetch(`/api/templates/${id}`, { method: "POST" }).catch(() => {});
    }).catch(() => {});
  }, [!!me]); // eslint-disable-line react-hooks/exhaustive-deps
  const flash = useCallback((t) => { setMsg(t); clearTimeout(flash.t); flash.t = setTimeout(() => setMsg(""), 3500); }, []);
  const commit = useCallback((next, key) => {
    const h = hist.current, now = Date.now();
    if (!(key === h.key && now - h.t < 800)) { h.past.push(meRef.current); if (h.past.length > 80) h.past.shift(); }
    h.key = key; h.t = now; h.future = [];
    setMe(next);
  }, []);
  const set = useCallback((k, v) => commit({ ...meRef.current, [k]: v }, k), [commit]);
  const patch = useCallback((o) => commit({ ...meRef.current, ...o }, `*${Math.random()}`), [commit]);
  const applyTemplate = useCallback((cfg, t) => { patch(cfg); flash(`Applied “${t?.name || "template"}”. Look it over, then press Save.`); }, [patch, flash]);
  const undo = () => { const h = hist.current; if (!h.past.length) return; h.future.push(meRef.current); h.key = ""; setMe(h.past.pop()); bump((x) => x + 1); };
  const redo = () => { const h = hist.current; if (!h.future.length) return; h.past.push(meRef.current); h.key = ""; setMe(h.future.pop()); bump((x) => x + 1); };

  const snap = useMemo(() => (me ? JSON.stringify(clean(me)) : ""), [me]);
  const dirty = !!me && snap !== saved.current;

  const save = useCallback(async () => {
    const cur = meRef.current;
    if (!cur || saving) return;
    setSaving(true);
    const sent = JSON.stringify(clean(cur));
    try {
      const r = await fetch("/api/me", { method: "PUT", headers: { "Content-Type": "application/json" }, body: sent });
      const d = await r.json();
      if (r.ok) { saved.current = sent; try { history.replaceState(null, "", `/dashboard/${cur.username || "me"}`); } catch {}  setMe((m) => ({ ...m, views: d.views, days: d.days, clicks: d.clicks })); flash("Saved"); }
      else flash(d.error || "Couldn't save.");
    } catch { flash("Couldn't reach the server. Your changes are still here."); }
    setSaving(false);
  }, [saving, flash]);

  useEffect(() => { // autosave
    if (!auto || !dirty || saving) return;
    const t = setTimeout(save, 1800);
    return () => clearTimeout(t);
  }, [auto, dirty, snap, saving, save]);
  useEffect(() => {
    const key = (e) => {
      const m = e.metaKey || e.ctrlKey;
      if (m && e.key === "s") { e.preventDefault(); save(); }
      else if (m && e.key === "z" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)) { e.preventDefault(); e.shiftKey ? redo() : undo(); }
    };
    const warn = (e) => { if (dirty) e.preventDefault(); };
    addEventListener("keydown", key); addEventListener("beforeunload", warn);
    return () => { removeEventListener("keydown", key); removeEventListener("beforeunload", warn); };
  });
  const toggleAuto = (v) => { setAuto(v); try { localStorage.setItem("haven.auto", v ? "1" : "0"); } catch {} };
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); setMe(null); }

  const sample = useMemo(SAMPLE, []);
  const c = useMemo(() => (me ? cfg(me) : {}), [me]);
  const live = rd?.ok ? rd.presence : sample;

  if (me === undefined) return <main className="dash"><p className="boot">Loading your dashboard…</p></main>;
  if (me === null) return <main className="dash"><p className="boot">Signing you out…</p></main>;

  // field list for the current tab (or search results)
  const render = (k, f, key = k) => {
    if (f.t === "badges") return <BadgesEditor key={key} me={me} set={set} />;
    if (f.t === "links") return <LinksEditor key={key} me={me} set={set} stats={me.clicks} />;
    if (f.t === "socials") return <SocialsEditor key={key} me={me} set={set} stats={me.clicks} />;
    if (f.t === "tracks") return <TracksEditor key={key} me={me} set={set} />;
    if (f.t === "sections") return <SectionsEditor key={key} me={me} set={set} />;
    if (f.t === "presets") return <PresetsBlock key={key} me={me} patch={patch} flash={flash} />;
    if (f.t === "discord") return <DiscordBlock key={key} me={me} patch={patch} rd={rd} setRd={setRd} />;
    return shows(f, c) ? <Field key={key} k={k} f={f} me={me} c={c} set={set} /> : null;
  };
  const term = q.trim().toLowerCase();
  const results = term ? Object.entries(SCHEMA).flatMap(([t, g]) => Object.entries(g).filter(([k, f]) => FIELDS[k] && f.t !== "head" && `${f.label} ${k}`.toLowerCase().includes(term)).map(([k, f]) => [t, k, f])) : [];
  const hits = results.map(([t, k, f]) => [t, k, render(k, f, `r-${k}`)]).filter(([, , n]) => n).map(([t, k, n]) => <div className="res" key={k}><small className="rt">{t}</small>{n}</div>);
  const title = NAV.flatMap(([, x]) => x).find(([n]) => n === tab);

  return (
    <main className={`dash ${me.dashTheme?.compact ? "compact" : ""}`} style={dashStyle(me.dashTheme, FONTS[me.dashTheme?.font])}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;600;700;800&family=Bricolage+Grotesque:wght@600;800&display=swap" />
      <link rel="stylesheet" href={fontsHref(Object.keys(FONTS))} />
      <nav className="dash-nav" aria-label="Dashboard sections">
        <a className="hp-ghost dn-home" href="/"><Ico n="back" size={13} />Return to home page</a>
        <h1 className="dn-logo">Haven</h1>
        <div className="dn-me">{(me.customAvatar || me.avatar) && <img src={me.customAvatar || me.avatar} alt="" />}<div><b>{me.name || me.displayName}</b><small>{me.username ? `/${me.username}` : "Pick a username"}</small></div></div>
        <label className="dn-search"><Ico n="wand" size={14} /><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search settings" aria-label="Search settings" /></label>
        {NAV.map(([g, items]) => (
          <div className="dn-g" key={g}><small>{g}</small>
            {items.map(([n, ic]) => <button type="button" key={n} className={tab === n && !term ? "on" : ""} aria-current={tab === n && !term ? "page" : undefined} onClick={() => { setTab(n); setQ(""); }}><Ico n={ic} size={16} />{n}</button>)}
          </div>
        ))}
        <span className="sp" />
        {me.username && <a className="hp-ghost" href={`/${me.username}`} target="_blank" rel="noopener noreferrer">View my page <Ico n="external" size={13} /></a>}
      </nav>

      <form className="dash-main" onSubmit={(e) => { e.preventDefault(); save(); }}>
        <div className="toolbar">
          <h2>{term ? `Results for “${q}”` : tab}</h2>
          <span className="tb-sp" />
          <span className="tb-msg" role="status" aria-live="polite">{msg || (dirty ? (auto ? "Saving soon…" : "Unsaved changes") : "")}</span>
          <button type="button" className="ib" aria-label="Undo" title="Undo (Ctrl+Z)" disabled={!hist.current.past.length} onClick={undo}><Ico n="undo" size={16} /></button>
          <button type="button" className="ib" aria-label="Redo" title="Redo (Ctrl+Shift+Z)" disabled={!hist.current.future.length} onClick={redo}><Ico n="redo" size={16} /></button>
          <label className="chk tb-auto"><input type="checkbox" checked={auto} onChange={(e) => toggleAuto(e.target.checked)} />Autosave</label>
          <button type="button" className="hp-ghost pvbtn" onClick={() => setPv(true)}><Ico n="eye" size={14} /> Preview</button>
          <button type="submit" className="hp-btn gold sm" disabled={saving || !dirty}>{saving ? "Saving…" : "Save"}</button>
        </div>

        <div className={`panel ${(tab === "Discover" || tab === "Templates") && !term ? "wide" : ""}`}>
          {term ? (
            hits.length ? hits : <p className="empty">No settings match “{q}”. Some options only appear when a related switch is on.</p>
          ) : tab === "Discover" ? <Discover embed />
            : tab === "Templates" ? <TemplatesGallery mode="dash" me={me} flash={flash} onApply={applyTemplate} />
            : tab === "Appearance" ? <AppearanceTab me={me} set={set} />
            : tab === "Stats" ? <StatsTab me={me} />
            : tab === "Account" ? <AccountTab me={me} patch={patch} flash={flash} logout={logout} />
            : (
              <>
                {tab === "Profile" && (
                  <label className="fld"><span>Your page address</span>
                    <span className="hp-prefix">havenshq.xyz/<input value={me.username || ""} onChange={(e) => set("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} placeholder="yourname" minLength={3} maxLength={20} required /></span>
                    <small className="hint">3–20 characters: letters, numbers, underscores.</small></label>
                )}
                {Object.entries(SCHEMA[tab] || {}).map(([k, f]) => render(k, f))}
              </>
            )}
        </div>
      </form>

      <aside className={`dash-preview ${pv ? "open" : ""}`} aria-label="Live preview">
        <div className="pv-bar">
          <b>Live preview</b>
          <span className="seg">
            <button type="button" className={dev === "desktop" ? "on" : ""} aria-label="Desktop" onClick={() => setDev("desktop")}><Ico n="monitor" size={14} /></button>
            <button type="button" className={dev === "phone" ? "on" : ""} aria-label="Phone" onClick={() => setDev("phone")}><Ico n="phone" size={14} /></button>
          </span>
          <button type="button" className="ib pv-x" aria-label="Close preview" onClick={() => setPv(false)}><Ico n="x" size={16} /></button>
        </div>
        <div className={`pv-frame ${dev}`}><ProfileCard p={me} views={me.views} staff={me.staff} preview claim livePres={c.presence ? live : null} /></div>
        {c.presence && !rd?.ok && <small className="hint">Sample status shown. Use “Read my Discord status” in the Discord tab to see yours.</small>}
      </aside>
    </main>
  );
}
