import Link from "next/link";
import "./globals.css";

import { Nav, Footer } from "./SiteChrome";
import Avatar from "./Avatar";
import { BRAND, DISCORD_INVITE } from "./site";
import { getAffiliates } from "./affiliates/data";

const TAGLINE = "A friendly community. Find your people and make yourself at home.";

export const metadata = {
  title: `${BRAND} — A Place to Belong`,
  description: TAGLINE,
};

export default async function Home() {
  const affiliates = await getAffiliates();
  const featured = affiliates.filter((item) => item.featured).slice(0, 3);

  return (
    <main className="site">
      <Nav current="home" />

      <section className="hero">
        <div className="wrap hero-in">
          <div className="medallion" aria-hidden="true">
            <img src="/logo.png" alt="" />
          </div>

          <h1>
            Somewhere you can <span className="shimmer">belong.</span>
          </h1>

          <p className="hero-sub">{TAGLINE}</p>

          <div className="hero-actions">
            <a
              className="btn-glow"
              href={DISCORD_INVITE}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join {BRAND}
            </a>

            <Link className="btn-ghost" href="/affiliates">
              Affiliates
            </Link>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="partners" id="affiliates">
          <div className="wrap">
            <div className="partners-heading">
              <h2 className="section-title">Affiliates</h2>

              <Link className="text-link" href="/affiliates">
                View all
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
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
