import Link from "next/link";
import Effects from "./Effects";
import { BRAND, DISCORD_INVITE } from "./site";

/*
Embers drifting up behind the page. Values come from a formula
(not Math.random) so server and client render identically.
*/
const EMBERS = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`,
  size: 2 + ((i * 5) % 3),
  duration: 14 + ((i * 7) % 14),
  delay: -((i * 3) % 18),
  drift: ((i * 13) % 60) - 30,
}));

export function Background() {
  return (
    <>
      <div className="bg" aria-hidden="true">
        <div className="ambient" />
        <div className="grid-lines" />

        <div className="embers">
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

        <div className="noise" />
      </div>

      <Effects />
    </>
  );
}

export function Nav({ current }) {
  return (
    <header className="nav-wrap">
      <div className="nav">
        <Link className="brand" href="/" aria-label={`${BRAND} home`}>
          <span className="brand-mark">
            <img src="/logo.png" alt="" />
          </span>
          <span className="brand-name">{BRAND}</span>
        </Link>

        <nav className="nav-links" aria-label="Main">
          <Link href="/" aria-current={current === "home" ? "page" : undefined}>
            Home
          </Link>

          <Link href="/affiliates" aria-current={current === "affiliates" ? "page" : undefined}>
            Affiliates
          </Link>
        </nav>

        <a
          className="btn btn-small nav-cta"
          href={DISCORD_INVITE}
          target="_blank"
          rel="noopener noreferrer"
        >
          Join Discord
        </a>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-about">
            <span className="footer-brand">
              <img src="/logo.png" alt="" />
              {BRAND}
            </span>

            <p>A Discord community built around good people and good times.</p>

            <a
              className="btn btn-small"
              href={DISCORD_INVITE}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join the Discord
            </a>
          </div>

          <nav className="footer-col" aria-label="Explore">
            <h2>Explore</h2>

            <Link href="/">Home</Link>
            <Link href="/affiliates">Affiliates</Link>
          </nav>

          <nav className="footer-col" aria-label="Community">
            <h2>Community</h2>

            <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
              Discord server
            </a>
            <Link href="/affiliates">Partner with us</Link>
          </nav>
        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {BRAND}
          </span>

          <span>Not affiliated with Discord Inc.</span>
        </div>
      </div>
    </footer>
  );
}
