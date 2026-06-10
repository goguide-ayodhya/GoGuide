"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car } from "lucide-react";
import {
  getAllCabsApi,
} from "@/lib/api/admin";

type Cab = {
  _id?: string;
  id?: string;
  userId?: any;
  driverName?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  phone?: string;
  verificationStatus?: string;
  isAvailable?: boolean;

  status: "available" | "busy" | "offline";
};

const vehicleTypeMap: Record<string, string> = {
  CAB: "CAB",
  BIKE: "Bike",
  AUTO: "Auto",
  RIKSHAW: "Rikshaw",
};

// Helper function to convert API cab format to UI cab format
const convertApiCabToUi = (apiCab: any): Cab => {
  // console.log("Converting cab:", apiCab);
  
  const status =
    apiCab.verificationStatus !== "VERIFIED"
      ? "offline"
      : apiCab.isAvailable
        ? "available"
        : "busy";

  return {
    id: apiCab._id || apiCab.id,
    driverName: apiCab.userId?.name || apiCab.driverName || "Unknown Driver",
    vehicleType:
      vehicleTypeMap[apiCab.vehicleType] ||
      apiCab.vehicleType ||
      "N/A",
    vehicleNumber: apiCab.vehicleNumber || apiCab.vehicleName || "N/A",
    phone: apiCab.userId?.phone || apiCab.phone || "N/A",
    status: status as "available" | "busy" | "offline",
  };
};

export default function CabsPage() {
  const [cabs, setCabs] = useState<Cab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch cabs and pricing on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch cabs
        try {
          const cabsData = await getAllCabsApi();
          // console.log("Cabs data received:", cabsData);
          
          // Handle both array and object responses
          const driversArray = Array.isArray(cabsData) ? cabsData : cabsData?.data || [];
          // console.log("Drivers array:", driversArray);
          
          if (!Array.isArray(driversArray)) {
            throw new Error("Invalid response format from API");
          }
          
          const uiCabs = driversArray.map((cab: any) => convertApiCabToUi(cab));
          // console.log("Converted cabs:", uiCabs);
          setCabs(uiCabs);
        } catch (cabErr: any) {
          console.error("Failed to fetch cabs:", cabErr);
          setCabs([]);
          setError(cabErr?.message || "Failed to fetch cabs. Please try again.");
        }
      } catch (err: any) {
        console.error("Failed to fetch cab data:", err);
        setError(err.message || "Failed to load cab data");
        setCabs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <Badge
            className="bg-success/10 text-success border-success/20 text-[10px] sm:text-xs"
            variant="outline"
          >
            Available
          </Badge>
        );
      case "busy":
        return (
          <Badge
            className="bg-warning/10 text-warning-foreground border-warning/20 text-[10px] sm:text-xs"
            variant="outline"
          >
            Busy
          </Badge>
        );
      case "offline":
        return (
          <Badge
            className="bg-muted text-muted-foreground border-border text-[10px] sm:text-xs"
            variant="outline"
          >
            Offline
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
          Cab Management
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
          Manage cab services and pricing.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading cab data...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Cabs - Mobile Cards / Desktop Table */}
          <Card className="border-border">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-sm sm:text-base">All Cabs</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {cabs.length} cabs registered
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Mobile View - Cards */}
              <div className="block md:hidden space-y-3">
                {cabs.map((cab) => (
                  <div
                    key={cab.id}
                    className="p-3 sm:p-4 rounded-lg border border-border bg-card"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <Car className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {cab.driverName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {cab.id}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(cab.status)}
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vehicle:</span>
                        <Badge variant="secondary" className="text-[10px]">
                          {cab.vehicleType}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Number:</span>
                        <span className="text-foreground font-medium">
                          {cab.vehicleNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="text-foreground">{cab.phone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden md:block overflow-x-auto -mx-6 px-6">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-medium text-muted-foreground py-3">
                        Cab ID
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground py-3">
                        Driver Name
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground py-3">
                        Vehicle Type
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground py-3">
                        Vehicle Number
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground py-3">
                        Phone
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground py-3">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cabs.map((cab) => (
                      <tr
                        key={cab.id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="py-3 text-sm font-medium text-foreground">
                          {cab.id}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <Car className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <span className="text-sm font-medium text-foreground">
                              {cab.driverName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge variant="secondary" className="text-xs">
                            {cab.vehicleType}
                          </Badge>
                        </td>
                        <td className="py-3 text-sm text-muted-foreground">
                          {cab.vehicleNumber}
                        </td>
                        <td className="py-3 text-sm text-muted-foreground">
                          {cab.phone}
                        </td>
                        <td className="py-3">{getStatusBadge(cab.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
