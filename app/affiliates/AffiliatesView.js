"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BRAND, DISCORD_INVITE } from "../site";

const FALLBACK_ACCENT = "#8b7cff";

// Badge images live in /public.
const BADGES = {
  partnered: { src: "/partner.png", label: "Discord Partner" },
  verified: { src: "/verified.png", label: "Verified" },
  community: { src: "/community.png", label: "Community server" },
};
const BOOSTS_ICON = "/boosts.png";

// Live "Members" / "Online" stats the bot injects. They are shown as live tiles instead.
const LIVE_STAT_LABEL = /^(members?|member count|total members|online( now)?)$/i;

const formatNumber = (value) => Number(value).toLocaleString("en-US");

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getSlug(affiliate) {
  return cleanText(affiliate?.slug).toLowerCase();
}

function getTags(affiliate) {
  return Array.isArray(affiliate?.tags)
    ? affiliate.tags.filter((tag) => typeof tag === "string" && tag.trim())
    : [];
}

function getStats(affiliate) {
  return Array.isArray(affiliate?.stats)
    ? affiliate.stats.filter((stat) => stat && typeof stat === "object")
    : [];
}

function getLinks(affiliate) {
  return Array.isArray(affiliate?.links)
    ? affiliate.links.filter(
        (link) =>
          link &&
          typeof link === "object" &&
          typeof link.url === "string" &&
          link.url.trim()
      )
    : [];
}

function getDiscord(affiliate) {
  const discord = affiliate?.discord;
  return discord && typeof discord === "object" ? discord : null;
}

function hasCounts(discord) {
  return (
    Boolean(discord) &&
    (discord.memberCount != null || discord.onlineCount != null)
  );
}

function getBadges(affiliate) {
  const discord = getDiscord(affiliate);
  if (!discord) return [];

  return ["partnered", "verified", "community"]
    .filter((key) => discord[key])
    .map((key) => ({ key, ...BADGES[key] }));
}

function validUrl(value) {
  if (!value || typeof value !== "string") return "";

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function Icon({ name, size = 17 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    back: (
      <>
        <path d="m15 18-6-6 6-6" />
      </>
    ),
    external: (
      <>
        <path d="M14 3h7v7" />
        <path d="M10 14 21 3" />
        <path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" />
      </>
    ),
    share: (
      <>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="m8.7 10.7 6.6-4.4M8.7 13.3l6.6 4.4" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    discord: (
      <>
        <path d="M8 8.5c2.5-1 5.5-1 8 0" />
        <path d="M7 17c3.3 1.7 6.7 1.7 10 0" />
        <path d="M7 6c-2 2.8-3 6.5-2.5 10.5 1.5 1.5 3 2.5 5 3l1-2 3 0 1 2c2-.5 3.5-1.5 5-3C20 12.5 19 8.8 17 6c-1.5-.8-3-.9-4.5-1l-.5 1.5h-2L9.5 5C8 5.1 8.5 5.2 7 6Z" />
        <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    sparkle: (
      <>
        <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" />
        <path d="m19 14 1.1 2.9L23 18l-2.9 1.1L19 22l-1.1-2.9L15 18l2.9-1.1L19 14Z" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
  };

  return <svg {...common}>{paths[name] || null}</svg>;
}

// Hide a badge image quietly if the file is missing from /public.
function hideOnError(event) {
  event.currentTarget.style.display = "none";
}

/* ---------- Discord icons, badges and counts ---------- */

// Discord icon for "total members". The online variant gets a green status dot.
function DiscordCountIcon({ online = false, size = 14 }) {
  return (
    <span className={`directory-count-icon${online ? " is-online" : ""}`}>
      <Icon name="discord" size={size} />
    </span>
  );
}

function CountPill({ kind, value }) {
  const online = kind === "online";

  return (
    <span
      className={`directory-count directory-count-${kind}`}
      title={online ? "Online now" : "Total members"}
    >
      <DiscordCountIcon online={online} />
      {formatNumber(value)}
      <small>{online ? "online" : "members"}</small>
    </span>
  );
}

function DiscordCounts({ discord }) {
  if (!hasCounts(discord)) return null;

  return (
    <div className="directory-counts">
      {discord.memberCount != null && (
        <CountPill kind="members" value={discord.memberCount} />
      )}
      {discord.onlineCount != null && (
        <CountPill kind="online" value={discord.onlineCount} />
      )}
    </div>
  );
}

// Icon-only badges (used on cards). Hover shows the name.
function BadgeIcons({ affiliate }) {
  const badges = getBadges(affiliate);
  if (badges.length === 0) return null;

  return (
    <span className="directory-badges">
      {badges.map((badge) => (
        <span className="directory-badge" key={badge.key} title={badge.label}>
          <img src={badge.src} alt={badge.label} onError={hideOnError} />
        </span>
      ))}
    </span>
  );
}

// Badge chips with labels (used on the profile).
function BadgeChips({ affiliate }) {
  return getBadges(affiliate).map((badge) => (
    <span className="directory-badge-chip" key={badge.key}>
      <img src={badge.src} alt="" onError={hideOnError} />
      {badge.label}
    </span>
  ));
}

function BoostChip({ discord }) {
  if (!discord?.boostCount) return null;

  return (
    <span className="directory-boosts" title="Server boosts">
      <img src={BOOSTS_ICON} alt="" onError={hideOnError} />
      {formatNumber(discord.boostCount)}
      <small>{discord.boostCount === 1 ? "boost" : "boosts"}</small>
    </span>
  );
}

// Ordered, valid image URLs to try (falls back to the single legacy field).
function getImageSources(list, single) {
  const sources = Array.isArray(list) && list.length > 0 ? list : [single];
  return sources.map(validUrl).filter(Boolean);
}

function Avatar({ affiliate, large = false }) {
  const sources = getImageSources(affiliate?.logoSources, affiliate?.logo);

  // The key resets the fallback position whenever the list of images changes.
  return (
    <AvatarInner
      key={sources.join("|")}
      affiliate={affiliate}
      sources={sources}
      large={large}
    />
  );
}

function AvatarInner({ affiliate, sources, large }) {
  const [index, setIndex] = useState(0);
  const logo = sources[index] || "";
  const name = cleanText(affiliate?.name) || "Community";

  return (
    <div
      className={`directory-avatar${large ? " directory-avatar-large" : ""}`}
      style={{ "--community-accent": affiliate?.accent || FALLBACK_ACCENT }}
    >
      {logo ? (
        <img
          src={logo}
          alt={`${name} icon`}
          onError={() => setIndex((current) => current + 1)}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}

function Banner({ affiliate, className = "" }) {
  const sources = getImageSources(affiliate?.bannerSources, affiliate?.banner);

  return (
    <BannerInner
      key={sources.join("|")}
      affiliate={affiliate}
      className={className}
      sources={sources}
    />
  );
}

function BannerInner({ affiliate, className, sources }) {
  const [index, setIndex] = useState(0);

  // When every source fails, no image is drawn and the gradient banner shows.
  const banner = sources[index] || "";

  return (
    <div
      className={`directory-banner ${className}`}
      style={{
        "--community-accent": affiliate?.accent || FALLBACK_ACCENT,
      }}
    >
      {banner && (
        <>
          {/* Blurred background fills the entire banner area */}
          <img
            className="directory-banner-backdrop"
            src={banner}
            alt=""
            aria-hidden="true"
          />

          {/* Original image remains completely visible */}
          <img
            className="directory-banner-full"
            src={banner}
            alt={`${affiliate?.name || "Community"} banner`}
            onError={() => setIndex((current) => current + 1)}
          />
        </>
      )}

      <div className="directory-banner-shade" />
      <div className="directory-banner-glow" />
    </div>
  );
}

function CommunityCard({ affiliate, onOpen }) {
  const name = cleanText(affiliate.name) || "Unnamed community";
  const description =
    cleanText(affiliate.description) ||
    cleanText(affiliate.tagline) ||
    "Discover this community.";
  const tags = getTags(affiliate).slice(0, 3);
  const discord = getDiscord(affiliate);
  const liveCounts = hasCounts(discord);

  // Fallback for listings without a Discord invite: use a manual "members" stat.
  const memberStat = liveCounts
    ? null
    : getStats(affiliate).find((stat) =>
        /member|user|population/i.test(`${stat.label || ""} ${stat.name || ""}`)
      );

  return (
    <article
      className="directory-card"
      style={{ "--community-accent": affiliate.accent || FALLBACK_ACCENT }}
    >
      <button
        className="directory-card-main"
        type="button"
        onClick={() => onOpen(affiliate)}
        aria-label={`View ${name}`}
      >
        <Banner affiliate={affiliate} />

        <div className="directory-card-content">
          <div className="directory-card-identity">
            <Avatar affiliate={affiliate} />

            <div className="directory-card-flags">
              <BadgeIcons affiliate={affiliate} />

              {affiliate.featured && (
                <span className="directory-featured">
                  <Icon name="sparkle" size={12} />
                  Featured
                </span>
              )}
            </div>
          </div>

          <div className="directory-card-heading">
            <div className="directory-card-title">
              <h3>{name}</h3>
              <span className="directory-card-arrow">
                <Icon name="arrow" size={16} />
              </span>
            </div>

            {affiliate.tagline && (
              <p className="directory-tagline">{affiliate.tagline}</p>
            )}
          </div>

          <p className="directory-description">{description}</p>

          {liveCounts && <DiscordCounts discord={discord} />}

          <div className="directory-card-meta">
            {memberStat && (
              <span className="directory-members">
                <Icon name="discord" size={14} />
                {memberStat.value || memberStat.count || memberStat.label}
              </span>
            )}

            <BoostChip discord={discord} />

            {tags.length > 0 && (
              <div className="directory-tags">
                {tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </button>

      <div className="directory-card-footer">
        <span className="directory-card-category">
          <span className="directory-status-dot" />
          Community partner
        </span>

        <button
          type="button"
          className="directory-card-view"
          onClick={() => onOpen(affiliate)}
        >
          View community
          <Icon name="arrow" size={14} />
        </button>
      </div>
    </article>
  );
}

function ProfileStat({ stat, index }) {
  const label = stat.label || stat.name || `Stat ${index + 1}`;
  const value = stat.value ?? stat.count ?? stat.amount ?? "—";

  return (
    <div className="directory-profile-stat" key={`${label}-${index}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

// Big live tiles at the top of the statistics panel.
function LiveStats({ discord }) {
  const tiles = [];

  if (discord.memberCount != null) {
    tiles.push({
      key: "members",
      label: "Total members",
      value: discord.memberCount,
      icon: <DiscordCountIcon size={16} />,
    });
  }

  if (discord.onlineCount != null) {
    tiles.push({
      key: "online",
      label: "Online now",
      value: discord.onlineCount,
      icon: <DiscordCountIcon online size={16} />,
    });
  }

  if (discord.boostCount > 0) {
    tiles.push({
      key: "boosts",
      label: discord.boostCount === 1 ? "Server boost" : "Server boosts",
      value: discord.boostCount,
      icon: <img src={BOOSTS_ICON} alt="" onError={hideOnError} />,
    });
  }

  if (tiles.length === 0) return null;

  return (
    <div className="directory-live-stats">
      {tiles.map((tile) => (
        <div className="directory-profile-stat is-live" key={tile.key}>
          <span className="directory-live-tile-label">
            {tile.icon}
            {tile.label}
          </span>
          <strong>{formatNumber(tile.value)}</strong>
        </div>
      ))}
    </div>
  );
}

function ProfileLink({ link }) {
  const href = validUrl(link.url);
  if (!href) return null;

  return (
    <a
      className={`directory-profile-link${link.primary ? " is-primary" : ""}`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span>{link.label || "Visit link"}</span>
      <Icon name="external" size={15} />
    </a>
  );
}

function CommunityProfile({ affiliate, affiliates, onBack, onOpen }) {
  const name = cleanText(affiliate.name) || "Community";
  const about = Array.isArray(affiliate.about)
    ? affiliate.about.filter((item) => typeof item === "string" && item.trim())
    : [];
  const description = cleanText(affiliate.description);
  const links = getLinks(affiliate);
  const tags = getTags(affiliate);
  const discord = getDiscord(affiliate);

  const showLive =
    Boolean(discord) && (hasCounts(discord) || discord.boostCount > 0);

  // The live tiles already show Members / Online, so don't repeat them below.
  const stats = showLive
    ? getStats(affiliate).filter(
        (stat) => !LIVE_STAT_LABEL.test(String(stat.label || stat.name || "").trim())
      )
    : getStats(affiliate);

  const hasFlags = getBadges(affiliate).length > 0 || Boolean(discord?.boostCount);

  const related = affiliates
    .filter(
      (item) =>
        getSlug(item) !== getSlug(affiliate) &&
        getTags(item).some((tag) => tags.includes(tag))
    )
    .slice(0, 3);

  const primaryLink = links.find((link) => link.primary) || links[0];
  const primaryHref = validUrl(primaryLink?.url);

  const handleShare = async () => {
    const url = `${window.location.origin}/affiliates/${encodeURIComponent(
      getSlug(affiliate)
    )}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: name, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // Sharing can be cancelled by the user.
    }
  };

  return (
    <div className="directory-profile">
      <div className="directory-profile-topbar">
        <button className="directory-back" type="button" onClick={onBack}>
          <Icon name="back" size={16} />
          Back to directory
        </button>

        <button
          className="directory-share"
          type="button"
          onClick={handleShare}
        >
          <Icon name="share" size={15} />
          Share
        </button>
      </div>

      <section
        className="directory-profile-hero"
        style={{
          "--community-accent": affiliate.accent || FALLBACK_ACCENT,
        }}
      >
        <Banner affiliate={affiliate} className="directory-profile-banner" />

        <div className="directory-profile-identity">
          <Avatar affiliate={affiliate} large />

          <div className="directory-profile-title">
            <div className="directory-profile-name-row">
              <h1>{name}</h1>
              {affiliate.featured && (
                <span className="directory-featured">
                  <Icon name="sparkle" size={12} />
                  Featured
                </span>
              )}
            </div>

            {affiliate.tagline && (
              <p className="directory-tagline">{affiliate.tagline}</p>
            )}

            {hasFlags && (
              <div className="directory-profile-flags">
                <BadgeChips affiliate={affiliate} />
                <BoostChip discord={discord} />
              </div>
            )}
          </div>
        </div>

        <div className="directory-profile-actions">
          {primaryHref && (
            <a
              className="directory-primary-action"
              href={primaryHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              {primaryLink.label || "Visit community"}
              <Icon name="external" size={15} />
            </a>
          )}

          <a
            className="directory-secondary-action"
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="discord" size={16} />
            Join {BRAND}
          </a>
        </div>
      </section>

      <div className="directory-profile-layout">
        <main className="directory-profile-main">
          <section className="directory-panel">
            <div className="directory-panel-heading">
              <span className="directory-panel-icon">
                <Icon name="grid" size={16} />
              </span>
              <h2>About this community</h2>
            </div>

            {description && <p className="directory-about">{description}</p>}

            {about.length > 0 && (
              <div className="directory-about-list">
                {about.map((item, index) => (
                  <p key={`${index}-${item}`}>{item}</p>
                ))}
              </div>
            )}

            {!description && about.length === 0 && (
              <p className="directory-muted">
                More information about this community has not been provided.
              </p>
            )}
          </section>

          {(showLive || stats.length > 0) && (
            <section className="directory-panel">
              <div className="directory-panel-heading">
                <span className="directory-panel-icon">
                  <Icon name="users" size={16} />
                </span>
                <h2>Community statistics</h2>

                {showLive && (
                  <span
                    className={`directory-live-tag${
                      discord.stale ? " is-stale" : ""
                    }`}
                  >
                    <i />
                    {discord.stale ? "Last known data" : "Live from Discord"}
                  </span>
                )}
              </div>

              {showLive && <LiveStats discord={discord} />}

              {stats.length > 0 && (
                <div className="directory-profile-stats">
                  {stats.map((stat, index) => (
                    <ProfileStat
                      key={`${stat.label || stat.name || "stat"}-${index}`}
                      stat={stat}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {related.length > 0 && (
            <section className="directory-panel">
              <div className="directory-panel-heading">
                <span className="directory-panel-icon">
                  <Icon name="sparkle" size={16} />
                </span>
                <h2>Similar communities</h2>
              </div>

              <div className="directory-related">
                {related.map((item) => (
                  <button
                    className="directory-related-card"
                    key={getSlug(item)}
                    type="button"
                    onClick={() => onOpen(item)}
                  >
                    <Avatar affiliate={item} />
                    <span>
                      <strong>{item.name}</strong>
                      <small>{item.tagline || "Community partner"}</small>
                    </span>
                    <Icon name="arrow" size={15} />
                  </button>
                ))}
              </div>
            </section>
          )}
        </main>

        <aside className="directory-profile-sidebar">
          {tags.length > 0 && (
            <section className="directory-panel">
              <div className="directory-panel-heading">
                <h2>Categories</h2>
              </div>

              <div className="directory-profile-tags">
                {tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </section>
          )}

          <section className="directory-panel">
            <div className="directory-panel-heading">
              <h2>Find them online</h2>
            </div>

            {links.length > 0 ? (
              <div className="directory-profile-links">
                {links.map((link, index) => (
                  <ProfileLink
                    key={`${link.label || "link"}-${index}`}
                    link={link}
                  />
                ))}
              </div>
            ) : (
              <p className="directory-muted">No links have been added yet.</p>
            )}
          </section>

          <section className="directory-partner-card">
            <span className="directory-partner-icon">
              <Icon name="sparkle" size={19} />
            </span>
            <h3>Want to partner with us?</h3>
            <p>
              Think your community would be a great fit? Get in touch and
              become part of the directory.
            </p>
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get in touch
              <Icon name="arrow" size={14} />
            </a>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default function AffiliatesView({ affiliates = [], initialSlug = "" }) {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [selectedSlug, setSelectedSlug] = useState(initialSlug);
  const [sort, setSort] = useState("featured");

  const safeAffiliates = useMemo(
    () =>
      Array.isArray(affiliates)
        ? affiliates.filter(
            (affiliate) =>
              affiliate &&
              typeof affiliate === "object" &&
              getSlug(affiliate) &&
              cleanText(affiliate.name)
          )
        : [],
    [affiliates]
  );

  const allTags = useMemo(() => {
    const tags = safeAffiliates.flatMap(getTags);
    return ["All", ...Array.from(new Set(tags)).sort((a, b) => a.localeCompare(b))];
  }, [safeAffiliates]);

  // Combined members across the whole network (from the live Discord data).
  const totalMembers = useMemo(
    () =>
      safeAffiliates.reduce(
        (sum, affiliate) => sum + (getDiscord(affiliate)?.memberCount ?? 0),
        0
      ),
    [safeAffiliates]
  );

  const selectedAffiliate = useMemo(
    () =>
      safeAffiliates.find(
        (affiliate) => getSlug(affiliate) === selectedSlug
      ) || null,
    [safeAffiliates, selectedSlug]
  );

  const openProfile = useCallback((affiliate) => {
    const slug = getSlug(affiliate);
    if (!slug) return;

    window.history.pushState(null, "", `/affiliates/${encodeURIComponent(slug)}`);
    setSelectedSlug(slug);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const closeProfile = useCallback(() => {
    window.history.pushState(null, "", "/affiliates");
    setSelectedSlug("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const syncHash = () => {
      // /affiliates/<slug> first, then the old /affiliates#<slug> links.
      const parts = window.location.pathname.split("/").filter(Boolean);
      const fromPath = parts[0] === "affiliates" && parts[1] ? parts[1] : "";
      const slug = decodeURIComponent(
        fromPath || window.location.hash.slice(1)
      ).toLowerCase();
      setSelectedSlug(
        safeAffiliates.some((affiliate) => getSlug(affiliate) === slug)
          ? slug
          : ""
      );
    };

    syncHash();
    window.addEventListener("popstate", syncHash);
    window.addEventListener("hashchange", syncHash);

    return () => {
      window.removeEventListener("popstate", syncHash);
      window.removeEventListener("hashchange", syncHash);
    };
  }, [safeAffiliates]);

  const filteredAffiliates = useMemo(() => {
    const query = search.trim().toLowerCase();

    return safeAffiliates
      .filter((affiliate) => {
        const matchesTag =
          activeTag === "All" || getTags(affiliate).includes(activeTag);

        const searchable = [
          affiliate.name,
          affiliate.tagline,
          affiliate.description,
          ...getTags(affiliate),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return matchesTag && (!query || searchable.includes(query));
      })
      .sort((a, b) => {
        if (sort === "az") {
          return cleanText(a.name).localeCompare(cleanText(b.name));
        }

        if (sort === "members") {
          return (
            (getDiscord(b)?.memberCount ?? -1) -
              (getDiscord(a)?.memberCount ?? -1) ||
            cleanText(a.name).localeCompare(cleanText(b.name))
          );
        }

        return Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
          cleanText(a.name).localeCompare(cleanText(b.name));
      });
  }, [safeAffiliates, search, activeTag, sort]);

  const featuredAffiliates = filteredAffiliates.filter(
    (affiliate) => affiliate.featured
  );

  if (selectedAffiliate) {
    return (
      <CommunityProfile
        affiliate={selectedAffiliate}
        affiliates={safeAffiliates}
        onBack={closeProfile}
        onOpen={openProfile}
      />
    );
  }

  return (
    <div className="directory">
      <header className="directory-heading">
        <div className="directory-heading-copy">
          <span className="directory-eyebrow">
            <span className="directory-eyebrow-dot" />
            THE {BRAND.toUpperCase()} NETWORK
          </span>

          <h1>
            Find your next
            <span> community.</span>
          </h1>

          <p>
            Explore communities we're connected with. Find your people,
            discover new interests, and join something great.
          </p>
        </div>

        <div className="directory-heading-stats">
          <div className="directory-heading-stat">
            <span className="directory-heading-stat-icon">
              <Icon name="users" size={20} />
            </span>
            <div>
              <strong>{safeAffiliates.length}</strong>
              <span>communities</span>
            </div>
          </div>

          {totalMembers > 0 && (
            <div className="directory-heading-stat">
              <span className="directory-heading-stat-icon">
                <Icon name="discord" size={20} />
              </span>
              <div>
                <strong>{formatNumber(totalMembers)}</strong>
                <span>total members</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <section className="directory-controls">
        <label className="directory-search">
          <Icon name="search" size={18} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search communities..."
            aria-label="Search communities"
          />
          {search && (
            <button
              type="button"
              className="directory-search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </label>

        <label className="directory-sort">
          <span>Sort by</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="featured">Featured</option>
            <option value="members">Most members</option>
            <option value="az">Name A–Z</option>
          </select>
        </label>
      </section>

      <nav className="directory-categories" aria-label="Community categories">
        {allTags.map((tag) => (
          <button
            key={tag}
            type="button"
            className={activeTag === tag ? "is-active" : ""}
            onClick={() => setActiveTag(tag)}
          >
            {tag === "All" && <Icon name="grid" size={14} />}
            {tag}
          </button>
        ))}
      </nav>

      {featuredAffiliates.length > 0 &&
        activeTag === "All" &&
        !search.trim() && (
          <section className="directory-section">
            <div className="directory-section-heading">
              <div>
                <span className="directory-section-kicker">HAND PICKED</span>
                <h2>
                  <Icon name="sparkle" size={19} />
                  Featured communities
                </h2>
              </div>
              <span className="directory-section-count">
                {featuredAffiliates.length} featured
              </span>
            </div>

            <div className="directory-grid">
              {featuredAffiliates.map((affiliate) => (
                <CommunityCard
                  key={getSlug(affiliate)}
                  affiliate={affiliate}
                  onOpen={openProfile}
                />
              ))}
            </div>
          </section>
        )}

      <section className="directory-section">
        <div className="directory-section-heading">
          <div>
            <span className="directory-section-kicker">EXPLORE</span>
            <h2>
              <Icon name="grid" size={18} />
              {search || activeTag !== "All"
                ? "Search results"
                : "All communities"}
            </h2>
          </div>

          <span className="directory-section-count">
            {filteredAffiliates.length}{" "}
            {filteredAffiliates.length === 1 ? "community" : "communities"}
          </span>
        </div>

        {filteredAffiliates.length > 0 ? (
          <div className="directory-grid">
            {filteredAffiliates.map((affiliate) => (
              <CommunityCard
                key={getSlug(affiliate)}
                affiliate={affiliate}
                onOpen={openProfile}
              />
            ))}
          </div>
        ) : (
          <div className="directory-empty">
            <span className="directory-empty-icon">
              <Icon name="search" size={25} />
            </span>
            <h3>No communities found</h3>
            <p>
              Try another search or choose a different category to find what
              you're looking for.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveTag("All");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      <section className="directory-join">
        <div className="directory-join-glow" />
        <div className="directory-join-icon">
          <Icon name="discord" size={25} />
        </div>
        <div className="directory-join-copy">
          <span>YOUR COMMUNITY STARTS HERE</span>
          <h2>Looking for a place to belong?</h2>
          <p>
            Join the {BRAND} community and meet people, make connections, and
            find your place.
          </p>
        </div>
        <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
          Join {BRAND}
          <Icon name="arrow" size={15} />
        </a>
      </section>
    </div>
  );
}
