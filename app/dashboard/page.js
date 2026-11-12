"use client";
import { useEffect, useState } from "react";
import ProfileCard from "../ProfileCard";
import { PLATFORMS, THEMES, SHAPES, LAYOUTS, FONTS } from "@/lib/platforms";
import "../profiles.css";

const compress = (file, max, q = 0.8) => new Promise((resolve) => {
  const img = new Image();
  img.onload = () => {
    const s = Math.min(1, max / img.width);
    const c = document.createElement("canvas");
    c.width = img.width * s; c.height = img.height * s;
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    resolve(c.toDataURL("image/jpeg", q));
  };
  img.src = URL.createObjectURL(file);
});

const Sel = ({ label, value, onChange, options }) => (
  <label>{label}
    <select value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select>
  </label>
);
const Chk = ({ label, checked, onChange }) => (
  <label className="chk"><input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} /> {label}</label>
);
const Rng = ({ label, value, onChange, max = 100 }) => (
  <label>{label}: {value}
    <input type="range" min={0} max={max} value={value} onChange={(e) => onChange(+e.target.value)} />
  </label>
);

export default function Dashboard() {
  const [me, setMe] = useState(undefined);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [newSocial, setNewSocial] = useState("instagram");

  useEffect(() => { fetch("/api/me").then((r) => (r.ok ? r.json() : null)).then(setMe); }, []);

  if (me === undefined) return <main className="hp-page"><p>Loading…</p></main>;
  if (me === null)
    return (
      <main className="hp-page">
        <section className="hp-card">
          <h1>Make your Haven page</h1>
          <p className="hp-bio">Sign in with Discord to claim havenshq.xyz/yourname.</p>
          <a className="hp-btn" href="/api/auth/login">Sign in with Discord</a>
        </section>
      </main>
    );

  const set = (k, v) => setMe({ ...me, [k]: v });
  const setIn = (key, i, k, v) => set(key, me[key].map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const del = (key, i) => set(key, me[key].filter((_, j) => j !== i));
  const upload = (key, max) => async (e) => { const f = e.target.files?.[0]; if (f) set(key, await compress(f, max)); };
  const music = (k, v) => set("music", { ...me.music, [k]: v });
  const totalClicks = [...(me.clicks?.s || []), ...(me.clicks?.l || [])].reduce((a, b) => a + b, 0);

  async function save(e) {
    e.preventDefault(); setSaving(true); setMsg("");
    const r = await fetch("/api/me", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(me) });
    const d = await r.json();
    setSaving(false);
    if (r.ok) { setMe(d); setMsg("Saved"); } else setMsg(d.error);
  }
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); setMe(null); }

  return (
    <main className="dash">
      <form className="dash-form" onSubmit={save}>
        <header className="dash-head"><h1>Your Haven page</h1><button type="button" className="hp-ghost" onClick={logout}>Sign out</button></header>

        <section><h2>Analytics</h2>
          <div className="stats"><div><b>{(me.views || 0).toLocaleString()}</b>views</div><div><b>{totalClicks.toLocaleString()}</b>link clicks</div></div>
        </section>

        <section><h2>Profile</h2>
          <label>Username
            <span className="hp-prefix">havenshq.xyz/
              <input value={me.username || ""} onChange={(e) => set("username", e.target.value.toLowerCase())} placeholder="yourname" minLength={3} maxLength={20} required />
            </span>
          </label>
          <label>Display name<input value={me.name || ""} onChange={(e) => set("name", e.target.value)} placeholder={me.displayName} maxLength={32} /></label>
          <label>Bio<textarea value={me.bio} onChange={(e) => set("bio", e.target.value)} maxLength={280} rows={3} /></label>
          <label>Location<input value={me.location || ""} onChange={(e) => set("location", e.target.value)} maxLength={40} /></label>
          <Chk label="Type out the bio" checked={me.typewriter} onChange={(v) => set("typewriter", v)} />
          <Chk label="Show view count" checked={me.showViews !== false} onChange={(v) => set("showViews", v)} />
        </section>

        <section><h2>Appearance</h2>
          <label>Banner<input type="file" accept="image/*" onChange={upload("banner", 1200)} /></label>
          {me.banner && <button type="button" className="hp-ghost" onClick={() => set("banner", "")}>Remove banner</button>}
          <label>Profile picture (default: Discord avatar)<input type="file" accept="image/*" onChange={upload("customAvatar", 400)} /></label>
          {me.customAvatar && <button type="button" className="hp-ghost" onClick={() => set("customAvatar", "")}>Use Discord avatar</button>}
          <label>Page background image<input type="file" accept="image/*" onChange={upload("background", 1600)} /></label>
          {me.background && <button type="button" className="hp-ghost" onClick={() => set("background", "")}>Remove background</button>}
          <label>Background color<input type="color" value={me.bgColor || "#0d0a08"} onChange={(e) => set("bgColor", e.target.value)} /></label>
          <label>Accent color<input type="color" value={me.accent} onChange={(e) => set("accent", e.target.value)} /></label>
          <Sel label="Theme" value={me.theme || "dark"} onChange={(v) => set("theme", v)} options={THEMES} />
          <Sel label="Font" value={me.font || "sans"} onChange={(v) => set("font", v)} options={Object.keys(FONTS)} />
          <Sel label="Avatar shape" value={me.avatarShape || "circle"} onChange={(v) => set("avatarShape", v)} options={SHAPES} />
          <Sel label="Layout" value={me.layout || "center"} onChange={(v) => set("layout", v)} options={LAYOUTS} />
          <Rng label="Card opacity" value={me.cardOpacity ?? 85} onChange={(v) => set("cardOpacity", v)} />
          <Rng label="Background blur" value={me.blur ?? 12} onChange={(v) => set("blur", v)} max={30} />
          <Chk label="3D tilt on hover" checked={me.tilt} onChange={(v) => set("tilt", v)} />
        </section>

        <section><h2>Entry screen, music and status</h2>
          <Chk label="Show a click-to-enter screen" checked={me.entry} onChange={(v) => set("entry", v)} />
          {me.entry && <label>Entry text<input value={me.entryText || ""} onChange={(e) => set("entryText", e.target.value)} placeholder="click to enter" maxLength={30} /></label>}
          <label>Music URL (direct .mp3 link)<input value={me.music?.url || ""} onChange={(e) => music("url", e.target.value)} placeholder="https://…/song.mp3" /></label>
          <label>Song title<input value={me.music?.title || ""} onChange={(e) => music("title", e.target.value)} maxLength={60} /></label>
          <Chk label="Show my live Discord status (join discord.gg/lanyard first)" checked={me.presence} onChange={(v) => set("presence", v)} />
        </section>

        <section><h2>Social links</h2>
          {(me.socials || []).map((s, i) => (
            <div className="hp-row logo" key={i}>
              <img src={`https://cdn.simpleicons.org/${PLATFORMS[s.type].slug}/ffffff`} alt="" width={22} height={22} />
              <input value={s.url} onChange={(e) => setIn("socials", i, "url", e.target.value)} placeholder={PLATFORMS[s.type].ph} aria-label={`${PLATFORMS[s.type].name} URL`} />
              <button type="button" className="hp-ghost" onClick={() => del("socials", i)}>Remove</button>
              <small>{me.clicks?.s?.[i] || 0} clicks</small>
            </div>
          ))}
          <div className="hp-row">
            <select value={newSocial} onChange={(e) => setNewSocial(e.target.value)}>{Object.entries(PLATFORMS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}</select>
            <span /><button type="button" className="hp-ghost" onClick={() => set("socials", [...(me.socials || []), { type: newSocial, url: "" }])}>Add</button>
          </div>
        </section>

        <section><h2>Links</h2>
          {(me.links || []).map((l, i) => (
            <div className="hp-row" key={i}>
              <input value={l.label} onChange={(e) => setIn("links", i, "label", e.target.value)} placeholder="Label" aria-label="Link label" />
              <input value={l.url} onChange={(e) => setIn("links", i, "url", e.target.value)} placeholder="https://…" aria-label="Link URL" />
              <button type="button" className="hp-ghost" onClick={() => del("links", i)}>Remove</button>
              <small>{me.clicks?.l?.[i] || 0} clicks</small>
            </div>
          ))}
          <button type="button" className="hp-ghost" onClick={() => set("links", [...(me.links || []), { label: "", url: "" }])}>Add link</button>
        </section>

        <div className="hp-actions">
          <button className="hp-btn" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
          {me.username && <a href={`/${me.username}`} target="_blank">View your page</a>}
          <span role="status">{msg}</span>
        </div>
      </form>

      <aside className="dash-preview">
        <p className="hp-handle">Live preview</p>
        <ProfileCard p={me} views={me.views} preview />
      </aside>
    </main>
  );
}
