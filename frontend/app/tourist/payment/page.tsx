"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBooking } from "@/contexts/BookingsContext";
import { usePayment } from "@/contexts/PaymentContext";

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
  const paymentId = searchParams.get("paymentId");

  const { processPayment } = usePayment();
  const { currentBooking, setPaymentMethod } = useBooking();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  // ✅ redirect properly
  useEffect(() => {
    if (!paymentId) {
      router.push("/");
    }
  }, [paymentId, router]);

  // ✅ success condition
  if (paymentComplete || currentBooking?.status === "CONFIRMED") {
    return <SuccessConfirmation />;
  }

  // ✅ price calc
  const basePrice = currentBooking?.totalPrice || 0;
  const taxAmount = Math.round(basePrice * 0.18);
  const totalAmount = basePrice + taxAmount;

  const priceItems = [
    { label: "Service Charge", amount: basePrice },
    { label: "GST (18%)", amount: taxAmount },
  ];

  // ✅ payment handler
  const handlePayment = async () => {
    if (!paymentId) return;

    setIsProcessing(true);

    try {
      await processPayment(paymentId);
      setPaymentComplete(true);

      router.push("/tourist/payment-success");
    } catch (error) {
      router.push("/tourist/payment-failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Header showBack={true} title="Payment" />

      <div className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* ✅ Booking Summary */}
          <BookingSummaryCard
            itemName={currentBooking?.tourType || ""}
            itemPrice={currentBooking?.totalPrice || 0}
            // itemImage={currentBooking?.guideId?.avatar || assets.guideImage}
            itemType="guide"
          />

          {/* ✅ Payment Method */}
          <Card className="p-6">
            <PaymentMethodSelector
              value={currentBooking?.paymentMethod as "upi" | "card" | null}
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
