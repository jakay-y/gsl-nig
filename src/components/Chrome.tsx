"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ShortlistCount } from "./Shortlist";

const LINKS = [
  { href: "/catalogue", label: "Catalogue", note: "All 8 ranges" },
  { href: "/catalogue?range=entrance-doors", label: "Entrance doors", note: "Decorative steel" },
  { href: "/catalogue?range=high-security-doors", label: "High security", note: "Forced entry, blast, ballistic" },
  { href: "/catalogue?range=fire-doors", label: "Fire doors", note: "30, 45 and 90 minutes" },
];

function toggleTheme() {
  const root = document.documentElement;
  const current =
    root.dataset.theme ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  try {
    window.localStorage.setItem("gsl-theme", next);
  } catch {
    // Storage refused: the choice still holds until the tab closes.
  }
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className="header">
        <div className="wrap header__bar">
          <Link href="/" className="wordmark" aria-label="Gladiator Systems, home">
            Gladiator Systems
          </Link>
          <nav className="nav" aria-label="Main">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={l.href === "/catalogue" && pathname.startsWith("/catalogue") ? "page" : undefined}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="header__end">
            <button type="button" className="icon-btn" onClick={toggleTheme} aria-label="Switch between light and dark">
              <span className="theme-glyph" aria-hidden="true" />
            </button>
            <Link href="/quote" className="btn btn--primary btn--small header__quote">
              Request a quote <ShortlistCount />
            </Link>
            <button
              type="button"
              className="menu-btn"
              aria-expanded={open}
              aria-controls="menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </header>
      <div id="menu" className="menu" data-open={open} inert={!open}>
        <nav className="menu__links" aria-label="Menu">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label} <span>{l.note}</span>
            </Link>
          ))}
        </nav>
        <Link href="/quote" className="btn btn--primary" onClick={() => setOpen(false)}>
          Request a quote <ShortlistCount />
        </Link>
      </div>
    </>
  );
}

/**
 * Whether the showroom is open right now. Hours are Monday to Friday,
 * 8am to 5pm in Abuja (UTC+1, no daylight saving). Rendered after mount
 * because the answer depends on the moment of the visit, not of the build.
 */
export function ShowroomStatus() {
  const [state, setState] = useState<{ open: boolean; text: string } | null>(null);

  useEffect(() => {
    const check = () => {
      const abuja = new Date(Date.now() + 60 * 60 * 1000);
      const day = abuja.getUTCDay();
      const hour = abuja.getUTCHours();
      const weekday = day >= 1 && day <= 5;
      const open = weekday && hour >= 8 && hour < 17;
      let text = "Closed now. Opens Monday at 8am.";
      if (open) text = "Open now, until 5pm.";
      else if (weekday && hour < 8) text = "Closed now. Opens today at 8am.";
      else if (day === 0 || (day >= 1 && day <= 4)) text = "Closed now. Opens tomorrow at 8am.";
      setState({ open, text });
    };
    check();
    const id = window.setInterval(check, 60_000);
    return () => window.clearInterval(id);
  }, []);

  if (!state) return null;
  return (
    <span className="status">
      <span className="status__dot" data-open={state.open} aria-hidden="true" />
      {state.text}
    </span>
  );
}
