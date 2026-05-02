"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface DriverStep3PersonalProps {
  formData: {
    name: string;
    phone: string;
    email: string;
  };
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

export function DriverStep3Personal({ formData, errors, onChange }: DriverStep3PersonalProps) {
  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Personal details</h2>
        <p className="text-sm text-slate-600">
          Confirm or update the name and contact details on your driver profile.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="personalName">Full Name</Label>
          <Input
            id="personalName"
            value={formData.name || ""}
            onChange={(event) => onChange("name", event.target.value)}
            className={cn(errors.name ? "border-red-500" : "bg-muted")}
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="personalPhone">Phone Number</Label>
          <Input
            id="personalPhone"
            value={formData.phone}
            onChange={(event) => onChange("phone", event.target.value)}
            className={cn(errors.phone ? "border-red-500" : "bg-muted")}
          />
          {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="personalEmail">Email (Optional)</Label>
          <Input
            id="personalEmail"
            type="email"
            value={formData.email}
            onChange={(event) => onChange("email", event.target.value)}
            className={cn(errors.email ? "border-red-500" : "bg-muted")}
          />
          {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
        </div>
      </div>
    </div>
  );
}
