"use client";

import { useEffect, useRef } from "react";

/**
 * The film in the loading screen: a 4.1 second clip of the gladiator
 * (public/loader.mp4, with public/loader.jpg as its first frame).
 * The clip is only fetched when the loader is actually going to play, and
 * the moment it starts is handed to the CSS timeline as --t0 so the rest of
 * the sequence stays in step with it.
 */
export function LoaderScene() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (document.documentElement.dataset.loader === "off") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onPlaying = () => {
      // Late start: push the timeline back by the same amount, at most 2.5 s.
      document.documentElement.style.setProperty("--t0", `${Math.round(Math.min(2500, performance.now()))}ms`);
      video.classList.add("is-ready");
    };
    video.addEventListener("playing", onPlaying, { once: true });
    video.src = "/loader.mp4";
    // Autoplay can be refused (e.g. data saver). The poster frame and the
    // name still play, so the refusal is safe to ignore.
    video.play().catch(() => video.classList.add("is-ready"));

    return () => video.removeEventListener("playing", onPlaying);
  }, []);

  return (
    <video
      ref={ref}
      className="loader__video"
      poster="/loader.jpg"
      width={736}
      height={400}
      muted
      playsInline
      preload="none"
      disablePictureInPicture
    />
  );
}
