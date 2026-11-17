import { MongoClient } from "mongodb";

function getClient() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  return (globalThis._haven_mongo ??= new MongoClient(process.env.MONGODB_URI).connect());
}
const col = async () => {
  const c = (await getClient()).db("haven").collection("kv");
  // Short-lived keys (rate limits, error log) carry an `expireAt` date; Mongo deletes them for us. Created once per server.
  globalThis._haven_ttl ??= c.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 }).catch(() => {});
  return c;
};

export const redis = {
  async get(key) {
    const d = await (await col()).findOne({ _id: key });
    return d?.value ?? null;
  },
  async mget(keys) {
    if (!keys.length) return [];
    const docs = await (await col()).find({ _id: { $in: keys } }).toArray();
    const m = new Map(docs.map((d) => [d._id, d.value]));
    return keys.map((k) => m.get(k) ?? null);
  },
  async set(key, value, opts) {
    const c = await col();
    if (opts?.nx) {
      try { await c.insertOne({ _id: key, value }); return "OK"; }
      catch (e) { if (e.code === 11000) return null; throw e; }
    }
    await c.updateOne({ _id: key }, { $set: { value } }, { upsert: true });
    return "OK";
  },
  // All documents whose key starts with a prefix, as [key, value] (used by Discover).
  async list(prefix, limit = 1000) {
    const esc = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const docs = await (await col()).find({ _id: { $regex: `^${esc}` } }).limit(limit).toArray();
    return docs.map((d) => [d._id, d.value]);
  },
  async del(key) { await (await col()).deleteOne({ _id: key }); },
  // Adds 1 and returns the new total. With ttlSec the key disappears by itself after that many seconds (used for rate limits).
  async incr(key, ttlSec) {
    const upd = { $inc: { value: 1 }, ...(ttlSec ? { $setOnInsert: { expireAt: new Date(Date.now() + ttlSec * 1000) } } : {}) };
    const d = await (await col()).findOneAndUpdate({ _id: key }, upd, { upsert: true, returnDocument: "after" });
    return d?.value ?? 1;
  },
  // Like set(), but the key expires after ttlSec seconds.
  async setex(key, value, ttlSec) {
    await (await col()).updateOne({ _id: key }, { $set: { value, expireAt: new Date(Date.now() + ttlSec * 1000) } }, { upsert: true });
  },
  // Profile list for Discover without the heavy parts: uploaded pictures over `big` characters are replaced by the marker "__big__".
  async listProfiles(limit = 5000, big = 120000) {
    const keep = (f) => ({ $cond: [{ $gt: [{ $strLenCP: { $ifNull: [`$value.${f}`, ""] } }, big] }, "__big__", `$value.${f}`] });
    const docs = await (await col()).aggregate([
      { $match: { _id: { $regex: "^profile:" } } }, { $limit: limit },
      { $set: { "value.background": keep("background"), "value.banner": keep("banner"), "value.customAvatar": keep("customAvatar") } },
      { $unset: ["value.tracks", "value.customCss", "value.music", "value.bgVideoPoster"] },
    ]).toArray();
    return docs.map((d) => [d._id, d.value]);
  },
  // Site-wide totals for the landing page: public pages, all-time views and link clicks, templates, and pages created in the last 24 h.
  async stats() {
    const c = await col(), live = { _id: { $regex: "^profile:" }, "value.username": { $type: "string", $ne: "" }, "value.hidden": { $ne: true } };
    const sum = async (re) => (await c.aggregate([{ $match: { _id: { $regex: re } } }, { $group: { _id: null, n: { $sum: "$value" } } }]).toArray())[0]?.n || 0;
    const [pages, today, templates, views, clicks] = await Promise.all([
      c.countDocuments(live), c.countDocuments({ ...live, "value.createdAt": { $gt: Date.now() - 864e5 } }),
      c.countDocuments({ _id: { $regex: "^template:" } }), sum("^views:[^:]+$"), sum("^clicks:"),
    ]);
    return { pages, today, templates, views, clicks };
  },
};

export const RESERVED = ["status", "dashboard", "api", "giveaways", "affiliates", "templates", "terms", "privacy", "partners", "login", "logout", "admin", "settings", "_next"];
export const validUsername = (u) => /^[a-z0-9_]{3,20}$/.test(u) && !RESERVED.includes(u);

export const dayKey = (t = Date.now()) => new Date(t).toISOString().slice(0, 10);
