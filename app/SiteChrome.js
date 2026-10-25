import Link from "next/link";
import { BRAND, DISCORD_INVITE } from "./site";

/*
Embers drifting up behind the page. Values come from a formula
(not Math.random) so server and client render identically.
*/
const EMBERS = Array.from({ length: 12 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`,
  size: 2 + ((i * 5) % 3),
  duration: 14 + ((i * 7) % 14),
  delay: -((i * 3) % 18),
  drift: ((i * 13) % 60) - 30,
}));

export function Background() {
  return (
    <div className="bg" aria-hidden="true">
      <div className="ambient" />

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
  );
}

export function Nav({ current }) {
  return (
    <header className="nav">
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

      <a className="btn btn-small" href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
        Join Discord
      </a>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <span className="footer-brand">
        <img src="/logo.png" alt="" />
        {BRAND}
      </span>

      <nav className="footer-links" aria-label="Footer">
        <Link href="/">Home</Link>
        <Link href="/affiliates">Affiliates</Link>
        <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
          Discord
        </a>
      </nav>

      <span>
        © {new Date().getFullYear()} {BRAND}. Not affiliated with Discord Inc.
      </span>
    </footer>
  );
}
