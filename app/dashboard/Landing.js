"use client";
import ProfileCard from "../ProfileCard";
import { Ico } from "@/lib/icons";
import "../shell.css";
import "../profiles.css";

const DEMO = {
  name: "Nova", username: "nova", discordId: "demo", tagline: "make something beautiful", bio: "designer · night owl · building things on the internet", location: "Lisbon", badges: ["👑 Founder"],
  accent: "#e0a243", accent2: "#fff1c9", theme: "midnight", font: "bricolage", border: "animated", nameEffect: "shimmer", particles: "stars", linkStyle: "glass", linkShape: "pill", radius: 26, cardOpacity: 55, blur: 18,
  avatarAnim: "ring", presence: true, tilt: true, bgGradient: true, bgColor: "#0d0a08", bgColor2: "#2b1a06", badgePlacement: "both", typewriter: true,
  discord: { username: "nova", displayName: "Nova", flags: 4 | 64 | 16384 | 4194304, nitro: true },
  socials: [{ id: "a", type: "discord", url: "#" }, { id: "b", type: "spotify", url: "#" }, { id: "c", type: "instagram", url: "#" }, { id: "d", type: "github", url: "#" }],
  links: [{ id: "x", label: "My portfolio", url: "#", icon: "globe" }, { id: "y", label: "Watch on Twitch", url: "#", icon: "twitch", badge: "LIVE" }],
};
const LIVE = { status: "online", custom: "shipping tonight", plat: ["desktop"], acts: [{ kind: "spotify", title: "Midnight City", sub: "M83", sub2: "Hurry Up, We're Dreaming", art: null, start: Date.now() - 70000, end: Date.now() + 130000 }] };
const FEATURES = [
  ["palette", "Change every detail", "Over 140 settings: themes, 23 fonts, gradients, borders, glow, animation, particles, cursors, even your own CSS."],
  ["discord", "Live Discord status", "Show your name, avatar, badges and what you're playing or listening to, updated as it happens."],
  ["music", "Music and media", "A playlist player in four styles, video backgrounds, GIFs, YouTube and Spotify embeds."],
  ["layout", "Arrange it your way", "Drag sections and links into any order. Stack, grid, inline header, banner or none."],
  ["chart", "See what works", "Daily views and clicks on each link, for the last 30 days."],
  ["wand", "Presets to start from", "Eleven finished looks. Pick one, then change anything."],
];
const STEPS = [["Sign in", "One click with Discord. No password."], ["Make it yours", "Pick a preset, then edit with a live preview beside you."], ["Share your link", "havenshq.xyz/yourname goes in every bio."]];

export default function Landing() {
  return (
    <main className="lp">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;600;700;800&family=Bricolage+Grotesque:wght@600;800&display=swap" />
      <header className="lp-nav"><b className="lp-logo">Haven</b><a className="hp-btn gold sm" href="/api/auth/login">Log in with Discord</a></header>
      <section className="lp-hero">
        <div>
          <span className="lp-pill">Bio pages, but yours</span>
          <h1>Your corner of the <em>internet</em>, made golden.</h1>
          <p>Build a link-in-bio page with live Discord status, badges, music and control over every pixel. Free, fast, and yours in under a minute.</p>
          <div className="lp-cta"><a className="hp-btn gold big" href="/api/auth/login">Log in with Discord</a><a className="hp-ghost" href="#features">See what's inside</a></div>
          <small>havenshq.xyz/<b>yourname</b></small>
        </div>
        <div className="lp-demo"><ProfileCard p={DEMO} views={12847} preview livePres={LIVE} /></div>
      </section>
      <section id="features" className="lp-sec">
        <h2>Everything you need. <em>Nothing locked.</em></h2>
        <div className="lp-grid">{FEATURES.map(([i, t, d]) => <article key={t}><span><Ico n={i} size={22} /></span><h3>{t}</h3><p>{d}</p></article>)}</div>
      </section>
      <section className="lp-sec">
        <h2>Live in <em>three steps</em></h2>
        <div className="lp-steps">{STEPS.map(([t, d], i) => <article key={t}><b>{i + 1}</b><h3>{t}</h3><p>{d}</p></article>)}</div>
      </section>
      <section className="lp-final"><h2>Ready to claim your name?</h2><a className="hp-btn gold big" href="/api/auth/login">Log in with Discord</a></section>
      <footer className="lp-foot">© Haven · havenshq.xyz</footer>
    </main>
  );
}
