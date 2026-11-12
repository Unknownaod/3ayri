"use client";
import { useEffect, useState } from "react";
import ProfileCard from "../ProfileCard";
import { PLATFORMS, CHOICES, RANGES, PRESETS } from "@/lib/platforms";
import "../profiles.css";

const TABS = ["Profile", "Look", "Background", "Effects", "Socials", "Links", "Stats", "Preview"];

const val = (me, k) => me[k] ?? (CHOICES[k] ? CHOICES[k][0] : RANGES[k]?.[2]);

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

function Seg({ me, set, k, label }) {
  return (
    <div className="fld"><span>{label}</span>
      <div className="seg">{CHOICES[k].map((o) => (
        <button type="button" key={o} className={val(me, k) === o ? "on" : ""} onClick={() => set(k, o)}>{o}</button>
      ))}</div>
    </div>
  );
}
function Rng({ me, set, k, label }) {
  const [lo, hi] = RANGES[k];
  return (
    <label className="fld"><span>{label} <b>{val(me, k)}</b></span>
      <input type="range" min={lo} max={hi} value={val(me, k)} onChange={(e) => set(k, +e.target.value)} />
    </label>
  );
}
function Chk({ me, set, k, label, def }) {
  return (
    <label className="chk"><input type="checkbox" checked={me[k] ?? !!def} onChange={(e) => set(k, e.target.checked)} />{label}</label>
  );
}
function Col({ me, set, k, label, fallback, clearable }) {
  return (
    <div className="fld"><span>{label}</span>
      <div className="colrow">
        <input type="color" value={me[k] || fallback} onChange={(e) => set(k, e.target.value)} />
        {clearable && me[k] && <button type="button" className="hp-ghost" onClick={() => set(k, "")}>Reset</button>}
      </div>
    </div>
  );
}
function Txt({ me, set, k, label, ph, max, area }) {
  const P = area ? "textarea" : "input";
  return (
    <label className="fld"><span>{label}</span>
      <P value={me[k] || ""} onChange={(e) => set(k, e.target.value)} placeholder={ph} maxLength={max} rows={area ? 3 : undefined} />
    </label>
  );
}
function Pic({ label, has, onPick, onClear }) {
  return (
    <div className="fld"><span>{label}</span>
      <div className="colrow">
        <label className="hp-ghost filebtn">Upload<input type="file" accept="image/*" hidden onChange={onPick} /></label>
        {has && <button type="button" className="hp-ghost" onClick={onClear}>Remove</button>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [me, setMe] = useState(undefined);
  const [tab, setTab] = useState("Profile");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [newSocial, setNewSocial] = useState("instagram");

  useEffect(() => { fetch("/api/me").then((r) => (r.ok ? r.json() : null)).then(setMe); }, []);
  useEffect(() => {
    const warn = (e) => dirty && e.preventDefault();
    addEventListener("beforeunload", warn);
    return () => removeEventListener("beforeunload", warn);
  }, [dirty]);

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

  const patch = (o) => { setMe((m) => ({ ...m, ...o })); setDirty(true); setMsg(""); };
  const set = (k, v) => patch({ [k]: v });
  const P = { me, set };
  const setIn = (key, i, k, v) => set(key, me[key].map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const del = (key, i) => set(key, me[key].filter((_, j) => j !== i));
  const move = (key, i, d) => {
    const a = [...me[key]], j = i + d;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]]; set(key, a);
  };
  const upload = (key, max) => async (e) => { const f = e.target.files?.[0]; if (f) set(key, await compress(f, max)); };
  const music = (k, v) => set("music", { ...me.music, [k]: v });
  const clicks = (t, i) => me.clicks?.[t]?.[i] || 0;
  const totalClicks = [...(me.clicks?.s || []), ...(me.clicks?.l || [])].reduce((a, b) => a + b, 0);

  async function save(e) {
    e?.preventDefault(); setSaving(true); setMsg("");
    const r = await fetch("/api/me", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(me) });
    const d = await r.json();
    setSaving(false);
    if (r.ok) { setMe(d); setDirty(false); setMsg("Saved"); } else setMsg(d.error);
  }
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); setMe(null); }
  const copy = () => { navigator.clipboard?.writeText(`https://havenshq.xyz/${me.username}`); setMsg("Link copied"); };

  const Reorder = ({ k, i }) => (
    <span className="mv">
      <button type="button" aria-label="Move up" onClick={() => move(k, i, -1)}>↑</button>
      <button type="button" aria-label="Move down" onClick={() => move(k, i, 1)}>↓</button>
    </span>
  );

  return (
    <main className="dash">
      <form className="dash-main" onSubmit={save}>
        <header className="dash-head">
          <h1>Your Haven page</h1>
          <button type="button" className="hp-ghost" onClick={logout}>Sign out</button>
        </header>

        <nav className="tabs" aria-label="Sections">
          {TABS.map((t) => (
            <button type="button" key={t} className={`${tab === t ? "on" : ""} ${t === "Preview" ? "only-m" : ""}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </nav>

        <div className="panel">
          {tab === "Profile" && (<>
            <label className="fld"><span>Username</span>
              <span className="hp-prefix">havenshq.xyz/
                <input value={me.username || ""} onChange={(e) => set("username", e.target.value.toLowerCase())} placeholder="yourname" minLength={3} maxLength={20} required />
              </span>
            </label>
            <Txt {...P} k="name" label="Display name" ph={me.displayName} max={32} />
            <Txt {...P} k="bio" label="Bio" max={280} area />
            <Txt {...P} k="location" label="Location" max={40} />
            <Chk {...P} k="typewriter" label="Type out the bio" />
            <Chk {...P} k="showViews" label="Show view count" def />
          </>)}

          {tab === "Look" && (<>
            <div className="fld"><span>Presets (one click, then tweak)</span>
              <div className="seg">{Object.keys(PRESETS).map((n) => <button type="button" key={n} onClick={() => patch(PRESETS[n])}>{n}</button>)}</div>
            </div>
            <Seg {...P} k="theme" label="Theme" />
            <Seg {...P} k="font" label="Font" />
            <Col {...P} k="accent" label="Accent color" fallback="#e0a243" />
            <Col {...P} k="accent2" label="Second color (gradient name)" fallback="#ffffff" />
            <Col {...P} k="textColor" label="Text color" fallback="#f4e6dc" clearable />
            <Seg {...P} k="nameEffect" label="Name effect" />
            <Seg {...P} k="layout" label="Layout" />
            <Seg {...P} k="width" label="Card width" />
            <Seg {...P} k="border" label="Card border" />
            <Rng {...P} k="radius" label="Corner roundness" />
            <Rng {...P} k="cardOpacity" label="Card opacity" />
            <Rng {...P} k="blur" label="Card glass blur" />
            <Pic label="Banner" has={me.banner} onPick={upload("banner", 1200)} onClear={() => set("banner", "")} />
            <Rng {...P} k="bannerHeight" label="Banner height (0 hides it)" />
            <Pic label="Profile picture (default: Discord avatar)" has={me.customAvatar} onPick={upload("customAvatar", 400)} onClear={() => set("customAvatar", "")} />
            <Seg {...P} k="avatarShape" label="Avatar shape" />
            <Seg {...P} k="avatarBorder" label="Avatar border" />
            <Rng {...P} k="avatarSize" label="Avatar size" />
          </>)}

          {tab === "Background" && (<>
            <Pic label="Background image" has={me.background} onPick={upload("background", 1600)} onClear={() => set("background", "")} />
            <Txt {...P} k="bgVideo" label="Background video (direct .mp4 link, plays muted)" ph="https://…/clip.mp4" />
            <Col {...P} k="bgColor" label="Background color" fallback="#0d0a08" clearable />
            <Rng {...P} k="overlay" label="Dark overlay" />
            <Rng {...P} k="bgBlur" label="Background blur" />
          </>)}

          {tab === "Effects" && (<>
            <Seg {...P} k="particles" label="Particles" />
            <Chk {...P} k="tilt" label="3D tilt on hover" />
            <Chk {...P} k="entry" label="Click-to-enter screen" />
            {me.entry && <Txt {...P} k="entryText" label="Entry text" ph="click to enter" max={30} />}
            <label className="fld"><span>Music (direct .mp3 link, plays after entering)</span>
              <input value={me.music?.url || ""} onChange={(e) => music("url", e.target.value)} placeholder="https://…/song.mp3" />
            </label>
            <label className="fld"><span>Song title</span>
              <input value={me.music?.title || ""} onChange={(e) => music("title", e.target.value)} maxLength={60} />
            </label>
            <Chk {...P} k="presence" label="Show my live Discord status (join discord.gg/lanyard first)" />
          </>)}

          {tab === "Socials" && (<>
            <Seg {...P} k="iconStyle" label="Icon style" />
            <Seg {...P} k="iconColor" label="Icon color" />
            <Rng {...P} k="iconSize" label="Icon size" />
            {(me.socials || []).map((s, i) => (
              <div className="item" key={i}>
                <img src={`https://cdn.simpleicons.org/${PLATFORMS[s.type].slug}/ffffff`} alt="" width={22} height={22} />
                <input value={s.url} onChange={(e) => setIn("socials", i, "url", e.target.value)} placeholder={PLATFORMS[s.type].ph} aria-label={`${PLATFORMS[s.type].name} URL`} />
                <Reorder k="socials" i={i} />
                <button type="button" className="hp-ghost" onClick={() => del("socials", i)}>Remove</button>
                <small>{clicks("s", i)} clicks</small>
              </div>
            ))}
            <div className="item add">
              <select value={newSocial} onChange={(e) => setNewSocial(e.target.value)}>{Object.entries(PLATFORMS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}</select>
              <button type="button" className="hp-ghost" onClick={() => set("socials", [...(me.socials || []), { type: newSocial, url: "" }])}>Add</button>
            </div>
          </>)}

          {tab === "Links" && (<>
            <Seg {...P} k="linkStyle" label="Button style" />
            <Seg {...P} k="linkShape" label="Button shape" />
            <Seg {...P} k="linkLayout" label="Layout" />
            {(me.links || []).map((l, i) => (
              <div className="item" key={i}>
                <input value={l.label} onChange={(e) => setIn("links", i, "label", e.target.value)} placeholder="Label" aria-label="Link label" />
                <input value={l.url} onChange={(e) => setIn("links", i, "url", e.target.value)} placeholder="https://…" aria-label="Link URL" />
                <select value={l.icon || ""} onChange={(e) => setIn("links", i, "icon", e.target.value)} aria-label="Link icon">
                  <option value="">No icon</option>{Object.entries(PLATFORMS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
                </select>
                <Reorder k="links" i={i} />
                <button type="button" className="hp-ghost" onClick={() => del("links", i)}>Remove</button>
                <small>{clicks("l", i)} clicks</small>
              </div>
            ))}
            <button type="button" className="hp-ghost" onClick={() => set("links", [...(me.links || []), { label: "", url: "", icon: "" }])}>Add link</button>
          </>)}

          {tab === "Stats" && (
            <div className="stats"><div><b>{(me.views || 0).toLocaleString()}</b>profile views</div><div><b>{totalClicks.toLocaleString()}</b>link clicks</div></div>
          )}

          {tab === "Preview" && <ProfileCard p={me} views={me.views} preview />}
        </div>

        <div className="savebar">
          <button className="hp-btn" disabled={saving || !dirty}>{saving ? "Saving…" : "Save changes"}</button>
          {dirty && <span className="dirty">Unsaved changes</span>}
          {me.username && <a href={`/${me.username}`} target="_blank">View page</a>}
          {me.username && <button type="button" className="hp-ghost" onClick={copy}>Copy link</button>}
          <span role="status">{msg}</span>
        </div>
      </form>

      <aside className="dash-preview"><ProfileCard p={me} views={me.views} preview /></aside>
    </main>
  );
}
