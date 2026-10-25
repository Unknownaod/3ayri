import "../globals.css";
import "./affiliates.css";

import { Background, Nav, Footer } from "../SiteChrome";
import { BRAND } from "../site";
import AffiliatesView from "./AffiliatesView";

export const metadata = {
  title: `Affiliates | ${BRAND}`,
  description: `The servers and creators ${BRAND} is partnered with.`,
};

export default function AffiliatesPage() {
  return (
    <main className="site">
      <Background />

      <Nav current="affiliates" />

      <AffiliatesView />

      <Footer />
    </main>
  );
}
