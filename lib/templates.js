import { DESIGN_KEYS, sanitize } from "./schema";

// A template is the *look* of a page: colours, fonts, card shape, effects. Never names, links, text, music or uploaded pictures.
// Background / banner only come along when they are plain web links (not uploaded files).
const LINKED = ["background", "banner", "bgVideo"];
export function designOf(b) {
  const s = sanitize(b || {}), o = {};
  for (const k of DESIGN_KEYS) o[k] = s[k];
  for (const k of LINKED) if (typeof s[k] === "string" && /^https?:\/\//i.test(s[k]) && s[k].length < 400) o[k] = s[k];
  return o;
}
export const MAX_PER_PERSON = 12;
