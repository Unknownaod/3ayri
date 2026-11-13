import { Ico } from "@/lib/icons";

const LINKS = [["Home", "/"], ["Giveaways", "/giveaways"], ["Affiliates", "/affiliates"]];

// Shared top bar. Plain links, so it works from server and client pages.
export default function SiteNav({ active, authed, invite }) {
  return (
    <header className="lp-nav">
      <a className="lp-logo" href="/" aria-label="Haven home"><img src="/logo.png" alt="" width="28" height="28" /><span>Haven</span></a>
      <nav aria-label="Main">
        {LINKS.map(([n, h]) => <a key={h} href={h} className={active === h ? "on" : undefined} aria-current={active === h ? "page" : undefined}>{n}</a>)}
        {invite && <a href={invite} target="_blank" rel="noopener noreferrer">Discord</a>}
      </nav>
      <a className="lp-login" href={authed ? "/dashboard" : "/api/auth/login"}><Ico n={authed ? "sliders" : "discord"} size={15} /> {authed ? "Dashboard" : "Log in"}</a>
    </header>
  );
}
