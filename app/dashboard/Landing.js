"use client";
import ProfileCard from "../ProfileCard";
import "../profiles.css";

const DEMO = {
  name: "Nova", username: "nova", discordId: "demo", bio: "designer · night owl · building things on the internet", location: "Lisbon", tagline: "make something beautiful", badges: ["👑 Founder"],
  accent: "#e0a243", accent2: "#fff1c9", theme: "midnight", font: "bricolage", border: "gradient", nameEffect: "shimmer", particles: "stars", linkStyle: "glass", linkShape: "pill", radius: 26, cardOpacity: 55, blur: 18, avatarAnim: "ring", presence: true, tilt: true, bgGradient: true, bgColor: "#0d0a08", bgColor2: "#2b1a06",
  discord: { username: "nova", displayName: "Nova", flags: 4 | 64 | 16384 | 4194304, nitro: true }, badgePlacement: "both",
  socials: [{ type: "discord", url: "#" }, { type: "spotify", url: "#" }, { type: "instagram", url: "#" }, { type: "github", url: "#" }],
  links: [{ label: "My portfolio", url: "#", icon: "" }, { label: "Watch on Twitch", url: "#", icon: "twitch" }],
};
const LIVE = { status: "online", custom: "✨ shipping tonight", act: { kind: "spotify", title: "Midnight City", sub: "M83", art: null, start: Date.now() - 70000, end: Date.now() + 130000 } };
const FEATURES = [
  ["🎨", "Customize everything", "100+ options: themes, fonts, gradients, borders, glow, animations, particles, cursors. Nothing is locked."],
  ["🟢", "Live Discord presence", "Show your real username, display name, avatar and badges, plus what you're playing or listening to right now."],
  ["🎵", "Music & media", "Background video, GIFs, an audio player, and a click-to-enter screen with your own text."],
  ["🔗", "Links & socials", "25+ platforms, grid or list buttons, drag-free reordering and per-link click stats."],
  ["📈", "Built-in analytics", "See profile views and exactly which links get clicked."],
  ["⚡", "One-click presets", "Start from Neon, Sakura, Ember, Matrix, Ocean and more, then tweak every detail."],
];
const STEPS = [["Sign in", "One click with Discord. No passwords."], ["Make it yours", "Pick a preset, then customize with a live preview."], ["Share your link", "havenshq.xyz/yourname — put it in every bio."]];

export default function Landing() {
  return (
    <main className="lp">
      <header className="lp-nav"><b className="lp-logo">Haven</b><a className="hp-btn gold" href="/api/auth/login">Login with Discord</a></header>
      <section className="lp-hero">
        <div>
          <span className="lp-pill">✦ Bio pages, but yours</span>
          <h1>Your corner of the <em>internet</em>, made golden.</h1>
          <p>Build a stunning link-in-bio page with live Discord status, badges, music and total control over every pixel. Free, fast, and yours in under a minute.</p>
          <div className="lp-cta"><a className="hp-btn gold big" href="/api/auth/login">Login with Discord →</a><a className="hp-ghost" href="#features">See what's inside</a></div>
          <small>havenshq.xyz/<b>yourname</b></small>
        </div>
        <div className="lp-demo"><ProfileCard p={DEMO} views={12847} preview livePres={LIVE} /></div>
      </section>
      <section id="features" className="lp-sec">
        <h2>Everything you need. <em>Nothing you don't.</em></h2>
        <div className="lp-grid">{FEATURES.map(([i, t, d]) => <article key={t}><span>{i}</span><h3>{t}</h3><p>{d}</p></article>)}</div>
      </section>
      <section className="lp-sec">
        <h2>Live in <em>three steps</em></h2>
        <div className="lp-steps">{STEPS.map(([t, d], i) => <article key={t}><b>{i + 1}</b><h3>{t}</h3><p>{d}</p></article>)}</div>
      </section>
      <section className="lp-final"><h2>Ready to claim your name?</h2><a className="hp-btn gold big" href="/api/auth/login">Login with Discord →</a></section>
      <footer className="lp-foot">© Haven · havenshq.xyz</footer>
    </main>
  );
}
