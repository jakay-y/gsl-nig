import { LoaderScene } from "./LoaderScene";

/**
 * The loading screen, a little over five seconds: the gladiator film plays
 * on black, dissolves on the glint in his helmet, the name settles into
 * place and the screen lifts away. The timing is pure CSS (theme-v2.css), so
 * it cannot get stuck: if the film is slow or blocked, the name still plays.
 * A script in the layout turns it off for the rest of the visit once it has
 * played, and for reduced motion.
 */
export function Loader() {
  return (
    <div className="loader" aria-hidden="true">
      <LoaderScene />
      <div className="loader__lockup">
        <p className="loader__logo">Gladiator Systems</p>
        <p className="loader__tag">Security doors, fire doors and smart locks. Abuja, since 2012.</p>
      </div>
    </div>
  );
}
