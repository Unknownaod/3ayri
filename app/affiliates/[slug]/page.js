// Save as: app/affiliates/[slug]/page.jsx

import { notFound } from "next/navigation";

import { Nav, Footer } from "../../SiteChrome";
import AffiliatesView from "../AffiliatesView";
import { getAffiliate, getAffiliates } from "../data";
import { BRAND } from "../../site";

// Builds the tab title and the link preview (Discord, Twitter, etc.).
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const affiliate = await getAffiliate(slug);

  if (!affiliate) {
    return { title: { absolute: `Affiliates | ${BRAND}` } };
  }

  // `absolute` skips any "%s | haven" template set in your root layout.
  const title = `Affiliates | ${affiliate.name}`;
  const description =
    affiliate.tagline ||
    affiliate.description ||
    `${affiliate.name} is a ${BRAND} affiliate.`;
  const image = affiliate.logoSources?.[0] || affiliate.logo || null;

  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: BRAND,
      images: image ? [{ url: image, alt: `${affiliate.name} logo` }] : undefined,
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function AffiliatePage({ params }) {
  const { slug } = await params;
  const affiliates = await getAffiliates();
  const key = String(slug).toLowerCase();

  if (!affiliates.some((item) => item.slug === key)) notFound();

  // Match whatever wrapper your existing /affiliates page uses.
  return (
    <main className="site">
      <Nav current="affiliates" />
      <AffiliatesView affiliates={affiliates} initialSlug={key} />
      <Footer />
    </main>
  );
}
