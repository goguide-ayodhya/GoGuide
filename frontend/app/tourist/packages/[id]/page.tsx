"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useParams, useRouter } from "next/navigation";
import { usePackage } from "@/contexts/TourPackageContext";
import { assets } from "@/public/assets/assets";
import Link from "next/link";
import {
  Clock,
  MapPin,
  Check,
  Users,
  Calendar,
  Star,
  ChevronRight,
} from "lucide-react";
import { poppins } from "@/lib/fonts";
import { getPackageById } from "@/lib/api/tourPackages";

export default function PackageDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params.id as string;
  const { packages } = usePackage();
  const [pkg, setPkg] = useState<any>(null);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const found = packages.find((p) => p._id === packageId);

        if (found) {
          setPkg(found);
        }

        const data = await getPackageById(packageId);

        const pkgData = data?.package || data?.data || data;

        setPkg(pkgData);
      } catch (err) {
        console.log("Error fetching package", err);
      }
    };

    if (packageId) fetchPackage();
  }, [packageId, packages]);

  if (!pkg) {
    return (
      <main
        className={`${poppins.className} min-h-screen flex flex-col bg-slate-50 text-slate-950`}
      >
        <Header showBackButton />
        <div className="flex-1 flex items-center justify-center px-4">
          <Card className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/20">
            <p className="text-slate-600">Loading package details...</p>
          </Card>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main
      className={`${poppins.className} min-h-screen flex flex-col bg-slate-50 text-slate-950`}
    >
      <Header showBackButton />

      <div className="flex-grow px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          {/* Hero Image Section */}
          <div className="rounded-3xl overflow-hidden mb-8 bg-slate-200 h-96 shadow-lg shadow-slate-200/40">
            <img
              src={pkg.mainImage || pkg.images?.[0]}
              alt={pkg.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = assets.ramMandir.src;
              }}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Section */}
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">
                  <Calendar className="h-4 w-4" />
                  {pkg.duration} Days Journey
                </div>
                <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-950">
                  {pkg.title}
                </h1>
                <div className="flex items-center gap-2 text-lg text-slate-600">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  <span>{pkg.locations?.[0]}</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/20">
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold">
                    Duration
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    <p className="text-xl font-semibold text-slate-950">
                      {pkg.duration} days
                    </p>
                  </div>
                </Card>
                <Card className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/20">
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold">
                    Group Size
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Users className="h-5 w-5 text-orange-600" />
                    <p className="text-xl font-semibold text-slate-950">
                      {pkg.groupSize} people
                    </p>
                  </div>
                </Card>
                <Card className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/20">
                  <p className="mt-2 text-xl font-semibold text-orange-700">
                    ₹{pkg.price.toLocaleString()}
                  </p>
                </Card>
              </div>

              {/* Description */}
              <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/20">
                <h2 className="text-2xl font-semibold text-slate-950 mb-4">
                  About This Package
                </h2>
                <p className="text-slate-600 leading-relaxed text-base">
                  {pkg.description}
                </p>
              </Card>

              {/* What's Included */}
              <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/20">
                <h3 className="text-xl font-semibold text-slate-950 mb-4">
                  What's Included
                </h3>
                <div className="space-y-3">
                  {pkg.includes && pkg.includes.length > 0 ? (
                    pkg.includes.map((item: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700 font-medium">
                          {item}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 font-medium">
                        Guided tour experience
                      </span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Package Highlights */}
              <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/20">
                <h3 className="text-xl font-semibold text-slate-950 mb-4">
                  Package Highlights
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-orange-50 to-yellow-50 p-4">
                    <MapPin className="h-5 w-5 text-orange-600 mb-2" />
                    <p className="text-sm font-semibold text-slate-950">
                      Destination
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {pkg.locations?.[0] || "Multiple destinations"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
                    <Clock className="h-5 w-5 text-blue-600 mb-2" />
                    <p className="text-sm font-semibold text-slate-950">
                      Duration
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {pkg.duration} days adventure
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4">
                    <Users className="h-5 w-5 text-green-600 mb-2" />
                    <p className="text-sm font-semibold text-slate-950">
                      Group Size
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      Intimate group tours
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-purple-50 to-pink-50 p-4">
                    <Star className="h-5 w-5 text-purple-600 mb-2" />
                    <p className="text-sm font-semibold text-slate-950">
                      Experience
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      Curated experiences
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Price Card */}
                <Card className="rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 p-6 shadow-lg shadow-orange-100/30">
                  <p className="text-xs uppercase tracking-[0.15em] text-orange-700 font-semibold mb-2">
                    Total Price
                  </p>
                  <div className="mb-6">
                    <p className="text-4xl font-bold text-orange-700">
                      ₹{pkg.price.toLocaleString()}
                    </p>
                  </div>

                  <Button
                    onClick={() =>
                      router.push(`/tourist/packages/book/${pkg._id}`)
                    }
                    className="w-full rounded-2xl h-12 bg-orange-600 hover:bg-orange-700 text-white font-semibold mb-3"
                  >
                    Book This Package
                  </Button>

                  <p className="text-xs text-slate-600 text-center">
                    ✓ Free cancellation up to 1 day before the tour date
                  </p>
                  <p className="text-xs text-slate-600 text-center">
                    ✓ 24/7 customer support
                  </p>
                </Card>

                {/* Quick Details Summary */}
                <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/20">
                  <h4 className="text-sm font-semibold text-slate-950 mb-4 uppercase tracking-[0.15em]">
                    Quick Details
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                      <span className="text-slate-600">Duration</span>
                      <span className="font-semibold text-slate-950">
                        {pkg.duration} days
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                      <span className="text-slate-600">Group Size</span>
                      <span className="font-semibold text-slate-950">
                        {pkg.groupSize} people
                      </span>
                    </div>
                    {/* <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                      <span className="text-slate-600">Difficulty</span>
                      <span className="font-semibold text-slate-950">Easy</span>
                    </div> */}
                    {/* <div className="flex justify-between items-center">
                      <span className="text-slate-600">Languages</span>
                      <span className="font-semibold text-slate-950">
                        EN, HI
                      </span>
                    </div> */}
                  </div>
                </Card>

                {/* Support Card */}
                <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/20">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950 mb-1">
                        Have Questions?
                      </p>
                      <p className="text-xs text-slate-600">
                        Our travel experts are ready to help.
                      </p>
                    </div>
                    <Link href="/contact-us">
                      <Button
                        variant="outline"
                        className="w-full rounded-2xl border-slate-200 bg-slate-50 hover:bg-white text-slate-950 font-semibold"
                      >
                        Contact Us
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
