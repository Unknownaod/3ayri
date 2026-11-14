import Link from "next/link";

import { Background, Nav, Footer, Star } from "./SiteChrome";
import Avatar from "./Avatar";
import { BRAND, DISCORD_INVITE } from "./site";
import { getAffiliates } from "./affiliates/data";
import { redis } from "@/lib/db";

const TAGLINE = "A friendly community. Find your people and make yourself at home.";

export const metadata = {
  title: `${BRAND} — A Place to Belong`,
  description: TAGLINE,
};

// Rebuilt at most once a minute, so the profile numbers stay fresh without hitting the database on every visit.
export const revalidate = 60;

const ICONS = {
  people: <><circle cx="9" cy="8" r="3.2" /><path d="M3 20c.4-3.4 2.8-5.2 6-5.2s5.6 1.8 6 5.2" /><circle cx="17.2" cy="9" r="2.4" /><path d="M16.5 14.6c2.6.1 4.1 1.6 4.5 4.4" /></>,
  chat: <><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" /><path d="M9 11h6M9 14h3.5" /></>,
  home: <><path d="m3 11 9-7.5 9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" /></>,
};

const FEATURES = [
  ["people", "Find your people", "Meet friendly people and make real connections."],
  ["chat", "Hang out", "Chat, play games and join community events."],
  ["home", "Feel at home", "A welcoming space with friendly moderation."],
];

const fmt = (n) => Number(n || 0).toLocaleString("en-US");

async function getProfileStats() {
  try {
    const s = await redis.stats();
    return s && s.pages > 0 ? s : null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const [affiliates, stats] = await Promise.all([getAffiliates(), getProfileStats()]);
  const featured = affiliates.filter((item) => item.featured).slice(0, 3);

  return (
    <main className="hx">
      <Background />
      <Nav current="home" />

      <section className="hx-hero">
        <div className="hx-hero-banner" aria-hidden="true"><img src="/banner.png" alt="" /></div>

        <div className="hx-wrap hx-hero-grid">
          <div>
            <p className="hx-eyebrow"><i /> Now open</p>
            <h1>Somewhere you can belong.</h1>
            <p className="hx-lede">{TAGLINE}</p>
            <div className="hx-cta">
              <a className="hx-btn solid" href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">Join {BRAND}</a>
              <Link className="hx-btn ghost" href="/affiliates">Meet our affiliates</Link>
            </div>
          </div>

          <div className="hx-art" aria-hidden="true">
            <div className="hx-window"><img src="/logo.png" alt="" /></div>
            <Star className="s1" />
            <Star className="s2" />
          </div>
        </div>
      </section>

      <section className="hx-wrap hx-sec" id="features">
        <div className="hx-feats">
          {FEATURES.map(([icon, title, text]) => (
            <article className="hx-feat" key={title}><div className="hx-feat-in">
              <span className="hx-feat-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[icon]}</svg>
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div></article>
          ))}
        </div>
      </section>

      <section className="hx-wrap hx-sec" id="profiles">
        <div className="hx-profiles">
          <div>
            <h2 className="hx-h2">A page of your own, on {BRAND}.</h2>
            <p className="hx-sub">Build a profile with live Discord status, music and total control over how it looks. Free, and it lives at havenshq.xyz/you.</p>
            <div className="hx-cta">
              <Link className="hx-btn solid" href="/dashboard">Make your page</Link>
              <Link className="hx-btn ghost" href="/dashboard#discover">Browse pages</Link>
            </div>
          </div>

          {stats ? (
            <div>
              <dl className="hx-nums">
                <div><dt>Pages created</dt><dd>{fmt(stats.pages)}</dd></div>
                <div><dt>Views served</dt><dd>{fmt(stats.views)}</dd></div>
                <div><dt>Joined today</dt><dd>{fmt(stats.today)}</dd></div>
              </dl>
              <p className="hx-nums-note">Updated every minute</p>
            </div>
          ) : (
            <div className="hx-window" style={{ justifySelf: "center", width: "min(260px, 100%)" }} aria-hidden="true"><img src="/logo.png" alt="" /></div>
          )}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="hx-wrap hx-sec" id="affiliates">
          <div className="hx-sec-head">
            <div>
              <h2 className="hx-h2">Our affiliates</h2>
              <p className="hx-sub">Communities we're proud to stand beside.</p>
            </div>
            <Link className="hx-link" href="/affiliates">View all</Link>
          </div>

          <div className="hx-partners">
            {featured.map((item) => (
              <Link className="hx-partner" href={`/affiliates/${item.slug}`} key={item.slug} style={{ "--partner-accent": item.accent }}>
                <Avatar name={item.name} logo={item.logo} accent={item.accent} size={56} />
                <span className="hx-partner-copy">
                  <strong>{item.name}</strong>
                  <small>{item.tagline}</small>
                </span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="hx-final">
        <img src="/banner.png" alt="" />
        <h2>Come sit with us.</h2>
        <p>The door is open and the lanterns are lit.</p>
        <div className="hx-cta">
          <a className="hx-btn solid" href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">Join {BRAND}</a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
