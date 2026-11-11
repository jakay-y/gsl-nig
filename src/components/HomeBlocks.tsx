"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Bay } from "./Door";

/**
 * A horizontal row of cards with previous and next buttons beside its title.
 * The row still swipes and scrolls by hand; the buttons move it one card at
 * a time and switch off at either end.
 */
export function Rail({ title, label, children }: { title: ReactNode; label: string; children: ReactNode }) {
  const list = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const update = () =>
      setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const move = (dir: 1 | -1) => {
    const el = list.current;
    if (!el) return;
    const card = el.querySelector("li");
    const step = card ? card.getBoundingClientRect().width + 12 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step * (window.innerWidth > 900 ? 2 : 1), behavior: "smooth" });
  };

  const arrow = (d: string) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );

  return (
    <>
      <div className="wrap rail__head" data-reveal>
        {title}
        <div className="rail__nav">
          <button type="button" className="rail__btn" aria-label={`Previous ${label}`} disabled={edge.start} onClick={() => move(-1)}>
            {arrow("M19 12H5m6-6l-6 6 6 6")}
          </button>
          <button type="button" className="rail__btn" aria-label={`Next ${label}`} disabled={edge.end} onClick={() => move(1)}>
            {arrow("M5 12h14m-6-6l6 6-6 6")}
          </button>
        </div>
      </div>
      <ul className="rail" ref={list}>
        {children}
      </ul>
    </>
  );
}

type Model = { slug: string; name: string; image: string; w: number; h: number; summary: string };

/** Pick a model; the door and its description change in place. */
export function ModelSwitcher({ models }: { models: Model[] }) {
  const [at, setAt] = useState(0);
  const model = models[at];
  return (
    <div className="switcher">
      <div className="switcher__picks" role="radiogroup" aria-label="Entrance door model">
        {models.map((m, i) => (
          <label className="chip" key={m.slug}>
            <input type="radio" name="model" checked={i === at} onChange={() => setAt(i)} />
            <span>{m.name}</span>
          </label>
        ))}
      </div>
      <div className="switcher__stage">
        <div className="switcher__door" key={model.slug}>
          <Bay src={model.image} w={model.w} h={model.h} alt={`${model.name}, front elevation`} size="feature" />
        </div>
        <div className="panel switcher__info">
          <div key={model.slug} className="switcher__text">
            <h3 className="heading">{model.name}</h3>
            <p className="muted">{model.summary}</p>
          </div>
          <Link href={`/catalogue/${model.slug}`} className="btn btn--quiet">See the specification</Link>
        </div>
      </div>
    </div>
  );
}

type Spot = { x: number; y: number; title: string; text: string };

/** A door with marked points. Each opens a note about that part. */
export function Hotspots({ image, w, h, alt, spots }: { image: string; w: number; h: number; alt: string; spots: Spot[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="spots">
      <div className="spots__figure" style={{ aspectRatio: `${w} / ${h}` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={alt} width={w} height={h} loading="lazy" decoding="async" />
        {spots.map((s, i) => (
          <button
            key={s.title}
            type="button"
            className="spots__dot"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            aria-expanded={open === i}
            aria-controls="spot-note"
            aria-label={s.title}
            onClick={() => setOpen(open === i ? null : i)}
            onMouseEnter={() => setOpen(i)}
          />
        ))}
      </div>
      <div className="spots__note" id="spot-note" aria-live="polite">
        {open === null ? (
          <p className="muted">Choose a point on the door.</p>
        ) : (
          <div key={open} className="switcher__text">
            <h3 className="subheading">{spots[open].title}</h3>
            <p className="muted" style={{ marginTop: 8 }}>{spots[open].text}</p>
          </div>
        )}
      </div>
    </div>
  );
}
