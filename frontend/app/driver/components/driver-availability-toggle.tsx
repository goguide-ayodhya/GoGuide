"use client";

import { useDriver } from "@/app/driver/contexts/DriverContext";
import { Circle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export function DriverAvailabilityToggle() {
  const { myDriver, setAvailability } = useDriver();

  if (!myDriver) return null;

  const handleToggle = (checked: boolean) => {
    setAvailability(myDriver.id, checked);
  };

  return (
    <Card className="bg-card border border-border">
      <CardHeader>
        <CardTitle className="text-lg">Availability Status</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Availability Status
          </span>

          <div className="flex items-center gap-2">
            <Circle
              size={12}
              className={
                myDriver.isAvailable
                  ? "fill-green-500 text-green-500"
                  : "fill-gray-500 text-gray-500"
              }
            />

            <span className="text-sm font-medium">
              {myDriver.isAvailable ? "Available" : "Not Available"}
            </span>
            <Switch
              id="driver-availability-toggle"
              checked={myDriver?.isAvailable}
              onCheckedChange={handleToggle}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
