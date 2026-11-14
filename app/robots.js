import { SITE } from "@/lib/site";
export default function robots() {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard"] }], sitemap: `${SITE}/sitemap.xml` };
}
