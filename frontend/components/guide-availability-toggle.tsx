"use client";

import { useGuide } from "@/contexts/GuideContext";
import {
  Circle,
  Sparkles,
  Wifi,
  WifiOff,
} from "lucide-react";

import { Switch } from "@/components/ui/switch";

export function GuideAvailabilityToggle() {
  const { myGuide, setAvailability } = useGuide();

  if (!myGuide) return null;

  const handleToggle = (checked: boolean) => {
    setAvailability(myGuide.id, checked);
  };

  return (
    <div
      className={`relative overflow-hidden border  transition-all duration-300
      ${
        myGuide.isAvailable
          ? "border-green-200 bg--emerald-100"
          : "border-slate-200 bg-gradient-to-r from-slate-100 to-slate-200"
      }`}
    >
      {/* Glow */}
      <div
        className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-30
        ${
          myGuide.isAvailable
            ? "bg-green-400"
            : "bg-slate-400"
        }`}
      />

      <div className="relative flex items-center justify-between px-4 py-3 gap-4">
        
        {/* Left */}
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-full border
            ${
              myGuide.isAvailable
                ? "bg-white border-green-200"
                : "bg-white border-slate-300"
            }`}
          >
            {myGuide.isAvailable ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-slate-500" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm text-slate-900">
                {myGuide.isAvailable
                  ? "Available for Bookings"
                  : "Currently Offline"}
              </p>

              <Circle
                size={10}
                className={
                  myGuide.isAvailable
                    ? "fill-green-500 text-green-500 animate-pulse"
                    : "fill-slate-400 text-slate-400"
                }
              />
            </div>

            <p className="text-xs text-slate-600">
              {myGuide.isAvailable
                ? ""
                : "You are hidden from new booking requests"}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {myGuide.isAvailable && (
            <Sparkles className="h-4 w-4 text-green-600" />
          )}

          <Switch
            id="availability-toggle"
            className="cursor-pointer"
            checked={myGuide?.isAvailable}
            onCheckedChange={handleToggle}
          />
        </div>
      </div>
    </div>
  );
}