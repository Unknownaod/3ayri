export const metadata = { title: "Page not found · Haven", robots: { index: false } };

const LINKS = [
  ["Home", "Back to the start", "/"],
  ["Giveaways", "See what's open right now", "/giveaways"],
  ["Affiliates", "Share Haven and track it", "/affiliates"],
];

function Illustration() {
  return (
    <svg className="nf-art" viewBox="0 0 400 380" role="img" aria-label="An open door with light spilling out and a sign that reads 404">
      <defs>
        <radialGradient id="nf-glow" cx="50%" cy="55%" r="55%"><stop offset="0" stopColor="#e0a243" stopOpacity=".28" /><stop offset="1" stopColor="#e0a243" stopOpacity="0" /></radialGradient>
        <linearGradient id="nf-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f7dc96" stopOpacity=".55" /><stop offset="1" stopColor="#f7dc96" stopOpacity="0" /></linearGradient>
        <linearGradient id="nf-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f7dc96" /><stop offset="1" stopColor="#b9771f" /></linearGradient>
        <linearGradient id="nf-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1f1812" /><stop offset="1" stopColor="#15100c" /></linearGradient>
      </defs>
      <circle cx="200" cy="200" r="190" fill="url(#nf-glow)" />
      {/* wall + frame */}
      <rect x="95" y="40" width="210" height="300" rx="14" fill="url(#nf-wall)" stroke="#e0a24355" strokeWidth="2" />
      <path d="M130 340V130a70 70 0 0 1 140 0v210z" fill="#0b0806" stroke="#e0a243" strokeWidth="3" />
      {/* light spilling out of the doorway */}
      <path d="M140 340V135a60 60 0 0 1 120 0v205z" fill="#f7dc96" opacity=".16" />
      <path d="M150 340 110 372h180l-40-32z" fill="url(#nf-beam)" />
      {/* open door leaf */}
      <path d="M130 340V132a70 70 0 0 1 52-68v300z" fill="#2a2018" stroke="#e0a243" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M150 140h20M150 175h20" stroke="#e0a24366" strokeWidth="3" strokeLinecap="round" />
      <circle cx="170" cy="230" r="5" fill="url(#nf-gold)" />
      {/* hanging sign */}
      <path d="M232 40v30M278 40v30" stroke="#e0a243" strokeWidth="2.5" />
      <g transform="rotate(-4 255 98)">
        <rect x="208" y="68" width="94" height="52" rx="9" fill="#1b1610" stroke="url(#nf-gold)" strokeWidth="3" />
        <text x="255" y="105" textAnchor="middle" fontFamily="'Bricolage Grotesque',system-ui,sans-serif" fontWeight="800" fontSize="32" fill="url(#nf-gold)">404</text>
      </g>
      {/* floor + doormat */}
      <path d="M60 340h280" stroke="#e0a24355" strokeWidth="2" strokeLinecap="round" />
      <rect x="142" y="342" width="116" height="14" rx="4" fill="#2a2018" stroke="#e0a24355" />
      {/* plant */}
      <path d="M318 340l-6-34h34l-6 34z" fill="#2a2018" stroke="#e0a24366" strokeWidth="2" strokeLinejoin="round" />
      <path d="M329 306c-14-16-18-30-10-46 12 8 16 26 10 46zM329 306c10-14 24-18 36-12-8 14-22 18-36 12z" fill="#e0a24333" stroke="#e0a243" strokeWidth="2" strokeLinejoin="round" />
      {/* question marks */}
      <text x="48" y="150" fontFamily="'Bricolage Grotesque',system-ui,sans-serif" fontWeight="800" fontSize="46" fill="#e0a243" opacity=".5" transform="rotate(-14 48 150)">?</text>
      <text x="338" y="210" fontFamily="'Bricolage Grotesque',system-ui,sans-serif" fontWeight="800" fontSize="30" fill="#e0a243" opacity=".35" transform="rotate(12 338 210)">?</text>
    </svg>
  );
}

export default function NotFound() {
  return (
    <main className="nf">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;600;700&family=Bricolage+Grotesque:wght@600;800&display=swap" />
      <style>{CSS}</style>
      <a className="nf-logo" href="/">Haven</a>
      <div className="nf-wrap">
        <section className="nf-copy">
          <p className="nf-code">Error 404</p>
          <h1>Wrong door?</h1>
          <p className="nf-lead">We couldn't find that page. The link may be broken, or the username you're looking for isn't taken yet. If it's the name you want, you can claim it.</p>
          <div className="nf-cta">
            <a className="nf-btn" href="/dashboard">Claim your username</a>
            <a className="nf-btn ghost" href="/">Back to home</a>
          </div>
          <p className="nf-h">Or try one of these</p>
          <ul className="nf-links">
            {LINKS.map(([t, d, h]) => (
              <li key={h}><a href={h}><b>{t}</b><span>{d}</span></a></li>
            ))}
          </ul>
        </section>
        <Illustration />
      </div>
    </main>
  );
}

const CSS = `
.nf{--gold:#e0a243;--text:#f6ece0;--muted:#a89886;--line:#ffffff14;min-height:100vh;min-height:100dvh;display:flex;flex-direction:column;padding:1.4rem clamp(1.2rem,5vw,4rem) 3rem;
  background:radial-gradient(ellipse 80% 60% at 70% 30%,#3a2a1055,transparent 70%),#0d0a08;color:var(--text);font-family:"Figtree",system-ui,sans-serif}
.nf *{box-sizing:border-box}
.nf-logo{width:fit-content;font:800 1.5rem "Bricolage Grotesque",system-ui,sans-serif;text-decoration:none;background:linear-gradient(135deg,#f7dc96,#e0a243);-webkit-background-clip:text;background-clip:text;color:transparent}
.nf-wrap{flex:1;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);align-items:center;gap:clamp(1.5rem,5vw,5rem);max-width:1120px;width:100%;margin:0 auto;padding-top:1.5rem}
.nf-code{margin:0 0 .6rem;color:var(--gold);font-weight:700;font-size:.95rem;letter-spacing:.02em}
.nf h1{margin:0;font:800 clamp(2.6rem,6vw,4.2rem)/1.02 "Bricolage Grotesque",system-ui,sans-serif;letter-spacing:-.025em}
.nf-lead{margin:1.1rem 0 0;max-width:34rem;color:var(--muted);font-size:1.08rem;line-height:1.6}
.nf-cta{display:flex;flex-wrap:wrap;gap:.7rem;margin-top:1.7rem}
.nf-btn{padding:.75rem 1.3rem;border-radius:12px;border:1px solid #e0a24388;background:linear-gradient(135deg,#f7dc96,#e0a243 55%,#b9771f);color:#1a1005;font-weight:700;text-decoration:none;transition:transform .15s,box-shadow .15s}
.nf-btn:hover{transform:translateY(-1px);box-shadow:0 10px 30px -12px #e0a243}
.nf-btn.ghost{background:#ffffff0a;border-color:var(--line);color:var(--text)}.nf-btn.ghost:hover{background:#ffffff14;box-shadow:none}
.nf-h{margin:2.4rem 0 .6rem;color:var(--muted);font-size:.85rem;font-weight:600}
.nf-links{list-style:none;margin:0;padding:0;display:grid;gap:.5rem;max-width:34rem}
.nf-links a{display:flex;align-items:baseline;justify-content:space-between;gap:1rem;padding:.8rem 1rem;border:1px solid var(--line);border-radius:12px;background:#ffffff06;text-decoration:none;color:var(--text);transition:border-color .15s,background .15s}
.nf-links a:hover{border-color:#e0a24377;background:#e0a24312}
.nf-links b{font-weight:600}.nf-links span{color:var(--muted);font-size:.88rem;text-align:right}
.nf-art{width:100%;max-width:440px;height:auto;justify-self:center;filter:drop-shadow(0 30px 50px #000a)}
.nf a:focus-visible{outline:2px solid var(--gold);outline-offset:3px}
@media(max-width:820px){.nf-wrap{grid-template-columns:1fr;text-align:left}.nf-art{order:-1;max-width:300px;justify-self:start}}
@media(max-width:480px){.nf-links span{display:none}}
@media(prefers-reduced-motion:reduce){.nf-btn,.nf-links a{transition:none}}
`;
