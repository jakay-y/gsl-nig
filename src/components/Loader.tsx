/**
 * The loading screen: a gladiator at rest against a door, then the mark.
 * It is pure CSS (see theme-v2.css), so it plays without waiting for
 * JavaScript and cannot get stuck. A script in the layout turns it off for
 * the rest of the visit once it has played, and for reduced motion.
 *
 * The figure is a placeholder pictogram drawn in code. Replace the contents
 * of `.loader__scene` with the commissioned illustration when there is one.
 */

/** Crested helmet, also used as the mark beside the name. */
function Helmet() {
  return (
    <>
      <path d="M118 104C122 62 176 52 192 96l-10 4c-10-28-46-22-52 6z" />
      <circle cx="158" cy="118" r="27" />
      <path d="M130 118l-20 13 22 6z" />
      <rect x="138" y="128" width="30" height="24" rx="7" />
    </>
  );
}

export function Loader() {
  return (
    <div className="loader" aria-hidden="true">
      <svg className="loader__scene" viewBox="0 0 360 460" fill="currentColor">
        {/* Door and ground */}
        <g fill="none" stroke="currentColor" strokeWidth="3">
          <rect x="200" y="30" width="132" height="400" />
          <path d="M214 130h104M214 230h104M214 330h104" opacity="0.35" />
          <path d="M20 430h322" />
        </g>
        <rect x="302" y="212" width="6" height="52" rx="2" />
        {/* Spear and shield, set down */}
        <path d="M100 58l8-34 8 34-5 6v366h-6V64z" />
        <ellipse cx="88" cy="352" rx="34" ry="76" />
        <ellipse cx="88" cy="352" rx="24" ry="62" fill="none" stroke="var(--loader-bg)" strokeWidth="3" />
        <circle cx="88" cy="352" r="9" fill="var(--loader-bg)" />
        {/* The gladiator, back against the door, one foot up */}
        <Helmet />
        <path d="M138 152l52-2 8 112-48 4z" />
        <ellipse cx="146" cy="166" rx="19" ry="15" />
        <rect x="126" y="198" width="66" height="21" rx="10" transform="rotate(-8 159 208)" />
        <path d="M146 262l54-4 4 42-64 4z" />
        <path d="M146 300h24l-10 118h-18z" />
        <path d="M118 430l4-12h40v12z" />
        <path d="M176 298l26-2-30 66-22-10z" />
        <path d="M152 350l22 12 26 42-14 8z" />
        <rect x="186" y="394" width="14" height="32" rx="3" />
      </svg>
      <p className="loader__logo">
        <svg viewBox="104 52 96 104" fill="currentColor"><Helmet /></svg>
        Gladiator Systems
      </p>
    </div>
  );
}
