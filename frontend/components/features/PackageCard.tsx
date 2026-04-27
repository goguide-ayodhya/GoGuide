import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, IndianRupee, Truck, User, Percent } from "lucide-react";
import { Package } from "@/contexts/TourPackageContext";
import { Button } from "@/components/ui/button";

interface PackageCardProps {
  pkg: Package;
}

export function PackageCard({ pkg }: PackageCardProps) {
  return (
    <Card className="overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-lg transition">
      <div className="relative">
        <div className="aspect-video w-full bg-slate-100 overflow-hidden">
          <img
            src={pkg.mainImage || (pkg.images && pkg.images[0])}
            alt={pkg.title}
            className="w-full h-full object-cover"
          />
        </div>
        {pkg.discount ? (
          <div className="absolute top-3 left-3 bg-white/90 rounded-full px-3 py-1 flex items-center gap-2 text-sm font-semibold">
            <Percent className="w-4 h-4 text-rose-500" />
            <span className="text-rose-600">{pkg.discount}%</span>
          </div>
        ) : null}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-slate-900 mb-1 line-clamp-2">
          {pkg.title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
          <MapPin className="w-4 h-4 text-orange-600" />
          <span>
            {Array.isArray(pkg.locations)
              ? pkg.locations[0] || pkg.location
              : pkg.location}
          </span>
        </div>

        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
          {pkg.description}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase text-slate-500 font-semibold">
              Duration
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {pkg.duration} {pkg.durationType === "days" ? "days" : "hours"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase text-slate-500 font-semibold">
              Price
            </p>
            <div className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-900">
              <IndianRupee className="w-3.5 h-3.5" />
              {pkg.price.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
          {pkg.includesCab && (
            <div className="flex items-center gap-1">
              <Truck className="w-4 h-4" /> Cab
            </div>
          )}
          {pkg.includesGuide && (
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" /> Guide
            </div>
          )}
        </div>

        <Link href={`/tourist/packages/book/${pkg._id}`}>
          <Button
            variant="secondary"
            size="lg"
            className="mt-2 w-full rounded-2xl"
          >
            View Details & Book
          </Button>
        </Link>
      </div>
    </Card>
  );
}
