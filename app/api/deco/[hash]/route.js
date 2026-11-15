// app/api/deco/[hash]/route.js
//
// Serves a Discord avatar-decoration image from our own address. The profile page measures the picture on a canvas to size the frame,
// and a browser won't let a page read pixels from another site's image unless that site allows it. Going through here makes it ours.
// Only a plain asset hash is accepted, and it's only ever fetched from Discord's decoration folder, so this can't be pointed anywhere else.

const HASH = /^[\w-]{1,80}$/;

export async function GET(_req, { params }) {
  const { hash } = await params;
  if (!HASH.test(hash)) return new Response("Not found", { status: 404 });
  try {
    const r = await fetch(`https://cdn.discordapp.com/avatar-decoration-presets/${hash}.png`, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return new Response("Not found", { status: 404 });
    const type = r.headers.get("content-type") || "";
    if (!type.startsWith("image/")) return new Response("Not found", { status: 404 });
    const buf = await r.arrayBuffer();
    if (buf.byteLength > 2_000_000) return new Response("Too large", { status: 413 });
    return new Response(buf, { headers: { "Content-Type": type, "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable" } });
  } catch {
    return new Response("Unavailable", { status: 502 });
  }
}
