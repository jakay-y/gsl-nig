import Link from "next/link";
import { Bay } from "@/components/Door";
import { LockDrawing } from "@/components/LockDrawing";
import { categories, getProduct, products, site } from "@/lib/catalogue";

// The doors that stand in the hero elevation, chosen for contrast of finish.
const ELEVATION = [
  "model-amelia", "model-nara", "mixmatch-laccatto-black", "model-neve-zedek", "mixmatch-model-a",
  "90-mins-fire-rated-door-model-fw90", "model-firenze", "mixmatch-laccatto-white", "model-canterbury",
  "model-cleopatra", "model-kyoto", "model-oxford", "model-andromeda", "model-bologna",
];

const RATINGS = [
  { minutes: 30, line: "Model FW30." },
  { minutes: 45, line: "Model FWB." },
  { minutes: 90, line: "Model FW90, tested to EN 1634, and the 414 entry series in six designs." },
];

export default function Home() {
  const picked = ELEVATION.map(getProduct).filter((p) => p !== undefined);
  const fill = products.filter((p) => p.category === "entrance-doors" && p.w === 400 && !picked.includes(p));
  const elevation = [...picked, ...fill].slice(0, 14);
  const gladiator = getProduct("the-gladiator-system");

  return (
    <>
      <section className="hero">
        <div className="wrap hero__grid">
          <div className="hero__copy">
            <h1 className="display">
              <span className="rise"><span>Doors built</span></span>{" "}
              <span className="rise"><span>to stay shut.</span></span>
            </h1>
            <div className="hero__foot">
              <p className="lede">
                Gladiator Systems supplies and installs steel security doors, fire-rated doors and smart locks
                from its showroom in Abuja.
              </p>
              <div className="row">
                <Link href="/quote" className="btn btn--primary">Request a quote</Link>
                <Link href="/catalogue" className="btn btn--quiet">Browse {products.length} products</Link>
              </div>
            </div>
          </div>
          <LockDrawing />
        </div>

        <div className="elevation" role="region" aria-label="A selection of entrance doors" tabIndex={0}>
          <div className="elevation__row">
            {elevation.map((p, i) => (
              <Link key={p.slug} href={`/catalogue/${p.slug}`} className="elevation__door">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt="" width={p.w} height={p.h} loading={i < 6 ? "eager" : "lazy"} decoding="async" />
                <span>{p.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="wrap">
          <dl className="facts">
            <div><dt>Registered</dt><dd>2012, Nigeria</dd></div>
            <div><dt>Showroom</dt><dd>Wuse II, Abuja</dd></div>
            <div><dt>Catalogue</dt><dd>{products.length} products in {categories.length} ranges</dd></div>
            <div><dt>Open</dt><dd>{site.hours}</dd></div>
          </dl>
        </div>
      </section>

      <section className="section" aria-labelledby="ranges">
        <div className="wrap">
          <div className="split">
            <h2 id="ranges" className="heading">Eight ranges, one supplier from survey to fitting.</h2>
            <p className="lede muted">
              Start with the opening you need to close. Every range below is held in the catalogue with its
              technical sheet where one is published.
            </p>
          </div>
          <ul className="ranges">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/catalogue?range=${c.slug}`}>
                  <span className="ranges__name">{c.name}</span>
                  <span className="ranges__blurb">{c.blurb}</span>
                  <span className="ranges__count">{c.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {gladiator && (
        <section className="section feature" aria-labelledby="gladiator">
          <div className="wrap feature__grid">
            <Link href={`/catalogue/${gladiator.slug}`} aria-label="The Gladiator System">
              <Bay src={gladiator.image} w={gladiator.w} h={gladiator.h} alt="Steel door leaf seen from the hinge side, showing the Gladiator hook bolts" size="feature" />
            </Link>
            <div className="stack">
              <h2 id="gladiator" className="title">Three hooks into the jamb.</h2>
              <p className="lede">
                The Gladiator is a patented RB locking mechanism. When the key turns, three hook-shaped bolts
                swing into the frame alongside the door&rsquo;s other bolts, so the leaf cannot be levered out.
              </p>
              <dl className="spec">
                <div><dt>Lock</dt><dd>4-way, model RB507 or RB606</dd></div>
                <div><dt>Front bolts</dt><dd>Four, 10 mm and 18 mm</dd></div>
                <div><dt>Upper and rear bolts</dt><dd>13 mm</dd></div>
                <div><dt>Hinge side</dt><dd>Two fixed hook bolts tie the leaf to the frame</dd></div>
                <div><dt>Cylinder</dt><dd>Protected against picking, drilling and forcing</dd></div>
              </dl>
              <div className="row">
                <Link href={`/catalogue/${gladiator.slug}`} className="btn btn--quiet">Read the full specification</Link>
                <Link href="/catalogue?gladiator=1" className="text-btn">Doors that take the Gladiator lock</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="fire">
        <div className="wrap">
          <div className="split">
            <h2 id="fire" className="heading">Fire doors are chosen by the minutes they hold.</h2>
            <p className="lede muted">
              The FW90 leaf is two sheets of galvanised steel filled with rock wool and fire-resistant gypsum,
              edged with an intumescent gasket. Pick the rating your drawings call for.
            </p>
          </div>
          <div className="ratings">
            {RATINGS.map((r) => (
              <Link key={r.minutes} href={`/catalogue?range=fire-doors&rating=${r.minutes}`}>
                <p className="ratings__figure">{r.minutes}</p>
                <p className="ratings__unit">minutes</p>
                <p className="muted">{r.line}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section feature" aria-labelledby="process">
        <div className="wrap split">
          <div className="stack">
            <h2 id="process" className="heading">How an order runs.</h2>
            <p className="muted prose">
              Entrance doors are produced to the size of your opening, so the work starts with a measurement
              rather than a stock list.
            </p>
          </div>
          <ol className="steps">
            <li>
              <h3>Tell us about the opening</h3>
              <p>The quote request asks what the building is, how many doors, and whether a frame is already in place.</p>
            </li>
            <li>
              <h3>Choose model, finish and lock</h3>
              <p>See the doors at the Wuse II showroom or in the catalogue, then settle handles, cylinder and any lock upgrade.</p>
            </li>
            <li>
              <h3>Frame to suit the wall</h3>
              <p>A steel construction frame is cast into a new wall. A cover frame fits over an existing jamb.</p>
            </li>
            <li>
              <h3>Supply and installation</h3>
              <p>We import, warehouse and install, so the door that was quoted is the door that is fitted.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="pdfs">
        <div className="wrap split">
          <div className="stack">
            <h2 id="pdfs" className="heading">Catalogues for your drawings.</h2>
            <p className="muted prose">Full dimensions, sections and finish charts, as PDF.</p>
          </div>
          <ul className="pdfs">
            {site.pdfs.map((pdf) => (
              <li key={pdf.href}>
                <a href={pdf.href} target="_blank" rel="noopener">
                  {pdf.name} <span>PDF, opens in a new tab</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section closing" aria-labelledby="closing">
        <div className="wrap closing__grid">
          <h2 id="closing" className="title">Tell us about the opening.</h2>
          <div className="stack">
            <p className="lede">
              Four short questions. We reply with models, lead time and a price for supply and fitting.
            </p>
            <div className="row">
              <Link href="/quote" className="btn btn--primary">Request a quote</Link>
              <a href={site.phones[1].href} className="text-btn">or call {site.phones[1].label}</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
