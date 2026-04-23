"use client";

import { useRouter } from "next/navigation";
import { useBooking } from "@/contexts/BookingsContext";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentFailedPage() {
  const router = useRouter();
  const { currentBooking } = useBooking();

  const handleRetry = () => {
    router.push("/tourist/payment");
  };

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
                <p className="text-sm text-muted-foreground mb-1">Service</p>
                <p className="font-semibold text-foreground capitalize">
                  {currentBooking?.touristName || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Amount</p>
                <p className="font-semibold text-foreground">
                  ₹{currentBooking?.totalPrice || 0}
                </p>
              </div>

              <div className="pt-4 border-t border-destructive/20">
                <p className="text-sm text-destructive">
                  Your booking is not confirmed. Please retry the payment to
                  complete your booking.
                </p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              className="w-full bg-secondary hover:bg-secondary/90"
              onClick={handleRetry}
            >
              Retry Payment
            </Button>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                Cancel Booking
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <Card className="p-4 mt-8 bg-muted/50 border-0">
            <p className="text-sm text-muted-foreground text-center">
              Need help? Contact our support team at{" "}
              <a
                href="mailto:support@ayodhyatourism.com"
                className="text-primary font-semibold hover:underline"
              >
                support@goguide.com
              </a>
            </p>
          </Card>
        </div>
      </div>

      <Footer />
    </main>
  );
}
