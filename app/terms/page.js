import LegalPage from "../LegalPage";
import { CONTACT, SERVER_INVITE } from "@/lib/site";

export const metadata = { title: "Terms of Service · Haven", description: "The rules for using Haven." };
// NOTE: This is a plain-language starting point, not legal advice. Have it reviewed for your country before relying on it.
export default function Terms() {
  return (
    <LegalPage title="Terms of Service" updated="November 2026">
      <p>Haven lets you build a public profile page. By signing in or using the site you agree to these terms.</p>
      <h2>Your account</h2>
      <p>You sign in with Discord. You're responsible for what happens on your page. You must be old enough to use Discord in your country (at least 13).</p>
      <h2>What you can put on your page</h2>
      <p>You keep ownership of what you upload. You give Haven permission to store and show it so your page works. You must have the right to use everything you upload or link to.</p>
      <p>Don't post or link to:</p>
      <ul>
        <li>Content that harasses, threatens or hates on people.</li>
        <li>Sexual content involving minors, or graphic sexual or violent content.</li>
        <li>Scams, phishing, malware or anything that steals accounts.</li>
        <li>Pages that pretend to be another person, a staff member or an official account.</li>
        <li>Anything illegal, or spam.</li>
      </ul>
      <h2>Moderation</h2>
      <p>Anyone can report a page or template. Staff can hide a page, delete a template or restrict an account at any time, with or without notice. Staff badges are given only to people who hold a staff role in our Discord server.</p>
      <h2>Templates</h2>
      <p>When you publish a template, other people can use its look: colors, fonts, effects and the background and banner pictures you chose. Your name, links, text, music and avatar are never included. You can delete your templates at any time.</p>
      <h2>Deleting your account</h2>
      <p>You can delete your account from Settings. This removes your page, stats and templates.</p>
      <h2>No guarantees</h2>
      <p>Haven is provided as is. Pages may go down, change or be removed. We aren't liable for losses caused by using the site, to the extent the law allows.</p>
      <h2>Changes and contact</h2>
      <p>We may update these terms. Continuing to use Haven means you accept the new version.{CONTACT ? <> Contact: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.</> : SERVER_INVITE ? <> Questions? Ask staff in <a href={SERVER_INVITE}>our Discord server</a>.</> : " Questions? Ask staff in our Discord server."}</p>
    </LegalPage>
  );
}
