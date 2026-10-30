
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Avatar from "../Avatar";
import { BRAND, DISCORD_INVITE } from "../site";

/*
=========================================================
HELPERS
=========================================================
*/

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url || "";
  }
}

function readHash(affiliates) {
  if (typeof window === "undefined") return null;

  try {
    const slug = decodeURIComponent(window.location.hash.slice(1));
    return affiliates.some((item) => item.slug === slug) ? slug : null;
  } catch {
    return null;
  }
}

function iconKind(link) {
  const host = hostOf(link.url).toLowerCase();
  const label = (link.label || "").toLowerCase();

  if (host.includes("discord") || label.includes("discord")) return "discord";
  if (host.includes("youtube") || host === "youtu.be") return "youtube";
  if (host.includes("twitch")) return "twitch";
  if (host.includes("tiktok")) return "tiktok";
  if (host.includes("instagram")) return "instagram";
  if (host === "x.com" || host.includes("twitter")) return "x";

  return "web";
}

function LinkIcon({ kind }) {
  const props = {
    width: 17,
    height: 17,
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
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
  );
}

/*
=========================================================
VIEW
=========================================================
*/

export default function AffiliatesView({ affiliates = [] }) {
  const [active, setActive] = useState(null);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("All");
  const [sort, setSort] = useState("featured");
  const [copied, setCopied] = useState(false);

  const scrollRef = useRef(0);
  const headingRef = useRef(null);

  const allTags = useMemo(() => {
    const tags = new Set();

    affiliates.forEach((item) => {
      item.tags?.forEach((value) => tags.add(value));
    });

    return ["All", ...Array.from(tags).sort()];
  }, [affiliates]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    let results = affiliates.filter((item) => {
      if (tag !== "All" && !item.tags?.includes(tag)) return false;

      if (!needle) return true;

      const haystack = [
        item.name,
        item.tagline,
        item.description,
        ...(item.tags || []),
      ].join(" ").toLowerCase();

      return haystack.includes(needle);
    });

    if (sort === "featured") {
      results = [...results].sort(
        (a, b) => Number(b.featured) - Number(a.featured)
      );
    } else if (sort === "az") {
      results = [...results].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    return results;
  }, [affiliates, query, tag, sort]);

  const featured = filtered.filter((item) => item.featured);
  const regular = filtered.filter((item) => !item.featured);

  /*
  =========================================================
  NAVIGATION
  =========================================================
  */

  const openProfile = useCallback((slug) => {
    if (!window.location.hash) {
      scrollRef.current = window.scrollY;
    }

    window.history.pushState(null, "", `#${encodeURIComponent(slug)}`);
    setActive(slug);
    setCopied(false);

    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const closeProfile = useCallback(() => {
    window.history.pushState(
      null,
      "",
      window.location.pathname + window.location.search
    );

    setActive(null);

    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollRef.current, behavior: "instant" });
    });
  }, []);

  useEffect(() => {
    const sync = () => setActive(readHash(affiliates));

    sync();

    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);

    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, [affiliates]);

  useEffect(() => {
    if (!active) return;

    function onKeyDown(event) {
      if (event.key === "Escape") closeProfile();
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
      // Clipboard unavailable.
    }
  }

  const affiliate = affiliates.find((item) => item.slug === active);

  /*
  =========================================================
  DIRECTORY LISTING
  =========================================================
  */

  function DirectoryCard({ item }) {
    const stat = item.stats?.[0];

    return (
      <article
        className="directory-card"
        key={item.slug}
        style={{ "--accent": item.accent }}
      >
        <button
          className="directory-card-main"
          type="button"
          onClick={() => openProfile(item.slug)}
        >
          <div className="directory-avatar">
            <Avatar
              name={item.name}
              logo={item.logo}
              accent={item.accent}
              size={68}
            />
          </div>

          <div className="directory-info">
            <div className="directory-name">
              <h3>{item.name}</h3>
              {item.featured && (
                <span className="directory-featured">
                  <span>✦</span> Featured
                </span>
              )}
            </div>

            <p className="directory-tagline">{item.tagline}</p>

            <p className="directory-description">
              {item.description}
            </p>

            <div className="directory-meta">
              {item.tags?.slice(0, 4).map((value) => (
                <span className="directory-tag" key={value}>
                  {value}
                </span>
              ))}

              {stat && (
                <span className="directory-stat">
                  <span className="directory-dot" />
                  {stat.value} {stat.label}
                </span>
              )}
            </div>
          </div>

          <div className="directory-arrow">
            <ArrowIcon />
          </div>
        </button>

        <div className="directory-card-footer">
          <div className="directory-socials">
            {(item.links || []).slice(0, 5).map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                title={link.label}
                aria-label={`${item.name} - ${link.label}`}
                onClick={(event) => event.stopPropagation()}
              >
                <LinkIcon kind={iconKind(link)} />
              </a>
            ))}
          </div>

          <button
            type="button"
            className="directory-view"
            onClick={() => openProfile(item.slug)}
          >
            View server <span>→</span>
          </button>
        </div>
      </article>
    );
  }

  /*
  =========================================================
  PROFILE
  =========================================================
  */

  if (affiliate) {
    const primary =
      affiliate.links?.find((link) => link.primary) ||
      affiliate.links?.[0];

    const others = affiliates
      .filter((item) => item.slug !== affiliate.slug)
      .slice(0, 3);

    return (
      <section
        className="directory-profile"
        style={{ "--accent": affiliate.accent }}
      >
        <div className="directory-profile-cover">
          {affiliate.banner && <img src={affiliate.banner} alt="" />}
          <div className="directory-profile-overlay" />
        </div>

        <div className="wrap directory-profile-wrap">
          <button
            className="directory-back"
            type="button"
            onClick={closeProfile}
          >
            <span>←</span> Back to directory
          </button>

          <div className="directory-profile-header">
            <div className="directory-profile-identity">
              <Avatar
                name={affiliate.name}
                logo={affiliate.logo}
                accent={affiliate.accent}
                size={112}
              />

              <div>
                <div className="directory-profile-label">
                  {affiliate.featured ? "✦ Featured community" : "Official affiliate"}
                </div>

                <h1 ref={headingRef} tabIndex={-1}>
                  {affiliate.name}
                </h1>

                <p>{affiliate.tagline}</p>
              </div>
            </div>

            <div className="directory-profile-actions">
              {primary && (
                <a
                  className="directory-join"
                  href={primary.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {primary.label} <ArrowIcon />
                </a>
              )}

              <button
                className="directory-share"
                type="button"
                onClick={shareProfile}
              >
                {copied ? "✓ Copied" : "Share"}
              </button>
            </div>
          </div>

          <div className="directory-profile-grid">
            <main className="directory-about">
              <div className="directory-section-heading">
                <span>01</span>
                <h2>About this community</h2>
              </div>

              {(affiliate.about || []).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}

              {affiliate.tags?.length > 0 && (
                <div className="directory-profile-tags">
                  {affiliate.tags.map((value) => (
                    <span key={value}>{value}</span>
                  ))}
                </div>
              )}
            </main>

            <aside className="directory-sidebar">
              {affiliate.stats?.length > 0 && (
                <div className="directory-panel">
                  <h3>Community statistics</h3>

                  <div className="directory-stat-grid">
                    {affiliate.stats.map((stat) => (
                      <div key={stat.label}>
                        <strong>{stat.value}</strong>
                        <span>{stat.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="directory-panel">
                <h3>Find them online</h3>

                <div className="directory-link-list">
                  {(affiliate.links || []).map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="directory-link-icon">
                        <LinkIcon kind={iconKind(link)} />
                      </span>

                      <span>
                        <strong>{link.label}</strong>
                        <small>{hostOf(link.url)}</small>
                      </span>

                      <ArrowIcon />
                    </a>
                  ))}
                </div>
              </div>
            </aside>
          </div>

          {others.length > 0 && (
            <section className="directory-more">
              <div className="directory-section-heading">
                <span>02</span>
                <h2>Explore more communities</h2>
              </div>

              <div className="directory-mini-grid">
                {others.map((item) => (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => openProfile(item.slug)}
                  >
                    <Avatar
                      name={item.name}
                      logo={item.logo}
                      accent={item.accent}
                      size={42}
                    />

                    <span>
                      <strong>{item.name}</strong>
                      <small>{item.tagline}</small>
                    </span>

                    <ArrowIcon />
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
  DIRECTORY
  =========================================================
  */

  return (
    <div className="server-directory">
      <section className="directory-hero">
        <div className="directory-hero-glow" />

        <div className="wrap">
          <div className="directory-eyebrow">
            <span className="directory-live-dot" />
            THE {BRAND.toUpperCase()} NETWORK
          </div>

          <h1>
            Find your next
            <span> community.</span>
          </h1>

          <p>
            Discover the communities, servers and creators connected
            with {BRAND}.
          </p>

          <div className="directory-search">
            <SearchIcon />

            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search communities, topics or tags..."
              aria-label="Search communities"
            />

            {query && (
              <button type="button" onClick={() => setQuery("")}>
                Clear
              </button>
            )}
          </div>

          <div className="directory-hero-stats">
            <div>
              <strong>{affiliates.length}</strong>
              <span>Communities</span>
            </div>
            <div>
              <strong>{allTags.length - 1}</strong>
              <span>Categories</span>
            </div>
            <div>
              <strong>{featured.length}</strong>
              <span>Featured</span>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap directory-content">
        <div className="directory-toolbar">
          <div className="directory-categories">
            {allTags.map((item) => (
              <button
                key={item}
                type="button"
                className={tag === item ? "active" : ""}
                onClick={() => setTag(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="directory-sort">
            <span>Sort:</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              aria-label="Sort communities"
            >
              <option value="featured">Featured first</option>
              <option value="az">Name A–Z</option>
            </select>
          </div>
        </div>

        <div className="directory-results-heading">
          <div>
            <h2>Explore communities</h2>
            <p>Browse the communities in our network.</p>
          </div>

          <span>
            {filtered.length} {filtered.length === 1 ? "result" : "results"}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="directory-empty">
            <div className="directory-empty-icon">
              <SearchIcon />
            </div>

            <h2>No communities found</h2>
            <p>Try another search or choose a different category.</p>

            <button
              type="button"
              onClick={() => {
                setQuery("");
                setTag("All");
              }}
            >
              Reset filters
            </button>
          </div>
        ) : (
          <>
            {featured.length > 0 && sort === "featured" && (
              <section className="directory-group">
                <div className="directory-group-heading">
                  <h3><span>✦</span> Featured communities</h3>
                  <span>{featured.length}</span>
                </div>

                <div className="directory-grid">
                  {featured.map((item) => (
                    <DirectoryCard key={item.slug} item={item} />
                  ))}
                </div>
              </section>
            )}

            {regular.length > 0 && (
              <section className="directory-group">
                <div className="directory-group-heading">
                  <h3>
                    {sort === "az" ? "All communities" : "More communities"}
                  </h3>
                  <span>{regular.length}</span>
                </div>

                <div className="directory-grid">
                  {regular.map((item) => (
                    <DirectoryCard key={item.slug} item={item} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <section className="directory-apply">
          <div>
            <span>GROW WITH US</span>
            <h2>Have a community of your own?</h2>
            <p>
              Become part of the {BRAND} network. Join our Discord
              and open a partnership ticket.
            </p>
          </div>

          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener noreferrer"
          >
            Apply for partnership <ArrowIcon />
          </a>
        </section>
      </section>
    </div>
  );
}
