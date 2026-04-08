"use client";

import { useState } from "react";
import { Circle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useDriver } from "@/contexts/DriverContext";

interface DriverAvailabilityToggleProps {
  driver: any;
}

export function DriverAvailabilityToggle({ driver }: DriverAvailabilityToggleProps) {
  const { setAvailability } = useDriver();
  const [loading, setLoading] = useState(false);

  if (!driver) return null;

  const handleToggle = async (checked: boolean) => {
    setLoading(true);
    try {
      await setAvailability(driver.id, checked);
    } catch (error) {
      console.error("Failed to update availability:", error);
    } finally {
      setLoading(false);
    }
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
                driver.isAvailable
                  ? "fill-green-500 text-green-500"
                  : "fill-gray-500 text-gray-500"
              }
            />

            <span className="text-sm font-medium">
              {driver.isAvailable ? "Available" : "Not Available"}
            </span>
            <Switch
              id="driver-availability-toggle"
              checked={driver?.isAvailable}
              onCheckedChange={handleToggle}
              disabled={loading}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
//             />
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
