"use client";

import { CheckCircle, DollarSign, TrendingUp, MapPin, CreditCard, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RideCompletionSummaryProps {
  ride: any;
  onClose: () => void;
  onProceedToReview?: () => void;
  role?: "driver" | "tourist";
}

export default function RideCompletionSummary({
  ride,
  onClose,
  onProceedToReview,
  role = "tourist",
}: RideCompletionSummaryProps) {
  const fare = ride?.fare || 0;
  
  if (role === "tourist") {
    const driverName = ride?.driver?.userId?.fullname
      ? `${ride.driver.userId.fullname.firstname} ${ride.driver.userId.fullname.lastname || ""}`
      : ride?.driver?.driverName || "Your Driver";
      
    const vehicleInfo = ride?.driver?.vehicleName 
      ? `${ride.driver.vehicleName} (${ride.driver.vehicleNumber || ""})`
      : "";

    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="relative w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl max-h-[90vh] overflow-y-auto border border-slate-100">
          {/* Success Header */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="mb-4 p-3 bg-green-50 rounded-full border border-green-100 animate-bounce">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 text-center">Thanks for Riding!</h2>
            <p className="text-sm text-slate-500 mt-2 text-center">
              Hope you had a safe and comfortable trip
            </p>
          </div>

          {/* Trip Receipt Details */}
          <div className="space-y-4 mb-6">
            {/* Total Paid Card */}
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-semibold text-green-800 uppercase tracking-wide">Total Paid</span>
                </div>
                <span className="text-3xl font-extrabold text-green-700">₹{fare}</span>
              </div>
            </div>

            {/* Ride Details Panel */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
              {/* Driver Info */}
              <div className="flex items-start gap-3 border-b border-slate-200 pb-3">
                <User className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-400 font-medium">Driver</div>
                  <div className="font-semibold text-slate-800 truncate">{driverName}</div>
                  {vehicleInfo && (
                    <div className="text-xs text-slate-500 truncate">{vehicleInfo}</div>
                  )}
                </div>
              </div>

              {/* Route */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-400 font-medium">Pickup</div>
                    <div className="text-sm text-slate-700 truncate">{ride?.pickup || "Pickup Location"}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-400 font-medium">Destination</div>
                    <div className="text-sm text-slate-700 truncate">{ride?.destination || "Destination"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {onProceedToReview && (
              <Button
                onClick={onProceedToReview}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm"
              >
                Rate Your Ride
              </Button>
            )}
            <Button
              onClick={onClose}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl transition-colors border border-slate-200"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Driver View
  const adminCommissionPercent = 15;
  const adminCommission = Math.round((fare * adminCommissionPercent) / 100);
  const netEarning = fare - adminCommission;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30">
      <div className="relative w-full max-w-md rounded-t-2xl bg-white p-6 shadow-lg sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        {/* Success Header */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="mb-4 p-3 bg-green-100 rounded-full">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 text-center">Ride Completed</h2>
          <p className="text-sm text-slate-600 mt-2">Payment confirmed successfully</p>
        </div>

        {/* Earnings Summary */}
        <div className="space-y-4 mb-8">
          {/* Fare Card */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <div className="text-xs text-blue-600 uppercase font-semibold">Fare Earned</div>
                <div className="text-2xl font-bold text-blue-900">₹{fare}</div>
              </div>
            </div>
          </div>

          {/* Commission Card */}
          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <div className="text-xs text-orange-600 uppercase font-semibold">Admin Commission ({adminCommissionPercent}%)</div>
                <div className="text-2xl font-bold text-orange-900">₹{adminCommission}</div>
              </div>
            </div>
          </div>

          {/* Net Earning Card - Highlighted */}
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-500 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-green-600 flex-shrink-0 mt-1 flex items-center justify-center">
                <span className="text-lg font-bold">✓</span>
              </div>
              <div className="flex-1">
                <div className="text-xs text-green-600 uppercase font-semibold">You Earned</div>
                <div className="text-3xl font-bold text-green-700">₹{netEarning}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="mb-8 p-4 bg-slate-50 rounded-lg">
          <h3 className="font-semibold text-slate-900 mb-3">Earning Breakdown</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Ride Fare</span>
              <span className="font-medium text-slate-900">₹{fare}</span>
            </div>
            <div className="flex justify-between items-center text-red-600">
              <span>Admin Commission ({adminCommissionPercent}%)</span>
              <span className="font-medium">-₹{adminCommission}</span>
            </div>
            <div className="h-px bg-slate-200 my-2" />
            <div className="flex justify-between items-center text-green-700">
              <span className="font-semibold">Net Earning</span>
              <span className="font-bold">₹{netEarning}</span>
            </div>
          </div>
        </div>

        {/* Info Message */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          <p>Your earning has been added to your driver wallet. You can view all your earnings in the Payouts section.</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {onProceedToReview && (
            <Button
              onClick={onProceedToReview}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Rate Your Ride
            </Button>
          )}
          <Button
            onClick={onClose}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-lg transition-colors"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
