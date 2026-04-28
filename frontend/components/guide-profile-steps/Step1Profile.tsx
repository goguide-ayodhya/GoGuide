// components/guide-profile-steps/Step1Profile.tsx

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X } from "lucide-react";
import Image from "next/image";

interface Step1ProfileProps {
  bio: string;
  profileImage: File | null;
  previewUrl: string | null;
  onBioChange: (bio: string) => void;
  onImageChange: (file: File | null) => void;
  errors?: {
    bio?: string;
    profileImage?: string;
  };
}

export function Step1Profile({
  bio,
  profileImage,
  previewUrl,
  onBioChange,
  onImageChange,
  errors,
}: Step1ProfileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith("image/")) {
        alert("Only images allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        return;
      }
      onImageChange(file);
    }
  };

  const handleRemoveImage = () => {
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Profile Information
        </h3>
        <p className="text-sm text-slate-600 mb-6">
          Add a professional photo and write a brief bio about yourself
        </p>
      </div>

      {/* Profile Image Upload */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Profile Photo</Label>
        <div className="flex gap-4 items-start">
          {/* Preview */}
          <div className="relative w-24 h-24 rounded-lg bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center">
            {previewUrl ? (
              <>
                <Image
                  src={previewUrl}
                  alt="Profile preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Upload className="h-8 w-8 text-slate-400" />
            )}
          </div>

          {/* Upload Button */}
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-slate-300 hover:bg-slate-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              {profileImage ? "Change Photo" : "Upload Photo"}
            </Button>
            <p className="text-xs text-slate-500 mt-2">
              JPG, PNG up to 5MB. Recommended: 400x400px
            </p>
          </div>
        </div>
        {errors?.profileImage && (
          <p className="text-sm text-red-600">{errors.profileImage}</p>
        )}
      </div>

      {/* Bio */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="bio" className="text-base font-medium">
            Professional Bio
          </Label>
          <p className="text-sm text-slate-500 mt-1">
            Tell tourists about your experience and what makes you unique
          </p>
        </div>
        <Textarea
          id="bio"
          placeholder="Write a compelling bio (150-300 characters)..."
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
          className="min-h-24 bg-slate-50 border-slate-200 resize-none focus:border-orange-500 focus:ring-orange-500"
          maxLength={300}
        />
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-500">{bio.length}/300 characters</p>
          {errors?.bio && <p className="text-sm text-red-600">{errors.bio}</p>}
        </div>
      </div>

      {/* Tips */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 text-sm mb-2">
          💡 Bio Tips:
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Mention your specialties and experience</li>
          <li>• Highlight what makes your tours unique</li>
          <li>• Use a friendly, welcoming tone</li>
          <li>• Include languages you speak fluently</li>
        </ul>
      </div>
    </div>
  );
}
