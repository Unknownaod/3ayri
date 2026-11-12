"use client";
import { useRef, useState } from "react";
import { PLATFORMS, BUILTIN_ICONS, BUILTIN_LABELS, PRESETS, SECTIONS, FONT_LABELS, FONTS, FIELDS, applyPreset, cfg, rid, sectionsOf, embedSrc } from "@/lib/schema";
import { badgesOf } from "@/lib/badges";
import { Ico } from "@/lib/icons";
import { Presence } from "../profile-parts";

// ───────────── shared helpers ─────────────
export const compress = (file, maxPx, maxChars) => new Promise((resolve, reject) => {
  const read = () => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(file); };
  if (file.type === "image/gif") return read();
  const img = new Image(), url = URL.createObjectURL(file);
  img.onload = () => {
    const s = Math.min(1, maxPx / Math.max(img.width, img.height)), c = document.createElement("canvas");
    c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    let q = 0.86, out = c.toDataURL("image/jpeg", q);
    while (out.length > maxChars && q > 0.3) { q -= 0.1; out = c.toDataURL("image/jpeg", q); }
    URL.revokeObjectURL(url); resolve(out);
  };
  img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("bad image")); };
  img.src = url;
});

export function useDrag(list, onMove) {
  const from = useRef(null);
  const [over, setOver] = useState(-1);
  return (i) => ({
    draggable: true,
    onDragStart: (e) => { from.current = i; e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", String(i)); } catch {} },
    onDragOver: (e) => { e.preventDefault(); if (over !== i) setOver(i); },
    onDragLeave: () => setOver(-1),
    onDrop: (e) => { e.preventDefault(); setOver(-1); if (from.current != null && from.current !== i) onMove(from.current, i); from.current = null; },
    onDragEnd: () => setOver(-1),
    "data-over": over === i ? "1" : undefined,
  });
}
const mv = (arr, a, b) => { const n = arr.slice(); const [x] = n.splice(a, 1); n.splice(b, 0, x); return n; };

function Mv({ i, n, go }) {
  return (
    <span className="mv">
      <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => go(i, i - 1)}><Ico n="up" size={14} /></button>
      <button type="button" aria-label="Move down" disabled={i === n - 1} onClick={() => go(i, i + 1)}><Ico n="down" size={14} /></button>
    </span>
  );
}

// ───────────── badges ─────────────
export function BadgesEditor({ me, set }) {
  const list = me.badges || [];
  return (
    <div className="fld"><span>Custom badges <small>up to 8 chips, shown under your name</small></span>
      {list.map((b, i) => (
        <div className="item" key={i}>
          <input value={b} maxLength={20} onChange={(e) => set("badges", list.map((x, j) => (j === i ? e.target.value : x)))} placeholder="e.g. 👑 Owner" aria-label={`Badge ${i + 1}`} />
          <button type="button" className="ib" aria-label="Remove badge" onClick={() => set("badges", list.filter((_, j) => j !== i))}><Ico n="trash" size={15} /></button>
        </div>
      ))}
      {list.length < 8 && <button type="button" className="hp-ghost" onClick={() => set("badges", [...list, ""])}><Ico n="plus" size={14} /> Add badge</button>}
    </div>
  );
}

// ───────────── links ─────────────
const ICON_CHOICES = [["", "No icon"], ...BUILTIN_ICONS.map((k) => [k, BUILTIN_LABELS[k] || k]), ...Object.entries(PLATFORMS).map(([k, v]) => [k, v.name])];

function LinkRow({ l, i, n, clicks, update, remove, go, drag }) {
  const [open, setOpen] = useState(false);
  const up = (k, v) => update(i, { [k]: v });
  const label = { header: "Heading", divider: "Divider", embed: "Embed" }[l.type];
  return (
    <div className={`item col ${l.hidden ? "dim" : ""}`} {...drag(i)}>
      <div className="irow">
        <span className="grip" title="Drag to reorder"><Ico n="grip" size={16} /></span>
        {l.type === "divider" ? <span className="ilabel">Divider line</span> : (
          <input value={l.type === "link" ? l.label || "" : l.type === "header" ? l.label || "" : l.url || ""} aria-label={label || "Link title"}
            placeholder={l.type === "header" ? "Heading text" : l.type === "embed" ? "YouTube or Spotify link" : "Link title"} maxLength={l.type === "embed" ? 300 : 60}
            onChange={(e) => up(l.type === "embed" ? "url" : "label", e.target.value)} />
        )}
        {label && <small className="tag">{label}</small>}
        {l.type === "link" && <small className="clk" title="Clicks">{clicks || 0} clicks</small>}
        <Mv i={i} n={n} go={go} />
        {l.type === "link" && <button type="button" className={`ib ${open ? "on" : ""}`} aria-label="More options" aria-expanded={open} onClick={() => setOpen(!open)}><Ico n="sliders" size={15} /></button>}
        {l.type !== "divider" && <button type="button" className={`ib ${l.hidden ? "on" : ""}`} aria-label={l.hidden ? "Show" : "Hide"} title={l.hidden ? "Hidden from your page" : "Hide from page"} onClick={() => up("hidden", !l.hidden)}><Ico n="hide" size={15} /></button>}
        <button type="button" className="ib" aria-label="Delete" onClick={() => remove(i)}><Ico n="trash" size={15} /></button>
      </div>
      {l.type === "link" && <input className="sub" value={l.url || ""} onChange={(e) => up("url", e.target.value)} placeholder="https://…" aria-label="Link URL" />}
      {l.type === "embed" && l.url && !embedSrc(l.url) && <small className="warn">Only YouTube and Spotify links can be embedded.</small>}
      {open && l.type === "link" && (
        <div className="adv">
          <label className="fld"><span>Icon</span><select value={l.icon || ""} onChange={(e) => up("icon", e.target.value)}>{ICON_CHOICES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
          <label className="fld"><span>Description</span><input value={l.desc || ""} maxLength={80} onChange={(e) => up("desc", e.target.value)} placeholder="Small text under the title" /></label>
          <label className="fld"><span>Badge</span><input value={l.badge || ""} maxLength={14} onChange={(e) => up("badge", e.target.value)} placeholder="NEW" /></label>
          <label className="fld"><span>Thumbnail link</span><input value={l.thumb?.startsWith("data:") ? "" : l.thumb || ""} onChange={(e) => up("thumb", e.target.value)} placeholder="https://…/image.png" /></label>
          <div className="fld"><span>Button color</span>
            <div className="colrow"><input type="color" value={l.color || "#e0a243"} onChange={(e) => up("color", e.target.value)} aria-label="Button color" />{l.color && <button type="button" className="hp-ghost" onClick={() => up("color", "")}>Use default</button>}</div></div>
          <label className="chk"><input type="checkbox" checked={!!l.featured} onChange={(e) => up("featured", e.target.checked)} />Feature this link (bigger, highlighted)</label>
        </div>
      )}
    </div>
  );
}

export function LinksEditor({ me, set, stats }) {
  const list = me.links || [];
  const setList = (n) => set("links", n);
  const update = (i, patch) => setList(list.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const drag = useDrag(list, (a, b) => setList(mv(list, a, b)));
  const add = (type) => setList([...list, { id: `l${rid()}`, type, label: "", url: "", ...(type === "link" ? { icon: "" } : {}) }]);
  return (
    <div className="fld">
      {list.length === 0 && <p className="empty">No links yet. Add a link, a heading to group them, or embed a song or video.</p>}
      {list.map((l, i) => <LinkRow key={l.id} l={l} i={i} n={list.length} clicks={stats?.[l.id]} update={update} remove={(k) => setList(list.filter((_, j) => j !== k))} go={(a, b) => setList(mv(list, a, b))} drag={drag} />)}
      {list.length < 40 && (
        <div className="seg add">
          <button type="button" onClick={() => add("link")}><Ico n="link" size={14} /> Link</button>
          <button type="button" onClick={() => add("header")}><Ico n="header" size={14} /> Heading</button>
          <button type="button" onClick={() => add("divider")}><Ico n="divider" size={14} /> Divider</button>
          <button type="button" onClick={() => add("embed")}><Ico n="embed" size={14} /> Embed</button>
        </div>
      )}
    </div>
  );
}

// ───────────── socials ─────────────
export function SocialsEditor({ me, set, stats }) {
  const list = me.socials || [];
  const [add, setAdd] = useState("instagram");
  const setList = (n) => set("socials", n);
  const drag = useDrag(list, (a, b) => setList(mv(list, a, b)));
  return (
    <div className="fld">
      {list.length === 0 && <p className="empty">No icons yet. Pick a platform below.</p>}
      {list.map((s, i) => PLATFORMS[s.type] && (
        <div className="item col" key={s.id} {...drag(i)}>
          <div className="irow">
            <span className="grip"><Ico n="grip" size={16} /></span>
            <img src={`https://cdn.simpleicons.org/${PLATFORMS[s.type].slug}/ffffff`} alt="" width={20} height={20} />
            <input value={s.url} onChange={(e) => setList(list.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} placeholder={PLATFORMS[s.type].ph} aria-label={`${PLATFORMS[s.type].name} link`} />
            <small className="clk">{stats?.[s.id] || 0} clicks</small>
            <Mv i={i} n={list.length} go={(a, b) => setList(mv(list, a, b))} />
            <button type="button" className="ib" aria-label="Remove" onClick={() => setList(list.filter((_, j) => j !== i))}><Ico n="trash" size={15} /></button>
          </div>
          <input className="sub" value={s.label || ""} maxLength={24} onChange={(e) => setList(list.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} placeholder={`Label (shown when "Show labels" is on, default: ${PLATFORMS[s.type].name})`} />
        </div>
      ))}
      {list.length < 24 && (
        <div className="colrow">
          <select value={add} onChange={(e) => setAdd(e.target.value)} aria-label="Platform">{Object.entries(PLATFORMS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}</select>
          <button type="button" className="hp-ghost" onClick={() => setList([...list, { id: `s${rid()}`, type: add, url: "", label: "" }])}><Ico n="plus" size={14} /> Add icon</button>
        </div>
      )}
    </div>
  );
}

// ───────────── extra tracks ─────────────
export function TracksEditor({ me, set }) {
  const list = me.tracks || [];
  const setList = (n) => set("tracks", n);
  const upd = (i, k, v) => setList(list.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  return (
    <div className="fld"><span>More tracks <small>YouTube or audio links, played after track 1 in this order</small></span>
      {list.map((t, i) => (
        <div className="item col" key={t.id}>
          <div className="irow">
            <input value={t.url || ""} onChange={(e) => upd(i, "url", e.target.value)} placeholder="YouTube link or https://…/song.mp3" aria-label="YouTube or audio link" />
            <Mv i={i} n={list.length} go={(a, b) => setList(mv(list, a, b))} />
            <button type="button" className="ib" aria-label="Remove track" onClick={() => setList(list.filter((_, j) => j !== i))}><Ico n="trash" size={15} /></button>
          </div>
          <div className="adv two">
            <input value={t.title || ""} maxLength={60} onChange={(e) => upd(i, "title", e.target.value)} placeholder="Title (YouTube: filled in automatically)" />
            <input value={t.artist || ""} maxLength={60} onChange={(e) => upd(i, "artist", e.target.value)} placeholder="Artist" />
            <input value={t.cover || ""} onChange={(e) => upd(i, "cover", e.target.value)} placeholder="Cover image link (YouTube: thumbnail by default)" />
          </div>
        </div>
      ))}
      {list.length < 10 && <button type="button" className="hp-ghost" onClick={() => setList([...list, { id: `t${rid()}`, url: "", title: "", artist: "", cover: "" }])}><Ico n="plus" size={14} /> Add track</button>}
    </div>
  );
}

// ───────────── layout sections ─────────────
export function SectionsEditor({ me, set }) {
  const list = sectionsOf(me);
  const setList = (n) => set("sections", n);
  const drag = useDrag(list, (a, b) => setList(mv(list, a, b)));
  return (
    <div className="fld">
      <p className="empty">Drag to reorder, or switch parts off. The card is built from top to bottom in this order.</p>
      {list.map((s, i) => (
        <div className={`item ${s.on ? "" : "dim"}`} key={s.k} {...drag(i)}>
          <span className="grip"><Ico n="grip" size={16} /></span>
          <b className="ilabel">{SECTIONS[s.k]}</b>
          <Mv i={i} n={list.length} go={(a, b) => setList(mv(list, a, b))} />
          <label className="sw"><input type="checkbox" checked={s.on} onChange={(e) => setList(list.map((x) => (x.k === s.k ? { ...x, on: e.target.checked } : x)))} aria-label={`Show ${SECTIONS[s.k]}`} /><i /></label>
        </div>
      ))}
      <button type="button" className="hp-ghost" onClick={() => setList([])}><Ico n="refresh" size={14} /> Restore default order</button>
    </div>
  );
}

// ───────────── presets / theme tools ─────────────
export function PresetsBlock({ me, patch, flash }) {
  const sharable = (o) => Object.fromEntries(Object.entries(o).filter(([k]) => FIELDS[k] && !["img", "media", "text", "area"].includes(FIELDS[k].t)));
  return (
    <div className="fld"><span>Start from a preset <small>keeps your name, bio and links</small></span>
      <div className="presets">
        {Object.keys(PRESETS).map((n) => {
          const a = applyPreset(n);
          return (
            <button type="button" key={n} className="preset" onClick={() => { patch(a); flash(`${n} applied`); }}
              style={{ "--a": a.accent, "--b": a.accent2, "--bg1": a.bgColor || "#0d0a08", "--bg2": a.bgColor2 || a.bgColor || "#1a1410" }}>
              <i /><b>{n}</b>
            </button>
          );
        })}
      </div>
      <div className="seg">
        <button type="button" onClick={() => { navigator.clipboard?.writeText(JSON.stringify(sharable(cfg(me)))).then(() => flash("Theme copied")).catch(() => flash("Couldn't copy")); }}><Ico n="copy" size={14} /> Copy my theme</button>
        <button type="button" onClick={() => {
          const raw = prompt("Paste a theme");
          if (!raw) return;
          try { const o = sharable(JSON.parse(raw)); if (!Object.keys(o).length) throw 0; patch(o); flash("Theme pasted"); } catch { flash("That doesn't look like a theme"); }
        }}><Ico n="download" size={14} /> Paste a theme</button>
        <button type="button" onClick={() => { if (confirm("Reset every design option to its default? Your text and links stay.")) { patch(applyPreset("")); flash("Design reset"); } }}><Ico n="undo" size={14} /> Reset design</button>
      </div>
    </div>
  );
}

// ───────────── font picker ─────────────
export function FontPicker({ value, onChange, opts }) {
  return (
    <div className="fonts" role="listbox">
      {opts.map((o) => (
        <button type="button" key={o} role="option" aria-selected={value === o} className={value === o ? "on" : ""} onClick={() => onChange(o)} style={{ fontFamily: o === "inherit" ? undefined : FONTS[o] }}>
          {o === "inherit" ? "Same as page font" : FONT_LABELS[o] || o}
        </button>
      ))}
    </div>
  );
}

// ───────────── Discord ─────────────
export function DiscordBlock({ me, patch, rd, setRd }) {
  const d = me.discord || {};
  const b = badgesOf(d);
  async function read() {
    setRd({ loading: true });
    try {
      const r = await fetch("/api/presence", { method: "POST" });
      const j = await r.json();
      setRd(j);
      if (j.ok) patch({ discord: j.discord, ...(me.presence ? {} : { presence: true }) });
    } catch { setRd({ ok: false, message: "Couldn't reach the server. Check your connection and try again." }); }
  }
  const c = cfg(me);
  return (
    <div className="dsc">
      <div className="did">
        {(d.avatar || me.avatar) && <img src={d.avatar || me.avatar} alt="" />}
        <div><b>{d.displayName || me.displayName || "Your Discord account"}</b><small>{d.username ? `@${d.username}` : "Not read yet"}</small>
          {b.length > 0 && <span className="pc-dbadges">{b.map(([t, e, col], i) => <i key={i} title={t} style={{ "--bc": col }}>{e}</i>)}</span>}</div>
      </div>
      <p className="hint">This checks that you're in the same server as the bot, then reads your current status, game or song, and refreshes your name, avatar and badges.</p>
      <button type="button" className="hp-btn gold" disabled={rd?.loading} onClick={read}>{rd?.loading ? "Reading…" : "Read my Discord status"}</button>
      {rd && !rd.loading && (
        <div className={`rd ${rd.ok ? "ok" : "no"}`} role="status">
          {rd.ok ? (
            <>
              <b><Ico n="check" size={15} /> Found you{rd.nick ? `, ${rd.nick}` : ""}</b>
              {!rd.botOnline && <small>The bot worker looks offline, so this is the last status it saved.</small>}
              {rd.botOnline && !rd.fresh && <small>The bot didn't answer in time, so this is its last saved status.</small>}
              <div className="rd-pres" style={{ "--accent": me.accent || "#e0a243" }}>
                <Presence pres={rd.presence} c={{ ...c, presenceStyle: "card", presence: true, presenceAvatar: true, presenceName: true, presenceActivity: true, presenceCustom: true, presencePlatform: true, presenceTimer: true, badgePlacement: "off", presenceHideOffline: false }} p={{ ...me, discord: rd.discord }} />
              </div>
              <small>Live status is now on for your page. You can change what it shows below.</small>
            </>
          ) : (
            <>
              <b><Ico n="alert" size={15} /> {rd.message || "Couldn't read your status."}</b>
              {rd.reason === "not_in_server" && rd.invite && <a className="hp-btn" href={rd.invite} target="_blank" rel="noopener noreferrer">Join the server</a>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
