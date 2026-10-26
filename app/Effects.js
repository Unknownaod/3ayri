"use client";
import { useEffect, useRef } from "react";

// Pointer glow, card spotlight, hero tilt, scroll reveals, scroll progress,
// magnetic buttons and a drifting ember/star canvas. Renders the canvas + bar.
export default function Effects() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("fx");

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---- scroll reveals ---- */
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    /* ---- pointer effects ---- */
    const move = (e) => {
      if (calm) return;
      const card = e.target.closest?.(".spot");
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
      const mag = e.target.closest?.("[data-magnetic]");
      document.querySelectorAll("[data-magnetic]").forEach((el) => {
        if (el !== mag) el.style.transform = "";
      });
      if (mag) {
        const r = mag.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.18;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.28;
        mag.style.transform = `translate(${dx.toFixed(1)}px, ${(dy - 3).toFixed(1)}px)`;
      }
      root.style.setProperty("--cx", `${e.clientX}px`);
      root.style.setProperty("--cy", `${e.clientY}px`);
      root.style.setProperty("--ry", (e.clientX / window.innerWidth - 0.5).toFixed(3));
      root.style.setProperty("--rx", (e.clientY / window.innerHeight - 0.5).toFixed(3));
    };
    window.addEventListener("pointermove", move, { passive: true });

    /* ---- scroll progress ---- */
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      root.style.setProperty("--prog", max > 0 ? (window.scrollY / max).toFixed(4) : "0");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    /* ---- ember / star canvas ---- */
    const canvas = canvasRef.current;
    let raf = 0;
    let onResize = () => {};
    if (canvas && !calm) {
      const ctx = canvas.getContext("2d");
      let w = 0, h = 0;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const hues = ["167,139,250", "139,60,255", "232,228,255", "192,132,252"];
      let parts = [];

      const spawn = (fresh) => ({
        x: Math.random() * w,
        y: fresh ? Math.random() * h : h + 10,
        r: Math.random() * 1.6 + 0.4,
        vy: Math.random() * 0.35 + 0.08,
        vx: (Math.random() - 0.5) * 0.18,
        a: Math.random() * 0.6 + 0.2,
        t: Math.random() * Math.PI * 2,
        c: hues[(Math.random() * hues.length) | 0],
      });

      onResize = () => {
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = Math.round(Math.min(90, (w * h) / 16000));
        parts = Array.from({ length: count }, () => spawn(true));
      };
      onResize();
      window.addEventListener("resize", onResize);

      const tick = () => {
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          p.y -= p.vy;
          p.x += p.vx + Math.sin(p.t) * 0.12;
          p.t += 0.015;
          if (p.y < -10) parts[i] = spawn(false);
          const tw = 0.6 + Math.sin(p.t * 2) * 0.4;
          ctx.beginPath();
          ctx.fillStyle = `rgba(${p.c},${(p.a * tw).toFixed(3)})`;
          ctx.shadowColor = `rgba(${p.c},0.9)`;
          ctx.shadowBlur = 10;
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        raf = requestAnimationFrame(tick);
      };
      tick();
    }

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      root.classList.remove("fx");
    };
  }, []);

  return (
    <>
      <div className="progress" aria-hidden="true" />
      <canvas ref={canvasRef} className="fx-canvas" aria-hidden="true" />
    </>
  );
}
