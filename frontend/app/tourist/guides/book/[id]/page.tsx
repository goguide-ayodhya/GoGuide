"use client";

import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useBooking } from "@/contexts/BookingsContext";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { GuideBookingForm } from "@/components/booking/GuideBookingForm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import { Star, Circle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGuide, Guide } from "@/contexts/GuideContext";
import { assets } from "@/public/assets/assets";
import { createBooking } from "@/lib/api/bookings";
import { createPaymentApi } from "@/lib/api/payments";

export default function GuideBookingPage() {
  const params = useParams();
  const router = useRouter();
  const { guides } = useGuide();
  const { isLoggedIn } = useAuth();
  const { setCurrentBooking } = useBooking();

  const guideId = params.id as string;
  const guide = guides.find((g: Guide) => g.id === guideId);

  if (!guide) {
    notFound();
  }

  const handleProceedToPayment = async (formData: any) => {
    try {
      const bookingRes = await createBooking({
        guideId: guideId,
        ...formData,
      });

      console.log("bookingRes:", bookingRes);

      const bookingData = bookingRes?.data || bookingRes;

      if (!bookingData) {
        throw new Error("Booking failed");
      }

      setCurrentBooking({
        ...bookingData,
        paymentMethod: null,
      });
      // router.push("/tourist/payment");
      router.push(`/tourist/payment?paymentId=${bookingData._id}`);
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  // Check if guide is available
  const isGuideAvailable = guide.isOnline && guide.isAvailable;

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Header showBack={true} title="Book a Guide" />

      <div className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Guide Summary */}
          <Card className="overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-4 p-4">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                <Image
                  src={guide.avatar || assets.guideImage}
                  alt={guide.name}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">
                      {guide.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {guide.specialities?.join(", ") || "No Speciality"}
                    </p>
                  </div>
                  {/* Status Badge */}
                  <div>
                    {guide.isOnline && guide.isAvailable && (
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-700 border border-green-200 whitespace-nowrap">
                        <Circle className="h-2 w-2 fill-current text-green-500" />
                        <span className="text-xs font-semibold">
                          Available Now
                        </span>
                      </div>
                    )}
                    {guide.isOnline && !guide.isAvailable && (
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-700 border border-yellow-200 whitespace-nowrap">
                        <Circle className="h-2 w-2 fill-current text-yellow-500" />
                        <span className="text-xs font-semibold">Busy</span>
                      </div>
                    )}
                    {!guide.isOnline && (
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-500/20 text-gray-700 border border-gray-200 whitespace-nowrap">
                        <Circle className="h-2 w-2 fill-current text-gray-500" />
                        <span className="text-xs font-semibold">Offline</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(guide.rating)
                            ? "fill-secondary text-secondary"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {guide.rating}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {guide.languages.map((lang: string) => (
                    <Badge
                      key={lang}
                      variant="outline"
                      className="bg-primary/10 text-primary border-primary/20"
                    >
                      {lang}
                    </Badge>
                  ))}
                </div>

                <div className="text-2xl font-bold text-secondary">
                  ₹{guide.price}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    /hour
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* About Guide */}
          <div className="bg-card rounded-lg p-6 border">
            <h3 className="font-semibold text-foreground mb-2">About</h3>
            <p className="text-muted-foreground text-sm">{guide.bio}</p>
          </div>

          {/* Availability Alert */}
          {!isGuideAvailable && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {!guide.isOnline
                  ? "This guide is currently offline. Please check back later or select another guide."
                  : "This guide is currently busy. Please try booking at a later time."}
              </AlertDescription>
            </Alert>
          )}

          {/* Booking Form */}
          {!isLoggedIn ? (
            <div className="bg-card rounded-lg p-6 border">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Book Tour
              </h2>
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Please{" "}
                  <a
                    href={`/login?redirect=/guides/book/${guideId}`}
                    className="text-primary font-semibold hover:underline"
                  >
                    sign in
                  </a>{" "}
                  to complete your booking.
                </p>
                <div className="opacity-50 pointer-events-none">
                  <GuideBookingForm
                    guideHourlyRate={guide.price}
                    onSubmit={handleProceedToPayment}
                  />
                </div>
              </div>
            </div>
          ) : isGuideAvailable ? (
            <div className="bg-card rounded-lg p-6 border">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Book Tour
              </h2>
              <GuideBookingForm
                guideHourlyRate={guide.price}
                onSubmit={handleProceedToPayment}
              />
            </div>
          ) : null}
        </div>
      </div>

      <Footer />
    </main>
  );
}
