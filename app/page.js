import "./globals.css";

/*
=========================================================
EDIT THESE
=========================================================
*/

const BRAND = "3ayri";

// Put your real Discord invite here
const DISCORD_INVITE = "https://discord.gg/your-invite";

const TAGLINE = "Welcome to the kingdom.";
const SUBTAGLINE =
  "A Discord community for people who want good company, good chaos, and a place that feels like theirs.";

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
    title: "Events & giveaways",
    text: "Community nights, game sessions, and giveaways run throughout the month.",
  },
  {
    title: "Run properly",
    text: "Clear rules and active moderators keep the server welcoming for everyone.",
  },
];

/*
Embers drifting up behind the page. Values come from a formula
(not Math.random) so server and client render identically.
*/
const EMBERS = Array.from({ length: 22 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`,
  size: 2 + ((i * 5) % 4),
  duration: 12 + ((i * 7) % 14),
  delay: -((i * 3) % 16),
  drift: ((i * 13) % 60) - 30,
}));

export const metadata = {
  title: `${BRAND} | Discord Community`,
  description: SUBTAGLINE,
};

export default function Home() {
  return (
    <main className="site">
      {/* =====================================================
          BACKGROUND EFFECTS
      ===================================================== */}

      <div className="ambient" aria-hidden="true" />
      <div className="moon" aria-hidden="true" />

      <div className="embers" aria-hidden="true">
        {EMBERS.map((ember, index) => (
          <span
            key={index}
            style={{
              left: ember.left,
              width: ember.size,
              height: ember.size,
              animationDuration: `${ember.duration}s`,
              animationDelay: `${ember.delay}s`,
              "--drift": `${ember.drift}px`,
            }}
          />
        ))}
      </div>

      <div className="noise" aria-hidden="true" />

      {/* =====================================================
          NAV
      ===================================================== */}

      <header className="nav">
        <a className="brand" href="#top" aria-label={`${BRAND} home`}>
          <span className="brand-mark">
            <img src="/logo.png" alt="" />
          </span>
          <span className="brand-name">{BRAND}</span>
        </a>

        <nav className="nav-links" aria-label="Sections">
          <a href="#about">About</a>
          <a href="#features">What's inside</a>
          <a href="#join">Join</a>
        </nav>

        <a className="btn btn-small" href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
          Join Discord
        </a>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="hero" id="top">
        <div className="banner">
          <img src="/banner.png" alt={`${BRAND} — crowned logo over a moonlit purple city`} />
          <div className="banner-shine" aria-hidden="true" />
        </div>

        <div className="hero-copy">
          <h1>{TAGLINE}</h1>

          <p>{SUBTAGLINE}</p>

          <div className="hero-actions">
            <a className="btn" href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
              Join the Discord
            </a>

            <a className="btn btn-ghost" href="#about">
              Learn more
            </a>
          </div>
        </div>
      </section>

      {/* =====================================================
          ABOUT
      ===================================================== */}

      <section className="section about" id="about">
        <div className="about-inner">
          <img className="about-logo" src="/logo.png" alt={`${BRAND} logo`} />

          <div>
            <h2>What is {BRAND}?</h2>

            <p>
              {BRAND} is a Discord community built around good people and good times. Hop in,
              say hello, find your corner of the server, and make yourself at home.
            </p>

            <p>
              Whether you're here to chat, queue up with friends, or just see what's going on,
              there's a place for you.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURES
      ===================================================== */}

      <section className="section" id="features">
        <h2 className="section-title">What's inside</h2>

        <div className="features">
          {FEATURES.map((item) => (
            <article className="feature" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* =====================================================
          JOIN
      ===================================================== */}

      <section className="section" id="join">
        <div className="join">
          <img className="join-logo" src="/logo.png" alt="" />

          <h2>Take your seat.</h2>

          <p>The door's open. Jump in and say hi.</p>

          <a className="btn" href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
            Join the Discord
          </a>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="footer">
        <span className="footer-brand">
          <img src="/logo.png" alt="" />
          {BRAND}
        </span>

        <span>© {new Date().getFullYear()} {BRAND}. Not affiliated with Discord Inc.</span>
      </footer>
    </main>
  );
}
