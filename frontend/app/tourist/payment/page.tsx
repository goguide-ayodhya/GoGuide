"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBooking } from "@/contexts/BookingsContext";
import { usePayment } from "@/contexts/PaymentContext";
import { getBookingsById } from "@/lib/api/bookings";

import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { BookingSummaryCard } from "@/components/booking/BookingSummaryCard";
import { PaymentMethodSelector } from "@/components/booking/PaymentMethodSelector";
import { PriceBreakdown } from "@/components/booking/PriceBreakdown";
import { SuccessConfirmation } from "@/components/booking/SuccessConfirmation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Lock } from "lucide-react";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const { processPayment, createPayment } = usePayment();
  const { currentBooking, setCurrentBooking, setPaymentMethod } = useBooking();

  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const booking = currentBooking || bookingDetails;

  useEffect(() => {
    console.log("bookingId from URL:", bookingId);

    if (!bookingId) {
      router.replace("/");
      return;
    }

    if (currentBooking?.id === bookingId) {
      return;
    }

    const fetchBooking = async () => {
      try {
        const data = await getBookingsById(bookingId);
        if (!data) {
          return;
        }

        const normalizedBooking = {
          ...data,
          id: data._id || data.id,
        };

        setBookingDetails(normalizedBooking);
        setCurrentBooking(normalizedBooking);
      } catch (error) {
        console.log("Failed to load booking by URL:", error);
      }
    };

    fetchBooking();
  }, [bookingId, currentBooking, router, setCurrentBooking]);

  if (!bookingId) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div>Booking ID missing. Redirecting...</div>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div>Loading booking details...</div>
      </main>
    );
  }

  // ✅ success condition
  if (paymentComplete) {
    return <SuccessConfirmation />;
  }

  // ✅ price calc
  const basePrice = booking?.totalPrice || 0;
  const taxAmount = Math.round(basePrice * 0.18);
  const totalAmount = basePrice + taxAmount;

  const priceItems = [
    { label: "Service Charge", amount: basePrice },
    { label: "GST (18%)", amount: taxAmount },
  ];

  // ✅ payment handler
  const handlePayment = async () => {
    if (!bookingId) return;

    setIsProcessing(true);

    try {
      const paymentResponse = await createPayment(bookingId);
      const paymentId =
        paymentResponse?.payment?._id || paymentResponse?._id || paymentResponse?.paymentId;

      console.log("Created payment for bookingId:", bookingId, "paymentId:", paymentId);

      if (!paymentId) {
        throw new Error("Payment creation failed");
      }

      await processPayment(paymentId);
      setPaymentComplete(true);

      router.push("/tourist/payment-success");
    } catch (error) {
      console.log("Error processing payment for bookingId:", bookingId, error);
      router.push("/tourist/payment-failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Header showBack={true} />

      <div className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* ✅ Booking Summary */}
          <BookingSummaryCard
            itemName={booking?.tourType || ""}
            itemPrice={booking?.totalPrice || 0}
            // itemImage={booking?.guideId?.avatar || assets.guideImage}
            itemType="guide"
          />

          {/* ✅ Payment Method */}
          <Card className="p-6">
            <PaymentMethodSelector
              value={booking?.paymentMethod as "upi" | "card" | null}
              onChange={setPaymentMethod}
            />
          </Card>

          {/* ✅ Price */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Price Breakdown</h3>
            <PriceBreakdown items={priceItems} total={totalAmount} />
          </Card>

          {/* ✅ Security */}
          <Card className="p-4 bg-secondary/5 border-secondary/20">
            <div className="flex gap-3">
              <Lock className="h-5 w-5 text-secondary mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold">Secure Payment</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your payment is encrypted and secured.
                </p>
              </div>
            </div>
          </Card>

          {/* ✅ Pay Button */}
          <Button
            onClick={handlePayment}
            // disabled={!currentBooking?.paymentMethod || isProcessing}
            className="w-full h-12 text-base font-semibold cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ₹${totalAmount}`
            )}
          </Button>
        </div>
      </div>

      <Footer />
    </main>
  );
}
