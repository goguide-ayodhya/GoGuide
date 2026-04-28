// components/guide-profile-steps/Step4ExperienceDocuments.tsx

import React, { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Upload, Plus } from "lucide-react";
import { LANGUAGES } from "@/lib/profile-utils";
import Image from "next/image";

interface Certificate {
  name: string;
  image: File | null;
  preview?: string;
}

interface Step4ExperienceDocumentsProps {
  yearsOfExperience: number;
  languages: string[];
  certificates: Certificate[];
  onExperienceChange: (years: number) => void;
  onLanguagesChange: (languages: string[]) => void;
  onCertificatesChange: (certificates: Certificate[]) => void;
  errors?: {
    yearsOfExperience?: string;
    languages?: string;
    certificates?: string;
  };
}

export function Step4ExperienceDocuments({
  yearsOfExperience,
  languages,
  certificates,
  onExperienceChange,
  onLanguagesChange,
  onCertificatesChange,
  errors,
}: Step4ExperienceDocumentsProps) {
  const [currentLanguage, setCurrentLanguage] = React.useState("");
  const [certificateNameInput, setCertificateNameInput] = React.useState("");
  const [certificateImageInput, setCertificateImageInput] = React.useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLanguage = (lang: string) => {
    if (lang && !languages.includes(lang)) {
      onLanguagesChange([...languages, lang]);
      setCurrentLanguage("");
    }
  };

  const removeLanguage = (lang: string) => {
    onLanguagesChange(languages.filter((l) => l !== lang));
  };

  const addCertificate = () => {
    if (certificateNameInput.trim()) {
      const newCert: Certificate = {
        name: certificateNameInput,
        image: certificateImageInput,
        preview: certificateImageInput
          ? URL.createObjectURL(certificateImageInput)
          : undefined,
      };
      onCertificatesChange([...certificates, newCert]);
      setCertificateNameInput("");
      setCertificateImageInput(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeCertificate = (index: number) => {
    onCertificatesChange(certificates.filter((_, i) => i !== index));
  };

  const handleCertificateImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        return;
      }
      setCertificateImageInput(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Experience & Credentials
        </h3>
        <p className="text-sm text-slate-600 mb-6">
          Share your experience, languages, and certifications
        </p>
      </div>

      {/* Years of Experience */}
      <div className="space-y-3">
        <Label htmlFor="experience" className="text-base font-medium">
          Years of Experience
        </Label>
        <Input
          id="experience"
          type="number"
          min="0"
          max="60"
          placeholder="5"
          value={yearsOfExperience || ""}
          onChange={(e) => onExperienceChange(Number(e.target.value) || 0)}
          className="bg-slate-50 border-slate-200 text-lg"
        />
        <p className="text-xs text-slate-500">
          How many years have you been guiding tours?
        </p>
        {errors?.yearsOfExperience && (
          <p className="text-sm text-red-600">{errors.yearsOfExperience}</p>
        )}
      </div>

      {/* Languages */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Languages</Label>
        <p className="text-sm text-slate-500">Select at least one language</p>

        <div className="flex gap-2">
          <Select value={currentLanguage} onValueChange={setCurrentLanguage}>
            <SelectTrigger className="flex-1 bg-slate-50 border-slate-200">
              <SelectValue placeholder="Select a language..." />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.filter((lang) => !languages.includes(lang)).map(
                (lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          <Button
            type="button"
            onClick={() => addLanguage(currentLanguage)}
            disabled={!currentLanguage}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {languages.length > 0 && (
          <div className="pt-2 border-t border-slate-200">
            <p className="text-sm text-slate-600 mb-2">
              Languages ({languages.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <Badge
                  key={lang}
                  className="bg-purple-100 text-purple-800 flex items-center gap-1"
                >
                  {lang}
                  <button
                    type="button"
                    onClick={() => removeLanguage(lang)}
                    className="hover:text-purple-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {errors?.languages && (
          <p className="text-sm text-red-600">{errors.languages}</p>
        )}
      </div>

      {/* Certificates */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Certifications & Achievements</Label>
        <p className="text-sm text-slate-500">
          Add certificates or credentials (optional but recommended)
        </p>

        {/* Add Certificate Form */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
          <div>
            <Label htmlFor="certName" className="text-sm">
              Certificate Name
            </Label>
            <Input
              id="certName"
              placeholder="e.g., UNESCO Heritage Certificate"
              value={certificateNameInput}
              onChange={(e) => setCertificateNameInput(e.target.value)}
              className="bg-white border-slate-300 mt-1"
            />
          </div>

          <div>
            <Label htmlFor="certImage" className="text-sm">
              Certificate Image
            </Label>
            <div className="flex gap-2 mt-1">
              <input
                ref={fileInputRef}
                id="certImage"
                type="file"
                accept="image/*"
                onChange={handleCertificateImageChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 border-slate-300 hover:bg-slate-100"
              >
                <Upload className="h-4 w-4 mr-2" />
                {certificateImageInput ? "Change Image" : "Upload Image"}
              </Button>
              {certificateImageInput && (
                <span className="text-sm text-slate-600 py-2">
                  {certificateImageInput.name}
                </span>
              )}
            </div>
          </div>

          <Button
            type="button"
            onClick={addCertificate}
            disabled={!certificateNameInput.trim()}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Certificate
          </Button>
        </div>

        {/* Display Added Certificates */}
        {certificates.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              Certificates ({certificates.length}):
            </p>
            <div className="grid gap-3">
              {certificates.map((cert, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  {/* Preview */}
                  {cert.preview ? (
                    <div className="relative w-16 h-16 rounded bg-white border border-slate-300 overflow-hidden flex-shrink-0">
                      <Image
                        src={cert.preview}
                        alt={cert.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <Upload className="h-6 w-6 text-slate-400" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {cert.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {cert.image ? "Image uploaded" : "No image"}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeCertificate(index)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {errors?.certificates && (
          <p className="text-sm text-red-600">{errors.certificates}</p>
        )}
      </div>

      {/* Tips */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 text-sm mb-2">
          📚 What Certifications Help:
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Heritage site certifications</li>
          <li>• Tourism board certifications</li>
          <li>• Language proficiency certificates</li>
          <li>• First aid / CPR certifications</li>
          <li>• Guides association memberships</li>
        </ul>
      </div>
    </div>
  );
}
