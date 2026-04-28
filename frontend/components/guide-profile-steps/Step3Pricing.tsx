// components/guide-profile-steps/Step3Pricing.tsx

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DURATIONS } from "@/lib/profile-utils";
import { IndianRupee } from "lucide-react";

interface Step3PricingProps {
  price: number;
  duration: string;
  onPriceChange: (price: number) => void;
  onDurationChange: (duration: string) => void;
  errors?: {
    price?: string;
    duration?: string;
  };
}

export function Step3Pricing({
  price,
  duration,
  onPriceChange,
  onDurationChange,
  errors,
}: Step3PricingProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Pricing & Duration
        </h3>
        <p className="text-sm text-slate-600 mb-6">
          Set your tour price and standard duration
        </p>
      </div>

      {/* Price */}
      <div className="space-y-3">
        <Label htmlFor="price" className="text-base font-medium">
          Tour Price
        </Label>
        <div className="relative">
          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            id="price"
            type="number"
            min="100"
            step="100"
            placeholder="500"
            value={price || ""}
            onChange={(e) => onPriceChange(Number(e.target.value) || 0)}
            className="pl-10 bg-slate-50 border-slate-200 text-lg font-semibold"
          />
        </div>
        <p className="text-xs text-slate-500">
          This is the price per person for your tour
        </p>
        {errors?.price && (
          <p className="text-sm text-red-600">{errors.price}</p>
        )}
      </div>

      {/* Duration */}
      <div className="space-y-3">
        <Label htmlFor="duration" className="text-base font-medium">
          Standard Tour Duration
        </Label>
        <Select value={duration} onValueChange={onDurationChange}>
          <SelectTrigger className="bg-slate-50 border-slate-200">
            <SelectValue placeholder="Select duration..." />
          </SelectTrigger>
          <SelectContent>
            {DURATIONS.map((dur) => (
              <SelectItem key={dur} value={dur}>
                {dur}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-slate-500">
          The typical length of your tours
        </p>
        {errors?.duration && (
          <p className="text-sm text-red-600">{errors.duration}</p>
        )}
      </div>

      {/* Pricing Examples */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
        <h4 className="font-semibold text-amber-900 text-sm">💰 Pricing Tips:</h4>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>• Research local guide rates in your area</li>
          <li>• Consider your experience and specialities</li>
          <li>• Factor in travel time and group size</li>
          <li>• You can offer discounts for group bookings</li>
        </ul>
        <div className="bg-white/50 p-2 rounded text-xs text-amber-900 border border-amber-100">
          <p>
            <strong>Estimated earnings:</strong> ₹{price.toLocaleString()} per
            tour (before platform fees)
          </p>
        </div>
      </div>
    </div>
  );
}
