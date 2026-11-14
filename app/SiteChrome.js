import Link from "next/link";
import { BRAND, DISCORD_INVITE } from "./site";
import "./haven.css";

// Four-point star from the logo. The only ornament the site uses.
export function Star({ className = "" }) {
  return (
    <svg className={`hx-star ${className}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0c.7 6.4 4.6 10.3 12 12-7.4 1.7-11.3 5.6-12 12-.7-6.4-4.6-10.3-12-12C7.4 10.3 11.3 6.4 12 0Z" />
    </svg>
  );
}

// Night backdrop. Keep it as the first child inside <main className="hx">.
export function Background() {
  return <div className="hx-sky" aria-hidden="true" />;
}

const LINKS = [
  ["home", "/", "Home"],
  ["affiliates", "/affiliates", "Affiliates"],
  ["giveaways", "/giveaways", "Giveaways"],
  ["profiles", "/dashboard", "Profiles"],
];

export function Nav({ current }) {
  return (
    <header className="hx-nav">
      <Link className="hx-brand" href="/" aria-label={`${BRAND} home`}>
        <span className="hx-brand-mark"><img src="/logo.png" alt="" /></span>
        <span className="hx-brand-name">/{BRAND}</span>
      </Link>

      <nav className="hx-links" aria-label="Main">
        {LINKS.map(([key, href, label]) => (
          <Link key={key} href={href} aria-current={current === key ? "page" : undefined}>{label}</Link>
        ))}
      </nav>

      <a className="hx-btn solid sm" href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">Join Discord</a>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="hx-foot">
      <div className="hx-wrap">
        <div className="hx-orn"><Star /></div>

        <div className="hx-foot-grid">
          <div className="hx-foot-brand">
            <span className="hx-brand">
              <span className="hx-brand-mark"><img src="/logo.png" alt="" /></span>
              <span className="hx-brand-name">/{BRAND}</span>
            </span>
            <p>A Discord community built around good people and good times.</p>
            <a className="hx-btn ghost sm" href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">Join the Discord</a>
          </div>

          <nav className="hx-foot-col" aria-label="Explore">
            <h2>Explore</h2>
            <Link href="/">Home</Link>
            <Link href="/affiliates">Affiliates</Link>
            <Link href="/giveaways">Giveaways</Link>
            <Link href="/dashboard">Profiles</Link>
          </nav>

          <nav className="hx-foot-col" aria-label="Community">
            <h2>Community</h2>
            <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">Discord server</a>
            <Link href="/affiliates">Partner with us</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
          </nav>
        </div>

        <div className="hx-foot-base">
          <span>© {new Date().getFullYear()} {BRAND}</span>
          <span>Not affiliated with Discord Inc.</span>
        </div>
      </div>
    </footer>
  );
}
