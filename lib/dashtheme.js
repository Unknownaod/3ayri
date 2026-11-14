// Dashboard appearance: each person can recolour their own dashboard. Stored on their profile as `dashTheme`.
export const DASH_PRESETS = {
  Gold: { bg: "#0b0907", panel: "#14100c", text: "#f6ece0", accent: "#e0a243" },
  Midnight: { bg: "#080b14", panel: "#0f1424", text: "#e8ecf8", accent: "#6d8cff" },
  Ocean: { bg: "#061018", panel: "#0b1b28", text: "#e4f1fa", accent: "#38bdf8" },
  Mint: { bg: "#06100d", panel: "#0c1a15", text: "#e6f6ef", accent: "#3ddc97" },
  Violet: { bg: "#0d0816", panel: "#160f24", text: "#f0e9fb", accent: "#a678f5" },
  Rose: { bg: "#120709", panel: "#1c0d11", text: "#fbe9ee", accent: "#f0577f" },
  Mono: { bg: "#0a0a0a", panel: "#141414", text: "#f2f2f2", accent: "#ffffff" },
  Light: { bg: "#f4f1ec", panel: "#ffffff", text: "#1c1813", accent: "#c9821a" },
};
const COLORS = ["bg", "panel", "text", "accent"];
const hex = (v) => (/^#[0-9a-f]{6}$/i.test(v) ? v.toLowerCase() : "");
const ink = (h) => { const n = parseInt(h.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255 > 0.6 ? "#111111" : "#ffffff"; };

// Used when saving: keep only valid colours, a known font and the compact switch.
export function cleanDash(d, fonts = {}) {
  d = d && typeof d === "object" ? d : {};
  const o = {};
  for (const k of COLORS) if (hex(d[k])) o[k] = hex(d[k]);
  if (typeof d.font === "string" && fonts[d.font]) o.font = d.font;
  if (d.compact === true) o.compact = true;
  if (typeof d.preset === "string" && DASH_PRESETS[d.preset]) o.preset = d.preset;
  return o;
}

// The full colour set to show in the editor (missing values come from the default).
export const dashColors = (t) => ({ ...DASH_PRESETS.Gold, ...Object.fromEntries(COLORS.filter((k) => t?.[k]).map((k) => [k, t[k]])) });

// Inline CSS variables for <main className="dash">. Empty when nothing was customised, so the stylesheet defaults apply.
export function dashStyle(t, fontName) {
  if (!t || !(COLORS.some((k) => t[k]) || t.font)) return {};
  const c = dashColors(t), s = {};
  if (COLORS.some((k) => t[k])) {
    Object.assign(s, {
      "--bg": c.bg, "--panel": c.panel, "--text": c.text, "--accent": c.accent, "--on": ink(c.accent),
      "--panel2": `color-mix(in srgb, ${c.panel} 90%, ${c.text})`,
      "--line": `color-mix(in srgb, ${c.panel} 82%, ${c.text})`,
      "--muted": `color-mix(in srgb, ${c.text} 62%, ${c.bg})`,
    });
  }
  if (t.font && fontName) s["--dfont"] = `"${fontName}"`;
  return s;
}
