"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBooking } from "@/contexts/BookingsContext";
import { usePayment } from "@/contexts/PaymentContext";
import { getBookingsById } from "@/lib/api/bookings";
import {
  setPaymentModeApi,
  createRazorpayOrderApi,
  getBookingPaymentsApi,
} from "@/lib/api/payments";
import { getBookingRefundsApi, type Refund } from "@/lib/api/refunds";

import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import TermsAndConditions from "@/components/common/TermsAndConditions";
import { BookingSummaryCard } from "@/components/booking/BookingSummaryCard";
import {
  BookingPaymentOptions,
  type BookingPaymentMode,
} from "@/components/booking/BookingPaymentOptions";
import { PriceBreakdown } from "@/components/booking/PriceBreakdown";
import { SuccessConfirmation } from "@/components/booking/SuccessConfirmation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import TouristLoader from "@/components/common/TouristLoader";
import { Suspense } from "react";
import { getPaymentStatusLabel } from "@/lib/payment-status";

function formatRupee(n: number) {
  return String(Math.round(n));
}

/** Razorpay prefill expects a 10-digit Indian mobile (digits only). */
function normalizeIndiaContact(phone?: string): string | undefined {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  return undefined;
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    if ((window as unknown as { Razorpay?: unknown }).Razorpay) {
      return resolve();
    }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(s);
  });
}

function PaymentPageContent() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [agreed, setAgreed] = useState(false);

  const { processPayment } = usePayment();
  const { currentBooking, setCurrentBooking, refreshBookings } = useBooking();

  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [selectedMode, setSelectedMode] = useState<BookingPaymentMode | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [refundHistory, setRefundHistory] = useState<Refund[]>([]);

  const booking = currentBooking || bookingDetails;

  const refreshBooking = useCallback(
    async (id: string) => {
      const data = await getBookingsById(id);
      if (!data) return;
      const normalized = { ...data, id: data._id || data.id };
      setBookingDetails(normalized);
      setCurrentBooking(normalized);
    },
    [setCurrentBooking],
  );

  useEffect(() => {
    if (!bookingId) {
      router.replace("/");
      return;
    }

    // Validate bookingId format
    if (!/^[0-9a-fA-F]{24}$/.test(bookingId)) {
      console.error("Invalid booking ID format:", bookingId);
      router.replace("/");
      return;
    }

    if (currentBooking?.id === bookingId) {
      return;
    }

    const fetchBooking = async () => {
      try {
        await refreshBooking(bookingId);
      } catch (e) {
        console.log("Failed to load booking by URL:", e);
        router.replace("/");
      }
    };

    fetchBooking();
  }, [bookingId, currentBooking, router, refreshBooking]);

  useEffect(() => {
    if (!booking) return;
    if (booking.paymentType === "FULL") setSelectedMode("FULL");
    else if (booking.paymentType === "PARTIAL") setSelectedMode("PARTIAL");
    else if (booking.paymentType === "COD") setSelectedMode("COD");
  }, [booking?.paymentType]);

  useEffect(() => {
    if (!bookingId) return;
    const loadHistory = async () => {
      try {
        const [payments, refunds] = await Promise.all([
          getBookingPaymentsApi(bookingId),
          getBookingRefundsApi(bookingId),
        ]);
        setPaymentHistory(Array.isArray(payments) ? payments : []);
        setRefundHistory(Array.isArray(refunds) ? refunds : []);
      } catch {
        setPaymentHistory([]);
        setRefundHistory([]);
      }
    };
    loadHistory();
  }, [bookingId, booking?.paymentStatus, booking?.paidAmount]);

  if (!bookingId) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div>Booking ID missing. Redirecting...</div>
      </main>
    );
  }

  if (!booking) {
    return <TouristLoader fullScreen text="Loading booking details..." />;
  }

  if (paymentComplete) {
    return <SuccessConfirmation />;
  }

  if (booking.status !== "ACCEPTED") {
    const pendingMessage =
      booking.bookingType === "PACKAGE"
        ? "Payment will be available once admin approves your package booking."
        : "Payment opens after your guide or driver accepts this booking.";

    return (
      <main className="min-h-screen flex flex-col bg-background">
        <Header showBack={true} />
        <div className="flex-1 px-4 py-8 max-w-lg mx-auto">
          <Card className="p-6">
            <p className="text-foreground">
              {pendingMessage} Current status:{" "}
              <span className="font-semibold">{booking.status}</span>
            </p>
            <Button
              className="mt-4"
              onClick={() => router.push("/tourist/bookings")}
            >
              Back to bookings
            </Button>
          </Card>
        </div>
        <Footer />
      </main>
    );
  }

  // CRITICAL: Always use backend-calculated amounts - never calculate locally
  // This prevents amount mismatches between frontend and backend
  const originalPrice = booking.originalPrice ?? booking.totalPrice ?? 0;
  const paidAmount = booking.paidAmount ?? 0;

  // Use backend-calculated values only - no local calculations
  let discountDisplay = booking.discount ?? 0;
  let gstAmount = booking.gstAmount ?? 0;
  let finalDisplay = booking.finalPrice ?? booking.totalPrice ?? 0;

  // If payment mode not set yet, show preview using backend pricing logic
  // But don't use these for actual payment - backend will recalculate
  if (!booking.paymentType && selectedMode) {
    const isFull = selectedMode === "FULL";
    const discountPercent = isFull ? 0.1 : (selectedMode === "PARTIAL" ? 0.05 : 0);
    discountDisplay = Math.round(originalPrice * discountPercent);
    const afterDiscount = originalPrice - discountDisplay;
    gstAmount = Math.round(afterDiscount * 0.0);
    finalDisplay = Math.round(afterDiscount + gstAmount);
  }

  // Always use backend remainingAmount if available
  const remainingAmount =
    booking.remainingAmount != null
      ? Math.round(booking.remainingAmount)
      : Math.max(0, Math.round(finalDisplay - paidAmount));

  // Backend `finalPrice` is GST-inclusive.
  const roundedOriginal = Math.round(originalPrice);
  const roundedPaid = Math.round(paidAmount);
  const roundedDiscount = Math.round(discountDisplay || 0);
  const roundedTotal = Math.round(finalDisplay || 0);

  const priceItems: { label: string; amount: number }[] = [
    { label: "Original price", amount: roundedOriginal },
    ...(roundedDiscount > 0
      ? [{ label: "Discount", amount: -roundedDiscount }]
      : []),
    { label: "GST (0%)", amount: gstAmount },
    { label: "Paid", amount: roundedPaid },
  ];
  // GST is included in the service amount

  const handlePay = async () => {
    if (!bookingId) {
      setError("Invalid booking ID");
      return;
    }
    // If booking already has partial payment, allow paying remaining without reselecting mode
    const isPayingRemaining = booking.paymentStatus === "PARTIAL";
    if (!isPayingRemaining && !selectedMode) {
      setError("Please choose how you want to pay.");
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token || token === "null" || token === "undefined") {
      setError("You must be logged in to make a payment");
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      console.log("Booking data:", booking);
      if (!booking || booking.status !== "ACCEPTED") {
        setError("Booking is not ready for payment");
        return;
      }

      // CRITICAL: Always use backend-calculated finalPrice after setting payment mode
      // Backend will recalculate pricing based on selected mode
      const finalPrice = booking.finalPrice ?? booking.totalPrice ?? 0;
      if (finalPrice <= 0) {
        setError("Booking has invalid pricing data");
        return;
      }

      const remaining = finalPrice - (booking.paidAmount ?? 0);
      if (remaining <= 0) {
        setError("Booking is already fully paid");
        return;
      }

      console.log("💰 Payment amount validation:", {
        finalPrice,
        paidAmount: booking.paidAmount,
        remaining,
        paymentType: booking.paymentType,
        selectedMode,
      });

      // Only set payment mode when user explicitly chose a mode.
      if (!isPayingRemaining) {
        console.log(
          "Setting payment mode:",
          selectedMode,
          "for booking:",
          bookingId,
        );
        const updated = await setPaymentModeApi(bookingId, selectedMode as any);
        console.log("Payment mode set successfully:", updated);
        const merged = {
          ...booking,
          ...updated,
          id: updated._id || booking.id,
        };
        setBookingDetails(merged);
        setCurrentBooking(merged);

        if (selectedMode === "COD") {
          await refreshBookings();
          router.push("/tourist/bookings");
          return;
        }
      }

      console.log("Creating Razorpay order for booking:", bookingId, {
        isPayingRemaining,
      });
      const orderPayload = await createRazorpayOrderApi(
        bookingId,
        isPayingRemaining ? { paymentType: "REMAINING" } : {},
      );
      console.log("Razorpay order created:", orderPayload);
      const paymentMongoId =
        orderPayload?.payment?._id ?? orderPayload?.payment?.id;
      const orderId = orderPayload?.orderId;
      const keyId = orderPayload?.keyId;
      const amount = orderPayload?.amount as number;

      if (!paymentMongoId || !orderId || !keyId) {
        throw new Error("Could not start Razorpay checkout");
      }

      await loadRazorpayScript();

      const RazorpayConstructor = (
        window as unknown as {
          Razorpay: new (opts: Record<string, unknown>) => { open: () => void };
        }
      ).Razorpay;

      await new Promise<void>((resolve, reject) => {
        // CRITICAL FIX: Ensure consistent paise conversion
        // Round to nearest rupee first, then convert to paise
        const amountPaise =
          typeof amount === "number" ? Math.round(Math.round(amount) * 100) : undefined;

        console.log("💰 FRONTEND PAISE CONVERSION:", {
          amount,
          roundedAmount: Math.round(amount),
          amountPaise,
        });

        const options: Record<string, unknown> = {
          key: keyId,
          currency: "INR",

          name: "GoGuide",
          description: "Booking Payment",

          order_id: orderId, // this is enough

          handler: async function (response: any) {
            try {
              console.log("Payment success:", response);

              await processPayment(paymentMongoId, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              setPaymentComplete(true);

              await refreshBooking(bookingId!);
              await refreshBookings();

              resolve();
            } catch (err) {
              console.error("Payment verify failed:", err);
              reject(err);
            }
          },

          prefill: {
            name: booking.touristName || "User",
            email: booking.email || "test@test.com",
          },

          theme: {
            color: "#3399cc",
          },
        };

        console.log("Razorpay checkout options:", {
          key: keyId,
          amount: amountPaise,
          currency: "INR",
          order_id: orderId,
        });

        const rzp = new RazorpayConstructor(options);
        rzp.open();
      });
    } catch (e: unknown) {
      console.error(e);
      setError(
        e instanceof Error ? e.message : "Payment could not be completed",
      );
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
          <BookingSummaryCard
            itemName={booking?.tourType || ""}
            itemPrice={roundedTotal}
            itemType="guide"
          />

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">
              Payment status:
            </span>
            <Badge variant="secondary">{getPaymentStatusLabel(booking)}</Badge>
          </div>

          {booking.paymentStatus !== "PARTIAL" ? (
            <Card className="p-6">
              <BookingPaymentOptions
                value={selectedMode}
                onChange={setSelectedMode}
                disabled={isProcessing}
              />
            </Card>
          ) : (
            <Card className="p-6">
              <h3 className="text-lg font-semibold">Remaining payment</h3>
              <p className="text-sm text-muted-foreground mt-2">
                You have already paid ₹{formatRupee(booking.paidAmount ?? 0)}.
                Remaining amount:{" "}
                <span className="font-medium">
                  ₹{formatRupee(booking.remainingAmount ?? 0)}
                </span>
              </p>
            </Card>
          )}

          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">Amounts</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Original price</span>
                <span>₹{formatRupee(originalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Final price (offer)
                </span>
                <span className="font-medium">
                  ₹{formatRupee(finalDisplay)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid</span>
                <span>₹{formatRupee(paidAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-muted-foreground">Remaining</span>
                <span>₹{formatRupee(finalDisplay - paidAmount)}</span>
              </div>
              {discountDisplay > 0 && (
                <p className="text-sm text-green-600 dark:text-green-400 pt-2">
                  You saved ₹{formatRupee(discountDisplay)} with full-payment
                  offer.
                </p>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Price breakdown</h3>
            <PriceBreakdown
              items={priceItems}
              total={roundedTotal}
              paymentStatus={booking.paymentStatus}
              remainingAmount={Math.max(
                0,
                Math.round(roundedTotal - roundedPaid),
              )}
            />
          </Card>

          <Card className="p-4 bg-secondary/5 border-secondary/20">
            <div className="flex gap-3">
              <Lock className="h-5 w-5 text-secondary mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-semibold">Secure payment</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Online payments are processed by Razorpay. Cash on delivery is
                  settled directly with your guide or driver.
                </p>
              </div>
            </div>
          </Card>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="space-y-3">
            <div className="hidden md:block">
              <TermsAndConditions checked={agreed} onChange={setAgreed} />
            </div>
            <div className="md:hidden">
              <TermsAndConditions checked={agreed} onChange={setAgreed} />
            </div>

            <Button
              onClick={handlePay}
              disabled={
                isProcessing ||
                (booking.paymentStatus !== "PARTIAL" && !selectedMode) ||
                // require agreement for online payments (not COD)
                !agreed
              }
              className="w-full h-12 text-base font-semibold cursor-pointer"
            >
              {isProcessing ? (
                <TouristLoader inline size={20} text="Processing..." />
              ) : booking.paymentStatus === "PARTIAL" ? (
                `Pay Remaining`
              ) : selectedMode === "COD" ? (
                "Confirm cash on delivery"
              ) : (
                `Pay with Razorpay`
              )}
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<TouristLoader fullScreen text="Loading..." />}>
      <PaymentPageContent />
    </Suspense>
  );
}
