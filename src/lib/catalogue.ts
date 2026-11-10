import data from "@/content/catalogue.json";

export type Spec = { label: string; text: string };
export type Product = {
  slug: string;
  name: string;
  category: string;
  image: string;
  w: number;
  h: number;
  summary: string;
  specs: Spec[];
  fireRating?: number;
  gladiator?: boolean;
};
/** The fields the catalogue grid needs; keeps spec text out of the client bundle. */
export type ProductCard = Pick<Product, "slug" | "name" | "category" | "image" | "w" | "h" | "fireRating" | "gladiator"> & {
  search: string;
};

const KEEP_CAPS = new Set(["RB", "IDS", "LED", "FWB", "UL", "BT", "DV", "PVC"]);

/** The source catalogue mixes SHOUTED and normal names; settle on one voice. */
function tidyName(name: string) {
  return name
    .split(" ")
    .map((word) => {
      if (/\d/.test(word) || word.length === 1 || KEEP_CAPS.has(word)) return word;
      if (word === word.toUpperCase() && /[A-Z]/.test(word)) {
        return word
          .toLowerCase()
          .replace(/(^|[&-])([a-z])/g, (_, lead: string, ch: string) => lead + ch.toUpperCase());
      }
      return word;
    })
    .join(" ")
    .replace(/^New (Sundoor)/, "$1")
    .replace(/\bSerial\b/, "Series");
}

function tidySummary(summary: string) {
  return summary
    .replace(/^general description\s*/i, "")
    .split(/Technical specification/i)[0]
    .trim();
}

// The source API returns newest first; the catalogue reads range by range.
const ORDER = data.categories.map((c) => c.slug);

export const products: Product[] = (data.products as Product[])
  .map((p) => ({ ...p, name: tidyName(p.name), summary: tidySummary(p.summary) }))
  .sort((a, b) => ORDER.indexOf(a.category) - ORDER.indexOf(b.category));

const BLURBS: Record<string, string> = {
  "entrance-doors": "Decorative steel doors with multi-bolt locking, produced to the size of your opening.",
  "high-security-doors": "Forced-entry, blast and ballistic resistant doors, and the Gladiator hook-bolt system.",
  "fire-doors": "Steel doors rated to hold back fire for 30, 45 or 90 minutes.",
  "interior-doors": "Wood-finish and water-resistant interior door series.",
  "commercial-doors": "Storeroom, industrial and Sundoor models for working buildings.",
  "smart-locks": "Ultraloq locks that open by fingerprint, code, phone or key.",
  "door-awnings-canopies": "Canopy series that keep rain and sun off an entrance.",
  accessories: "Handles and lock upgrades for doors already chosen.",
};

export const categories = data.categories.map((c) => ({ ...c, blurb: BLURBS[c.slug] ?? "" }));
export const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const cards: ProductCard[] = products.map((p) => ({
  slug: p.slug,
  name: p.name,
  category: p.category,
  image: p.image,
  w: p.w,
  h: p.h,
  fireRating: p.fireRating,
  gladiator: p.gladiator,
  search: `${p.name} ${categoryName(p.category)} ${p.summary}`.toLowerCase(),
}));

/** Doors read as tall leaves standing on a floor; handles and locks are objects. */
export const isDoor = (p: { w: number; h: number }) => p.h / p.w > 1.25;

export const site = {
  name: "Gladiator Systems",
  legalName: "Gladiator Systems Limited",
  address: ["No 11, Thaba Tseka Crescent", "Wuse II, Abuja"],
  phones: [
    { label: "09 291 7524", href: "tel:+23492917524" },
    { label: "0803 311 6131", href: "tel:+2348033116131" },
  ],
  email: "sales@gsl-nig.com",
  hours: "Monday to Friday, 8am to 5pm",
  pdfs: [
    { name: "Decorative security door catalogue", href: "https://www.gsl-nig.com/wp-content/uploads/2014/08/GSL-Decorative-Security-Door-Catalog.pdf" },
    { name: "Technical catalogue", href: "https://www.gsl-nig.com/wp-content/uploads/2019/08/GSL-TECHNICAL-CATALOG.pdf" },
    { name: "Wooden interior doors, 2019", href: "https://www.gsl-nig.com/wp-content/uploads/2014/08/GSL-wooden-interior-doors-2019.pdf" },
    { name: "eLock biometric lock catalogue", href: "https://www.gsl-nig.com/wp-content/uploads/2014/08/elock-biometric-lock.pdf" },
  ],
};
