// Affiliates data for the 3ayri site.
// All affiliate data comes directly from the partnership bot's API.

const API_URL =
  process.env.NEXT_PUBLIC_AFFILIATES_API_URL ||
  process.env.AFFILIATES_API_URL ||
  "https://3ayri.fades.lol/api/affiliates";

const REVALIDATE_SECONDS = 60;
const TIMEOUT_MS = 5000;

// Empty fallback when the API is unavailable.
export const AFFILIATES = [];

// Normalize API data.
function normalize(item) {
  return {
    slug: String(item.slug),
    name: String(item.name ?? item.slug),
    tagline: String(item.tagline ?? ""),
    description: String(item.description ?? ""),
    about: Array.isArray(item.about) ? item.about : [],
    logo: item.logo ?? "",
    banner: item.banner ?? null,
    accent: item.accent || "#8b5cf6",
    tags: Array.isArray(item.tags) ? item.tags : [],
    stats: Array.isArray(item.stats) ? item.stats : [],
    links: Array.isArray(item.links) ? item.links : [],
    featured: Boolean(item.featured),
  };
}

// Get all affiliates directly from the API.
export async function getAffiliates() {
  try {
    const res = await fetch(API_URL, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) {
      throw new Error(`API responded with ${res.status}`);
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("API did not return an array");
    }

    return data
      .filter((item) => item && item.slug)
      .map(normalize);
  } catch (error) {
    console.error("Could not load affiliates from API:", error.message);

    return [];
  }
}

// Get one affiliate by slug.
export async function getAffiliate(slug) {
  const affiliates = await getAffiliates();

  return (
    affiliates.find(
      (item) => item.slug === String(slug).toLowerCase()
    ) ?? null
  );
}
