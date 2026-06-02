"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Header } from "@/components/common/Header";
import { galleryData } from "../../public/assets/galleryData";
import GalleryGrid from "./GalleryGrid";
import GalleryLightbox from "./GalleryLightbox";

export default function GalleryPage() {
  const categories = useMemo(() => ["All", ...new Set(galleryData.map((g) => g.category))], []);
  const [active, setActive] = useState("All");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    if (active === "All") return galleryData;
    return galleryData.filter((g) => g.category === active);
  }, [active]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
      <Header />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-center">Travel <b className="text-secondary">Memories</b></h1>
          <p className="mt-2 text-slate-600 max-w-2xl mx-auto italic">
            Explore curated moments from guided tours, spiritual journeys, and premium experiences.
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                active === c
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white text-slate-700 border border-slate-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <GalleryGrid items={filtered} onOpen={(item) => setSelected(item)} />

        <GalleryLightbox
          open={!!selected}
          item={selected}
          items={filtered}
          onClose={() => setSelected(null)}
          onNavigate={(next) => setSelected(next)}
        />
      </div>
    </main>
  );
}
