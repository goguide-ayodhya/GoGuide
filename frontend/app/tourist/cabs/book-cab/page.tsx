"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Car,
  Calendar,
  Users,
  MapPin,
  Clock,
  Phone,
  Heart,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { getPublicSettingsApi } from "@/lib/api/finance";
import { createCabBookingApi } from "@/lib/api/cabBookings";
import { poppins } from "@/lib/fonts";

export default function BookCabPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, loading: authLoading } = useAuth();

  // Settings
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([
    "Sedan",
    "SUV",
    "Tempo Traveller",
    "Auto Rikshaw",
  ]);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [numPeople, setNumPeople] = useState("1");
  const [startDate, setStartDate] = useState("");
  const [numDays, setNumDays] = useState("1");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [acPreference, setAcPreference] = useState<"AC" | "Non-AC">("AC");

  // Special assistance checkbox flags
  const [wheelchair, setWheelchair] = useState(false);
  const [medicalSupport, setMedicalSupport] = useState(false);
  const [elderlyCare, setElderlyCare] = useState(false);
  const [childCare, setChildCare] = useState(false);

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch settings for vehicle list
  useEffect(() => {
    getPublicSettingsApi()
      .then((data: any) => {
        if (data?.vehicleTypes && data.vehicleTypes.length > 0) {
          setVehicleTypes(data.vehicleTypes);
        }
      })
      .catch((err) => console.error("Error fetching vehicle list:", err));
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(pathname || "/tourist/cabs/book-cab")}`);
    }
  }, [isLoggedIn, authLoading, router, pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName || !phone || !numPeople || !startDate || !numDays || !pickupLocation || !dropoffLocation || !vehicleType) {
      setError("Please fill in all required fields.");
      return;
    }

    if (phone.length !== 10) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createCabBookingApi({
        fullName,
        phone,
        numPeople: Number(numPeople),
        startDate,
        numDays: Number(numDays),
        pickupLocation,
        dropoffLocation,
        vehicleType,
        acPreference,
        specialAssistance: {
          wheelchair,
          medicalSupport,
          elderlyCare,
          childCare,
        },
      });

      setSuccess(true);
    } catch (err: any) {
      console.error("Booking error:", err);
      setError(err?.message || "Failed to submit booking request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <main className={`${poppins.className} min-h-screen bg-slate-50 text-slate-900 flex flex-col`}>
        <Header />
        <div className="flex-grow flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className={`${poppins.className} min-h-screen bg-slate-50 text-slate-900 flex flex-col`}>
      <Header showBackButton />

      <div className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* POSTER BANNER */}
          <section className="relative overflow-hidden rounded-[2rem] border border-indigo-100 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-8 md:p-12 shadow-xl shadow-indigo-950/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
              <div className="space-y-4 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Premium Services
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
                  Book A Premium Cab
                </h1>
                <p className="text-indigo-200 text-sm md:text-base max-w-md">
                  Experience a seamless, luxury journey tailored specifically to your group size and assistance needs.
                </p>

                {/* Talk to Consultant Buttons */}
                <div className="pt-4">
                  {/* Mobile direct click tel */}
                  <a href="tel:+918881993735" className="block md:hidden">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" />
                      Talk to Consultant
                    </Button>
                  </a>

                  {/* Desktop show number */}
                  <div className="hidden md:block">
                    <a href="tel:+918881993735">
                      <Button className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-6 rounded-2xl flex items-center gap-3 text-base shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02]">
                        <Phone className="w-5 h-5 animate-pulse" />
                        <span>Talk to Consultant: <strong>+91 88819 93735</strong></span>
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

              {/* Clipart - Minimalist Premium Car Graphic */}
              <div className="flex justify-center items-center">
                <svg className="w-full max-w-[280px] h-auto text-indigo-400 drop-shadow-lg" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="100" cy="60" r="50" fill="url(#paint0_radial)" opacity="0.3" />
                  <path d="M10 95H190" stroke="#475569" strokeWidth="2" strokeDasharray="6 6" />
                  {/* Premium Car */}
                  <path d="M50 78C50 78 54 62 68 60C82 58 118 58 132 60C146 62 150 78 150 78C156 78 162 81 162 87C162 93 156 95 150 95H50C44 95 38 93 38 87C38 81 44 78 50 78Z" fill="url(#paint1_linear)" />
                  <path d="M70 63H97V74H58C60 68 65 64 70 63Z" fill="#E2E8F0" opacity="0.9" />
                  <path d="M103 63H130C135 64 140 68 142 74H103V63Z" fill="#E2E8F0" opacity="0.9" />
                  {/* Wheels */}
                  <circle cx="70" cy="95" r="11" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2.5" />
                  <circle cx="70" cy="95" r="4" fill="#94A3B8" />
                  <circle cx="130" cy="95" r="11" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2.5" />
                  <circle cx="130" cy="95" r="4" fill="#94A3B8" />
                  <defs>
                    <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(100 60) rotate(90) scale(50)">
                      <stop stopColor="#6366F1" stopOpacity="0.5" />
                      <stop offset="1" stopColor="#6366F1" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="paint1_linear" x1="38" y1="78" x2="162" y2="78" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#818CF8" />
                      <stop offset="1" stopColor="#22D3EE" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </section>

          {/* SUCCESS STATE */}
          {success ? (
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 md:p-12 text-center shadow-lg space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
              <h2 className="text-3xl font-extrabold text-slate-900">Cab Request Submitted!</h2>
              <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
                Your booking request is received. We are verifying availability and our admin team will reach out to you shortly to confirm the ride.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => router.push("/tourist/bookings")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-full"
                >
                  My Bookings
                </Button>
                <Button
                  onClick={() => {
                    setSuccess(false);
                    setFullName("");
                    setPhone("");
                    setNumPeople("1");
                    setStartDate("");
                    setNumDays("1");
                    setPickupLocation("");
                    setDropoffLocation("");
                    setVehicleType("");
                    setWheelchair(false);
                    setMedicalSupport(false);
                    setElderlyCare(false);
                    setChildCare(false);
                  }}
                  variant="outline"
                  className="border-slate-300 rounded-full px-8 py-3"
                >
                  Book Another Cab
                </Button>
              </div>
            </div>
          ) : (
            /* BOOKING FORM */
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-[2rem] p-6 sm:p-10 shadow-md space-y-8">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-2xl font-bold text-slate-900">Ride Information Form</h2>
                <p className="text-slate-500 text-sm mt-1">Please provide accurate travel details. Asterisk (*) denotes required fields.</p>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Personal Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
                  1. Contact Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullname" className="font-semibold text-slate-700">Full Name *</Label>
                    <div className="relative">
                      <Input
                        id="fullname"
                        type="text"
                        placeholder="Enter full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-semibold text-slate-700">Mobile Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setPhone(val);
                      }}
                      required
                      className="rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Travel Specifications */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
                  2. Travel Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="startdate" className="font-semibold text-slate-700">Planned Start Date *</Label>
                    <div className="relative">
                      <Input
                        id="startdate"
                        type="date"
                        value={startDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        className="rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numdays" className="font-semibold text-slate-700">Number of Days Stay *</Label>
                    <Input
                      id="numdays"
                      type="number"
                      min="1"
                      max="60"
                      value={numDays}
                      onChange={(e) => setNumDays(e.target.value)}
                      required
                      className="rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numpeople" className="font-semibold text-slate-700">Number of People *</Label>
                    <Input
                      id="numpeople"
                      type="number"
                      min="1"
                      max="100"
                      value={numPeople}
                      onChange={(e) => setNumPeople(e.target.value)}
                      required
                      className="rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="pickup" className="font-semibold text-slate-700">Pickup Location *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <Input
                        id="pickup"
                        type="text"
                        placeholder="Hotel, Station, or Landmark"
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        required
                        className="rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white pl-10 h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dropoff" className="font-semibold text-slate-700">Dropoff Location *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <Input
                        id="dropoff"
                        type="text"
                        placeholder="Destination name or Landmark"
                        value={dropoffLocation}
                        onChange={(e) => setDropoffLocation(e.target.value)}
                        required
                        className="rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white pl-10 h-11"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Specifications */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
                  3. Vehicle & Comfort Preferences
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-semibold text-slate-700">Type of Vehicle *</Label>
                    <Select value={vehicleType} onValueChange={setVehicleType}>
                      <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50/50 h-11">
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicleTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold text-slate-700">AC Preference *</Label>
                    <div className="flex gap-4 pt-1">
                      <button
                        type="button"
                        onClick={() => setAcPreference("AC")}
                        className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${acPreference === "AC"
                          ? "bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm"
                          : "border-slate-200 hover:bg-slate-50 text-slate-600"
                          }`}
                      >
                        AC Preference
                      </button>
                      <button
                        type="button"
                        onClick={() => setAcPreference("Non-AC")}
                        className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${acPreference === "Non-AC"
                          ? "bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm"
                          : "border-slate-200 hover:bg-slate-50 text-slate-600"
                          }`}
                      >
                        Non-AC Preference
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Assistance */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
                  4. Special Assistance Required
                </h3>

                <p className="text-sm text-slate-500">Check all categories that apply to travelers in your group:</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${wheelchair ? "bg-rose-50/50 border-rose-400 text-rose-700 font-semibold" : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}>
                    <input
                      type="checkbox"
                      checked={wheelchair}
                      onChange={(e) => setWheelchair(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
                    />
                    <span>Wheelchair</span>
                  </label>

                  <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${medicalSupport ? "bg-rose-50/50 border-rose-400 text-rose-700 font-semibold" : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}>
                    <input
                      type="checkbox"
                      checked={medicalSupport}
                      onChange={(e) => setMedicalSupport(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
                    />
                    <span>Medical Support</span>
                  </label>

                  <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${elderlyCare ? "bg-rose-50/50 border-rose-400 text-rose-700 font-semibold" : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}>
                    <input
                      type="checkbox"
                      checked={elderlyCare}
                      onChange={(e) => setElderlyCare(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
                    />
                    <span>Elderly Care</span>
                  </label>

                  <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${childCare ? "bg-rose-50/50 border-rose-400 text-rose-700 font-semibold" : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}>
                    <input
                      type="checkbox"
                      checked={childCare}
                      onChange={(e) => setChildCare(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
                    />
                    <span>Child Care</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-indigo-600 hover:to-indigo-800 text-white font-semibold cursor-pointer rounded-xl text-base shadow-lg shadow-indigo-600/10 transition-all"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2 justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting Request...
                    </span>
                  ) : (
                    "Submit Cab Enquiry "
                  )}
                </Button>
              </div>

            </form>
          )}

        </div>
      </div>

      <Footer />
    </main>
  );
}
