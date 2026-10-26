import Link from "next/link";

import "../globals.css";
import "./terms.css";

import { Background, Nav, Footer } from "../SiteChrome";
import { BRAND, DISCORD_INVITE } from "../site";

export const metadata = {
  title: `Terms of Service | ${BRAND}`,
  description: `Community rules, moderation policies, and terms for participating in the ${BRAND} Discord server and website.`,
};

const UPDATED = "October 25, 2026";

const SECTIONS = [
  {
    id: "acceptance",
    title: "Accepting these terms",
    body: [
      `These terms apply to your participation in the ${BRAND} Discord server and your use of this website. By joining the server, chatting in its channels, participating in community activities, or using the website, you agree to follow these terms and any additional rules posted by our staff.`,
      `If you do not agree with these terms, you should leave the ${BRAND} Discord server and stop using the website. Continued participation means you accept the rules in their current form.`,
    ],
  },
  {
    id: "discord",
    title: "Discord's rules apply too",
    body: [
      `${BRAND} operates primarily as a Discord community. All members must follow Discord's Terms of Service, Community Guidelines, and applicable platform policies in addition to our own community rules.`,
      "You must meet Discord's minimum age requirement and any higher age requirement that applies in your location. Misusing Discord, violating its policies, or engaging in behavior that puts the community at risk may result in moderation action.",
      "Our rules apply across the server, including text channels, voice channels, direct interactions connected to community activities, event spaces, and other official community platforms where applicable.",
    ],
  },
  {
    id: "conduct",
    title: "Community rules and member conduct",
    body: [
      `The ${BRAND} community is intended to be a welcoming place for people to communicate, meet others, share interests, and participate in community activities. Every member is expected to contribute to that environment.`,
      "The following rules apply to everyone, regardless of their roles, reputation, time in the server, or relationship with staff.",
    ],
    list: [
      "Respect other members. Harassment, bullying, targeted abuse, threats, intimidation, and encouraging others to attack someone are not permitted.",
      "No hate speech, discriminatory abuse, or content intended to demean people based on protected or personal characteristics.",
      "No doxxing, threats to expose personal information, sharing private conversations without appropriate permission, or attempting to compromise another person's privacy.",
      "No NSFW, sexually explicit, excessively graphic, or shocking content unless a channel explicitly permits the relevant content. Sexual content involving minors is strictly prohibited everywhere.",
      "No spam, message flooding, repeated unwanted mentions, excessive emoji or character spam, or disruptive use of text and voice channels.",
      "No unsolicited advertising, referral spam, mass direct messages, or promotion of other servers, products, or services without permission where promotion is restricted.",
      "No scams, phishing, malicious downloads, suspicious links, token grabbers, account theft, or attempts to trick members into giving up credentials or money.",
      "No raiding, coordinated disruption, mass joining for malicious purposes, deliberate channel flooding, or organizing attacks against the server or its members.",
      "No impersonating staff, other members, public figures, bots, or official community accounts in a misleading or deceptive way.",
      "No ban evasion, punishment evasion, or using alternate accounts to bypass restrictions, mutes, kicks, bans, or verification requirements.",
      "No exploiting bots, automations, permissions, server integrations, or technical vulnerabilities to gain unauthorized access or disrupt community operations.",
      "No cheating, account theft, malicious exploits, or attempts to harm other people's games, accounts, devices, or online services.",
      "Do not misuse tickets, reports, polls, suggestions, or other community systems through spam, fabricated evidence, harassment, or deliberate abuse.",
      "Follow channel-specific instructions, pinned messages, event rules, and reasonable directions from authorized moderators.",
    ],
  },
  {
    id: "channels",
    title: "Channels, voice chat and server roles",
    body: [
      "Each channel may have its own purpose, posting requirements, and additional rules. Members are expected to read channel descriptions, pinned messages, and instructions before participating.",
      "Keep conversations in the appropriate channels, avoid derailing discussions intentionally, and do not use voice channels to harass others, play disruptive audio, evade moderation, or repeatedly interrupt community activities.",
      "Roles, permissions, private channels, verification access, and other server features are provided at the discretion of the community team. Attempting to obtain restricted access without authorization is prohibited.",
      "Staff may move conversations, remove messages, restrict access, change channel permissions, or adjust roles to maintain an organized and safe community.",
    ],
  },
  {
    id: "content",
    title: "Messages, media and member content",
    body: [
      "You are responsible for the messages, images, videos, links, files, and other content you share. Do not upload illegal content, malicious files, material you do not have permission to distribute, or content that violates these terms or Discord's policies.",
      `You retain ownership of content you create. By voluntarily posting content in ${BRAND}, you grant the community permission to display, reproduce, and share that content within the server and in related community materials, such as announcements, recaps, or promotional posts, where reasonably necessary for community purposes.`,
      "This permission does not transfer ownership of your work. Where practical, we will respect reasonable requests to stop using your content in future community materials. Content may remain in existing posts, screenshots, backups, or copies held by other members.",
      "Do not assume that messages posted in the server are private. Members may be able to view, save, quote, or screenshot content they can access.",
    ],
  },
  {
    id: "moderation",
    title: "Moderation, warnings and punishments",
    body: [
      `The ${BRAND} staff team is responsible for enforcing community rules and maintaining the server. Staff may remove messages, issue warnings, delete inappropriate content, timeout or mute members, restrict channel access, remove roles, kick members, or permanently ban accounts when considered appropriate.`,
      "Moderation decisions may be based on the severity of an incident, repeated behavior, available evidence, the impact on other members, and whether someone has attempted to evade previous enforcement. Serious violations may result in immediate action without a prior warning.",
      "Staff may take action against behavior that occurs outside the server when it directly affects community safety, involves harassment of members, threatens the community, or is otherwise relevant to maintaining a safe environment. This does not give staff unlimited authority over members' unrelated personal activities.",
      "Members must not harass, threaten, bribe, or repeatedly pressure moderators to reverse a decision. Disagreeing with staff is allowed when expressed respectfully, but disrupting the server over a moderation decision is not.",
      "If you believe a punishment was issued incorrectly, you may open a ticket through the server's designated support or appeals system, if available. Appeals should include relevant context and evidence. Submitting an appeal does not guarantee that a punishment will be reversed.",
      "Staff decisions are made to protect the community. While we aim to apply rules fairly and consistently, not every situation will receive the same outcome, and we may consider context when determining an appropriate response.",
    ],
  },
  {
    id: "staff",
    title: "Staff authority and reporting issues",
    body: [
      "Moderators and administrators may manage channels, enforce rules, investigate reports, and respond to disruptive behavior within their assigned responsibilities.",
      "Members should report rule violations through the designated ticket, report, or support channels instead of starting public arguments or encouraging retaliation.",
      "False reports, fabricated evidence, deliberate attempts to frame another member, and abuse of reporting systems may themselves result in moderation action.",
      "Being a staff member does not authorize someone to request your password, Discord authentication token, payment details, or other sensitive account credentials. Report suspicious requests to the appropriate community administrators.",
      "Staff members must act within the authority granted to their roles. If you have a serious concern about staff misconduct, use an available higher-level administrator or designated appeal channel.",
    ],
  },
  {
    id: "bots",
    title: "Bots, integrations and automated systems",
    body: [
      `The ${BRAND} server may use bots, applications, integrations, verification systems, tickets, and automated moderation tools to support community operations.`,
      "Do not exploit bot commands, abuse automated systems, spam interactions, manipulate verification, bypass access controls, or attempt to interfere with the operation of these services.",
      "Bots and integrations may be operated by third parties and may have their own terms and privacy policies. We cannot guarantee their uninterrupted availability, accuracy, or security.",
      "Access to bot features, automated roles, and other integrations may be changed, restricted, or removed when necessary.",
    ],
  },
  {
    id: "events",
    title: "Events, giveaways and community perks",
    body: [
      "Community events, competitions, giveaways, game nights, and other activities may have additional eligibility requirements and rules. Participants must follow the instructions published for each activity.",
      "Giveaway manipulation, fraudulent entries, impersonation, vote manipulation, exploiting participation systems, and attempts to claim prizes dishonestly are prohibited.",
      "Events may be rescheduled, changed, suspended, or cancelled when necessary. Where a giveaway or event has specific published conditions, those conditions will also apply.",
      "Roles, badges, perks, access privileges, and other community benefits are not guaranteed permanent entitlements. They may be changed, suspended, or removed for operational, moderation, or eligibility reasons.",
      "Unless an activity explicitly states otherwise, participation does not guarantee a prize, reward, special role, or other benefit.",
    ],
  },
  {
    id: "affiliates",
    title: "Affiliates and third-party communities",
    body: [
      `The ${BRAND} website or server may reference affiliated communities, creators, projects, services, or other third-party resources.`,
      "An affiliate listing or recommendation does not mean that we own, operate, or control the third party. We are not responsible for their independent moderation decisions, policies, content, availability, or conduct.",
      "Members should use reasonable caution when joining external servers, downloading files, following links, or sharing personal information with third parties. Their own terms and privacy policies apply.",
      "Affiliate relationships, listings, and community partnerships may change or end at any time.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy and personal information",
    body: [
      "Discord processes server activity under its own terms and privacy policy. Depending on your permissions and the features in use, your username, profile information, messages, and other activity may be visible to other members or authorized moderators.",
      "Do not share passwords, authentication tokens, financial information, private addresses, or other sensitive personal information in public channels. Be careful when sharing personal details even with people you know online.",
      "Authorized staff may review relevant messages, reports, or available moderation records when investigating rule violations, responding to safety concerns, or enforcing server policies. Access should be limited to legitimate community-management purposes.",
      "This website does not currently require a general member account as a condition of use. If account-based features or additional data collection are introduced, applicable privacy information may be updated accordingly.",
      "We do not control Discord's data processing or the privacy practices of external services. Review their policies for details about how they handle your information.",
    ],
  },
  {
    id: "disclaimer",
    title: "Community disclaimer and limitations",
    body: [
      `${BRAND} is an independently operated online community. Unless expressly stated otherwise, the server and website are provided on an as-available basis, without guarantees of uninterrupted access, error-free operation, or the behavior of individual members.`,
      "We may experience downtime, technical issues, service changes, moderation disputes, or disruptions caused by Discord or other third-party services.",
      "We are not responsible for every statement, action, transaction, or interaction between individual members. Members participate at their own discretion and should use appropriate judgment when communicating, trading, gaming, or interacting with others.",
      "Nothing in these terms excludes or limits any liability or consumer right that cannot lawfully be excluded or limited under applicable law.",
    ],
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: [
      "We may revise these terms, community rules, and moderation procedures as the server grows or its needs change. The updated date at the top of this page indicates when these terms were last revised.",
      "Important changes may be announced in the Discord server when appropriate. Members are responsible for remaining familiar with the current rules.",
      "Continuing to participate in the community after revised terms take effect constitutes acceptance of the updated terms, to the extent permitted by applicable law. If you do not agree, you should stop participating.",
    ],
  },
  {
    id: "contact",
    title: "Questions, reports and appeals",
    body: [
      "If you have questions about these terms, need assistance, want to report a rule violation, or wish to appeal a moderation decision, join the Discord server and use the appropriate support or ticket channel, if available.",
      "Please provide a clear explanation and any relevant evidence when submitting a report or appeal. Do not post sensitive personal information publicly or use support systems to harass other members.",
      "For urgent account-security issues, never send passwords or authentication tokens to staff. Use Discord's official account-security and support resources where appropriate.",
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
          <span className="terms-badge">Community Guidelines</span>
          <h1>Terms of Service</h1>
          <p>
            Respect the community, follow the rules, and help make this a
            place people actually want to be.
          </p>
          <small className="terms-updated">Last updated {UPDATED}</small>
        </div>
      </section>

      <section className="wrap terms-layout">
        <aside className="terms-toc glass" aria-label="On this page">
          <h2>Community Handbook</h2>

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
              <h2>Become part of the community</h2>
              <p>
                By joining, you agree to follow these terms and respect
                the people who make this community what it is. You can also{" "}
                <Link className="text-link" href="/affiliates">
                  explore our affiliates
                </Link>
                .
              </p>
            </div>

            <a
              className="btn"
              href={DISCORD_INVITE}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join the Discord
            </a>
          </div>
        </article>
      </section>

      <Footer />
    </main>
  );
}
