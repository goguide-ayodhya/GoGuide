import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, IndianRupee, Truck, User, Percent, Star, Zap } from "lucide-react";
import { Package } from "@/contexts/TourPackageContext";
import { Button } from "@/components/ui/button";

interface PackageCardProps {
  pkg: Package;
}

const getPackageTypeStyles = (type?: string) => {
  switch (type) {
    case "premium":
      return {
        border: "border-2 border-amber-400 shadow-lg hover:shadow-2xl",
        hover: "hover:scale-105",
        badge: "bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950",
        badgeText: "✨ Premium",
        button: "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold",
        glow: "absolute inset-0 rounded-t-2xl bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none",
      };
    case "medium":
      return {
        border: "border-2 border-blue-300 shadow-md hover:shadow-xl",
        hover: "hover:scale-[1.02]",
        badge: "bg-blue-500 text-white",
        badgeText: "⭐ Recommended",
        button: "bg-blue-600 hover:bg-blue-700 text-white font-semibold",
        glow: "absolute inset-0 rounded-t-2xl bg-gradient-to-b from-blue-400/5 to-transparent pointer-events-none",
      };
    default:
      return {
        border: "border border-slate-200 shadow-sm hover:shadow-md",
        hover: "hover:scale-100",
        badge: "bg-slate-200 text-slate-700",
        badgeText: "Basic",
        button: "bg-slate-600 hover:bg-slate-700 text-white font-semibold",
        glow: "absolute inset-0 rounded-t-2xl bg-gradient-to-b from-slate-300/0 to-transparent pointer-events-none",
      };
  }
};

export function PackageCard({ pkg }: PackageCardProps) {
  const styles = getPackageTypeStyles(pkg.type);
  const isPremium = pkg.type === "premium";
  const isMedium = pkg.type === "medium";

  return (
    <Card
      className={`overflow-hidden rounded-3xl bg-white transition-all duration-300 ${styles.border} ${styles.hover}`}
    >
      <div className="relative group">
        <div className="aspect-video w-full bg-slate-100 overflow-hidden rounded-t-2xl">
          {pkg.mainImage || pkg.images?.[0] ? (
            <>
              <img
                src={pkg.mainImage || pkg.images?.[0]}
                alt={pkg.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className={styles.glow} />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              GoGuide's {pkg.title || "Package"}
            </div>
          )}
        </div>

        <div className="absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-2">
          {/* Discount - enhanced */}
          {pkg.discount ? (
            <div className={`${isPremium ? "bg-white/95 rounded-full" : "bg-white/90 rounded-full"} px-3 py-1.5 flex items-center gap-2 text-sm font-semibold shadow-md`}>
              <Percent className={`w-4 h-4 ${isPremium ? "text-amber-600" : "text-rose-500"}`} />
              <span className={`${isPremium ? "text-amber-600" : "text-rose-600"}`}>
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
      </div>

      {/* Package Type Badge - positioned at top of card content */}
      <div className="relative px-5 pt-4 pb-2">
        <div className={`inline-block ${styles.badge} px-3 py-1 rounded-full text-xs font-bold mb-2`}>
          {styles.badgeText}
        </div>
      </div>

      <div className="px-5 pb-5">
        <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-2 leading-tight">
          {pkg.title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
          <MapPin className="w-4 h-4 text-orange-600 flex-shrink-0" />
          <span className="truncate">{pkg.locations?.[0] || "Locations not mentioned"}</span>
        </div>

        <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">
          {pkg.description}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className={`rounded-xl border ${isPremium ? "border-amber-200 bg-amber-50" : isMedium ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-slate-50"} p-3 transition-colors`}>
            <p className="text-xs uppercase text-slate-600 font-semibold tracking-wide">
              Duration
            </p>
            <p className="mt-1.5 text-sm font-bold text-slate-900">
              {pkg.duration} {pkg.durationType === "days" ? "days" : "hrs"}
            </p>
          </div>
          <div className={`rounded-xl border ${isPremium ? "border-amber-200 bg-amber-50" : isMedium ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-slate-50"} p-3 transition-colors`}>
            <p className="text-xs uppercase text-slate-600 font-semibold tracking-wide">
              Price
            </p>
            <div className="mt-1.5 flex items-center gap-1.5 text-sm font-bold text-slate-900">
              <IndianRupee className="w-3.5 h-3.5" />

              {pkg.discount ? (
                <>
                  <span className="line-through text-slate-400 text-xs">
                    {pkg.price.toLocaleString()}
                  </span>
                  <span className={`${isPremium ? "text-amber-600" : "text-rose-600"}`}>
                    {Math.round(
                      pkg.price * (1 - pkg.discount / 100),
                    ).toLocaleString()}
                  </span>
                </>
              ) : (
                <span>{pkg.price.toLocaleString()}</span>
              )}
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex items-center gap-4 text-sm text-slate-700 mb-5 pb-3 border-b border-slate-200">
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

        {/* CTA Button */}
        <Link href={`/tourist/packages/book/${pkg._id}`}>
          <Button
            className={`w-full rounded-2xl font-semibold py-2.5 transition-all ${styles.button} ${
              isPremium ? "shadow-lg hover:shadow-xl" : ""
            }`}
          >
            {isPremium ? "Book Premium Package" : "View Details & Book"}
          </Button>
        </Link>
      </div>

      {/* Premium glow border effect */}
      {isPremium && (
        <div className="absolute inset-0 rounded-3xl pointer-events-none bg-gradient-to-r from-amber-400/0 via-amber-400/5 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </Card>
  );
}
