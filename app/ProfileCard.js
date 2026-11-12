"use client";
import { useEffect, useRef, useState } from "react";
import { PLATFORMS, FONTS, cfg } from "@/lib/schema";
import { badgesOf } from "@/lib/badges";

const DOT = { online: "#43b581", idle: "#faa61a", dnd: "#f04747", offline: "#747f8d" };
const LBL = { online: "Online", idle: "Idle", dnd: "Do not disturb", offline: "Offline" };
const KIND = { spotify: "Listening to Spotify", game: "Playing", stream: "Streaming", watch: "Watching" };
const lum = (h) => { const n = parseInt(h.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };
const cur = (a, k) => ({ dot: `<circle cx='10' cy='10' r='5' fill='${a}' stroke='white' stroke-width='2'/>`, ring: `<circle cx='14' cy='14' r='9' fill='none' stroke='${a}' stroke-width='2.5'/>`, cross: `<path d='M14 3v22M3 14h22' stroke='${a}' stroke-width='2'/>` }[k]);

function usePresence(id, on) {
  const [d, setD] = useState(null);
  useEffect(() => {
    if (!on || !id) { setD(null); return; }
    let dead = false;
    const load = () => !document.hidden && fetch(`/api/presence?u=${id}`).then((r) => r.json()).then((j) => !dead && setD(j)).catch(() => {});
    load(); const t = setInterval(load, 15000);
    return () => { dead = true; clearInterval(t); };
  }, [id, on]);
  return d;
}

function useTyped(text, on, ms) {
  const [n, setN] = useState(on ? 0 : text.length);
  useEffect(() => {
    if (!on) { setN(text.length); return; }
    let i = 0; setN(0);
    const t = setInterval(() => { setN(++i); if (i >= text.length) clearInterval(t); }, ms);
    return () => clearInterval(t);
  }, [text, on, ms]);
  return text.slice(0, n);
}

function Particles({ kind, count, speed, color }) {
  const ref = useRef(null);
  useEffect(() => {
    if (kind === "none" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const c = ref.current, x = c.getContext("2d");
    let w, h, id;
    const fit = () => { w = c.width = c.offsetWidth; h = c.height = c.offsetHeight; };
    fit();
    const sp = speed / 10, R = Math.random;
    const ps = Array.from({ length: count }, () => ({ x: R() * w, y: R() * h, r: R() * 2 + 0.6, v: (R() * 0.8 + 0.3) * sp, p: R() * 6 }));
    const tick = () => {
      x.clearRect(0, 0, w, h);
      for (const p of ps) {
        x.globalAlpha = 0.8; x.fillStyle = x.strokeStyle = kind === "snow" || kind === "stars" ? "#fff" : color;
        if (kind === "stars") { p.p += 0.03 * sp; x.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(p.p)); }
        else {
          p.y += (kind === "embers" || kind === "bubbles" ? -1 : 1) * (kind === "rain" ? p.v * 9 : p.v); p.p += 0.02;
          if (kind !== "rain") p.x += Math.sin(p.p) * 0.4;
          if (p.y > h + 14) p.y = -14; if (p.y < -14) p.y = h + 14;
        }
        x.beginPath();
        if (kind === "rain") { x.globalAlpha = 0.5; x.moveTo(p.x, p.y); x.lineTo(p.x - 1, p.y + 12); x.stroke(); }
        else if (kind === "bubbles") { x.globalAlpha = 0.5; x.arc(p.x, p.y, p.r * 3, 0, 7); x.stroke(); }
        else { x.arc(p.x, p.y, p.r, 0, 7); x.fill(); }
      }
      id = requestAnimationFrame(tick);
    };
    tick(); addEventListener("resize", fit);
    return () => { cancelAnimationFrame(id); removeEventListener("resize", fit); };
  }, [kind, count, speed, color]);
  return kind === "none" ? null : <canvas ref={ref} className="pc-fx" />;
}

function DBadges({ d }) {
  const b = badgesOf(d);
  return b.length ? <span className="pc-dbadges">{b.map(([t, e, col], i) => <i key={i} title={t} style={{ "--bc": col }}>{e}</i>)}</span> : null;
}

function Presence({ pres, c, p }) {
  const [, tick] = useState(0);
  const a = pres.act, d = p.discord || {};
  const dn = d.displayName || p.displayName, av = d.avatar || p.avatar;
  useEffect(() => { if (a?.kind !== "spotify") return; const t = setInterval(() => tick((n) => n + 1), 1000); return () => clearInterval(t); }, [a?.kind]);
  const prog = a?.kind === "spotify" && a.end ? Math.min(100, Math.max(0, ((Date.now() - a.start) / (a.end - a.start)) * 100)) : null;
  const show = c.presenceActivity && a, inCard = c.badgePlacement === "card" || c.badgePlacement === "both";
  if (c.presenceStyle === "compact")
    return <p className="pc-pres compact"><i style={{ background: DOT[pres.status] }} />{c.presenceName && dn ? `${dn} · ` : ""}{show ? `${KIND[a.kind]} ${a.title}` : c.presenceCustom && pres.custom ? pres.custom : LBL[pres.status]}{inCard && <DBadges d={d} />}</p>;
  return (
    <div className="pc-pres card">
      {(c.presenceAvatar || c.presenceName) && (
        <div className="pc-did">
          {c.presenceAvatar && av && <span className="pc-davw"><img src={av} alt="" /><i style={{ background: DOT[pres.status] }} /></span>}
          {c.presenceName && <div><b>{dn}</b>{d.username && <small>@{d.username}</small>}{inCard && <DBadges d={d} />}</div>}
        </div>
      )}
      <div className="pc-pres-top"><i style={{ background: DOT[pres.status] }} />{LBL[pres.status]}{c.presenceCustom && pres.custom && <span> · {pres.custom}</span>}</div>
      {show && (
        <div className="pc-act">
          {a.art && <img src={a.art} alt="" />}
          <div><small>{KIND[a.kind]}</small><b>{a.title}</b>{a.sub && <span>{a.sub}</span>}{prog != null && <u><s style={{ width: `${prog}%` }} /></u>}</div>
        </div>
      )}
    </div>
  );
}

export default function ProfileCard({ p, views, preview, livePres }) {
  const c = cfg(p);
  const accent = c.accent, on = lum(accent) > 0.6 ? "#111" : "#fff", lc = c.linkColor || accent, lon = c.linkTextColor || (lum(lc) > 0.6 ? "#111" : "#fff");
  const iconHex = c.iconColor === "accent" ? accent.slice(1) : c.theme === "light" ? "111111" : "ffffff";
  const icon = (t) => `https://cdn.simpleicons.org/${PLATFORMS[t].slug}/${iconHex}`;
  const avatar = p.customAvatar || p.avatar;
  const [entered, setEntered] = useState(!c.entry || !!preview);
  const [playing, setPlaying] = useState(false);
  const audio = useRef(null), card = useRef(null), bg = useRef(null);
  const fetched = usePresence(p.discordId, c.presence && !livePres && !preview);
  const pres = c.presence ? livePres || fetched : null;
  const bio = useTyped(p.bio || "", c.typewriter && !preview, c.typeSpeed);
  const bh = c.bannerHeight;
  const href = (t, i) => (preview ? "#" : `/api/go?u=${p.discordId}&t=${t}&i=${i}`);
  const noop = (e) => preview && e.preventDefault();
  const play = () => { const a = audio.current; if (!a) return; a.volume = c.musicVolume / 100; a.play().then(() => setPlaying(true)).catch(() => {}); };
  const enter = () => { setEntered(true); if (c.musicAuto) play(); };
  const toggle = () => { const a = audio.current; if (!a) return; if (a.paused) play(); else { a.pause(); setPlaying(false); } };
  useEffect(() => { if (audio.current) audio.current.volume = c.musicVolume / 100; }, [c.musicVolume]);
  const move = (e) => { if (c.bgParallax && !preview && bg.current) bg.current.style.translate = `${-(e.clientX / innerWidth - 0.5) * 28}px ${-(e.clientY / innerHeight - 0.5) * 28}px`; };
  const tilt = (e) => {
    if (!c.tilt || preview || !card.current) return;
    const r = card.current.getBoundingClientRect(), s = c.tiltStrength;
    card.current.style.transform = `perspective(900px) rotateY(${((e.clientX - r.left) / r.width - 0.5) * s}deg) rotateX(${-((e.clientY - r.top) / r.height - 0.5) * s}deg)`;
  };

  const socials = p.socials?.length > 0 && (
    <div className="pc-socials">
      {p.socials.map((s, i) => PLATFORMS[s.type] && (
        <a key={i} href={href("s", i)} onClick={noop} target="_blank" rel="noopener noreferrer" aria-label={PLATFORMS[s.type].name}>
          <img src={icon(s.type)} alt="" style={{ width: "var(--ic)", height: "var(--ic)" }} />
        </a>
      ))}
    </div>
  );
  const cls = ["pc", `pc-${c.theme}`, `lay-${c.layout}`, `bd-${c.border}`, `ls-${c.linkStyle}`, `lsh-${c.linkShape}`, `ll-${c.linkLayout}`, `lh-${c.linkHover}`,
    `ic-${c.iconStyle}`, `sh-${c.socialHover}`, `ab-${c.avatarBorder}`, `ea-${c.entryAnim}`, `ch-${c.cardHover}`, `bs-${c.borderStyle}`, `la-${c.linkAlign}`, bh === 0 ? "nobanner" : ""].join(" ");
  const style = {
    "--accent": accent, "--accent2": c.accent2, "--on": on, "--ff": FONTS[c.font], "--op": c.cardOpacity, "--blur": `${c.blur}px`, "--rad": `${c.radius}px`,
    "--av": `${c.avatarSize}px`, "--bh": `${bh}px`, "--ic": `${c.iconSize}px`, "--w": `${c.width}px`, "--pad": `${c.padding}px`, "--gap": `${c.gap}px`,
    "--bw": `${c.borderWidth}px`, "--sh": c.shadow / 100, "--ts": `${c.nameSize}px`, "--lh": `${c.linkSize}px`, "--lc": lc, "--lon": lon, "--lbw": `${c.linkBorderWidth}px`, "--sg": `${c.socialGap}px`, "--bs": `${c.bioSize}px`, "--gl": `${c.avatarGlow}px`, "--cs": c.cardScale / 100, "--eb": `${c.entryBlur}px`,
    ...(c.borderColor && { "--bc": c.borderColor }), ...(c.nameColor && { "--nc": c.nameColor }), ...(c.nameFont !== "inherit" && { "--nf": FONTS[c.nameFont] }),
    ...(c.cursor !== "default" && { cursor: `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28'>${cur(accent, c.cursor)}</svg>`)}") 14 14, auto` }),
  };
  const bgImg = p.background ? `url("${p.background}")` : "";
  const bgGrad = c.bgGradient ? `linear-gradient(${c.bgAngle}deg,${c.bgColor || "#0d0a08"},${c.bgColor2})` : "";

  return (
    <div className={`pc-stage ${preview ? "" : "pc-full"} vp-${c.vpos}`} style={style} onMouseMove={move}>
      <div ref={bg} className={`pc-bg ${c.bgZoom ? "zoom" : ""}`} style={{ backgroundPosition: `center ${c.bgPosition}`, backgroundColor: c.bgColor || undefined, backgroundImage: [bgImg, bgGrad].filter(Boolean).join(",") || undefined, filter: `blur(${c.bgBlur}px) brightness(${c.bgBrightness}%) saturate(${c.bgSaturate}%)` }} />
      {p.bgVideo && <video className="pc-vid" src={p.bgVideo} autoPlay loop muted playsInline />}
      <div className="pc-ov" style={{ opacity: c.overlay / 100 }} />
      {c.screenFx !== "none" && <div className={`pc-sfx fx-${c.screenFx}`} />}
      <Particles kind={c.particles} count={c.particleCount} speed={c.particleSpeed} color={accent} />

      {!entered && <button className="pc-splash" onClick={enter} style={{ backdropFilter: `blur(${c.entryBlur}px)` }}>{c.entryText || "click to enter"}</button>}
      {c.musicUrl && <audio ref={audio} src={c.musicUrl} loop preload="none" onPause={() => setPlaying(false)} onPlay={() => setPlaying(true)} />}
      {c.musicUrl && entered && c.musicPlayer === "pill" && (
        <button className="pc-music" onClick={toggle} aria-label={playing ? "Pause music" : "Play music"}>
          <b>{playing ? "❚❚" : "▶"}</b><span>{c.musicTitle || "music"}</span>{playing && <em><i /><i /><i /></em>}
        </button>
      )}

      {entered && (
        <div ref={card} className={cls} style={{ ...(c.cardColor && { "--pc-bg": c.cardColor }), ...(c.textColor && { "--pc-text": c.textColor }) }} onMouseMove={tilt} onMouseLeave={() => card.current && (card.current.style.transform = "")}>
          {views != null && c.showViews && <span className="pc-views">👁 {views.toLocaleString()}</span>}
          {bh > 0 && <div className="pc-banner" style={p.banner ? { backgroundImage: `url("${p.banner}")` } : undefined} />}
          <div className="pc-body">
            {!c.avatarHide && (
              <div className={`pc-avwrap av-${c.avatarShape} aa-${c.avatarAnim}`}>
                {avatar ? <img className="pc-avatar" src={avatar} alt="" /> : <span className="pc-avatar pc-initial">{(p.name || p.displayName || "?")[0]}</span>}
                {pres && <span className="pc-dot" style={{ background: DOT[pres.status] }} title={LBL[pres.status]} />}
              </div>
            )}
            <div className="pc-nm"><h1 className={`nm-${c.nameEffect} ${c.nameUpper ? "up" : ""}`}>{p.name || p.displayName}</h1>
              {pres && (c.badgePlacement === "name" || c.badgePlacement === "both") && <DBadges d={p.discord} />}</div>
            {c.tagline && <p className="pc-tag">{c.tagline}</p>}
            {p.badges?.length > 0 && <div className="pc-badges">{p.badges.map((b, i) => <span key={i}>{b}</span>)}</div>}
            <p className="pc-handle">{c.showHandle && <span>@{p.username || "username"}</span>}{c.pronouns && <span>{c.pronouns}</span>}{c.location && <span>📍 {c.location}</span>}</p>
            {pres && c.presenceStyle !== "dot" && <Presence pres={pres} c={c} p={p} />}
            {p.bio && <p className="pc-bio">{bio}</p>}
            {c.socialsPos === "top" && socials}
            {p.links?.length > 0 && (
              <ul className="pc-links">
                {p.links.map((l, i) => (
                  <li key={i}><a href={href("l", i)} onClick={noop} target="_blank" rel="noopener noreferrer">
                    {PLATFORMS[l.icon] && <img src={icon(l.icon)} alt="" width={18} height={18} />}{l.label}
                  </a></li>
                ))}
              </ul>
            )}
            {c.socialsPos === "bottom" && socials}
          </div>
        </div>
      )}
      {!preview && !c.hideFooter && <a className="pc-foot" href="/">{c.footerText || "havenshq.xyz"}</a>}
    </div>
  );
}
