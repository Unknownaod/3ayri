/*
=========================================================
AFFILIATES
Add, remove, or edit affiliates here. Each one gets a card on
/affiliates and an open profile when "View more" is clicked.
The profile is also linkable: /affiliates#your-slug

FIELDS
  slug         unique, lowercase, no spaces (used in the link)
  name         display name
  tagline      one short line under the name
  description  short blurb shown on the card
  about        array of paragraphs shown on the full profile
  logo         path in /public, e.g. "/affiliates/nova.png"  (null = initials)
  banner       path in /public for the profile header       (null = accent glow)
  accent       hex color for this affiliate's glow and avatar
  tags         small labels, e.g. ["Gaming", "Community"]
  stats        optional [{ label: "Members", value: "5,000+" }]
  links        [{ label, url, primary? }]  primary = the big button
  featured     true = also shown on the home page
=========================================================
*/

export const AFFILIATES = [
  {
    slug: "example-one",
    name: "Example Server",
    tagline: "Replace this with their one-line pitch.",
    description:
      "A short blurb about this affiliate. Two sentences is plenty for the card.",
    about: [
      "This is the full profile. Write a few paragraphs about who they are, what they do, and why you're partnered with them.",
      "You can add as many paragraphs as you like. Each string in this list becomes its own paragraph.",
    ],
    logo: null,
    banner: null,
    accent: "#8b3cff",
    tags: ["Community", "Gaming"],
    stats: [{ label: "Members", value: "5,000+" }],
    links: [
      { label: "Join Discord", url: "https://discord.gg/example", primary: true },
      { label: "YouTube", url: "https://youtube.com/@example" },
      { label: "Twitch", url: "https://twitch.tv/example" },
    ],
    featured: true,
  },
  {
    slug: "example-two",
    name: "Second Example",
    tagline: "Another affiliate, another pitch.",
    description:
      "Swap this out for a real affiliate. Give them a logo and a banner to make their profile stand out.",
    about: [
      "Tell visitors what makes this affiliate worth checking out.",
    ],
    logo: null,
    banner: null,
    accent: "#3b82f6",
    tags: ["Creator"],
    stats: [],
    links: [
      { label: "Website", url: "https://example.com", primary: true },
      { label: "X", url: "https://x.com/example" },
    ],
    featured: true,
  },
  {
    slug: "example-three",
    name: "Third Example",
    tagline: "Keep adding as the partnerships grow.",
    description:
      "There's no limit. The grid fills in automatically as you add more.",
    about: [
      "Every field is optional except slug, name, and links, so you can start small and fill in profiles over time.",
    ],
    logo: null,
    banner: null,
    accent: "#ec4899",
    tags: ["Esports", "Events"],
    stats: [{ label: "Members", value: "1,200+" }],
    links: [
      { label: "Join Discord", url: "https://discord.gg/example3", primary: true },
      { label: "TikTok", url: "https://tiktok.com/@example" },
      { label: "Instagram", url: "https://instagram.com/example" },
      { label: "Website", url: "https://example.org" },
    ],
    featured: true,
  },
];
