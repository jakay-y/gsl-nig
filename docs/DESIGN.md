# Gladiator Systems: design direction

The redesign of gsl-nig.com. This file is the direction; the code in `src/` is the same thing, built.

## The idea

A door catalogue drawn as an architect's elevation. Doors stand on a ground line, at one scale, with their names written underneath. Everything else on the site stays quiet so that row of doors is the thing people remember.

Three decisions follow from that and from the subject:

- **Neutrals are galvanised, not cream.** The product is steel. The base is a cool zinc white and a graphite ink.
- **Headlines are tall and narrow.** One typeface, Archivo, set condensed for display so type has the proportion of a door leaf.
- **Corners are square.** A 2px radius everywhere. Nothing is pill-shaped.

## Visual system

### Colour

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--bg` | `#ecedea` zinc | `#131517` | Page |
| `--surface` | `#e4e5e1` | `#1b1e20` | Alternate sections, notes, selected options |
| `--wall` | `#dfe0db` | `#b7b9b4` | The bay behind every product image |
| `--floor` | `#d2d3ce` | `#a4a6a1` | The strip a door stands on |
| `--ink` | `#17191b` graphite | `#e8e9e5` | Text, rules that start a list, selected chips |
| `--muted` | `#5d6165` | `#9b9fa2` | Secondary text |
| `--rule` | `#cdcec9` | `#2d3134` | Hairlines between rows |
| `--accent` | `#1d3e96` bolt blue | `#a9bcff` | Primary button and focus ring only |
| `--ember` | `#9a4b14` | `#e39a63` | Fire ratings and form errors only |

Bolt blue is the blue of the existing GSL mark, deepened, so the brand carries over. It appears once or twice per screen.

In dark mode the wall stays light. Product images are cut-outs and white-background photographs; on a dark ground black doors vanish and white photographs glare. A lit bay in a dark room solves both and reads like a showroom at night.

### Type

Archivo variable, weight and width axes, loaded once through `next/font`.

| Role | Class | Size | Width | Weight | Leading |
|---|---|---|---|---|---|
| Display | `.display` | 56 to 192px | 64 | 620 | 0.86 |
| Page title | `.title` | 44 to 100px | 68 | 620 | 0.92 |
| Section heading | `.heading` | 32 to 56px | 74 | 600 | 1.0 |
| Subheading | `.subheading` | 20px | 100 | 580 | 1.25 |
| Lede | `.lede` | 18 to 21px | 100 | 400 | 1.45 |
| Body | `body` | 17px | 100 | 400 | 1.55 |
| Small | `.small` | 14px | 100 | 400 | 1.45 |
| Label | `.label` | 13px | 100 | 540 | 1.3 |

Rules: sentence case everywhere, no all-caps labels, tabular figures on, body lines capped near 62 characters, headings balanced with `text-wrap: balance`.

### Space and grid

- 4px scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- Gutter `clamp(20px, 4vw, 56px)`, content capped at 1560px.
- Sections breathe: `clamp(72px, 11vw, 168px)` top and bottom.
- `.split` is the house layout: on a 12-column grid the heading takes columns 1 to 5 and the content columns 7 to 12. The empty sixth column is deliberate.
- Lists are rows, not cards. A list opens with a 1px ink rule and separates rows with 1px `--rule` hairlines.

## Components

| Component | Behaviour |
|---|---|
| **Bay** (`Door.tsx`) | 4:5 recess of wall colour. Doors (portrait images) stand bottom-aligned on a floor strip; handles, locks and canopies sit centred with no floor. Image blends with `multiply` so white backgrounds disappear. Hover scales the image 2.5% from its base over 400ms. |
| **Button** | 48px high, 2px radius. Primary is bolt blue, used for the one conversion action per view. Quiet is a 1px ink outline that fills on hover. Press scales to 0.98 in 90ms. |
| **Chip** | 36px filter control built on a real radio or checkbox. Selected fills ink. Shows its count. |
| **Search field** | Underline only, 18px text, clear button appears with input, `/` focuses it. |
| **Option** | 56px row for the quote flow, real radio or checkbox underneath, round mark for single choice and square for multiple. |
| **Input** | 52px, 1px outline that thickens to 2px ink on focus and 2px ember on error. Error text sits directly under the field and is announced. |
| **Spec list** | Two-column definition rows, label in muted 14px. Stacks under 640px. |
| **Header** | 64px, solid, sticky, hairline base. Wordmark, four links, theme switch, quote button with the shortlist count. Under 900px the links move into a full-screen menu that closes on Escape and on navigation. |
| **Footer** | Dark in both themes (tokens re-scoped on `.footer`). Leads with the showroom: address, a live open or closed status worked out from Abuja time, directions and quote buttons. Then ranges, PDFs, contact and hours, and the wordmark set at 17vw across the full width. |
| **Focus** | 2px bolt-blue outline, 3px offset, on every interactive element. |

Empty and error states are written, not decorated: an empty search explains what was searched and offers the next action; a product with no data sheet says so and points to the PDF; an empty quote list says it is fine and shows the alternative.

## Motion

Short, eased out, and tied to an action or to scroll. The curve is `cubic-bezier(0.2, 0.7, 0.2, 1)`.

| Moment | Motion | Time |
|---|---|---|
| Home load | Headline lines rise out of a clip, then the rest fades in. The one orchestrated sequence on the site. | 640ms, 70ms stagger |
| Home scroll | The elevation drifts left as the page scrolls (`animation-timeline: scroll()`), transform only. Browsers without scroll timelines get a static row that still scrolls by hand. | Scroll-linked |
| Hover on a product | Door grows 2.5% from the floor | 400ms |
| Hover on a row | Row indents and tints | 240ms |
| Filter change | Results cross-fade in | 240ms |
| Quote step change | New step fades up 8px; progress bar scales | 240ms, 400ms |
| Menu | Fades down 8px | 240ms |
| Press | Scale 0.98 | 90ms |

Nothing bounces, nothing loops, nothing animates on a timer. `prefers-reduced-motion` reduces every duration to nothing.

## Pages

**Home `/`** in order, each section answering the question the last one raises:
1. Hero: headline, one sentence of what GSL does and two actions on the left; on the right a vector elevation of a door whose nine bolts (in bolt blue) throw into the frame once on load, with an Unlock and Lock button. Then the elevation of 14 real doors and four facts.
2. Ranges: the eight ranges as type rows with counts, linking to the filtered catalogue.
3. The Gladiator lock: the differentiator, with the real figures from the technical sheet.
4. Fire ratings: 30, 45, 90, each linking to that filter.
5. How an order runs: four steps, numbered because they are a sequence.
6. Catalogues: the four PDFs.
7. Close: one line and the quote button.

**Catalogue `/catalogue`**: search, range chips with counts, and filters that appear only when they apply (fire rating inside fire doors, Gladiator lock where some doors offer it). State lives in the URL so any view is linkable. Controls pin under the header from tablet width up.

**Product `/catalogue/[slug]`**: the door stays pinned on the left while the specification scrolls on the right. Two actions: request a quote, or add to the quote list. Then four neighbours from the same range. 107 pages, all static.

**Quote `/quote`**: four steps (what, building, opening, contact), a review screen with a Change link per row, then a confirmation. Validation runs on Continue and focus moves to the first problem. Items added from product pages appear in step one.

There is no dashboard. The business has no logged-in area, and inventing one would be decoration.

## Before launch

These are open and need the client:

1. **Photography.** Product images are the existing 400x600 cut-outs, copied from the live site. They hold up at the sizes used but will look soft on high-density screens above about 300px wide. Higher-resolution cut-outs from RB, plus one or two commissioned photographs of fitted doors in Abuja, are the biggest available upgrade. No stock or generated images are used anywhere.
2. **Images are local** in `public/products/` (107 files, 14.9 MB, original PNG and JPG). They are served as-is; converting them to WebP or AVIF at fixed widths would cut that weight considerably.
3. **Quote delivery.** "Send by email" opens a drafted email to sales@gsl-nig.com in the visitor's mail app. A server route with an email provider should replace it.
4. **Phone numbers.** The old header shows +234 (0)1 454 2485; the old footer shows 09 291 7524 and 0803 311 6131. This build uses the footer pair. Confirm which are live.
5. **Logo.** The wordmark is typeset. The existing helmet logo is only available as a 300px PNG and needs redrawing as a vector before it can be used at this quality.
6. **Copy to confirm.** "How an order runs" and the range descriptions were written from the existing product sheets and the old About text. 44 products have no technical sheet on the old site.
7. **Catalogue sync.** `npm run catalogue` re-reads the live site, rewrites `src/content/catalogue.json` and re-copies the images.
