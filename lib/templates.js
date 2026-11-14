import { DESIGN_KEYS, sanitize } from "./schema";

// A template is the *look* of a page: colours, fonts, card shape, effects, plus the background / banner pictures.
// Never names, links, text, music or the avatar.
// Web links stay links. Uploaded background / banner files are split off into `images` so the template list stays small.
const LINKED = ["background", "banner", "bgVideo"];
export const IMAGE_FIELDS = ["background", "banner"];
export function designOf(b) {
  const s = sanitize(b || {}), cfg = {}, images = {};
  for (const k of DESIGN_KEYS) cfg[k] = s[k];
  for (const k of LINKED) {
    const v = s[k];
    if (typeof v !== "string") continue;
    if (/^https?:\/\//i.test(v) && v.length < 400) cfg[k] = v;
    else if (IMAGE_FIELDS.includes(k) && v.startsWith("data:image/")) images[k] = v;
  }
  return { cfg, images };
}
// Where a stored template picture is served from (the ?v changes when the template is republished).
export const imgUrl = (id, field, at) => `/api/templates/${id}/img/${field}?v=${at || 0}`;
export const MAX_PER_PERSON = 8;
