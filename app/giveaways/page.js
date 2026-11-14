import "./giveaways.css";

import { Background, Nav, Footer } from "../SiteChrome";
import { BRAND, DISCORD_INVITE } from "../site";
import GiveawaysClient from "./GiveawaysClient";

export const metadata = {
  title: `${BRAND} — Giveaways`,
  description: `Live giveaways from the ${BRAND} community. Follow the countdowns, see who entered, and check past winners.`,
};

export default function GiveawaysPage() {
  return (
    <main className="hx">
      <Background />
      <Nav current="giveaways" />
      <GiveawaysClient brand={BRAND} inviteUrl={DISCORD_INVITE} />
      <Footer />
    </main>
  );
}
