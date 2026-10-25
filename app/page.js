import Link from "next/link";
import "./globals.css";

import { Background, Nav, Footer } from "./SiteChrome";
import Avatar from "./Avatar";
import { BRAND, DISCORD_INVITE } from "./site";
import { AFFILIATES } from "./affiliates/data";

const SUBTAGLINE =
  "A Discord community for good people, late-night conversations, gaming, and a little bit of chaos.";

export const metadata = {
  title: `${BRAND} — Find Your People`,
  description: SUBTAGLINE,
};

const CHANNELS = ["welcome", "introductions", "general", "game-night", "memes"];
const VOICE = ["Late-night lounge", "Game room"];

const MESSAGES = [
  { name: "Mika", hue: "#7f83ff", text: "anyone up for a round after dinner?" },
  { name: "Jo", hue: "#6fe3b5", text: "I’m in. Hop in the lounge when you’re ready." },
  { name: "Sol", hue: "#ffb84d", text: "just found this place. hi all 👋" },
  { name: "Mika", hue: "#7f83ff", text: "welcome Sol! grab a seat, we don’t bite much" },
];

const FAQ = [
  {
    q: "Do I need to play games to join?",
    a: "No. Games are a big part of the server, but plenty of people come just to talk, hang out in voice, or see what’s going on.",
  },
  {
    q: "How do I join?",
    a: "Select Join the Discord and the invite opens in Discord. If you don’t have an account yet, Discord walks you through making one.",
  },
  {
    q: "What are affiliates?",
    a: "Communities and creators we know and like. You can browse them all on the affiliates page.",
  },
];

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4.5 15.5 15 5M6 5h9v9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SmallArrow() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M3.5 10h12m-5-5 5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Home() {
  const featured = AFFILIATES.filter((item) => item.featured).slice(0, 3);

  return (
    <main className="site redesign">
      <Background />
      <Nav current="home" />

      {/* Hero */}
      <section className="hero wrap">
        <div className="hero-copy">
          <p className="pill">
            <span className="live-dot" /> Your people are here
          </p>
          <h1>Not just another server.</h1>
          <p className="hero-sub">{SUBTAGLINE}</p>

          <div className="hero-actions">
            <a
              className="btn-lantern"
              href={DISCORD_INVITE}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join the Discord <ArrowUpRight />
            </a>
            <Link className="btn-ghost" href="/affiliates">
              Meet our affiliates <SmallArrow />
            </Link>
          </div>
          <p className="hero-fine">Opens in Discord. Come as you are.</p>
        </div>

        <div className="hero-visual" aria-label={`Preview of the ${BRAND} server`}>
          <div className="mock">
            <aside className="mock-side">
              <div className="mock-server">
                <img src="/logo.png" alt="" />
                <strong>{BRAND}</strong>
              </div>
              <p className="mock-group">Text channels</p>
              <ul>
                {CHANNELS.map((c) => (
                  <li key={c} className={c === "general" ? "on" : ""}>
                    <span>#</span> {c}
                  </li>
                ))}
              </ul>
              <p className="mock-group">Voice</p>
              <ul>
                {VOICE.map((c) => (
                  <li key={c}>
                    <span>🔊</span> {c}
                  </li>
                ))}
              </ul>
            </aside>

            <div className="mock-chat">
              <div className="mock-head">
                <span>#</span> general
              </div>
              <div className="mock-feed">
                {MESSAGES.map((m, i) => (
                  <div
                    className="msg"
                    key={i}
                    style={{ "--d": `${0.5 + i * 0.9}s` }}
                  >
                    <span className="msg-av" style={{ background: m.hue }}>
                      {m.name[0]}
                    </span>
                    <div>
                      <b style={{ color: m.hue }}>{m.name}</b>
                      <p>{m.text}</p>
                    </div>
                  </div>
                ))}
                <p className="typing" style={{ "--d": "4.2s" }}>
                  <i /> <i /> <i /> Jo is typing
                </p>
              </div>
            </div>
          </div>
          <img className="hero-banner" src="/banner.png" alt={`${BRAND} community artwork`} />
        </div>
      </section>

      {/* What you'll find */}
      <section className="wrap section" id="features">
        <h2 className="section-title">Come for one reason. Find a few more.</h2>

        <div className="bento">
          <article className="tile tile-tall">
            <h3>Find your people</h3>
            <p>
              Meet new people, join conversations, and find your own corner of
              the community. Everyone starts as a stranger and most don’t stay
              one for long.
            </p>
            <div className="bubbles" aria-hidden="true">
              <span>what are you playing lately?</span>
              <span className="r">honestly? too many things</span>
              <span>same. let’s fix that tonight</span>
            </div>
          </article>

          <article className="tile">
            <h3>Pull up and play</h3>
            <p>
              Queue into games, jump in voice, or hang out while everyone does
              their own thing.
            </p>
            <div className="voice-row" aria-hidden="true">
              {["#7f83ff", "#6fe3b5", "#ffb84d", "#ff7eb6"].map((c, i) => (
                <span key={c} style={{ background: c, "--i": i }} />
              ))}
              <em>In the lounge</em>
            </div>
          </article>

          <article className="tile tile-warm">
            <h3>There’s always something on</h3>
            <p>
              Community moments, events, and occasional surprises give everyone
              a reason to check in.
            </p>
            <div className="chips" aria-hidden="true">
              <span>Game nights</span>
              <span>Movie nights</span>
              <span>Late chats</span>
              <span>Surprises</span>
            </div>
          </article>
        </div>
      </section>

      {/* Idea */}
      <section className="manifesto">
        <div className="wrap manifesto-inner">
          <h2>A server feels different when the people do.</h2>
          <p>
            {BRAND} is a Discord community built around good company and shared
            moments. Drop in to talk, find people to play with, or just see
            where the conversation takes you. No big pitch, just a place to
            belong.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="wrap section" id="how">
        <h2 className="section-title">Getting in takes a minute.</h2>
        <ol className="steps">
          <li>
            <span>1</span>
            <h3>Join the server</h3>
            <p>Select the invite and Discord opens. No account yet? Discord will help you make one.</p>
          </li>
          <li>
            <span>2</span>
            <h3>Say hi in #introductions</h3>
            <p>Tell us what you play or what you’re into. Someone will answer.</p>
          </li>
          <li>
            <span>3</span>
            <h3>Find your corner</h3>
            <p>Browse the channels that fit you, then drop into voice whenever you feel like it.</p>
          </li>
        </ol>
      </section>

      {/* Affiliates */}
      {featured.length > 0 && (
        <section className="partners" id="affiliates">
          <div className="wrap">
            <div className="partners-heading">
              <h2 className="section-title">Good company knows good company.</h2>
              <Link className="text-link" href="/affiliates">
                All affiliates <SmallArrow />
              </Link>
            </div>

            <div className="partner-list">
              {featured.map((item) => (
                <Link
                  className="partner-row"
                  href={`/affiliates#${item.slug}`}
                  key={item.slug}
                  style={{ "--partner-accent": item.accent }}
                >
                  <Avatar
                    name={item.name}
                    logo={item.logo}
                    accent={item.accent}
                    size={54}
                  />
                  <span className="partner-copy">
                    <strong>{item.name}</strong>
                    <small>{item.tagline}</small>
                  </span>
                  <span className="partner-arrow">
                    <ArrowUpRight />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="wrap section faq" id="faq">
        <h2 className="section-title">Before you jump in</h2>
        <div className="faq-list">
          {FAQ.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final call */}
      <section className="wrap final-call" id="join">
        <img className="final-call-logo" src="/logo.png" alt="" aria-hidden="true" />
        <h2>Come as you are. Stay a while.</h2>
        <p>Good people, open conversations, and room to make the place yours.</p>
        <a
          className="btn-lantern"
          href={DISCORD_INVITE}
          target="_blank"
          rel="noopener noreferrer"
        >
          Join {BRAND} <ArrowUpRight />
        </a>
      </section>

      <Footer />
    </main>
  );
}
