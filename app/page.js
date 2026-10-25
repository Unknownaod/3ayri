import Link from "next/link";
import "./globals.css";

import { Background, Nav, Footer } from "./SiteChrome";
import Avatar from "./Avatar";
import { BRAND, DISCORD_INVITE } from "./site";
import { AFFILIATES } from "./affiliates/data";

/*
=========================================================
EDIT THIS COPY
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
  },
  {
    title: "Voice hangouts",
    text: "Jump into a voice channel with the crew, whether you're gaming or just vibing.",
  },
  {
    title: "Events and giveaways",
    text: "Community nights, game sessions, and giveaways run throughout the month.",
  },
  {
    title: "Run properly",
    text: "Clear rules and active moderators keep the server welcoming for everyone.",
  },
];

export const metadata = {
  title: `${BRAND} | Discord Community`,
  description: SUBTAGLINE,
};

export default function Home() {
  const featured = AFFILIATES.filter((item) => item.featured).slice(0, 4);

  return (
    <main className="site">
      <Background />

      <Nav current="home" />

      <section className="hero">
        <div className="hero-art">
          <img src="/banner.png" alt={`${BRAND}, a crown over a moonlit purple city`} />
        </div>

        <div className="hero-copy">
          <h1>{TAGLINE}</h1>

          <p>{SUBTAGLINE}</p>

          <div className="hero-actions">
            <a className="btn" href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
              Join the Discord
            </a>

            <Link className="btn btn-ghost" href="/affiliates">
              Our affiliates
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          ABOUT
      ===================================================== */}

      <section className="wrap block" id="about">
        <h2>What is {BRAND}?</h2>

        <div className="block-body prose">
          {ABOUT.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>

      {/* =====================================================
          FEATURES
      ===================================================== */}

      <section className="wrap block" id="features">
        <h2>What's inside</h2>

        <ul className="block-body rows">
          {FEATURES.map((item) => (
            <li className="row" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* =====================================================
          AFFILIATES
      ===================================================== */}

      {featured.length > 0 && (
        <section className="wrap block" id="affiliates">
          <div>
            <h2>Our affiliates</h2>

            <Link className="text-link" href="/affiliates">
              View all <span aria-hidden="true">→</span>
            </Link>
          </div>

          <ul className="block-body rows">
            {featured.map((item) => (
              <li key={item.slug}>
                <Link
                  className="row row-link"
                  href={`/affiliates#${item.slug}`}
                  style={{ "--accent": item.accent }}
                >
                  <Avatar name={item.name} logo={item.logo} accent={item.accent} size={46} />

                  <span className="row-text">
                    <strong>{item.name}</strong>
                    <small>{item.tagline}</small>
                  </span>

                  <span className="row-arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* =====================================================
          JOIN
      ===================================================== */}

      <section className="join" id="join">
        <img className="join-logo" src="/logo.png" alt="" />

        <h2>Take your seat.</h2>

        <p>The door's open. Jump in and say hi.</p>

        <a className="btn" href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
          Join the Discord
        </a>
      </section>

      <Footer />
    </main>
  );
}
