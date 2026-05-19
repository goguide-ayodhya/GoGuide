"use client";

import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageCropModal } from "@/components/common/ImageCropModal";

interface DriverStep5DocumentsProps {
  formData: {
    driverPhoto: File | null;
    driverLicenseName: string;
    driverLicense: File | null;
  };
  errors: Record<string, string>;
  onChange: (field: string, value: string | File | null) => void;
}

export function DriverStep5Documents({ formData, errors, onChange }: DriverStep5DocumentsProps) {
  const [driverPhotoPreview, setDriverPhotoPreview] = useState<string | null>(null);
  const [licensePreview, setLicensePreview] = useState<string | null>(null);
  const [rawPhotoSrc, setRawPhotoSrc] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

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
    if (formData.driverLicense) {
      const url = URL.createObjectURL(formData.driverLicense);
      setLicensePreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setLicensePreview(null);
    return undefined;
  }, [formData.driverLicense]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (photoInputRef.current) photoInputRef.current.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setRawPhotoSrc(url);
    setCropOpen(true);
  };

  const handleCropComplete = (croppedFile: File) => {
    if (rawPhotoSrc) URL.revokeObjectURL(rawPhotoSrc);
    setRawPhotoSrc(null);
    onChange("driverPhoto", croppedFile);
  };

  const handleCropCancel = () => {
    if (rawPhotoSrc) URL.revokeObjectURL(rawPhotoSrc);
    setRawPhotoSrc(null);
    setCropOpen(false);
  };

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Document upload</h2>
        <p className="text-sm text-slate-600">
          Upload your driver photo and your driving license details.
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
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelect}
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

      <ImageCropModal
        imageSrc={rawPhotoSrc}
        open={cropOpen}
        onClose={handleCropCancel}
        onCropComplete={handleCropComplete}
        outputFileName="driver-photo.jpg"
      />
    </div>
  );
}
