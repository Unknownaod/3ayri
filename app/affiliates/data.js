// Affiliates data for the 3ayri site.
// Live data comes from the partnership bot's API; the static list below is only
// a fallback if the API is unreachable.

const API_URL =
  process.env.NEXT_PUBLIC_AFFILIATES_API_URL ||
  process.env.AFFILIATES_API_URL ||
  "https://3ayri.fades.lol/api/affiliates";

const REVALIDATE_SECONDS = 60;
const TIMEOUT_MS = 5000;

// Fallback used when the API is down (also keeps old imports of AFFILIATES working).
export const AFFILIATES = [
  {
    slug: "greed",
    name: "greed",
    tagline: "Discord's powerful all-in-one app.",
    description:
      "Greed is Discord's powerful all-in-one app, bringing useful features together to enhance your Discord server experience.",
    about: [
      "Greed is Discord's powerful all-in-one app, designed to bring useful features together in one place and help communities get more out of their Discord servers.",
      "Whether you're building a community or managing an existing server, Greed offers an all-in-one experience designed to make Discord better.",
    ],
    logo:
      "https://greed.best/_next/image?url=%2F_greed%2Fprod%2FFbRpGeAAB5c%2F_next%2Fstatic%2Fmedia%2Fgreed.0f4e408c.png&w=256&q=100",
    banner: null,
    accent: "#8b5cf6",
    tags: ["Discord Bot", "All-in-One", "Community"],
    stats: [],
    links: [
      { label: "Visit Website", url: "https://greed.best", primary: true },
      { label: "Join Discord", url: "https://discord.gg/greed" },
    ],
    featured: true,
  },
];

// Make sure every affiliate has the full shape, even if the API omits a field.
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

// All approved affiliates (featured first). Use in server components / route handlers.
export async function getAffiliates() {
  try {
    const res = await fetch(API_URL, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) throw new Error(`API responded with ${res.status}`);

    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("API did not return an array");

    return data.filter(item => item && item.slug).map(normalize);
  } catch (error) {
    console.error("Could not load affiliates from API, using fallback:", error.message);
    return AFFILIATES;
  }
}

// One affiliate by slug, or null. Use for the open-profile page.
export async function getAffiliate(slug) {
  const affiliates = await getAffiliates();
  return affiliates.find(a => a.slug === String(slug).toLowerCase()) ?? null;
}
