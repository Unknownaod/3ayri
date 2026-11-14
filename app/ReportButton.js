"use client";
import { useState } from "react";
import { Ico } from "@/lib/icons";

const REASONS = ["Impersonation", "Hateful or harassing", "Sexual or graphic content", "Scam or phishing", "Illegal content", "Spam", "Other"];

// Small "Report" button + dialog. type: "profile" (target = username) or "template" (target = template id).
export default function ReportButton({ type = "profile", target, label = "Report", className = "rp-btn", icon = true }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const [state, setState] = useState("idle"); // idle | sending | done
  const [err, setErr] = useState("");

  async function send() {
    setState("sending"); setErr("");
    try {
      const r = await fetch("/api/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, target, reason, details }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) setState("done"); else { setErr(j.message || j.error || "Couldn't send your report. Try again."); setState("idle"); }
    } catch { setErr("Couldn't reach the server. Check your connection and try again."); setState("idle"); }
  }
  const close = () => { setOpen(false); setState("idle"); setErr(""); setDetails(""); };

  return (
    <>
      <button type="button" className={className} onClick={(e) => { e.stopPropagation(); setOpen(true); }} aria-haspopup="dialog">{icon && <Ico n="flag" size={13} />}{label}</button>
      {open && (
        <div className="rp-back" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && close()} onKeyDown={(e) => e.key === "Escape" && close()}>
          <div className="rp-dlg" role="dialog" aria-modal="true" aria-labelledby="rp-t">
            {state === "done" ? (
              <>
                <h3 id="rp-t">Report sent</h3>
                <p>Thanks. Staff will review it. You don't need to do anything else.</p>
                <div className="rp-row"><button type="button" className="rp-go" onClick={close} autoFocus>Close</button></div>
              </>
            ) : (
              <>
                <h3 id="rp-t">Report {type === "template" ? "this template" : `@${target}`}</h3>
                <label className="rp-l">What's wrong?
                  <select value={reason} onChange={(e) => setReason(e.target.value)} autoFocus>{REASONS.map((r) => <option key={r}>{r}</option>)}</select>
                </label>
                <label className="rp-l">Details (optional)
                  <textarea value={details} onChange={(e) => setDetails(e.target.value)} maxLength={400} rows={3} placeholder="Anything that helps staff check it faster" />
                </label>
                {err && <p className="rp-err" role="alert">{err}</p>}
                <div className="rp-row">
                  <button type="button" className="rp-no" onClick={close}>Cancel</button>
                  <button type="button" className="rp-go" onClick={send} disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send report"}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
