import type { Metadata } from "next";
import { QuoteFlow } from "@/components/QuoteFlow";
import { categories, products, site } from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "Request a quote",
  description: "Four short questions about your opening. Gladiator Systems replies with models, lead time and a price for supply and fitting.",
};

export default function QuotePage() {
  return (
    <div className="wrap quote">
      <QuoteFlow
        ranges={categories.map(({ slug, name }) => ({ slug, name }))}
        items={products.map(({ slug, name, image, w, h }) => ({ slug, name, image, w, h }))}
        email={site.email}
        phone={site.phones[1]}
      />
      <aside className="quote__aside" aria-label="Other ways to reach us">
        <h2 className="subheading">Prefer to talk it through?</h2>
        <dl className="spec" style={{ marginTop: 16 }}>
          <div>
            <dt>Call</dt>
            <dd>{site.phones.map((p) => <a key={p.href} className="link" href={p.href} style={{ display: "block" }}>{p.label}</a>)}</dd>
          </div>
          <div>
            <dt>Visit</dt>
            <dd>{site.address.join(", ")}</dd>
          </div>
          <div>
            <dt>Open</dt>
            <dd>{site.hours}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
