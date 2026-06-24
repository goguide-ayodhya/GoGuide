import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { Guide } from "@/contexts/GuideContext";
import { assets } from "@/public/assets/assets";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getPublicSettingsApi } from "@/lib/api/finance";
import { PaymentQRModal } from "@/components/PaymentQRModal";

interface GuideCardProps {
  guide: Guide;
  pricing?: {
    halfDayPrice?: number;
    fullDayPrice?: number;
  };
}

function getStatusBadge(isAvailable: boolean) {
  if (isAvailable) {
    return {
      label: "Available Now",
      variant: "default" as const,
      color: "bg-green-500/20 text-green-700 border-green-200",
      dotColor: "text-green-500",
    };
  }
  return {
    label: "Unavailable",
    variant: "default" as const,
    color: "bg-gray-500/20 text-gray-700 border-gray-200",
    dotColor: "text-gray-500",
  };
}

export function GuideCard({ guide, pricing }: GuideCardProps) {
  const [showPaymentQR, setShowPaymentQR] = useState(false);
  const [paymentQR, setPaymentQR] = useState<{
    url: string;
    isEnabled: boolean;
  } | null>(null);

  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const statusBadge = getStatusBadge(guide.isAvailable);
  const canBook = guide.isAvailable;
  const profileImage = guide.avatar || guide.image || assets.guideImage;
  const guideName = guide.userId?.name || "Unknown Guide";
  const bioText =
    guide.bio?.trim() ||
    (guide.specialities && guide.specialities.length > 0
      ? guide.specialities[0]
      : "Friendly local guide with stories and insider tips.");
  const recentReviews = guide.recentReviews?.slice(0, 3) || [];

  useEffect(() => {
    getPublicSettingsApi()
      .then((data: any) => {
        if (data?.paymentQR) setPaymentQR(data.paymentQR);
      })
      .catch(() => { });
  }, []);

  const cardContent = (
    <>
      <Card
        className={[
          "group overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-sm transition-all duration-300",
          canBook
            ? "hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
            : "opacity-80",
        ].join(" ")}
      >
        <div className="p-5">
          <div className="flex gap-5 sm:flex-row sm:items-start">
            <div className="flex-shrink-0">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-primary/20 bg-muted">
                <Image
                  src={profileImage}
                  alt={guideName}
                  fill
                  className="object-cover"
                  sizes="96px"
                  unoptimized={
                    typeof profileImage === "string" &&
                    profileImage.startsWith("http")
                  }
                />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-foreground">
                    {guideName}
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                    {bioText.slice(0, 40)}.....
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-2 text-sm font-semibold text-secondary-foreground">
                  <Star className="h-4 w-4 fill-secondary text-secondary" />
                  <span className="text-secondary">
                    {guide.rating?.toFixed(1) ?? "0.0"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="w-full mt-3 flex justify-between inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/90 px-3 py-1 text-xs font-semibold text-foreground">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full bg-current border border-secondary ${statusBadge.dotColor}`}
                />
                {statusBadge.label}
              </div>

              <div>
                {guide.verificationStatus === "VERIFIED" ? (
                  <Badge
                    variant="outline"
                    className="ml-2 text-xs bg-green-500/20 text-green-700 border-green-200"
                  >
                    Verified Guide
                  </Badge>
                ) : (
                  <Badge
                    variant="destructive"
                    className="ml-2 text-xs bg-red-500/20 text-red-700 border-red-200"
                  >
                    Not Verified
                  </Badge>
                )}
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-border/70 bg-background/80 px-3 py-2 text-xs font-medium text-foreground">
                {guide.experience} yrs experience
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/80 px-3 py-2 text-xs font-medium text-foreground text-center">
                {pricing?.halfDayPrice && pricing?.fullDayPrice ? (
                  <>
                    H: ₹{pricing.halfDayPrice} / F: ₹{pricing.fullDayPrice}
                  </>
                ) : (
                  <>Fixed Pricing</>
                )}
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/80 px-3 py-2 text-xs font-medium text-foreground">
                {guide.languages
                  ?.slice(0, 3)
                  .map((lang) => lang.slice(0, 3))
                  .join(" ")}{" "}
                <br />
                {guide.languages?.length ?? 0} languages
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <p className="text-xs pt-1">Certificates:</p>
              {guide.certificates && guide.certificates.length > 0 ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    {guide.certificates.map((cert, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(cert.image)}
                        className="px-3 py-1 text-xs rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition"
                      >
                        {cert.name &&
                          !cert.name.match(
                            /\.(jpg|jpeg|png|webp|gif|pdf|avif)$/i,
                          ) &&
                          !cert.name.startsWith("http")
                          ? cert.name
                          : "Doc"}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">No certificates</p>
              )}
            </div>

            <div className="w-full pt-5">
              {guide.reviewQRToken && guide.reviewCollectionEnabled && (
                <button
                  onClick={() => {
                    const path = guide.reviewQRToken
                      ? `/tourist/guides/review/${guide.reviewQRToken}`
                      : `/tourist/guides/${guide.id}`;
                    router.push(path);
                  }}
                  className="w-full cursor-pointer border border-slate-200 px-3 py-2 text-sm text-slate-700  hover:bg-slate-50"
                >
                  Leave a review
                </button>
              )}
            </div>
          </div>

          <div className="mt-2">
            <Button
              onClick={() => router.push(`/tourist/guides/book/${guide.id}`)}
              disabled={!canBook}
              className={`w-full rounded-2xl shadow-sm shadow-primary/10 ${canBook
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-gray-400 text-gray-200 cursor-not-allowed hover:bg-gray-400"
                }`}
            >
              {canBook ? "Book Now" : "Currently Unavailable"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Modal rendered outside Card to prevent transform issues */}
      {/* review redirect handled by button; QR modal removed */}

      {showPaymentQR && paymentQR?.url && (
        <PaymentQRModal
          qrUrl={paymentQR.url}
          onClose={() => setShowPaymentQR(false)}
        />
      )}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="certificate"
            className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );

  return cardContent;
}
