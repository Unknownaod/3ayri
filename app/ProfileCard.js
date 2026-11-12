"use client";
import { useEffect, useRef, useState } from "react";
import { PLATFORMS, FONTS, CHOICES, RANGES } from "@/lib/platforms";

const DOT = { online: "#43b581", idle: "#faa61a", dnd: "#f04747", offline: "#747f8d" };

function usePresence(id, on) {
  const [d, setD] = useState(null);
  useEffect(() => {
    if (!on || !id) { setD(null); return; }
    let dead = false;
    const load = () => fetch(`https://api.lanyard.rest/v1/users/${id}`).then((r) => r.json())
      .then((j) => !dead && setD(j.success ? j.data : null)).catch(() => {});
    load();
    const t = setInterval(load, 30000);
    return () => { dead = true; clearInterval(t); };
  }, [id, on]);
  return d;
}

function useTyped(text, on) {
  const [n, setN] = useState(on ? 0 : text.length);
  useEffect(() => {
    if (!on) { setN(text.length); return; }
    let i = 0; setN(0);
    const t = setInterval(() => { i++; setN(i); if (i >= text.length) clearInterval(t); }, 35);
    return () => clearInterval(t);
  }, [text, on]);
  return text.slice(0, n);
}

function Particles({ kind, color }) {
  const ref = useRef(null);
  useEffect(() => {
    if (kind === "none" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const c = ref.current, x = c.getContext("2d");
    let w, h, id;
    const fit = () => { w = c.width = c.offsetWidth; h = c.height = c.offsetHeight; };
    fit();
    const ps = Array.from({ length: kind === "stars" ? 70 : 45 }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 2 + 0.6, v: Math.random() * 0.8 + 0.3, p: Math.random() * 6 }));
    const tick = () => {
      x.clearRect(0, 0, w, h);
      for (const p of ps) {
        if (kind === "stars") { p.p += 0.03; x.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(p.p)); }
        else {
          p.y += kind === "embers" ? -p.v : p.v; p.p += 0.02; p.x += Math.sin(p.p) * 0.4; x.globalAlpha = 0.8;
          if (p.y > h + 5) p.y = -5; if (p.y < -5) p.y = h + 5;
        }
        x.fillStyle = kind === "embers" ? color : "#fff";
        x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7); x.fill();
      }
      id = requestAnimationFrame(tick);
    };
    tick();
    addEventListener("resize", fit);
    return () => { cancelAnimationFrame(id); removeEventListener("resize", fit); };
  }, [kind, color]);
  return kind === "none" ? null : <canvas ref={ref} className="pc-fx" />;
}

export default function ProfileCard({ p, views, preview }) {
  const g = (k) => p[k] ?? (CHOICES[k] ? CHOICES[k][0] : RANGES[k][2]);
  const theme = g("theme");
  const accent = p.accent || "#e0a243";
  const iconHex = g("iconColor") === "accent" ? accent.slice(1) : theme === "light" ? "111111" : "ffffff";
  const icon = (t, s) => `https://cdn.simpleicons.org/${PLATFORMS[t].slug}/${iconHex}`;
  const avatar = p.customAvatar || p.avatar;
  const [entered, setEntered] = useState(!p.entry || !!preview);
  const [playing, setPlaying] = useState(false);
  const audio = useRef(null);
  const card = useRef(null);
  const pres = usePresence(p.discordId, p.presence);
  const bio = useTyped(p.bio || "", !!p.typewriter && !preview);
  const bh = g("bannerHeight");

  const href = (t, i) => (preview ? "#" : `/api/go?u=${p.discordId}&t=${t}&i=${i}`);
  const noop = (e) => preview && e.preventDefault();
  const enter = () => { setEntered(true); audio.current?.play().then(() => setPlaying(true)).catch(() => {}); };
  const toggle = () => { const a = audio.current; if (!a) return; if (a.paused) { a.play(); setPlaying(true); } else { a.pause(); setPlaying(false); } };
  const tilt = (e) => {
    if (!p.tilt || preview || !card.current) return;
    const r = card.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    card.current.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  };
  const act = pres?.spotify ? `Listening to ${pres.spotify.song}` : pres?.activities?.find((a) => a.type === 0) ? `Playing ${pres.activities.find((a) => a.type === 0).name}` : null;

  const cls = ["pc", `pc-${theme}`, `lay-${g("layout")}`, `w-${g("width")}`, `bd-${g("border")}`, `ls-${g("linkStyle")}`,
    `lsh-${g("linkShape")}`, `ll-${g("linkLayout")}`, `ic-${g("iconStyle")}`, `ab-${g("avatarBorder")}`, bh === 0 ? "nobanner" : ""].join(" ");

  return (
    <div className={`pc-stage ${preview ? "" : "pc-full"}`}
      style={{ "--accent": accent, "--accent2": p.accent2 || "#ffffff", "--ff": FONTS[g("font")], "--op": g("cardOpacity"), "--blur": g("blur"),
        "--rad": `${g("radius")}px`, "--av": `${g("avatarSize")}px`, "--bh": `${bh}px`, "--ic": `${g("iconSize")}px` }}>
      <div className="pc-bg" style={{ backgroundColor: p.bgColor || undefined, backgroundImage: p.background ? `url(${p.background})` : undefined, filter: `blur(${g("bgBlur")}px)` }} />
      {p.bgVideo && <video className="pc-vid" src={p.bgVideo} autoPlay loop muted playsInline />}
      <div className="pc-ov" style={{ opacity: g("overlay") / 100 }} />
      <Particles kind={g("particles")} color={accent} />

      {!entered && <button className="pc-splash" onClick={enter}>{p.entryText || "click to enter"}</button>}
      {p.music?.url && <audio ref={audio} src={p.music.url} loop preload="none" />}
      {p.music?.url && entered && (
        <button className="pc-music" onClick={toggle} aria-label={playing ? "Pause music" : "Play music"}>
          {playing ? "❚❚" : "▶"} <span>{p.music.title || "music"}</span>
        </button>
      )}

      <div ref={card} className={cls} style={p.textColor ? { "--pc-text": p.textColor } : undefined}
        onMouseMove={tilt} onMouseLeave={() => card.current && (card.current.style.transform = "")}>
        {bh > 0 && <div className="pc-banner" style={p.banner ? { backgroundImage: `url(${p.banner})` } : undefined} />}
        <div className="pc-body">
          <div className="pc-avwrap">
            {avatar && <img className={`pc-avatar av-${g("avatarShape")}`} src={avatar} alt="" />}
            {pres && <span className="pc-dot" style={{ background: DOT[pres.discord_status] || DOT.offline }} title={pres.discord_status} />}
          </div>
          <h1 className={`nm-${g("nameEffect")}`}>{p.name || p.displayName}</h1>
          <p className="pc-handle"><span>@{p.username || "username"}</span>{p.location && <span>{p.location}</span>}</p>
          {act && <p className="pc-act">{act}</p>}
          {p.bio && <p className="pc-bio">{bio}</p>}

          {p.socials?.length > 0 && (
            <div className="pc-socials">
              {p.socials.map((s, i) => PLATFORMS[s.type] && (
                <a key={i} href={href("s", i)} onClick={noop} target="_blank" rel="noopener noreferrer" aria-label={PLATFORMS[s.type].name}>
                  <img src={icon(s.type)} alt="" style={{ width: "var(--ic)", height: "var(--ic)" }} />
                </a>
              ))}
            </div>
          )}

          {p.links?.length > 0 && (
            <ul className="pc-links">
              {p.links.map((l, i) => (
                <li key={i}><a href={href("l", i)} onClick={noop} target="_blank" rel="noopener noreferrer">
                  {PLATFORMS[l.icon] && <img src={icon(l.icon)} alt="" width={18} height={18} />}{l.label}
                </a></li>
              ))}
            </ul>
          )}
          {views != null && p.showViews !== false && <p className="pc-views">{views.toLocaleString()} views</p>}
        </div>
      </div>
      {!preview && <a className="pc-foot" href="/">havenshq.xyz</a>}
    </div>
  );
}
