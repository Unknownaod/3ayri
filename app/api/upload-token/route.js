// app/api/upload-token/route.js
//
// Hands a logged-in person a short permission slip so their browser can send a picture straight to the image server
// (skipping Vercel, which refuses requests over ~4.5 MB). The slip names the person, expires in 5 minutes, and is signed with IMG_KEY,
// which the image server also has. The key itself never leaves the server.
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getSessionId } from "@/lib/session";
import { redis } from "@/lib/db";
import { storageOn } from "@/lib/storage";
import { bad, safe, sameOrigin } from "@/lib/api";
import { limit, tooMany } from "@/lib/ratelimit";

export const POST = safe("upload.token", async (req) => {
  if (!sameOrigin(req)) return bad("Blocked: this request came from another site.", 403);
  const id = await getSessionId();
  if (!id) return bad("unauthenticated", 401);
  if (!storageOn()) return NextResponse.json({ on: false });   // no image server set up: the editor falls back to the old way
  if (await redis.get(`ban:${id}`)) return bad("Your account has been restricted by staff, so uploads aren't available.", 403);
  const rl = await limit(`uptok:${id}`, 30, 3600);
  if (!rl.ok) return bad(tooMany(rl), 429);
  const exp = Math.floor(Date.now() / 1000) + 300;
  const body = `u1.${id}.${exp}`;
  const sig = crypto.createHmac("sha256", process.env.IMG_KEY).update(body).digest("base64url");
  const base = String(process.env.IMG_BASE_URL).replace(/\/+$/, "");
  return NextResponse.json({ on: true, url: `${base}/upload`, base, token: `${body}.${sig}` });
});
