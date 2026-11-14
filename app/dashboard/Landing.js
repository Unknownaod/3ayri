"use client";
import { useEffect, useRef, useState } from "react";
import ProfileCard from "../ProfileCard";
import { Ico } from "@/lib/icons";
import { applyPreset } from "@/lib/schema";
import SiteNav from "../SiteNav";
import { calm, TemplatesGallery } from "./Templates";
import "../shell.css";
import "../profiles.css";

const mk = (name, user, preset, extra) => ({
  name, username: user, discordId: "demo", tagline: "", bio: "", badges: [], presence: false, bannerHeight: 0, ...applyPreset(preset), ...extra,
  socials: [{ id: "a", type: "discord", url: "#" }, { id: "b", type: "spotify", url: "#" }, { id: "c", type: "github", url: "#" }],
  links: [{ id: "x", label: "Portfolio", url: "#", icon: "globe" }, { id: "y", label: "Twitch", url: "#", icon: "twitch" }, { id: "z", label: "Shop", url: "#", icon: "bag" }],
});
const PH = [
  mk("Ember", "ember", "Ember", { bio: "late nights, loud music", location: "Toronto", links: [{ id: "x", label: "Latest drop", url: "#", icon: "music" }, { id: "y", label: "Commissions", url: "#", icon: "bag" }] }),
  mk("Nova", "nova", "Neon", { bio: "designer · night owl", avatarShape: "squircle", presence: true }),
  mk("Mika", "mika", "Sakura", { bio: "soft things on the internet", typewriter: false }),
];
const LIVE = { status: "online", custom: "shipping tonight", plat: ["desktop"], acts: [{ kind: "spotify", title: "Midnight City", sub: "M83", start: Date.now() - 70000, end: Date.now() + 130000 }] };
const FEATURES = [
  ["palette", "Change every detail", "Over 140 settings: themes, 23 fonts, gradients, borders, glow, animation, particles, cursors, even your own CSS."],
  ["discord", "Live Discord status", "Show your name, avatar, badges and what you're playing or listening to, updated as it happens."],
  ["music", "Music and media", "A playlist player that takes YouTube links or audio files, video backgrounds, GIFs and Spotify embeds."],
  ["layout", "Arrange it your way", "Drag sections and links into any order. Stack, grid, inline header, banner or none."],
  ["chart", "See what works", "Daily views and clicks on each link, for the last 30 days."],
  ["wand", "Presets to start from", "Eleven finished looks. Pick one, then change anything."],
];
const STEPS = [["Sign in", "One click with Discord. No password."], ["Make it yours", "Pick a preset, then edit with a live preview beside you."], ["Share your link", "havenshq.xyz/yourname goes in every bio."]];
const DECO = [["sparkles", "6%", "12%", 90, -12], ["heart", "88%", "8%", 110, 14], ["star", "22%", "52%", 70, 8], ["music", "74%", "46%", 100, -10], ["bolt", "52%", "6%", 80, 18], ["camera", "93%", "58%", 90, -8]];

function DashMock() {
  return (
    <div className="mk-dash" aria-hidden="true">
      <div className="mk-side"><b><i />Welcome back</b><span className="on">Profile</span><span>Links</span><span>Theme</span><span>Music</span><span>Stats</span></div>
      <div className="mk-main">
        <span>Account overview</span>
        <div className="mk-tiles"><div>Username<b>nova</b></div><div>Views<b>12,847</b></div><div>Clicks<b>3,204</b></div><div>Links<b>9</b></div></div>
        <div className="mk-chart">
          <span>Profile views, last 30 days</span>
          <svg viewBox="0 0 400 150" preserveAspectRatio="none">
            <defs><linearGradient id="lpg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e0a243" stopOpacity=".55" /><stop offset="1" stopColor="#e0a243" stopOpacity="0" /></linearGradient></defs>
            <path d="M0 120 C30 110 50 40 80 40 S130 120 160 100 S210 30 240 50 S290 130 320 90 S370 30 400 60 V150 H0Z" fill="url(#lpg)" />
            <path d="M0 120 C30 110 50 40 80 40 S130 120 160 100 S210 30 240 50 S290 130 320 90 S370 30 400 60" fill="none" stroke="#e0a243" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}



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

  const get = (pg) => fetch(`/api/discover?q=${encodeURIComponent(q)}&sort=${sort}&page=${pg}`, { cache: "no-store" }).then((r) => r.json());

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
            <div className="dc-view" aria-hidden="true"><ProfileCard p={calm(p)} views={p.views} staff={p.staff} preview /></div>
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

export default function Landing({ user = null, invite }) {
  const authed = !!user;
  const [tab, setTab] = useState("overview");
  useEffect(() => { if (location.hash === "#discover") setTab("discover"); else if (location.hash === "#templates") setTab("templates"); }, []);
  const pick = (t) => { setTab(t); try { history.replaceState(null, "", t === "overview" ? location.pathname : `#${t}`); } catch {} };
  return (
    <main className="lp">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;600;700;800&family=Bricolage+Grotesque:wght@600;800&display=swap" />
      <div className="lp-deco" aria-hidden="true">{DECO.map(([n, x, y, s, r]) => <span key={n} style={{ position: "absolute", left: x, top: y, transform: `rotate(${r}deg)` }}><Ico n={n} size={s} style={{ color: "#e0a243", opacity: 0.07, strokeWidth: 1.2 }} /></span>)}</div>
      <SiteNav active="/" user={user} invite={invite} />

      <section className="lp-hero">
        <h1>Everything your page needs, right here.</h1>
        <p>Haven is a link-in-bio page with live Discord status, badges, music and control over every pixel. Free, fast, and yours in under a minute.</p>
        <div className="lp-cta"><a className="lp-b1" href={authed ? `/dashboard/${user.username || "me"}` : "/api/auth/login"}>{authed ? "Open dashboard" : "Sign up free"}</a><a className="lp-b2" href="#features">See features</a></div>
      </section>

      <div className="lp-tabs" role="tablist" aria-label="Landing sections">
        <button type="button" role="tab" aria-selected={tab === "overview"} className={tab === "overview" ? "on" : ""} onClick={() => pick("overview")}>Overview</button>
        <button type="button" role="tab" aria-selected={tab === "discover"} className={tab === "discover" ? "on" : ""} onClick={() => pick("discover")}><Ico n="sparkles" size={14} /> Discover</button>
        <button type="button" role="tab" aria-selected={tab === "templates"} className={tab === "templates" ? "on" : ""} onClick={() => pick("templates")}><Ico n="grid" size={14} /> Templates</button>
      </div>

      {tab === "discover" ? <Discover /> : tab === "templates" ? (
        <section className="lp-sec dc" aria-label="Templates"><h2>Templates</h2><p className="lp-sub">Start from a look someone else made. Your name, links and text stay yours.</p><TemplatesGallery mode="public" user={user} /></section>
      ) : (
        <>
      <section className="lp-show" aria-label="Preview of the dashboard and profile pages">
        <DashMock />
        <div className="mk-phones" aria-hidden="true">
          {PH.map((p, i) => <div key={p.name} className={`mk-phone mk-p${i + 1}`}><div><ProfileCard p={p} views={4000 + i * 700} preview livePres={p.presence ? LIVE : null} /></div></div>)}
        </div>
      </section>

      <section id="features" className="lp-sec">
        <h2>Everything you need. Nothing locked.</h2>
        <p className="lp-sub">Every part of your page is an option you can change.</p>
        <div className="lp-grid">{FEATURES.map(([i, t, d]) => <article key={t}><span><Ico n={i} size={20} /></span><h3>{t}</h3><p>{d}</p></article>)}</div>
      </section>
      <section id="how" className="lp-sec">
        <h2>Live in three steps</h2>
        <p className="lp-sub">No setup, no code.</p>
        <div className="lp-steps">{STEPS.map(([t, d], i) => <article key={t}><b>{i + 1}</b><h3>{t}</h3><p>{d}</p></article>)}</div>
      </section>
        </>
      )}

      <section className="lp-final"><h2>Ready to claim your name?</h2><div className="lp-cta"><a className="lp-b1" href="/api/auth/login">Sign up free</a></div></section>
      <footer className="lp-foot">© Haven · havenshq.xyz</footer>
    </main>
  );
}
