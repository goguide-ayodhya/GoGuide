"use client";

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
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useGuide } from "@/contexts/GuideContext";
import { getAllGuides } from "@/lib/api/guides";

type SortOption = "rating" | "price-low" | "price-high" | "experience";

export default function GuidesPage() {
  const { guides, setGuides } = useGuide();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [languageFilter, setLanguageFilter] = useState<string>("");

  const filteredGuides = guides.filter(
    (guide: {
      name: string;
      specialities?: string[];
      languages: string | string[];
    }) => {
      const matchesSearch =
        guide.name ||
        "".toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.specialities ||
        [].some((s: string) =>
          s.toLowerCase().includes(searchTerm.toLowerCase()),
        );

      const matchesLanguage: boolean =
        !languageFilter || guide.languages?.includes(languageFilter);

      return matchesSearch && matchesLanguage;
    },
  );

  const sortedGuides = [...filteredGuides].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "experience":
        return b.experience - a.experience;
      case "rating":
      default:
        return b.rating - a.rating;
    }
  });

  const allLanguages: string[] = Array.from(
    new Set(guides.flatMap((g: { languages: any }) => g.languages).sort()),
  );

  const totalGuides = guides.length;

  const avgRating =
    guides.length > 0
      ? (
          guides.reduce(
            (sum: any, g: { rating: any }) => sum + (g.rating || 0),
            0,
          ) / guides.length
        ).toFixed(1)
      : 0;

  const totalLanguages = new Set(
    guides.flatMap((g: { languages: any }) => g.languages || []),
  ).size;

  // useEffect(() => {
  //   if (loading) return <p>Loading...</p>;
  // });

  useEffect(() => {
    const fetchData = async () => {
      const data = await getAllGuides();
      if (data) setGuides(data);
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [setGuides]);

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Header title="Find a Guide" showBackButton />

      <div className="flex-grow">
        <div className="px-4 md:px-6 py-8">
          <div className="mx-auto max-w-7xl">
            {/* Search and Filters */}
            <div className="mb-8 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search guides by name, speciality, or bio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Sort by
                  </label>
                  <Select
                    value={sortBy}
                    onValueChange={(value: any) =>
                      setSortBy(value as SortOption)
                    }
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Highest Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Highest Rating</SelectItem>
                      <SelectItem value="price-low">
                        Price: Low to High
                      </SelectItem>
                      <SelectItem value="price-high">
                        Price: High to Low
                      </SelectItem>
                      <SelectItem value="experience">
                        Most Experience
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Language
                  </label>
                  <Select
                    value={languageFilter || "all"}
                    onValueChange={(value) =>
                      setLanguageFilter(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="bg-background">
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

            {/* Results */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Available Guides ({sortedGuides.length})
              </h3>

              {sortedGuides.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedGuides.map((guide) => (
                    <GuideCard key={guide.id} guide={guide} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-2">
                    No guides found matching your search
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your filters
                  </p>
                </div>
              )}
            </div>

            {/* Stats */}

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-muted/50 rounded-lg border border-border text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {totalGuides}
                </div>
                <p className="text-muted-foreground">Expert Guides</p>
              </div>
              <div className="p-6 bg-muted/50 rounded-lg border border-border text-center">
                <div className="text-3xl font-bold text-secondary mb-2">
                  {avgRating}
                </div>
                <p className="text-muted-foreground">Average Rating</p>
              </div>
              <div className="p-6 bg-muted/50 rounded-lg border border-border text-center">
                <div className="text-3xl font-bold text-accent mb-2">
                  {totalLanguages}
                </div>
                <p className="text-muted-foreground">Total Languages</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
