import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, IndianRupee } from "lucide-react";
import { Package } from "@/contexts/TourPackageContext";
import { Button } from "@/components/ui/button";

interface PackageCardProps {
  pkg: Package;
}

export function PackageCard({ pkg }: PackageCardProps) {
  return (
    <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/40 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60 cursor-pointer">
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        <Image
          src={pkg.image}
          alt={pkg.title}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-slate-950 mb-3 line-clamp-2">
          {pkg.title}
        </h3>

        <div className="flex items-center gap-2 mb-4 text-sm text-slate-600">
          <MapPin className="h-4 w-4 text-orange-600" />
          <span className="font-medium">{pkg.location}</span>
        </div>

        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
          {pkg.description}
        </p>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold">Duration</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{pkg.duration} days</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-orange-50 p-3">
            <p className="text-xs uppercase tracking-[0.15em] text-orange-700 font-semibold">Price</p>
            <div className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-900">
              <IndianRupee className="h-3.5 w-3.5" />
              {pkg.price.toLocaleString()}
            </div>
          </div>
        </div>

        {pkg.location && (
          <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold mb-2">Highlights</p>
            <div className="flex flex-wrap gap-1">
              {pkg.location && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                  {pkg.location}
                </Badge>
              )}
            </div>
          </div>
        )}

        <Link href={`/tourist/packages/book/${pkg._id}`}>
          <Button variant="secondary" size="lg" className="mt-4 w-full rounded-2xl">
            View Details & Book
          </Button>
        </Link>
      </div>
    </Card>
  );
}
