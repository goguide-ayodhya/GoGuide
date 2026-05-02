"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { sendOtpApi, verifyEmailOtp } from "@/lib/api/auth";
import { updateDriverProfile, createDriverProfile } from "@/lib/api/driver";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DriverStep1Signup } from "./DriverStep1Signup";
import { DriverStep2Verify } from "./DriverStep2Verify";
import { DriverStep4Vehicle } from "./DriverStep4Vehicle";
import { DriverStep5Documents } from "./DriverStep5Documents";

const STORAGE_KEY = "driver-signup-draft";

const STEPS = [
  { id: 1, name: "Signup", label: "Step 1" },
  { id: 2, name: "Verify", label: "Step 2" },
  { id: 3, name: "Vehicle", label: "Step 3" },
  { id: 4, name: "Documents", label: "Step 4" },
];

const initialFormData = {
  signup: {
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    otp: "",
  },
  vehicle: {
    vehicleType: "",
    vehicleName: "",
    vehicleNumber: "",
    seats: "",
  },
  documents: {
    driverPhoto: null as File | null,
    vehiclePhoto: null as File | null,
    driverLicenseName: "",
    driverLicense: null as File | null,
  },
};

type DriverSignupDraft = Omit<typeof initialFormData, "documents"> & {
  currentStep: number;
  documents: {
    driverLicenseName: string;
  };
};

type FormDataType = typeof initialFormData;

type Errors = Record<string, string>;

function loadDraft(): DriverSignupDraft | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return {
      ...initialFormData,
      ...parsed,
      documents: {
        driverLicenseName: parsed.documents?.driverLicenseName || "",
      },
      currentStep: parsed.currentStep || 1,
    } as DriverSignupDraft;
  } catch (error) {
    console.warn("Failed to load driver signup draft", error);
    return null;
  }
}

function saveDraft(state: DriverSignupDraft) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      currentStep: state.currentStep,
      signup: state.signup,
      vehicle: state.vehicle,
      documents: {
        driverLicenseName: state.documents.driverLicenseName,
      },
    }),
  );
}

// function clearDraft() {
//   if (typeof window === "undefined") return;
//   localStorage.removeItem(STORAGE_KEY);
// }

function validatePhone(value: string) {
  return /^\d{10}$/.test(value.replace(/\s/g, ""));
}

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function DriverSignupFlow() {
  const router = useRouter();
  const { signup } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormDataType>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [globalError, setGlobalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [finalSuccess, setFinalSuccess] = useState(false);

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setCurrentStep(draft.currentStep);
      setFormData((prev) => ({
        ...prev,
        ...draft,
        documents: {
          ...prev.documents,
          driverLicenseName: draft.documents.driverLicenseName,
        },
      }));
    }
  }, []);

  useEffect(() => {
    saveDraft({
      ...formData,
      currentStep,
      documents: {
        driverLicenseName: formData.documents.driverLicenseName,
      },
    });
  }, [currentStep, formData]);

  const progressValue = useMemo(
    () => Math.round((currentStep / STEPS.length) * 100),
    [currentStep],
  );

  const setField = (name: string, value: string | File | null) => {
    setFormData((prev) => {
      if (name in prev.signup) {
        return {
          ...prev,
          signup: {
            ...prev.signup,
            [name]: value,
          },
        } as FormDataType;
      }

      if (name in prev.vehicle) {
        return {
          ...prev,
          vehicle: {
            ...prev.vehicle,
            [name]: value,
          },
        } as FormDataType;
      }

      return {
        ...prev,
        documents: {
          ...prev.documents,
          [name]: value,
        },
      } as FormDataType;
    });
  };

  const handleStepChange = (stepId: number) => {
    if (stepId <= currentStep) {
      setGlobalError("");
      setSuccessMessage("");
      setCurrentStep(stepId);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setGlobalError("");
      setSuccessMessage("");
      setCurrentStep(currentStep - 1);
    }
  };

  const validateSignupStep = () => {
    const currentErrors: Errors = {};
    if (!formData.signup.name.trim()) {
      currentErrors.name = "Full name is required";
    }
    if (!formData.signup.email.trim()) {
      currentErrors.email = "Email is required";
    } else if (!validateEmail(formData.signup.email)) {
      currentErrors.email = "Please enter a valid email";
    }
    if (!formData.signup.phone.trim()) {
      currentErrors.phone = "Phone number is required";
    } else if (!validatePhone(formData.signup.phone)) {
      currentErrors.phone = "Enter a valid 10-digit phone number";
    }
    if (!formData.signup.password) {
      currentErrors.password = "Password is required";
    } else if (formData.signup.password.length < 8) {
      currentErrors.password = "Password must be at least 8 characters";
    }
    if (!formData.signup.confirmPassword) {
      currentErrors.confirmPassword = "Please confirm your password";
    } else if (formData.signup.confirmPassword !== formData.signup.password) {
      currentErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(currentErrors);
    setGlobalError("");
    return Object.keys(currentErrors).length === 0;
  };

  const handleSignupNext = async () => {
    if (!validateSignupStep()) {
      return;
    }

    setLoading(true);
    setGlobalError("");
    setSuccessMessage("");

    try {
      await signup({
        name: formData.signup.name.trim(),
        email: formData.signup.email.trim(),
        phone: formData.signup.phone.trim(),
        password: formData.signup.password,
        role: "DRIVER",
      });

      setSuccessMessage(
        "Account created. Sending verification OTP to your email.",
      );
      setCurrentStep(2);
      setOtpSending(true);
      await sendOtpApi({ email: formData.signup.email.trim() });
      setSuccessMessage(
        "OTP sent to your email. Enter it to verify your account.",
      );
    } catch (error: any) {
      const message =
        error?.message ||
        error?.response?.data?.message ||
        "Unable to create driver account. Please try again.";
      setGlobalError(message);
    } finally {
      setLoading(false);
      setOtpSending(false);
    }
  };

  const handleResendOtp = async () => {
    if (!validateEmail(formData.signup.email)) {
      setGlobalError("Enter a valid email to resend OTP.");
      return;
    }

    setOtpSending(true);
    setGlobalError("");
    setSuccessMessage("");

    try {
      await sendOtpApi({ email: formData.signup.email.trim() });
      setSuccessMessage("OTP resent. Please check your email.");
    } catch (error: any) {
      setGlobalError(error?.message || "Failed to resend OTP.");
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (
      !formData.signup.otp.trim() ||
      formData.signup.otp.trim().length !== 6
    ) {
      setGlobalError("Enter the 6-digit verification code.");
      return;
    }

    setVerifyLoading(true);
    setGlobalError("");
    setSuccessMessage("");

    try {
      await verifyEmailOtp({
        email: formData.signup.email.trim(),
        otp: formData.signup.otp.trim(),
      });
      setSuccessMessage(
        "Email verified successfully. Continue to finish onboarding.",
      );
      setCurrentStep(3);
    } catch (error: any) {
      setGlobalError(error?.message || "OTP verification failed.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const validateVehicleStep = () => {
    const currentErrors: Errors = {};
    if (!formData.vehicle.vehicleType) {
      currentErrors.vehicleType = "Vehicle type is required";
    } else if (
      !["CAR", "BIKE", "AUTO", "RIKSHAW", "VAN", "OTHER"].includes(
        formData.vehicle.vehicleType,
      )
    ) {
      currentErrors.vehicleType = "Invalid vehicle type";
    }
    if (!formData.vehicle.vehicleName.trim()) {
      currentErrors.vehicleName = "Vehicle name/model is required";
    } else if (formData.vehicle.vehicleName.trim().length < 2) {
      currentErrors.vehicleName = "Vehicle name must be at least 2 characters";
    }
    if (!formData.vehicle.vehicleNumber.trim()) {
      currentErrors.vehicleNumber = "Vehicle number is required";
    } else if (
      !/^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/.test(
        formData.vehicle.vehicleNumber.trim().toUpperCase(),
      )
    ) {
      currentErrors.vehicleNumber =
        "Vehicle number must be in format: XX00XX0000 (e.g., UP32AB1234)";
    }
    if (!formData.vehicle.seats.trim()) {
      currentErrors.seats = "Number of seats is required";
    } else {
      const seatsNum = Number(formData.vehicle.seats);
      if (isNaN(seatsNum) || seatsNum < 1 || seatsNum > 50) {
        currentErrors.seats = "Seats must be a number between 1 and 50";
      }
    }

    setErrors(currentErrors);
    setGlobalError("");
    return Object.keys(currentErrors).length === 0;
  };

  const handleVehicleNext = async () => {
    if (!validateVehicleStep()) {
      return;
    }

    setLoading(true);
    setGlobalError("");
    setSuccessMessage("");

    try {
      const form = new FormData();
      form.append("vehicleType", formData.vehicle.vehicleType);
      form.append("vehicleName", formData.vehicle.vehicleName);
      form.append("vehicleNumber", formData.vehicle.vehicleNumber);
      form.append("seats", formData.vehicle.seats);
      form.append("profileStep", "4");

      await updateDriverProfile(form);

      setSuccessMessage("Vehicle details saved. One final step remains.");
      setCurrentStep(4);
    } catch (error: any) {
      setGlobalError(error?.message || "Unable to save vehicle details.");
    } finally {
      setLoading(false);
    }
  };

  const validateDocumentsStep = () => {
    const currentErrors: Errors = {};
    if (!formData.documents.driverPhoto) {
      currentErrors.driverPhoto = "Driver photo is required";
    }
    if (!formData.documents.vehiclePhoto) {
      currentErrors.vehiclePhoto = "Vehicle photo is required";
    }
    if (!formData.documents.driverLicenseName.trim()) {
      currentErrors.driverLicenseName = "License holder name is required";
    }
    if (!formData.documents.driverLicense) {
      currentErrors.driverLicense = "Driving license image is required";
    }

    setErrors(currentErrors);
    setGlobalError("");
    return Object.keys(currentErrors).length === 0;
  };

  const handleComplete = async () => {
    if (!validateDocumentsStep()) return;

    setLoading(true);
    setGlobalError("");
    setSuccessMessage("");

    try {
      const form = new FormData();

      const driverName = formData.signup?.name?.trim();
      if (!driverName) throw new Error("Driver name required");

      let vehicleType = formData.vehicle.vehicleType.trim().toUpperCase();
      if (vehicleType === "CAB") vehicleType = "CAR";
      if (!vehicleType) throw new Error("Vehicle type required");

      const seatsValue = Number(formData.vehicle.seats);
      if (!seatsValue || seatsValue < 1) {
        throw new Error("Seats must be at least 1");
      }

      const vehicleNumber = formData.vehicle.vehicleNumber
        .replace(/\s+/g, "")
        .toUpperCase();
      if (!vehicleNumber) throw new Error("Vehicle number required");

      const vehicleName = formData.vehicle.vehicleName.trim();
      if (!vehicleName) throw new Error("Vehicle name required");

      const licenseName = formData.documents.driverLicenseName?.trim();
      if (!licenseName) throw new Error("License name required");

      const phone = formData.signup.phone.trim();
      const email = formData.signup.email.trim();

      const finalPayload = {
        driverName,
        vehicleType,
        vehicleName,
        vehicleNumber,
        seats: seatsValue,
        driverLicenseName: licenseName,
        phone: phone || undefined,
        email: email || undefined,
      };

      console.log("🚀 FINAL FORM DATA:", finalPayload);

      form.append("driverName", driverName);
      form.append("vehicleType", vehicleType);
      form.append("vehicleName", vehicleName);
      form.append("vehicleNumber", vehicleNumber);
      form.append("seats", String(seatsValue));
      form.append("driverLicenseName", licenseName);
      if (phone) form.append("phone", phone);
      if (email) form.append("email", email);

      if (!formData.documents.driverPhoto) {
        throw new Error("Driver photo missing");
      }
      form.append("driverPhoto", formData.documents.driverPhoto);

      if (!formData.documents.vehiclePhoto) {
        throw new Error("Vehicle photo missing");
      }
      form.append("vehiclePhoto", formData.documents.vehiclePhoto);

      if (!formData.documents.driverLicense) {
        throw new Error("Driving license image missing");
      }
      form.append("driverLicense", formData.documents.driverLicense);

      // Add profileStep to mark it as complete
      form.append("profileStep", "5");

      console.log("🚀 FINAL FORM DATA ENTRIES:", [...form.entries()]);

      await updateDriverProfile(form);

      setSuccessMessage(
        "Driver onboarding is complete. Your profile is submitted for review.",
      );

      setFinalSuccess(true);

      setTimeout(() => {
        router.push("/driver/dashboard");
      }, 1200);
    } catch (error: any) {
      setGlobalError(error?.message || "Unable to upload documents.");
    } finally {
      setLoading(false);
    }
  };

  const stepContent = () => {
    if (currentStep === 1) {
      return (
        <DriverStep1Signup
          formData={{
            name: formData.signup.name,
            email: formData.signup.email,
            phone: formData.signup.phone,
            password: formData.signup.password,
            confirmPassword: formData.signup.confirmPassword,
          }}
          errors={errors}
          loading={loading || otpSending}
          onChange={(field: string, value: string) => {
            setField(field, value);
            setErrors((prev) => ({ ...prev, [field]: "" }));
          }}
        />
      );
    }

    if (currentStep === 2) {
      return (
        <DriverStep2Verify
          email={formData.signup.email}
          otp={formData.signup.otp}
          error={globalError}
          success={successMessage}
          loading={verifyLoading}
          sending={otpSending}
          onOtpChange={(value) => {
            setField("otp", value);
            setGlobalError("");
          }}
          onVerify={handleVerifyOtp}
          onResend={handleResendOtp}
        />
      );
    }

    if (currentStep === 3) {
      return (
        <DriverStep4Vehicle
          formData={formData.vehicle}
          errors={errors}
          onChange={(field: string, value: string) => {
            setField(field, value);
            setErrors((prev) => ({ ...prev, [field]: "" }));
          }}
        />
      );
    }

    return (
      <DriverStep5Documents
        formData={formData.documents}
        errors={errors}
        onChange={(field: string, value: string | File | null) => {
          setField(field, value);
          setErrors((prev) => ({ ...prev, [field]: "" }));
        }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Driver Onboarding
          </h1>
          <p className="mt-2 text-slate-600">
            A guided signup flow to get you road-ready. Complete each step to
            submit your driver profile.
          </p>
        </div>

        <div className="mb-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            {STEPS.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => handleStepChange(step.id)}
                disabled={step.id > currentStep}
                className={`flex-1 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                  step.id === currentStep
                    ? "border-primary bg-primary text-white"
                    : step.id < currentStep
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-900 shadow-sm">
                    {step.id}
                  </span>
                  <span>{step.label}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{step.name}</p>
              </button>
            ))}
          </div>
          <div className="mt-4">
            <Progress value={progressValue} />
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].name}</CardTitle>
            <CardDescription>
              Step {currentStep} of {STEPS.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {globalError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5" />
                  <div>{globalError}</div>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <div>{successMessage}</div>
                </div>
              </div>
            )}

            {stepContent()}

            {finalSuccess ? (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button onClick={() => router.push("/driver/dashboard")}>
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={handlePrev}
                  disabled={currentStep === 1 || loading || verifyLoading}
                  variant="outline"
                  className="w-full sm:w-1/3"
                >
                  ← Previous
                </Button>

                <Button
                  onClick={() => {
                    if (currentStep === 1) handleSignupNext();
                    else if (currentStep === 2) handleVerifyOtp();
                    else if (currentStep === 3) handleVehicleNext();
                    else handleComplete();
                  }}
                  disabled={
                    loading ||
                    verifyLoading ||
                    otpSending ||
                    (currentStep === 2 && !formData.signup.otp.trim())
                  }
                  className="w-full sm:w-2/3"
                >
                  {loading || verifyLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : currentStep === 4 ? (
                    "Finish"
                  ) : currentStep === 2 ? (
                    "Verify OTP"
                  ) : (
                    "Next →"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
