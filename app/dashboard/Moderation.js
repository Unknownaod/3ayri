"use client";
import { useCallback, useEffect, useState } from "react";
import { Ico } from "@/lib/icons";

const ago = (t) => { const m = Math.max(1, Math.round((Date.now() - t) / 60000)); return m < 60 ? `${m}m ago` : m < 1440 ? `${Math.round(m / 60)}h ago` : `${Math.round(m / 1440)}d ago`; };

// Staff-only. The server checks staff on every call, so hiding this tab is only for tidiness.
export function Moderation({ flash }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState("");
  const [who, setWho] = useState("");
  const [found, setFound] = useState(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/mod", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.message || j.error || "Couldn't load.");
      setData(j); setErr("");
    } catch (e) { setErr(e.message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function act(body, ok) {
    setBusy(JSON.stringify(body));
    try {
      const r = await fetch("/api/mod", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) flash(j.message || j.error || "That didn't work.");
      else { flash(ok); await load(); if (found && body.username) lookup(body.username); }
    } finally { setBusy(""); }
  }
  async function lookup(u = who) {
    const name = u.replace(/^@/, "").trim();
    if (!name) return;
    const r = await fetch(`/api/mod?user=${encodeURIComponent(name)}`, { cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    setFound(r.ok ? j : { missing: name });
  }
  const reason = (what) => (typeof window !== "undefined" ? window.prompt(`Reason for ${what} (optional, shown to the owner):`, "") : "");

  if (err) return <p className="empty">{err}</p>;
  if (!data) return <p className="empty">Loading…</p>;

  return (
    <div className="md">
      <section className="sg">
        <h3 className="sg-t">Look up a page</h3>
        <div className="md-find" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); lookup(); } }}>
          <input value={who} onChange={(e) => setWho(e.target.value)} placeholder="username" aria-label="Username to look up" />
          <button type="button" className="hp-btn sm" onClick={() => lookup()}>Look up</button>
        </div>
        {found?.missing && <p className="hint">No page called @{found.missing}.</p>}
        {found && !found.missing && (
          <div className="md-row">
            <div><b>@{found.username}</b><small>{found.hidden ? `Hidden${found.hiddenReason ? `: ${found.hiddenReason}` : ""}` : "Visible"}{found.banned ? " · restricted" : ""}</small></div>
            <div className="md-acts">
              <a className="hp-ghost sm" href={`/${found.username}`} target="_blank" rel="noreferrer">Open</a>
              {found.hidden && !found.banned && <button type="button" className="hp-ghost sm" onClick={() => act({ action: "unhide", username: found.username }, "Page is visible again")}>Unhide</button>}
              {!found.hidden && <button type="button" className="hp-ghost sm" onClick={() => act({ action: "hide", username: found.username, reason: reason("hiding") }, "Page hidden")}>Hide</button>}
              {found.banned
                ? <button type="button" className="hp-ghost sm" onClick={() => act({ action: "unban", username: found.username }, "Account unrestricted")}>Unrestrict</button>
                : <button type="button" className="hp-ghost sm danger" onClick={() => act({ action: "ban", username: found.username, reason: reason("restricting") }, "Account restricted")}>Restrict</button>}
            </div>
          </div>
        )}
        <small className="hint">Hide: the page shows as "not found" and leaves Discover. Restrict: hides the page and stops the owner saving changes or publishing templates.</small>
      </section>

      <section className="sg">
        <h3 className="sg-t">Open reports ({data.reports.length})</h3>
        {data.reports.length === 0 && <p className="empty">No open reports. Nice.</p>}
        {data.reports.map((g) => (
          <div className="md-row" key={g.key}>
            <div>
              <b>{g.type === "template" ? "Template" : "@"}{g.type === "template" ? ` ${g.name}` : g.target}</b>
              <small>{g.count} report{g.count === 1 ? "" : "s"} · {Object.entries(g.reasons).map(([k, v]) => `${k}${v > 1 ? ` ×${v}` : ""}`).join(", ")} · {ago(g.latest)}{g.gone ? " · already removed" : g.hidden ? " · hidden" : ""}</small>
              {g.details.map((d, i) => <q key={i}>{d}</q>)}
            </div>
            <div className="md-acts">
              {!g.gone && (g.type === "profile"
                ? <><a className="hp-ghost sm" href={`/${g.target}`} target="_blank" rel="noreferrer">Open</a>
                  {!g.hidden && <button type="button" className="hp-ghost sm" disabled={!!busy} onClick={() => act({ action: "hide", username: g.target, reason: reason("hiding") }, "Page hidden")}>Hide</button>}
                  <button type="button" className="hp-ghost sm danger" disabled={!!busy} onClick={() => act({ action: "ban", username: g.target, reason: reason("restricting") }, "Account restricted")}>Restrict</button></>
                : <button type="button" className="hp-ghost sm danger" disabled={!!busy} onClick={() => act({ action: "delete-template", id: g.target }, "Template deleted")}>Delete</button>)}
              <button type="button" className="hp-ghost sm" disabled={!!busy} onClick={() => act({ action: "dismiss", key: g.key }, "Dismissed")}>Dismiss</button>
            </div>
          </div>
        ))}
      </section>

      <section className="sg">
        <h3 className="sg-t">Recent actions</h3>
        {data.log.length === 0 ? <p className="empty">Nothing yet.</p> : data.log.map((l, i) => <p className="md-line" key={i}>{l.action} · {l.what} · {ago(l.at)}</p>)}
      </section>

      <section className="sg">
        <h3 className="sg-t">Recent errors ({data.errors.length})</h3>
        {data.errors.length === 0 ? <p className="empty">No errors logged in the last 7 days.</p> : data.errors.map((e, i) => <p className="md-line" key={i}><b>{e.where}</b> · {String(e.message).slice(0, 140)} · {ago(e.at)}</p>)}
        <button type="button" className="hp-ghost sm" onClick={load}><Ico n="refresh" size={13} /> Refresh</button>
      </section>
    </div>
  );
}
