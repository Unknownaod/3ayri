"use client";
import { useEffect, useRef } from "react";

const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const rnd = (a, b) => a + Math.random() * (b - a);

// ───────────── background particles ─────────────
const KATA = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ01234789";

function spawn(kind, w, h, first, sz, sp) {
  const x = rnd(0, w), y = first ? rnd(0, h) : null;
  switch (kind) {
    case "snow":      return { x, y: y ?? -10, r: rnd(1, 3) * sz, v: rnd(0.4, 1.2) * sp, ph: rnd(0, 6) };
    case "stars":     return { x, y: y ?? rnd(0, h), r: rnd(0.5, 1.8) * sz, ph: rnd(0, 6), tw: rnd(0.01, 0.04) * sp };
    case "embers":    return { x, y: y ?? h + 10, r: rnd(1, 3.2) * sz, v: rnd(0.4, 1.4) * sp, ph: rnd(0, 6) };
    case "rain":      return { x, y: y ?? -20, len: rnd(10, 22) * sz, v: rnd(8, 14) * sp, dx: -1.6 };
    case "bubbles":   return { x, y: y ?? h + 20, r: rnd(3, 12) * sz, v: rnd(0.3, 1) * sp, ph: rnd(0, 6) };
    case "fireflies": return { x, y: y ?? rnd(0, h), r: rnd(1.5, 3) * sz, vx: rnd(-0.3, 0.3) * sp, vy: rnd(-0.3, 0.3) * sp, ph: rnd(0, 6) };
    case "petals":    return { x, y: y ?? -12, w: rnd(5, 9) * sz, v: rnd(0.5, 1.4) * sp, rot: rnd(0, 6), vr: rnd(-0.03, 0.03), ph: rnd(0, 6) };
    case "confetti":  return { x, y: y ?? -12, w: rnd(5, 9) * sz, v: rnd(1, 2.4) * sp, rot: rnd(0, 6), vr: rnd(-0.12, 0.12), c: `hsl(${rnd(0, 360)} 90% 62%)`, ph: rnd(0, 6) };
    case "hearts":    return { x, y: y ?? h + 14, s: rnd(6, 14) * sz, v: rnd(0.4, 1.2) * sp, ph: rnd(0, 6) };
    default:          return { x, y: y ?? 0 };
  }
}

function heart(c, x, y, s) {
  c.beginPath();
  c.moveTo(x, y + s * 0.35);
  c.bezierCurveTo(x - s, y - s * 0.4, x - s * 0.4, y - s, x, y - s * 0.3);
  c.bezierCurveTo(x + s * 0.4, y - s, x + s, y - s * 0.4, x, y + s * 0.35);
  c.fill();
}

export function Particles({ kind, count, speed, size, color }) {
  const ref = useRef(null);
  useEffect(() => {
    if (kind === "none" || reduced()) return;
    const cv = ref.current, c = cv.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const sp = speed / 100, sz = size / 100;
    let w = 0, h = 0, raf, t = 0, ps = [], cols = [];
    const fs = 15 * sz;

    const fit = () => {
      w = cv.offsetWidth; h = cv.offsetHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (kind === "matrix") cols = Array.from({ length: Math.ceil(w / fs) }, (_, i) => ({ head: rnd(-30, 0), v: rnd(0.12, 0.4) * sp, tail: Math.floor(rnd(8, 18)), on: Math.random() < Math.min(1, count / 120) }));
      else ps = Array.from({ length: count }, () => spawn(kind, w, h, true, sz, sp));
    };
    fit();

    const tick = () => {
      t++;
      c.clearRect(0, 0, w, h);
      c.fillStyle = color; c.strokeStyle = color;
      if (kind === "matrix") {
        c.font = `${fs}px ui-monospace, monospace`;
        cols.forEach((col, i) => {
          col.head += col.v;
          if (col.head - col.tail > h / fs) { col.head = rnd(-20, 0); col.on = Math.random() < Math.min(1, count / 120); }
          if (!col.on) return;
          for (let k = 0; k < col.tail; k++) {
            const row = Math.floor(col.head) - k;
            if (row < 0) continue;
            c.globalAlpha = (1 - k / col.tail) * (k === 0 ? 1 : 0.65);
            c.fillStyle = k === 0 ? "#fff" : color;
            c.fillText(KATA[(i * 31 + row * 17 + (t >> 5) * (row % 3)) % KATA.length], i * fs, row * fs);
          }
        });
        c.globalAlpha = 1;
      } else {
        for (let i = 0; i < ps.length; i++) {
          const p = ps[i];
          switch (kind) {
            case "snow": p.y += p.v; p.ph += 0.02; p.x += Math.sin(p.ph) * 0.4; c.globalAlpha = 0.85; c.fillStyle = "#fff"; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); c.fill(); if (p.y > h + 6) ps[i] = spawn(kind, w, h, false, sz, sp); break;
            case "stars": p.ph += p.tw; c.globalAlpha = 0.25 + 0.75 * Math.abs(Math.sin(p.ph)); c.fillStyle = "#fff"; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); c.fill(); break;
            case "embers": p.y -= p.v; p.ph += 0.03; p.x += Math.sin(p.ph) * 0.5; c.globalAlpha = Math.max(0, Math.min(1, p.y / h + 0.2)) * 0.9; c.shadowBlur = 8; c.shadowColor = color; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); c.fill(); c.shadowBlur = 0; if (p.y < -8) ps[i] = spawn(kind, w, h, false, sz, sp); break;
            case "rain": p.y += p.v; p.x += p.dx; c.globalAlpha = 0.45; c.strokeStyle = "#cfe6ff"; c.lineWidth = 1; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x + p.dx * 1.6, p.y - p.len); c.stroke(); if (p.y > h + 24) ps[i] = spawn(kind, w, h, false, sz, sp); break;
            case "bubbles": p.y -= p.v; p.ph += 0.02; p.x += Math.sin(p.ph) * 0.35; c.globalAlpha = 0.5; c.strokeStyle = color; c.lineWidth = 1.2; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); c.stroke(); c.globalAlpha = 0.18; c.fill(); if (p.y < -p.r * 2) ps[i] = spawn(kind, w, h, false, sz, sp); break;
            case "fireflies": p.ph += 0.035; p.x += p.vx + Math.sin(p.ph * 0.7) * 0.25; p.y += p.vy + Math.cos(p.ph * 0.6) * 0.25; if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10; if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10; c.globalAlpha = 0.2 + 0.8 * Math.abs(Math.sin(p.ph)); c.shadowBlur = 14; c.shadowColor = color; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); c.fill(); c.shadowBlur = 0; break;
            case "petals": p.y += p.v; p.ph += 0.02; p.x += Math.sin(p.ph) * 0.8; p.rot += p.vr; c.globalAlpha = 0.85; c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.beginPath(); c.ellipse(0, 0, p.w, p.w * 0.5, 0, 0, 7); c.fill(); c.restore(); if (p.y > h + 12) ps[i] = spawn(kind, w, h, false, sz, sp); break;
            case "confetti": p.y += p.v; p.ph += 0.03; p.x += Math.sin(p.ph) * 0.6; p.rot += p.vr; c.globalAlpha = 0.9; c.fillStyle = p.c; c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillRect(-p.w / 2, -p.w / 4, p.w, p.w / 2); c.restore(); if (p.y > h + 12) ps[i] = spawn(kind, w, h, false, sz, sp); break;
            case "hearts": p.y -= p.v; p.ph += 0.025; p.x += Math.sin(p.ph) * 0.5; c.globalAlpha = Math.max(0, Math.min(0.85, p.y / h + 0.15)); heart(c, p.x, p.y, p.s); if (p.y < -16) ps[i] = spawn(kind, w, h, false, sz, sp); break;
          }
        }
        c.globalAlpha = 1;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    const ro = new ResizeObserver(fit);
    ro.observe(cv);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [kind, count, speed, size, color]);
  return kind === "none" ? null : <canvas ref={ref} className="pc-fx" aria-hidden="true" />;
}

// ───────────── custom cursor + cursor trail ─────────────
export function CursorFX({ stage, kind, trail, color }) {
  const cur = useRef(null), cv = useRef(null);
  useEffect(() => {
    const el = stage.current;
    if (!el || (kind === "default" && trail === "none")) return;
    if (!matchMedia("(pointer: fine)").matches || reduced()) return;
    if (kind !== "default") el.dataset.cur = kind;

    const c = cv.current?.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf, tx = -100, ty = -100, cx = -100, cy = -100, lx = -999, ly = -999, hue = 0, hot = false;
    const parts = [];
    const fit = () => { if (!cv.current) return; w = el.clientWidth; h = el.clientHeight; cv.current.width = w * dpr; cv.current.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(el);

    const move = (e) => {
      const r = el.getBoundingClientRect();
      tx = e.clientX - r.left; ty = e.clientY - r.top;
      hot = !!e.target.closest?.("a,button,input,[role=button]");
      if (Math.hypot(tx - lx, ty - ly) > (trail === "glow" ? 10 : 14) && trail !== "none") {
        lx = tx; ly = ty; hue = (hue + 12) % 360;
        parts.push({ x: tx, y: ty, vx: rnd(-0.5, 0.5), vy: rnd(-0.5, 0.8), life: 1, s: rnd(3, 7), hue });
        if (parts.length > 90) parts.shift();
      }
    };
    const leave = () => { tx = ty = -100; };
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);

    const tick = () => {
      cx += (tx - cx) * (kind === "ring" ? 0.2 : 1);
      cy += (ty - cy) * (kind === "ring" ? 0.2 : 1);
      if (cur.current) {
        cur.current.style.transform = `translate(${cx}px,${cy}px)`;
        cur.current.classList.toggle("hot", hot);
      }
      if (c) {
        c.clearRect(0, 0, w, h);
        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i];
          p.life -= trail === "glow" ? 0.03 : 0.025; p.x += p.vx; p.y += p.vy + (trail === "sparkle" ? 0.2 : 0);
          if (p.life <= 0) { parts.splice(i, 1); continue; }
          c.globalAlpha = p.life;
          if (trail === "sparkle") {
            c.strokeStyle = i % 2 ? "#fff" : color; c.lineWidth = 1.4; const s = p.s * p.life;
            c.beginPath(); c.moveTo(p.x - s, p.y); c.lineTo(p.x + s, p.y); c.moveTo(p.x, p.y - s); c.lineTo(p.x, p.y + s); c.stroke();
          } else if (trail === "dots") {
            c.fillStyle = color; c.beginPath(); c.arc(p.x, p.y, p.s * 0.5 * p.life, 0, 7); c.fill();
          } else if (trail === "glow") {
            const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, 22 * p.life);
            g.addColorStop(0, color); g.addColorStop(1, "transparent"); c.globalAlpha = p.life * 0.4; c.fillStyle = g;
            c.beginPath(); c.arc(p.x, p.y, 22 * p.life, 0, 7); c.fill();
          } else if (trail === "rainbow") {
            c.fillStyle = `hsl(${p.hue} 95% 62%)`; c.beginPath(); c.arc(p.x, p.y, p.s * 0.6 * p.life, 0, 7); c.fill();
          }
        }
        c.globalAlpha = 1;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); el.removeEventListener("mousemove", move); el.removeEventListener("mouseleave", leave); delete el.dataset.cur; };
  }, [stage, kind, trail, color]);

  return (
    <>
      {trail !== "none" && <canvas ref={cv} className="pc-trail" aria-hidden="true" />}
      {kind !== "default" && <div ref={cur} className={`pc-cur cur-${kind}`} style={{ "--cc": color }} aria-hidden="true"><i /></div>}
    </>
  );
}
