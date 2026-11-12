"use client";
import { useEffect, useState } from "react";
import ProfileCard from "../ProfileCard";
import { PLATFORMS, SCHEMA, FIELDS, PRESETS } from "@/lib/schema";
import "../profiles.css";

const TABS = [...Object.keys(SCHEMA), "Stats"];
const NOTE = { Socials: "Icons row", Links: "Link buttons", Discord: "Live status" };

const compress = (file, max, q = 0.82) => new Promise((resolve) => {
  if (file.type === "image/gif") { const r = new FileReader(); r.onload = () => resolve(r.result); r.readAsDataURL(file); return; }
  const img = new Image();
  img.onload = () => {
    const s = Math.min(1, max / img.width), c = document.createElement("canvas");
    c.width = img.width * s; c.height = img.height * s;
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    resolve(c.toDataURL("image/jpeg", q));
  };
  img.src = URL.createObjectURL(file);
});

function Field({ me, set, k, f }) {
  const v = me[k] ?? (k === "musicUrl" ? me.music?.url : k === "musicTitle" ? me.music?.title : undefined) ?? f.def;
  const L = f.label;
  if (f.t === "seg") return <div className="fld"><span>{L}</span><div className="seg">{f.opts.map((o) => <button type="button" key={o} className={v === o ? "on" : ""} onClick={() => set(k, o)}>{o}</button>)}</div></div>;
  if (f.t === "range") return <label className="fld"><span>{L} <b>{v}</b></span><input type="range" min={f.lo} max={f.hi} value={v} onChange={(e) => set(k, +e.target.value)} /></label>;
  if (f.t === "bool") return <label className="chk"><input type="checkbox" checked={!!v} onChange={(e) => set(k, e.target.checked)} />{L}</label>;
  if (f.t === "color") return <div className="fld"><span>{L}</span><div className="colrow"><input type="color" value={v || f.def} onChange={(e) => set(k, e.target.value)} />{f.clear && me[k] && <button type="button" className="hp-ghost" onClick={() => set(k, "")}>Reset</button>}</div></div>;
  if (f.t === "img") return (
    <div className="fld"><span>{L}</span>
      <div className="colrow">
        <input value={v?.startsWith("data:") ? "" : v || ""} placeholder={v?.startsWith("data:") ? "(uploaded image)" : "https://… or upload"} onChange={(e) => set(k, e.target.value)} />
        <label className="hp-ghost">Upload<input type="file" accept="image/*" hidden onChange={async (e) => { const x = e.target.files?.[0]; if (x) set(k, await compress(x, f.max > 1e6 ? 1600 : f.max > 5e5 ? 1200 : 400)); }} /></label>
        {v && <button type="button" className="hp-ghost" onClick={() => set(k, "")}>Remove</button>}
      </div>
    </div>
  );
  const P = f.t === "area" ? "textarea" : "input";
  return <label className="fld"><span>{L}</span><P value={v || ""} onChange={(e) => set(k, e.target.value)} placeholder={f.ph} maxLength={f.max} rows={f.t === "area" ? 3 : undefined} /></label>;
}

export default function Dashboard() {
  const [me, setMe] = useState(undefined);
  const [tab, setTab] = useState("Profile");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [add, setAdd] = useState("instagram");
  const [rd, setRd] = useState(null);

  useEffect(() => { fetch("/api/me").then((r) => (r.ok ? r.json() : null)).then(setMe); }, []);
  useEffect(() => {
    const warn = (e) => dirty && e.preventDefault();
    addEventListener("beforeunload", warn);
    return () => removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (me === undefined) return <main className="hp-page"><p>Loading…</p></main>;
  if (me === null) return (
    <main className="hp-page"><section className="hp-card">
      <h1>Make your Haven page</h1>
      <p className="hp-bio">Sign in with Discord to claim havenshq.xyz/yourname.</p>
      <a className="hp-btn" href="/api/auth/login">Sign in with Discord</a>
    </section></main>
  );

  const patch = (o) => { setMe((m) => ({ ...m, ...o })); setDirty(true); setMsg(""); };
  const set = (k, v) => patch({ [k]: v });
  const P = { me, set };
  const setIn = (key, i, k, v) => set(key, me[key].map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const del = (key, i) => set(key, me[key].filter((_, j) => j !== i));
  const move = (key, i, d) => { const a = [...me[key]], j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; set(key, a); };
  const Reorder = ({ k, i }) => <span className="mv"><button type="button" aria-label="Move up" onClick={() => move(k, i, -1)}>↑</button><button type="button" aria-label="Move down" onClick={() => move(k, i, 1)}>↓</button></span>;
  const clicks = (t, i) => me.clicks?.[t]?.[i] || 0;
  const totalClicks = [...(me.clicks?.s || []), ...(me.clicks?.l || [])].reduce((a, b) => a + b, 0);

  async function save(e) {
    e?.preventDefault(); setSaving(true); setMsg("");
    const r = await fetch("/api/me", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(me) });
    const d = await r.json(); setSaving(false);
    if (r.ok) { setMe(d); setDirty(false); setMsg("Saved ✓"); } else setMsg(d.error);
  }
  async function readStatus() {
    setRd({ loading: true });
    const r = await fetch("/api/presence", { method: "POST" });
    const d = await r.json();
    setRd(d);
    if (d.ok && !me.presence) patch({ presence: true });
  }
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); setMe(null); }

  const group = SCHEMA[tab];
  const pr = rd?.presence;

  return (
    <main className="dash">
      <nav className="dash-nav" aria-label="Sections">
        <h1>Haven</h1>
        {TABS.map((t) => <button type="button" key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>)}
        <span className="sp" />
        {me.username && <a className="hp-ghost" href={`/${me.username}`} target="_blank">View page ↗</a>}
        <button type="button" onClick={logout}>Sign out</button>
      </nav>

      <form className="dash-main" onSubmit={save}>
        <h2>{tab}</h2>
        <div className="panel">
          {tab === "Profile" && (
            <label className="fld"><span>Username</span>
              <span className="hp-prefix">havenshq.xyz/<input value={me.username || ""} onChange={(e) => set("username", e.target.value.toLowerCase())} placeholder="yourname" minLength={3} maxLength={20} required /></span>
            </label>
          )}
          {tab === "Theme" && (
            <div className="fld"><span>Presets (one click, then tweak anything)</span>
              <div className="seg">{Object.keys(PRESETS).map((n) => <button type="button" key={n} onClick={() => patch(PRESETS[n])}>{n}</button>)}</div>
            </div>
          )}

          {group && Object.entries(group).map(([k, f]) => f.t === "badges" ? (
            <div className="fld" key={k}><span>Badges (up to 6 chips next to your name)</span>
              {(me.badges || []).map((b, i) => (
                <div className="item" key={i}>
                  <input value={b} maxLength={20} onChange={(e) => set("badges", me.badges.map((x, j) => (j === i ? e.target.value : x)))} placeholder="e.g. 👑 Owner" />
                  <button type="button" className="hp-ghost" onClick={() => del("badges", i)}>Remove</button>
                </div>
              ))}
              {(me.badges || []).length < 6 && <button type="button" className="hp-ghost" onClick={() => set("badges", [...(me.badges || []), ""])}>Add badge</button>}
            </div>
          ) : <Field key={k} {...P} k={k} f={f} />)}

          {tab === "Socials" && (<>
            {(me.socials || []).map((s, i) => (
              <div className="item" key={i}>
                <img src={`https://cdn.simpleicons.org/${PLATFORMS[s.type].slug}/ffffff`} alt="" width={22} height={22} />
                <input value={s.url} onChange={(e) => setIn("socials", i, "url", e.target.value)} placeholder={PLATFORMS[s.type].ph} aria-label={`${PLATFORMS[s.type].name} URL`} />
                <Reorder k="socials" i={i} /><button type="button" className="hp-ghost" onClick={() => del("socials", i)}>Remove</button><small>{clicks("s", i)} clicks</small>
              </div>
            ))}
            <div className="item"><select value={add} onChange={(e) => setAdd(e.target.value)}>{Object.entries(PLATFORMS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}</select>
              <button type="button" className="hp-ghost" onClick={() => set("socials", [...(me.socials || []), { type: add, url: "" }])}>Add social</button></div>
          </>)}

          {tab === "Links" && (<>
            {(me.links || []).map((l, i) => (
              <div className="item" key={i}>
                <input value={l.label} onChange={(e) => setIn("links", i, "label", e.target.value)} placeholder="Label" aria-label="Link label" />
                <input value={l.url} onChange={(e) => setIn("links", i, "url", e.target.value)} placeholder="https://…" aria-label="Link URL" />
                <select value={l.icon || ""} onChange={(e) => setIn("links", i, "icon", e.target.value)} aria-label="Link icon"><option value="">No icon</option>{Object.entries(PLATFORMS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}</select>
                <Reorder k="links" i={i} /><button type="button" className="hp-ghost" onClick={() => del("links", i)}>Remove</button><small>{clicks("l", i)} clicks</small>
              </div>
            ))}
            <button type="button" className="hp-ghost" onClick={() => set("links", [...(me.links || []), { label: "", url: "", icon: "" }])}>Add link</button>
          </>)}

          {tab === "Discord" && (
            <div className="rd">
              <b>Read my Discord status</b>
              <small style={{ color: "var(--muted)" }}>Checks that you're in the server the bot is in, then reads your live status, custom status, game and Spotify from the bot.</small>
              <button type="button" className="hp-btn" onClick={readStatus} disabled={rd?.loading}>{rd?.loading ? "Reading…" : "Read my Discord status"}</button>
              {rd && !rd.loading && !rd.ok && <div className="rd no">{rd.message || rd.error}{rd.invite && <> <a href={rd.invite} target="_blank" style={{ color: "var(--accent)" }}>Join the server ↗</a></>}</div>}
              {rd?.ok && pr && (
                <div className="rd ok">
                  <b>Connected{rd.nick ? ` as ${rd.nick}` : ""} — {pr.status}</b>
                  {pr.custom && <span>Custom status: {pr.custom}</span>}
                  {pr.act ? <span>{pr.act.kind === "spotify" ? "🎵" : "🎮"} {pr.act.title}{pr.act.sub ? ` — ${pr.act.sub}` : ""}</span> : <span>No game or music activity right now.</span>}
                  <small style={{ color: "var(--muted)" }}>Live status is now switched on for your page. Hit Save to publish it.</small>
                </div>
              )}
            </div>
          )}

          {tab === "Stats" && <div className="stats"><div><b>{(me.views || 0).toLocaleString()}</b>profile views</div><div><b>{totalClicks.toLocaleString()}</b>link clicks</div></div>}
        </div>

        <div className="savebar">
          <button className="hp-btn" disabled={saving || !dirty}>{saving ? "Saving…" : "Save changes"}</button>
          {dirty && <span className="dirty">Unsaved changes</span>}
          {me.username && <button type="button" className="hp-ghost" onClick={() => { navigator.clipboard?.writeText(`https://havenshq.xyz/${me.username}`); setMsg("Link copied"); }}>Copy link</button>}
          <span role="status">{msg}</span>
        </div>
      </form>

      <aside className="dash-preview"><ProfileCard p={me} views={me.views} preview livePres={me.presence ? pr || undefined : undefined} /></aside>
    </main>
  );
}
