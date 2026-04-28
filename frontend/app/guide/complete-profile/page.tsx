"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useGuide } from "@/contexts/GuideContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Step1Profile } from "@/components/guide-profile-steps/Step1Profile";
import { Step2Services } from "@/components/guide-profile-steps/Step2Services";
import { Step3Pricing } from "@/components/guide-profile-steps/Step3Pricing";
import { Step4ExperienceDocuments } from "@/components/guide-profile-steps/Step4ExperienceDocuments";
import {
  ProfileData,
  calculateProfileCompletion,
  saveProfileToLocalStorage,
  loadProfileFromLocalStorage,
  clearProfileDraft,
} from "@/lib/profile-utils";
import { updateGuide, completeProfileApi } from "@/lib/api/guides";
import { usePathname } from "next/navigation";

const STEPS = [
  { id: 1, name: "Profile", label: "Step 1" },
  { id: 2, name: "Services", label: "Step 2" },
  { id: 3, name: "Pricing", label: "Step 3" },
  { id: 4, name: "Experience", label: "Step 4" },
];

interface Certificate {
  name: string;
  image: File | null;
}

export default function CompleteProfilePage() {
  const { refreshUser } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { myGuide, loading: guideLoading } = useGuide();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [initialStepSet, setInitialStepSet] = useState(false);

  const [formData, setFormData] = useState<ProfileData>({
    bio: "",
    profileImage: null,
    specialities: [],
    locations: [],
    price: 500,
    duration: "4 hours",
    yearsOfExperience: 0,
    languages: [],
    certificates: [],
  });

  // Load saved draft on mount
  useEffect(() => {
    try {
      const saved = loadProfileFromLocalStorage();
      if (saved) {
        setFormData((prev) => ({
          ...prev,
          ...saved,
          profileImage: null,
          certificates: (saved.certificates || []).map((c) => ({
            ...c,
            image: null,
          })),
        }));
      }
    } catch (err) {
      console.error("Failed to load draft:", err);
    } finally {
      setDraftLoaded(true);
    }
  }, []);

  const profileCompletion = calculateProfileCompletion(formData);

  const isNextDisabled =
    uploading ||
    submitting ||
    loading ||
    (currentStep === 1
      ? !formData.bio.trim() || !formData.profileImage
      : currentStep === 2
        ? formData.specialities.length === 0 || formData.locations.length === 0
        : currentStep === 3
          ? !formData.price || formData.price <= 0 || !formData.duration
          : false);

  const handleProfileImageChange = (file: File | null) => {
    setFormData((prev) => ({ ...prev, profileImage: file }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const validateStep1 = () => {
    setFieldErrors({});
    setError("");

    const errors: Record<string, string> = {};

    if (!formData.bio.trim()) {
      errors.bio = "Bio is required";
    }
    if (!formData.profileImage) {
      errors.profileImage = "Profile image is required";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix the highlighted fields before continuing.");
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    setFieldErrors({});
    setError("");

    if (formData.specialities.length === 0) {
      setError("Add at least one speciality");
      return false;
    }
    if (formData.locations.length === 0) {
      setError("Add at least one location");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    setFieldErrors({});
    setError("");

    if (!formData.price || formData.price <= 0) {
      setError("Enter a valid hourly price");
      return false;
    }
    if (!formData.duration) {
      setError("Select a tour duration");
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    setFieldErrors({});
    setError("");

    const errors: Record<string, string> = {};
    if (formData.yearsOfExperience <= 0) {
      errors.yearsOfExperience = "Please enter your years of experience";
    }
    if (!formData.languages || formData.languages.length === 0) {
      errors.languages = "Select at least one language";
    }
    if (!formData.certificates || formData.certificates.length === 0) {
      errors.certificates = "Add at least one certificate or credential";
    } else if (formData.certificates.some((cert) => !cert.image)) {
      errors.certificates = "All certificates must include an image";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please complete the experience section before continuing.");
      return false;
    }

    return true;
  };

  const handleNext = async () => {
    if (loading || uploading || submitting) return;

    setError("");
    setSuccess("");
    setFieldErrors({});

    let isValid = false;

    if (currentStep === 1) isValid = validateStep1();
    if (currentStep === 2) isValid = validateStep2();
    if (currentStep === 3) isValid = validateStep3();

    if (!isValid) return;

    setLoading(true);
    setUploading(true);

    try {
      let dataToSend: any = {};

      if (currentStep === 1) {
        dataToSend = {
          bio: formData.bio,
          avatar: formData.profileImage,
        };
      } else if (currentStep === 2) {
        dataToSend = {
          specialities: formData.specialities,
          locations: formData.locations,
        };
      } else if (currentStep === 3) {
        dataToSend = {
          price: formData.price,
          duration: formData.duration,
        };
      }

      await updateGuide(dataToSend);

      // Save to localStorage as backup
      saveProfileToLocalStorage(formData);

      setSuccess("Step saved successfully!");
      setTimeout(() => {
        setSuccess("");
        setCurrentStep(currentStep + 1);
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to save data");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (uploading || submitting) return;
    setError("");
    setFieldErrors({});
    setSubmitting(true);

    if (!validateStep1()) {
      setSubmitting(false);
      return;
    }

    if (!validateStep2()) {
      setSubmitting(false);
      return;
    }

    if (!validateStep3()) {
      setSubmitting(false);
      return;
    }

    if (!validateStep4()) {
      setSubmitting(false);
      return;
    }

    setUploading(true);

    try {
      // Prepare data object for API
      const dataToSend = {
        bio: formData.bio,
        specialities: formData.specialities,
        locations: formData.locations,
        price: formData.price,
        duration: formData.duration,
        yearsOfExperience: formData.yearsOfExperience,
        languages: formData.languages,
        avatar: formData.profileImage,
        certificates: formData.certificates.map((cert) => ({
          name: cert.name,
          image: cert.image,
        })),
      };

      // Update guide profile
      await updateGuide(dataToSend);

      await completeProfileApi();

      await refreshUser();

      // then redirect
      router.push("/guide/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to complete profile");
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  };

  const computeStepFromData = (data: ProfileData) => {
    if (!data.bio.trim() || !data.profileImage) return 1;
    if (data.specialities.length === 0 || data.locations.length === 0) return 2;
    if (!data.price || data.price <= 0 || !data.duration) return 3;
    if (
      data.yearsOfExperience <= 0 ||
      data.languages.length === 0 ||
      data.certificates.length === 0 ||
      data.certificates.some((cert) => !cert.image)
    )
      return 4;
    return 4;
  };

  const computeStepFromGuide = (guide: any) => {
    if (!guide) return 1;
    const hasProfile =
      !!guide.bio?.trim() &&
      !!(guide.avatar || guide.image || guide.profileImage);
    if (!hasProfile) return 1;
    if (!guide.specialities?.length || !guide.locations?.length) return 2;
    if (!guide.price || !guide.duration) return 3;
    return 4;
  };

  useEffect(() => {
    if (initialStepSet) return;
    if (guideLoading) return;
    if (!user) return;
    if (!draftLoaded) return;

    if (!user) return;

    if (user.isProfileComplete && pathname !== "/guide/dashboard") {
      router.push("/guide/dashboard");
    }

    const draftStep = computeStepFromData(formData);
    const guideStep = computeStepFromGuide(myGuide);
    const targetStep = Math.max(draftStep, guideStep);

    if (targetStep > 1) {
      setCurrentStep(targetStep);
    }

    setInitialStepSet(true);
  }, [
    draftLoaded,
    formData,
    guideLoading,
    initialStepSet,
    myGuide,
    router,
    user,
  ]);

  if (!user) {
    return null; // Will be redirected by auth guard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-slate-600">
            {profileCompletion}% complete • {STEPS.length} easy steps
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex gap-2 mb-4">
            {STEPS.map((step) => (
              <button
                key={step.id}
                onClick={() => {
                  if (step.id <= currentStep) {
                    setCurrentStep(step.id);
                  }
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  currentStep === step.id
                    ? "bg-primary text-white"
                    : currentStep > step.id
                      ? "bg-green-100 text-green-800"
                      : "bg-slate-200 text-slate-700"
                }`}
              >
                {currentStep > step.id && (
                  <CheckCircle2 className="h-4 w-4 inline mr-1" />
                )}
                {step.label}
              </button>
            ))}
          </div>

          {/* Overall Progress Bar */}
          <div className="h-2 bg-slate-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
        </div>

        {/* Main Card */}
        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">
              {STEPS[currentStep - 1].name}
            </CardTitle>
            <CardDescription>
              Step {currentStep} of {STEPS.length}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Error</p>
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-800">
                <CheckCircle2 className="h-5 w-5" />
                <span>{success}</span>
              </div>
            )}

            {uploading && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3 text-blue-800">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>
                  Uploading images and saving your profile. Please wait...
                </span>
              </div>
            )}

            {/* Step Content */}
            <div className="mb-8">
              {currentStep === 1 && (
                <Step1Profile
                  bio={formData.bio}
                  profileImage={formData.profileImage}
                  previewUrl={previewUrl}
                  onBioChange={(bio) =>
                    setFormData((prev) => ({ ...prev, bio }))
                  }
                  onImageChange={handleProfileImageChange}
                  errors={{
                    bio: fieldErrors.bio,
                    profileImage: fieldErrors.profileImage,
                  }}
                />
              )}

              {currentStep === 2 && (
                <Step2Services
                  specialities={formData.specialities}
                  locations={formData.locations}
                  onSpecialitiesChange={(specialities) =>
                    setFormData((prev) => ({ ...prev, specialities }))
                  }
                  onLocationsChange={(locations) =>
                    setFormData((prev) => ({ ...prev, locations }))
                  }
                />
              )}

              {currentStep === 3 && (
                <Step3Pricing
                  price={formData.price}
                  duration={formData.duration}
                  onPriceChange={(price) =>
                    setFormData((prev) => ({ ...prev, price }))
                  }
                  onDurationChange={(duration) =>
                    setFormData((prev) => ({ ...prev, duration }))
                  }
                />
              )}

              {currentStep === 4 && (
                <Step4ExperienceDocuments
                  yearsOfExperience={formData.yearsOfExperience}
                  languages={formData.languages}
                  certificates={formData.certificates}
                  onExperienceChange={(yearsOfExperience) =>
                    setFormData((prev) => ({ ...prev, yearsOfExperience }))
                  }
                  onLanguagesChange={(languages) =>
                    setFormData((prev) => ({ ...prev, languages }))
                  }
                  onCertificatesChange={(certificates) =>
                    setFormData((prev) => ({ ...prev, certificates }))
                  }
                  errors={{
                    yearsOfExperience: fieldErrors.yearsOfExperience,
                    languages: fieldErrors.languages,
                    certificates: fieldErrors.certificates,
                  }}
                />
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handlePrev}
                disabled={currentStep === 1 || submitting || loading}
                variant="outline"
                className="border-slate-300 hover:bg-slate-50"
              >
                ← Previous
              </Button>

              {currentStep === STEPS.length ? (
                <Button
                  onClick={handleSubmit}
                  disabled={uploading || submitting || profileCompletion < 50}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {uploading || submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Complete Profile
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={
                    isNextDisabled || submitting || uploading || loading
                  }
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Next →"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Floating CTA Card */}
        <Card className="sticky bottom-4 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 shadow-lg">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">
                  {profileCompletion}% Profile Complete
                </p>
                <p className="text-sm text-slate-600">
                  Complete your profile to start getting tour bookings
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 mb-1">
                  Step {currentStep} of {STEPS.length}
                </p>
                <div className="w-24 h-2 bg-slate-300 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-600 transition-all duration-300"
                    style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
