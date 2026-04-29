"use client";

import { useState, useEffect } from "react";
import { Search, Sparkles, MapPin } from "lucide-react";
import { usePackage } from "@/contexts/TourPackageContext";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { PackageCard } from "@/components/features/PackageCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { poppins } from "@/lib/fonts";

type SortOption = "popular" | "price-low" | "price-high" | "duration";

export default function PackagesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const { packages, fetchPackages, loading } = usePackage();
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredPackages = packages.filter((pkg) => {
    const q = searchTerm.toLowerCase();

    const matchesSearch =
      pkg.title.toLowerCase().includes(q) ||
      pkg.description.toLowerCase().includes(q) ||
      pkg.locations?.join(" ").toLowerCase().includes(q);

    const matchesType = typeFilter === "all" || pkg.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const sortedPackages = [...filteredPackages].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return (b.soldCount || 0) - (a.soldCount || 0);
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "duration":
        return a.duration - b.duration;
      default:
        return 0;
    }
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const totalPackages = packages.length;
  const avgPrice =
    totalPackages > 0
      ? Math.round(
          packages.reduce((sum, pkg) => sum + pkg.price, 0) / totalPackages,
        )
      : 0;
  const avgDuration =
    totalPackages > 0
      ? (
          packages.reduce((sum, pkg) => sum + pkg.duration, 0) / totalPackages
        ).toFixed(1)
      : 0;

  return (
    <main
      className={`${poppins.className} min-h-screen flex flex-col bg-slate-50 text-slate-950`}
    >
      <Header showBackButton />

      <div className="flex-grow px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Hero Section */}
          {/* <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-orange-50 via-white to-slate-100 p-8 shadow-xl shadow-orange-100/40 ring-1 ring-slate-200">
            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">
                  <Sparkles className="h-4 w-4" />
                  Tour packages
                </div>
                <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  Explore amazing destinations and experiences.
                </h1>
              </div>
              <div className="hidden grid-cols-3 gap-3 lg:grid">
                <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-4">
                  <p className="text-xs uppercase tracking-[0.15em] font-semibold text-slate-500">
                    Total
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-950">
                    {totalPackages}
                  </p>
                  <p className="text-xs text-slate-500">packages</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-4">
                  <p className="text-xs uppercase tracking-[0.15em] font-semibold text-slate-500">
                    Avg Price
                  </p>
                  <p className="mt-2 text-xl font-bold text-slate-950">
                    ₹{avgPrice.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-4">
                  <p className="text-xs uppercase tracking-[0.15em] font-semibold text-slate-500">
                    Avg Days
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-950">
                    {avgDuration}
                  </p>
                </div>
              </div>
            </div>
          </section> */}

          {/* Search & Filter Section */}
          <section className="w-full">
            <div className=" rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/20">
              <div className=" mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-orange-600">
                    Search & discover
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    Find your perfect tour
                  </h2>
                </div>
              </div>

              <div className="flex items-end grid gap-6 md:grid-cols-[1.6fr_1fr]">
                <label className="relative flex flex-col">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search packages, locations, experience..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="rounded-3xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-slate-900 shadow-sm placeholder:text-slate-400"
                  />
                </label>

                <div className="flex items-end justify-between">
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-slate-700 mb-2">
                      Sort by
                    </label>
                    <Select
                      value={sortBy}
                      onValueChange={(value: any) =>
                        setSortBy(value as SortOption)
                      }
                    >
                      <SelectTrigger className="rounded-3xl border-slate-200 bg-slate-50 text-slate-900">
                        <SelectValue placeholder="Sort" />
                      </SelectTrigger>
                      <SelectContent className="text-sm font-semibold text-slate-500 mb-2">
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="price-low">
                          Price: Low to High
                        </SelectItem>
                        <SelectItem value="price-high">
                          Price: High to Low
                        </SelectItem>
                        <SelectItem value="duration">
                          Duration (Shortest First)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-slate-700 mb-2">
                      Type
                    </label>

                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="rounded-3xl border-slate-200 bg-slate-50 text-slate-900">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent className="text-sm font-semibold text-slate-500 mb-2">
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Packages Grid */}
          <section className="space-y-6">
            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white/95 p-10 text-center shadow-lg shadow-slate-200/30">
                <p className="text-base text-slate-600">Loading packages...</p>
              </div>
            ) : sortedPackages.length > 0 ? (
              <>
                <div className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-lg shadow-slate-200/40">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-orange-600">
                        Results
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold text-slate-950">
                        Available Packages ({sortedPackages.length})
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {sortedPackages.map((pkg) => (
                    <PackageCard key={pkg._id} pkg={pkg} />
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/95 p-10 text-center shadow-lg shadow-slate-200/20">
                <div className="flex items-center justify-center mb-4">
                  <MapPin className="h-12 w-12 text-slate-300" />
                </div>
                <p className="text-lg font-semibold text-slate-950 mb-2">
                  No packages found
                </p>
                <p className="text-sm text-slate-500">
                  Try adjusting your search terms or filters to find the perfect
                  tour.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}

// import Link from "next/dist/client/link";
// import React from "react";

// const page = () => {
//   return (
//     <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700">
//       <div className="text-center text-white px-6">
//         {/* Title */}
//         <h1 className="text-4xl md:text-6xl font-bold animate-pulse">
//           Coming Soon 🚀
//         </h1>

//         {/* Subtitle */}
//         <p className="mt-4 text-lg opacity-80">
//           We're working on something awesome...
//         </p>

//         {/* Animated Loader */}
//         <div className="mt-8 flex justify-center gap-2">
//           <span className="w-3 h-3 bg-white rounded-full animate-bounce"></span>
//           <span className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></span>
//           <span className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></span>
//         </div>
//       </div>
//       <Link
//         href="/tourist/guides"
//         className="p-3 mt-8 rounded-full text-primary bg-white font-semibold hover:scale-105 transition-transform"
//       >
//         Explore Guides
//       </Link>
//     </div>
//   );
// };

// export default page;
