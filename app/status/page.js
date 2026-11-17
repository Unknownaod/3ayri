import SiteNav from "../SiteNav";
import Refresh from "./Refresh";
import { current, history, activeParts, overall, uptime, DAYS } from "@/lib/status";
import { SERVER_INVITE } from "@/lib/site";
import "../shell.css";

export const metadata = { title: "Status · Haven", description: "Is Haven up? Live checks and the last 90 days." };
export const dynamic = "force-dynamic";

const BANNER = {
  ok: ["Everything is working", "ok"],
  slow: ["Working, but some parts are slow", "warn"],
  partial: ["Part of Haven is having problems", "bad"],
  major: ["Haven is having problems", "bad"],
};
const WORD = { up: "Working", slow: "Slow", down: "Down" };

const shade = (r) => (!r.n ? "none" : r.down / r.n >= 0.05 ? "bad" : r.down ? "mid" : r.slow ? "warn" : "ok");
const when = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-CA", { month: "short", day: "numeric", timeZone: "UTC" });
const tip = (r) => (!r.n ? `${when(r.d)}: no checks yet` : `${when(r.d)}: ${r.down ? `down for about ${Math.round((r.down / r.n) * 100)}% of checks` : r.slow ? "some slow checks" : "no problems"}`);

export default async function Status() {
  const parts = activeParts();
  const cur = await current();
  const hist = await history(parts.map((p) => p.id));
  const state = overall(Object.fromEntries(parts.map((p) => [p.id, cur.items[p.id] || { s: "up" }])));
  const [msg, tone] = BANNER[state];
  const notice = (process.env.STATUS_NOTICE || "").trim().slice(0, 400);

  return (
    <main className="lp st">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;600;700;800&family=Bricolage+Grotesque:wght@600;800&display=swap" />
      <SiteNav />
      <div className="st-body">
        <h1>Status</h1>
        <div className={`st-banner ${tone}`} role="status">
          <i aria-hidden="true" />
          <div><b>{msg}</b><small>Checked <Refresh at={cur.at} /></small></div>
        </div>
        {notice && <p className="st-notice">{notice}</p>}

        <ul className="st-list">
          {parts.map((p) => {
            const it = cur.items[p.id] || { s: "up", ms: null }, rows = hist[p.id] || [], up = uptime(rows);
            return (
              <li key={p.id} className="st-row">
                <div className="st-head">
                  <div><b>{p.name}</b><small>{p.desc}</small></div>
                  <span className={`st-s ${it.s}`}>{WORD[it.s]}{it.ms && it.s !== "down" ? <em> · {it.ms} ms</em> : null}</span>
                </div>
                <div className="st-bars" role="img" aria-label={`${p.name}, last ${DAYS} days`}>
                  {rows.map((r) => <span key={r.d} className={`st-b ${shade(r)}`} title={tip(r)} />)}
                </div>
                <div className="st-foot"><span>{DAYS} days ago</span><span>{up == null ? "Collecting data" : `${up.toFixed(up >= 99.995 ? 0 : 2)}% working`}</span><span>Today</span></div>
              </li>
            );
          })}
        </ul>

        <p className="st-note">Haven checks itself every minute. History starts the day this page went live. {SERVER_INVITE ? <>Something wrong that isn't listed here? Tell us in <a href={SERVER_INVITE}>the Discord server</a>.</> : null}</p>
        <p className="legal-up"><a href="/">Back to home</a> · <a href="/terms">Terms</a> · <a href="/privacy">Privacy</a></p>
      </div>
    </main>
  );
}
