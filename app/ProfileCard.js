"use client";
import { useEffect, useRef, useState } from "react";
import { PLATFORMS, FONTS } from "@/lib/platforms";

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

export default function ProfileCard({ p, views, preview }) {
  const theme = p.theme || "dark";
  const ink = theme === "light" ? "111111" : "ffffff";
  const avatar = p.customAvatar || p.avatar;
  const [entered, setEntered] = useState(!p.entry || !!preview);
  const [playing, setPlaying] = useState(false);
  const audio = useRef(null);
  const card = useRef(null);
  const pres = usePresence(p.discordId, p.presence);
  const bio = useTyped(p.bio || "", !!p.typewriter && !preview);

  const href = (t, i) => (preview ? "#" : `/api/go?u=${p.discordId}&t=${t}&i=${i}`);
  const noop = (e) => preview && e.preventDefault();

  function enter() {
    setEntered(true);
    audio.current?.play().then(() => setPlaying(true)).catch(() => {});
  }
  function toggle() {
    const a = audio.current;
    if (!a) return;
    if (a.paused) { a.play(); setPlaying(true); } else { a.pause(); setPlaying(false); }
  }
  function tilt(e) {
    if (!p.tilt || preview || !card.current) return;
    const r = card.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    card.current.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  }

  const act = pres?.spotify ? `Listening to ${pres.spotify.song}` : pres?.activities?.find((a) => a.type === 0) ? `Playing ${pres.activities.find((a) => a.type === 0).name}` : null;

  return (
    <div className={`pc-stage ${preview ? "" : "pc-full"}`}
      style={{ "--accent": p.accent, "--ff": FONTS[p.font] || FONTS.sans, "--op": p.cardOpacity ?? 85, "--blur": p.blur ?? 12,
        backgroundColor: p.bgColor || undefined, backgroundImage: p.background ? `url(${p.background})` : undefined }}>
      {!entered && <button className="pc-splash" onClick={enter}>{p.entryText || "click to enter"}</button>}
      {p.music?.url && <audio ref={audio} src={p.music.url} loop preload="none" />}
      {p.music?.url && entered && (
        <button className="pc-music" onClick={toggle} aria-label={playing ? "Pause music" : "Play music"}>
          {playing ? "❚❚" : "▶"} <span>{p.music.title || "music"}</span>
        </button>
      )}

      <div ref={card} className={`pc pc-${theme} lay-${p.layout || "center"}`} onMouseMove={tilt} onMouseLeave={() => card.current && (card.current.style.transform = "")}>
        <div className="pc-banner" style={p.banner ? { backgroundImage: `url(${p.banner})` } : undefined} />
        <div className="pc-body">
          <div className="pc-avwrap">
            {avatar && <img className={`pc-avatar av-${p.avatarShape || "circle"}`} src={avatar} alt="" width={104} height={104} />}
            {pres && <span className="pc-dot" style={{ background: DOT[pres.discord_status] || DOT.offline }} title={pres.discord_status} />}
          </div>
          <h1>{p.name || p.displayName}</h1>
          <p className="pc-handle">
            <span>@{p.username || "username"}</span>
            {p.location && <span>{p.location}</span>}
          </p>
          {act && <p className="pc-act">{act}</p>}
          {p.bio && <p className="pc-bio">{bio}</p>}

          {p.socials?.length > 0 && (
            <div className="pc-socials">
              {p.socials.map((s, i) => PLATFORMS[s.type] && (
                <a key={i} href={href("s", i)} onClick={noop} target="_blank" rel="noopener noreferrer" aria-label={PLATFORMS[s.type].name}>
                  <img src={`https://cdn.simpleicons.org/${PLATFORMS[s.type].slug}/${ink}`} alt="" width={22} height={22} />
                </a>
              ))}
            </div>
          )}

          {p.links?.length > 0 && (
            <ul className="pc-links">
              {p.links.map((l, i) => (
                <li key={i}><a href={href("l", i)} onClick={noop} target="_blank" rel="noopener noreferrer">{l.label}</a></li>
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
