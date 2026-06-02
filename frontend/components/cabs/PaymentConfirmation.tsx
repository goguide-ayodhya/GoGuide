"use client";

import { useState } from "react";
import { DollarSign, MapPin, Navigation, Clock, CreditCard, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { confirmPayment } from "@/lib/api/rides";

interface PaymentConfirmationProps {
  ride: any;
  onPaymentConfirmed: (paymentMethod: string) => void;
  onCancel?: () => void;
}

export default function PaymentConfirmation({
  ride,
  onPaymentConfirmed,
  onCancel,
}: PaymentConfirmationProps) {
  const [selectedMethod, setSelectedMethod] = useState<"cash" | "card" | "wallet">("cash");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const pickup = ride?.pickup || "";
  const destination = ride?.destination || "";
  const fare = ride?.fare || 0;
  
  // Format distance from meters to km
  const distanceInMeters = ride?.distance || 0;
  const distance = distanceInMeters > 0 
    ? `${(distanceInMeters / 1000).toFixed(1)} km` 
    : "Unknown";
  
  // Format duration from seconds to minutes/hours
  const durationInSeconds = ride?.duration || 0;
  let duration = "Unknown";
  if (durationInSeconds > 0) {
    if (durationInSeconds < 3600) {
      duration = `${Math.floor(durationInSeconds / 60)} min`;
    } else {
      const hours = Math.floor(durationInSeconds / 3600);
      const minutes = Math.floor((durationInSeconds % 3600) / 60);
      duration = `${hours}h ${minutes}m`;
    }
  }
  
  const taxPercentage = 5; // 5% tax as per app standard
  const taxAmount = Math.round((fare * taxPercentage) / 100);
  const totalAmount = fare + taxAmount;
  
  // Debug logging
  if (ride) {
    console.log("[PAYMENT] Ride data received:", {
      distance: ride.distance,
      duration: ride.duration,
      formattedDistance: distance,
      formattedDuration: duration,
    });
  }

  const handleConfirmPayment = async () => {
    if (!ride?._id) return;

    setIsLoading(true);
    setError("");

    try {
      console.log("[TOURIST] Confirming payment for ride:", ride._id);
      const response = await confirmPayment(ride._id, selectedMethod);
      console.log("[TOURIST] Payment confirmed:", response);
      onPaymentConfirmed(selectedMethod);
    } catch (err) {
      console.error("[TOURIST] Payment confirmation error:", err);
      setError("Failed to confirm payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30">
      <div className="relative w-full max-w-md rounded-t-2xl bg-white p-4 shadow-lg sm:rounded-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-sm text-slate-500 mb-1">PAYMENT CONFIRMATION</div>
          <h2 className="text-2xl font-bold text-slate-900">Complete Your Ride</h2>
        </div>

        {/* Ride Summary */}
        <div className="space-y-3 mb-6 p-4 bg-slate-50 rounded-lg">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-slate-600 mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-500 uppercase">From</div>
              <div className="text-sm font-medium text-slate-900 truncate">{pickup}</div>
            </div>
          </div>

          <div className="h-px bg-slate-200" />

          <div className="flex items-start gap-3">
            <Navigation className="w-4 h-4 text-slate-600 mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-500 uppercase">To</div>
              <div className="text-sm font-medium text-slate-900 truncate">{destination}</div>
            </div>
          </div>
        </div>

        {/* Trip Details */}
        <div className="space-y-2 mb-6 p-4 bg-slate-50 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">Distance</span>
            <span className="font-medium text-slate-900">{distance}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">Duration</span>
            <span className="font-medium text-slate-900">{duration}</span>
          </div>
        </div>

        {/* Fare Breakdown */}
        <div className="space-y-3 mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-slate-900 mb-3">Fare Breakdown</h3>

          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-700">Base Fare</span>
            <span className="font-medium text-slate-900">₹{fare}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-700">GST ({taxPercentage}%)</span>
            <span className="font-medium text-slate-900">₹{taxAmount}</span>
          </div>

          <div className="h-px bg-blue-200" />

          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-900">Total Amount</span>
            <span className="text-xl font-bold text-blue-600">₹{totalAmount}</span>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <h3 className="font-semibold text-slate-900 mb-3">Payment Method</h3>
          <div className="space-y-2">
            {/* Cash */}
            <label className="flex items-center gap-3 p-3 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-slate-300 transition"
              style={{ borderColor: selectedMethod === "cash" ? "#3b82f6" : undefined, backgroundColor: selectedMethod === "cash" ? "#eff6ff" : undefined }}>
              <input
                type="radio"
                name="payment"
                value="cash"
                checked={selectedMethod === "cash"}
                onChange={(e) => setSelectedMethod(e.target.value as "cash" | "card" | "wallet")}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-slate-900 font-medium">Cash Payment</span>
              <span className="text-xs text-slate-500 ml-auto">Pay at destination</span>
            </label>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleConfirmPayment}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {isLoading ? "Processing..." : `Confirm Payment • ₹${totalAmount}`}
          </Button>
        </div>

        <div className="mt-4 text-center text-xs text-slate-500">
          {selectedMethod === "cash" && "Payment will be collected at destination"}
          {selectedMethod === "card" && "Secure payment with your card"}
          {selectedMethod === "wallet" && "Payment from your wallet balance"}
        </div>
      </div>
    </div>
  );
}
