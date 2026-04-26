"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRecentAlerts } from "@/lib/api/adminDashboard";
import { AlertTriangle, Info, CheckCircle, XCircle, Clock } from "lucide-react";

interface Alert {
  id: string;
  title: string;
  description: string;
  type: string;
  read: boolean;
  userName: string;
  userEmail: string;
  createdAt: string;
}

const alertTypeConfig = {
  BOOKING_REQUEST: {
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  PAYMENT_FAILED: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  },
  GUIDE_VERIFIED: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  SYSTEM_ALERT: {
    icon: AlertTriangle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200"
  }
};

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentAlerts = async () => {
      try {
        setLoading(true);
        const data = await getRecentAlerts(5);
        setAlerts(data);
      } catch (error) {
        console.error("Failed to fetch recent alerts:", error);
        setError("Failed to load recent alerts");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentAlerts();
  }, []);

  if (loading) {
    return (
      <Card className="border-border">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-sm sm:text-base">Recent Alerts</CardTitle>
          <CardDescription className="text-xs sm:text-sm">System notifications and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3 p-3 rounded-lg border border-border">
                <div className="animate-pulse">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                </div>
                <div className="flex-1 animate-pulse">
                  <div className="h-4 bg-muted rounded mb-1"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-border">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-sm sm:text-base">Recent Alerts</CardTitle>
          <CardDescription className="text-xs sm:text-sm">System notifications and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-sm sm:text-base">Recent Alerts</CardTitle>
        <CardDescription className="text-xs sm:text-sm">System notifications and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-6">
              <Info className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No recent alerts</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const config = alertTypeConfig[alert.type as keyof typeof alertTypeConfig] || alertTypeConfig.SYSTEM_ALERT;
              const Icon = config.icon;

              return (
                <div key={alert.id} className={`flex items-start space-x-3 p-3 rounded-lg border ${config.borderColor} ${config.bgColor} hover:opacity-80 transition-opacity`}>
                  <div className={`p-2 rounded-full ${config.bgColor} ${config.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-foreground truncate">{alert.title}</p>
                      {!alert.read && (
                        <Badge variant="destructive" className="text-xs ml-2">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{alert.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{alert.userName} ({alert.userEmail})</span>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}