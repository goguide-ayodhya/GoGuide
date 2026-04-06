"use client";

import { useGuide } from "@/contexts/GuideContext";
import { Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export function GuideAvailabilityToggle() {
  const { myGuide, setAvailability } = useGuide();

  if (!myGuide) return null;

  const handleToggle = (checked: boolean) => {
    setAvailability(myGuide.id, checked);
  };

  return (
    <div className="">
      {/* <CardHeader>
        <CardTitle className="text-lg">Availability Status</CardTitle>
      </CardHeader> */}

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3">
          {/* <span className="text-sm font-bold text-muted-foreground">
            Availability Status
          // </span> */}

          <div className="flex items-center gap-2">
            <Circle
              size={12}
              className={
                myGuide.isAvailable
                  ? "fill-green-500 text-green-500"
                  : "fill-gray-500 text-gray-500"
              }
            />

            <span className="text-sm font-medium">
              {myGuide.isAvailable ? "Available" : "Not Available"}
            </span>
            <Switch
              id="availability-toggle"
              className="cursor-pointer"
              checked={myGuide?.isAvailable}
              onCheckedChange={handleToggle}
            />
          </div>
        </div>
      </CardContent>
    </div>
  );
}
