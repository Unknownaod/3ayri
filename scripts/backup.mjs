// Backs up the whole Haven database to one JSON file (profiles, templates, images, reports, bans...).
//   MONGODB_URI=... node scripts/backup.mjs            -> backups/haven-2026-11-14.json
//   MONGODB_URI=... node scripts/backup.mjs restore backups/haven-2026-11-14.json
// Needs the `mongodb` package (already a dependency of the site). Rate-limit and error entries are skipped.
import { MongoClient } from "mongodb";
import fs from "node:fs";

const uri = process.env.MONGODB_URI;
if (!uri) { console.error("Set MONGODB_URI first."); process.exit(1); }
const skip = /^(rl:|err:|repd:|flagsTry:|staff:)/;
const client = new MongoClient(uri);
await client.connect();
const col = client.db("haven").collection("kv");

if (process.argv[2] === "restore") {
  const file = process.argv[3];
  if (!file || !fs.existsSync(file)) { console.error("Usage: node scripts/backup.mjs restore <file.json>"); process.exit(1); }
  const docs = JSON.parse(fs.readFileSync(file, "utf8")).docs;
  let n = 0;
  for (const d of docs) { await col.replaceOne({ _id: d._id }, d, { upsert: true }); n++; }
  console.log(`Restored ${n} entries from ${file}. Existing entries with the same key were overwritten.`);
} else {
  const docs = (await col.find({}).toArray()).filter((d) => !skip.test(d._id));
  fs.mkdirSync("backups", { recursive: true });
  const out = `backups/haven-${new Date().toISOString().slice(0, 10)}.json`;
  fs.writeFileSync(out, JSON.stringify({ at: new Date().toISOString(), count: docs.length, docs }));
  console.log(`Saved ${docs.length} entries to ${out} (${(fs.statSync(out).size / 1048576).toFixed(1)} MB). Keep a copy somewhere other than this computer.`);
}
await client.close();
