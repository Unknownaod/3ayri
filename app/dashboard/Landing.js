"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import ProfileCard from "../ProfileCard";
import { Ico } from "@/lib/icons";
import { applyPreset } from "@/lib/schema";
import SiteNav from "../SiteNav";
import { calm, TemplatesGallery } from "./Templates";
import "../shell.css";
import "../profiles.css";
import "../landing.css";

const LIVE = { status: "online", custom: "shipping tonight", plat: ["desktop"], acts: [{ kind: "spotify", title: "Midnight City", sub: "M83", start: Date.now() - 70000, end: Date.now() + 130000 }] };
export function Discover({ embed = false }) {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("popular");   // popular | new | updated
  const [page, setPage] = useState(0);
  const [more, setMore] = useState(false);
  const [state, setState] = useState("loading");   // loading | ok | error
  const [stamp, setStamp] = useState(0);
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);

  const get = (pg) => fetch(`/api/discover?q=${encodeURIComponent(q)}&sort=${sort}&page=${pg}`, { cache: "no-store" }).then(async (r) => { const j = await r.json().catch(() => null); if (!r.ok || !Array.isArray(j?.profiles)) throw new Error("discover"); return j; });

  useEffect(() => {
    let dead = false;
    setState("loading");
    const t = setTimeout(() => {
      get(page).then((j) => { if (dead) return; setItems((old) => (page ? [...old, ...j.profiles] : j.profiles)); setMore(!!j.more); setState("ok"); setStamp(Date.now()); })
        .catch(() => !dead && setState("error"));
    }, q && page === 0 ? 250 : 0);
    return () => { dead = true; clearTimeout(t); };
  }, [q, sort, page]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the first page current: refresh quietly every 30 s and whenever the tab is shown again (only while viewing the first page).
  useEffect(() => {
    const tick = () => { if (page === 0 && document.visibilityState === "visible") get(0).then((j) => { if (alive.current) { setItems(j.profiles); setMore(!!j.more); setStamp(Date.now()); } }).catch(() => {}); };
    const id = setInterval(tick, 30000); document.addEventListener("visibilitychange", tick);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", tick); };
  }, [q, sort, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const SORTS = [["popular", "Popular"], ["new", "Newest"], ["updated", "Recently updated"]];
  return (
    <section id="discover" className={embed ? "dc dc-embed" : "lp-sec dc"} aria-label="Discover profiles">
      {!embed && <h2>Discover pages</h2>}
      {!embed && <p className="lp-sub">Browse pages made with Haven. Click one to open it.</p>}
      <div className="tp-bar">
        <label className="dc-search"><Ico n="wand" size={15} /><input type="search" value={q} onKeyDown={(e) => e.key === "Enter" && e.preventDefault()} onChange={(e) => { setPage(0); setQ(e.target.value); }} placeholder="Search by name or username" aria-label="Search pages" /></label>
        <div className="seg" role="group" aria-label="Sort">
          {SORTS.map(([k, n]) => <button type="button" key={k} className={sort === k ? "on" : ""} aria-pressed={sort === k} onClick={() => { setPage(0); setSort(k); }}>{n}</button>)}
        </div>
        <span className="dc-live" title={stamp ? `Updated ${new Date(stamp).toLocaleTimeString()}` : ""}><i />Live</span>
      </div>
      {state === "error" && <p className="empty dc-msg">Couldn't load pages. Check your connection and try again.</p>}
      {state === "ok" && items.length === 0 && <p className="empty dc-msg">{q ? `No pages match "${q}".` : "No pages here yet. Be the first one."}</p>}
      <div className="dc-grid">
        {items.map((p) => (
          <div className="dc-card" key={p.username}>
            <div className="dc-view" aria-hidden="true"><ProfileCard p={calm(p)} views={p.views} earned={[...(p.verified ? ["verified"] : []), ...(p.staff ? ["staff"] : [])]} preview /></div>
            <a className="dc-link" href={`/${p.username}`} {...(embed && { target: "_blank", rel: "noopener noreferrer" })} aria-label={`Open ${p.name || p.displayName || p.username}'s page`}><span>View page</span></a>
            <footer><b>{p.name || p.displayName || p.username}</b><small>@{p.username}{p.views ? ` · ${p.views.toLocaleString()} views` : ""}</small></footer>
          </div>
        ))}
        {state === "loading" && Array.from({ length: page ? 3 : 6 }, (_, i) => <div className="dc-card dc-skel" key={`s${i}`} aria-hidden="true" />)}
      </div>
      {more && state === "ok" && <div className="lp-cta"><button type="button" className="lp-b2" onClick={() => setPage(page + 1)}>Show more</button></div>}
    </section>
  );
}


const LOOKS = ["Haven", "Ember", "Neon", "Sakura", "Ocean", "Mono"];
const lum = (hex) => { const h = String(hex || "#e0a243").replace("#", ""); const f = h.length === 3 ? h.replace(/./g, "$&$&") : h; const [r, g, b] = [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16) / 255); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };

// Counts up to a number once it's known (jumps straight there if the person prefers reduced motion).
function Count({ to }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (to == null) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || to < 2) { setN(to); return; }
    let raf, t0;
    const step = (t) => { t0 ??= t; const k = Math.min(1, (t - t0) / 1100); setN(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{to == null ? "–" : n.toLocaleString()}</>;
}
const compact = (n) => (n == null ? null : n);

function Showcase({ onAll }) {
  const [rows, setRows] = useState(null);
  useEffect(() => {
    let dead = false;
    fetch("/api/discover?sort=popular&page=0", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((j) => !dead && setRows(Array.isArray(j?.profiles) ? j.profiles.slice(0, 8) : [])).catch(() => !dead && setRows([]));
    return () => { dead = true; };
  }, []);
  if (rows && rows.length === 0) return null;
  return (
    <section className="hv-sec" aria-label="Pages made on Haven">
      <header className="hv-head">
        <div><h2>Made on Haven</h2><p>Real pages from people who signed up. Open one, or browse them all.</p></div>
        <button type="button" className="hv-btn ghost" onClick={onAll}>Browse all pages</button>
      </header>
      <div className="hv-rail">
        {(rows || Array.from({ length: 5 })).map((p, i) => p ? (
          <div className="dc-card" key={p.username}>
            <div className="dc-view" aria-hidden="true"><ProfileCard p={calm(p)} views={p.views} earned={[...(p.verified ? ["verified"] : []), ...(p.staff ? ["staff"] : [])]} preview /></div>
            <a className="dc-link" href={`/${p.username}`} aria-label={`Open ${p.name || p.displayName || p.username}'s page`}><span>View page</span></a>
            <footer><b>{p.name || p.displayName || p.username}</b><small>@{p.username}{p.views ? ` · ${p.views.toLocaleString()} views` : ""}</small></footer>
          </div>
        ) : <div className="dc-card dc-skel" key={i} aria-hidden="true" />)}
      </div>
    </section>
  );
}

const STEPS = [["Sign in with Discord", "One click. No password, no email form."], ["Make it yours", "Pick a look, then change anything with a live preview next to you."], ["Share your link", "havenshq.xyz/you goes in every bio."]];

export default function Landing({ user = null, invite }) {
  const authed = !!user;
  const [tab, setTab] = useState("overview");
  const [look, setLook] = useState("Haven");
  const [stats, setStats] = useState(null);
  useEffect(() => { if (location.hash === "#discover") setTab("discover"); else if (location.hash === "#templates") setTab("templates"); }, []);
  useEffect(() => { let dead = false; fetch("/api/stats").then((r) => (r.ok ? r.json() : null)).then((j) => !dead && j && setStats(j)).catch(() => {}); return () => { dead = true; }; }, []);
  const pick = (t) => { setTab(t); try { history.replaceState(null, "", t === "overview" ? location.pathname : `#${t}`); } catch {} };

  const demo = useMemo(() => ({ name: "yourname", username: "you", discordId: "demo", tagline: "", bio: "late nights, loud music", location: "Toronto", badges: [], bannerHeight: 0, presence: true, ...applyPreset(look), socials: [{ id: "a", type: "discord", url: "#" }, { id: "b", type: "spotify", url: "#" }, { id: "c", type: "github", url: "#" }], links: [{ id: "x", label: "Latest drop", url: "#", icon: "music" }, { id: "y", label: "Commissions", url: "#", icon: "bag" }, { id: "z", label: "Shop", url: "#", icon: "bag" }] }), [look]);
  const ac = demo.accent || "#e0a243";
  const style = { "--ac": ac, "--ac2": `color-mix(in srgb, ${ac} 55%, #fff)`, "--glow": `color-mix(in srgb, ${ac} 28%, transparent)`, "--on": lum(ac) > 0.5 ? "#15100a" : "#fff" };
  const go = authed ? `/dashboard/${user.username || "me"}` : "/api/auth/login";
  const TILES = [["Pages created", stats?.pages], ["Views served", stats?.views], ["Link clicks", stats?.clicks], ["Joined today", stats?.today]];

  return (
    <main className="lp hv" style={style}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;600;700;800&family=Bricolage+Grotesque:wght@600;800&display=swap" />
      <SiteNav active="/" user={user} invite={invite} />

      <section className="hv-hero">
        <div className="hv-copy">
          <h1>Your corner of the internet, built in a minute.</h1>
          <p>Haven is a link-in-bio page with live Discord status, music, and control over how every pixel looks. Free, and it lives at <b>havenshq.xyz/you</b>.</p>
          <div className="hv-cta">
            <a className="hv-btn solid" href={go}>{authed ? "Open dashboard" : <><Ico n="discord" size={17} /> Create your page</>}</a>
            <button type="button" className="hv-btn ghost" onClick={() => pick("discover")}>Browse pages</button>
          </div>
          <div className="hv-looks" role="group" aria-label="Try a look on the sample page">
            <span>Try a look</span>
            {LOOKS.map((k) => <button type="button" key={k} className={look === k ? "on" : ""} aria-pressed={look === k} onClick={() => setLook(k)}><i style={{ background: applyPreset(k).accent }} />{k}</button>)}
          </div>
        </div>
        <div className="hv-stage" aria-label="Sample Haven page">
          <div className="hv-phone"><div><ProfileCard p={demo} views={12847} preview livePres={LIVE} /></div></div>
        </div>
      </section>

      <section className="hv-stats" aria-label="Haven right now">
        <h2 className="sr">Haven right now</h2>
        <dl>
          {TILES.map(([k, v]) => <div key={k}><dd aria-live="polite"><Count to={compact(v)} /></dd><dt>{k}</dt></div>)}
        </dl>
        <p className="hv-live"><i />Live numbers, updated every minute</p>
      </section>

      <div className="lp-tabs hv-tabs" role="tablist" aria-label="Landing sections">
        <button type="button" role="tab" aria-selected={tab === "overview"} className={tab === "overview" ? "on" : ""} onClick={() => pick("overview")}>Overview</button>
        <button type="button" role="tab" aria-selected={tab === "discover"} className={tab === "discover" ? "on" : ""} onClick={() => pick("discover")}><Ico n="sparkles" size={14} /> Discover</button>
        <button type="button" role="tab" aria-selected={tab === "templates"} className={tab === "templates" ? "on" : ""} onClick={() => pick("templates")}><Ico n="grid" size={14} /> Templates</button>
      </div>

      {tab === "discover" ? <Discover /> : tab === "templates" ? (
        <section className="lp-sec dc" aria-label="Templates"><h2>Templates</h2><p className="lp-sub">Start from a look someone else made. Your name, links and text stay yours.</p><TemplatesGallery mode="public" user={user} /></section>
      ) : (
        <>
          <Showcase onAll={() => pick("discover")} />

          <section id="features" className="hv-sec">
            <header className="hv-head"><div><h2>Everything is an option</h2><p>Nothing is locked behind a plan. Change it, or leave the defaults.</p></div></header>
            <div className="hv-bento">
              <article className="b-live">
                <h3>Live Discord status</h3>
                <p>Your avatar, badges and what you're playing or listening to, updated as it happens.</p>
                <div className="v-status" aria-hidden="true"><span className="dot" /><div><b>Listening to Midnight City</b><small>M83 · 1:12 / 4:03</small><u><s /></u></div></div>
              </article>
              <article className="b-ctl">
                <h3>Over 140 settings</h3>
                <p>Themes, 23 fonts, gradients, glow, borders, particles, cursors, and your own CSS if you want it.</p>
                <div className="v-sw" aria-hidden="true">{["#e0a243", "#ff5d8f", "#46d7c6", "#7c8cff", "#b6ff6a", "#f2f2f2"].map((c) => <i key={c} style={{ background: c }} />)}<em>Aa</em><em className="s">Aa</em><em className="m">Aa</em></div>
              </article>
              <article className="b-mus"><h3>Music and media</h3><p>YouTube links or audio files, video backgrounds, GIFs, Spotify embeds.</p><div className="v-play" aria-hidden="true"><div className="eq"><i /><i /><i /><i /><i /></div><div><b>Midnight City</b><small>M83</small></div><Ico n="play" size={16} /></div></article>
              <article className="b-lay">
                <h3>Arrange it your way</h3><p>Drag links and sections into any order.</p>
                <div className="v-rows" aria-hidden="true"><span><Ico n="grip" size={13} />Portfolio</span><span><Ico n="grip" size={13} />Twitch</span><span><Ico n="grip" size={13} />Shop</span></div>
              </article>
              <article className="b-sta">
                <h3>See what works</h3><p>Views and clicks for each link, last 30 days.</p>
                <div className="v-bars" aria-hidden="true">{[30, 55, 40, 72, 50, 88, 64, 95].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}</div>
              </article>
              <article className="b-tpl">
                <div><h3>Templates from the community</h3><p>Publish your look so others can start from it, or use one someone else made. Only the design is shared, never your name, links or text.</p></div>
                <button type="button" className="hv-btn ghost" onClick={() => pick("templates")}>Browse templates</button>
              </article>
            </div>
          </section>

          <section id="how" className="hv-sec">
            <header className="hv-head"><div><h2>Live in three steps</h2><p>No setup and no code.</p></div></header>
            <ol className="hv-steps">{STEPS.map(([t, d], i) => <li key={t}><b>{i + 1}</b><h3>{t}</h3><p>{d}</p></li>)}</ol>
          </section>
        </>
      )}

      <section className="hv-final">
        <h2>Pick your name before someone else does.</h2>
        <div className="hv-cta"><a className="hv-btn solid lg" href={go}>{authed ? "Open dashboard" : <><Ico n="discord" size={18} /> Create your page</>}</a></div>
      </section>
      <footer className="lp-foot">© Haven · havenshq.xyz · <a href="/terms">Terms</a> · <a href="/privacy">Privacy</a></footer>
    </main>
  );
}
