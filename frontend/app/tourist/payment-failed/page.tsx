"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { getBookingsById } from "@/lib/api/bookings";
import { getBookingPaymentsApi, retryPaymentApi } from "@/lib/api/payments";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Loader2, Home } from "lucide-react";
import Link from "next/link";

interface BookingData {
  id: string;
  touristName: string;
  totalPrice: number;
  finalPrice?: number;
  paidAmount?: number;
  paymentStatus: string;
  status: string;
  _id?: string;
}

interface PaymentData {
  _id: string;
  amount: number;
  status: string;
  failureReason?: string;
  paymentMethod?: string;
  createdAt: string;
}

function PaymentFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryError, setRetryError] = useState<string | null>(null);

  // Extract failure reason from failed payment
  const failedPayment = payments.find(
    (p) => p.status === "FAILED" || p.status === "PENDING"
  );
  const failureReason = failedPayment?.failureReason || 
    "Payment could not be processed. Please try again or use a different payment method.";

  // Fetch booking and payment data
  useEffect(() => {
    if (!bookingId) {
      setLoadError("Booking ID not found. Redirecting...");
      setTimeout(() => router.push("/"), 2000);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        console.log("[PAYMENT_FAILED_PAGE] Fetching booking:", bookingId);

        // Fetch booking data
        const bookingData = await getBookingsById(bookingId);
        if (!bookingData) {
          throw new Error("Booking not found");
        }

        const normalizedBooking = {
          ...bookingData,
          id: bookingData._id || bookingData.id,
        };
        setBooking(normalizedBooking);

        console.log("[PAYMENT_FAILED_PAGE] Booking fetched:", {
          touristName: normalizedBooking.touristName,
          totalPrice: normalizedBooking.totalPrice,
          paymentStatus: normalizedBooking.paymentStatus,
        });

        // Fetch payment history
        try {
          const paymentHistory = await getBookingPaymentsApi(bookingId);
          setPayments(Array.isArray(paymentHistory) ? paymentHistory : []);
          console.log("[PAYMENT_FAILED_PAGE] Payments fetched:", {
            count: paymentHistory?.length,
            statuses: paymentHistory?.map((p: { status: any; }) => p.status),
          });
        } catch (paymentError) {
          console.warn("[PAYMENT_FAILED_PAGE] Failed to fetch payments:", paymentError);
          // Don't fail the page if payments fetch fails
          setPayments([]);
        }
      } catch (error: any) {
        console.error("[PAYMENT_FAILED_PAGE] Data fetch error:", {
          errorMessage: error?.message,
          fullError: error,
        });

        const errorMsg =
          error?.message ||
          "Failed to load booking details. Please try again.";
        setLoadError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [bookingId, router]);

  const handleRetry = async () => {
    if (isRetrying || !booking || !failedPayment) return;

    setIsRetrying(true);
    setRetryError(null);

    try {
      console.log("[PAYMENT_FAILED_PAGE] Retrying payment:", {
        bookingId,
        paymentId: failedPayment._id,
      });

      // Trigger retry payment API
      await retryPaymentApi(failedPayment._id);

      console.log("[PAYMENT_FAILED_PAGE] Retry successful, redirecting to payment page");

      // Redirect to payment page with booking ID
      router.push(`/tourist/payment?bookingId=${bookingId}`);
    } catch (error: any) {
      console.error("[PAYMENT_FAILED_PAGE] Retry payment failed:", {
        errorMessage: error?.message,
        fullError: error,
      });

      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Could not retry payment. Please try again.";
      setRetryError(errorMsg);
      setIsRetrying(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col bg-background">
        <Header showBack={false} hideHome={true} />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Loading payment details...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // Show error state
  if (loadError && !booking) {
    return (
      <main className="min-h-screen flex flex-col bg-background">
        <Header showBack={false} hideHome={true} />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full text-center space-y-6">
            <div className="flex justify-center">
              <AlertCircle className="h-16 w-16 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Unable to Load Booking
              </h1>
              <p className="text-muted-foreground">{loadError}</p>
            </div>
            <div className="space-y-3 pt-4">
              <Button
                onClick={() => router.push("/")}
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Go to Home
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // Show payment failed state
  if (!booking) {
    return (
      <main className="min-h-screen flex flex-col bg-background">
        <Header showBack={false} hideHome={true} />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full text-center">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Booking Not Found
            </h1>
            <p className="text-muted-foreground mb-6">
              The booking details could not be retrieved.
            </p>
            <Button onClick={() => router.push("/")} className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Go to Home
            </Button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // Calculate remaining amount
  const finalPrice = booking.finalPrice ?? booking.totalPrice ?? 0;
  const paidAmount = booking.paidAmount ?? 0;
  const remainingAmount = Math.max(0, finalPrice - paidAmount);

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Header showBack={false} hideHome={true} />

      <div className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <AlertCircle className="h-20 w-20 text-destructive" />
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-center text-foreground mb-2">
            Payment Failed
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Unfortunately, your payment could not be processed. Please try again
            or use a different payment method.
          </p>

          {/* Error Details */}
          <Card className="p-6 mb-6 bg-destructive/5 border-destructive/20">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tourist Name</p>
                <p className="font-semibold text-foreground capitalize">
                  {booking.touristName || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                <p className="font-semibold text-foreground">
                  ₹{Math.round(finalPrice).toLocaleString()}
                </p>
              </div>

              {paidAmount > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Already Paid
                  </p>
                  <p className="font-semibold text-green-600">
                    ₹{Math.round(paidAmount).toLocaleString()}
                  </p>
                </div>
              )}

              {remainingAmount > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Remaining Amount
                  </p>
                  <p className="font-semibold text-destructive">
                    ₹{Math.round(remainingAmount).toLocaleString()}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
                <p className="font-semibold text-destructive capitalize">
                  {booking.paymentStatus || "FAILED"}
                </p>
              </div>

              {failureReason && (
                <div className="pt-4 border-t border-destructive/20">
                  <p className="text-sm text-destructive font-medium">
                    Failure Reason:
                  </p>
                  <p className="text-sm text-destructive mt-1">
                    {failureReason}
                  </p>
                </div>
              )}

              {!failureReason && (
                <div className="pt-4 border-t border-destructive/20">
                  <p className="text-sm text-destructive">
                    Your booking is not confirmed. Please retry the payment to
                    complete your booking.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Retry Error Message */}
          {retryError && (
            <Card className="p-4 mb-6 bg-destructive/10 border-destructive/30">
              <p className="text-sm text-destructive">
                <span className="font-semibold">Retry Failed:</span> {retryError}
              </p>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              className="w-full bg-secondary hover:bg-secondary/90"
              onClick={handleRetry}
              disabled={isRetrying || !failedPayment}
              size="lg"
            >
              {isRetrying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {!failedPayment && "No Failed Payment"}
                  {failedPayment && "Retry Payment"}
                </>
              )}
            </Button>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full" size="lg">
                Go to Home
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <Card className="p-4 mt-8 bg-muted/50 border-0">
            <p className="text-sm text-muted-foreground text-center">
              Need help? Contact our support team at{" "}
              <a
                href="mailto:support@goguide.in"
                className="text-primary font-semibold hover:underline"
              >
                support@goguide.in
              </a>
            </p>
          </Card>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex flex-col bg-background">
        <Header showBack={false} hideHome={true} />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
        <Footer />
      </main>
    }>
      <PaymentFailedContent />
    </Suspense>
  );
}
