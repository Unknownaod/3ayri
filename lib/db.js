import { MongoClient } from "mongodb";

// Reuse one connection across requests (serverless-safe)
const client = (globalThis._haven_mongo ??= new MongoClient(process.env.MONGODB_URI).connect());
const col = async () => (await client).db("haven").collection("kv");

export const redis = {
  async get(key) {
    const d = await (await col()).findOne({ _id: key });
    return d?.value ?? null;
  },
  async set(key, value, opts) {
    const c = await col();
    if (opts?.nx) {
      try {
        await c.insertOne({ _id: key, value });
        return "OK";
      } catch (e) {
        if (e.code === 11000) return null; // key already exists
        throw e;
      }
    }
    await c.updateOne({ _id: key }, { $set: { value } }, { upsert: true });
    return "OK";
  },
  async del(key) {
    await (await col()).deleteOne({ _id: key });
  },
};

export const RESERVED = ["dashboard", "api", "giveaways", "partners", "login", "logout", "admin", "settings", "_next"];
export const validUsername = (u) => /^[a-z0-9_]{3,20}$/.test(u) && !RESERVED.includes(u);
