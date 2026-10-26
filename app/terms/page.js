import Link from "next/link";

import "../globals.css";
import "./terms.css";

import { Background, Nav, Footer } from "../SiteChrome";
import { BRAND, DISCORD_INVITE } from "../site";

export const metadata = {
  title: `Terms of Service | ${BRAND}`,
  description: `The rules and terms for being part of the ${BRAND} Discord community and website.`,
};

const UPDATED = "October 25, 2026";

const SECTIONS = [
  {
    id: "acceptance",
    title: "Accepting these terms",
    body: [
      `These terms cover your use of the ${BRAND} Discord server and this website. By joining the server or using the site, you agree to them. If you don’t agree, please don’t join or use either.`,
    ],
  },
  {
    id: "discord",
    title: "Discord’s rules apply too",
    body: [
      `${BRAND} lives on Discord, so you also need to follow Discord’s Terms of Service and Community Guidelines at all times. Anything that gets you in trouble with Discord can also get you removed from here.`,
      "You must be old enough to use Discord where you live. In most places that means at least 13, and some countries set it higher.",
    ],
  },
  {
    id: "conduct",
    title: "How we expect you to act",
    body: ["We keep this simple. Be a good person to the people around you."],
    list: [
      "Treat everyone with respect. No harassment, bullying, threats or targeted abuse.",
      "No hate speech, or discrimination based on who someone is.",
      "No sexual content involving minors, ever. We report it.",
      "No NSFW, graphic or shocking content outside of channels that explicitly allow it, and none involving minors anywhere.",
      "No spam, unsolicited ads, scams, phishing or malicious links.",
      "No doxxing or sharing other people’s private information.",
      "No cheating tools, exploits or anything that harms other people’s games or accounts.",
      "No ban evasion, alt accounts used to get around a punishment, or impersonating staff or other members.",
    ],
  },
  {
    id: "content",
    title: "Your content",
    body: [
      "You are responsible for what you post. Only share things you have the right to share. Please don’t post anyone else’s work, music, images or personal information without permission.",
      `You keep ownership of what you create. By posting it in the server, you give ${BRAND} permission to display it there and in related community spaces, such as event announcements, for as long as it’s posted.`,
    ],
  },
  {
    id: "moderation",
    title: "Moderation",
    body: [
      "Our moderators keep the community safe and can remove content, mute, kick or ban members at their discretion, with or without warning. We try to be fair, and we try to explain our decisions when it makes sense, but we don’t have to.",
      "If you think a decision was a mistake, you can open a ticket in the Discord and a staff member will take a look.",
    ],
  },
  {
    id: "events",
    title: "Events, giveaways and roles",
    body: [
      "Events, game nights and giveaways can change, be postponed or be cancelled. Roles, perks and channel access are privileges rather than rights, and may be changed or removed.",
    ],
  },
  {
    id: "affiliates",
    title: "Affiliates and third-party links",
    body: [
      `The affiliates page lists communities and creators we know and like. Being listed isn’t a guarantee about what they say or do, and we don’t control their servers, sites or content. Third-party links are visited at your own risk, and their own terms and policies apply.`,
    ],
  },
  {
    id: "privacy",
    title: "Privacy",
    body: [
      "Most of what you do in the server is handled by Discord under Discord’s Privacy Policy. Messages in public channels can be seen by other members. Please think before sharing personal details.",
      "This website doesn’t ask you to create an account. If that ever changes, we’ll update these terms and tell you what we collect.",
    ],
  },
  {
    id: "disclaimer",
    title: "No guarantees",
    body: [
      `${BRAND} is a community run by volunteers. The server and website are provided as they are, without promises that they will always be available, error-free or safe from other people’s behavior.`,
      `To the extent the law allows, ${BRAND} and its staff aren’t liable for losses or damages that come from using the server or site, or from what other members say or do.`,
    ],
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: [
      "We may update these terms from time to time. When we do, we’ll change the date at the top of this page. If you keep using the server or site after an update, that means you accept the new version.",
    ],
  },
  {
    id: "contact",
    title: "Questions",
    body: [
      "Got a question about these terms, or want to report something? Join the Discord and open a ticket, and a staff member will get back to you.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="site">
      <Background />

      <Nav current="terms" />

      <section className="terms-head">
        <div className="page-glow" aria-hidden="true" />

        <div className="wrap">
          <span className="terms-badge">Legal</span>
          <h1>Terms of Service</h1>
          <p>The short version: be kind, follow Discord’s rules, and help keep this place good.</p>
          <small className="terms-updated">Last updated {UPDATED}</small>
        </div>
      </section>

      <section className="wrap terms-layout">
        <aside className="terms-toc glass" aria-label="On this page">
          <h2>On this page</h2>

          <ol>
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.title}</a>
              </li>
            ))}
          </ol>
        </aside>

        <article className="terms-body">
          {SECTIONS.map((section, index) => (
            <section className="terms-section" id={section.id} key={section.id}>
              <h2>
                <span className="terms-num">{index + 1}</span>
                {section.title}
              </h2>

              {section.body.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}

              {section.list && (
                <ul>
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <div className="terms-cta glass">
            <div>
              <h2>Ready to jump in?</h2>
              <p>
                Joining means you agree to these terms. You can also{" "}
                <Link className="text-link" href="/affiliates">
                  meet our affiliates
                </Link>
                .
              </p>
            </div>

            <a className="btn" href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
              Join the Discord
            </a>
          </div>
        </article>
      </section>

      <Footer />
    </main>
  );
}
