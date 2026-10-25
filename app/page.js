import Link from "next/link";
import "./globals.css";

import { Background, Nav, Footer } from "./SiteChrome";
import Avatar from "./Avatar";
import { BRAND, DISCORD_INVITE } from "./site";
import { AFFILIATES } from "./affiliates/data";

/*
=========================================================
EDIT THIS COPY
`art` picks the little animated graphic on each feature card:
"chat", "voice", "events", or "shield". `wide` makes the card
span more of the grid.
=========================================================
*/

const TAGLINE = "Welcome to the kingdom.";

const SUBTAGLINE =
  "A Discord community for people who want good company, good chaos, and a place that feels like theirs.";

const ABOUT = [
  `${BRAND} is a Discord community built around good people and good times. Hop in, say hello, find your corner of the server, and make yourself at home.`,
  "Whether you're here to chat, queue up with friends, or just see what's going on, there's a place for you.",
];

const FEATURES = [
  {
    title: "Always active chat",
    text: "Pull up a seat any time of day. There's always someone around to talk to.",
    art: "chat",
    wide: true,
  },
  {
    title: "Voice hangouts",
    text: "Jump into a voice channel with the crew, whether you're gaming or just vibing.",
    art: "voice",
  },
  {
    title: "Events and giveaways",
    text: "Community nights, game sessions, and giveaways run throughout the month.",
    art: "events",
  },
  {
    title: "Run properly",
    text: "Clear rules and active moderators keep the server welcoming for everyone.",
    art: "shield",
    wide: true,
  },
];

export const metadata = {
  title: `${BRAND} | Discord Community`,
  description: SUBTAGLINE,
};

function Art({ kind }) {
  if (kind === "chat") {
    return (
      <div className="art art-chat" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    );
  }

  if (kind === "voice") {
    return (
      <div className="art art-voice" aria-hidden="true">
        {Array.from({ length: 13 }, (_, i) => (
          <span key={i} style={{ "--i": i }} />
        ))}
      </div>
    );
  }

  if (kind === "events") {
    return (
      <div className="art art-events" aria-hidden="true">
        <span />
        <span />
        <span />
        <i>✦</i>
      </div>
    );
  }

  return (
    <svg className="art art-shield" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="shieldGrad" x1="12" y1="6" x2="52" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e9ddff" />
          <stop offset="1" stopColor="#8b3cff" />
        </linearGradient>
      </defs>

      <path
        d="M32 6l22 8v16c0 14-9.5 24.5-22 28C19.5 54.5 10 44 10 30V14z"
        stroke="url(#shieldGrad)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M23 32l6.5 6.5L41 26"
        stroke="url(#shieldGrad)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Home() {
  const featured = AFFILIATES.filter((item) => item.featured).slice(0, 3);

  const ticker = [...FEATURES.map((item) => item.title), `${BRAND} community`];

  return (
    <main className="site">
      <Background />

      <Nav current="home" />

      {/* =====================================================
          HERO
          The banner is masked so every edge dissolves into
          the page, and it drifts slightly with the cursor.
      ===================================================== */}

      <section className="hero">
        <div className="hero-art">
          <img src="/banner.png" alt={`${BRAND}, a crown over a moonlit purple city`} />
        </div>

        <div className="hero-copy">
          <h1>{TAGLINE}</h1>

          <p>{SUBTAGLINE}</p>

          <div className="hero-actions">
            <a className="btn btn-lg" href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
              Join the Discord
            </a>

            <Link className="btn btn-lg btn-ghost" href="/affiliates">
              Our affiliates
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          MARQUEE
      ===================================================== */}

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <div className="marquee-group" key={copy}>
              {ticker.map((word) => (
                <span key={`${copy}-${word}`}>{word}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================
          ABOUT
      ===================================================== */}

      <section className="wrap statement" id="about">
        <h2 className="sr-only">What is {BRAND}?</h2>

        <p className="statement-text reveal">{ABOUT[0]}</p>

        <p className="statement-sub reveal">{ABOUT[1]}</p>
      </section>

      {/* =====================================================
          FEATURES
      ===================================================== */}

      <section className="wrap section" id="features">
        <div className="section-head">
          <h2>What's inside</h2>
          <p>Everything you need to feel at home, all in one server.</p>
        </div>

        <div className="bento reveal">
          {FEATURES.map((item) => (
            <article
              className={`bento-card spot ${item.wide ? "b-wide" : "b-narrow"}`}
              key={item.title}
            >
              <Art kind={item.art} />

              <div className="bento-text">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* =====================================================
          AFFILIATES
      ===================================================== */}

      {featured.length > 0 && (
        <section className="wrap section" id="affiliates">
          <div className="section-head">
            <h2>Our affiliates</h2>
            <p>The servers and creators we stand with.</p>
          </div>

          <div className="mini-grid reveal">
            {featured.map((item) => (
              <Link
                className="mini-card spot"
                href={`/affiliates#${item.slug}`}
                key={item.slug}
                style={{ "--accent": item.accent }}
              >
                <Avatar name={item.name} logo={item.logo} accent={item.accent} size={52} />

                <span className="mini-text">
                  <strong>{item.name}</strong>
                  <small>{item.tagline}</small>
                </span>

                <span className="mini-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            ))}
          </div>

          <div className="section-foot">
            <Link className="btn btn-ghost" href="/affiliates">
              View all affiliates
            </Link>
          </div>
        </section>
      )}

      {/* =====================================================
          JOIN
      ===================================================== */}

      <section className="wrap section" id="join">
        <div className="cta">
          <img className="cta-art" src="/banner.png" alt="" aria-hidden="true" />

          <div className="cta-body">
            <img className="cta-logo" src="/logo.png" alt="" />

            <h2>Take your seat.</h2>

            <p>The door's open. Jump in and say hi.</p>

            <a className="btn btn-lg" href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
              Join the Discord
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
