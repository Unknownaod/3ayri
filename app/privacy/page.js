import LegalPage from "../LegalPage";
import { CONTACT, SERVER_INVITE } from "@/lib/site";

export const metadata = { title: "Privacy Policy · Haven", description: "What Haven stores and why." };
// NOTE: Plain-language starting point, not legal advice. Review it for your country (GDPR, etc.) before relying on it.
export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="November 2026">
      <p>This explains what Haven stores about you and why.</p>
      <h2>What we collect</h2>
      <ul>
        <li><b>From Discord when you sign in:</b> your Discord ID, username, display name, avatar, and (if you use the Discord status feature) your online status and activity. We also read which roles you hold in our server to decide whether to show a staff badge.</li>
        <li><b>What you add to your page:</b> bio, links, socials, music, pictures, colors and other settings.</li>
        <li><b>Stats:</b> a count of page views and link clicks. We don't store visitors' names or IP addresses with these counts.</li>
        <li><b>Safety data:</b> to limit abuse we briefly keep rate-limit counters (they expire within minutes or hours, and use your IP address or account), reports sent by visitors, a short log of staff actions, and error logs (kept 7 days).</li>
      </ul>
      <h2>What's public</h2>
      <p>Everything on your page is public at <code>/username</code>. If "show in Discover" is on, your page also appears in Discover and the sitemap. Turn on "hide from search engines" to ask search engines not to list it.</p>
      <h2>How we use it</h2>
      <p>To show your page, keep the site safe, and fix problems. We don't sell your data and we don't run ads.</p>
      <h2>Cookies</h2>
      <p>We use one sign-in cookie so you stay logged in. Your browser may also remember small settings, like dashboard layout.</p>
      <h2>Who else sees it</h2>
      <p>Our hosting and database providers store the data for us. Discord handles sign-in. Music, videos and images you embed from other sites are loaded from those sites, which can see your visitors' IP addresses.</p>
      <h2>Your choices</h2>
      <p>You can edit or delete your page and templates any time. Deleting your account from Settings removes your page, stats and templates. Backups may keep copies for a short time afterward.</p>
      <h2>Contact</h2>
      <p>{CONTACT ? <>Email <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.</> : SERVER_INVITE ? <>Ask staff in <a href={SERVER_INVITE}>our Discord server</a>.</> : "Ask staff in our Discord server."}</p>
    </LegalPage>
  );
}
