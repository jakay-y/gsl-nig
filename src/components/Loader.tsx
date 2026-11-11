import { LoaderScene } from "./LoaderScene";

/**
 * The loading screen, about 4.8 seconds: a lit 3D still life of a
 * gladiator's kit resting against a steel door, then the mark pops in and
 * the screen lifts away. The timing is pure CSS (theme-v2.css), so it cannot
 * get stuck: if the 3D scene is slow or unavailable, the logo still plays.
 * A script in the layout turns it off for the rest of the visit once it has
 * played, and for reduced motion.
 *
 * To use rendered footage instead, replace <LoaderScene /> with a muted,
 * autoplaying <video className="loader__canvas is-ready">.
 */
export function Loader() {
  return (
    <div className="loader" aria-hidden="true">
      <LoaderScene />
      <p className="loader__logo">
        {/* Crested helmet mark */}
        <svg viewBox="104 52 96 104" fill="currentColor">
          <path d="M118 104C122 62 176 52 192 96l-10 4c-10-28-46-22-52 6z" />
          <circle cx="158" cy="118" r="27" />
          <path d="M130 118l-20 13 22 6z" />
          <rect x="138" y="128" width="30" height="24" rx="7" />
        </svg>
        Gladiator Systems
      </p>
    </div>
  );
}
