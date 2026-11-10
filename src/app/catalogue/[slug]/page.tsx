import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bay } from "@/components/Door";
import { ShortlistButton } from "@/components/Shortlist";
import { categoryName, getProduct, isDoor, products, site } from "@/lib/catalogue";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => products.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return {};
  return { title: product.name, description: product.summary.slice(0, 160) };
}

export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();

  const range = categoryName(product.category);
  const related = products.filter((p) => p.category === product.category && p.slug !== product.slug);
  const at = products.filter((p) => p.category === product.category).indexOf(product);
  // Neighbours in catalogue order, so "related" walks the range rather than repeating its first four.
  const more = [...related.slice(at), ...related.slice(0, at)].slice(0, 4);

  return (
    <div className="wrap">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/catalogue">Catalogue</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/catalogue?range=${product.category}`}>{range}</Link>
      </nav>

      <article className="product">
        <div className="product__stage">
          <Bay
            src={product.image}
            w={product.w}
            h={product.h}
            alt={isDoor(product) ? `${product.name}, front elevation` : product.name}
            size="feature"
            eager
          />
        </div>

        <div className="stack">
          <h1 className="title product__title">{product.name}</h1>
          {(product.fireRating || product.gladiator) && (
            <ul className="tags">
              {product.fireRating && <li className="tag tag--ember">{product.fireRating} minutes fire rated</li>}
              {product.gladiator && <li className="tag">Gladiator lock available</li>}
            </ul>
          )}
          {product.summary && <p className="lede">{product.summary}</p>}

          <div className="row" style={{ marginTop: 32 }}>
            <Link href="/quote" className="btn btn--primary">Request a quote</Link>
            <ShortlistButton slug={product.slug} />
          </div>

          <section aria-labelledby="spec" style={{ marginTop: 64 }}>
            <h2 id="spec" className="subheading" style={{ marginBottom: 16 }}>Technical specification</h2>
            {product.specs.length ? (
              <dl className="spec">
                {product.specs.map((s, i) => (
                  <div key={i}>
                    <dt>{s.label || "Note"}</dt>
                    <dd>{s.text}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <div className="note">
                <p>No technical sheet is published for this model yet.</p>
                <p className="muted" style={{ marginTop: 8 }}>
                  Add it to your quote list and we will send dimensions and options with the price, or look it
                  up in the{" "}
                  <a className="link" href={site.pdfs[1].href} target="_blank" rel="noopener">technical catalogue (PDF)</a>.
                </p>
              </div>
            )}
          </section>
        </div>
      </article>

      {more.length > 0 && (
        <section className="section--tight" aria-labelledby="more" style={{ borderTop: "1px solid var(--rule)" }}>
          <div className="results-head" style={{ paddingTop: 0 }}>
            <h2 id="more" className="heading">More {range.toLowerCase()}</h2>
            <Link href={`/catalogue?range=${product.category}`} className="text-btn">See all {related.length + 1}</Link>
          </div>
          <ul className="grid">
            {more.map((p) => (
              <li key={p.slug}>
                <Link href={`/catalogue/${p.slug}`} className="card">
                  <Bay src={p.image} w={p.w} h={p.h} alt="" />
                  <p className="card__name">{p.name}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
