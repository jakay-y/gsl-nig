"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "gsl-shortlist";
const EVENT = "gsl-shortlist-change";
const EMPTY: string[] = [];
let cache: { raw: string | null; value: string[] } = { raw: null, value: EMPTY };

function read(): string[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return cache.value;
  }
  if (raw === cache.raw) return cache.value;
  let value: string[] = EMPTY;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) value = parsed.filter((x): x is string => typeof x === "string");
  } catch {
    value = EMPTY;
  }
  cache = { raw, value };
  return value;
}

function write(next: string[]) {
  const raw = JSON.stringify(next);
  cache = { raw, value: next };
  try {
    window.localStorage.setItem(KEY, raw);
  } catch {
    // Private windows can refuse storage; the list still works for this visit.
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** The visitor's shortlist of products to quote, kept in their browser. */
export function useShortlist() {
  const slugs = useSyncExternalStore(subscribe, read, () => EMPTY);
  const toggle = useCallback((slug: string) => {
    const current = read();
    write(current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug]);
  }, []);
  const clear = useCallback(() => write([]), []);
  return { slugs, toggle, clear };
}

export function ShortlistButton({ slug }: { slug: string }) {
  const { slugs, toggle } = useShortlist();
  const on = slugs.includes(slug);
  return (
    <button type="button" className="btn btn--quiet" aria-pressed={on} onClick={() => toggle(slug)}>
      <span className="tick" aria-hidden="true" data-on={on} />
      {on ? "On your quote list" : "Add to quote list"}
    </button>
  );
}

export function ShortlistCount() {
  const { slugs } = useShortlist();
  if (!slugs.length) return null;
  return (
    <span className="count" aria-label={`${slugs.length} on your quote list`}>
      {slugs.length}
    </span>
  );
}
