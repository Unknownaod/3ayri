import "../globals.css";
import "./affiliates.css";

import { Background, Nav, Footer } from "../SiteChrome";
import { BRAND } from "../site";
import AffiliatesView from "./AffiliatesView";
import { getAffiliates } from "./data";

export const metadata = {
  title: `Affiliates | ${BRAND}`,
  description: `The servers and creators ${BRAND} is partnered with.`,
};

export const revalidate = 60;

export default async function AffiliatesPage() {
  const affiliates = await getAffiliates();

  return (
    <main className="site">
      <Background />

      <Nav current="affiliates" />

      <AffiliatesView affiliates={affiliates} />

      <Footer />
    </main>
  );
}
