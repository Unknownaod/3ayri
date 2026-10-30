
import Link from "next/link";
import "./globals.css";

import { Background, Nav, Footer } from "./SiteChrome";
import Avatar from "./Avatar";
import Effects from "./Effects";
import { BRAND, DISCORD_INVITE } from "./site";
import { AFFILIATES } from "./affiliates/data";

const SUBTAGLINE =
  "A place above the ordinary. Find your people, share your moments, and make yourself at home.";

export const metadata = {
  title: `${BRAND} — A Place to Belong`,
  description: SUBTAGLINE,
};

const STATS = [
  ["24/7", "A place that's always here"],
  ["Weekly", "Events & shared moments"],
  ["One", "Community, countless connections"],
  ["Everyone", "A place for you"],
];

const ROW_A = [
  ["☁️", "Find your people", "Good company makes everything better."],
  ["🌙", "Late-night conversations", "Some of the best moments happen after dark."],
  ["🎧", "Voice lounges", "Come in, get comfortable, stay awhile."],
  ["✨", "Community events", "Little moments worth looking forward to."],
  ["🕊️", "A little escape", "Leave the outside noise behind."],
  ["🎵", "Music & memories", "Share the sounds that mean something."],
];

const ROW_B = [
  ["🤍", "New connections", "Every friendship starts somewhere."],
  ["🌟", "Special moments", "Make memories with your people."],
  ["🎮", "Gaming together", "Find your next favorite teammate."],
  ["🪽", "Good company", "A community that feels like home."],
  ["☕", "Quiet hangouts", "No pressure. Just be yourself."],
  ["💫", "Your own space", "Find a place where you belong."],
];

const FAQ = [
  [
    "Do I need to play games to join?",
    "Not at all. Gaming is just one part of Haven. You can join for conversations, music, events, voice chats, or simply to meet new people.",
  ],
  [
    "How do I join?",
    "Select Join Haven and your Discord invite will open. If you don't have an account, Discord will guide you through creating one.",
  ],
  [
    "What are affiliates?",
    "Affiliates are communities and creators we connect with. You can explore our affiliated communities on the affiliates page.",
  ],
  [
    "Are there rules?",
    <>
      Of course. We want Haven to remain a welcoming place for everyone.
      You can{" "}
      <Link className="text-link" href="/terms">
        visit our Terms of Service page
      </Link>{" "}
      to read the community guidelines.
    </>,
  ],
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

function Crown() {
  return (
    <svg className="crown" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path
        d="M32 4L36.5 22L54 13L43 30L60 34L40 38L32 59L24 38L4 34L21 30L10 13L27.5 22L32 4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="rgba(215,205,255,.12)"
      />
      <circle cx="32" cy="32" r="9" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="32" cy="32" r="3" fill="currentColor" />
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
          <div className="hero-banner" />
          <i className="blob b1" />
          <i className="blob b2" />
          <i className="blob b3" />
          <div className="gridlines" />
        </div>

        <div className="wrap hero-in">
          <div className="medallion reveal" aria-hidden="true">
            <img src="/logo.png" alt="" />
          </div>

          <p className="pill reveal">
            <span className="live-dot" /> A little place in the clouds
          </p>

          <h1 className="reveal">
            Somewhere you can <span className="shimmer">belong.</span>
          </h1>

          <p className="hero-sub reveal">{SUBTAGLINE}</p>

          <div className="hero-actions reveal">
            <a
              className="btn-glow"
              data-magnetic
              href={DISCORD_INVITE}
              target="_blank"
              rel="noopener noreferrer"
            >
              Enter Haven <ArrowUpRight />
            </a>

            <Link className="btn-ghost" data-magnetic href="/affiliates">
              Explore our community <SmallArrow />
            </Link>
          </div>

          <div className="stats">
            {STATS.map(([big, small], i) => (
              <div
                className="stat reveal"
                key={big}
                style={{ "--delay": `${i * 0.08}s` }}
              >
                <b>{big}</b>
                <small>{small}</small>
              </div>
            ))}
          </div>

          <div className="stage reveal" aria-hidden="true">
            <div className="tilt">
              <div className="dm">
                <div className="dm-row">
                  <img className="dm-av" src="/logo.png" alt="" />

                  <div>
                    <p className="dm-name">
                      Mika <span className="dm-tag">MOD</span>{" "}
                      <time>Today at 11:42 PM</time>
                    </p>
                    <p>anyone around? come hang out 🤍</p>
                  </div>
                </div>

                <div className="dm-embed">
                  <b>Welcome to Haven ☁️</b>
                  <p>
                    Your place to unwind, meet new people, and make yourself
                    at home.
                  </p>
                  <span className="dm-btn">✨ Find your place</span>
                </div>

                <p className="dm-typing">
                  <i />
                  <i />
                  <i /> Jo is typing
                </p>
              </div>

              <div className="float f1">
                <span className="live-dot" /> 4 in the lounge
              </div>
              <div className="float f2">☁️ Welcome to Haven</div>
              <div className="float f3">🤍 New member joined</div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquees */}
      <section className="strip">
        <p className="strip-title reveal">A little something for everyone</p>
        <Marquee items={ROW_A} />
        <Marquee items={ROW_B} reverse />
      </section>

      {/* Features */}
      <section className="wrap section" id="features">
        <p className="eyebrow reveal">Inside Haven</p>

        <h2 className="section-title reveal">
          More than a server. A place to call your own.
        </h2>

        <div className="bento">
          <article className="tile spot wide reveal">
            <div>
              <h3>Find where you belong</h3>
              <p>
                Meet people from all walks of life, discover new friendships,
                and find your own little corner of Haven.
              </p>
            </div>

            <div className="bubbles" aria-hidden="true">
              <span>anyone wanna talk?</span>
              <span className="r">always, what's up? 🤍</span>
              <span>this place is actually so chill</span>
            </div>
          </article>

          <article className="tile spot reveal">
            <div>
              <h3>Escape into something fun</h3>
              <p>
                Play your favorite games, find teammates, and enjoy the little
                moments together.
              </p>
            </div>

            <div className="voices" aria-hidden="true">
              {["#d9d0ff", "#b9c8ff", "#f1eaff", "#a78bfa"].map((c, i) => (
                <span key={c} style={{ "--c": c, "--i": i }} />
              ))}
            </div>
          </article>

          <article className="tile spot reveal">
            <div>
              <h3>Moments worth remembering</h3>
              <p>
                From community events to spontaneous late-night conversations,
                there's always something happening.
              </p>
            </div>

            <ul className="events" aria-hidden="true">
              <li><b>Game night</b><em>soon</em></li>
              <li><b>Movie night</b><em>voting</em></li>
              <li><b>Community night</b><em>anytime</em></li>
            </ul>
          </article>

          <article className="tile spot wide reveal">
            <div>
              <h3>Your space, your way</h3>
              <p>
                Discover channels, choose your interests, and make Haven feel
                like somewhere that belongs to you.
              </p>
            </div>

            <div className="roles" aria-hidden="true">
              <span style={{ "--c": "#c4b5fd" }}>Cloud nine</span>
              <span style={{ "--c": "#bfdbfe" }}>Night owl</span>
              <span style={{ "--c": "#e9d5ff" }}>Good company</span>
              <span style={{ "--c": "#f5e6c8" }}>Just visiting</span>
            </div>
          </article>
        </div>
      </section>

      {/* Showcase */}
      <section className="wrap section" id="realm">
        <div className="showcase">
          <div>
            <p className="eyebrow reveal">A place above the ordinary</p>

            <h2 className="section-title reveal">
              Find your little piece of heaven.
            </h2>

            <p className="reveal">
              A welcoming space built around friendship, connection, and
              shared experiences. Whether you're here to meet someone new,
              spend the night talking, or simply escape the everyday,
              there's a place for you in {BRAND}.
            </p>

            <ul className="checks reveal">
              <li>A welcoming community, day and night</li>
              <li>Events, gaming, and shared experiences</li>
              <li>Friendly moderation and a respectful atmosphere</li>
            </ul>
          </div>

          <div className="frame reveal" aria-hidden="true">
            <img src="/banner.png" alt="" />
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="manifesto">
        <div className="wrap">
          <div className="reveal">
            <Crown />
          </div>

          <h2 className="reveal">
            Some places just feel like <span className="shimmer">home.</span>
          </h2>

          <p className="reveal">
            Haven is more than a place to chat. It's a place to connect,
            laugh, share experiences, and create friendships that extend
            beyond a screen. No expectations, no pressure. Just good people
            and a place where you can be yourself.
          </p>
        </div>
      </section>

      {/* Getting Started */}
      <section className="wrap section" id="how">
        <p className="eyebrow reveal">Your journey starts here</p>

        <h2 className="section-title reveal">
          Your place is waiting.
        </h2>

        <ol className="steps">
          {[
            [
              "Find your way in",
              "Follow the invite and step into Haven. Your new community is just a click away.",
            ],
            [
              "Make yourself at home",
              "Introduce yourself, explore the channels, and get to know everyone.",
            ],
            [
              "Find your people",
              "Join conversations, discover shared interests, and make Haven your own.",
            ],
          ].map(([t, d], i) => (
            <li
              className="spot reveal"
              key={t}
              style={{ "--delay": `${i * 0.12}s` }}
            >
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
              <div>
                <p className="eyebrow reveal">Our connections</p>

                <h2 className="section-title reveal">
                  Good people know good people.
                </h2>
              </div>

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
        <p className="eyebrow reveal">A few questions</p>

        <h2 className="section-title reveal">
          Everything you might want to know.
        </h2>

        <div className="faq-list reveal">
          {FAQ.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final Call */}
      <section className="wrap" id="join">
        <div className="final-call reveal">
          <img
            className="final-call-logo"
            src="/logo.png"
            alt=""
            aria-hidden="true"
          />

          <h2>There's a place for you here.</h2>

          <p>
            Leave the noise behind. Meet your people. Welcome to Haven.
          </p>

          <a
            className="btn-glow"
            data-magnetic
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener noreferrer"
          >
            Enter {BRAND} <ArrowUpRight />
          </a>

          <p>
            By joining, you agree to our{" "}
            <Link className="text-link" href="/terms">
              Terms of Service
            </Link>.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
