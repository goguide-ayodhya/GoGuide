"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Star, Truck } from "lucide-react";
import Image from "next/image";
import { useDriver } from "@/contexts/DriverContext";
import { assets } from "@/public/assets/assets";

export default function DriversPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("all");
  const { drivers } = useDriver();

  // Get unique vehicle types
  const vehicleTypes = [
    "all",
    ...new Set(drivers.map((d) => d.vehicleType || "CAR")),
  ];

  // Filter drivers
  const filtered = drivers.filter((driver) => {
    const matchesSearch =
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVehicle =
      selectedVehicle === "all" || driver.vehicleType === selectedVehicle;
    return matchesSearch && matchesVehicle;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Drivers Directory
        </h1>
        <p className="text-muted-foreground mt-2">
          Browse and collaborate with other professional drivers
        </p>
      </div>

      {/* Filters */}
      <Card className="bg-card border border-border">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={20}
              />
              <Input
                placeholder="Search drivers by name, vehicle, or plate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>

            {/* Vehicle Type Filter */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Filter by Vehicle Type
              </label>
              <div className="flex flex-wrap gap-2">
                {vehicleTypes.map((vehicle) => (
                  <button
                    key={vehicle}
                    onClick={() => setSelectedVehicle(vehicle)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedVehicle === vehicle
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {vehicle.charAt(0).toUpperCase() + vehicle.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drivers Grid */}
      <div>
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((driver) => (
              <Card
                key={driver.id}
                className="bg-card border border-border overflow-hidden hover:border-primary/50 transition-colors"
              >
                <CardContent className="p-0">
                  {/* Driver Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-secondary">
                    <Image
                      src={driver.avatar || assets.guideImage}
                      alt={driver.name}
                      fill
                      className="object-cover w-full h-full"
                    />
                  </div>

                  {/* Driver Info */}
                  <div className="p-4 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        {driver.name}
                      </h3>
                      <p className="text-sm text-primary font-medium">
                        {driver.vehicleType}
                      </p>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={
                              i < Math.floor(driver.averageRating)
                                ? "fill-yellow-500 text-yellow-500"
                                : "text-black/40"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {driver.averageRating.toFixed(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({driver.totalRides} rides)
                      </span>
                    </div>

                    {/* Vehicle Details */}
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        <p>
                          <span className="font-medium text-foreground">
                            Vehicle:
                          </span>{" "}
                          {driver.vehicleName}
                        </p>
                        <p>
                          <span className="font-medium text-foreground">
                            Plate:
                          </span>{" "}
                          {driver.vehicleNumber}
                        </p>
                        <p>
                          <span className="font-medium text-foreground">
                            Seats:
                          </span>{" "}
                          {driver.seats}
                        </p>
                      </div>
                    </div>

                    {/* Pricing */}
                    {/* <div className="text-lg font-bold text-primary">
                      ₹{driver.pricePerKm}/km
                    </div> */}

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          driver.isAvailable
                            ? "bg-green-500"
                            : "bg-gray-500"
                        }`}
                      />
                      <span className="text-sm">
                        {driver.isAvailable ? "Available" : "Not Available"}
                      </span>
                    </div>

                    {/* Actions */}
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border border-border">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No drivers found matching your criteria
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results Summary */}
      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {drivers.length} drivers
      </p>
    </div>
  );
}
