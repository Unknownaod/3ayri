// Moves pictures already stored inside profiles (base64) onto the image server, and replaces them with links.
// Safe by default: only reports. Add --apply to change the database. Run scripts/backup.mjs first.
//   MONGODB_URI=... IMG_BASE_URL=https://img.example.com IMG_KEY=... node scripts/migrate-images.mjs [--apply]
import { MongoClient } from "mongodb";
const { MONGODB_URI, IMG_KEY } = process.env, base = String(process.env.IMG_BASE_URL || "").replace(/\/+$/, "");
if (!MONGODB_URI || !base || !IMG_KEY) { console.error("Set MONGODB_URI, IMG_BASE_URL and IMG_KEY."); process.exit(1); }
const apply = process.argv.includes("--apply");
const DATA = /^data:(image\/(?:png|jpe?g|gif|webp));base64,([A-Za-z0-9+/=]+)$/;
const client = await new MongoClient(MONGODB_URI).connect();
const col = client.db("haven").collection("kv");
let profiles = 0, files = 0, bytes = 0, failed = 0;
for await (const d of col.find({ _id: { $regex: "^profile:" } })) {
  const set = {};
  for (const k of ["customAvatar", "banner", "background"]) {
    const m = typeof d.value?.[k] === "string" && DATA.exec(d.value[k]);
    if (!m) continue;
    bytes += d.value[k].length; files++;
    if (!apply) continue;
    try {
      const r = await fetch(`${base}/upload`, { method: "POST", headers: { Authorization: `Bearer ${IMG_KEY}`, "Content-Type": m[1] }, body: Buffer.from(m[2], "base64") });
      if (!r.ok) throw new Error(r.status);
      set[`value.${k}`] = `${base}/${(await r.json()).name}`;
    } catch (e) { failed++; console.error(`  ${d._id} ${k}: ${e.message}`); }
  }
  if (Object.keys(set).length) { await col.updateOne({ _id: d._id }, { $set: set }); profiles++; }
}
console.log(`${apply ? "Moved" : "Would move"} ${files} pictures (${(bytes / 1048576).toFixed(1)} MB of database)${apply ? ` for ${profiles} profiles, ${failed} failed` : ". Run again with --apply to do it."}`);
await client.close();
