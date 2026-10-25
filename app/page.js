import Link from "next/link";
import "./globals.css";

import { Background, Nav, Footer } from "./SiteChrome";
import Avatar from "./Avatar";
import { BRAND, DISCORD_INVITE } from "./site";
import { AFFILIATES } from "./affiliates/data";

const SUBTAGLINE =
  "A Discord community for good people, late-night conversations, gaming, and a little bit of chaos.";

const FEATURES = [
  {
    number: "01",
    title: "Find your people.",
    text: "Meet new people, join conversations, and find your own corner of the community.",
    label: "COMMUNITY",
  },
  {
    number: "02",
    title: "Pull up and play.",
    text: "Queue into games, jump in voice, or hang out while everyone does their own thing.",
    label: "GAMES & VOICE",
  },
  {
    number: "03",
    title: "There's always something on.",
    text: "Community moments, events, and occasional surprises give everyone a reason to check in.",
    label: "EVENTS",
  },
];

export const metadata = {
  title: `${BRAND} — Find Your People`,
  description: SUBTAGLINE,
};

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4.5 15.5 15 5M6 5h9v9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SmallArrow() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3.5 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Home() {
  const featured = AFFILIATES.filter((item) => item.featured).slice(0, 3);

  return (
    <main className="site redesign">
      <Background />
      <Nav current="home" />

      <section className="opening wrap">
        <div className="opening-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> YOUR PEOPLE ARE HERE</div>
          <h1>Not just<br />another <em>server.</em></h1>
          <p className="opening-description">{SUBTAGLINE}</p>

          <div className="opening-actions">
            <a className="action-primary" href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
              Enter the community <ArrowUpRight />
            </a>
            <Link className="action-secondary" href="/affiliates">
              Meet our affiliates <SmallArrow />
            </Link>
          </div>

          <div className="opening-note">
            <span className="note-mark">✳</span>
            <span><strong>Made for the people.</strong><br />Stay for the moments.</span>
          </div>
        </div>

        <div className="opening-visual">
          <div className="visual-topline">
            <span>3AYRI / COMMUNITY</span>
            <span>EST. ONLINE</span>
          </div>
          <div className="poster">
            <img src="/banner.png" alt={`${BRAND} community artwork`} />
            <div className="poster-shade" />
            <div className="poster-stamp">THE<br />KINGDOM<br /><b>✳</b></div>
            <div className="poster-bottom">
              <span>GOOD PEOPLE. GOOD CHAOS.</span>
              <span>SCROLL TO EXPLORE ↓</span>
            </div>
          </div>
          <div className="visual-caption">
            <span className="caption-line" />
            <span>A place to make it your own.</span>
          </div>
        </div>

        <div className="opening-index" aria-hidden="true">01 — 04</div>
      </section>

      <section className="manifesto">
        <div className="wrap manifesto-inner">
          <p className="section-kicker">THE IDEA IS SIMPLE <span> / 01</span></p>
          <div className="manifesto-copy">
            <h2>A server feels different when the <span>people do.</span></h2>
            <p>
              {BRAND} is a Discord community built around good company and shared
              moments. Drop in to talk, find people to play with, or just see
              where the conversation takes you. No big pitch — just a place to belong.
            </p>
          </div>
          <div className="manifesto-symbol" aria-hidden="true">✳</div>
        </div>
      </section>

      <section className="wrap experience" id="features">
        <div className="section-heading">
          <div>
            <p className="section-kicker">WHAT YOU'LL FIND <span> / 02</span></p>
            <h2>Your kind of<br /><em>place.</em></h2>
          </div>
          <p className="section-intro">Come for one reason. Find a few more.</p>
        </div>

        <div className="experience-list">
          {FEATURES.map((feature) => (
            <article className="experience-row" key={feature.number}>
              <span className="experience-number">{feature.number}</span>
              <div className="experience-main">
                <span className="experience-label">{feature.label}</span>
                <h3>{feature.title}</h3>
              </div>
              <p className="experience-description">{feature.text}</p>
              <span className="experience-arrow" aria-hidden="true"><ArrowUpRight /></span>
            </article>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="partners" id="affiliates">
          <div className="wrap partners-inner">
            <div className="partners-heading">
              <div>
                <p className="section-kicker">GOOD COMPANY KNOWS GOOD COMPANY <span> / 03</span></p>
                <h2>In our<br /><em>orbit.</em></h2>
              </div>
              <Link className="text-link" href="/affiliates">
                All affiliates <SmallArrow />
              </Link>
            </div>

            <div className="partner-list">
              {featured.map((item, index) => (
                <Link
                  className="partner-row"
                  href={`/affiliates#${item.slug}`}
                  key={item.slug}
                  style={{ "--partner-accent": item.accent }}
                >
                  <span className="partner-index">0{index + 1}</span>
                  <Avatar name={item.name} logo={item.logo} accent={item.accent} size={54} />
                  <span className="partner-copy">
                    <strong>{item.name}</strong>
                    <small>{item.tagline}</small>
                  </span>
                  <span className="partner-arrow"><ArrowUpRight /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="wrap final-call" id="join">
        <div className="final-call-index">04 / YOUR NEXT MOVE</div>
        <div className="final-call-content">
          <p className="section-kicker">THE DOOR IS OPEN</p>
          <h2>Come as you are.<br /><em>Stay a while.</em></h2>
          <p>Good people, open conversations, and room to make the place yours.</p>
          <a className="action-dark" href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
            Join {BRAND} <ArrowUpRight />
          </a>
        </div>
        <img className="final-call-logo" src="/logo.png" alt="" aria-hidden="true" />
        <div className="final-call-bottom"><span>3AYRI COMMUNITY</span><span>SEE YOU INSIDE ↗</span></div>
      </section>

      <Footer />
    </main>
  );
}
