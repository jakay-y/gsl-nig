"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bay } from "./Door";
import { useShortlist } from "./Shortlist";

type Item = { slug: string; name: string; image: string; w: number; h: number };
type Answers = {
  ranges: string[];
  building: string;
  doors: string;
  town: string;
  frame: string;
  install: string;
  notes: string;
  name: string;
  phone: string;
  email: string;
};
type Errors = Partial<Record<keyof Answers, string>>;

const BUILDINGS = ["A house", "An apartment block or estate", "An office or commercial building", "A public or institutional building"];
const FRAMES = [
  { value: "New wall, no frame yet", hint: "A steel construction frame is cast into the wall." },
  { value: "An existing frame stays", hint: "A cover frame fits over the jamb that is there." },
  { value: "Not sure yet", hint: "We will check when we measure." },
];
const INSTALL = ["Supply and install", "Supply only"];
const STEPS = ["What do you need?", "What is the building?", "What is the opening like?", "Where do we reply?"];
const REVIEW = STEPS.length;
const DONE = REVIEW + 1;

const blank: Answers = { ranges: [], building: "", doors: "", town: "", frame: "", install: INSTALL[0], notes: "", name: "", phone: "", email: "" };

/**
 * The guided quote request. One question group per step, validated on
 * Continue, reviewed before sending. There is no server yet, so "send"
 * hands a finished draft to the visitor's email app (see docs/DESIGN.md).
 */
export function QuoteFlow({
  ranges,
  items,
  email,
  phone,
}: {
  ranges: { slug: string; name: string }[];
  items: Item[];
  email: string;
  phone: { label: string; href: string };
}) {
  const { slugs, toggle, clear } = useShortlist();
  const picked = slugs.map((s) => items.find((i) => i.slug === s)).filter((i): i is Item => !!i);

  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>(blank);
  const [errors, setErrors] = useState<Errors>({});
  const [copied, setCopied] = useState(false);
  const stepRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

  // Move focus to the new step so keyboard and screen-reader users land on it.
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    stepRef.current?.focus();
    window.scrollTo({ top: 0 });
  }, [step]);

  const set = <K extends keyof Answers>(key: K, value: Answers[K]) => {
    setA((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (at: number): Errors => {
    const e: Errors = {};
    if (at === 0 && !picked.length && !a.ranges.length) e.ranges = "Choose at least one range, or add products from the catalogue.";
    if (at === 1) {
      if (!a.building) e.building = "Choose the closest match.";
      if (!a.town.trim()) e.town = "Enter the town or city so we can plan the visit.";
      if (a.doors && (!/^\d+$/.test(a.doors) || Number(a.doors) < 1)) e.doors = "Enter a whole number, or leave this empty.";
    }
    if (at === 2 && !a.frame) e.frame = "Choose one. “Not sure yet” is fine.";
    if (at === 3) {
      if (!a.name.trim()) e.name = "Enter your name.";
      if (!a.phone.trim() && !a.email.trim()) e.phone = "Enter a phone number or an email address.";
      if (a.email.trim() && !/^\S+@\S+\.\S+$/.test(a.email.trim())) e.email = "This email address looks incomplete.";
    }
    return e;
  };

  const next = () => {
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length) {
      // Send focus to the first field with a problem.
      requestAnimationFrame(() => stepRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"] input')?.focus());
      return;
    }
    setStep(step + 1);
  };

  const rangeNames = a.ranges.map((s) => ranges.find((r) => r.slug === s)?.name).filter(Boolean).join(", ");
  const body = [
    "Quote request from gsl-nig.com",
    "",
    picked.length ? `Products: ${picked.map((p) => p.name).join("; ")}` : null,
    rangeNames ? `Ranges: ${rangeNames}` : null,
    `Building: ${a.building}`,
    a.doors ? `Number of doors: ${a.doors}` : null,
    `Town or city: ${a.town.trim()}`,
    `Opening: ${a.frame}`,
    `Service: ${a.install}`,
    a.notes.trim() ? `Notes: ${a.notes.trim()}` : null,
    "",
    `Name: ${a.name.trim()}`,
    a.phone.trim() ? `Phone: ${a.phone.trim()}` : null,
    a.email.trim() ? `Email: ${a.email.trim()}` : null,
  ].filter((line) => line !== null).join("\n");
  const mailto = `mailto:${email}?subject=${encodeURIComponent(`Quote request, ${a.name.trim()}`)}&body=${encodeURIComponent(body)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const err = (key: keyof Answers) =>
    errors[key] ? <p className="error" id={`${key}-error`} role="alert">{errors[key]}</p> : null;

  if (step === DONE) {
    return (
      <div className="flow">
        <div className="flow__step" ref={stepRef} tabIndex={-1}>
          <h1 className="title flow__title">One more step: press send.</h1>
          <p className="lede" style={{ marginTop: 24 }}>
            Your request is written out as a draft to {email} in your email app. It reaches us once you send
            it from there.
          </p>
          <div className="row" style={{ marginTop: 32 }}>
            <a href={mailto} className="btn btn--primary">Open the draft again</a>
            <button type="button" className="btn btn--quiet" onClick={copy}>{copied ? "Copied" : "Copy the request text"}</button>
          </div>
          <p className="muted" style={{ marginTop: 32 }}>
            No email app on this device? Copy the text and send it any way you like, or call{" "}
            <a className="link" href={phone.href}>{phone.label}</a>.
          </p>
          <div className="row" style={{ marginTop: 48 }}>
            <Link href="/catalogue" className="text-btn">Back to the catalogue</Link>
            {picked.length > 0 && <button type="button" className="text-btn" onClick={clear}>Empty the quote list</button>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="flow" noValidate onSubmit={(e) => { e.preventDefault(); if (step < REVIEW) next(); }}>
      <div className="progress" aria-hidden={step === REVIEW}>
        <span>{step < REVIEW ? `Step ${step + 1} of ${STEPS.length}` : "Review"}</span>
        <span>Request a quote</span>
      </div>
      <div className="progress__bar" role="progressbar" aria-label="Progress" aria-valuemin={0} aria-valuemax={STEPS.length} aria-valuenow={Math.min(step, STEPS.length)}>
        <i style={{ transform: `scaleX(${(step + 1) / (STEPS.length + 1)})` }} />
      </div>

      <div className="flow__step" key={step} ref={stepRef} tabIndex={-1}>
        <h1 className="title flow__title">{step < REVIEW ? STEPS[step] : "Check it reads right."}</h1>

        {step === 0 && (
          <>
            {picked.length ? (
              <>
                <p className="lede" style={{ marginTop: 24 }}>These are on your quote list.</p>
                <ul className="picked">
                  {picked.map((p) => (
                    <li key={p.slug}>
                      <Bay src={p.image} w={p.w} h={p.h} alt="" />
                      <Link href={`/catalogue/${p.slug}`} className="link">{p.name}</Link>
                      <button type="button" className="text-btn" onClick={() => toggle(p.slug)}>Remove<span className="sr-only"> {p.name}</span></button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="note" style={{ marginTop: 32 }}>
                <p>Your quote list is empty, which is fine.</p>
                <p className="muted" style={{ marginTop: 8 }}>
                  Pick the ranges you are considering below, or{" "}
                  <Link className="link" href="/catalogue">browse the catalogue</Link> and add exact models first.
                </p>
              </div>
            )}
            <fieldset data-invalid={!!errors.ranges}>
              <legend>{picked.length ? "Anything else? Add a range." : "Which ranges?"}</legend>
              <div className="options options--two">
                {ranges.map((r) => (
                  <label className="option" key={r.slug}>
                    <input
                      type="checkbox"
                      checked={a.ranges.includes(r.slug)}
                      onChange={(e) => set("ranges", e.target.checked ? [...a.ranges, r.slug] : a.ranges.filter((s) => s !== r.slug))}
                    />
                    <span>{r.name}</span>
                  </label>
                ))}
              </div>
              {err("ranges")}
            </fieldset>
          </>
        )}

        {step === 1 && (
          <>
            <fieldset data-invalid={!!errors.building}>
              <legend>The doors are for</legend>
              <div className="options">
                {BUILDINGS.map((b) => (
                  <label className="option" key={b}>
                    <input type="radio" name="building" checked={a.building === b} onChange={() => set("building", b)} />
                    <span>{b}</span>
                  </label>
                ))}
              </div>
              {err("building")}
            </fieldset>
            <div className="fields-two">
              <label className="field">
                <span>Town or city</span>
                <input className="input" value={a.town} onChange={(e) => set("town", e.target.value)} autoComplete="address-level2" aria-invalid={!!errors.town} aria-describedby={errors.town ? "town-error" : undefined} />
                {err("town")}
              </label>
              <label className="field">
                <span>Number of doors <em>(optional)</em></span>
                <input className="input" inputMode="numeric" value={a.doors} onChange={(e) => set("doors", e.target.value)} aria-invalid={!!errors.doors} aria-describedby={errors.doors ? "doors-error" : undefined} />
                {err("doors")}
              </label>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <fieldset data-invalid={!!errors.frame}>
              <legend>The wall today</legend>
              <div className="options">
                {FRAMES.map((f) => (
                  <label className="option" key={f.value}>
                    <input type="radio" name="frame" checked={a.frame === f.value} onChange={() => set("frame", f.value)} />
                    <span><span style={{ display: "block", boxShadow: "none", padding: 0, minHeight: 0 }}>{f.value}<small>{f.hint}</small></span></span>
                  </label>
                ))}
              </div>
              {err("frame")}
            </fieldset>
            <fieldset>
              <legend>You need us to</legend>
              <div className="options options--two">
                {INSTALL.map((i) => (
                  <label className="option" key={i}>
                    <input type="radio" name="install" checked={a.install === i} onChange={() => set("install", i)} />
                    <span>{i}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="field" style={{ marginTop: 48 }}>
              <span>Anything we should know <em>(optional)</em></span>
              <textarea className="input" value={a.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Opening sizes, finish, deadline" />
            </label>
          </>
        )}

        {step === 3 && (
          <>
            <label className="field" style={{ marginTop: 48 }}>
              <span>Your name</span>
              <input className="input" value={a.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
              {err("name")}
            </label>
            <div className="fields-two">
              <label className="field">
                <span>Phone</span>
                <input className="input" type="tel" value={a.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "phone-error" : undefined} />
                {err("phone")}
              </label>
              <label className="field">
                <span>Email</span>
                <input className="input" type="email" value={a.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />
                {err("email")}
              </label>
            </div>
            <p className="small muted" style={{ marginTop: 16 }}>One of the two is enough. We use it only to answer this request.</p>
          </>
        )}

        {step === REVIEW && (
          <dl className="review">
            {[
              { label: "Products and ranges", value: [picked.map((p) => p.name).join(", "), rangeNames].filter(Boolean).join(" · "), at: 0 },
              { label: "Building", value: [a.building, a.town.trim(), a.doors && `${a.doors} doors`].filter(Boolean).join(", "), at: 1 },
              { label: "Opening", value: [a.frame, a.install, a.notes.trim()].filter(Boolean).join(". "), at: 2 },
              { label: "Reply to", value: [a.name.trim(), a.phone.trim(), a.email.trim()].filter(Boolean).join(", "), at: 3 },
            ].map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
                <dd><button type="button" className="text-btn" onClick={() => setStep(row.at)}>Change<span className="sr-only"> {row.label.toLowerCase()}</span></button></dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <div className="flow__actions">
        {step > 0 ? (
          <button type="button" className="text-btn" onClick={() => { setErrors({}); setStep(step - 1); }}>Back</button>
        ) : (
          <span />
        )}
        {step < REVIEW ? (
          <button type="submit" className="btn btn--primary">{step === REVIEW - 1 ? "Review request" : "Continue"}</button>
        ) : (
          <a href={mailto} className="btn btn--primary" onClick={() => setStep(DONE)}>Send by email</a>
        )}
      </div>
    </form>
  );
}
