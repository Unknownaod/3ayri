"use client";
import { useEffect } from "react";

// Pointer glow, card spotlight, hero tilt and scroll reveals. Renders nothing.
export default function Effects() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("fx");

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

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const move = (e) => {
      if (calm) return;
      const card = e.target.closest?.(".spot");
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
      root.style.setProperty("--cx", `${e.clientX}px`);
      root.style.setProperty("--cy", `${e.clientY}px`);
      root.style.setProperty("--ry", (e.clientX / window.innerWidth - 0.5).toFixed(3));
      root.style.setProperty("--rx", (e.clientY / window.innerHeight - 0.5).toFixed(3));
    };
    window.addEventListener("pointermove", move, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("pointermove", move);
      root.classList.remove("fx");
    };
  }, []);

  return null;
}
