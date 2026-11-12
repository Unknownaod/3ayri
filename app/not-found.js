import SiteNav from "./SiteNav";
import "./shell.css";

export const metadata = { title: "Page not found · Haven", robots: { index: false } };

// Shown for any unknown URL, and when /<username> doesn't exist.
export default function NotFound() {
  return (
    <main className="lp nf">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;600;700;800&family=Bricolage+Grotesque:wght@600;800&display=swap" />
      <SiteNav />
      <section className="nf-body">
        <p className="nf-code" aria-hidden="true">404</p>
        <h1>This page doesn't exist</h1>
        <p>The link may be broken, or the username isn't taken yet. If it's the name you want, you can claim it.</p>
        <div className="lp-cta"><a className="lp-b1" href="/api/auth/login">Claim your username</a><a className="lp-b2" href="/">Back to home</a></div>
      </section>
    </main>
  );
}
