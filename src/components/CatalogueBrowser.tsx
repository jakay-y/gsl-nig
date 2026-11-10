"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import type { ProductCard } from "@/lib/catalogue";
import { Bay } from "./Door";

type Range = { slug: string; name: string; count: number };

/**
 * Search and filters for the catalogue. State lives in the URL
 * (?range=&rating=&gladiator=&q=&sort=) so any view can be shared or
 * linked to from elsewhere on the site. Secondary filters only appear
 * when they can change the result: ratings for fire doors, the Gladiator
 * option where some doors offer it.
 */
export function CatalogueBrowser({ cards, ranges }: { cards: ProductCard[]; ranges: Range[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const range = ranges.some((r) => r.slug === params.get("range")) ? params.get("range")! : "";
  const rating = Number(params.get("rating")) || 0;
  const gladiator = params.get("gladiator") === "1";
  const sort = params.get("sort") === "name" ? "name" : "range";

  // The search box is local state so typing stays instant; the URL follows.
  const [query, setQuery] = useState(params.get("q") ?? "");
  const deferredQuery = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);

  const setParams = useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(window.location.search);
      for (const [key, value] of Object.entries(changes)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  useEffect(() => {
    const id = window.setTimeout(() => {
      const current = new URLSearchParams(window.location.search).get("q") ?? "";
      if (current !== query.trim()) setParams({ q: query.trim() || null });
    }, 250);
    return () => window.clearTimeout(id);
  }, [query, setParams]);

  // "/" focuses search, as on any good listing page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const inRange = useMemo(() => (range ? cards.filter((c) => c.category === range) : cards), [cards, range]);
  // Ratings are only offered once the visitor is looking at fire doors.
  const ratings = useMemo(
    () =>
      range === "fire-doors"
        ? [...new Set(inRange.map((c) => c.fireRating).filter((n): n is number => !!n))].sort((a, b) => a - b)
        : [],
    [inRange, range],
  );
  const gladiatorCount = inRange.filter((c) => c.gladiator).length;
  const showGladiator = gladiatorCount > 0 && gladiatorCount < inRange.length;

  const results = useMemo(() => {
    const terms = deferredQuery.toLowerCase().split(/\s+/).filter(Boolean);
    const list = inRange.filter(
      (c) =>
        (!rating || !ratings.includes(rating) || c.fireRating === rating) &&
        (!gladiator || !showGladiator || c.gladiator) &&
        terms.every((t) => c.search.includes(t)),
    );
    return sort === "name" ? [...list].sort((a, b) => a.name.localeCompare(b.name)) : list;
  }, [inRange, deferredQuery, rating, ratings, gladiator, showGladiator, sort]);

  const rangeName = (slug: string) => ranges.find((r) => r.slug === slug)?.name ?? "";
  const filtered = !!(range || rating || gladiator || query.trim());
  const reset = () => {
    setQuery("");
    router.replace(pathname, { scroll: false });
  };
  const viewKey = `${range}|${rating}|${gladiator}|${sort}|${deferredQuery}`;

  return (
    <>
      <div className="filters">
        <div className="wrap">
          <div className="filters__top">
            <div className="search" role="search">
              <label className="sr-only" htmlFor="catalogue-search">Search the catalogue</label>
              <input
                id="catalogue-search"
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${cards.length} products`}
                autoComplete="off"
                enterKeyHint="search"
              />
              {query && (
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Clear search"
                  onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  </svg>
                </button>
              )}
            </div>
            <label>
              <span className="sr-only">Sort by</span>
              <select className="select" value={sort} onChange={(e) => setParams({ sort: e.target.value === "name" ? "name" : null })}>
                <option value="range">By range</option>
                <option value="name">Name, A to Z</option>
              </select>
            </label>
          </div>

          <div className="chips" role="radiogroup" aria-label="Range">
            <label className="chip">
              <input type="radio" name="range" checked={!range} onChange={() => setParams({ range: null, rating: null })} />
              <span>All <i>{cards.length}</i></span>
            </label>
            {ranges.map((r) => (
              <label className="chip" key={r.slug}>
                <input
                  type="radio"
                  name="range"
                  checked={range === r.slug}
                  onChange={() => setParams({ range: r.slug, rating: null })}
                />
                <span>{r.name} <i>{r.count}</i></span>
              </label>
            ))}
          </div>

          {(ratings.length > 1 || showGladiator) && (
            <div className="refine">
              {ratings.length > 1 && (
                <>
                  <span className="label muted" id="rating-label">Fire rating</span>
                  <div className="row" role="radiogroup" aria-labelledby="rating-label" style={{ gap: 8 }}>
                    <label className="chip">
                      <input type="radio" name="rating" checked={!rating} onChange={() => setParams({ rating: null })} />
                      <span>Any</span>
                    </label>
                    {ratings.map((n) => (
                      <label className="chip" key={n}>
                        <input type="radio" name="rating" checked={rating === n} onChange={() => setParams({ rating: String(n) })} />
                        <span>{n} minutes</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
              {showGladiator && (
                <label className="chip">
                  <input type="checkbox" checked={gladiator} onChange={(e) => setParams({ gladiator: e.target.checked ? "1" : null })} />
                  <span>Takes the Gladiator lock <i>{gladiatorCount}</i></span>
                </label>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="wrap" style={{ minHeight: "60vh", paddingBottom: "var(--s10)" }}>
        <div className="results-head">
          <p aria-live="polite">
            <strong>{results.length}</strong>{" "}
            <span className="muted">
              {results.length === 1 ? "product" : "products"}
              {range ? ` in ${rangeName(range).toLowerCase()}` : ""}
            </span>
          </p>
          {filtered && (
            <button type="button" className="text-btn" onClick={reset}>Clear filters</button>
          )}
        </div>

        {results.length ? (
          <ul className="grid grid--fresh" key={viewKey}>
            {results.map((c, i) => (
              <li key={c.slug}>
                <Link href={`/catalogue/${c.slug}`} className="card">
                  <Bay src={c.image} w={c.w} h={c.h} alt="" eager={i < 4} />
                  <p className="card__name">{c.name}</p>
                  <p className="card__meta">
                    {c.fireRating ? <b>{c.fireRating} minutes</b> : !range ? rangeName(c.category) : c.gladiator ? "Gladiator lock available" : rangeName(c.category)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty">
            <h2 className="heading">Nothing matches that.</h2>
            <p className="muted">
              {query.trim()
                ? `No product ${range ? `in ${rangeName(range).toLowerCase()} ` : ""}mentions “${query.trim()}”. Try a model name such as Amelia or FW90, or a word like walnut.`
                : "No product has that combination of filters."}
            </p>
            <div className="row" style={{ marginTop: 24 }}>
              {query.trim() && range && (
                <button type="button" className="btn btn--quiet" onClick={() => setParams({ range: null, rating: null, gladiator: null })}>
                  Search all ranges
                </button>
              )}
              <button type="button" className="btn btn--quiet" onClick={reset}>Clear filters</button>
              <Link href="/quote" className="text-btn">Ask us for it instead</Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
