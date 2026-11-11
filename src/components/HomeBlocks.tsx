"use client";

import Link from "next/link";
import { useState } from "react";
import { Bay } from "./Door";

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
