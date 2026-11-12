// ONE schema drives everything: dashboard controls, API validation, defaults, rendering.
// Add a field here and it appears in the dashboard, saves, and is available as cfg(p).key
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
].map(([k, v]) => [v.slug, v]));

export const FONTS = {
  figtree: '"Figtree",system-ui,sans-serif', bricolage: '"Bricolage Grotesque",system-ui,sans-serif',
  space: '"Space Grotesk",system-ui,sans-serif', outfit: '"Outfit",system-ui,sans-serif',
  playfair: '"Playfair Display",Georgia,serif', mono: '"JetBrains Mono",ui-monospace,monospace',
  orbitron: '"Orbitron",system-ui,sans-serif', pacifico: '"Pacifico",cursive', caveat: '"Caveat",cursive',
  system: "system-ui,sans-serif", serif: "Georgia,serif",
};

const T = (label, max = 60, ph = "") => ({ t: "text", label, def: "", max, ph });
const A = (label, max = 280) => ({ t: "area", label, def: "", max });
const C = (label, def, clear) => ({ t: "color", label, def, clear });
const S = (label, opts, def) => ({ t: "seg", label, opts, def: def ?? opts[0] });
const R = (label, lo, hi, def) => ({ t: "range", label, lo, hi, def });
const B = (label, def = false) => ({ t: "bool", label, def });
const I = (label, max = 900_000) => ({ t: "img", label, max, def: "" });
const M = (label, ph) => ({ t: "media", label, def: "", ph });

const H = (label) => ({ t: "head", label });
const F = Object.keys(FONTS);

export const SCHEMA = {
  Profile: {
    h1: H("Identity"), name: T("Display name", 32), tagline: T("Tagline (under your name)", 60), pronouns: T("Pronouns", 20), location: T("Location", 40), showHandle: B("Show @username", true),
    h2: H("Bio"), bio: A("Bio"), bioSize: R("Bio text size", 12, 22, 15), typewriter: B("Type out the bio"), typeSpeed: R("Typing speed (ms/char)", 10, 120, 35),
    h3: H("Badges & counter"), badges: { t: "badges" }, showViews: B("Show view counter", true),
    h4: H("Page"), tabTitle: T("Browser tab title", 60), footerText: T("Footer text", 40), hideFooter: B("Hide footer"),
  },
  Theme: {
    h1: H("Colors"), theme: S("Base theme", ["dark", "light", "midnight", "black", "glass"]), accent: C("Accent", "#e0a243"), accent2: C("Second accent", "#ffffff"),
    textColor: C("Text color", "#f4e6dc", true), cardColor: C("Card color", "#1d1713", true), nameColor: C("Name color (solid)", "#ffffff", true),
    h2: H("Typography"), font: S("Font", F), nameFont: S("Name font", ["inherit", ...F]), nameSize: R("Name size", 18, 64, 28), nameUpper: B("UPPERCASE name"),
    nameEffect: S("Name effect", ["none", "gradient", "glow", "shimmer", "rainbow"]),
    h3: H("Motion"), entryAnim: S("Card entrance", ["fade", "slide", "pop", "none"]),
  },
  Card: {
    h1: H("Shape"), layout: S("Alignment", ["center", "left"]), vpos: S("Vertical position", ["center", "top"]), width: R("Width", 300, 760, 460), cardScale: R("Scale %", 80, 120, 100),
    radius: R("Corner roundness", 0, 44, 20), padding: R("Inner padding", 8, 48, 24), gap: R("Spacing between items", 4, 28, 12),
    h2: H("Surface"), cardOpacity: R("Opacity", 0, 100, 85), blur: R("Glass blur", 0, 40, 12), shadow: R("Shadow strength", 0, 100, 40),
    h3: H("Border"), border: S("Style", ["thin", "glow", "gradient", "none"]), borderStyle: S("Line", ["solid", "dashed", "dotted", "double"]), borderWidth: R("Width", 1, 6, 1), borderColor: C("Custom border color", "#e0a243", true),
    h4: H("Interaction"), cardHover: S("Hover", ["none", "lift", "glow"]), tilt: B("3D tilt on hover"), tiltStrength: R("Tilt strength", 2, 25, 10),
  },
  Avatar: {
    h1: H("Picture"), customAvatar: I("Custom picture (default: Discord avatar)", 400_000), avatarHide: B("Hide avatar"), avatarShape: S("Shape", ["circle", "rounded", "square"]),
    avatarBorder: S("Border", ["accent", "white", "none"]), avatarSize: R("Size", 56, 180, 104), avatarGlow: R("Glow", 0, 60, 0), avatarAnim: S("Animation", ["none", "float", "pulse", "ring"]),
    h2: H("Banner"), banner: I("Banner image / GIF", 1_000_000), bannerHeight: R("Banner height (0 hides)", 0, 280, 140),
  },
  Background: {
    h1: H("Media"), background: I("Image / GIF", 1_400_000), bgVideo: M("Video (.mp4 link, muted)", "https://…/clip.mp4"), bgPosition: S("Image position", ["center", "top", "bottom"]),
    h2: H("Color"), bgColor: C("Color", "#0d0a08", true), bgGradient: B("Gradient"), bgColor2: C("Gradient end", "#2a1236"), bgAngle: R("Gradient angle", 0, 360, 135),
    h3: H("Adjust"), overlay: R("Dark overlay", 0, 90, 25), bgBlur: R("Blur", 0, 24, 0), bgBrightness: R("Brightness", 30, 150, 100), bgSaturate: R("Saturation", 0, 200, 100),
    bgZoom: B("Slow zoom animation"), bgParallax: B("Parallax on mouse move"), screenFx: S("Screen effect", ["none", "scanlines", "grain", "vignette"]),
  },
  Effects: {
    h1: H("Particles"), particles: S("Type", ["none", "snow", "stars", "embers", "rain", "bubbles"]), particleCount: R("Count", 10, 160, 50), particleSpeed: R("Speed", 1, 30, 10),
    h2: H("Cursor"), cursor: S("Cursor", ["default", "dot", "ring", "cross"]),
    h3: H("Entry screen"), entry: B("Click-to-enter screen"), entryText: T("Entry text", 30, "click to enter"), entryBlur: R("Entry blur", 0, 30, 14),
  },
  Music: {
    musicUrl: M("Audio link (direct .mp3)", "https://…/song.mp3"), musicTitle: T("Song title", 60), musicAuto: B("Start when visitor enters", true),
    musicVolume: R("Volume", 0, 100, 50), musicPlayer: S("Player", ["pill", "hidden"]),
  },
  Socials: {
    iconStyle: S("Icon style", ["circle", "square", "bare"]), iconColor: S("Icon color", ["auto", "accent"]), iconSize: R("Icon size", 14, 40, 22), socialGap: R("Spacing", 4, 24, 10),
    socialsPos: S("Position", ["top", "bottom"]), socialHover: S("Hover", ["lift", "glow", "none"]),
  },
  Links: {
    h1: H("Buttons"), linkStyle: S("Style", ["outline", "filled", "glass"]), linkShape: S("Shape", ["rounded", "pill", "square"]), linkLayout: S("Layout", ["list", "grid"]),
    linkAlign: S("Text align", ["center", "left"]), linkHover: S("Hover", ["lift", "glow", "slide", "none"]), linkSize: R("Height", 36, 72, 48), linkBorderWidth: R("Border width", 1, 4, 1),
    h2: H("Colors"), linkColor: C("Button color", "#e0a243", true), linkTextColor: C("Button text color", "#111111", true),
  },
  Discord: {
    presence: B("Show live Discord status on my page"), presenceStyle: S("Style", ["card", "compact", "dot"]), presenceAvatar: B("Show Discord avatar", true), presenceName: B("Show Discord name + @username", true),
    badgePlacement: S("Discord badges", ["card", "name", "both", "off"]), presenceActivity: B("Show games / Spotify", true), presenceCustom: B("Show custom status", true),
  },
};

export const FIELDS = Object.fromEntries(Object.values(SCHEMA).flatMap((g) => Object.entries(g)).filter(([, f]) => f.t !== "badges" && f.t !== "head"));

// full config with defaults (also migrates the old music:{url,title} shape)
export const cfg = (p = {}) => {
  const q = { ...p, musicUrl: p.musicUrl ?? p.music?.url, musicTitle: p.musicTitle ?? p.music?.title };
  return Object.fromEntries(Object.entries(FIELDS).map(([k, f]) => [k, q[k] ?? f.def]));
};

const media = (v) => (/^https?:\/\/[^\s"'()<>\\]+$/.test(v) ? v.slice(0, 400) : "");
const link = (v) => (/^https?:\/\//i.test(v) ? String(v).slice(0, 300) : "");
const image = (v, max) => (typeof v === "string" && v.length < max && (/^data:image\/(jpeg|png|webp|gif);base64,/.test(v) || media(v)) ? v : "");

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
      String(v || "").slice(0, f.max || 280);
  }
  out.badges = (Array.isArray(b.badges) ? b.badges : []).slice(0, 6).map((x) => String(x || "").slice(0, 20)).filter(Boolean);
  out.socials = (Array.isArray(b.socials) ? b.socials : []).slice(0, 20).map((s) => ({ type: s.type, url: link(s.url) })).filter((s) => PLATFORMS[s.type] && s.url);
  out.links = (Array.isArray(b.links) ? b.links : []).slice(0, 20)
    .map((l) => ({ label: String(l.label || "").slice(0, 40), url: link(l.url), icon: PLATFORMS[l.icon] ? l.icon : "" })).filter((l) => l.label && l.url);
  return out;
}

export const PRESETS = {
  Haven: { theme: "dark", accent: "#e0a243", accent2: "#ffffff", font: "bricolage", border: "thin", nameEffect: "none", particles: "none", linkStyle: "outline", linkShape: "rounded", radius: 20, cardOpacity: 85 },
  Neon: { theme: "midnight", accent: "#ff2ec4", accent2: "#38bdf8", font: "mono", border: "glow", nameEffect: "glow", particles: "stars", linkStyle: "glass", linkShape: "pill", radius: 16, cardOpacity: 55, avatarAnim: "ring" },
  Minimal: { theme: "light", accent: "#111111", accent2: "#555555", font: "figtree", border: "thin", nameEffect: "none", particles: "none", linkStyle: "filled", linkShape: "square", radius: 8, cardOpacity: 100, bannerHeight: 0 },
  Sakura: { theme: "glass", accent: "#ff8fb8", accent2: "#c4b5fd", font: "outfit", border: "gradient", nameEffect: "shimmer", particles: "snow", linkStyle: "glass", linkShape: "pill", radius: 30, cardOpacity: 35, blur: 20 },
  Ember: { theme: "dark", accent: "#ff6a2b", accent2: "#ffd166", font: "playfair", border: "glow", nameEffect: "gradient", particles: "embers", linkStyle: "filled", linkShape: "rounded", radius: 14, cardOpacity: 70 },
  Matrix: { theme: "black", accent: "#22ff88", accent2: "#00ccff", font: "mono", border: "glow", nameEffect: "glow", particles: "rain", screenFx: "scanlines", linkStyle: "outline", linkShape: "square", radius: 4, cardOpacity: 60, cursor: "cross" },
  Ocean: { theme: "midnight", accent: "#38bdf8", accent2: "#818cf8", font: "space", border: "gradient", nameEffect: "gradient", particles: "bubbles", bgGradient: true, bgColor: "#04122b", bgColor2: "#0b3a5c", linkStyle: "glass", linkShape: "rounded", radius: 22, cardOpacity: 45 },
};
