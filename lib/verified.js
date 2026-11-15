import { redis } from "./db";
import { isStaff, isFounder } from "./staff";

// The Verified badge (public/verified.png). Only people allowed by VERIFIED_BY can give or remove it, from the Moderation panel;
// it's saved under its own key (verified:<id>), not on the profile, so the owner can never change it from the editor.
//
// Who may give / remove it:  "founder" (default: only founders)  or  "staff" (any staff member).
// Set VERIFIED_BY=staff on Vercel to open it to staff, or change DEFAULT_VERIFIED_BY below. Anything else counts as "founder".
const DEFAULT_VERIFIED_BY = "founder";
export const verifiedBy = () => (String(process.env.VERIFIED_BY || DEFAULT_VERIFIED_BY).trim().toLowerCase() === "staff" ? "staff" : "founder");

export const vkey = (id) => `verified:${id}`;
export const canVerify = async (id) => (id ? (verifiedBy() === "staff" ? isStaff(id) : isFounder(id)) : false);
export const isVerified = async (id) => !!(id && (await redis.get(vkey(id))));

// For lists (Discover): which of these user ids are verified. One database read.
export async function verifiedSet(ids) {
  if (!ids.length) return new Set();
  const vals = await redis.mget(ids.map(vkey));
  return new Set(ids.filter((_, i) => vals[i]));
}
