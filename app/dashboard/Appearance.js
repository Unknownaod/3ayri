"use client";
import { FONTS } from "@/lib/schema";
import { DASH_PRESETS, dashColors } from "@/lib/dashtheme";
import { FontPicker } from "./panels";

const LABELS = { bg: "Background", panel: "Panels & sidebar", text: "Text", accent: "Accent (buttons, highlights)" };

// "Appearance" tab: recolour your own dashboard. Saved with your page, only you see it.
export function AppearanceTab({ me, set }) {
  const t = me.dashTheme || {}, c = dashColors(t);
  const put = (o) => set("dashTheme", { ...t, ...o, preset: undefined });
  const pick = (name) => set("dashTheme", { ...DASH_PRESETS[name], ...(t.font ? { font: t.font } : {}), ...(t.compact ? { compact: true } : {}), preset: name });
  const active = t.preset || (Object.keys(t).some((k) => ["bg", "panel", "text", "accent"].includes(k)) ? "" : "Gold");
  return (
    <div className="stack">
      <div className="fld"><span>Theme</span>
        <div className="dt-grid">
          {Object.entries(DASH_PRESETS).map(([n, p]) => (
            <button type="button" key={n} className={`dt-sw ${active === n ? "on" : ""}`} aria-pressed={active === n} onClick={() => pick(n)} style={{ background: p.bg, color: p.text, borderColor: active === n ? p.accent : "transparent" }}>
              <i style={{ background: p.panel }}><s style={{ background: p.accent }} /><s style={{ background: p.text, opacity: 0.35 }} /></i>{n}
            </button>
          ))}
        </div>
      </div>
      <h3 className="sec-h">Custom colors</h3>
      {Object.keys(LABELS).map((k) => (
        <div className="fld" key={k}><span>{LABELS[k]}</span>
          <div className="colrow">
            <input type="color" value={c[k]} onChange={(e) => put({ [k]: e.target.value })} aria-label={LABELS[k]} />
            <input value={c[k]} maxLength={7} onChange={(e) => /^#[0-9a-f]{6}$/i.test(e.target.value) && put({ [k]: e.target.value })} aria-label={`${LABELS[k]} hex`} />
          </div>
        </div>
      ))}
      <h3 className="sec-h">Style</h3>
      <div className="fld"><span>Font</span><FontPicker value={t.font || "figtree"} onChange={(f) => put({ font: f })} opts={Object.keys(FONTS)} /></div>
      <label className="chk"><input type="checkbox" checked={!!t.compact} onChange={(e) => put({ compact: e.target.checked || undefined })} />Compact spacing</label>
      <div className="fld"><button type="button" className="hp-ghost" disabled={!Object.keys(t).length} onClick={() => set("dashTheme", {})}>Reset to default</button>
        <small className="hint">This only changes your dashboard. Your public page keeps its own design. Press Save to keep it on every device.</small></div>
    </div>
  );
}
