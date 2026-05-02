"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DriverStep4VehicleProps {
  formData: {
    vehicleType: string;
    vehicleName: string;
    vehicleNumber: string;
    seats: string;
  };
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

const VEHICLE_TYPES = ["CAR", "BIKE", "AUTO"];

export function DriverStep4Vehicle({ formData, errors, onChange }: DriverStep4VehicleProps) {
  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Vehicle details</h2>
        <p className="text-sm text-slate-600">
          Provide your vehicle make, registration and passenger capacity.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="vehicleType">Vehicle Type</Label>
          <Select
            value={formData.vehicleType}
            onValueChange={(value) => onChange("vehicleType", value)}
          >
            <SelectTrigger className={cn(errors.vehicleType ? "border-red-500" : "bg-muted")}> 
              <SelectValue placeholder="Select vehicle type" />
            </SelectTrigger>
            <SelectContent>
              {VEHICLE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.vehicleType && <p className="text-sm text-red-600">{errors.vehicleType}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicleName">Vehicle Name/Model</Label>
          <Input
            id="vehicleName"
            value={formData.vehicleName}
            onChange={(event) => onChange("vehicleName", event.target.value)}
            className={cn(errors.vehicleName ? "border-red-500" : "bg-muted")}
          />
          {errors.vehicleName && <p className="text-sm text-red-600">{errors.vehicleName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicleNumber">Vehicle Number</Label>
          <Input
            id="vehicleNumber"
            value={formData.vehicleNumber}
            onChange={(event) => onChange("vehicleNumber", event.target.value)}
            className={cn(errors.vehicleNumber ? "border-red-500" : "bg-muted")}
          />
          {errors.vehicleNumber && <p className="text-sm text-red-600">{errors.vehicleNumber}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="seats">Number of Seats</Label>
          <Input
            id="seats"
            type="number"
            min={1}
            value={formData.seats}
            onChange={(event) => onChange("seats", event.target.value)}
            className={cn(errors.seats ? "border-red-500" : "bg-muted")}
          />
          {errors.seats && <p className="text-sm text-red-600">{errors.seats}</p>}
        </div>
      </div>
    </div>
  );
}
