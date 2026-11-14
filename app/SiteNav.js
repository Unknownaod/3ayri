"use client";
import { useEffect, useRef } from "react";
import { Ico } from "@/lib/icons";

const LINKS = [["Home", "/"], ["Giveaways", "/giveaways"], ["Affiliates", "/affiliates"]];

// Shared top bar. Pass `user` ({ name, username, avatar }) when someone is signed in to show their menu instead of "Log in".
export default function SiteNav({ active, user, invite }) {
  const menu = useRef(null);
  useEffect(() => {
    const off = (e) => { const m = menu.current; if (m?.open && (e.type === "keydown" ? e.key === "Escape" : !m.contains(e.target))) m.open = false; };
    document.addEventListener("click", off); document.addEventListener("keydown", off);
    return () => { document.removeEventListener("click", off); document.removeEventListener("keydown", off); };
  }, []);
  const logout = async () => { try { await fetch("/api/auth/logout", { method: "POST" }); } catch {} location.href = "/"; };
  const dash = user ? `/dashboard/${user.username || "me"}` : "/dashboard";
  return (
    <header className="lp-nav">
      <a className="lp-logo" href="/" aria-label="Haven home"><img src="/logo.png" alt="" width="28" height="28" /><span>Haven</span></a>
      <nav aria-label="Main">
        {LINKS.map(([n, h]) => <a key={h} href={h} className={active === h ? "on" : undefined} aria-current={active === h ? "page" : undefined}>{n}</a>)}
        {invite && <a href={invite} target="_blank" rel="noopener noreferrer">Discord</a>}
      </nav>
      {user ? (
        <details className="lp-user" ref={menu}>
          <summary aria-label="Account menu">
            {user.avatar ? <img src={user.avatar} alt="" /> : <span className="lu-ini">{(user.name || "?")[0]}</span>}
            <b>{user.username || user.name}</b><Ico n="chevron" size={13} />
          </summary>
          <div className="lp-menu">
            <div className="lm-who">{user.avatar && <img src={user.avatar} alt="" />}<div><b>{user.name}</b><small>{user.username ? `/${user.username}` : "No username yet"}</small></div></div>
            <a className="lm-go" href={dash}><Ico n="sliders" size={15} /> Go to dashboard</a>
            {user.username && <a href={`/${user.username}`}><Ico n="external" size={15} /> View my page</a>}
            <button type="button" onClick={logout}><Ico n="x" size={15} /> Log out</button>
          </div>
        </details>
      ) : (
        <a className="lp-login" href="/api/auth/login"><Ico n="discord" size={15} /> Log in</a>
      )}
    </header>
  );
}
