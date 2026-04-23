"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  MapPin,
  Clock,
  Users,
  DollarSign,
  IndianRupee,
} from "lucide-react";
import { useBooking } from "@/contexts/BookingsContext";
import { useGuide } from "@/contexts/GuideContext";
import { poppins } from "@/lib/fonts";
import Image from "next/image";
import { assets } from "@/public/assets/assets";

function BookingConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentBooking } = useBooking();
  const { guides } = useGuide();
  const [guide, setGuide] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const bookingId = searchParams.get("bookingId");
  const guideId = currentBooking?.guideId;

  useEffect(() => {
    if (!currentBooking || !bookingId) {
      router.push("/tourist/guides");
      return;
    }

    const foundGuide = guides.find((g: any) => g.id === guideId);
    if (foundGuide) {
      setGuide(foundGuide);
    }

    setLoading(false);
  }, [currentBooking, bookingId, guideId, guides, router]);

  const handleMakePayment = () => {
    router.push(`/tourist/payment?bookingId=${bookingId}`);
  };

  if (loading || !currentBooking) {
    return (
      <main
        className={`${poppins.className} min-h-screen bg-slate-50 text-slate-950`}
      >
        <Header />
        <div className="flex min-h-[calc(100vh-96px)] items-center justify-center px-4 py-16">
          <Card className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl">
            <p className="text-xl font-semibold text-slate-900">
              Loading booking details...
            </p>
          </Card>
        </div>
        <Footer />
      </main>
    );
  }

  const bookingDateStr =
    currentBooking.date ||
    currentBooking.bookingDate ||
    new Date().toISOString();
  const bookingDate = new Date(bookingDateStr).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main
      className={`${poppins.className} min-h-screen bg-slate-50 text-slate-950`}
    >
      <Header showBack={true} />

      <div className="px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl space-y-8">
          {/* Success Banner */}
          <section className="rounded-[2rem] border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-8 shadow-lg">
            <div className="flex items-start gap-4">
              <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h1 className="text-3xl font-semibold text-slate-950">
                  Booking Confirmed! 🎉
                </h1>
                <p className="mt-2 text-slate-600">
                  Your tour reservation has been successfully created. Proceed
                  to payment to complete your booking.
                </p>
              </div>
            </div>
          </section>

          {/* Booking Details */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-950">
                Booking Details
              </h2>
              <Badge className="bg-blue-100 text-blue-800 border-0">
                Booking ID: {bookingId?.slice(0, 8)}...
              </Badge>
            </div>

            <div className="grid gap-6">
              {/* Guide Info */}
              <Card className="border border-slate-200 p-6">
                <p className="mb-4 text-sm uppercase tracking-[0.24em] text-orange-600">
                  Your Guide
                </p>
                <div className="flex gap-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-slate-100 flex-shrink-0">
                    <Image
                      src={guide?.avatar || assets.guideImage}
                      alt={guide?.name || "Guide Image"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-950">
                      {guide?.name}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {guide?.specialities?.join(", ") || "Tour Guide"}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Badge variant="secondary" className="text-xs">
                        ⭐ {(guide?.rating || 0).toFixed(1)}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {guide?.experience || 0}+ yrs
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Tour Details */}
              <Card className="w-full border border-slate-200 p-6">
                <p className="mb-4 text-sm uppercase tracking-[0.24em] text-orange-600">
                  Tour Details
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-xs text-slate-500">Date & Time</p>
                      <p className="font-semibold text-slate-900">
                        {bookingDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-xs text-slate-500">Participants</p>
                      <p className="font-semibold text-slate-900">
                        {currentBooking.participants || 1} person(s)
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Location Info */}
              <Card className="border border-slate-200 p-6 md:col-span-2">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-orange-500 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                      Meeting Location
                    </p>
                    <p className="mt-1 font-semibold text-slate-950">
                      {currentBooking.meetingPoint}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                      DropOff Location
                    </p>
                    <p className="mt-1 font-semibold text-slate-950">
                      {currentBooking.dropoffLocation}
                    </p>
                  </div>
                </div>
              </Card>
              {/* Additional Notes */}
              {currentBooking.notes && (
                <Card className="border border-slate-200 p-6 md:col-span-2">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500 mb-2">
                    Special Requests
                  </p>
                  <p className="text-slate-800 italic">
                    {currentBooking.notes}
                  </p>
                </Card>
              )}
            </div>
          </section>

          {/* Price Breakdown */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg">
            <h2 className="mb-6 text-2xl font-semibold text-slate-950">
              Price Breakdown
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5 text-orange-500" />
                  <span className="text-slate-700">
                    {guide?.name || "Guide"}
                  </span>
                </div>
                <span className="font-semibold text-slate-950">
                  ₹{currentBooking.totalPrice || guide?.price || 0}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-orange-50 p-4">
                <span className="font-semibold text-slate-950">
                  Total Amount
                </span>
                <span className="text-2xl font-bold text-orange-600">
                  ₹{currentBooking.totalPrice || guide?.price || 0}
                </span>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1 rounded-3xl px-6 py-3 text-base"
              onClick={() => router.push("/tourist/guides")}
            >
              Your Bookings
            </Button>
            <Button
              className="flex-1 rounded-3xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-base text-white hover:shadow-lg"
              onClick={handleMakePayment}
            >
              Proceed to Payment
            </Button>
          </div>

          {/* Info Box */}
          <Card className="border border-blue-100 bg-blue-50 p-6">
            <p className="text-sm leading-6 text-slate-700">
              <span className="font-semibold">Payment Information:</span> You'll
              be taken to our secure payment gateway. We accept credit/debit
              cards, UPI, and net banking. Your booking will be confirmed once
              payment is successful.
            </p>
          </Card>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense
      fallback={
        <main
          className={`${poppins.className} min-h-screen bg-slate-50 text-slate-950`}
        >
          <Header />
          <div className="flex min-h-[calc(100vh-96px)] items-center justify-center px-4 py-16">
            <Card className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl">
              <p className="text-xl font-semibold text-slate-900">Loading...</p>
            </Card>
          </div>
          <Footer />
        </main>
      }
    >
      <BookingConfirmationContent />
    </Suspense>
  );
}
