"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Site-wide motion: eased scrolling and the fade-up of anything marked
 * `data-reveal` as it enters the viewport. Both are skipped for visitors
 * who ask for reduced motion. Renders nothing.
 */
export function SiteFx() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.11, anchors: true });
    let raf = requestAnimationFrame(function tick(time) {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    });
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  // Re-scan after each navigation, since pages bring their own elements.
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)");
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
