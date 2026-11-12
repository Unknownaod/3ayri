"use client";
import { useEffect, useRef, useState } from "react";
import { PLATFORMS, iconKind, ytId } from "@/lib/schema";
import { badgesOf, badgeUrl } from "@/lib/badges";
import { Ico } from "@/lib/icons";

// ───────────── icons ─────────────
// name = platform slug ("github"), built-in ("globe") or "si:<any simpleicons slug>". hex = colour (no #); omit for the brand's own.
export function Icon({ name, hex, size = 20, swap }) {
  const kind = iconKind(name);
  const [bad, setBad] = useState(false);
  if (!kind) return null;
  if (kind === "builtin") return <Ico n={name} size={size} />;
  const slug = kind === "si" ? name.slice(3) : PLATFORMS[name].slug;
  if (bad) return <span className="pc-ifb" style={{ width: size, height: size, fontSize: size * 0.62 }}>{slug[0].toUpperCase()}</span>;
  const src = (h) => `https://cdn.simpleicons.org/${slug}${h ? `/${h}` : ""}`;
  if (swap) { // second copy in the brand's own colour, faded in on hover
    return (
      <span className="pc-iswap" style={{ width: size, height: size }}>
        <img className="a" src={src(hex)} width={size} height={size} alt="" loading="lazy" decoding="async" onError={() => setBad(true)} />
        <img className="b" src={src("")} width={size} height={size} alt="" loading="lazy" decoding="async" />
      </span>
    );
  }
  return <img src={src(hex)} width={size} height={size} alt="" loading="lazy" decoding="async" onError={() => setBad(true)} />;
}

// ───────────── time ─────────────
export function useNow(active) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);
  return now;
}
export const fmt = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(x).padStart(2, "0")}` : `${m}:${String(x).padStart(2, "0")}`;
};

// ───────────── Discord status ─────────────
export const DOT = { online: "#43b581", idle: "#faa61a", dnd: "#f04747", offline: "#747f8d" };
export const LBL = { online: "Online", idle: "Idle", dnd: "Do not disturb", offline: "Offline" };
const KIND = { spotify: "Listening to Spotify", game: "Playing", stream: "Streaming", watch: "Watching", compete: "Competing in" };

// Badge art is drawn here (simple original marks in each badge's colour), so it never depends on a CDN.
const W = { fill: "#fff" }, L = { fill: "none", stroke: "#fff", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
const ART = {
  staff: <path {...W} d="M12 5l6 2.4v4.8c0 3.8-2.5 6.4-6 7.8-3.5-1.4-6-4-6-7.8V7.4z" />,
  mod: <><path {...W} d="M12 5l6 2.4v4.8c0 3.8-2.5 6.4-6 7.8-3.5-1.4-6-4-6-7.8V7.4z" /><path {...L} stroke="currentColor" d="M9.2 12.2l2 2 3.6-4" /></>,
  partner: <><circle {...L} cx="9.3" cy="12" r="3.6" /><circle {...L} cx="14.7" cy="12" r="3.6" /></>,
  events: <path {...W} d="M12 4.8l2 4.2 4.6.6-3.4 3.2.9 4.6-4.1-2.3-4.1 2.3.9-4.6L5.4 9.6 10 9z" />,
  bug: <><ellipse {...W} cx="12" cy="13.5" rx="3.3" ry="4.4" /><circle {...W} cx="12" cy="7.8" r="1.8" /><path {...L} d="M8.6 11l-2.6-1.4M15.4 11l2.6-1.4M8.4 14.5H5.6M15.6 14.5h2.8M9 17.6l-2 1.6M15 17.6l2 1.6" /></>,
  buggold: <><ellipse {...W} cx="12" cy="13.5" rx="3.3" ry="4.4" /><circle {...W} cx="12" cy="7.8" r="1.8" /><path {...L} d="M8.6 11l-2.6-1.4M15.4 11l2.6-1.4M8.4 14.5H5.6M15.6 14.5h2.8M9 17.6l-2 1.6M15 17.6l2 1.6" /></>,
  bravery: <path {...W} d="M12 5.2l6.2 11.4H5.8z" />,
  brilliance: <path {...W} d="M12 4.8l6.2 7.2-6.2 7.2L5.8 12z" />,
  balance: <><path {...W} d="M12 5.2a6.8 6.8 0 0 0 0 13.6z" /><path {...L} d="M12 5.2a6.8 6.8 0 0 1 0 13.6" /></>,
  early: <path {...L} d="M5 16.5h14M7.6 16.5a4.4 4.4 0 0 1 8.8 0M12 6.5v3M6.6 9.6l2 2M17.4 9.6l-2 2" />,
  botdev: <><rect {...W} x="6.5" y="9.5" width="11" height="8.5" rx="2.2" /><path {...L} d="M12 9.5V6.3M10.2 6.3h3.6" /><circle cx="9.6" cy="13.6" r="1.2" fill="currentColor" /><circle cx="14.4" cy="13.6" r="1.2" fill="currentColor" /></>,
  dev: <path {...L} d="M9.6 8.4L6 12l3.6 3.6M14.4 8.4L18 12l-3.6 3.6M13 7.2l-2 9.6" />,
  nitro: <><path {...W} d="M8 6.2h8l2.8 4L12 18.6 5.2 10.2z" /><path {...L} stroke="currentColor" strokeWidth="1.2" d="M5.2 10.2h13.6M10 6.2l-1.2 4 3.2 8.4M14 6.2l1.2 4-3.2 8.4" /></>,
};

// Discord's own badge image; if it can't load (blocked, or Discord moved it) the drawn icon above takes over.
function Badge({ t, e, col, id, hash }) {
  const [bad, setBad] = useState(false);
  const art = ART[id] ? <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="11.2" fill={col} />{ART[id]}</svg> : e;
  return (
    <i role="listitem" title={t} aria-label={t} style={{ "--bc": col, color: "#14100c" }}>
      {hash && !bad ? <img src={badgeUrl(hash)} width={22} height={22} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setBad(true)} /> : art}
    </i>
  );
}

export function DBadges({ d }) {
  const b = badgesOf(d);
  return b.length ? <span className="pc-dbadges" role="list">{b.map(([t, e, col, id, hash]) => <Badge key={id || t} t={t} e={e} col={col} id={id} hash={hash} />)}</span> : null;
}

export function actsOf(pres) { return pres?.acts?.length ? pres.acts : pres?.act ? [pres.act] : []; }

export function Presence({ pres, c, p }) {
  const acts = c.presenceActivity ? actsOf(pres) : [];
  const timed = c.presenceTimer && acts.some((a) => a.start);
  const now = useNow(timed);
  const d = p.discord || {};
  const dn = d.displayName || p.displayName, av = d.avatar || p.avatar;
  const inCard = c.badgePlacement === "card" || c.badgePlacement === "both";
  if (c.presenceHideOffline && pres.status === "offline") return null;
  const dot = <i className="pr-dot" style={{ background: DOT[pres.status] || DOT.offline }} />;
  const custom = c.presenceCustom && pres.custom ? pres.custom : "";
  const ce = custom && pres.ce ? <img className="pr-emoji" src={`https://cdn.discordapp.com/emojis/${pres.ce.id}.${pres.ce.animated ? "gif" : "png"}?size=32`} alt="" /> : null;

  if (c.presenceStyle === "compact") {
    const a = acts[0];
    return (
      <p className="pc-pres compact">{dot}{c.presenceName && dn ? `${dn} · ` : ""}
        {a ? `${KIND[a.kind]?.replace(" Spotify", "")} ${a.title}` : custom || LBL[pres.status]}{inCard && <DBadges d={d} />}
      </p>
    );
  }
  return (
    <div className="pc-pres card">
      {(c.presenceAvatar || c.presenceName) && (
        <div className="pc-did">
          {c.presenceAvatar && av && <span className="pc-davw"><img src={av} alt="" /><i style={{ background: DOT[pres.status] || DOT.offline }} /></span>}
          {c.presenceName && <div><b>{dn}</b>{d.username && <small>@{d.username}</small>}{inCard && <DBadges d={d} />}</div>}
        </div>
      )}
      <div className="pc-pres-top">{dot}{LBL[pres.status] || "Offline"}
        {custom && <span>· {ce}{custom}</span>}
        {c.presencePlatform && pres.plat?.length > 0 && <span className="pr-plat">{pres.plat.map((x) => <Ico key={x} n={x === "mobile" ? "phone" : x === "web" ? "globe" : "monitor"} size={14} />)}</span>}
      </div>
      {acts.map((a, i) => {
        const prog = c.presenceTimer && a.kind === "spotify" && a.end > a.start ? Math.min(1, Math.max(0, (now - a.start) / (a.end - a.start))) : null;
        const Art = a.url ? "a" : "div";
        return (
          <div className="pc-act" key={i}>
            <Art className="pr-art" {...(a.url ? { href: a.url, target: "_blank", rel: "noopener noreferrer", "aria-label": "Open in Spotify" } : {})}>
              {a.art ? <img src={a.art} alt="" /> : <Ico n={a.kind === "spotify" ? "music" : "gamepad"} size={22} />}
            </Art>
            <div>
              <small>{KIND[a.kind] || "Playing"}</small><b>{a.title}</b>
              {a.sub && <span>{a.sub}</span>}{a.sub2 && <span>{a.sub2}</span>}
              {prog != null && <div className="pr-prog"><em>{fmt(now - a.start)}</em><u><s style={{ width: `${prog * 100}%` }} /></u><em>{fmt(a.end - a.start)}</em></div>}
              {c.presenceTimer && a.kind !== "spotify" && a.start > 0 && <span className="pr-el">{fmt(now - a.start)} elapsed</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ───────────── audio (playlist: direct files and YouTube) ─────────────
let ytReady;
const loadYT = () => ytReady || (ytReady = new Promise((res) => {
  if (window.YT?.Player) return res(window.YT);
  const prev = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => { prev?.(); res(window.YT); };
  const s = document.createElement("script"); s.src = "https://www.youtube.com/iframe_api"; document.head.appendChild(s);
}));

export function useAudio(list, c, preview) {
  const el = useRef(null), yt = useRef(null), ytBox = useRef(null), want = useRef(false), vols = useRef({ v: c.musicVolume, m: false });
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [vol, setVol] = useState(c.musicVolume);
  const [muted, setMuted] = useState(false);
  const [ytTitle, setYtTitle] = useState("");
  const n = list.length, i = Math.min(idx, Math.max(0, n - 1)), raw = list[i];
  const vid = raw ? ytId(raw.url) : null;
  const trk = raw && { ...raw, title: raw.title || (vid ? ytTitle : ""), cover: raw.cover || (vid ? `https://i.ytimg.com/vi/${vid}/hqdefault.jpg` : "") };
  const cb = useRef({});

  useEffect(() => { setVol(c.musicVolume); }, [c.musicVolume]);
  useEffect(() => {
    vols.current = { v: vol, m: muted };
    if (el.current) el.current.volume = muted ? 0 : vol / 100;
    try { yt.current?.setVolume?.(muted ? 0 : vol); } catch {}
  }, [vol, muted, raw?.url]);
  useEffect(() => { if (!vid && want.current && el.current) el.current.play().catch(() => {}); }, [i, raw?.url]);

  // YouTube: one hidden player, re-used for every YouTube track
  useEffect(() => {
    setCur(0); setDur(0);
    if (!vid) { try { yt.current?.pauseVideo?.(); } catch {} return; }
    let dead = false;
    loadYT().then((YT) => {
      if (dead) return;
      if (yt.current?.loadVideoById) {
        want.current ? yt.current.loadVideoById(vid) : yt.current.cueVideoById(vid);
        return;
      }
      yt.current = new YT.Player(ytBox.current, {
        width: 200, height: 200, videoId: vid, playerVars: { playsinline: 1, controls: 0, disablekb: 1, rel: 0, modestbranding: 1 },
        events: {
          onReady: (e) => { e.target.setVolume(vols.current.m ? 0 : vols.current.v); setYtTitle(e.target.getVideoData?.().title || ""); if (want.current) e.target.playVideo(); },
          onStateChange: (e) => {
            const st = e.data;
            if (st === 1) { setPlaying(true); setYtTitle(e.target.getVideoData?.().title || ""); }
            else if (st === 2 || st === 5) setPlaying(false);
            else if (st === 0) { setPlaying(false); cb.current.ended?.(); }
          },
          onError: () => { setPlaying(false); if (want.current) cb.current.next?.(); },
        },
      });
    });
    return () => { dead = true; };
  }, [vid]);
  useEffect(() => { // YouTube has no timeupdate event
    if (!vid) return;
    const t = setInterval(() => { const p = yt.current; if (p?.getCurrentTime) { setCur(p.getCurrentTime() || 0); setDur(p.getDuration?.() || 0); } }, 500);
    return () => clearInterval(t);
  }, [vid]);
  useEffect(() => () => { try { yt.current?.destroy?.(); } catch {} yt.current = null; }, []);

  const isPlaying = () => (vid ? yt.current?.getPlayerState?.() === 1 : el.current && !el.current.paused);
  const play = () => {
    want.current = true;
    if (vid) { try { yt.current?.playVideo?.(); } catch {} return Promise.resolve(true); } // if the player isn't ready yet, onReady starts it
    return el.current?.play().then(() => true).catch(() => false);
  };
  const pause = () => { want.current = false; if (vid) { try { yt.current?.pauseVideo?.(); } catch {} } else el.current?.pause(); };
  const toggle = () => (isPlaying() ? pause() : play());
  const jump = (to) => { want.current = true; setIdx(to); setCur(0); };
  const next = () => {
    if (n < 2) { seek(0); play(); return; }
    jump(c.musicShuffle ? (i + 1 + Math.floor(Math.random() * (n - 1))) % n : (i + 1) % n);
  };
  const prev = () => { if (cur > 3 || n < 2) seek(0); else jump((i - 1 + n) % n); };
  const seek = (t) => { if (vid) { try { yt.current?.seekTo?.(t, true); } catch {} } else if (el.current) el.current.currentTime = t; setCur(t); };
  const ended = () => {
    if (c.musicLoop === "one") { seek(0); play(); return; }
    if (c.musicLoop === "off" && i === n - 1) { setPlaying(false); want.current = false; return; }
    next();
  };
  cb.current = { ended, next };

  // Browsers need a gesture to start audio: if the first attempt is blocked, retry on the first tap / key press.
  const start = () => {
    if (!n || preview) return;
    const retry = () => {
      const once = () => { play(); ["pointerdown", "keydown", "touchstart"].forEach((e) => removeEventListener(e, once)); };
      ["pointerdown", "keydown", "touchstart"].forEach((e) => addEventListener(e, once, { once: true }));
    };
    play().then((ok) => {
      if (!ok) return retry();
      if (vid) setTimeout(() => { if (want.current && !isPlaying()) retry(); }, 2000);
    });
  };
  const audio = trk ? (
    vid ? <div className="pc-yt" aria-hidden="true"><div ref={ytBox} /></div> : (
      <audio ref={el} src={trk.url} loop={c.musicLoop === "one"} preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={ended}
        onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)} onLoadedMetadata={(e) => setDur(e.currentTarget.duration || 0)} />
    )
  ) : null;
  return { has: n > 0, n, trk, playing, cur, dur, vol, setVol, muted, setMuted, toggle, next, prev, seek, start, audio };
}

export function Player({ a, c, inline }) {
  const t = a.trk;
  if (!t) return null;
  const st = c.musicPlayer, mmss = (s) => fmt((s || 0) * 1000);
  return (
    <div className={`pc-player pl-${st} ${inline ? "pos-inline" : `pos-${c.musicPos}`}`}>
      {st === "card" && <div className="pl-cover">{t.cover ? <img src={t.cover} alt="" /> : <Ico n="music" size={24} />}</div>}
      <div className="pl-main">
        <div className="pl-row">
          {st !== "minimal" && a.n > 1 && <button type="button" className="pl-btn" onClick={a.prev} aria-label="Previous track"><Ico n="prev" size={16} /></button>}
          <button type="button" className="pl-btn pl-play" onClick={a.toggle} aria-label={a.playing ? "Pause" : "Play"}><Ico n={a.playing ? "pause" : "play"} size={st === "minimal" ? 14 : 17} /></button>
          {st !== "minimal" && a.n > 1 && <button type="button" className="pl-btn" onClick={a.next} aria-label="Next track"><Ico n="next" size={16} /></button>}
          <div className="pl-info"><b>{t.title || "music"}</b>{t.artist && <span>{t.artist}</span>}{a.playing && <em className="pl-eq"><i /><i /><i /></em>}</div>
          {c.musicVolShow && st !== "minimal" && (
            <div className="pl-vol">
              <button type="button" className="pl-btn" onClick={() => a.setMuted(!a.muted)} aria-label={a.muted ? "Unmute" : "Mute"}><Ico n={a.muted || a.vol === 0 ? "mute" : "vol"} size={16} /></button>
              <input type="range" min="0" max="100" value={a.muted ? 0 : a.vol} aria-label="Volume" onChange={(e) => { a.setMuted(false); a.setVol(+e.target.value); }} />
            </div>
          )}
        </div>
        {c.musicProgress && (st === "bar" || st === "card") && (
          <div className="pl-prog"><em>{mmss(a.cur)}</em>
            <input type="range" min="0" max={a.dur || 1} step="0.1" value={Math.min(a.cur, a.dur || 1)} aria-label="Seek" onChange={(e) => a.seek(+e.target.value)} /><em>{mmss(a.dur)}</em></div>
        )}
      </div>
    </div>
  );
}
