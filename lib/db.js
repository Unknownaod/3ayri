import { MongoClient } from "mongodb";

function getClient() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  return (globalThis._haven_mongo ??= new MongoClient(process.env.MONGODB_URI).connect());
}
const col = async () => (await getClient()).db("haven").collection("kv");

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
  async del(key) { await (await col()).deleteOne({ _id: key }); },
  async incr(key) {
    const d = await (await col()).findOneAndUpdate({ _id: key }, { $inc: { value: 1 } }, { upsert: true, returnDocument: "after" });
    return d?.value ?? 1;
  },
};

export const RESERVED = ["dashboard", "api", "giveaways", "affiliates", "partners", "login", "logout", "admin", "settings", "_next"];
export const validUsername = (u) => /^[a-z0-9_]{3,20}$/.test(u) && !RESERVED.includes(u);

export const dayKey = (t = Date.now()) => new Date(t).toISOString().slice(0, 10);
