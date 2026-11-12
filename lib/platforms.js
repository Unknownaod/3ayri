// slug = icon name on simpleicons.org. Add a platform by adding a line.
export const PLATFORMS = {
  discord:    { name: "Discord",    slug: "discord",    ph: "https://discord.gg/yourinvite" },
  instagram:  { name: "Instagram",  slug: "instagram",  ph: "https://instagram.com/you" },
  tiktok:     { name: "TikTok",     slug: "tiktok",     ph: "https://tiktok.com/@you" },
  youtube:    { name: "YouTube",    slug: "youtube",    ph: "https://youtube.com/@you" },
  x:          { name: "X",          slug: "x",          ph: "https://x.com/you" },
  twitch:     { name: "Twitch",     slug: "twitch",     ph: "https://twitch.tv/you" },
  kick:       { name: "Kick",       slug: "kick",       ph: "https://kick.com/you" },
  spotify:    { name: "Spotify",    slug: "spotify",    ph: "https://open.spotify.com/user/you" },
  soundcloud: { name: "SoundCloud", slug: "soundcloud", ph: "https://soundcloud.com/you" },
  github:     { name: "GitHub",     slug: "github",     ph: "https://github.com/you" },
  steam:      { name: "Steam",      slug: "steam",      ph: "https://steamcommunity.com/id/you" },
  reddit:     { name: "Reddit",     slug: "reddit",     ph: "https://reddit.com/u/you" },
  snapchat:   { name: "Snapchat",   slug: "snapchat",   ph: "https://snapchat.com/add/you" },
  telegram:   { name: "Telegram",   slug: "telegram",   ph: "https://t.me/you" },
  paypal:     { name: "PayPal",     slug: "paypal",     ph: "https://paypal.me/you" },
  roblox:     { name: "Roblox",     slug: "roblox",     ph: "https://roblox.com/users/123/profile" },
};

export const FONTS = {
  sans: '"Figtree",system-ui,sans-serif',
  display: '"Bricolage Grotesque",system-ui,sans-serif',
  serif: 'Georgia,"Times New Roman",serif',
  mono: 'ui-monospace,Menlo,Consolas,monospace',
  rounded: 'ui-rounded,"Nunito","Segoe UI",system-ui,sans-serif',
};

// First option in each list is the default.
export const CHOICES = {
  theme: ["dark", "light", "midnight", "glass"],
  font: Object.keys(FONTS),
  layout: ["center", "left"],
  width: ["normal", "narrow", "wide"],
  border: ["thin", "glow", "none"],
  avatarShape: ["circle", "rounded", "square"],
  avatarBorder: ["accent", "white", "none"],
  nameEffect: ["none", "gradient", "glow"],
  linkStyle: ["outline", "filled", "glass"],
  linkShape: ["rounded", "pill", "square"],
  linkLayout: ["list", "grid"],
  iconStyle: ["circle", "square", "bare"],
  iconColor: ["auto", "accent"],
  particles: ["none", "snow", "stars", "embers"],
};

// [min, max, default]
export const RANGES = {
  cardOpacity: [0, 100, 85], blur: [0, 30, 12], radius: [0, 40, 20],
  bannerHeight: [0, 260, 140], avatarSize: [64, 160, 104], iconSize: [16, 32, 22],
  overlay: [0, 90, 25], bgBlur: [0, 20, 0],
};

export const PRESETS = {
  Haven:   { theme: "dark", accent: "#e0a243", font: "display", border: "thin", nameEffect: "none", particles: "none", linkStyle: "outline", linkShape: "rounded", radius: 20, cardOpacity: 85, bannerHeight: 140 },
  Neon:    { theme: "midnight", accent: "#ff2ec4", accent2: "#38bdf8", font: "mono", border: "glow", nameEffect: "glow", particles: "stars", linkStyle: "glass", linkShape: "pill", radius: 16, cardOpacity: 55 },
  Minimal: { theme: "light", accent: "#111111", font: "sans", border: "thin", nameEffect: "none", particles: "none", linkStyle: "filled", linkShape: "square", radius: 8, cardOpacity: 100, bannerHeight: 0 },
  Sakura:  { theme: "glass", accent: "#ff8fb8", accent2: "#c4b5fd", font: "rounded", border: "glow", nameEffect: "gradient", particles: "snow", linkStyle: "glass", linkShape: "pill", radius: 28, cardOpacity: 40 },
  Ember:   { theme: "dark", accent: "#ff6a2b", accent2: "#ffd166", font: "serif", border: "glow", nameEffect: "gradient", particles: "embers", linkStyle: "filled", linkShape: "rounded", radius: 14, cardOpacity: 70 },
};
