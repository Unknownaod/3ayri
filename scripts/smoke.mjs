// Quick check after a deploy.   node scripts/smoke.mjs https://havenshq.xyz [someusername]
// Public pages and APIs only. It never signs in or changes anything.
const base = (process.argv[2] || "").replace(/\/$/, "");
const user = process.argv[3];
if (!base) { console.error("Usage: node scripts/smoke.mjs https://yoursite [username]"); process.exit(1); }

let fail = 0;
async function check(name, path, test, init) {
  try {
    const r = await fetch(base + path, { redirect: "manual", ...init });
    const body = await r.text();
    const ok = await test(r, body);
    console.log(`${ok ? "ok  " : "FAIL"} ${name} (${r.status})`);
    if (!ok) fail++;
  } catch (e) { console.log(`FAIL ${name}: ${e.message}`); fail++; }
}
const json = (b) => { try { return JSON.parse(b); } catch { return null; } };

await check("home page loads", "/", (r) => r.status === 200);
await check("templates page loads", "/templates", (r) => r.status === 200);
await check("terms page loads", "/terms", (r) => r.status === 200);
await check("privacy page loads", "/privacy", (r) => r.status === 200);
await check("unknown page is a 404", "/definitely-not-a-real-page-xyz", (r) => r.status === 404);
await check("robots.txt", "/robots.txt", (r, b) => r.status === 200 && /Sitemap:/i.test(b));
await check("sitemap.xml", "/sitemap.xml", (r, b) => r.status === 200 && b.includes("<urlset"));
await check("discover API", "/api/discover?sort=popular", (r, b) => r.status === 200 && Array.isArray(json(b)?.profiles));
await check("templates API", "/api/templates", (r, b) => r.status === 200 && Array.isArray(json(b)?.templates));
await check("/api/me needs sign-in", "/api/me", (r) => r.status === 401);
await check("moderation needs staff", "/api/mod", (r) => r.status === 403);
await check("cross-site writes are blocked", "/api/report", (r) => r.status === 403, { method: "POST", headers: { Origin: "https://evil.example", "Content-Type": "application/json" }, body: "{}" });
await check("security headers", "/", (r) => r.headers.get("x-content-type-options") === "nosniff");
if (user) await check(`profile /${user} loads`, `/${user}`, (r) => r.status === 200);

console.log(fail ? `\n${fail} check(s) failed.` : "\nAll checks passed.");
process.exit(fail ? 1 : 0);
