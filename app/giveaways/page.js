"use client";

import { useCallback, useEffect, useState } from "react";
import "./giveaways.css";

const POLL_MS = 30_000;
const PAGE_SIZE = 10;

const pad = (n) => String(n).padStart(2, "0");
const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function timeAgo(iso, now) {
  const diff = Date.parse(iso) - now;
  const abs = Math.abs(diff);
  const steps = [
    ["year", 31536e6],
    ["month", 2592e6],
    ["week", 6048e5],
    ["day", 864e5],
    ["hour", 36e5],
    ["minute", 6e4],
  ];
  for (const [unit, ms] of steps) {
    if (abs >= ms) return rtf.format(Math.round(diff / ms), unit);
  }
  return "just now";
}

const fullDate = (iso) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

function Clock({ endsAt, now }) {
  if (!endsAt) return <span className="gw-clock-note">No end time set</span>;
  const ms = Date.parse(endsAt) - now;
  if (ms <= 0) return <span className="gw-clock-note">Ending now</span>;

  const total = Math.floor(ms / 1000);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const units = d > 0 ? [[d, "d"], [h, "h"], [m, "m"]] : h > 0 ? [[h, "h"], [m, "m"], [s, "s"]] : [[m, "m"], [s, "s"]];

  return (
    <time className="gw-clock-time" dateTime={endsAt}>
      {units.map(([value, unit]) => (
        <span key={unit} className="gw-unit">
          <b>{pad(value)}</b>
          {unit}
        </span>
      ))}
    </time>
  );
}

function Person({ user, label }) {
  if (!user) return null;
  return (
    <span className="gw-person">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="gw-avatar" src={user.avatar} alt="" width={24} height={24} loading="lazy" />
      <span>
        {label ? `${label} ` : ""}
        {user.name}
      </span>
    </span>
  );
}

function LiveRow({ g, now, inviteUrl }) {
  const href = g.link || inviteUrl;
  return (
    <li className="gw-live">
      <div className="gw-live-main">
        <h3 className="gw-prize">{g.prize}</h3>
        <div className="gw-meta">
          <Person user={g.host} label="Hosted by" />
          {g.entries !== null && <span>{g.entries.toLocaleString()} {g.entries === 1 ? "entry" : "entries"}</span>}
          <span>{g.winnerCount} {g.winnerCount === 1 ? "winner" : "winners"}</span>
        </div>
        {href && (
          <a className="gw-enter" href={href} target="_blank" rel="noopener noreferrer">
            Enter in Discord
          </a>
        )}
      </div>
      <div className="gw-clock">
        <Clock endsAt={g.endsAt} now={now} />
        {g.endsAt && <span className="gw-clock-sub">Ends {fullDate(g.endsAt)}</span>}
      </div>
    </li>
  );
}

function EndedRow({ g, now }) {
  const shown = g.winners.slice(0, 3);
  const extra = g.winners.length - shown.length;
  return (
    <li className="gw-ended-row">
      <div>
        <h3 className="gw-ended-prize">{g.prize}</h3>
        {g.endedAt && (
          <span className="gw-ended-when" title={fullDate(g.endedAt)}>
            Ended {timeAgo(g.endedAt, now)}
          </span>
        )}
      </div>
      <div className="gw-winners">
        {shown.length > 0 ? (
          <>
            {shown.map((u) => (
              <Person key={u.id} user={u} />
            ))}
            {extra > 0 && <span className="gw-ended-when">and {extra} more</span>}
          </>
        ) : (
          <span className="gw-ended-when">No winners recorded</span>
        )}
      </div>
      <span className="gw-ended-entries">
        {g.entries !== null ? `${g.entries.toLocaleString()} ${g.entries === 1 ? "entry" : "entries"}` : ""}
      </span>
    </li>
  );
}

function Skeleton() {
  return (
    <div aria-hidden="true">
      <div className="gw-skel gw-skel-tall" />
      <div className="gw-skel" />
      <div className="gw-skel" />
    </div>
  );
}

export default function GiveawaysPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const now = useNow();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/giveaways");
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Could not load giveaways.");
      setData(body);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, POLL_MS);
    return () => clearInterval(t);
  }, [load]);

  const live = data?.live ?? [];
  const ended = data?.ended ?? [];

  return (
    <main className="gw">
      <div className="gw-wrap">
        <header>
          <h1 className="gw-title">Giveaways</h1>
          <p className="gw-lede">
            {!data
              ? "Loading the latest giveaways."
              : live.length > 0
                ? `${live.length} running right now. Enter in our Discord server before the timer runs out.`
                : "Nothing is running right now. New giveaways are posted in our Discord server."}
          </p>
        </header>

        {error && (
          <div className="gw-error" role="alert">
            <p>
              <strong>Giveaways didn&apos;t load.</strong> {error}
            </p>
            <button className="gw-button" onClick={load}>
              Try again
            </button>
          </div>
        )}

        {!data && !error && <Skeleton />}

        {data && (
          <>
            <section aria-labelledby="gw-live-h" className="gw-section">
              <h2 id="gw-live-h" className="gw-section-title">
                {live.length > 0 && <span className="gw-dot" aria-hidden="true" />}
                Running now
              </h2>
              {live.length > 0 ? (
                <ul className="gw-list">
                  {live.map((g) => (
                    <LiveRow key={g.id} g={g} now={now} inviteUrl={data.inviteUrl} />
                  ))}
                </ul>
              ) : (
                <p className="gw-empty">
                  No live giveaways.{" "}
                  {data.inviteUrl && (
                    <a href={data.inviteUrl} target="_blank" rel="noopener noreferrer">
                      Join our Discord
                    </a>
                  )}{" "}
                  to catch the next one.
                </p>
              )}
            </section>

            <section aria-labelledby="gw-ended-h" className="gw-section">
              <h2 id="gw-ended-h" className="gw-section-title">
                Finished
              </h2>
              {ended.length > 0 ? (
                <>
                  <ul className="gw-list gw-ended-list">
                    {ended.slice(0, visible).map((g) => (
                      <EndedRow key={g.id} g={g} now={now} />
                    ))}
                  </ul>
                  {visible < ended.length && (
                    <button className="gw-button gw-more" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                      Show more
                    </button>
                  )}
                </>
              ) : (
                <p className="gw-empty">Finished giveaways will show up here with their winners.</p>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
