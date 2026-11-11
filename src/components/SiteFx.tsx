"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Counts a figure up to its final value, e.g. 0 to 107. Years start close by. */
function countUp(node: HTMLElement) {
  const end = Number(node.textContent);
  if (!Number.isFinite(end) || node.dataset.counted) return;
  node.dataset.counted = "1";
  const from = end > 1000 ? end - 40 : 0;
  const started = performance.now();
  const step = (now: number) => {
    const u = Math.min(1, (now - started) / 1400);
    node.textContent = String(Math.round(from + (end - from) * (1 - Math.pow(1 - u, 3))));
    if (u < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/**
 * Site-wide motion: eased scrolling, the fade-up of anything marked
 * `data-reveal`, figures marked `data-count` that count up when revealed,
 * and a header that steps aside while scrolling down. All of it is skipped
 * for visitors who ask for reduced motion. Renders nothing.
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

    // Hide the header on the way down, bring it back on the way up.
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 6) return;
      document.documentElement.classList.toggle("nav-hidden", y > last && y > 240);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      window.removeEventListener("scroll", onScroll);
      document.documentElement.classList.remove("nav-hidden");
    };
  }, []);

  // Re-scan after each navigation, since pages bring their own elements.
  useEffect(() => {
    document.documentElement.classList.remove("nav-hidden");
    const nodes = document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)");
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.classList.add("is-in"));
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          if (!reduce) entry.target.querySelectorAll<HTMLElement>("[data-count]").forEach(countUp);
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
