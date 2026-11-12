// ONE schema drives everything: dashboard controls, API validation, defaults, rendering.
// Add a field here and it appears in the dashboard, saves, and is available as cfg(p).key
// Optional per-field keys:  hint: "small help text"   if: "otherKey" | ["otherKey", "value"] | ["otherKey", "!value"]  (only show when true)

// ───────────── platforms (slug = icon name on simpleicons.org) ─────────────
const p = (name, slug, ph) => [name, { name, slug, ph }];
export const PLATFORMS = Object.fromEntries([
  p("Discord", "discord", "https://discord.gg/invite"), p("Instagram", "instagram", "https://instagram.com/you"),
  p("TikTok", "tiktok", "https://tiktok.com/@you"), p("YouTube", "youtube", "https://youtube.com/@you"),
  p("X", "x", "https://x.com/you"), p("Twitch", "twitch", "https://twitch.tv/you"), p("Kick", "kick", "https://kick.com/you"),
  p("Spotify", "spotify", "https://open.spotify.com/user/you"), p("SoundCloud", "soundcloud", "https://soundcloud.com/you"),
  p("Apple Music", "applemusic", "https://music.apple.com/profile/you"), p("GitHub", "github", "https://github.com/you"),
  p("Steam", "steam", "https://steamcommunity.com/id/you"), p("Reddit", "reddit", "https://reddit.com/u/you"),
  p("Snapchat", "snapchat", "https://snapchat.com/add/you"), p("Telegram", "telegram", "https://t.me/you"),
  p("WhatsApp", "whatsapp", "https://wa.me/number"), p("Bluesky", "bluesky", "https://bsky.app/profile/you"),
  p("Threads", "threads", "https://threads.net/@you"), p("Facebook", "facebook", "https://facebook.com/you"),
  p("Pinterest", "pinterest", "https://pinterest.com/you"), p("PayPal", "paypal", "https://paypal.me/you"),
  p("Cash App", "cashapp", "https://cash.app/$you"), p("Patreon", "patreon", "https://patreon.com/you"),
  p("Ko-fi", "kofi", "https://ko-fi.com/you"), p("Roblox", "roblox", "https://roblox.com/users/123/profile"),
  p("Epic Games", "epicgames", "https://store.epicgames.com/u/you"), p("PlayStation", "playstation", "https://psnprofiles.com/you"),
  p("Xbox", "xbox", "https://xbox.com/play/user/you"), p("Signal", "signal", "https://signal.me/#p/+15551234567"),
  p("Mastodon", "mastodon", "https://mastodon.social/@you"), p("Tumblr", "tumblr", "https://you.tumblr.com"),
  p("Medium", "medium", "https://medium.com/@you"), p("Substack", "substack", "https://you.substack.com"),
  p("Behance", "behance", "https://behance.net/you"), p("Dribbble", "dribbble", "https://dribbble.com/you"),
  p("Figma", "figma", "https://figma.com/@you"), p("Notion", "notion", "https://notion.so/you"),
  p("Bandcamp", "bandcamp", "https://you.bandcamp.com"), p("itch.io", "itchdotio", "https://you.itch.io"),
  p("Buy Me a Coffee", "buymeacoffee", "https://buymeacoffee.com/you"), p("Venmo", "venmo", "https://venmo.com/u/you"),
].map(([k, v]) => [v.slug, v]));

// Icons drawn inline (no network): see lib/icons.js. Any other simpleicons slug works as "si:slug".
export const BUILTIN_ICONS = ["globe", "mail", "link", "heart", "star", "music", "gamepad", "bag", "code", "camera", "pin", "bolt"];
export const BUILTIN_LABELS = { globe: "Website", mail: "Email", link: "Link", heart: "Heart", star: "Star", music: "Music", gamepad: "Gaming", bag: "Shop", code: "Code", camera: "Camera", pin: "Location", bolt: "Bolt" };

// ───────────── fonts ─────────────
export const FONT_META = {
  figtree: ['"Figtree",system-ui,sans-serif', "Figtree:wght@400;500;600;700;800", "Figtree"],
  bricolage: ['"Bricolage Grotesque",system-ui,sans-serif', "Bricolage+Grotesque:wght@400;500;600;700;800", "Bricolage"],
  inter: ['"Inter",system-ui,sans-serif', "Inter:wght@400;500;600;700;800", "Inter"],
  space: ['"Space Grotesk",system-ui,sans-serif', "Space+Grotesk:wght@400;500;600;700", "Space Grotesk"],
  outfit: ['"Outfit",system-ui,sans-serif', "Outfit:wght@400;500;600;700;800", "Outfit"],
  sora: ['"Sora",system-ui,sans-serif', "Sora:wght@400;500;600;700;800", "Sora"],
  poppins: ['"Poppins",system-ui,sans-serif', "Poppins:wght@400;500;600;700;800", "Poppins"],
  syne: ['"Syne",system-ui,sans-serif', "Syne:wght@400;500;600;700;800", "Syne"],
  nunito: ['"Nunito",ui-rounded,system-ui,sans-serif', "Nunito:wght@400;500;600;700;800", "Nunito"],
  playfair: ['"Playfair Display",Georgia,serif', "Playfair+Display:wght@400;500;600;700;800", "Playfair"],
  dmserif: ['"DM Serif Display",Georgia,serif', "DM+Serif+Display", "DM Serif"],
  cinzel: ['"Cinzel",Georgia,serif', "Cinzel:wght@400;500;600;700;800", "Cinzel"],
  fraktur: ['"UnifrakturCook",Georgia,serif', "UnifrakturCook:wght@700", "Fraktur"],
  serif: ["Georgia,serif", null, "Georgia"],
  mono: ['"JetBrains Mono",ui-monospace,monospace', "JetBrains+Mono:wght@400;500;600;700;800", "JetBrains Mono"],
  vt323: ['"VT323",ui-monospace,monospace', "VT323", "VT323"],
  pixel: ['"Press Start 2P",ui-monospace,monospace', "Press+Start+2P", "Press Start"],
  orbitron: ['"Orbitron",system-ui,sans-serif', "Orbitron:wght@400;500;600;700;800", "Orbitron"],
  righteous: ['"Righteous",system-ui,sans-serif', "Righteous", "Righteous"],
  bebas: ['"Bebas Neue",Impact,sans-serif', "Bebas+Neue", "Bebas Neue"],
  pacifico: ['"Pacifico",cursive', "Pacifico", "Pacifico"],
  caveat: ['"Caveat",cursive', "Caveat:wght@400;500;600;700", "Caveat"],
  marker: ['"Permanent Marker",cursive', "Permanent+Marker", "Marker"],
  system: ["system-ui,sans-serif", null, "System"],
};
export const FONTS = Object.fromEntries(Object.entries(FONT_META).map(([k, v]) => [k, v[0]]));
export const FONT_LABELS = Object.fromEntries(Object.entries(FONT_META).map(([k, v]) => [k, v[2]]));
export const fontsHref = (keys) => {
  const g = [...new Set(keys)].map((k) => FONT_META[k]?.[1]).filter(Boolean);
  return g.length ? `https://fonts.googleapis.com/css2?${g.map((x) => `family=${x}`).join("&")}&display=swap` : null;
};

// ───────────── base themes (card colour + text colour; page colour is the default background) ─────────────
export const THEMES = {
  dark: { card: "#1d1713", text: "#f4e6dc", page: "#0d0a08" },
  light: { card: "#fbf6f1", text: "#1d1713", page: "#0d0a08" },
  midnight: { card: "#0a0a12", text: "#ececf8", page: "#0d0a08" },
  black: { card: "#000000", text: "#f2f2f2", page: "#0d0a08" },
  glass: { card: "#ffffff", text: "#ffffff", page: "#0d0a08" },
  forest: { card: "#0f1a14", text: "#e3f2e8", page: "#060c08" },
  ocean: { card: "#0b1622", text: "#e4f1fb", page: "#040a12" },
  rose: { card: "#1f1018", text: "#fbe8f0", page: "#0e060a" },
  snow: { card: "#f6f8fb", text: "#12181f", page: "#e8edf3" },
};

// ───────────── field builders ─────────────
const T = (label, max = 60, ph = "", x) => ({ t: "text", label, def: "", max, ph, ...x });
const A = (label, max = 280, x) => ({ t: "area", label, def: "", max, ...x });
const C = (label, def, clear, x) => ({ t: "color", label, def: clear ? "" : def, pick: def, clear, ...x });   // "clear" colors default to empty = automatic; pick is what the color input shows
const S = (label, opts, def, x) => ({ t: "seg", label, opts, def: def ?? opts[0], ...x });
const R = (label, lo, hi, def, x) => ({ t: "range", label, lo, hi, def, ...x });
const B = (label, def = false, x) => ({ t: "bool", label, def, ...x });
const I = (label, max = 900_000, x) => ({ t: "img", label, max, def: "", ...x });
const M = (label, ph, x) => ({ t: "media", label, def: "", ph, ...x });
const H = (label) => ({ t: "head", label });
const F = Object.keys(FONT_META);
const X = (t) => ({ t });                       // special editor blocks (see dashboard/panels.js)
const SPECIAL = new Set(["head", "badges", "links", "socials", "tracks", "sections", "presets", "discord"]);

export const SCHEMA = {
  Profile: {
    h1: H("Identity"), name: T("Display name", 32), tagline: T("Tagline (under your name)", 60), pronouns: T("Pronouns", 20), location: T("Location", 40), showHandle: B("Show @username", true),
    h2: H("Bio"), bio: A("Bio", 500, { hint: "Line breaks are kept." }), bioSize: R("Bio text size", 12, 22, 15), typewriter: B("Type out the bio"),
    bioCycle: B("Cycle through bio lines (one sentence per line)", false, { if: "typewriter" }), typeSpeed: R("Typing speed (ms/char)", 10, 120, 35, { if: "typewriter" }),
    h3: H("Badges & counter"), badges: X("badges"), showViews: B("Show view counter", true), viewsPos: S("Counter position", ["corner", "bottom"], undefined, { if: "showViews" }),
    viewsLabel: T("Counter label (e.g. views)", 16, "", { if: "showViews" }),
  },
  Discord: {
    d0: X("discord"),
    h1: H("On your page"), presence: B("Show live Discord status on my page"), presenceStyle: S("Style", ["card", "compact", "dot"], undefined, { if: "presence" }),
    presenceAvatar: B("Show Discord avatar", true, { if: "presence" }), presenceName: B("Show Discord name + @username", true, { if: "presence" }),
    badgePlacement: S("Discord badges", ["name", "card", "both", "off"], undefined, { hint: "Your Discord badges and Nitro. Press \"Read my Discord status\" to refresh them. \"card\" shows them in the status card, which needs Live status on." }),
    presenceActivity: B("Show games / Spotify", true, { if: "presence" }), presenceCustom: B("Show custom status", true, { if: "presence" }),
    presencePlatform: B("Show device (desktop / phone / web)", true, { if: "presence" }), presenceTimer: B("Show elapsed time and song progress", true, { if: "presence" }),
    presenceHideOffline: B("Hide the card while I'm offline", false, { if: "presence" }),
  },
  Links: {
    h0: H("Your links"), links: X("links"),
    h1: H("Buttons"), linkStyle: S("Style", ["outline", "filled", "glass", "gradient", "neon", "soft", "minimal"]), linkShape: S("Shape", ["rounded", "pill", "square"]), linkLayout: S("Layout", ["list", "grid"]),
    linkAlign: S("Text align", ["center", "left", "between"]), linkHover: S("Hover", ["lift", "glow", "slide", "scale", "shake", "fill", "none"]), linkSize: R("Height", 36, 80, 48), linkGap: R("Spacing between buttons", 2, 28, 12),
    linkBorderWidth: R("Border width", 0, 4, 1), linkTextSize: R("Text size %", 80, 130, 100), linkIconPos: S("Icon position", ["left", "right", "none"]), linkArrow: B("Show an arrow"),
    h2: H("Colors"), linkColor: C("Button color", "#e0a243", true), linkTextColor: C("Button text color", "#111111", true),
  },
  Socials: {
    h0: H("Your icons"), socials: X("socials"),
    h1: H("Look"), iconStyle: S("Shape", ["circle", "rounded", "square", "bare"]), iconFill: S("Background", ["tint", "outline", "glass", "filled"], undefined, { if: ["iconStyle", "!bare"] }),
    iconColor: S("Icon color", ["auto", "accent", "brand", "custom"]), iconCustom: C("Custom icon color", "#ffffff", false, { if: ["iconColor", "custom"] }),
    iconSize: R("Icon size", 14, 44, 22), socialGap: R("Spacing", 2, 30, 10), socialsPos: S("Position", ["top", "bottom"]), socialHover: S("Hover", ["lift", "glow", "scale", "shake", "brand", "none"]),
    socialLabels: B("Show names next to icons"),
  },
  Music: {
    h1: H("Playlist"), musicUrl: M("Track 1: YouTube link or direct audio link (.mp3 / .ogg / .wav / .m4a)", "https://youtu.be/… or https://…/song.mp3"), musicTitle: T("Track 1: title", 60), musicArtist: T("Track 1: artist", 60), musicCover: M("Track 1: cover image link", "https://…/cover.jpg"),
    tr: X("tracks"),
    h2: H("Playback"), musicAuto: B("Start when visitor enters", true), musicVolume: R("Volume", 0, 100, 50), musicLoop: S("Repeat", ["all", "one", "off"]), musicShuffle: B("Shuffle"),
    h3: H("Player"), musicPlayer: S("Style", ["pill", "bar", "card", "minimal", "hidden"]), musicPos: S("Position", ["bottom", "top-right", "top-left", "inline"], undefined, { if: ["musicPlayer", "!hidden"] }),
    musicProgress: B("Show seek bar (bar & card)", true), musicVolShow: B("Show volume slider", true),
  },
  Theme: {
    pr: X("presets"),
    h1: H("Colors"), theme: S("Base theme", Object.keys(THEMES)), accent: C("Accent", "#e0a243"), accent2: C("Second accent", "#ffffff"), accent3: C("Third accent (gradients)", "#ffffff", true), gradAngle: R("Gradient angle", 0, 360, 90),
    textColor: C("Text color", "#f4e6dc", true), mutedColor: C("Secondary text color", "#a8978a", true), cardColor: C("Card color", "#1d1713", true), nameColor: C("Name color (solid)", "#ffffff", true),
    h2: H("Typography"), font: S("Font", F, undefined, { kind: "font" }), nameFont: S("Name font", ["inherit", ...F], undefined, { kind: "font" }), textScale: R("Overall text size %", 80, 130, 100),
    nameSize: R("Name size", 16, 80, 28), nameWeight: S("Name weight", ["400", "500", "600", "700", "800"], "700"), nameSpacing: R("Name letter spacing", -2, 14, 0), nameUpper: B("UPPERCASE name"),
    nameEffect: S("Name effect", ["none", "gradient", "glow", "neon", "shimmer", "rainbow", "glitch", "outline"]),
    h3: H("Motion"), entryAnim: S("Card entrance", ["fade", "slide", "pop", "blur", "zoom", "stagger", "none"]),
  },
  Card: {
    h1: H("Placement"), layout: S("Text alignment", ["center", "left", "right"]), header: S("Avatar & name", ["stacked", "inline"]), cardX: S("Horizontal position", ["center", "left", "right"]), vpos: S("Vertical position", ["center", "top", "bottom"]),
    width: R("Width", 300, 820, 460), cardScale: R("Scale %", 80, 120, 100),
    h2: H("Shape"), radius: R("Corner roundness", 0, 56, 20), padding: R("Inner padding", 8, 56, 24), gap: R("Spacing between items", 4, 40, 12),
    h3: H("Surface"), cardStyle: S("Card", ["card", "flat"], undefined, { hint: "Flat removes the card so content floats on the background." }), cardOpacity: R("Opacity", 0, 100, 85), blur: R("Glass blur", 0, 40, 12), shadow: R("Shadow strength", 0, 100, 40),
    h4: H("Border"), border: S("Style", ["thin", "glow", "gradient", "animated", "thick", "none"]), borderStyle: S("Line", ["solid", "dashed", "dotted", "double"], undefined, { if: ["border", "thin"] }), borderWidth: R("Width", 1, 6, 1),
    borderColor: C("Custom border color", "#e0a243", true), glowAmt: R("Glow amount", 0, 100, 40, { if: ["border", "glow"] }),
    h5: H("Interaction"), cardHover: S("Hover", ["none", "lift", "glow", "scale"]), cardFloat: B("Gently float up and down"), tilt: B("3D tilt on hover"), tiltStrength: R("Tilt strength", 2, 25, 10, { if: "tilt" }),
  },
  Avatar: {
    h1: H("Picture"), customAvatar: I("Custom picture (default: Discord avatar)", 400_000), avatarHide: B("Hide avatar"), avatarShape: S("Shape", ["circle", "rounded", "squircle", "square", "hexagon"]),
    avatarBorder: S("Border", ["accent", "white", "gradient", "rainbow", "none"]), avatarBorderWidth: R("Border width", 1, 10, 4, { if: ["avatarBorder", "!none"] }), avatarSize: R("Size", 48, 200, 104), avatarGlow: R("Glow", 0, 60, 0),
    avatarAnim: S("Animation", ["none", "float", "pulse", "ring", "spin"]), avatarOverlap: B("Overlap the banner", true),
    h2: H("Banner"), banner: I("Banner image / GIF", 1_000_000), bannerHeight: R("Banner height (0 hides)", 0, 300, 140), bannerFade: B("Fade banner into the card", false, { if: ["bannerHeight", "!0"] }), bannerBlur: R("Banner blur", 0, 24, 0, { if: ["bannerHeight", "!0"] }),
  },
  Background: {
    h1: H("Media"), background: I("Image / GIF", 1_400_000), bgFit: S("Image fit", ["cover", "contain", "tile"]), bgPosition: S("Image position", ["center", "top", "bottom"]), bgVideo: M("Video (.mp4 link, muted)", "https://…/clip.mp4"),
    h2: H("Color"), bgColor: C("Color", "#0d0a08", true), bgGradient: B("Gradient"), bgColor2: C("Gradient end", "#2a1236", false, { if: "bgGradient" }), bgAngle: R("Gradient angle", 0, 360, 135, { if: "bgGradient" }), bgAnimate: B("Animate the gradient", false, { if: "bgGradient" }),
    h3: H("Adjust"), overlay: R("Overlay strength", 0, 90, 25), overlayColor: C("Overlay color", "#000000"), bgBlur: R("Blur", 0, 30, 0), bgBrightness: R("Brightness", 30, 150, 100), bgSaturate: R("Saturation", 0, 200, 100),
    vignette: R("Vignette", 0, 100, 0), grain: R("Film grain", 0, 100, 0), bgZoom: B("Slow zoom animation"), bgParallax: B("Parallax on mouse move"), screenFx: S("Screen effect", ["none", "scanlines", "grain", "vignette"]),
  },
  Effects: {
    h1: H("Particles"), particles: S("Type", ["none", "snow", "stars", "embers", "rain", "bubbles", "fireflies", "petals", "confetti", "matrix", "hearts"]),
    particleCount: R("Count", 10, 220, 50, { if: ["particles", "!none"] }), particleSpeed: R("Speed", 1, 30, 10, { if: ["particles", "!none"] }), particleSize: R("Size %", 50, 250, 100, { if: ["particles", "!none"] }), particleColor: C("Color (default: accent)", "#ffffff", true, { if: ["particles", "!none"] }),
    h2: H("Cursor"), cursor: S("Cursor", ["default", "dot", "ring", "cross", "glow"]), cursorColor: C("Cursor color (default: accent)", "#ffffff", true, { if: ["cursor", "!default"] }), cursorTrail: S("Mouse trail", ["none", "sparkle", "dots", "glow", "rainbow"]),
    h3: H("Entry screen"), entry: B("Click-to-enter screen"), entryText: T("Entry text", 30, "click to enter", { if: "entry" }), entryStyle: S("Look", ["blur", "black", "accent"], undefined, { if: "entry" }), entryBlur: R("Entry blur", 0, 30, 14, { if: ["entryStyle", "blur"] }),
  },
  Layout: {
    l0: X("sections"),
  },
  Page: {
    h1: H("Browser tab & sharing"), tabTitle: T("Browser tab title", 60, "{name} (@{username}) · Haven", { hint: "Use {name} and {username}." }), titleAnim: S("Tab title animation", ["none", "typing", "marquee"]),
    ogDesc: T("Link-preview description (Discord, X…)", 200), favicon: M("Tab icon link (default: your avatar)", "https://…/icon.png"), noindex: B("Hide from search engines"), discover: B("Show my page on the Discover tab", true),
    h2: H("Footer"), footerText: T("Footer text", 40), hideFooter: B("Hide footer"),
    h3: H("Advanced"), customCss: A("Custom CSS", 4000, { kind: "code", hint: "Runs inside your page only. Target .pc (card), .pc-links a, .pc-name, .pc-avatar … External URLs and @import are removed." }),
  },
};

export const FIELDS = Object.fromEntries(Object.values(SCHEMA).flatMap((g) => Object.entries(g)).filter(([, f]) => !SPECIAL.has(f.t)));

// Fields that "design" presets reset (never content, media, or text).
const DESIGN_TABS = ["Theme", "Card", "Avatar", "Background", "Effects", "Links", "Socials"];
export const DESIGN_KEYS = DESIGN_TABS.flatMap((t) => Object.entries(SCHEMA[t])).filter(([, f]) => !SPECIAL.has(f.t) && !["img", "media", "text", "area"].includes(f.t)).map(([k]) => k);
export function applyPreset(name) {
  return { ...Object.fromEntries(DESIGN_KEYS.map((k) => [k, FIELDS[k].def])), ...PRESETS[name] };
}

// ───────────── config with defaults (+ migration from older shapes) ─────────────
export const cfg = (p = {}) => {
  const q = { ...p, musicUrl: p.musicUrl ?? p.music?.url, musicTitle: p.musicTitle ?? p.music?.title };
  return Object.fromEntries(Object.entries(FIELDS).map(([k, f]) => [k, q[k] ?? f.def]));
};

// ───────────── list items (stable ids so click stats survive reordering) ─────────────
export const rid = (n = 6) => Array.from({ length: n }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join("");
// Items saved by older versions have no id: they get "s:<index>" / "l:<index>", which are the exact keys v5 counted clicks under.
export const withIds = (list, pre) => (Array.isArray(list) ? list : []).map((x, i) => ({ ...x, id: x.id || `${pre}:${i}` }));
export const itemsOf = (p = {}) => ({
  socials: withIds(p.socials, "s"),
  links: withIds(p.links, "l").map((l) => ({ type: "link", ...l })),
  tracks: withIds(p.tracks, "t"),
});

// Playlist = the first track (Music tab fields) + extra tracks.
export function playlist(p = {}) {
  const c = cfg(p);
  const first = c.musicUrl ? [{ id: "main", url: c.musicUrl, title: c.musicTitle, artist: c.musicArtist, cover: c.musicCover }] : [];
  return [...first, ...itemsOf(p).tracks.filter((t) => t.url)];
}

// ───────────── layout sections ─────────────
export const SECTIONS = { identity: "Avatar, name & tagline", badges: "Custom badges", handle: "@username, pronouns, location", status: "Discord status", bio: "Bio", socials: "Social icons", links: "Links", music: "Music player (inline)" };
export const defaultSections = (c) => ["identity", "badges", "handle", "status", "bio", ...(c.socialsPos === "top" ? ["socials", "links"] : ["links", "socials"]), "music"].map((k) => ({ k, on: true }));
export function sectionsOf(p = {}) {
  const c = cfg(p), have = (Array.isArray(p.sections) ? p.sections : []).filter((s) => SECTIONS[s?.k]);
  if (!have.length) return defaultSections(c);
  const seen = new Set(have.map((s) => s.k));
  return [...have.map((s) => ({ k: s.k, on: s.on !== false })), ...Object.keys(SECTIONS).filter((k) => !seen.has(k)).map((k) => ({ k, on: k !== "music" }))];
}

// ───────────── helpers shared by renderer + dashboard ─────────────
export function ink(hex) {
  const m = /^#?([0-9a-f]{6})/i.exec(hex || "");
  if (!m) return "#111111";
  const n = parseInt(m[1], 16);
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255 > 0.6 ? "#111111" : "#ffffff";
}
// YouTube video id from watch / youtu.be / shorts / embed / music.youtube.com links (used by the music player).
export function ytId(u) {
  try {
    const url = new URL(u), h = url.hostname.replace(/^(www|m|music)\./, "");
    const ok = (x) => (/^[\w-]{11}$/.test(x || "") ? x : null);
    if (h === "youtu.be") return ok(url.pathname.slice(1));
    if (h === "youtube.com" || h === "youtube-nocookie.com") return url.pathname === "/watch" ? ok(url.searchParams.get("v")) : ok(url.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{11})/)?.[1]);
  } catch {}
  return null;
}
// Only YouTube + Spotify embeds are allowed.
export function embedSrc(u) {
  try {
    const url = new URL(u), h = url.hostname.replace(/^www\./, "");
    if (h === "youtu.be" && /^[\w-]{11}$/.test(url.pathname.slice(1))) return { src: `https://www.youtube-nocookie.com/embed/${url.pathname.slice(1)}`, ratio: "16/9" };
    if ((h === "youtube.com" || h === "m.youtube.com") && url.pathname === "/watch" && /^[\w-]{11}$/.test(url.searchParams.get("v") || ""))
      return { src: `https://www.youtube-nocookie.com/embed/${url.searchParams.get("v")}`, ratio: "16/9" };
    const m = h === "open.spotify.com" && url.pathname.match(/^\/(?:intl-[a-z]+\/)?(track|album|playlist|artist|episode|show)\/(\w{10,30})$/);
    if (m) return { src: `https://open.spotify.com/embed/${m[1]}/${m[2]}`, h: m[1] === "track" || m[1] === "episode" ? 152 : 352 };
  } catch {}
  return null;
}
export const iconKind = (v) => (PLATFORMS[v] ? "brand" : BUILTIN_ICONS.includes(v) ? "builtin" : /^si:[a-z0-9]{1,40}$/i.test(v || "") ? "si" : null);

// ───────────── validation (server side) ─────────────
const media = (v) => (/^https?:\/\/[^\s"'()<>\\]+$/.test(v) ? v.slice(0, 400) : "");
const link = (v) => { v = String(v || "").trim().slice(0, 500); return /^(https?:\/\/|mailto:|tel:)/i.test(v) ? v : ""; };
const image = (v, max) => (typeof v === "string" && v.length < max && (/^data:image\/(jpeg|png|webp|gif);base64,/.test(v) || media(v)) ? v : "");
const str = (v, n, multi) => { let s = String(v ?? "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, ""); if (!multi) s = s.replace(/[\r\n]+/g, " "); return s.slice(0, n); };
const hex6 = (v) => (/^#[0-9a-f]{6}$/i.test(v) ? String(v).toLowerCase() : "");

// Custom CSS is rendered as `.pc-stage { <css> }` (CSS nesting scopes it to the page). Strip anything that loads remote
// resources, uses escapes to hide them, or tries to close the wrapper.
export function cleanCss(src) {
  let s = String(src || "").slice(0, 4000);
  s = s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/[<\\]/g, "");
  s = s.replace(/@(import|charset|namespace|font-face|property)\b[^;{]*(;|\{[^}]*\})?/gi, "");
  s = s.replace(/(expression|image-set|-webkit-image-set|src|paint|element)\s*\(/gi, "x(").replace(/(behavior|-moz-binding)\s*:/gi, "x:").replace(/javascript\s*:/gi, "");
  s = s.replace(/url\s*\(\s*(?!["']?\s*data:image\/(?:png|jpe?g|gif|webp);)[^)]*\)/gi, "none");
  let d = 0;
  for (const ch of s) { if (ch === "{") d++; else if (ch === "}" && --d < 0) return ""; }
  return (s + "}".repeat(d)).trim();
}

const iconVal = (v) => (iconKind(v) ? (String(v).startsWith("si:") ? String(v).toLowerCase() : String(v)) : "");
const list = (v, max) => (Array.isArray(v) ? v.slice(0, max) : []);

export function sanitize(b) {
  const out = {};
  for (const [k, f] of Object.entries(FIELDS)) {
    const v = b[k];
    out[k] =
      f.t === "seg" ? (f.opts.includes(v) ? v : f.def) :
      f.t === "range" ? (Number.isFinite(+v) ? Math.min(f.hi, Math.max(f.lo, +v)) : f.def) :
      f.t === "bool" ? (v === undefined ? f.def : !!v) :
      f.t === "color" ? (/^#[0-9a-f]{6}$/i.test(v) ? v : f.clear ? "" : f.def) :
      f.t === "img" ? image(v, f.max) :
      f.t === "media" ? media(v) :
      f.kind === "code" ? cleanCss(v) :
      str(v, f.max || 280, f.t === "area");
  }
  const used = new Set();
  const uid = (x, pre) => { let i = /^[a-z0-9:_-]{1,16}$/i.test(x?.id || "") ? x.id : `${pre}${rid()}`; while (used.has(i)) i = `${pre}${rid()}`; used.add(i); return i; };

  out.badges = list(b.badges, 8).map((x) => str(x, 20)).filter(Boolean);
  out.socials = list(b.socials, 24).map((s) => ({ id: uid(s, "s"), type: s?.type, url: link(s?.url), label: str(s?.label, 24) })).filter((s) => PLATFORMS[s.type] && s.url);
  out.links = list(b.links, 40).map((l) => {
    const type = ["link", "header", "divider", "embed"].includes(l?.type) ? l.type : "link", base = { id: uid(l, "l"), type, hidden: !!l?.hidden };
    if (type === "divider") return base;
    if (type === "header") return { ...base, label: str(l.label, 60) };
    if (type === "embed") return { ...base, url: embedSrc(l.url) ? str(l.url, 300) : "" };
    return { ...base, label: str(l.label, 60), url: link(l.url), icon: iconVal(l.icon), desc: str(l.desc, 80), badge: str(l.badge, 14), color: hex6(l.color), thumb: media(l.thumb || ""), featured: !!l.featured };
  }).filter((l) => l.type === "divider" || (l.type === "header" ? l.label : l.type === "embed" ? l.url : l.label && l.url));
  out.tracks = list(b.tracks, 11).map((t) => ({ id: uid(t, "t"), url: media(t?.url || ""), title: str(t?.title, 60), artist: str(t?.artist, 60), cover: media(t?.cover || "") })).filter((t) => t.url);

  const seen = new Set();
  out.sections = list(b.sections, 20).filter((s) => SECTIONS[s?.k] && !seen.has(s.k) && seen.add(s.k)).map((s) => ({ k: s.k, on: s.on !== false }));
  for (const k of Object.keys(SECTIONS)) if (out.sections.length && !seen.has(k)) out.sections.push({ k, on: k !== "music" });
  return out;
}

// ───────────── presets ─────────────
export const PRESETS = {
  Haven: { theme: "dark", accent: "#e0a243", accent2: "#ffffff", font: "bricolage", border: "thin", nameEffect: "none", particles: "none", linkStyle: "outline", linkShape: "rounded", radius: 20, cardOpacity: 85 },
  Neon: { theme: "midnight", accent: "#ff2ec4", accent2: "#38bdf8", font: "mono", border: "animated", nameEffect: "neon", particles: "stars", linkStyle: "neon", linkShape: "pill", radius: 16, cardOpacity: 55, avatarAnim: "ring", cursor: "ring", cursorTrail: "sparkle", bgGradient: true, bgColor: "#07040f", bgColor2: "#1a0933" },
  Minimal: { theme: "light", accent: "#111111", accent2: "#555555", font: "inter", border: "thin", nameEffect: "none", particles: "none", linkStyle: "filled", linkShape: "square", radius: 8, cardOpacity: 100, bannerHeight: 0, bgColor: "#efefef", overlay: 0 },
  Sakura: { theme: "glass", accent: "#ff8fb8", accent2: "#c4b5fd", font: "outfit", nameFont: "pacifico", border: "gradient", nameEffect: "shimmer", particles: "petals", linkStyle: "glass", linkShape: "pill", radius: 30, cardOpacity: 30, blur: 20, bgGradient: true, bgColor: "#3b1030", bgColor2: "#1d1b4b" },
  Ember: { theme: "dark", accent: "#ff6a2b", accent2: "#ffd166", font: "playfair", border: "glow", nameEffect: "gradient", particles: "embers", linkStyle: "filled", linkShape: "rounded", radius: 14, cardOpacity: 70, bgGradient: true, bgColor: "#1a0805", bgColor2: "#3a1205", bgAngle: 180 },
  Matrix: { theme: "black", accent: "#22ff88", accent2: "#00ccff", font: "vt323", nameSize: 34, border: "glow", nameEffect: "glow", particles: "matrix", screenFx: "scanlines", linkStyle: "outline", linkShape: "square", radius: 2, cardOpacity: 60, cursor: "cross", bannerHeight: 0, avatarShape: "square", textScale: 115 },
  Ocean: { theme: "ocean", accent: "#38bdf8", accent2: "#818cf8", font: "space", border: "gradient", nameEffect: "gradient", particles: "bubbles", bgGradient: true, bgColor: "#04122b", bgColor2: "#0b3a5c", linkStyle: "soft", linkShape: "rounded", radius: 22, cardOpacity: 45 },
  Vapor: { theme: "midnight", accent: "#b794f6", accent2: "#4dd0e1", accent3: "#ff7eb6", font: "space", nameFont: "syne", nameEffect: "shimmer", border: "animated", particles: "stars", linkStyle: "gradient", radius: 24, cardOpacity: 60, bgGradient: true, bgColor: "#12002b", bgColor2: "#001b3a", bgAnimate: true, grain: 18 },
  Aurora: { theme: "ocean", accent: "#5eead4", accent2: "#a78bfa", accent3: "#38bdf8", font: "outfit", nameEffect: "gradient", border: "gradient", particles: "fireflies", linkStyle: "glass", radius: 26, cardOpacity: 42, blur: 22, bgGradient: true, bgColor: "#021a2b", bgColor2: "#1a0b3d", bgAnimate: true },
  Crimson: { theme: "rose", accent: "#e11d48", accent2: "#fb7185", font: "figtree", nameFont: "cinzel", nameEffect: "glow", border: "glow", particles: "embers", linkStyle: "soft", radius: 14, bgGradient: true, bgColor: "#0a0003", bgColor2: "#2a0410", bgAngle: 200 },
  Mono: { theme: "black", accent: "#ffffff", accent2: "#8a8a8a", font: "inter", nameUpper: true, nameSpacing: 3, nameSize: 24, border: "thin", linkStyle: "outline", linkShape: "square", radius: 4, bannerHeight: 0, cursor: "ring", bgColor: "#000000", overlay: 0 },
};
