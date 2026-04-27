"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Star, MapPin } from "lucide-react";
import Image from "next/image";
import { useGuide } from "@/contexts/GuideContext";
import { assets } from "@/public/assets/assets";

export default function GuidesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpeciality, setSelectedSpeciality] = useState<string>("all");
  const { loading, guides } = useGuide();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  //
  // Get unique specialities
  const specialities = [
    "all",
    ...new Set(guides.map((g) => g.specialities?.[0] || "General")),
  ];

  // Filter guides
  const filtered = guides.filter((guide) => {
    const nameMatch =
      guide.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const specialityMatch =
      guide.specialities?.some((spec) =>
        spec.toLowerCase().includes(searchTerm.toLowerCase()),
      ) || false;
    const matchesSearch = nameMatch || specialityMatch;
    const matchesSpeciality =
      selectedSpeciality === "all" ||
      (guide.specialities?.[0] || "") === selectedSpeciality;
    return matchesSearch && matchesSpeciality;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Guides Directory</h1>
        <p className="text-muted-foreground mt-2">
          Browse and collaborate with other professional tour guides
        </p>
      </div>

      {/* Filters */}
      <Card className="bg-card border border-border">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={20}
              />
              <Input
                placeholder="Search guides by name or speciality..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-muted border-border"
              />
            </div>

            {/* Speciality Filter */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Filter by Speciality
              </label>
              <div className="flex flex-wrap gap-2">
                {specialities.map((speciality) => (
                  <button
                    key={speciality}
                    onClick={() => setSelectedSpeciality(speciality)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedSpeciality === speciality
                        ? "bg-primary cursor-pointer text-primary-foreground"
                        : "bg-muted cursor-pointer text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {speciality.charAt(0).toUpperCase() + speciality.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guides Grid */}
      <div>
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((guide) => (
              <Card
                key={guide.id}
                className="bg-card border border-border overflow-hidden hover:border-primary/50 transition-colors"
              >
                <CardContent className="p-0">
                  {/* Guide Image */}

                  <div className="relative h-48 w-full overflow-hidden bg-secondary">
                    {/* {guide.image ? ( */}
                    <Image
                      src={guide.image || assets.guideImage}
                      alt={guide.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {/* ) : (
                      <div>No Image</div>
                    )} */}
                  </div>

                  {/* Guide Info */}
                  <div className="p-4 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        {guide.name}
                      </h3>
                      <p className="text-sm font-medium">
                        <b className="text-black">Speciality:</b>{" "}
                        {guide.specialities?.[0]}
                      </p>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={
                              i < Math.floor(guide.rating)
                                ? "fill-yellow-500 text-yellow-500"
                                : "text-black/40"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {guide.rating}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({guide.totalReviews} reviews)
                      </span>
                    </div>

                    {/* Languages */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Languages
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {guide.languages.map((lang) => (
                          <span
                            key={lang}
                            className="px-2 py-1 bg-secondary rounded text-xs text-white"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        Experience:{" "}
                        {guide.experience ?? guide.yearsOfExperience ?? 0}+
                        years
                      </p>
                      <p>
                        Rs: {guide.price ?? 500}/ {guide.duration || "hour"}
                      </p>
                    </div>

                    {/* Certificates */}
                    <div className="mt-4">
                      {guide.certificates && guide.certificates.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {guide.certificates.map((cert, i) => (
                            <button
                              key={i}
                              onClick={() => setSelectedImage(cert.image)}
                              className="px-3 py-1 text-xs rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition"
                            >
                              {cert.name}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          No certificates
                        </p>
                      )}

                      {/* Modal */}
                      {selectedImage && (
                        <div
                          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
                          onClick={() => setSelectedImage(null)}
                        >
                          <img
                            src={selectedImage}
                            alt="certificate"
                            className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
                          />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {/* <Button className="w-full cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground">
                      View Profile
                    </Button> */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border border-border">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No guides found matching your criteria
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results Summary */}
      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {guides.length} guides
      </p>
    </div>
  );
}
