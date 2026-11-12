"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { PLATFORMS, FONTS, THEMES, cfg, itemsOf, sectionsOf, playlist, embedSrc, ink, fontsHref, iconKind } from "@/lib/schema";
import { Ico } from "@/lib/icons";
import { Particles, CursorFX } from "./profile-fx";
import { Icon, Presence, DBadges, Player, useAudio, DOT, LBL, actsOf } from "./profile-parts";

const hexOf = (x) => String(x || "").replace("#", "").slice(0, 6);
const cssUrl = (u) => `url("${String(u).replace(/["\\\n\r]/g, "")}")`;
const RING = {
  white: "#fff",
  gradient: "conic-gradient(from var(--ra,0deg),var(--accent),var(--accent2),var(--accent3),var(--accent))",
  rainbow: "conic-gradient(from var(--ra,0deg),#ff5f6d,#ffc371,#47e891,#4facfe,#c471f5,#ff5f6d)",
};

// ───────────── hooks ─────────────
function usePresence(id, on) {
  const [d, setD] = useState(null);
  useEffect(() => {
    if (!on || !id) { setD(null); return; }
    let dead = false;
    const load = () => !document.hidden && fetch(`/api/presence?u=${id}`).then((r) => r.json()).then((j) => !dead && setD(j)).catch(() => {});
    load();
    const t = setInterval(load, 15000);
    const vis = () => load();
    document.addEventListener("visibilitychange", vis);
    return () => { dead = true; clearInterval(t); document.removeEventListener("visibilitychange", vis); };
  }, [id, on]);
  return d;
}

// "type" plays the whole bio once; "cycle" types each line, erases it, then moves to the next.
function useBioText(bio, mode, speed) {
  const [t, setT] = useState(mode === "none" ? bio : "");
  useEffect(() => {
    if (mode === "none") { setT(bio); return; }
    const lines = mode === "cycle" ? bio.split("\n").map((s) => s.trim()).filter(Boolean) : [bio];
    if (!lines.length || !lines[0]) { setT(""); return; }
    let dead = false, timer, li = 0, ci = 0, erasing = false;
    const step = () => {
      if (dead) return;
      const line = lines[li];
      if (!erasing) {
        ci++; setT(line.slice(0, ci));
        if (ci >= line.length) { if (lines.length === 1) return; erasing = true; timer = setTimeout(step, 1800); return; }
        timer = setTimeout(step, speed);
      } else {
        ci--; setT(line.slice(0, ci));
        if (ci <= 0) { erasing = false; li = (li + 1) % lines.length; timer = setTimeout(step, 320); return; }
        timer = setTimeout(step, speed / 2);
      }
    };
    setT(""); timer = setTimeout(step, speed);
    return () => { dead = true; clearTimeout(timer); };
  }, [bio, mode, speed]);
  return t;
}

function useTabTitle(title, mode, off) {
  useEffect(() => {
    if (off || typeof document === "undefined" || !title) return;
    const orig = document.title;
    if (mode === "none") { document.title = title; return () => { document.title = orig; }; }
    let i = 0, dir = 1;
    const timer = mode === "marquee"
      ? setInterval(() => { const s = `${title}   ·   `; i = (i + 1) % s.length; document.title = s.slice(i) + s.slice(0, i); }, 280)
      : setInterval(() => { i += dir; document.title = title.slice(0, Math.max(1, i)) + (i < title.length ? "▏" : ""); if (i >= title.length + 8) dir = -1; if (i <= 0) dir = 1; }, 230);
    return () => { clearInterval(timer); document.title = orig; };
  }, [title, mode, off]);
}

// ───────────── component ─────────────
// p: the saved profile. preview: inside the dashboard / landing (links inert, no tracking, no entry screen).
// livePres: presence to show instead of fetching (dashboard + landing demo).
export default function ProfileCard({ p, views, preview, livePres }) {
  const c = useMemo(() => cfg(p), [p]);
  const it = useMemo(() => itemsOf(p), [p]);
  const list = useMemo(() => playlist(p), [p]);
  const sections = useMemo(() => sectionsOf(p), [p]);
  const th = THEMES[c.theme] || THEMES.dark;
  const stage = useRef(null), card = useRef(null), bg = useRef(null);
  const [entered, setEntered] = useState(!c.entry || !!preview);
  const [liveViews, setLiveViews] = useState(views);
  const a = useAudio(list, c, preview);
  const fetched = usePresence(p.discordId, c.presence && !livePres && !preview);
  const pres = c.presence ? livePres || fetched : null;

  const name = p.name || p.displayName || p.username || "Your name";
  const avatar = p.customAvatar || p.avatar;
  const bioMode = c.typewriter && !preview ? (c.bioCycle ? "cycle" : "type") : "none";
  const typed = useBioText(p.bio || "", bioMode, c.typeSpeed);
  const ghost = bioMode === "cycle" ? (p.bio || "").split("\n").reduce((x, y) => (y.length > x.length ? y : x), "") : p.bio || "";
  const bh = c.bannerHeight;

  useEffect(() => { setLiveViews(views); }, [views]);
  useEffect(() => { // one view per browser session; the server ignores the owner and link-preview bots never run this
    if (preview || !p.discordId) return;
    try { if (sessionStorage.getItem(`hv:${p.discordId}`)) return; sessionStorage.setItem(`hv:${p.discordId}`, "1"); } catch {}
    fetch("/api/view", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ u: p.discordId }) })
      .then((r) => r.json()).then((j) => j.views != null && setLiveViews(j.views)).catch(() => {});
  }, [preview, p.discordId]);
  useEffect(() => { if (entered && !preview) a.start(); /* eslint-disable-next-line */ }, [entered]);
  useTabTitle((c.tabTitle || "{name} (@{username}) · Haven").replace("{name}", name).replace("{username}", p.username || ""), c.titleAnim, preview);

  // ── derived style ──
  const accent = c.accent, accent3 = c.accent3 || c.accent2;
  const text = c.textColor || th.text;
  const filledTile = c.iconFill === "filled";
  const tileBg = text;
  const socColor = c.iconColor === "accent" ? accent : c.iconColor === "custom" ? c.iconCustom : filledTile ? ink(tileBg) : text;
  const socHex = c.iconColor === "brand" ? undefined : hexOf(socColor);
  const lc = c.linkColor || accent, lon = c.linkTextColor || ink(lc);
  const linkFilled = c.linkStyle === "filled" || c.linkStyle === "gradient";
  const ringW = c.avatarBorder === "none" ? 0 : c.avatarBorderWidth;
  const lrad = c.linkShape === "pill" ? 999 : c.linkShape === "square" ? 4 : Math.round(c.radius * 0.6);

  const bgFilter = `blur(${c.bgBlur}px) brightness(${c.bgBrightness}%) saturate(${c.bgSaturate}%)`;
  const pageBg = c.bgColor || th.page;
  const bgStyle = { filter: bgFilter, backgroundColor: pageBg, backgroundPosition: `center ${c.bgPosition}` };
  const layers = [];
  if (p.background) layers.push(cssUrl(p.background));
  if (c.bgGradient) layers.push(`linear-gradient(${c.bgAngle}deg,${pageBg},${c.bgColor2},${pageBg})`);
  if (layers.length) bgStyle.backgroundImage = layers.join(",");
  if (p.background && !c.bgGradient) {
    if (c.bgFit === "tile") { bgStyle.backgroundRepeat = "repeat"; bgStyle.backgroundSize = "auto"; }
    else { bgStyle.backgroundRepeat = "no-repeat"; bgStyle.backgroundSize = c.bgFit; }
  }

  const vars = {
    "--accent": accent, "--accent2": c.accent2, "--accent3": accent3, "--ang": `${c.gradAngle}deg`, "--on": ink(accent),
    "--ff": FONTS[c.font], "--nf": c.nameFont !== "inherit" ? FONTS[c.nameFont] : "var(--ff)",
    "--card": c.cardColor || th.card, "--text": text, "--page": th.page,
    ...(c.mutedColor && { "--muted": c.mutedColor }), ...(c.borderColor && { "--bc": c.borderColor }), ...(c.nameColor && { "--nc": c.nameColor }),
    "--op": c.cardOpacity, "--blur": `${c.blur}px`, "--rad": `${c.radius}px`, "--w": `${c.width}px`, "--pad": `${c.padding}px`, "--gap": `${c.gap}px`,
    "--ts": c.textScale / 100, "--bs": `${c.bioSize}px`, "--cs": c.cardScale / 100, "--bw": `${c.borderWidth}px`, "--sh": c.shadow / 100, "--glow": c.glowAmt / 100,
    "--av": `${c.avatarSize}px`, "--avb": `${ringW}px`, "--avg": `${c.avatarGlow}px`, "--ringbg": RING[c.avatarBorder] || "var(--accent)",
    "--bh": `${bh}px`, "--bbl": `${c.bannerBlur}px`, "--ns": `${c.nameSize}px`, "--nw": c.nameWeight, "--nsp": `${c.nameSpacing}px`,
    "--ic": `${c.iconSize}px`, "--icpad": `${Math.round(c.iconSize * 0.5)}px`, "--sg": `${c.socialGap}px`, "--ico": socColor, "--tile": tileBg,
    "--lh": `${c.linkSize}px`, "--lc": lc, "--lon": lon, "--lbw": `${c.linkBorderWidth}px`, "--lg": `${c.linkGap}px`, "--lts": c.linkTextSize / 100, "--lrad": `${lrad}px`,
    "--ovc": c.overlayColor, "--ov": c.overlay / 100, "--vig": c.vignette / 100, "--grain": c.grain / 100, "--eb": `${c.entryBlur}px`,
  };
  const fx = c.particleColor || accent, curColor = c.cursorColor || accent;

  const href = (x) => (preview ? "#" : /^(mailto:|tel:)/i.test(x.url) ? x.url : `/api/go?u=${p.discordId}&k=${encodeURIComponent(x.id)}`);
  const noop = (e) => preview && e.preventDefault();
  const tilt = (e) => {
    if (!c.tilt || preview || !card.current || !matchMedia("(pointer: fine)").matches) return;
    const r = card.current.getBoundingClientRect(), s = c.tiltStrength;
    card.current.style.transform = `perspective(900px) rotateY(${((e.clientX - r.left) / r.width - 0.5) * s}deg) rotateX(${-((e.clientY - r.top) / r.height - 0.5) * s}deg)`;
  };
  const parallax = (e) => {
    if (!c.bgParallax || !bg.current) return;
    const r = stage.current.getBoundingClientRect();
    bg.current.style.transform = `translate(${-((e.clientX - r.left) / r.width - 0.5) * 28}px,${-((e.clientY - r.top) / r.height - 0.5) * 28}px)`;
  };
  const enter = () => { setEntered(true); if (!preview) a.start(); };

  // ── section content ──
  const has = {
    identity: true,
    badges: (p.badges || []).length > 0,
    handle: (c.showHandle && p.username) || c.pronouns || c.location || !p.username,
    status: !!pres && c.presenceStyle !== "dot",
    bio: !!p.bio,
    socials: it.socials.length > 0,
    links: it.links.some((l) => !l.hidden),
    music: c.musicPos === "inline" && c.musicPlayer !== "hidden" && a.has,
  };
  const firstShown = sections.find((s) => s.on && has[s.k])?.k;
  const dName = pres && (c.badgePlacement === "name" || c.badgePlacement === "both");

  const body = {
    identity: (
      <div className={`pc-id ${c.header === "inline" ? "inline" : ""} ${firstShown === "identity" && bh > 0 && c.avatarOverlap ? "ov" : ""}`}>
        {!c.avatarHide && (
          <div className={`pc-avwrap aa-${c.avatarAnim}`}>
            <div className="pc-ring">{avatar ? <img className="pc-avatar" src={avatar} alt="" /> : <span className="pc-avatar pc-initial">{name[0]}</span>}</div>
            {pres && <span className="pc-dot" style={{ background: DOT[pres.status] || DOT.offline }} title={LBL[pres.status]} />}
          </div>
        )}
        <div className="pc-idtxt">
          <div className="pc-nm"><h1 className={`pc-name nm-${c.nameEffect} ${c.nameUpper ? "up" : ""}`} data-text={name}>{name}</h1>{dName && <DBadges d={p.discord} />}</div>
          {c.tagline && <p className="pc-tag">{c.tagline}</p>}
        </div>
      </div>
    ),
    badges: <div className="pc-badges">{(p.badges || []).map((b, i) => <span key={i}>{b}</span>)}</div>,
    handle: (
      <p className="pc-handle">
        {c.showHandle && <span>@{p.username || "username"}</span>}
        {c.pronouns && <span>{c.pronouns}</span>}
        {c.location && <span className="pc-loc"><Ico n="pin" size={13} />{c.location}</span>}
      </p>
    ),
    status: pres && <Presence pres={pres} c={c} p={p} />,
    bio: (
      <p className={`pc-bio ${bioMode !== "none" ? "typing" : ""}`} aria-label={p.bio}>
        {bioMode !== "none" ? (<><span className="gh" aria-hidden="true">{ghost}</span><span className="tx" aria-hidden="true">{typed}</span></>) : p.bio}
      </p>
    ),
    socials: (
      <div className={`pc-socials ${c.socialLabels ? "lab" : ""}`}>
        {it.socials.map((s) => PLATFORMS[s.type] && (
          <a key={s.id} className="pc-soc" href={href(s)} onClick={noop} target="_blank" rel="noopener noreferrer" aria-label={s.label || PLATFORMS[s.type].name} title={s.label || PLATFORMS[s.type].name}>
            <Icon name={s.type} hex={socHex} size={c.iconSize} swap={c.socialHover === "brand" && c.iconColor !== "brand"} />
            {c.socialLabels && <span>{s.label || PLATFORMS[s.type].name}</span>}
          </a>
        ))}
      </div>
    ),
    links: (
      <ul className="pc-links">
        {it.links.filter((l) => !l.hidden).map((l) => {
          if (l.type === "header") return <li key={l.id} className="pc-lh">{l.label}</li>;
          if (l.type === "divider") return <li key={l.id} className="pc-ld" role="separator" />;
          if (l.type === "embed") {
            const e = embedSrc(l.url);
            return e && (
              <li key={l.id} className="pc-le" style={e.ratio ? { aspectRatio: e.ratio } : { height: e.h }}>
                <iframe src={e.src} loading="lazy" title="Embedded media" allow="encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" />
              </li>
            );
          }
          const base = l.color || lc;
          const hex = hexOf(linkFilled ? (l.color ? ink(l.color) : lon) : text);
          return (
            <li key={l.id} className={`pc-l ${l.featured ? "feat" : ""}`} style={l.color ? { "--lc": l.color, "--lon": ink(l.color) } : undefined}>
              <a href={href(l)} onClick={noop} target="_blank" rel="noopener noreferrer">
                {l.thumb && <img className="lt" src={l.thumb} alt="" loading="lazy" />}
                {c.linkIconPos === "left" && l.icon && <Icon name={l.icon} hex={hex} size={20} />}
                <span className="ltx"><b>{l.label}</b>{l.desc && <small>{l.desc}</small>}</span>
                {l.badge && <em className="lb">{l.badge}</em>}
                {c.linkIconPos === "right" && l.icon && <Icon name={l.icon} hex={hex} size={20} />}
                {c.linkArrow && <Ico n="next" size={14} className="la" />}
              </a>
            </li>
          );
        })}
      </ul>
    ),
    music: <Player a={a} c={c} inline />,
  };

  const ds = {
    "data-theme": c.theme, "data-cs": c.cardStyle, "data-bd": c.border, "data-bs": c.borderStyle, "data-lay": c.layout, "data-ls": c.linkStyle, "data-ll": c.linkLayout, "data-la": c.linkAlign,
    "data-lh": c.linkHover, "data-ih": c.socialHover, "data-ifill": c.iconFill, "data-is": c.iconStyle, "data-av": c.avatarShape, "data-ab": c.avatarBorder, "data-pa": c.entryAnim,
    "data-es": c.entryStyle, "data-ch": c.cardHover, "data-float": c.cardFloat ? "1" : "0", "data-bf": c.bannerFade ? "1" : "0", "data-bga": c.bgGradient && c.bgAnimate ? "1" : "0",
    "data-bgz": c.bgZoom ? "1" : "0", "data-ready": entered ? "1" : "0", "data-cx": c.cardX, "data-cy": c.vpos,
  };
  const fonts = fontsHref([c.font, c.nameFont !== "inherit" ? c.nameFont : c.font]);

  return (
    <div ref={stage} className={`pc-stage ${preview ? "" : "pc-full"}`} style={vars} {...ds} onMouseMove={parallax}>
      {fonts && <link rel="stylesheet" href={fonts} />}
      {c.customCss && <style dangerouslySetInnerHTML={{ __html: `.pc-stage{${c.customCss}}` }} />}

      <div ref={bg} className="pc-bgwrap">
        <div className="pc-bgz">
          <div className="pc-bg" style={bgStyle} />
          {p.bgVideo && <video className="pc-vid" src={p.bgVideo} autoPlay loop muted playsInline style={{ filter: bgFilter }} />}
        </div>
      </div>
      <div className="pc-ov" />
      {c.vignette > 0 && <div className="pc-vig" />}
      {(c.grain > 0 || c.screenFx === "grain") && <div className="pc-grain" style={c.grain === 0 ? { "--grain": 0.35 } : undefined} />}
      {c.screenFx === "scanlines" && <div className="pc-scan" />}
      {c.screenFx === "vignette" && <div className="pc-vig" style={{ "--vig": 0.8 }} />}
      <Particles kind={c.particles} count={c.particleCount} speed={c.particleSpeed * 10} size={c.particleSize} color={fx} />

      {!entered && <button type="button" className="pc-splash" onClick={enter}><span>{c.entryText || "click to enter"}</span></button>}
      {a.audio}
      {a.has && c.musicPlayer !== "hidden" && c.musicPos !== "inline" && entered && <Player a={a} c={c} />}

      <div className="pc-wrap">
        <div ref={card} className="pc" onMouseMove={tilt} onMouseLeave={() => card.current && (card.current.style.transform = "")}>
          {liveViews != null && c.showViews && c.viewsPos === "corner" && <span className="pc-views corner"><Ico n="eye" size={13} />{Number(liveViews).toLocaleString()}{c.viewsLabel ? ` ${c.viewsLabel}` : ""}</span>}
          {bh > 0 && <div className="pc-banner"><div className="pc-bimg" style={p.banner ? { backgroundImage: cssUrl(p.banner) } : undefined} /></div>}
          <div className="pc-body">
            {sections.map((s, i) => s.on && has[s.k] && <div key={s.k} className={`pc-sec sec-${s.k}`} style={{ "--i": i }}>{body[s.k]}</div>)}
            {liveViews != null && c.showViews && c.viewsPos === "bottom" && <p className="pc-views"><Ico n="eye" size={13} />{Number(liveViews).toLocaleString()} {c.viewsLabel || "views"}</p>}
          </div>
        </div>
      </div>
      {!preview && !c.hideFooter && <a className="pc-foot" href="/">{c.footerText || "havenshq.xyz"}</a>}
      <CursorFX stage={stage} kind={c.cursor} trail={c.cursorTrail} color={curColor} />
    </div>
  );
}
