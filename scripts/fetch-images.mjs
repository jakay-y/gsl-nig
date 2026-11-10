/**
 * Copies every product image from the live site into public/products/ and
 * repoints src/content/catalogue.json at the local files, so the new site no
 * longer depends on the old host. The original URL is kept in `source`.
 * Runs after scrape-catalogue.mjs as part of `npm run catalogue`.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { extname } from "node:path";

const file = new URL("../src/content/catalogue.json", import.meta.url);
const dir = new URL("../public/products/", import.meta.url);
const data = JSON.parse(await readFile(file, "utf8"));
await mkdir(dir, { recursive: true });

let bytes = 0;
const failed = [];
for (const p of data.products) {
  const remote = p.source ?? p.image;
  if (!/^https:\/\/www\.gsl-nig\.com\/wp-content\/uploads\//.test(remote)) continue;
  const ext = extname(new URL(remote).pathname).toLowerCase();
  if (![".png", ".jpg", ".jpeg", ".webp"].includes(ext)) { failed.push(`${p.slug}: unexpected type ${ext}`); continue; }
  try {
    const r = await fetch(remote, { headers: { "user-agent": "Mozilla/5.0 (gsl-redesign catalogue sync)" } });
    if (!r.ok || !r.headers.get("content-type")?.startsWith("image/")) throw new Error(`HTTP ${r.status}`);
    const buf = Buffer.from(await r.arrayBuffer());
    await writeFile(new URL(`${p.slug}${ext}`, dir), buf);
    bytes += buf.length;
    p.source = remote;
    p.image = `/products/${p.slug}${ext}`;
  } catch (e) {
    failed.push(`${p.slug}: ${e.message}`);
  }
}

await writeFile(file, JSON.stringify(data, null, 1));
const local = data.products.filter((p) => p.image.startsWith("/products/")).length;
console.log(`${local} of ${data.products.length} images local, ${(bytes / 1048576).toFixed(1)} MB`);
if (failed.length) { console.log("Failed:\n" + failed.join("\n")); process.exitCode = 1; }
