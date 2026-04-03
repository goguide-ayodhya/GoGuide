import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Circle } from "lucide-react";
import { Guide } from "@/contexts/GuideContext";
import { assets } from "@/public/assets/assets";

interface GuideCardProps {
  guide: Guide;
}

function getStatusBadge(isOnline: boolean, isAvailable: boolean) {
  if (isOnline && isAvailable) {
    return {
      label: "Available Now",
      variant: "default" as const,
      color: "bg-green-500/20 text-green-700 border-green-200",
      dotColor: "text-green-500",
    };
  }
  if (isOnline && !isAvailable) {
    return {
      label: "Busy",
      variant: "default" as const,
      color: "bg-yellow-500/20 text-yellow-700 border-yellow-200",
      dotColor: "text-yellow-500",
    };
  }
  return {
    label: "Offline",
    variant: "default" as const,
    color: "bg-gray-500/20 text-gray-700 border-gray-200",
    dotColor: "text-gray-500",
  };
}

export function GuideCard({ guide }: GuideCardProps) {
  const statusBadge = getStatusBadge(guide.isOnline, guide.isAvailable);
  const canBook = guide.isAvailable && guide.isOnline;

  const cardContent = (
    <Card
      className={[
        "group overflow-hidden transition-all",
        "border-border/70 bg-card/80 backdrop-blur",
        canBook
          ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/40"
          : "opacity-80",
      ].join(" ")}
    >
      <div className="relative h-44 overflow-hidden bg-muted">
        {guide.image ? (
          <>
            <Image
              src={
                guide.image && !guide.image.includes("fakepath")
                  ? guide.image
                  : assets.guideImage
              }
              alt={guide.name}
              fill
              priority={false}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-primary/10" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="text-sm font-medium">No Image</div>
              {!canBook && (
                <div className="mt-1 text-xs text-destructive">
                  This guide is currently unavailable.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Badge - Top Right */}
        <div className="absolute top-3 right-3">
          <div
            className={[
              "flex items-center gap-1 px-2.5 py-1 rounded-full border shadow-sm",
              "backdrop-blur bg-background/75",
              statusBadge.color,
            ].join(" ")}
          >
            <Circle
              className={`h-2 w-2 fill-current ${statusBadge.dotColor}`}
            />
            <span className="text-xs font-semibold">{statusBadge.label}</span>
          </div>
        </div>

        {/* Circular photo overlay (premium look) */}
        <div className="absolute -bottom-7 left-4">
          <div className="relative h-14 w-14 rounded-full border-2 border-background shadow-md ring-2 ring-primary/30 overflow-hidden bg-muted">
            {guide.image ? (
              <Image
                src={guide.image}
                alt={guide.name}
                fill
                className="object-cover"
                sizes="56px"
              />
            ) : (
              <div className="h-full w-full grid place-items-center text-xs font-semibold text-muted-foreground">
                {guide.name?.slice(0, 1)?.toUpperCase() ?? "G"}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 pt-10">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h3 className="font-semibold leading-tight text-foreground">
              {guide.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {guide.experience}+ years experience
            </p>
          </div>
          <div className="shrink-0">
            <div className="inline-flex items-center gap-1 rounded-full border border-secondary/20 bg-secondary/10 px-2.5 py-1 text-secondary-foreground/90">
              <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
              <span className="text-xs font-semibold text-foreground">
                {guide.rating}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {(guide.languages || []).map((lang: string) => (
            <Badge
              key={lang}
              variant="secondary"
              className="text-[11px] bg-primary/10 text-foreground border border-primary/15"
            >
              {lang}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {guide.specialities ||
            [].slice(0, 2).map((speciality) => (
              <Badge
                key={speciality}
                variant="outline"
                className="text-[11px] border-secondary/30 bg-secondary/5"
              >
                {speciality}
              </Badge>
            ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight text-primary">
            ₹{guide.price ? guide.price : 1000}/hr
          </span>
          <span
            className={[
              "text-xs font-medium",
              canBook
                ? "text-muted-foreground group-hover:text-foreground"
                : "text-destructive",
            ].join(" ")}
          >
            {canBook ? "Book now →" : "Unavailable"}
          </span>
        </div>
      </div>
    </Card>
  );

  if (canBook) {
    return <Link href={`/tourist/guides/book/${guide.id}`}>{cardContent}</Link>;
  }

  return cardContent;
}
