"use client";

import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentSuccessProps {
  ride: any;
  onProceedToReview: () => void;
  onClose?: () => void;
}

export default function PaymentSuccess({
  ride,
  onProceedToReview,
  onClose,
}: PaymentSuccessProps) {
  const fare = ride?.fare || 0;
  const taxPercentage = 0; // 0% GST/Tax (previously 5%, now removed)
  const taxAmount = Math.round((fare * taxPercentage) / 100);
  const totalAmount = fare + taxAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30">
      <div className="relative w-full max-w-md rounded-t-2xl bg-white p-6 shadow-lg sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        {/* Success Header */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="mb-4 p-3 bg-green-100 rounded-full">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 text-center">Payment Successful</h2>
          <p className="text-sm text-slate-600 mt-2">Your ride has been completed</p>
        </div>

        {/* Payment Confirmation Details */}
        <div className="space-y-4 mb-8 p-4 bg-slate-50 rounded-lg">
          <h3 className="font-semibold text-slate-900 mb-4">Payment Details</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Base Fare</span>
              <span className="font-medium text-slate-900">₹{fare}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Taxes ({taxPercentage}%)</span>
              <span className="font-medium text-slate-900">₹{taxAmount}</span>
            </div>
            <div className="h-px bg-slate-200" />
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-900">Total Paid</span>
              <span className="text-lg font-bold text-green-600">₹{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Ride Summary */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          <p>
            <strong>From:</strong> {ride?.pickup}
          </p>
          <p className="mt-2">
            <strong>To:</strong> {ride?.destination}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={onProceedToReview}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Rate Your Ride
          </Button>

          {onClose && (
            <Button
              onClick={onClose}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-lg transition-colors"
            >
              Skip Rating
            </Button>
          )}
        </div>

        <div className="mt-4 text-center text-xs text-slate-500">
          Thank you for choosing GoGuide
        </div>
      </div>
    </div>
  );
}
