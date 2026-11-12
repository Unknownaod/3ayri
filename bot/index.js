// Always-on worker (Railway / Fly / Render worker / any VPS — NOT Vercel). Writes Discord presence into the same Mongo.
import { Client, GatewayIntentBits } from "discord.js";
import { MongoClient } from "mongodb";

const { DISCORD_TOKEN, DISCORD_GUILD_ID, MONGODB_URI } = process.env;
const kv = (await new MongoClient(MONGODB_URI).connect()).db("haven").collection("kv");
const put = (k, value) => kv.updateOne({ _id: k }, { $set: { value } }, { upsert: true });
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences] });

let known = new Set();
const refresh = async () => { known = new Set((await kv.find({ _id: /^profile:/ }, { projection: { _id: 1 } }).toArray()).map((d) => d._id.slice(8))); };
const last = new Map();

function slim(p) {
  const a = p.activities || [];
  const c = a.find((x) => x.type === 4), s = a.find((x) => x.type === 2 && x.name === "Spotify"), g = a.find((x) => [0, 1, 3].includes(x.type));
  const custom = c ? `${c.emoji && !c.emoji.id ? c.emoji.name + " " : ""}${c.state || ""}`.trim() : "";
  const act = s ? { kind: "spotify", title: s.details, sub: s.state, art: s.assets?.largeImageURL?.() || null, start: s.timestamps?.start?.getTime() || null, end: s.timestamps?.end?.getTime() || null }
    : g ? { kind: g.type === 1 ? "stream" : g.type === 3 ? "watch" : "game", title: g.name, sub: g.details || g.state || "", art: g.assets?.largeImageURL?.() || null, start: g.timestamps?.start?.getTime() || null } : null;
  return { status: p.status || "offline", custom, act };
}

async function push(p) {
  const id = p?.userId;
  if (!id || !known.has(id)) return;
  const v = slim(p), sig = JSON.stringify(v);
  if (last.get(id) === sig) return;
  last.set(id, sig);
  await put(`presence:${id}`, { ...v, ts: Date.now() });
}

client.once("ready", async () => {
  await refresh();
  const guild = await client.guilds.fetch(DISCORD_GUILD_ID);
  for (const p of guild.presences.cache.values()) await push(p);
  const beat = () => put("bot:heartbeat", Date.now());
  beat(); setInterval(beat, 30_000); setInterval(refresh, 60_000);
  console.log(`Presence bot online as ${client.user.tag}, watching ${guild.name}`);
});
client.on("presenceUpdate", (_, p) => { if (p.guild?.id === DISCORD_GUILD_ID) push(p).catch(console.error); });
client.login(DISCORD_BOT_TOKEN);
