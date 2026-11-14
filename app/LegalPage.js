import SiteNav from "./SiteNav";
import "./shell.css";

export default function LegalPage({ title, updated, children }) {
  return (
    <main className="lp legal">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;600;700;800&family=Bricolage+Grotesque:wght@600;800&display=swap" />
      <SiteNav />
      <article className="legal-body">
        <h1>{title}</h1>
        <p className="legal-up">Last updated {updated}</p>
        {children}
        <p className="legal-up"><a href="/">Back to home</a> · <a href="/terms">Terms</a> · <a href="/privacy">Privacy</a></p>
      </article>
    </main>
  );
}
