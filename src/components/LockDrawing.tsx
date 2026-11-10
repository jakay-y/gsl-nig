"use client";

import { useEffect, useState } from "react";

/**
 * The hero: a door drawn as an architect's elevation, with the lock's bolts
 * shown in bolt blue. They throw into the frame once on load, and the visitor
 * can unlock and lock the door again. Figures come from the Gladiator
 * technical sheet: four front bolts, upper and rear bolts, three hook bolts.
 * Drawn in SVG so it stays sharp at any size.
 */

const FRONT = [300, 318, 336, 354];
const HOOKS = [190, 236, 452];
const LABELS = [
  { top: 26, name: "Upper and rear bolts", detail: "13 mm" },
  { top: 194, name: "Three hook bolts", detail: "Swing into the jamb" },
  { top: 333, name: "Four front bolts", detail: "10 mm and 18 mm" },
];

export function LockDrawing() {
  const [locked, setLocked] = useState(false);

  // Throw the bolts once the headline has landed.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = window.setTimeout(() => setLocked(true), reduce ? 0 : 750);
    return () => window.clearTimeout(id);
  }, []);

  const delay = (i: number) => ({ transitionDelay: `${i * 45}ms` });

  return (
    <figure className="lock" data-locked={locked}>
      <div className="lock__sheet">
        <svg viewBox="0 0 520 660" role="img" aria-label="Elevation of a steel door showing nine bolts locking into the frame">
          <g fill="none" stroke="var(--ink)" strokeWidth="1.5" vectorEffect="non-scaling-stroke">
            {/* Frame, leaf and floor */}
            <rect x="60" y="40" width="250" height="560" fill="var(--bg)" />
            <rect x="76" y="56" width="218" height="544" fill="var(--surface)" />
            <path d="M20 600H500" />
            {/* Leaf grooves */}
            <path d="M76 150H294M76 260H294M76 430H294M76 520H294" stroke="var(--rule)" />
            {/* Lock case inside the leaf, handle and cylinder */}
            <rect x="272" y="296" width="18" height="74" stroke="var(--muted)" strokeDasharray="3 3" />
            <rect x="258" y="270" width="7" height="124" rx="1" fill="var(--bg)" />
            <circle cx="262" cy="414" r="6" fill="var(--bg)" />
            {/* Leaders to the labels */}
            <path d="M254 40V26H332M312 194H332M312 333H332" stroke="var(--muted)" strokeWidth="1" />
            {/* Opening dimension */}
            <path d="M60 628H310M60 622V634M310 622V634" stroke="var(--muted)" strokeWidth="1" />
          </g>

          {/* Hinges and the two fixed hooks on the hinge side */}
          <g fill="var(--ink)">
            <rect x="71" y="118" width="8" height="26" />
            <rect x="71" y="318" width="8" height="26" />
            <rect x="71" y="518" width="8" height="26" />
            <path d="M64 204h14v7h-9v6h-5zM64 444h14v7h-9v6h-5z" />
            <circle cx="332" cy="26" r="2.5" /><circle cx="332" cy="194" r="2.5" /><circle cx="332" cy="333" r="2.5" />
          </g>

          {/* Moving bolts */}
          <rect className="bolt bolt--up" x="249" y="40" width="10" height="22" style={delay(0)} />
          {HOOKS.map((y, i) => (
            <path key={y} className="bolt bolt--out" d={`M288 ${y}h22v17h-7v-8h-15z`} style={delay(1 + i)} />
          ))}
          {FRONT.map((y, i) => (
            <rect key={y} className="bolt bolt--out" x="288" y={y} width="22" height="9" style={delay(4 + i)} />
          ))}
          <rect className="bolt bolt--back" x="60" y="325" width="22" height="9" style={delay(8)} />
        </svg>

        {LABELS.map((l) => (
          <p key={l.name} className="lock__label" style={{ top: `${(l.top / 660) * 100}%` }}>
            <span>{l.name}</span>
            <span className="muted">{l.detail}</span>
          </p>
        ))}
        <p className="lock__dimension muted">Produced to the size of your opening</p>
      </div>

      <figcaption className="lock__bar">
        <p aria-live="polite">
          <span className="status__dot" data-open={locked} aria-hidden="true" />
          {locked ? "Locked. Nine bolts in the frame." : "Unlocked. Bolts withdrawn."}
        </p>
        <button type="button" className="btn btn--quiet btn--small" onClick={() => setLocked((v) => !v)}>
          {locked ? "Unlock the door" : "Lock the door"}
        </button>
      </figcaption>
    </figure>
  );
}
