import { redis } from "@/lib/db";
import { cfg } from "@/lib/schema";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

// Public pages only: has a username, not hidden, not turned off in Discover, not set to noindex.
export default async function sitemap() {
  const fixed = ["", "/templates", "/status", "/terms", "/privacy"].map((p) => ({ url: `${SITE}${p}` }));
  try {
    const rows = await redis.listProfiles(5000);
    const pages = rows
      .map(([, p]) => p)
      .filter((p) => p?.username && !p.hidden && p.discover !== false && !cfg(p).noindex)
      .map((p) => ({ url: `${SITE}/${p.username}`, lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined }));
    return [...fixed, ...pages];
  } catch { return fixed; }
}
