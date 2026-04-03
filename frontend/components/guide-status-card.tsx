"use client";

import { useGuide } from "@/contexts/GuideContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Circle } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function GuideStatusCard() {
  const { myGuide, setOnlineStatus } = useGuide();

  if (!myGuide) return null;

  const handleToggle = (checked: boolean) => {
    setOnlineStatus(myGuide.id, checked);
  };

  return (
    <Card className="bg-card border border-border">
      <CardHeader>
        <CardTitle className="text-lg">Guide Status</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Online Status
          </span>

          <div className="flex items-center gap-2">
            <Circle
              size={12}
              className={
                myGuide.isOnline
                  ? "fill-green-500 text-green-500"
                  : "fill-gray-500 text-gray-500"
              }
            />

            <span className="text-sm font-medium">
              {myGuide.isOnline ? "Online" : "Offline"}
            </span>
            <Switch
              id="availability-toggle"
              checked={myGuide?.isOnline}
              onCheckedChange={handleToggle}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-sm font-medium text-muted-foreground">
            Availability
          </span>
          <Badge
            variant="outline"
            className={
              myGuide.isAvailable
                ? "bg-green-500/20 text-green-700 border-green-500/50"
                : "bg-gray-500/20 text-gray-700 border-gray-500/50"
            }
          >
            {myGuide.isAvailable ? "Available" : "Not Available"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
