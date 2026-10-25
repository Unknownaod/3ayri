"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Avatar from "../Avatar";
import { BRAND, DISCORD_INVITE } from "../site";
import { AFFILIATES } from "./data";

/*
=========================================================
HELPERS
=========================================================
*/

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

function iconKind(link) {
  const host = hostOf(link.url).toLowerCase();
  const label = link.label.toLowerCase();

  if (host.includes("discord") || label.includes("discord")) return "discord";
  if (host.includes("youtube") || host === "youtu.be" || label.includes("youtube")) return "youtube";
  if (host.includes("twitch") || label.includes("twitch")) return "twitch";
  if (host.includes("tiktok") || label.includes("tiktok")) return "tiktok";
  if (host.includes("instagram") || label.includes("instagram")) return "instagram";
  if (host === "x.com" || host.includes("twitter") || label === "x") return "x";

  return "web";
}

function LinkIcon({ kind }) {
  const props = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (kind) {
    case "discord":
      return (
        <svg {...props}>
          <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.3A8 8 0 1 1 21 12z" />
          <circle cx="9" cy="12" r=".6" />
          <circle cx="15" cy="12" r=".6" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...props}>
          <rect x="3" y="6" width="18" height="12" rx="4" />
          <path d="M10.5 9.5v5l4-2.5z" />
        </svg>
      );
    case "twitch":
      return (
        <svg {...props}>
          <path d="M5 3h15v10l-4 4h-4l-3 3v-3H5z" />
          <path d="M12 8v3M16 8v3" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...props}>
          <path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5" />
          <path d="M14 4c.4 2.6 2.2 4.2 5 4.4" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...props}>
          <rect x="4" y="4" width="16" height="16" rx="5" />
          <circle cx="12" cy="12" r="3.6" />
          <circle cx="17" cy="7" r=".6" />
        </svg>
      );
    case "x":
      return (
        <svg {...props}>
          <path d="M5 4l14 16M19 4L5 20" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3.5 12h17M12 3.5c2.6 2.4 2.6 14.6 0 17M12 3.5c-2.6 2.4-2.6 14.6 0 17" />
        </svg>
      );
  }
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </svg>
  );
}

/*
=========================================================
VIEW
=========================================================
*/

export default function AffiliatesView() {
  const [active, setActive] = useState(null);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("All");
  const [copied, setCopied] = useState(false);

  const scrollRef = useRef(0);
  const headingRef = useRef(null);

  const allTags = useMemo(() => {
    const set = new Set();

    AFFILIATES.forEach((item) => item.tags?.forEach((value) => set.add(value)));

    return ["All", ...Array.from(set).sort()];
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return AFFILIATES.filter((item) => {
      if (tag !== "All" && !item.tags?.includes(tag)) {
        return false;
      }

      if (!needle) {
        return true;
      }

      const haystack = [item.name, item.tagline, item.description, ...(item.tags || [])]
        .join(" ")
        .toLowerCase();

      return haystack.includes(needle);
    });
  }, [query, tag]);

  /*
  =========================================================
  OPEN / CLOSE A PROFILE
  The profile lives in the URL hash so it can be linked
  to directly (/affiliates#example-one) and the browser's
  back button closes it.
  =========================================================
  */

  const openProfile = useCallback((slug) => {
    // only remember the grid's scroll position when coming from the grid
    if (!window.location.hash) {
      scrollRef.current = window.scrollY;
    }

    window.history.pushState(null, "", `#${slug}`);
    setActive(slug);
    setCopied(false);

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

  async function shareProfile() {
    try {
      await navigator.clipboard.writeText(window.location.href);

      setCopied(true);

      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked, nothing to do
    }
  }

  const affiliate = AFFILIATES.find((item) => item.slug === active);

  /*
  =========================================================
  OPEN PROFILE
  =========================================================
  */

  if (affiliate) {
    const primary = affiliate.links.find((link) => link.primary) || affiliate.links[0];
    const others = AFFILIATES.filter((item) => item.slug !== affiliate.slug).slice(0, 3);

    return (
      <section className="profile" style={{ "--accent": affiliate.accent }}>
        <div className="profile-cover" aria-hidden="true">
          {affiliate.banner && <img src={affiliate.banner} alt="" />}
        </div>

        <button className="profile-back glass" type="button" onClick={closeProfile}>
          <span aria-hidden="true">←</span> All affiliates
        </button>

        <div className="wrap">
          <div className="profile-card glass">
            <Avatar
              name={affiliate.name}
              logo={affiliate.logo}
              accent={affiliate.accent}
              size={136}
            />

            <div className="profile-title">
              <span className="badge">Official affiliate</span>

              <h1 ref={headingRef} tabIndex={-1}>
                {affiliate.name}
              </h1>

              <p>{affiliate.tagline}</p>

              {affiliate.tags?.length > 0 && (
                <ul className="aff-tags">
                  {affiliate.tags.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="profile-actions">
              {primary && (
                <a className="btn" href={primary.url} target="_blank" rel="noopener noreferrer">
                  {primary.label}
                </a>
              )}

              <button className="btn btn-ghost" type="button" onClick={shareProfile}>
                {copied ? "Link copied" : "Share profile"}
              </button>
            </div>
          </div>

          <div className="profile-body">
            <div className="profile-main">
              <h2>About</h2>

              {affiliate.about.map((paragraph, index) => (
                <p key={index} className={index === 0 ? "lead" : undefined}>
                  {paragraph}
                </p>
              ))}
            </div>

            <aside className="profile-side">
              {affiliate.stats?.length > 0 && (
                <div className="side-card glass">
                  <dl className="profile-stats">
                    {affiliate.stats.map((stat) => (
                      <div key={stat.label}>
                        <dd>{stat.value}</dd>
                        <dt>{stat.label}</dt>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              <div className="side-card glass">
                <h2>Find them online</h2>

                <ul className="link-list">
                  {affiliate.links.map((link) => (
                    <li key={link.url}>
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <span className="link-icon">
                          <LinkIcon kind={iconKind(link)} />
                        </span>

                        <span className="link-text">
                          <strong>{link.label}</strong>
                          <small>{hostOf(link.url)}</small>
                        </span>

                        <span className="link-arrow" aria-hidden="true">
                          ↗
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>

          {others.length > 0 && (
            <section className="profile-more">
              <h2>More affiliates</h2>

              <div className="mini-grid">
                {others.map((item) => (
                  <button
                    className="mini-card spot"
                    type="button"
                    key={item.slug}
                    style={{ "--accent": item.accent }}
                    onClick={() => openProfile(item.slug)}
                  >
                    <Avatar name={item.name} logo={item.logo} accent={item.accent} size={48} />

                    <span className="mini-text">
                      <strong>{item.name}</strong>
                      <small>{item.tagline}</small>
                    </span>

                    <span className="mini-arrow" aria-hidden="true">
                      →
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}
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

          <div className="aff-toolbar">
            <label className="aff-search">
              <SearchIcon />

              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search affiliates"
                aria-label="Search affiliates"
              />
            </label>

            {allTags.length > 2 && (
              <div className="aff-filters" role="group" aria-label="Filter by tag">
                {allTags.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="chip"
                    aria-pressed={tag === item}
                    onClick={() => setTag(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="wrap aff-section">
        <p className="aff-count" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "affiliate" : "affiliates"}
        </p>

        {filtered.length === 0 ? (
          <div className="aff-empty glass">
            <h2>No matches</h2>

            <p>Nothing fits that search. Try a different word or clear the filter.</p>

            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => {
                setQuery("");
                setTag("All");
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="aff-grid">
            {filtered.map((item) => {
              const stat = item.stats?.[0];

              return (
                <article
                  className="aff-card spot"
                  key={item.slug}
                  style={{ "--accent": item.accent }}
                >
                  <div className="aff-card-cover" aria-hidden="true">
                    {item.banner && <img src={item.banner} alt="" />}
                  </div>

                  <div className="aff-card-body">
                    <div className="aff-card-id">
                      <Avatar name={item.name} logo={item.logo} accent={item.accent} size={68} />

                      {stat && (
                        <span className="aff-stat">
                          <strong>{stat.value}</strong> {stat.label}
                        </span>
                      )}
                    </div>

                    <h2>{item.name}</h2>

                    <p className="aff-tagline">{item.tagline}</p>

                    <p className="aff-card-desc">{item.description}</p>

                    {item.tags?.length > 0 && (
                      <ul className="aff-tags">
                        {item.tags.map((value) => (
                          <li key={value}>{value}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="aff-card-foot">
                    <div className="aff-icons">
                      {item.links.slice(0, 4).map((link) => (
                        <a
                          key={link.url}
                          className="icon-btn"
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${item.name} on ${link.label}`}
                          title={link.label}
                        >
                          <LinkIcon kind={iconKind(link)} />
                        </a>
                      ))}
                    </div>

                    <button
                      className="aff-more"
                      type="button"
                      onClick={() => openProfile(item.slug)}
                      aria-label={`View ${item.name}'s full profile`}
                    >
                      View more <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="aff-apply">
          <div>
            <h2>Want to partner with {BRAND}?</h2>

            <p>Join the Discord and open a ticket. We'll get back to you.</p>
          </div>

          <a className="btn" href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
            Join the Discord
          </a>
        </div>
      </section>
    </>
  );
}
