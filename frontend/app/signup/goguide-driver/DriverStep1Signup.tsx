"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface DriverStep1SignupProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  };
  errors: Record<string, string>;
  loading: boolean;
  onChange: (field: string, value: string) => void;
}

export function DriverStep1Signup({
  formData,
  errors,
  loading,
  onChange,
}: DriverStep1SignupProps) {
  const passwordStrength = {
    hasLength: formData.password.length >= 8,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasLowerCase: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Create your account</h2>
            <p className="text-sm text-slate-600">
              Enter the details you want to use for your driver account.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(event) => onChange("name", event.target.value)}
                className={cn(errors.name ? "border-red-500" : "bg-muted")}
                disabled={loading}
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(event) => onChange("email", event.target.value)}
                className={cn(errors.email ? "border-red-500" : "bg-muted")}
                disabled={loading}
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(event) => onChange("phone", event.target.value)}
                className={cn(errors.phone ? "border-red-500" : "bg-muted")}
                disabled={loading}
              />
              {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(event) => onChange("password", event.target.value)}
                className={cn(errors.password ? "border-red-500" : "bg-muted")}
                disabled={loading}
              />
              {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(event) => onChange("confirmPassword", event.target.value)}
              className={cn(errors.confirmPassword ? "border-red-500" : "bg-muted")}
              disabled={loading}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Password strength</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              {[
                { label: "8+ characters", valid: passwordStrength.hasLength },
                { label: "Uppercase letter", valid: passwordStrength.hasUpperCase },
                { label: "Lowercase letter", valid: passwordStrength.hasLowerCase },
                { label: "Number", valid: passwordStrength.hasNumber },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <Check
                    className={cn(
                      "h-4 w-4",
                      item.valid ? "text-green-600" : "text-slate-300",
                    )}
                  />
                  <span className={item.valid ? "text-slate-900" : "text-slate-500"}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
