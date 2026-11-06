"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const POLL_MS = 30_000;
const SOON_MS = 60 * 60 * 1000;
const PAGE_SIZE = 10;
const ENTRY_PAGE = 48;

const STAFF_ROLES = [
  { id: "1563603827863715915", label: "Founder", className: "founder", title: "Founder" },
  { id: "1563603827855458414", label: "Community Manager", className: "community-manager", title: "Community Manager" },
  { id: "1563603827855458413", label: "Admin", className: "admin", title: "Administrator" },
  { id: "1563603827855458412", label: "Mod", className: "moderator", title: "Moderator" },
  { id: "1563603827855458411", label: "Trial Mod", className: "trial", title: "Trial Moderator" },
];

function getStaffRoles(user) {
  if (!user) return [];
  const assignedIds = new Set([
    ...(Array.isArray(user.roleIds) ? user.roleIds : []),
    ...(Array.isArray(user.roles) ? user.roles.map((role) => role?.id).filter(Boolean) : []),
  ]);
  return STAFF_ROLES.filter((role) => assignedIds.has(role.id));
}

function RoleBadges({ user }) {
  const roles = getStaffRoles(user);
  if (!roles.length) return null;
  return (
    <span className="gw-role-badges" aria-label={roles.map((role) => role.title).join(", ")}>
      {roles.map((role) => (
        <span key={role.id} className={`gw-role-badge is-${role.className}`} title={role.title}>
          {role.label}
        </span>
      ))}
    </span>
  );
}

const FILTERS = [
  ["all", "All"],
  ["live", "Live"],
  ["ended", "Finished"],
];

const SORTS = [
  ["recent", "Recent"],
  ["entries", "Most entries"],
  ["prize", "Prize A–Z"],
];

const ICONS = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  refresh: (
    <>
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </>
  ),
  chevron: <path d="m6 9 6 6 6-6" />,
  users: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  gift: (
    <>
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </>
  ),
  external: (
    <>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </>
  ),
};

function Icon({ name, size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

const pad = (n) => String(n).padStart(2, "0");
const plural = (n, one, many) => `${n.toLocaleString()} ${n === 1 ? one : many}`;
const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

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

function updatedAgo(iso, now) {
  const s = Math.max(0, Math.round((now - Date.parse(iso)) / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  return timeAgo(iso, now);
}

const fullDate = (iso) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function Avatar({ user, size = 24 }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="gw-avatar" src={user.avatar} alt="" width={size} height={size} loading="lazy" />
  );
}

function Person({ user, size = 24 }) {
  return (
    <span className="gw-person">
      <Avatar user={user} size={size} />
      <span className="gw-person-info">
        <span className="gw-person-name">{user.name}</span>
        <RoleBadges user={user} />
      </span>
    </span>
  );
}

function Clock({ endsAt, now }) {
  if (!endsAt) return <span className="gw-clock-note">No end time set</span>;
  const ms = Date.parse(endsAt) - now;
  if (ms <= 0) return <span className="gw-clock-note">Ending now</span>;

  const total = Math.floor(ms / 1000);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const units =
    d > 0 ? [[d, "d"], [h, "h"], [m, "m"]] : h > 0 ? [[h, "h"], [m, "m"], [s, "s"]] : [[m, "m"], [s, "s"]];

  return (
    <time className="gw-digits" dateTime={endsAt}>
      {units.map(([value, unit]) => (
        <span key={unit} className="gw-unit">
          <b className="gw-chrome">{pad(value)}</b>
          {unit}
        </span>
      ))}
    </time>
  );
}

/* Everyone who entered, loaded the first time a giveaway is opened. */
function Entrants({ g }) {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [truncated, setTruncated] = useState(false);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const fetchPage = useCallback(
    async (offset, replace) => {
      setBusy(true);
      try {
        const res = await fetch(`/api/giveaways/${g.id}/entries?offset=${offset}&limit=${ENTRY_PAGE}`, {
          cache: "no-store",
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || "Could not load entrants.");
        setRows((prev) => (replace ? body.entries : [...prev, ...body.entries]));
        setTotal(body.total);
        setHasMore(body.hasMore);
        setTruncated(body.truncated);
        setStatus("ready");
      } catch (e) {
        setMessage(e.message);
        setStatus("error");
      } finally {
        setBusy(false);
      }
    },
    [g.id],
  );

  useEffect(() => {
    fetchPage(0, true);
  }, [fetchPage]);

  const winnerIds = new Set(g.winners.map((w) => w.id));
  const count = total ?? g.entries;

  return (
    <section aria-label="Entrants">
      <div className="gw-entrants-head">
        <h4>Who entered</h4>
        <span>
          {count !== null && count !== undefined ? plural(count, "entrant", "entrants") : ""}
          {status === "ready" && (
            <button type="button" className="gw-linkbtn" onClick={() => fetchPage(0, true)} disabled={busy}>
              Refresh
            </button>
          )}
        </span>
      </div>

      {status === "loading" && (
        <ul className="gw-entrants" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="gw-entrant-skel" />
          ))}
        </ul>
      )}

      {status === "error" && (
        <p className="gw-note">
          {message}{" "}
          <button type="button" className="gw-linkbtn" onClick={() => fetchPage(0, true)}>
            Try again
          </button>
        </p>
      )}

      {status === "ready" && rows.length === 0 && <p className="gw-note">No one has entered yet.</p>}

      {rows.length > 0 && (
        <ul className="gw-entrants">
          {rows.map(({ user, enteredAt, claimed }) => {
            const won = winnerIds.has(user.id);
            return (
              <li
                key={user.id}
                className={`gw-entrant${won ? " is-winner" : ""}`}
                title={enteredAt ? `Entered ${fullDate(enteredAt)}` : undefined}
              >
                <Person user={user} size={28} />
                {won && <em>{claimed ? "Claimed" : "Winner"}</em>}
              </li>
            );
          })}
        </ul>
      )}

      {truncated && (
        <p className="gw-note">
          Showing the first {rows.length.toLocaleString()} of {total.toLocaleString()} entrants.
        </p>
      )}

      {hasMore && (
        <button
          type="button"
          className="gw-btn gw-more"
          onClick={() => fetchPage(rows.length, false)}
          disabled={busy}
        >
          Show more entrants
        </button>
      )}
    </section>
  );
}

/* The expanded body shared by live and finished cards. */
function Details({ g, seen, href }) {
  const host = g.host?.name ?? "our team";
  const drawn = g.winners.length || g.winnerCount;
  const summary = g.ended
    ? `Hosted by ${host}. Ended ${g.endedAt ? fullDate(g.endedAt) : "recently"}${
        g.entries !== null ? ` with ${plural(g.entries, "entry", "entries")}` : ""
      }; ${drawn === 1 ? "1 winner was" : `${drawn.toLocaleString()} winners were`} drawn.`
    : `Hosted by ${host}. ${
        g.winnerCount === 1 ? "1 winner" : `${g.winnerCount.toLocaleString()} winners`
      } will be drawn when the timer ends${g.endsAt ? ` on ${fullDate(g.endsAt)}` : ""}. Enter in our Discord server before then.`;

  return (
    <>
      <p className="gw-summary">{summary}</p>
      {g.description && <p className="gw-desc">{g.description}</p>}

      <div className="gw-detail-grid">
        <div className="gw-detail">
          <span>Host</span>
          <strong>{g.host ? <Person user={g.host} size={22} /> : "Unknown"}</strong>
        </div>
        <div className="gw-detail">
          <span>{g.ended ? "Ended" : "Ends"}</span>
          <strong>{(g.ended ? g.endedAt : g.endsAt) ? fullDate(g.ended ? g.endedAt : g.endsAt) : "Unknown"}</strong>
        </div>
        {g.startedAt && (
          <div className="gw-detail">
            <span>Started</span>
            <strong>{fullDate(g.startedAt)}</strong>
          </div>
        )}
        <div className="gw-detail">
          <span>Winners</span>
          <strong>{g.winnerCount.toLocaleString()}</strong>
        </div>
      </div>

      {g.ended && g.winners.length > 0 && (
        <>
          <p className="gw-panel-label">{g.winners.length === 1 ? "Winner" : "Winners"}</p>
          <div className="gw-chips">
            {g.winners.map((u) => (
              <span key={u.id} className="gw-chip">
                <Person user={u} size={24} />
              </span>
            ))}
          </div>
        </>
      )}

      {seen && <Entrants g={g} />}

      {g.ended && href && (
        <a className="gw-enter gw-enter-sm" href={href} target="_blank" rel="noopener noreferrer">
          Open in Discord
          <Icon name="external" size={14} />
        </a>
      )}
    </>
  );
}

function LiveCard({ g, now, inviteUrl }) {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const panelId = `gw-panel-${g.id}`;
  const href = g.link || inviteUrl;
  const end = Date.parse(g.endsAt);
  const start = Date.parse(g.startedAt);
  const soon = Number.isFinite(end) && end - now > 0 && end - now < SOON_MS;
  const pct =
    Number.isFinite(start) && Number.isFinite(end) && end > start
      ? Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100))
      : null;

  return (
    <li className={`gw-card is-live${soon ? " is-soon" : ""}`}>
      <button
        type="button"
        className="gw-live-head"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          setOpen((o) => !o);
          setSeen(true);
        }}
      >
        <span className="gw-live-main">
          <span className="gw-prize">{g.prize}</span>
          <span className="gw-meta">
            {g.host && (
              <span className="gw-meta-item">
                Hosted by <Person user={g.host} size={22} />
              </span>
            )}
            {g.entries !== null && (
              <span className="gw-meta-item">
                <Icon name="users" size={15} />
                {plural(g.entries, "entry", "entries")}
              </span>
            )}
            <span className="gw-meta-item">
              <Icon name="gift" size={15} />
              {plural(g.winnerCount, "winner", "winners")}
            </span>
          </span>
        </span>
        <span className="gw-clock">
          {soon && <span className="gw-soon">Ending soon</span>}
          <Clock endsAt={g.endsAt} now={now} />
          {g.endsAt && <span className="gw-clock-sub">Ends {fullDate(g.endsAt)}</span>}
        </span>
        <span className="gw-chev">
          <Icon name="chevron" size={15} />
        </span>
      </button>

      {href && (
        <div className="gw-live-foot">
          <a className="gw-enter" href={href} target="_blank" rel="noopener noreferrer">
            Enter in Discord
            <Icon name="external" size={14} />
          </a>
        </div>
      )}

      {pct !== null && (
        <div className="gw-progress" aria-hidden="true">
          <i style={{ "--pct": `${pct}%` }} />
        </div>
      )}

      <div id={panelId} className="gw-panel" hidden={!open}>
        <Details g={g} seen={seen} href={href} />
      </div>
    </li>
  );
}

function EndedCard({ g, now, inviteUrl }) {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const panelId = `gw-panel-${g.id}`;
  const href = g.link || inviteUrl;
  const shown = g.winners.slice(0, 3);
  const more = g.winners.length - 1;

  return (
    <li className="gw-card">
      <button
        type="button"
        className="gw-ended-head"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          setOpen((o) => !o);
          setSeen(true);
        }}
      >
        <span className="gw-ended-main">
          <span className="gw-ended-prize">{g.prize}</span>
          {g.endedAt && <span className="gw-ended-when">Ended {timeAgo(g.endedAt, now)}</span>}
        </span>
        <span className="gw-ended-win">
          {shown.length > 0 ? (
            <>
              <span className="gw-avatars">
                {shown.map((u) => (
                  <Avatar key={u.id} user={u} size={28} />
                ))}
              </span>
              <span className="gw-stack-name">
                <span>{g.winners[0].name}</span>
                <RoleBadges user={g.winners[0]} />
                {more > 0 ? ` and ${more} more` : ""}
              </span>
            </>
          ) : (
            <span className="gw-muted">No winners recorded</span>
          )}
        </span>
        <span className="gw-ended-entries">
          {g.entries !== null ? plural(g.entries, "entry", "entries") : ""}
        </span>
        <span className="gw-chev">
          <Icon name="chevron" size={15} />
        </span>
      </button>

      <div id={panelId} className="gw-panel" hidden={!open}>
        <Details g={g} seen={seen} href={href} />
      </div>
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

export default function GiveawaysClient({ brand, inviteUrl }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("recent");
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const now = useNow();

  const load = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const res = await fetch("/api/giveaways", { cache: "no-store" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Could not load giveaways.");
      setData(body);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      if (manual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, POLL_MS);
    return () => clearInterval(t);
  }, [load]);

  // Restore search, filter and sort from the URL, then keep the URL in sync.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const f = p.get("filter");
    const s = p.get("sort");
    if (FILTERS.some(([k]) => k === f)) setFilter(f);
    if (SORTS.some(([k]) => k === s)) setSort(s);
    setQ(p.get("q") ?? "");
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (filter !== "all") p.set("filter", filter);
    if (sort !== "recent") p.set("sort", sort);
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [q, filter, sort, ready]);

  const needle = q.trim().toLowerCase();

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [needle, filter, sort]);

  const { live, ended } = useMemo(() => {
    const hit = (g) =>
      !needle ||
      [g.prize, g.host?.name, g.host?.username, ...g.winners.flatMap((w) => [w.name, w.username])].some(
        (v) => v && v.toLowerCase().includes(needle),
      );
    const by = (isLive) => (a, b) => {
      if (sort === "entries") return (b.entries ?? -1) - (a.entries ?? -1);
      if (sort === "prize") return a.prize.localeCompare(b.prize);
      return isLive
        ? (Date.parse(a.endsAt) || Infinity) - (Date.parse(b.endsAt) || Infinity)
        : (Date.parse(b.endedAt) || 0) - (Date.parse(a.endedAt) || 0);
    };
    return {
      live: (data?.live ?? []).filter(hit).sort(by(true)),
      ended: (data?.ended ?? []).filter(hit).sort(by(false)),
    };
  }, [data, needle, sort]);

  const totalEntries = useMemo(() => {
    const known = [...(data?.live ?? []), ...(data?.ended ?? [])].filter((g) => g.entries !== null);
    return known.length ? known.reduce((n, g) => n + g.entries, 0) : null;
  }, [data]);

  const showLive = filter !== "ended" && live.length > 0;
  const showEnded = filter !== "live" && ended.length > 0;
  const nothing = !showLive && !showEnded;
  const partial = data ? data.totalEnded > data.ended.length : false;
  const liveTotal = data?.live.length ?? 0;
  const counts = { all: liveTotal + (data?.totalEnded ?? 0), live: liveTotal, ended: data?.totalEnded ?? 0 };

  const clearAll = () => {
    setQ("");
    setFilter("all");
  };

  return (
    <div className="gw">
      <header className="gw-head">
        <div className="gw-head-copy">
          <h1 className="gw-title gw-chrome">Giveaways</h1>
          <p className="gw-lede">
            Every giveaway running in the {brand} community, all in one place. Follow the countdowns, look back at
            past winners, and click any giveaway to see exactly who entered. Entries happen in our Discord server.
          </p>
        </div>

        {data && (
          <div className="gw-stats">
            <div className="gw-stat">
              <span className="gw-stat-icon">
                <Icon name="gift" size={18} />
              </span>
              <div>
                <strong>{liveTotal}</strong>
                <span>Live now</span>
              </div>
            </div>
            <div className="gw-stat">
              <span className="gw-stat-icon">
                <Icon name="clock" size={18} />
              </span>
              <div>
                <strong>{data.totalEnded.toLocaleString()}</strong>
                <span>Finished</span>
              </div>
            </div>
            {totalEntries !== null && (
              <div className="gw-stat">
                <span className="gw-stat-icon">
                  <Icon name="users" size={18} />
                </span>
                <div>
                  <strong>
                    {totalEntries.toLocaleString()}
                    {partial ? "+" : ""}
                  </strong>
                  <span>Total entries</span>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      {error && (
        <div className="gw-error" role="alert">
          <p>
            <strong>Giveaways didn’t load.</strong> {error}
          </p>
          <button type="button" className="gw-btn" onClick={() => load(true)}>
            Try again
          </button>
        </div>
      )}

      {!data && !error && <Skeleton />}

      {data && (
        <>
          <div className="gw-controls">
            <label className="gw-search">
              <Icon name="search" size={17} />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search prizes, hosts, or winners"
                aria-label="Search giveaways"
              />
              {q && (
                <button type="button" className="gw-search-clear" onClick={() => setQ("")} aria-label="Clear search">
                  ×
                </button>
              )}
            </label>
            <label className="gw-sort">
              <span>Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                {SORTS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="gw-toolbar">
            <div className="gw-filters" role="group" aria-label="Filter giveaways">
              {FILTERS.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`gw-pill${filter === value ? " is-active" : ""}`}
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                >
                  {label}
                  <span className="gw-pill-count">{counts[value]}</span>
                </button>
              ))}
            </div>
            <div className="gw-sync">
              <span>Updated {updatedAgo(data.updatedAt, now)}</span>
              <button
                type="button"
                className="gw-refresh"
                onClick={() => load(true)}
                disabled={refreshing}
                aria-label="Refresh giveaways"
              >
                <Icon name="refresh" size={15} />
              </button>
            </div>
          </div>

          {showLive && (
            <section className="gw-section" aria-labelledby="gw-live-h">
              <div className="gw-section-head">
                <h2 id="gw-live-h">
                  <span className="gw-dot" aria-hidden="true" />
                  Running now
                </h2>
                <span className="gw-section-count">{live.length} live</span>
              </div>
              <ul className="gw-list">
                {live.map((g) => (
                  <LiveCard key={g.id} g={g} now={now} inviteUrl={inviteUrl} />
                ))}
              </ul>
            </section>
          )}

          {showEnded && (
            <section className="gw-section" aria-labelledby="gw-ended-h">
              <div className="gw-section-head">
                <h2 id="gw-ended-h">Finished</h2>
                <span className="gw-section-count">
                  {Math.min(visible, ended.length)} of {ended.length}
                </span>
              </div>
              <ul className="gw-list">
                {ended.slice(0, visible).map((g) => (
                  <EndedCard key={g.id} g={g} now={now} inviteUrl={inviteUrl} />
                ))}
              </ul>
              {visible < ended.length && (
                <button type="button" className="gw-btn gw-more" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                  Show more
                </button>
              )}
            </section>
          )}

          {nothing && (
            <div className="gw-empty">
              <span className="gw-empty-icon">
                <Icon name={needle ? "search" : "gift"} size={22} />
              </span>
              {needle ? (
                <>
                  <h3>No giveaways match your search</h3>
                  <p>Try a different prize, host, or winner name.</p>
                  <button type="button" className="gw-btn" onClick={clearAll}>
                    Clear search
                  </button>
                </>
              ) : filter === "live" ? (
                <>
                  <h3>Nothing is running right now</h3>
                  <p>New giveaways are posted in our Discord server.</p>
                  {inviteUrl && (
                    <a className="gw-btn" href={inviteUrl} target="_blank" rel="noopener noreferrer">
                      Join our Discord
                    </a>
                  )}
                </>
              ) : filter === "ended" ? (
                <>
                  <h3>No finished giveaways yet</h3>
                  <p>Winners show up here once a giveaway ends.</p>
                </>
              ) : (
                <>
                  <h3>No giveaways yet</h3>
                  <p>Giveaways appear here as soon as one is posted in our Discord server.</p>
                  {inviteUrl && (
                    <a className="gw-btn" href={inviteUrl} target="_blank" rel="noopener noreferrer">
                      Join our Discord
                    </a>
                  )}
                </>
              )}
            </div>
          )}

          <section className="gw-how" aria-labelledby="gw-how-h">
            <h2 id="gw-how-h">How giveaways work</h2>
            <ol className="gw-steps">
              <li className="gw-step">
                <span className="gw-step-n">1</span>
                <h3>Join the server</h3>
                <p>Giveaways run in our Discord community. Join to see what’s live and take part.</p>
              </li>
              <li className="gw-step">
                <span className="gw-step-n">2</span>
                <h3>Enter before the timer ends</h3>
                <p>Enter on the giveaway message in Discord. Every entry shows up on this page.</p>
              </li>
              <li className="gw-step">
                <span className="gw-step-n">3</span>
                <h3>Claim your prize</h3>
                <p>Winners are drawn when time runs out and have a limited window to claim, so keep an eye on Discord.</p>
              </li>
            </ol>
            {inviteUrl && (
              <a className="gw-btn gw-how-cta" href={inviteUrl} target="_blank" rel="noopener noreferrer">
                Join {brand} on Discord
              </a>
            )}
          </section>
        </>
      )}
    </div>
  );
}
