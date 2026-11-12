"use client";
import ProfileCard from "../ProfileCard";
import { Ico } from "@/lib/icons";
import { applyPreset } from "@/lib/schema";
import SiteNav from "../SiteNav";
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

export default function Landing({ authed = false, invite }) {
  return (
    <main className="lp">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;600;700;800&family=Bricolage+Grotesque:wght@600;800&display=swap" />
      <div className="lp-deco" aria-hidden="true">{DECO.map(([n, x, y, s, r]) => <span key={n} style={{ position: "absolute", left: x, top: y, transform: `rotate(${r}deg)` }}><Ico n={n} size={s} style={{ color: "#e0a243", opacity: 0.07, strokeWidth: 1.2 }} /></span>)}</div>
      <SiteNav active="/" authed={authed} invite={invite} />

      <section className="lp-hero">
        <h1>Everything your page needs, right here.</h1>
        <p>Haven is a link-in-bio page with live Discord status, badges, music and control over every pixel. Free, fast, and yours in under a minute.</p>
        <div className="lp-cta"><a className="lp-b1" href={authed ? "/dashboard" : "/api/auth/login"}>{authed ? "Open dashboard" : "Sign up free"}</a><a className="lp-b2" href="#features">See features</a></div>
      </section>

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
      <section className="lp-final"><h2>Ready to claim your name?</h2><div className="lp-cta"><a className="lp-b1" href="/api/auth/login">Sign up free</a></div></section>
      <footer className="lp-foot">© Haven · havenshq.xyz</footer>
    </main>
  );
}
