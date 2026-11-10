/**
 * Pulls the product catalogue from the live WordPress site's public REST API
 * and writes src/content/catalogue.json. Run with `npm run catalogue`.
 * fetch-images.mjs then copies the images into public/products/.
 */
import { writeFile } from "node:fs/promises";

const BASE = "https://www.gsl-nig.com/wp-json/wp/v2";
const UA = { "user-agent": "Mozilla/5.0 (gsl-redesign catalogue sync)" };

const get = async (path) => {
  const r = await fetch(BASE + path, { headers: UA });
  if (!r.ok) throw new Error(`${r.status} ${path}`);
  return { json: await r.json(), pages: Number(r.headers.get("x-wp-totalpages") || 1) };
};
const getAll = async (path) => {
  const sep = path.includes("?") ? "&" : "?";
  const first = await get(`${path}${sep}per_page=100&page=1`);
  const out = [...first.json];
  for (let p = 2; p <= first.pages; p++) out.push(...(await get(`${path}${sep}per_page=100&page=${p}`)).json);
  return out;
};

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', nbsp: " ", "#8211": "–", "#8217": "’", "#8216": "‘", "#8220": "“", "#8221": "”", "#8243": "″", "#038": "&", "#215": "×", "#8482": "™" };
const decode = (s) =>
  s.replace(/&(#?\w+);/g, (m, k) => ENT[k] ?? (k[0] === "#" ? String.fromCodePoint(Number(k.slice(1))) : m));
const text = (html) => decode(html.replace(/<br\s*\/?>/g, " ").replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();

const cleanName = (n) =>
  n.replace(/^Model\s*[–-]\s*/i, "").replace(/\s+/g, " ").trim();

function parse(excerpt) {
  const [descHtml, techHtml = ""] = excerpt.split(/<div class="technical-info">/);
  const summary = text(descHtml);
  const specs = [];
  for (const m of techHtml.matchAll(/<(li|p)[^>]*>([\s\S]*?)<\/\1>/g)) {
    const line = text(m[2]).replace(/^[•\-\s]+/, "");
    if (!line) continue;
    const i = line.indexOf(":");
    if (i > 2 && i < 46) {
      const value = line.slice(i + 1).replace(/^[\s:]+/, "");
      specs.push({ label: line.slice(0, i).trim(), text: value });
    } else if (specs.length && (!specs.at(-1).text || /^(Available|Door closer|Door coordinator|Panic|Maximum)/.test(line))) {
      specs.at(-1).text += (specs.at(-1).text ? "; " : "") + line.replace(/\.$/, "");
    } else specs.push({ label: "", text: line });
  }
  return { summary, specs: specs.filter((s) => s.text) };
}

// The product_cat taxonomy is not exposed over REST, so category membership
// is read from the public category listing pages.
const CATS = [
  ["entrance-doors", "Entrance doors"],
  ["high-security-doors", "High security doors"],
  ["fire-doors", "Fire doors"],
  ["interior-doors", "Interior doors"],
  ["commercial-doors", "Commercial doors"],
  ["smart-locks", "Smart locks and door bells"],
  ["door-awnings-canopies", "Awnings and canopies"],
  ["accessories", "Accessories"],
];
const catOf = new Map();
for (const [slug] of CATS) {
  for (let page = 1; page < 12; page++) {
    const r = await fetch(`https://www.gsl-nig.com/product-category/${slug}/page/${page}/`, { headers: UA });
    if (!r.ok) break;
    const html = await r.text();
    const found = [...html.matchAll(/<li[^>]*class="[^"]*type-product[^"]*"[\s\S]*?href="https?:\/\/[^"]*\/product\/([^"\/]+)\//g)].map((m) => m[1]);
    if (!found.length) break;
    for (const f of found) if (!catOf.has(f)) catOf.set(f, slug);
  }
}
const cats = CATS.map(([slug, name]) => ({ slug, name }));
const seen = new Map();
for (const p of await getAll("/product?_embed=wp:featuredmedia")) {
  const category = catOf.get(p.slug);
  const media = p._embedded?.["wp:featuredmedia"]?.[0];
  if (!category || !media?.source_url) continue;
  const raw = text(p.title.rendered);
  const { summary, specs } = parse(p.excerpt.rendered);
  const all = (raw + " " + summary + " " + specs.map((s) => s.text).join(" ")).toLowerCase();
  const rating = category === "fire-doors" ? Number(raw.match(/(\d+)\s*mins?/i)?.[1] || 0) : 0;
  seen.set(p.slug, {
    slug: p.slug,
    name: cleanName(raw),
    category,
    ...pickImage(media),
    summary,
    specs,
    fireRating: rating || undefined,
    gladiator: /gladiator/.test(all) || undefined,
  });
}

// A few originals are 3000px+ PNGs. Prefer WordPress's uncropped resize
// closest to 1100px wide so no page pulls a multi-megabyte image.
function pickImage(media) {
  const d = media.media_details || {};
  const full = { image: media.source_url, w: d.width || 400, h: d.height || 600 };
  if (full.w <= 1100) return full;
  const ratio = full.w / full.h;
  const best = Object.values(d.sizes || {})
    .filter((s) => s.source_url && s.width <= 1100 && Math.abs(s.width / s.height - ratio) < 0.03)
    .sort((a, b) => b.width - a.width)[0];
  return best ? { image: best.source_url, w: best.width, h: best.height } : full;
}

const out = {
  syncedFrom: "https://www.gsl-nig.com",
  categories: cats.map((c) => ({ slug: c.slug, name: c.name, count: [...seen.values()].filter((p) => p.category === c.slug).length })).filter((c) => c.count),
  products: [...seen.values()],
};
await writeFile(new URL("../src/content/catalogue.json", import.meta.url), JSON.stringify(out, null, 1));
console.log(out.categories.map((c) => `${c.name}: ${c.count}`).join("\n"), "\nTotal", out.products.length);
const noSpec = out.products.filter((p) => !p.specs.length).length, noSum = out.products.filter((p) => !p.summary).length;
console.log({ noSpec, noSum, shapes: Object.entries(Object.groupBy(out.products, (p) => `${p.w}x${p.h}`)).map(([k, v]) => `${k}:${v.length}`).join(" ") });
