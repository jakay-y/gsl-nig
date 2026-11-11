/**
 * The loading screen, about six seconds: black, then the gladiator film;
 * as he finishes his turn and stops, the film eases to one side and the
 * name enters beside him; then the screen lifts away.
 *
 * It opens on the film and nothing else. There is no still frame and no
 * progress before the clip is moving: every animation in theme-v2.css is
 * held until the script below sees the video actually playing and sets
 * data-film="go" on <html>. From then on it is one CSS timeline.
 *
 * The video tag is written as raw HTML because React leaves out the `muted`
 * attribute when rendering on the server, and browsers refuse to autoplay a
 * video that is not muted. Raw HTML also lets the clip start downloading
 * before any JavaScript has loaded.
 *
 * The script sets data-film="skip" (the screen lifts at once) when the
 * loader has already played this visit, for reduced motion, if the clip
 * errors, or if it has not started within 3.5 seconds.
 */
const video = `<video class="loader__video" src="/loader.mp4" width="736" height="400" autoplay muted playsinline preload="auto" disablepictureinpicture></video>`;

const gate = `(function(){var d=document.documentElement,v=document.querySelector(".loader__video");if(!v)return;function skip(){if(!d.dataset.film)d.dataset.film="skip"}if(d.dataset.loader==="off"||matchMedia("(prefers-reduced-motion: reduce)").matches){d.dataset.film="skip";v.removeAttribute("src");v.load();return}v.addEventListener("playing",function(){if(!d.dataset.film)d.dataset.film="go"},{once:true});v.addEventListener("error",skip);setTimeout(skip,3500)})()`;

export function Loader() {
  return (
    <div className="loader" aria-hidden="true">
      <div className="loader__film" dangerouslySetInnerHTML={{ __html: video }} />
      <p className="loader__logo">Gladiator Systems</p>
      <script dangerouslySetInnerHTML={{ __html: gate }} />
    </div>
  );
}
