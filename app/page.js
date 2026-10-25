import Link from "next/link";
import "./globals.css";

import { Background, Nav, Footer } from "./SiteChrome";
import Avatar from "./Avatar";
import Effects from "./Effects";
import { BRAND, DISCORD_INVITE } from "./site";
import { AFFILIATES } from "./affiliates/data";

const SUBTAGLINE =
  "A Discord community for good people, late-night conversations, gaming, and a little bit of chaos.";

export const metadata = {
  title: `${BRAND} — Find Your People`,
  description: SUBTAGLINE,
};

const ROW_A = [
  ["🎮", "Game nights", "Queue up with people who show up."],
  ["🌙", "Late-night talks", "The best conversations start after midnight."],
  ["🎧", "Voice lounge", "Hop in, hang out, leave whenever."],
  ["🍿", "Movie nights", "Watch together, argue about it after."],
  ["😂", "Memes", "Quality control is strictly vibes."],
  ["🎵", "Music sharing", "Drop a song, start a thread."],
];
const ROW_B = [
  ["👋", "New friends", "Everyone starts as a stranger."],
  ["🎉", "Community events", "Reasons to check in all week."],
  ["🎲", "Surprises", "We keep a few up our sleeves."],
  ["🤝", "Co-op runs", "Find your squad in minutes."],
  ["☕", "Chill hangouts", "No agenda, no pressure."],
  ["✨", "Inside jokes", "You’ll have your own soon."],
];

const FAQ = [
  ["Do I need to play games to join?", "No. Games are a big part of the server, but plenty of people come just to talk, hang out in voice, or see what’s going on."],
  ["How do I join?", "Select Join the Discord and the invite opens in Discord. If you don’t have an account yet, Discord walks you through making one."],
  ["What are affiliates?", "Communities and creators we know and like. You can browse them all on the affiliates page."],
];

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4.5 15.5 15 5M6 5h9v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SmallArrow() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3.5 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Marquee({ items, reverse }) {
  const list = [...items, ...items];
  return (
    <div className={`marquee${reverse ? " rev" : ""}`} aria-hidden="true">
      <div className="track">
        {list.map(([icon, title, text], i) => (
          <div className="mq-card" key={i}>
            <span className="mq-icon">{icon}</span>
            <div>
              <b>{title}</b>
              <small>{text}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const featured = AFFILIATES.filter((item) => item.featured).slice(0, 3);

  return (
    <main className="site redesign">
      <Effects />
      <Background />
      <Nav current="home" />

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          <i className="blob b1" />
          <i className="blob b2" />
          <i className="blob b3" />
          <div className="gridlines" />
        </div>

        <div className="wrap hero-in">
          <p className="pill reveal">
            <span className="live-dot" /> Your people are here
          </p>
          <h1 className="reveal">
            Not just another <span className="shimmer">server.</span>
          </h1>
          <p className="hero-sub reveal">{SUBTAGLINE}</p>

          <div className="hero-actions reveal">
            <a className="btn-glow" href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
              Join the Discord <ArrowUpRight />
            </a>
            <Link className="btn-ghost" href="/affiliates">
              Meet our affiliates <SmallArrow />
            </Link>
          </div>

          <div className="stage reveal" aria-hidden="true">
            <div className="tilt">
              <div className="dm">
                <div className="dm-row">
                  <img className="dm-av" src="/logo.png" alt="" />
                  <div>
                    <p className="dm-name">
                      Mika <span className="dm-tag">MOD</span> <time>Today at 11:42 PM</time>
                    </p>
                    <p>game night’s starting, who’s in? 🎮</p>
                  </div>
                </div>
                <div className="dm-embed">
                  <b>Game night starts in 20 minutes</b>
                  <p>Hop in the lounge, we’ll sort out teams there.</p>
                  <span className="dm-btn">🔊 Join voice</span>
                </div>
                <p className="dm-typing"><i /><i /><i /> Jo is typing</p>
              </div>

              <div className="float f1"><span className="live-dot" /> 4 in Late-night lounge</div>
              <div className="float f2">🎉 Movie night</div>
              <div className="float f3">👋 New member joined</div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquees */}
      <section className="strip">
        <p className="strip-title reveal">Always something going on</p>
        <Marquee items={ROW_A} />
        <Marquee items={ROW_B} reverse />
      </section>

      {/* Bento */}
      <section className="wrap section" id="features">
        <h2 className="section-title reveal">Come for one reason. Find a few more.</h2>

        <div className="bento">
          <article className="tile spot wide reveal">
            <div>
              <h3>Find your people</h3>
              <p>Meet new people, join conversations, and find your own corner of the community.</p>
            </div>
            <div className="bubbles" aria-hidden="true">
              <span>what are you playing lately?</span>
              <span className="r">honestly? too many things</span>
              <span>same. let’s fix that tonight</span>
            </div>
          </article>

          <article className="tile spot reveal">
            <div>
              <h3>Pull up and play</h3>
              <p>Queue into games, jump in voice, or hang out while everyone does their own thing.</p>
            </div>
            <div className="voices" aria-hidden="true">
              {["#8b7bff", "#ff6bd6", "#5ee6ff", "#ffb84d"].map((c, i) => (
                <span key={c} style={{ "--c": c, "--i": i }} />
              ))}
            </div>
          </article>

          <article className="tile spot reveal">
            <div>
              <h3>There’s always something on</h3>
              <p>Community moments, events, and occasional surprises give everyone a reason to check in.</p>
            </div>
            <ul className="events" aria-hidden="true">
              <li><b>Game night</b><em>soon</em></li>
              <li><b>Movie night</b><em>voting</em></li>
              <li><b>Chaos hour</b><em>anytime</em></li>
            </ul>
          </article>

          <article className="tile spot wide reveal">
            <div>
              <h3>Make it your own</h3>
              <p>Pick the channels and roles that fit you. Your corner of the server looks like you.</p>
            </div>
            <div className="roles" aria-hidden="true">
              <span style={{ "--c": "#8b7bff" }}>Night owl</span>
              <span style={{ "--c": "#ff6bd6" }}>Co-op only</span>
              <span style={{ "--c": "#5ee6ff" }}>Ranked grinder</span>
              <span style={{ "--c": "#ffb84d" }}>Here for the memes</span>
            </div>
          </article>
        </div>
      </section>

      {/* Manifesto */}
      <section className="manifesto">
        <div className="wrap">
          <h2 className="reveal">
            A server feels different when the <span className="shimmer">people do.</span>
          </h2>
          <p className="reveal">
            {BRAND} is a Discord community built around good company and shared moments. Drop in to talk, find people to play with, or just see where the conversation takes you. No big pitch, just a place to belong.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="wrap section" id="how">
        <h2 className="section-title reveal">Getting in takes a minute.</h2>
        <ol className="steps">
          {[
            ["Join the server", "Select the invite and Discord opens. No account yet? Discord will help you make one."],
            ["Say hi in #introductions", "Tell us what you play or what you’re into. Someone will answer."],
            ["Find your corner", "Browse the channels that fit you, then drop into voice whenever you feel like it."],
          ].map(([t, d], i) => (
            <li className="spot reveal" key={t} style={{ "--delay": `${i * 0.12}s` }}>
              <span>{i + 1}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Affiliates */}
      {featured.length > 0 && (
        <section className="partners" id="affiliates">
          <div className="wrap">
            <div className="partners-heading">
              <h2 className="section-title reveal">Good company knows good company.</h2>
              <Link className="text-link" href="/affiliates">
                All affiliates <SmallArrow />
              </Link>
            </div>
            <div className="partner-list">
              {featured.map((item) => (
                <Link
                  className="partner-row spot reveal"
                  href={`/affiliates#${item.slug}`}
                  key={item.slug}
                  style={{ "--partner-accent": item.accent }}
                >
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

      {/* FAQ */}
      <section className="wrap section faq" id="faq">
        <h2 className="section-title reveal">Before you jump in</h2>
        <div className="faq-list reveal">
          {FAQ.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final call */}
      <section className="wrap" id="join">
        <div className="final-call reveal">
          <img className="final-call-logo" src="/logo.png" alt="" aria-hidden="true" />
          <h2>Come as you are. Stay a while.</h2>
          <p>Good people, open conversations, and room to make the place yours.</p>
          <a className="btn-glow" href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
            Join {BRAND} <ArrowUpRight />
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
