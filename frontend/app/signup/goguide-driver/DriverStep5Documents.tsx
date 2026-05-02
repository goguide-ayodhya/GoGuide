"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface DriverStep5DocumentsProps {
  formData: {
    driverPhoto: File | null;
    vehiclePhoto: File | null;
    driverLicenseName: string;
    driverLicense: File | null;
  };
  errors: Record<string, string>;
  onChange: (field: string, value: string | File | null) => void;
}

export function DriverStep5Documents({ formData, errors, onChange }: DriverStep5DocumentsProps) {
  const [driverPhotoPreview, setDriverPhotoPreview] = useState<string | null>(null);
  const [vehiclePhotoPreview, setVehiclePhotoPreview] = useState<string | null>(null);
  const [licensePreview, setLicensePreview] = useState<string | null>(null);

  useEffect(() => {
    if (formData.driverPhoto) {
      const url = URL.createObjectURL(formData.driverPhoto);
      setDriverPhotoPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setDriverPhotoPreview(null);
    return undefined;
  }, [formData.driverPhoto]);

  useEffect(() => {
    if (formData.vehiclePhoto) {
      const url = URL.createObjectURL(formData.vehiclePhoto);
      setVehiclePhotoPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setVehiclePhotoPreview(null);
    return undefined;
  }, [formData.vehiclePhoto]);

  useEffect(() => {
    if (formData.driverLicense) {
      const url = URL.createObjectURL(formData.driverLicense);
      setLicensePreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setLicensePreview(null);
    return undefined;
  }, [formData.driverLicense]);

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Document upload</h2>
        <p className="text-sm text-slate-600">
          Upload your driver photo, vehicle photo, and your driving license details.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="driverPhoto">Driver Photo</Label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label
              htmlFor="driverPhoto"
              className={cn(
                "flex-1 cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition hover:border-slate-400",
                errors.driverPhoto ? "border-red-500" : "",
              )}
            >
              <Upload className="mx-auto mb-2 h-5 w-5 text-slate-500" />
              <p className="text-sm text-slate-600">
                {formData.driverPhoto ? formData.driverPhoto.name : "Select an image"}
              </p>
            </label>
            <Input
              id="driverPhoto"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) =>
                onChange(
                  "driverPhoto",
                  event.target.files?.[0] || null,
                )
              }
            />
          </div>
          {driverPhotoPreview && (
            <img
              src={driverPhotoPreview}
              alt="Driver preview"
              className="h-28 w-full rounded-xl object-cover"
            />
          )}
          {errors.driverPhoto && (
            <p className="text-sm text-red-600">{errors.driverPhoto}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehiclePhoto">Vehicle Photo</Label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label
              htmlFor="vehiclePhoto"
              className={cn(
                "flex-1 cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition hover:border-slate-400",
                errors.vehiclePhoto ? "border-red-500" : "",
              )}
            >
              <Upload className="mx-auto mb-2 h-5 w-5 text-slate-500" />
              <p className="text-sm text-slate-600">
                {formData.vehiclePhoto ? formData.vehiclePhoto.name : "Select an image"}
              </p>
            </label>
            <Input
              id="vehiclePhoto"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) =>
                onChange(
                  "vehiclePhoto",
                  event.target.files?.[0] || null,
                )
              }
            />
          </div>
          {vehiclePhotoPreview && (
            <img
              src={vehiclePhotoPreview}
              alt="Vehicle preview"
              className="h-28 w-full rounded-xl object-cover"
            />
          )}
          {errors.vehiclePhoto && (
            <p className="text-sm text-red-600">{errors.vehiclePhoto}</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="driverLicenseName">License holder name</Label>
            <Input
              id="driverLicenseName"
              value={formData.driverLicenseName}
              onChange={(event) => onChange("driverLicenseName", event.target.value)}
              className={cn(errors.driverLicenseName ? "border-red-500" : "bg-muted")}
            />
            {errors.driverLicenseName && (
              <p className="text-sm text-red-600">{errors.driverLicenseName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="driverLicense">Driving License</Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label
                htmlFor="driverLicense"
                className={cn(
                  "flex-1 cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition hover:border-slate-400",
                  errors.driverLicense ? "border-red-500" : "",
                )}
              >
                <Upload className="mx-auto mb-2 h-5 w-5 text-slate-500" />
                <p className="text-sm text-slate-600">
                  {formData.driverLicense ? formData.driverLicense.name : "Choose license image"}
                </p>
              </label>
              <Input
                id="driverLicense"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) =>
                  onChange(
                    "driverLicense",
                    event.target.files?.[0] || null,
                  )
                }
              />
            </div>
          </div>

          {licensePreview && (
            <img
              src={licensePreview}
              alt="License preview"
              className="h-28 w-full rounded-xl object-cover"
            />
          )}
          {errors.driverLicense && (
            <p className="text-sm text-red-600">{errors.driverLicense}</p>
          )}
        </div>
      </div>
    </div>
  );
}
