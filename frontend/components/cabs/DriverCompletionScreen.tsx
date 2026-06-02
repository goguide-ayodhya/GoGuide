"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DriverCompletionScreenProps {
  ride: any;
  onComplete?: () => void;
}

export default function DriverCompletionScreen({
  ride,
  onComplete,
}: DriverCompletionScreenProps) {
  const [commissionPercentage, setCommissionPercentage] = useState(0);
  const [adminCommission, setAdminCommission] = useState(0);
  const [netEarning, setNetEarning] = useState(0);

  useEffect(() => {
    // Calculate commission - default 20% if not specified
    const fare = ride?.fare || 0;
    const commissionPct = 20; // Default commission percentage
    const commission = Math.round((fare * commissionPct) / 100);
    const net = fare - commission;

    setCommissionPercentage(commissionPct);
    setAdminCommission(commission);
    setNetEarning(net);

    console.log("[DRIVER_EARNINGS] Completion screen calculated:", {
      fare,
      commissionPct,
      commission,
      net,
    });
  }, [ride?.fare]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30">
      <div className="relative w-full max-w-md rounded-t-2xl bg-white p-6 shadow-lg sm:rounded-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="relative">
              <CheckCircle className="w-20 h-20 text-green-500" />
              <div className="absolute inset-0 animate-pulse">
                <CheckCircle className="w-20 h-20 text-green-500 opacity-50" />
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            Ride Completed!
          </h2>
          <p className="text-sm text-slate-600">
            Payment received • Earnings credited
          </p>
        </div>

        {/* Trip Details */}
        <div className="space-y-3 mb-6 p-4 bg-slate-50 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">Pickup</span>
            <span className="font-medium text-slate-900 text-right max-w-xs truncate">
              {ride?.pickup || "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">Destination</span>
            <span className="font-medium text-slate-900 text-right max-w-xs truncate">
              {ride?.destination || "N/A"}
            </span>
          </div>
          <div className="h-px bg-slate-200" />
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">Distance</span>
            <span className="font-medium text-slate-900">
              {ride?.distance ? `${(ride.distance / 1000).toFixed(1)} km` : "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">Duration</span>
            <span className="font-medium text-slate-900">
              {ride?.duration
                ? ride.duration < 3600
                  ? `${Math.floor(ride.duration / 60)} min`
                  : `${Math.floor(ride.duration / 3600)}h ${Math.floor(
                      (ride.duration % 3600) / 60,
                    )}m`
                : "N/A"}
            </span>
          </div>
        </div>

        {/* Earnings Breakdown */}
        <div className="space-y-3 mb-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-slate-900 mb-4 text-center">
            Earnings Breakdown
          </h3>

          {/* Base Fare */}
          <div className="flex justify-between items-center text-sm">
            <div>
              <div className="text-slate-600">Base Fare</div>
              <div className="text-xs text-slate-500">
                {ride?.fare ? `₹${ride.fare}` : "N/A"}
              </div>
            </div>
            <span className="text-lg font-bold text-slate-900">
              ₹{ride?.fare || 0}
            </span>
          </div>

          <div className="h-px bg-green-200" />

          {/* Admin Commission */}
          <div className="flex justify-between items-center text-sm">
            <div>
              <div className="text-slate-600">Admin Commission</div>
              <div className="text-xs text-slate-500">
                {commissionPercentage}% deducted
              </div>
            </div>
            <span className="text-lg font-semibold text-red-600">
              -₹{adminCommission}
            </span>
          </div>

          <div className="h-px bg-green-200" />

          {/* Net Earning */}
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-slate-900">You Earned</div>
              <div className="text-xs text-slate-600">After commission</div>
            </div>
            <span className="text-2xl font-bold text-green-600">
              ₹{netEarning}
            </span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <div className="text-slate-600 mb-1">Payment Method</div>
          <div className="font-semibold text-slate-900 capitalize">
            {ride?.paymentMethod ? ride.paymentMethod : "N/A"}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Button
            onClick={onComplete}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Note */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
          <p className="font-medium mb-1">💡 Tip:</p>
          <p>
            Your earnings have been credited to your wallet. Visit "Payments"
            section to view detailed breakdown.
          </p>
        </div>
      </div>
    </div>
  );
}
