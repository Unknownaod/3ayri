"use client";

import { useEffect } from "react";

/*
Tiny pointer effects shared by every page. Renders nothing.

1. Any element with the class "spot" gets --mx / --my set to the
   cursor position inside it, which the CSS uses for the glowing
   spotlight and border light.
2. --px / --py (-1 to 1) are set on <html> and drive the slow
   parallax on the hero banner.

Skipped on touch screens and for people who prefer reduced motion.
*/

export default function Effects() {
  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (coarse || reduced) {
      return undefined;
    }

    const root = document.documentElement;

    let frame = 0;

    function onMove(event) {
      const { clientX, clientY, target } = event;

      cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        root.style.setProperty("--px", ((clientX / window.innerWidth) * 2 - 1).toFixed(3));
        root.style.setProperty("--py", ((clientY / window.innerHeight) * 2 - 1).toFixed(3));

        const spot = target instanceof Element ? target.closest(".spot") : null;

        if (spot) {
          const rect = spot.getBoundingClientRect();

          spot.style.setProperty("--mx", `${clientX - rect.left}px`);
          spot.style.setProperty("--my", `${clientY - rect.top}px`);
        }
      });
    }

    document.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onMove);
    };
  }, []);

  return null;
}
