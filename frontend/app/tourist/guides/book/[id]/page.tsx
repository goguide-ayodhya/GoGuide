"use client";

import Image from "next/image";
import { useRouter, useParams, usePathname, notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBooking } from "@/contexts/BookingsContext";
import { useGuide, Guide } from "@/contexts/GuideContext";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { GuideBookingForm } from "@/components/booking/GuideBookingForm";
import { getPublicSettingsApi } from "@/lib/api/finance";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Circle,
  Star,
  AlertCircle,
  Map,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { assets } from "@/public/assets/assets";
import { createBooking } from "@/lib/api/bookings";
import { poppins } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { getGuideReviewsApi } from "@/lib/api/reviews";

export default function GuideBookingPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { guides, loading } = useGuide();
  const { isLoggedIn } = useAuth();
  const { setCurrentBooking } = useBooking();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pricing, setPricing] = useState<{
    halfDayPrice?: number;
    fullDayPrice?: number;
  }>({});
  const [reviews, setReviews] = useState<any[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [selectedCertificateIndex, setSelectedCertificateIndex] = useState<
    number | null
  >(null);

  useEffect(() => {
    getPublicSettingsApi()
      .then((data: any) => {
        if (data?.guidePricing) {
          setPricing({
            halfDayPrice: data.guidePricing.halfDay.touristPrice,
            fullDayPrice: data.guidePricing.fullDay.touristPrice,
          });
        }
      })
      .catch((err) => console.error("Error fetching pricing", err));
  }, []);

  const guideId = params.id as string;
  const guide = guides.find((g: Guide) => g.id === guideId);

  useEffect(() => {
    if (guideId) {
      getGuideReviewsApi(guideId)
        .then((data: any) => {
          if (data && Array.isArray(data)) {
            const formatted = data.map((r: any) => ({
              reviewer: r.userId?.name || "Anonymous Traveler",
              date: r.createdAt
                ? new Date(r.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Recent review",
              comments: r.comments || "",
              rating: r.rating || 0,
            }));
            setReviews(formatted);
          } else {
            setReviews([]);
          }
        })
        .catch((err) => {
          console.error("Error fetching reviews:", err);
          setReviews([]);
        });
    }
  }, [guideId]);

  console.log(guide);
  console.log("recentReviews:", reviews);

  const isGuideAvailable = guide?.isAvailable;
  const certificates = guide?.certificates || [];
  const selectedCertificate =
    selectedCertificateIndex !== null
      ? certificates[selectedCertificateIndex]
      : null;

  const openCertificateViewer = (index: number) => {
    setSelectedCertificateIndex(index);
  };

  const closeCertificateViewer = () => {
    setSelectedCertificateIndex(null);
  };

  const showPreviousCertificate = () => {
    if (!certificates.length) return;
    setSelectedCertificateIndex((current) => {
      if (current === null) return certificates.length - 1;
      return current === 0 ? certificates.length - 1 : current - 1;
    });
  };

  const showNextCertificate = () => {
    if (!certificates.length) return;
    setSelectedCertificateIndex((current) => {
      if (current === null) return 0;
      return (current + 1) % certificates.length;
    });
  };

  if (!guideId) {
    router.replace("/tourist/guides");
    return null;
  }

  if (loading) {
    return (
      <main
        className={`${poppins.className} min-h-screen bg-slate-50 text-slate-950`}
      >
        <Header />
        <div className="flex min-h-[calc(100vh-96px)] items-center justify-center px-4 py-16">
          <Card className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/30">
            <p className="text-xl font-semibold text-slate-900">
              Loading guide details...
            </p>
          </Card>
        </div>
        <Footer />
      </main>
    );
  }

  if (!guide) {
    return notFound();
  }

  const handleProceedToPayment = async (formData: any) => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const bookingRes = await createBooking({
        guideId,
        ...formData,
      });
      const bookingData = bookingRes?.data || bookingRes;

      if (!bookingData) {
        throw new Error("Booking failed");
      }

      const normalizedBooking = {
        ...bookingData,
        id: bookingData._id || bookingData.id,
      };

      setCurrentBooking({
        ...normalizedBooking,
        paymentMethod: null,
      });
      // Redirect to booking confirmation page instead of payment
      router.push(
        `/tourist/booking-confirmation?bookingId=${normalizedBooking.id}`,
      );
    } catch (error: any) {
      console.error("Booking error:", error);
      const errorMessage = error.errors
        ? Object.values(error.errors).join(", ")
        : error.message || "An error occurred while creating the booking";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className={`${poppins.className} min-h-screen bg-slate-50 text-slate-950`}
    >
      <Header showBack={true} />

      <div className="px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/20">
            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
              <div className="flex flex-col gap-6">
                <div className="grid gap-4 sm:grid-cols-[160px_1fr] items-center">
                  <div className="relative aspect-square overflow-hidden rounded-[1.75rem] bg-slate-100 border shadow-sm border-border">
                    <Image
                      src={guide.avatar || assets.guideImage}
                      alt={guide.userId?.name || guide.name || "Guide profile"}
                      fill
                      className="object-cover"
                      sizes="160px"
                      unoptimized={
                        typeof guide.avatar === "string" &&
                        guide.avatar.startsWith("http")
                      }
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="min-w-0">
                        <p className="text-sm uppercase tracking-[0.3em] text-orange-600">
                          Guide profile
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold text-slate-950 break-words">
                          {guide.userId?.name || guide.name || "Guide"}
                        </h1>
                      </div>

                      <div className="rounded-full border border-slate-200 bg-green-500 px-3 py-1 text-xs text-white font-semibold uppercase tracking-[0.18em] text-slate-700">
                        {isGuideAvailable ? "Available" : "Unavailable"}
                      </div>
                    </div>
                    <h2 className="text-lg font-semibold text-slate-950">
                      About this guide
                    </h2>
                    <p className="text-slate-600 leading-7 break-words">
                      {guide.bio ||
                        "Your guide will deliver an insightful, safe, and memorable experience with local knowledge and personalized service."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-center flex flex-col justify-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Pricing
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {pricing?.halfDayPrice && pricing?.fullDayPrice ? (
                        <>
                          H: ₹{pricing.halfDayPrice} / F: ₹
                          {pricing.fullDayPrice}
                        </>
                      ) : (
                        <>Fixed Pricing</>
                      )}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Rating
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-slate-950">
                      {guide.rating?.toFixed(1) ?? "0.0"}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Experience
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-slate-950">
                      {guide.experience} yrs
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.24em] text-orange-600">
                  Quick details
                </p>
                <div className="mt-6 space-y-4 text-sm text-slate-600">
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="font-semibold text-slate-900">Specialities</p>
                    <p className="text-sm leading-7 text-slate-600">
                      {guide.specialities?.join(", ") ||
                        "Personalized local experiences in your destination."}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="font-semibold text-slate-900">
                      Languages covered
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {guide.languages?.map((lang: string) => (
                        <Badge
                          key={lang}
                          variant="secondary"
                          className="rounded-full px-3 py-1 text-sm text-slate-800 bg-orange-50 border-orange-100"
                        >
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {!isGuideAvailable && (
            <Alert className="rounded-[1.75rem] border border-amber-200 bg-amber-50 text-amber-900">
              <AlertDescription>
                {guide.isAvailable
                  ? "This guide is currently busy. You can still request a booking, and we will notify you when they are ready."
                  : "This guide is currently offline. Please check back later or choose another expert for instant booking."}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="rounded-[1.75rem] border border-red-200 bg-red-50 text-red-900">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
            <div className="space-y-6">
              <Card className="hidden md:block rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-950 mb-4">
                  What to expect
                </h3>
                <ul className="space-y-4 text-slate-600">
                  <li className="flex items-start gap-3">
                    <Circle className="mt-1 h-3 w-3 text-orange-500" />
                    <span>Private guided tour with local insights.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Circle className="mt-1 h-3 w-3 text-orange-500" />
                    <span>Flexible itinerary shaped by your interests.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Circle className="mt-1 h-3 w-3 text-orange-500" />
                    <span>Authentic recommendations beyond the guidebook.</span>
                  </li>
                </ul>
              </Card>

              {guide.certificates && guide.certificates.length > 0 && (
                <Card className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-950 mb-4">
                    Certificates
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {guide.certificates.map((cert, index) => (
                      <div
                        key={index}
                        className="border border-slate-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-slate-900">
                            {cert.name &&
                            !cert.name.match(
                              /\.(jpg|jpeg|png|webp|gif|pdf|avif)$/i,
                            ) &&
                            !cert.name.startsWith("http")
                              ? cert.name
                              : `Certificate ${index + 1}`}
                          </h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openCertificateViewer(index)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            <Card className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-orange-600">
                    Book the guide
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    Booking details
                  </h2>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                  {isGuideAvailable ? "Open" : "Request"}
                </div>
              </div>

              {!isLoggedIn ? (
                <div className="space-y-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="text-lg font-semibold text-slate-950">
                    Sign in to continue booking
                  </p>
                  <p className="text-sm leading-6 text-slate-600">
                    Please sign in to book this guide and continue from this
                    page.
                  </p>
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() =>
                      router.push(
                        `/login?redirect=${encodeURIComponent(pathname || "/")}`,
                      )
                    }
                  >
                    Sign in to book
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <GuideBookingForm
                    onSubmit={handleProceedToPayment}
                    isLoading={isSubmitting}
                  />
                  {!isGuideAvailable && (
                    <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] bg-white/70" />
                  )}
                </div>
              )}
            </Card>
          </div>

          <Card className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-950">
                  Reviews
                </h3>
                <p className="text-sm text-slate-500">
                  Verified traveler feedback and ratings.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700">
                <Star className="h-4 w-4" />
                {guide.rating?.toFixed(1) ?? "0.0"}
              </div>
            </div>
            <div className="text-slate-600">{guide.totalReviews || reviews.length} reviews</div>
            <div className="mt-6 space-y-6">
              {reviews && reviews.length > 0 ? (
                (showAllReviews ? reviews : reviews.slice(0, 5)).map((review, index) => (
                  <div key={index} className="border-b border-slate-200 pb-6">
                    <div className="flex items-center gap-4">
                      <div>
                        <h4 className="font-semibold text-slate-950">
                          {review.reviewer}
                        </h4>
                        <p className="text-sm text-slate-500">{review.date}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-slate-600">{review.comments}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">No reviews yet.</p>
              )}
            </div>
            {reviews.length > 5 && (
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="rounded-full px-6 border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  {showAllReviews ? "View Less" : `View All Reviews (${reviews.length})`}
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
      {selectedCertificate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={closeCertificateViewer}
        >
          <div
            className="relative w-full max-w-5xl rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeCertificateViewer}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Close certificate viewer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {selectedCertificate.name &&
                  !selectedCertificate.name.match(
                    /\.(jpg|jpeg|png|webp|gif|pdf|avif)$/i,
                  ) &&
                  !selectedCertificate.name.startsWith("http")
                    ? selectedCertificate.name
                    : `Certificate ${selectedCertificateIndex! + 1}`}
                </p>
                <p className="text-sm text-slate-500">
                  {selectedCertificateIndex! + 1} of {certificates.length}
                </p>
              </div>
            </div>

            <div className="relative flex min-h-[60vh] items-center justify-center rounded-[1rem] bg-slate-50 p-2">
              <button
                type="button"
                onClick={showPreviousCertificate}
                disabled={certificates.length <= 1}
                className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Previous certificate"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={showNextCertificate}
                disabled={certificates.length <= 1}
                className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Next certificate"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {selectedCertificate.image?.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={selectedCertificate.image}
                  title="Certificate preview"
                  className="h-[70vh] w-full rounded-[0.8rem] border border-slate-200"
                />
              ) : (
                <img
                  src={selectedCertificate.image}
                  alt={
                    selectedCertificate.name || `Certificate ${selectedCertificateIndex! + 1}`
                  }
                  className="max-h-[75vh] w-full rounded-[0.8rem] object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
