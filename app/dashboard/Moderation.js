"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Ico } from "@/lib/icons";

const ago = (t) => { if (!t) return "Never"; const m = Math.max(1, Math.round((Date.now() - t) / 60000)); return m < 60 ? `${m}m ago` : m < 1440 ? `${Math.round(m / 60)}h ago` : m < 43200 ? `${Math.round(m / 1440)}d ago` : new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); };
const date = (t) => (t ? new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Not set");

// Staff-only. The server checks staff on every call, so hiding this tab is only for tidiness.
export function Moderation({ flash }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const [user, setUser] = useState(null); // dossier | { missing }
  const [why, setWhy] = useState("");
  const [tab, setTab] = useState("log");
  const card = useRef(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/mod", { cache: "no-store" }), j = await r.json();
      if (!r.ok) throw new Error(j.error || "Couldn't load.");
      setData(j); setErr("");
    } catch (e) { setErr(e.message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function lookup(who = q) {
    const name = String(who).trim();
    if (!name) return;
    setQ(name.replace(/^@/, ""));
    const r = await fetch(`/api/mod?user=${encodeURIComponent(name)}`, { cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    setUser(r.ok ? j : { missing: name }); setWhy("");
    setTimeout(() => card.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
  }
  async function act(body, ok, then) {
    if (busy) return;
    setBusy(true);
    try {
      const r = await fetch("/api/mod", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) flash(j.error || "That didn't work.");
      else { flash(ok); await load(); if (then) await then(); }
    } finally { setBusy(false); }
  }
  const sure = (msg) => typeof window === "undefined" || window.confirm(msg);

  if (err) return <p className="empty">{err}</p>;
  if (!data) return <p className="empty">Loading…</p>;
  const s = data.stats || {};
  const u = user && !user.missing ? user : null;
  const status = u ? (u.banned ? ["Restricted", "bad"] : u.hidden ? ["Hidden", "warn"] : ["Visible", "ok"]) : null;

  return (
    <div className="mx">
      <div className="mx-stats">
        <div className={s.open ? "hot" : ""}><b>{s.open ?? 0}</b><span>Open reports</span></div>
        <div><b>{s.targets ?? 0}</b><span>Pages and templates reported</span></div>
        <div className={s.restricted ? "hot" : ""}><b>{s.restricted ?? 0}</b><span>Restricted accounts</span></div>
        <div className={s.errors ? "hot" : ""}><b>{s.errors ?? 0}</b><span>Errors this week</span></div>
      </div>

      <div className="mx-find" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); lookup(); } }}>
        <Ico n="wand" size={16} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a user by username or Discord ID" aria-label="Find a user" />
        <button type="button" className="hp-btn gold sm" onClick={() => lookup()}>Look up</button>
      </div>

      {user?.missing && <p className="mx-none">No account matches “{user.missing}”.</p>}

      {u && (
        <section className="mx-user" ref={card} aria-label={`@${u.username}`}>
          <header>
            <span className="mx-av">{u.avatar ? <img src={u.avatar} alt="" /> : (u.name || "?")[0]}</span>
            <div className="mx-id">
              <h3>{u.name}{u.staff && <em>Staff</em>}</h3>
              <small>@{u.username}{u.discord.username ? ` · Discord ${u.discord.username}` : ""}</small>
            </div>
            <span className={`mx-pill ${status[1]}`}>{status[0]}</span>
          </header>

          {(u.banned || u.hidden) && (
            <p className="mx-why">
              {u.banned ? `Restricted ${ago(u.ban.at)}` : `Hidden`}{(u.banned ? u.ban.reason : u.hiddenReason) ? ` · “${u.banned ? u.ban.reason : u.hiddenReason}”` : ""}
            </p>
          )}

          <dl className="mx-facts">
            <div><dt>Discord ID</dt><dd className="mono">{u.id}</dd></div>
            <div><dt>Joined</dt><dd>{date(u.createdAt)}</dd></div>
            <div><dt>Last edited</dt><dd>{ago(u.updatedAt)}</dd></div>
            <div><dt>Username changed</dt><dd>{u.usernameChangedAt ? ago(u.usernameChangedAt) : "Never"}</dd></div>
            <div><dt>Page views</dt><dd>{u.views.toLocaleString()}</dd></div>
            <div><dt>Links and socials</dt><dd>{u.linkCount}</dd></div>
            <div><dt>Templates</dt><dd>{u.templates.length}</dd></div>
            <div><dt>Reports</dt><dd>{u.reports.open} open · {u.reports.total} total</dd></div>
            <div><dt>Shown in Discover</dt><dd>{u.discover ? "Yes" : "No"}</dd></div>
            <div><dt>Search engines</dt><dd>{u.noindex ? "Hidden" : "Allowed"}</dd></div>
            <div><dt>Media</dt><dd>{[u.hasBackground && "Background", u.hasVideo && "Video", u.hasMusic && "Music"].filter(Boolean).join(", ") || "None"}</dd></div>
            <div><dt>Discord Nitro</dt><dd>{u.discord.nitro ? "Yes" : "No"}</dd></div>
          </dl>

          {(u.tagline || u.bio) && <blockquote className="mx-bio">{u.tagline && <b>{u.tagline}</b>}{u.bio}</blockquote>}

          {u.links.length > 0 && (
            <div className="mx-blk"><h4>Links on the page</h4>
              <ul className="mx-links">{u.links.map((l, i) => <li key={i}><b>{l.label || "Link"}</b><span>{l.url}</span></li>)}</ul>
            </div>
          )}

          {u.templates.length > 0 && (
            <div className="mx-blk"><h4>Published templates</h4>
              <ul className="mx-links">{u.templates.map((t) => (
                <li key={t.id}><b>{t.name}</b><span>{ago(t.at)}</span>
                  <button type="button" className="mx-lnk bad" disabled={busy} onClick={() => sure(`Delete the template “${t.name}”?`) && act({ action: "delete-template", id: t.id }, "Template deleted", () => lookup(u.username))}>Delete</button></li>
              ))}</ul>
            </div>
          )}

          {u.reports.recent.length > 0 && (
            <div className="mx-blk"><h4>Report history</h4>
              <ul className="mx-links">{u.reports.recent.map((r, i) => (
                <li key={i}><b>{r.reason}</b><span>{r.details || "No details"} · {ago(r.at)}</span><i className={`mx-st ${r.status}`}>{r.status}</i></li>
              ))}</ul>
            </div>
          )}

          <footer className="mx-acts">
            {u.staff ? <p className="mx-note">Staff accounts can't be hidden or restricted here. Remove their staff role in Discord first.</p> : (
              <>
                {!u.hidden && !u.banned && <input value={why} onChange={(e) => setWhy(e.target.value)} maxLength={120} placeholder="Reason (optional, shown to the owner)" aria-label="Reason" />}
                <a className="hp-ghost sm" href={`/${u.username}`} target="_blank" rel="noreferrer"><Ico n="external" size={13} /> Open page</a>
                {u.banned
                  ? <button type="button" className="hp-btn sm" disabled={busy} onClick={() => act({ action: "unban", username: u.username }, "Account unrestricted", () => lookup(u.username))}>Lift restriction</button>
                  : <>
                    {u.hidden
                      ? <button type="button" className="hp-btn sm" disabled={busy} onClick={() => act({ action: "unhide", username: u.username }, "Page is visible again", () => lookup(u.username))}>Unhide page</button>
                      : <button type="button" className="hp-ghost sm" disabled={busy} onClick={() => act({ action: "hide", username: u.username, reason: why }, "Page hidden", () => lookup(u.username))}>Hide page</button>}
                    <button type="button" className="hp-ghost sm bad" disabled={busy} onClick={() => sure(`Restrict @${u.username}? Their page is hidden and they can't save changes.`) && act({ action: "ban", username: u.username, reason: why }, "Account restricted", () => lookup(u.username))}>Restrict</button>
                  </>}
              </>
            )}
          </footer>
        </section>
      )}

      <section className="mx-sec">
        <h3>Report queue</h3>
        {data.reports.length === 0 ? <p className="mx-empty"><Ico n="check" size={16} /> Nothing waiting. All reports are handled.</p> : (
          <ul className="mx-q">
            {data.reports.map((g) => (
              <li key={g.key}>
                <div className="mx-qm">
                  <b>{g.type === "template" ? `Template: ${g.name}` : `@${g.target}`}</b>
                  <small>{g.count} report{g.count === 1 ? "" : "s"} · {Object.entries(g.reasons).map(([k, v]) => `${k}${v > 1 ? ` ×${v}` : ""}`).join(", ")} · {ago(g.latest)}{g.gone ? " · already removed" : g.hidden ? " · hidden" : ""}</small>
                  {g.details.map((d, i) => <q key={i}>{d}</q>)}
                </div>
                <div className="mx-qa">
                  {g.type === "profile" && !g.gone && <button type="button" className="hp-btn sm" onClick={() => lookup(g.target)}>Review</button>}
                  {g.type === "template" && !g.gone && <button type="button" className="hp-ghost sm bad" disabled={busy} onClick={() => sure(`Delete the template “${g.name}”?`) && act({ action: "delete-template", id: g.target }, "Template deleted")}>Delete</button>}
                  <button type="button" className="hp-ghost sm" disabled={busy} onClick={() => act({ action: "dismiss", key: g.key }, "Dismissed")}>Dismiss</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mx-sec">
        <div className="mx-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "log"} className={tab === "log" ? "on" : ""} onClick={() => setTab("log")}>Recent actions</button>
          <button type="button" role="tab" aria-selected={tab === "err"} className={tab === "err" ? "on" : ""} onClick={() => setTab("err")}>Errors{s.errors ? ` (${s.errors})` : ""}</button>
          <button type="button" className="mx-lnk" onClick={load} aria-label="Refresh"><Ico n="refresh" size={13} /> Refresh</button>
        </div>
        {tab === "log"
          ? (data.log.length ? <ul className="mx-ev">{data.log.map((l, i) => <li key={i}><b>{l.action}</b><span>{l.what}</span><time>{ago(l.at)}</time></li>)}</ul> : <p className="mx-empty">No staff actions yet.</p>)
          : (data.errors.length ? <ul className="mx-ev">{data.errors.map((e, i) => <li key={i}><b>{e.where}</b><span>{String(e.message).slice(0, 140)}</span><time>{ago(e.at)}</time></li>)}</ul> : <p className="mx-empty">No errors in the last 7 days.</p>)}
      </section>
    </div>
  );
}
