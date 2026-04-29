"use client";

import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { usePackage } from "@/contexts/TourPackageContext";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { PackageBookingForm } from "@/components/booking/PackageBookingForm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Users,
  ChevronRight,
  Percent,
  IndianRupee,
  Truck,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { poppins } from "@/lib/fonts";
import { getPackageById } from "@/lib/api/tourPackages";

const getPackageTypeStyles = (type?: string) => {
  switch (type) {
    case "premium":
      return {
        border: "border-2 border-amber-400 shadow-lg hover:shadow-2xl",
        hover: "hover:scale-105",
        badge: "bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950",
        badgeText: "✨ Premium",
        button:
          "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold",
        glow: "absolute inset-0 rounded-t-2xl bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none",
        box: "border-amber-200 bg-amber-50",
        boxBorder: "border-amber-200",
        boxBg: "bg-amber-50",
      };
    case "medium":
      return {
        border: "border-2 border-blue-300 shadow-md hover:shadow-xl",
        hover: "hover:scale-[1.02]",
        badge: "bg-blue-500 text-white",
        badgeText: "⭐ Recommended",
        button: "bg-blue-600 hover:bg-blue-700 text-white font-semibold",
        glow: "absolute inset-0 rounded-t-2xl bg-gradient-to-b from-blue-400/5 to-transparent pointer-events-none",
        box: "border-blue-200 bg-blue-50",
        boxBorder: "border-blue-200",
        boxBg: "bg-blue-50",
      };
    default:
      return {
        border: "border border-slate-200 shadow-sm hover:shadow-md",
        hover: "hover:scale-100",
        badge: "bg-slate-200 text-slate-700",
        badgeText: "Basic",
        button: "bg-slate-600 hover:bg-slate-700 text-white font-semibold",
        glow: "absolute inset-0 rounded-t-2xl bg-gradient-to-b from-slate-300/0 to-transparent pointer-events-none",
        box: "border-slate-200 bg-slate-50",
        boxBorder: "border-slate-200",
        boxBg: "bg-slate-50",
      };
  }
};

export default function PackageBookingPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { packages } = usePackage();

  // Handle both string and array params from dynamic routes
  const packageId = Array.isArray(params.id)
    ? params.id[0]
    : (params.id as string);

  const [pkg, setPkg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPackage = async () => {
      setLoading(true);
      try {
        console.log("[BOOKING] Fetching package:", packageId);
        const data = await getPackageById(packageId);

        if (!data) {
          console.log("[BOOKING] Package not found");
          setPkg(null);
          return;
        }

        console.log("[BOOKING] Package fetched:", data);
        setPkg(data);
        setSelectedImage(data.mainImage || data.images?.[0] || null);
      } catch (err) {
        console.error("[BOOKING] Error fetching package:", err);
        setPkg(null);
      } finally {
        setLoading(false);
      }
    };

    if (packageId) {
      fetchPackage();
    }
  }, [packageId]);

  const styles = getPackageTypeStyles(pkg?.type);
  const isPremium = pkg?.type === "premium";
  const isMedium = pkg?.type === "medium";

  const handleBookingSubmit = async (data: any) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      console.log("Booking data:", data);
      // TODO: Process booking and redirect to payment
      router.push("/tourist/payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className={`${poppins.className} min-h-screen flex flex-col bg-slate-50 text-slate-950`}
    >
      <Header showBackButton />

      {!loading && pkg ? (
        <div className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Booking Form */}
              <div className="lg:col-span-2">
                {!isLoggedIn ? (
                  <Card
                    className={`rounded-3xl ${styles.box} p-8 shadow-lg shadow-slate-200/20`}
                  >
                    <div className="space-y-4">
                      <h2 className="text-2xl font-semibold text-slate-950">
                        Sign in Required
                      </h2>
                      <p className="text-slate-600">
                        Please sign in to complete your booking.
                      </p>
                      <Button
                        onClick={() =>
                          router.push(
                            `/login?redirect=/packages/book/${packageId}`,
                          )
                        }
                        className={`w-full rounded-2xl h-12 ${styles.button}`}
                      >
                        Sign In to Book
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <PackageBookingForm
                    packagePrice={pkg.price}
                    packageTitle={pkg.title}
                    discount={pkg.discount || 0}
                    onSubmit={handleBookingSubmit}
                    isLoading={isSubmitting}
                    boxStyle={styles.box}
                    boxBorder={styles.boxBorder}
                    maxGroupSize={pkg.maxGroupSize}
                  />
                )}
              </div>

              {/* Right Column - Package Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                  {/* Package Card Summary */}
                  <Card
                    className={`overflow-hidden rounded-3xl bg-white ${styles.border} ${styles.hover}`}
                  >
                    {/* Image */}
                    <div className="space-y-4 p-3">
                      {/* Main Image */}
                      <div
                        className={`w-full h-[350px] rounded-2xl overflow-hidden ${styles.boxBg}`}
                      >
                        <img
                          src={selectedImage || pkg.mainImage}
                          className="w-full h-full object-cover"
                        />
                        <div className={styles.glow} />
                      </div>

                      {/* Thumbnails */}
                      <div className="flex gap-3 overflow-x-auto no-scrollbar">
                        {[pkg.mainImage, ...(pkg.images || [])]
                          .filter(Boolean)
                          .map((img: string, i: number) => (
                            <img
                              key={i}
                              src={img}
                              onClick={() => setSelectedImage(img)}
                              className={`w-20 h-20 object-cover rounded-xl cursor-pointer border-2 ${
                                selectedImage === img
                                  ? "border-black"
                                  : "border-transparent"
                              }`}
                            />
                          ))}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="px-4">
                      <h3 className="text-lg font-semibold text-slate-950 mb-2 line-clamp-2">
                        {pkg.title}
                      </h3>

                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                        <MapPin className="h-4 w-4 text-orange-600" />
                        <span>
                          <span>{pkg.locations?.[0] || "Not specified"}</span>
                        </span>
                      </div>

                      {/* Duration & Days */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className={`rounded-2xl border ${styles.box} p-3`}>
                          <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold">
                            Duration
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {pkg.duration} days
                          </p>
                        </div>

                        <div className={`rounded-2xl border ${styles.box} p-3`}>
                          <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold">
                            Price
                          </p>

                          <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                            <IndianRupee className="w-3.5 h-3.5" />

                            {pkg.discount ? (
                              <>
                                <span className="line-through text-slate-400 text-xs">
                                  {pkg.price}
                                </span>
                                <span
                                  className={`${isPremium ? "text-amber-600" : "text-rose-600"} font-bold`}
                                >
                                  {Math.round(
                                    pkg.price * (1 - pkg.discount / 100),
                                  ).toLocaleString()}
                                </span>
                              </>
                            ) : (
                              <span>{pkg.price}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h2 className="text-md font-semibold">
                          About this tour
                        </h2>
                        <p className="text-slate-600 text-xs">
                          {pkg.description}
                        </p>

                        {/* Locations */}
                        <div>
                          <h3 className="font-semibold mt-4 mb-2">Locations</h3>
                          <div className="flex flex-wrap gap-2">
                            {pkg.locations?.map((loc: string, i: number) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-slate-100 rounded-full text-sm"
                              >
                                {loc}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="absolute inset-x-3 top-12 z-10 flex items-start justify-between gap-2 px-2">
                        {/* Discount - enhanced */}
                        {pkg.discount ? (
                          <div
                            className={`${isPremium ? "bg-white/95 rounded-full" : "bg-white/90 rounded-full"} px-3 py-1.5 flex items-center gap-2 text-sm font-semibold shadow-md`}
                          >
                            <Percent
                              className={`w-4 h-4 ${isPremium ? "text-amber-600" : "text-rose-500"}`}
                            />
                            <span
                              className={`${isPremium ? "text-amber-600" : "text-rose-600"}`}
                            >
                              {pkg.discount}% OFF
                            </span>
                          </div>
                        ) : (
                          <div />
                        )}

                        <div className="flex items-center gap-2">
                          {/* Sold count */}
                          <div className="bg-black/70 text-white rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                            {pkg.soldCount ?? 0} sold
                          </div>

                          {/* Popular */}
                          {(pkg.soldCount ?? 0) > 10 && (
                            <Badge className="bg-white/95 text-amber-600 rounded-full px-3 py-1 text-xs font-semibold shadow-md">
                              🔥 Popular
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Includes */}
                      {pkg.includes && pkg.includes.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-[0.15em]">
                            Included
                          </p>
                          <div className="space-y-2">
                            {pkg.includes
                              .slice(0, 3)
                              .map((item: string, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 text-xs text-slate-600"
                                >
                                  <ChevronRight className="h-3.5 w-3.5 text-orange-600 flex-shrink-0" />
                                  <span>{item}</span>
                                </div>
                              ))}
                            {pkg.includes.length > 3 && (
                              <div className="text-xs text-slate-500 italic">
                                +{pkg.includes.length - 3} more included
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 px-4 sm:grid-cols-3 gap-3 text-xs">
                      {/* Group Size */}
                      <div className={`rounded-2xl border ${styles.box} p-3`}>
                        <p className="text-slate-400">Group Size</p>
                        <p className="font-semibold">
                          {pkg.maxGroupSize || 1} people
                        </p>
                      </div>

                      {/* Start Time */}
                      {pkg.startTime && (
                        <div className={`rounded-2xl border ${styles.box} p-3`}>
                          <p className="text-slate-400">Start</p>
                          <p className="font-semibold">{pkg.startTime}</p>
                        </div>
                      )}

                      {/* Includes */}
                      <div
                        className={`flex items-center gap-4 text-sm text-slate-700 mb-5 px-4 border-b ${styles.boxBorder} col-span-2 sm:col-span-3`}
                      >
                        {pkg.includesCab && (
                          <div className="flex items-center gap-1.5 font-medium">
                            <Truck className="w-4 h-4 text-orange-600" /> Cab
                          </div>
                        )}
                        {pkg.includesGuide && (
                          <div className="flex items-center gap-1.5 font-medium">
                            <User className="w-4 h-4 text-blue-600" /> Guide
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* Contact Support */}
                  <Card
                    className={`rounded-3xl ${styles.box} p-6 shadow-lg shadow-slate-200/20`}
                  >
                    <p className="text-sm font-semibold text-slate-950 mb-2">
                      Have questions?
                    </p>
                    <p className="text-xs text-slate-600 mb-4">
                      Our team is here to help you plan the perfect tour.
                    </p>
                    <Link href="/contact-us">
                      <Button
                        variant="outline"
                        className={`w-full rounded-2xl border ${styles.boxBorder} bg-white hover:bg-slate-50 hover:text-black cursor-pointer`}
                      >
                        Contact Support
                      </Button>
                    </Link>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <Card className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/20">
            <p className="text-slate-600">Loading package details...</p>
          </Card>
        </div>
      )}

      <Footer />
    </main>
  );
}
