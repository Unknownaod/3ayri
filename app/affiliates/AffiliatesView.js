"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Avatar from "../Avatar";
import { BRAND, DISCORD_INVITE } from "../site";
import { AFFILIATES } from "./data";

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function readHash() {
  if (typeof window === "undefined") {
    return null;
  }

  const slug = decodeURIComponent(window.location.hash.slice(1));

  return AFFILIATES.some((item) => item.slug === slug) ? slug : null;
}

export default function AffiliatesView() {
  const [active, setActive] = useState(null);

  const scrollRef = useRef(0);
  const headingRef = useRef(null);

  /*
  =========================================================
  OPEN / CLOSE A PROFILE
  The profile lives in the URL hash so it can be linked
  to directly (/affiliates#example-one) and the browser's
  back button closes it.
  =========================================================
  */

  const openProfile = useCallback((slug) => {
    scrollRef.current = window.scrollY;

    window.history.pushState(null, "", `#${slug}`);
    setActive(slug);

    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const closeProfile = useCallback(() => {
    window.history.pushState(null, "", window.location.pathname + window.location.search);
    setActive(null);

    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollRef.current, behavior: "instant" });
    });
  }, []);

  useEffect(() => {
    const sync = () => setActive(readHash());

    sync();

    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);

    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    function onKeyDown(event) {
      if (event.key === "Escape") {
        closeProfile();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    headingRef.current?.focus({ preventScroll: true });

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, closeProfile]);

  const affiliate = AFFILIATES.find((item) => item.slug === active);

  /*
  =========================================================
  OPEN PROFILE
  =========================================================
  */

  if (affiliate) {
    const primary = affiliate.links.find((link) => link.primary) || affiliate.links[0];

    return (
      <section className="profile" style={{ "--accent": affiliate.accent }}>
        <div className="profile-cover" aria-hidden="true">
          {affiliate.banner && <img src={affiliate.banner} alt="" />}
        </div>

        <button className="profile-back" type="button" onClick={closeProfile}>
          <span aria-hidden="true">←</span> All affiliates
        </button>

        <div className="wrap profile-head">
          <Avatar
            name={affiliate.name}
            logo={affiliate.logo}
            accent={affiliate.accent}
            size={128}
          />

          <div className="profile-title">
            <h1 ref={headingRef} tabIndex={-1}>
              {affiliate.name}
            </h1>

            <p>{affiliate.tagline}</p>

            {affiliate.tags?.length > 0 && (
              <ul className="aff-tags">
                {affiliate.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            )}
          </div>

          {primary && (
            <a className="btn" href={primary.url} target="_blank" rel="noopener noreferrer">
              {primary.label}
            </a>
          )}
        </div>

        <div className="wrap profile-body">
          <div className="profile-main">
            <h2>About</h2>

            {affiliate.about.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <aside className="profile-side">
            {affiliate.stats?.length > 0 && (
              <dl className="profile-stats">
                {affiliate.stats.map((stat) => (
                  <div key={stat.label}>
                    <dt>{stat.label}</dt>
                    <dd>{stat.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <h2>Links</h2>

            <ul className="link-list">
              {affiliate.links.map((link) => (
                <li key={link.url}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <span>
                      <strong>{link.label}</strong>
                      <small>{hostOf(link.url)}</small>
                    </span>

                    <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    );
  }

  /*
  =========================================================
  GRID
  =========================================================
  */

  return (
    <>
      <section className="aff-head">
        <div className="page-glow" aria-hidden="true" />

        <div className="wrap">
          <h1>Affiliates</h1>

          <p>The servers and creators we stand with. Open a profile to see who they are.</p>
        </div>
      </section>

      <section className="wrap aff-section">
        <div className="aff-grid">
          {AFFILIATES.map((item) => (
            <article className="aff-card" key={item.slug} style={{ "--accent": item.accent }}>
              <div className="aff-card-top">
                <Avatar name={item.name} logo={item.logo} accent={item.accent} size={56} />

                <div>
                  <h2>{item.name}</h2>
                  <p>{item.tagline}</p>
                </div>
              </div>

              <p className="aff-card-desc">{item.description}</p>

              {item.tags?.length > 0 && (
                <ul className="aff-tags">
                  {item.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              )}

              <div className="aff-card-foot">
                <div className="aff-pills">
                  {item.links.slice(0, 3).map((link) => (
                    <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.label}
                    </a>
                  ))}
                </div>

                <button
                  className="aff-more"
                  type="button"
                  onClick={() => openProfile(item.slug)}
                  aria-label={`View ${item.name}'s full profile`}
                >
                  View more
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="aff-apply">
          <h2>Want to partner with {BRAND}?</h2>

          <p>Join the Discord and open a ticket. We'll get back to you.</p>

          <a className="btn btn-ghost" href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
            Join the Discord
          </a>
        </div>
      </section>
    </>
  );
}
