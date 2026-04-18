"use client";

import { useState } from "react";
import { Search, Sparkles, Layers } from "lucide-react";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { GuideCard } from "@/components/features/GuideCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGuide } from "@/contexts/GuideContext";
import { poppins } from "@/lib/fonts";

type SortOption = "rating" | "price-low" | "price-high" | "experience";

export default function GuidesPage() {
  const { guides, loading, activeGuidesCount } = useGuide();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [languageFilter, setLanguageFilter] = useState<string>("");

  const filteredGuides = guides.filter((guide: any) => {
    const term = searchTerm.toLowerCase();
    const name = guide.name?.toLowerCase() || "";
    const specialityMatch =
      guide.specialities?.some((s: string) => s.toLowerCase().includes(term)) ||
      false;

    const languages = Array.isArray(guide.languages)
      ? guide.languages
      : guide.languages
        ? [guide.languages]
        : [];

    const matchesLanguage =
      !languageFilter || languages.includes(languageFilter);

    return (name.includes(term) || specialityMatch) && matchesLanguage;
  });

  const sortedGuides = [...filteredGuides].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return (a.price || 0) - (b.price || 0);
      case "price-high":
        return (b.price || 0) - (a.price || 0);
      case "experience":
        return (b.experience || 0) - (a.experience || 0);
      case "rating":
      default:
        return (b.rating || 0) - (a.rating || 0);
    }
  });

  const allLanguages: string[] = Array.from(
    new Set(
      guides
        .flatMap((g: any) =>
          Array.isArray(g.languages)
            ? g.languages
            : g.languages
              ? [g.languages]
              : [],
        )
        .filter(Boolean),
    ),
  ).sort();

  const totalGuides = guides.length;
  const avgRating =
    guides.length > 0
      ? (
          guides.reduce(
            (sum: number, guide: any) => sum + (guide.rating || 0),
            0,
          ) / guides.length
        ).toFixed(1)
      : "0.0";

  const totalLanguages = new Set(
    guides.flatMap((g: any) =>
      Array.isArray(g.languages)
        ? g.languages
        : g.languages
          ? [g.languages]
          : [],
    ),
  ).size;

  if (loading) {
    return (
      <main
        className={`${poppins.className} min-h-screen bg-slate-50 text-slate-950`}
      >
        <Header />
        <div className="flex min-h-[calc(100vh-96px)] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/30">
            <p className="text-xl font-semibold text-slate-900">
              Loading guides...
            </p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main
      className={`${poppins.className} min-h-screen bg-slate-50 text-slate-950`}
    >
      <Header />

      <div className="px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-orange-50 via-white to-slate-100 p-8 shadow-xl shadow-orange-100/40 ring-1 ring-slate-200">
            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">
                  <Sparkles className="h-4 w-4" />
                  Book guides
                </div>
                <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  Discover expert local guides for every itinerary.
                </h1>
              </div>
            </div>
          </section>

          <section className="w-full ">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/20">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-orange-600">
                    Search & refine
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    Find your ideal guide
                  </h2>
                </div>
              </div>

              <div className="grid gap-8 md:grid-cols-[1.6fr_1fr]">
                <label className="relative block flex items-center">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search by name, speciality, language..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-12 py-4 text-slate-950 shadow-sm focus:border-orange-400"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Sort by
                    </label>
                    <Select
                      value={sortBy}
                      onValueChange={(value: any) =>
                        setSortBy(value as SortOption)
                      }
                    >
                      <SelectTrigger className="rounded-3xl border border-slate-200 bg-slate-50">
                        <SelectValue placeholder="Highest rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rating">Highest rating</SelectItem>
                        <SelectItem value="price-low">
                          Price: low to high
                        </SelectItem>
                        <SelectItem value="price-high">
                          Price: high to low
                        </SelectItem>
                        <SelectItem value="experience">
                          Most experience
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Language
                    </label>
                    <Select
                      value={languageFilter || "all"}
                      onValueChange={(value: any) =>
                        setLanguageFilter(value === "all" ? "" : value)
                      }
                    >
                      <SelectTrigger className="rounded-3xl border border-slate-200 bg-slate-50">
                        <SelectValue placeholder="All languages" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All languages</SelectItem>
                        {allLanguages.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-orange-600">
                  Guide results
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                  Available guides ({sortedGuides.length})
                </h2>
              </div>
              <p className="text-sm text-slate-500">
                Premium profiles with clear ratings, pricing, and quick booking.
              </p>
            </div>

            {sortedGuides.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {sortedGuides.map((guide) => (
                  <GuideCard key={guide.id} guide={guide} />
                ))}
              </div>
            ) : (
              <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
                <p className="text-lg font-semibold text-slate-950 mb-2">
                  No guides match your search
                </p>
                <p className="text-sm text-slate-500">
                  Try a broader query or clear your filters.
                </p>
              </div>
            )}
          </section>

          <section className="grid gap-6 md:grid-cols-4">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 text-center shadow-sm">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Active guides
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">
                {activeGuidesCount}
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 text-center shadow-sm">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Total guides
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">
                {totalGuides}
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 text-center shadow-sm">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Average rating
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">
                {avgRating}
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 text-center shadow-sm">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Languages covered
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">
                {totalLanguages}
              </p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
