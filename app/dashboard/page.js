"use client";
import { useEffect, useState } from "react";
import "../profiles.css";

export default function Dashboard() {
  const [me, setMe] = useState(undefined);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/me").then((r) => (r.ok ? r.json() : null)).then(setMe);
  }, []);

  if (me === undefined) return <main className="hp-page"><p>Loading…</p></main>;

  if (me === null)
    return (
      <main className="hp-page">
        <section className="hp-card">
          <h1>Make your Haven page</h1>
          <p className="hp-bio">Sign in with Discord to claim havenshq.xyz/yourname and add your links.</p>
          <a className="hp-btn" href="/api/auth/login">Sign in with Discord</a>
        </section>
      </main>
    );

  const set = (k, v) => setMe({ ...me, [k]: v });
  const setLink = (i, k, v) => set("links", me.links.map((l, j) => (j === i ? { ...l, [k]: v } : l)));

  async function save(e) {
    e.preventDefault();
    setSaving(true); setMsg("");
    const r = await fetch("/api/me", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(me),
    });
    const d = await r.json();
    setSaving(false);
    if (r.ok) { setMe(d); setMsg("Saved"); } else setMsg(d.error);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMe(null);
  }

  return (
    <main className="hp-page" style={{ "--accent": me.accent }}>
      <form className="hp-card hp-form" onSubmit={save}>
        <header className="hp-head">
          {me.avatar && <img className="hp-avatar sm" src={me.avatar} alt="" width={56} height={56} />}
          <div><h1>{me.displayName}</h1><p className="hp-handle">Signed in with Discord</p></div>
          <button type="button" className="hp-ghost" onClick={logout}>Sign out</button>
        </header>

        <label>Username
          <span className="hp-prefix">havenshq.xyz/
            <input value={me.username || ""} onChange={(e) => set("username", e.target.value.toLowerCase())}
              placeholder="yourname" minLength={3} maxLength={20} required />
          </span>
        </label>

        <label>Bio
          <textarea value={me.bio} onChange={(e) => set("bio", e.target.value)} maxLength={280} rows={3} />
        </label>

        <label>Accent color
          <input type="color" value={me.accent} onChange={(e) => set("accent", e.target.value)} />
        </label>

        <fieldset>
          <legend>Links</legend>
          {me.links.map((l, i) => (
            <div className="hp-row" key={i}>
              <input value={l.label} onChange={(e) => setLink(i, "label", e.target.value)} placeholder="Label" aria-label="Link label" />
              <input value={l.url} onChange={(e) => setLink(i, "url", e.target.value)} placeholder="https://…" aria-label="Link URL" />
              <button type="button" className="hp-ghost" onClick={() => set("links", me.links.filter((_, j) => j !== i))}>Remove</button>
            </div>
          ))}
          {me.links.length < 8 && (
            <button type="button" className="hp-ghost" onClick={() => set("links", [...me.links, { label: "", url: "" }])}>Add link</button>
          )}
        </fieldset>

        <div className="hp-actions">
          <button className="hp-btn" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
          {me.username && <a href={`/${me.username}`} target="_blank">View your page</a>}
          <span role="status">{msg}</span>
        </div>
      </form>
    </main>
  );
}
