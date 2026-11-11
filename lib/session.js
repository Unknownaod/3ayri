import crypto from "crypto";
import { cookies } from "next/headers";

const SECRET = process.env.SESSION_SECRET;
const sign = (v) => crypto.createHmac("sha256", SECRET).update(v).digest("base64url");

export function makeToken(id) {
  const v = `${id}.${Date.now() + 30 * 864e5}`;
  return `${v}.${sign(v)}`;
}

export async function getSessionId() {
  const t = (await cookies()).get("haven_session")?.value;
  if (!t) return null;
  const [id, exp, sig] = t.split(".");
  const good = sign(`${id}.${exp}`);
  const ok = sig && sig.length === good.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good));
  return ok && Date.now() < Number(exp) ? id : null;
}
