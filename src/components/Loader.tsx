import { LOADER_POSTER } from "./loaderPoster";

/**
 * The loading screen, about six seconds: the gladiator film plays on black,
 * and as he finishes his turn and stops, the film eases to one side and the
 * name enters beside him. Then the screen lifts away.
 *
 * Built to be on screen at once:
 * - The video tag is written as raw HTML, because React leaves out the
 *   `muted` attribute when rendering on the server and browsers refuse to
 *   autoplay a video that is not muted. Raw HTML lets the clip start
 *   downloading and playing before any JavaScript has loaded.
 * - Its first frame is embedded in the page as the poster, so the gladiator
 *   is visible before the clip itself arrives.
 * - The whole sequence is CSS (theme-v2.css), so it cannot get stuck.
 *
 * The small script below does two things: on a visit where the loader has
 * already played (or for reduced motion) it cancels the video download, and
 * otherwise it tells the CSS timeline when the clip actually started
 * (--t0), so a slow connection delays the sequence instead of cutting it.
 */
const video = `<video class="loader__video" src="/loader.mp4" poster="${LOADER_POSTER}" width="736" height="400" autoplay muted playsinline preload="auto" disablepictureinpicture></video>`;

const sync = `(function(){var d=document.documentElement,v=document.querySelector(".loader__video");if(!v)return;if(d.dataset.loader==="off"||matchMedia("(prefers-reduced-motion: reduce)").matches){v.removeAttribute("src");v.load();return}v.addEventListener("playing",function(){d.style.setProperty("--t0",Math.round(Math.min(2500,performance.now()))+"ms")},{once:true})})()`;

export function Loader() {
  return (
    <div className="loader" aria-hidden="true">
      <div className="loader__film" dangerouslySetInnerHTML={{ __html: video }} />
      <p className="loader__logo">Gladiator Systems</p>
      <script dangerouslySetInnerHTML={{ __html: sync }} />
    </div>
  );
}
