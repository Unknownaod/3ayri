import { FIELDS } from "./schema";

// Pictures (background, banner, avatar) are saved as files on the image server (see imgserver/) and the profile keeps only a link.
// Off until IMG_BASE_URL and IMG_KEY are set; then pictures stay inside the database like before.
const base = () => String(process.env.IMG_BASE_URL || "").replace(/\/+$/, "");
export const storageOn = () => !!(base() && process.env.IMG_KEY);
const DATA = /^data:(image\/(?:png|jpe?g|gif|webp));base64,([A-Za-z0-9+/=]+)$/;
const IMG_FIELDS = Object.entries(FIELDS).filter(([, f]) => f.t === "img").map(([k]) => k);

async function put(dataUrl) {
  const m = DATA.exec(dataUrl);
  if (!m) return dataUrl;                                  // already a link (or an unsupported type, which sanitize already blanked)
  const r = await fetch(`${base()}/upload`, { method: "POST", headers: { Authorization: `Bearer ${process.env.IMG_KEY}`, "Content-Type": m[1] }, body: Buffer.from(m[2], "base64"), signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`image server answered ${r.status}`);
  return `${base()}/${(await r.json()).name}`;
}

// Takes a sanitized profile and swaps uploaded pictures for links. Throws if the image server can't be reached.
export async function offloadImages(clean) {
  if (!storageOn()) return clean;
  const out = { ...clean };
  for (const k of IMG_FIELDS) if (typeof out[k] === "string" && out[k].startsWith("data:")) out[k] = await put(out[k]);
  return out;
}
