import Link from "next/link";
import { Bay } from "@/components/Door";
import { DoorScene } from "@/components/DoorScene";
import { Hotspots, ModelSwitcher, Rail } from "@/components/HomeBlocks";
import { categories, getProduct, products, site } from "@/lib/catalogue";

// Entrance doors offered in the switcher, chosen for contrast of finish.
const MODELS = ["model-amelia", "model-nara", "mixmatch-laccatto-black", "mixmatch-laccatto-white", "mixmatch-model-a", "model-kyoto"];

const PERKS = [
  { title: "Galvanised steel", text: "1.25 mm steel panels with vertical and horizontal reinforcement built into the leaf.", icon: "M5 5h14v14H5zM5 12h14M12 5v14" },
  { title: "Seven bolts, four directions", text: "A multi-bolt lock throws into the frame on every side.", icon: "M4 12h6m4 0h6M12 4v6m0 4v6M9 9h6v6H9z" },
  { title: "Made to your opening", text: "Entrance doors are produced to the size you give us.", icon: "M4 7h16M4 4v6M20 4v6M7 20V13M4 20h6M4 13h6" },
  { title: "Supplied and fitted", text: "We import, warehouse and install the doors ourselves.", icon: "M4 19l6-6m0 0l3 3 7-9M10 13L7 10" },
];

// Positions are percentages of the Amelia image.
const SPOTS = [
  { x: 37, y: 47, title: "Handle and hardware", text: "Hardened cylinder guards and a broad choice of handles to select from." },
  { x: 36, y: 62, title: "Lock", text: "A multi-bolt lock of seven bolts, directed four ways. It can be upgraded to the Gladiator system." },
  { x: 16, y: 9, title: "Frame", text: "A steel construction frame cast into the wall, or a PVC-coated cover frame fitted over an existing jamb." },
  { x: 66, y: 30, title: "Finish", text: "African walnut on galvanised steel. Keep it out of direct sunlight and away from standing water." },
];

const STATS = [
  { figure: "90", label: "minutes of fire rating", text: "Model FW90, tested to EN 1634. 30 and 45 minute doors are in the range too." },
  { figure: "9", label: "bolts in a Gladiator door", text: "Four front bolts, three hooks, one upper and one rear." },
  { figure: String(products.length), label: "products in the catalogue", text: "Across eight ranges, from entrance doors to handles." },
  { figure: "2012", label: "registered in Nigeria", text: "Formerly WhiteShields Nig Ltd." },
];

export default function Home() {
  const models = MODELS.map(getProduct)
    .filter((p) => p !== undefined)
    .map(({ slug, name, image, w, h, summary }) => ({ slug, name, image, w, h, summary }));
  const amelia = getProduct("model-amelia");

  return (
    <>
      <DoorScene>
        <h1 className="display">Doors built<br />to stay shut.</h1>
        <p className="lede">
          Steel security doors, fire doors and smart locks. Made to the size of your opening and fitted by
          our own installers.
        </p>
        <div className="row">
          <Link href="/quote" className="btn btn--primary">Request a quote</Link>
          <Link href="/catalogue" className="btn btn--quiet">Check inventory</Link>
        </div>
      </DoorScene>

      {amelia && (
        <section className="section" aria-labelledby="why">
          <div className="why">
            <Link href={`/catalogue/${amelia.slug}`} aria-label={amelia.name} data-reveal>
              <Bay src={amelia.image} w={amelia.w} h={amelia.h} alt={`${amelia.name} entrance door`} size="feature" />
            </Link>
            <div data-reveal style={{ "--d": "120ms" } as React.CSSProperties}>
              <h2 id="why" className="title">Why it holds.</h2>
              <div className="perks">
                {PERKS.map((perk, i) => (
                  <div className="perk" key={perk.title} data-reveal style={{ "--d": `${200 + i * 90}ms` } as React.CSSProperties}>
                    <span className="perk__ico" aria-hidden="true">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d={perk.icon} />
                      </svg>
                    </span>
                    <h3>{perk.title}</h3>
                    <p>{perk.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="models" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <h2 id="models" className="title" data-reveal>
            Forty-two entrance doors.<br /><span className="tone">One way of building them.</span>
          </h2>
          <div data-reveal style={{ "--d": "100ms" } as React.CSSProperties}>
            <ModelSwitcher models={models} />
          </div>
        </div>
      </section>

      {amelia && (
        <section className="section" aria-labelledby="parts" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="split" data-reveal>
              <p className="label muted">What you are looking at</p>
              <h2 id="parts" className="heading">Four parts decide how a door performs. Touch a point to read about it.</h2>
            </div>
            <div style={{ marginTop: 48 }} data-reveal>
              <Hotspots image={amelia.image} w={amelia.w} h={amelia.h} alt={`${amelia.name} with four marked parts`} spots={SPOTS} />
            </div>
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="numbers" style={{ paddingTop: 0 }}>
        <div className="wrap split">
          <div className="stack" data-reveal>
            <h2 id="numbers" className="title">Numbers<br /><span className="tone">you can check.</span></h2>
            <a className="btn btn--quiet" href={site.pdfs[1].href} target="_blank" rel="noopener">Open the technical catalogue</a>
          </div>
          <div className="stats">
            {STATS.map((s, i) => (
              <div className="panel stat" key={s.label} data-reveal style={{ "--d": `${i * 70}ms` } as React.CSSProperties}>
                <div><b data-count>{s.figure}</b><span>{s.label}</span></div>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="ranges" style={{ paddingTop: 0 }}>
        <Rail
          label="ranges"
          title={<h2 id="ranges" className="title">Eight ranges.<br /><span className="tone">One supplier, from survey to fitting.</span></h2>}
        >
          {categories.map((c) => {
            const first = products.find((p) => p.category === c.slug && p.slug !== "the-gladiator-system");
            return (
              <li key={c.slug} data-reveal>
                <Link href={`/catalogue?range=${c.slug}`} className="rail__card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {first && <img src={first.image} alt="" width={first.w} height={first.h} loading="lazy" decoding="async" />}
                  <h3>{c.name}</h3>
                  <p>{c.count} {c.count === 1 ? "product" : "products"}</p>
                </Link>
              </li>
            );
          })}
        </Rail>
      </section>

      <section className="section feature" aria-labelledby="process">
        <div className="wrap split">
          <div className="stack" data-reveal>
            <h2 id="process" className="title">How an order runs.</h2>
            <p className="muted prose">
              Entrance doors are produced to the size of your opening, so the work starts with a measurement
              rather than a stock list.
            </p>
          </div>
          <ol className="steps" data-reveal>
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
          <div className="stack" data-reveal>
            <h2 id="pdfs" className="title">Catalogues<br /><span className="tone">for your drawings.</span></h2>
            <p className="muted prose">Full dimensions, sections and finish charts, as PDF.</p>
          </div>
          <ul className="pdfs" data-reveal>
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
    </>
  );
}
