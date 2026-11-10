import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogueBrowser } from "@/components/CatalogueBrowser";
import { cards, categories } from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "Catalogue",
  description: "Search and filter every Gladiator Systems door, lock, canopy and handle by range, fire rating and lock option.",
};

export default function CataloguePage() {
  return (
    <>
      <div className="wrap page-head">
        <h1 className="title">Catalogue</h1>
      </div>
      {/* useSearchParams needs a Suspense boundary for static rendering. */}
      <Suspense fallback={<div className="wrap muted" style={{ minHeight: "60vh" }}>Loading the catalogue</div>}>
        <CatalogueBrowser
          cards={cards}
          ranges={categories.map(({ slug, name, count }) => ({ slug, name, count }))}
        />
      </Suspense>
    </>
  );
}
