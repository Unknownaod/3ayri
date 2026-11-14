import { NextResponse } from "next/server";
import { redis } from "./db";

// Small helpers shared by the API routes.
export const bad = (error, status = 400) => NextResponse.json({ error }, { status });

// The visitor's IP (behind Vercel / a proxy), used for rate limits on public endpoints.
export const ipOf = (req) => (req.headers?.get?.("x-forwarded-for") || req.headers?.get?.("x-real-ip") || "unknown").split(",")[0].trim().slice(0, 64);

// Blocks requests that come from another website (cross-site form posts etc.).
// Browsers always send Origin on POST/PUT/DELETE; if it's there it has to match this site.
export function sameOrigin(req) {
  const o = req.headers?.get?.("origin");
  if (!o) return true;
  try { return new URL(o).host === (req.headers.get("x-forwarded-host") || req.headers.get("host")); } catch { return false; }
}

// Wraps a route handler: logs unexpected errors (staff can read them in the Moderation tab) and answers with a clean message.
export const safe = (name, fn) => async (...args) => {
  try { return await fn(...args); }
  catch (e) {
    await logError(name, e);
    return bad("Something went wrong on our side. Try again in a moment.", 500);
  }
};

const WEEK = 7 * 864e5 / 1000;
export async function logError(where, e) {
  try {
    console.error(`[haven] ${where}:`, e);
    const id = `err:${Date.now()}:${Math.random().toString(36).slice(2, 6)}`;
    await redis.setex(id, { at: Date.now(), where, message: String(e?.message || e).slice(0, 300), stack: String(e?.stack || "").split("\n").slice(0, 4).join("\n").slice(0, 600) }, WEEK);
  } catch {}
}
