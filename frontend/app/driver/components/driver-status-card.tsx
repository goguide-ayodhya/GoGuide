"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Circle } from "lucide-react";

interface DriverStatusCardProps {
  driver: any;
}

export function DriverStatusCard({ driver }: DriverStatusCardProps) {
  if (!driver) return null;

  return (
    <Card className="bg-card border border-border">
      <CardHeader>
        <CardTitle className="text-lg">Driver Status</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Verification Status
          </span>

          <Badge variant={driver.verificationStatus === "VERIFIED" ? "default" : "secondary"}>
            {driver.verificationStatus}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Availability
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
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Total Rides
          </span>
          <span className="text-sm font-medium">{driver.totalRides || 0}</span>
        </div>
      </CardContent>
    </Card>
  );
}

//         <div className="flex items-center justify-between pt-2 border-t border-border">
//           <span className="text-sm font-medium text-muted-foreground">
//             Availability
//           </span>
//           <Badge
//             variant="outline"
//             className={
//               myDriver.isAvailable
//                 ? "bg-green-500/20 text-green-700 border-green-500/50"
//                 : "bg-gray-500/20 text-gray-700 border-gray-500/50"
//             }
//           >
//             {myDriver.isAvailable ? "Available" : "Not Available"}
//           </Badge>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
