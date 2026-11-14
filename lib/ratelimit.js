import { redis } from "./db";

// Fixed-window rate limit stored in Mongo (works across serverless instances).
// limit("save:" + id, 30, 60) = at most 30 per 60 seconds. Returns { ok, retry } (retry = seconds until the window resets).
export async function limit(key, max, windowSec) {
  const win = Math.floor(Date.now() / (windowSec * 1000));
  try {
    const n = await redis.incr(`rl:${key}:${win}`, windowSec + 5);
    return { ok: n <= max, retry: Math.max(1, windowSec - Math.floor((Date.now() / 1000) % windowSec)) };
  } catch { return { ok: true, retry: 0 }; } // if the counter itself fails, don't lock people out
}
export const tooMany = (r) => `You're doing that too fast. Try again in ${r.retry} second${r.retry === 1 ? "" : "s"}.`;
