'use client'

import Image from "next/image";
import { assets } from "@/public/assets/assets";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useBooking } from "@/contexts/BookingsContext";
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
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
} from "lucide-react";
import {
  createCabBookingApi,
  getCabLocationsApi,
  getCabCategoriesApi,
  calculateCabPriceApi,
  getCabAdditionalChargesApi,
} from "@/lib/api/cabBookings";
import { poppins } from "@/lib/fonts";

// Utility to parse Date & Time to local JS Date
const parseDateTime = (dateStr: string, timeStr: string): Date => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  let hours = 0;
  let minutes = 0;

  const cleanTime = timeStr.trim().toLowerCase();
  const ampmMatch = cleanTime.match(/^(\d+):(\d+)\s*(am|pm)$/);
  if (ampmMatch) {
    hours = parseInt(ampmMatch[1], 10);
    minutes = parseInt(ampmMatch[2], 10);
    const ampm = ampmMatch[3];
    if (ampm === "pm" && hours < 12) {
      hours += 12;
    } else if (ampm === "am" && hours === 12) {
      hours = 0;
    }
  } else {
    const normalMatch = cleanTime.match(/^(\d+):(\d+)$/);
    if (normalMatch) {
      hours = parseInt(normalMatch[1], 10);
      minutes = parseInt(normalMatch[2], 10);
    }
  }

  return new Date(year, month, day, hours, minutes);
};

export default function BookCabPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const { setCurrentBooking } = useBooking();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [numPeople, setNumPeople] = useState("1");
  const [startDate, setStartDate] = useState("");

  // Dynamic values loaded from backend
  const [locations, setLocations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [pickupLocationId, setPickupLocationId] = useState("");
  const [dropoffLocationId, setDropoffLocationId] = useState("");
  const [carCategoryId, setCarCategoryId] = useState("");
  const [pickupTime, setPickupTime] = useState("");

  // Configured assistance charges
  const [assistanceRates, setAssistanceRates] = useState<{
    wheelchairCharge: number;
    medicalSupportCharge: number;
  }>({ wheelchairCharge: 0, medicalSupportCharge: 0 });

  // Live pricing
  const [pricing, setPricing] = useState<{
    price: number;
    tax: number;
    wheelchairCharge: number;
    medicalSupportCharge: number;
    totalAmount: number;
    taxPercent: number;
    notes?: string;
  } | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);

  // Special assistance checkbox flags
  const [wheelchair, setWheelchair] = useState(false);
  const [medicalSupport, setMedicalSupport] = useState(false);
  const [elderlyCare, setElderlyCare] = useState(false);
  const [childCare, setChildCare] = useState(false);

  // Terms & Conditions state
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsError, setTermsError] = useState("");

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    getCabLocationsApi()
      .then((res: any) => {
        setLocations(Array.isArray(res) ? res : res?.data || []);
      })
      .catch((err) => console.error("Error fetching locations:", err));

    getCabCategoriesApi()
      .then((res: any) => {
        setCategories(Array.isArray(res) ? res : res?.data || []);
      })
      .catch((err) => console.error("Error fetching categories:", err));

    getCabAdditionalChargesApi()
      .then((res: any) => {
        setAssistanceRates({
          wheelchairCharge: res?.wheelchairCharge ?? 0,
          medicalSupportCharge: res?.medicalSupportCharge ?? 0,
        });
      })
      .catch((err) => console.error("Error fetching assistance rates:", err));
  }, []);

  // Live Pricing Query whenever selections or assistance options change
  useEffect(() => {
    if (pickupLocationId && dropoffLocationId && carCategoryId) {
      setPricingLoading(true);
      setPricingError(null);
      calculateCabPriceApi(pickupLocationId, dropoffLocationId, carCategoryId, wheelchair, medicalSupport)
        .then((res) => {
          setPricing(res);
        })
        .catch((err) => {
          console.error("Pricing fetch error:", err);
          setPricing(null);
          setPricingError(err.message || "Pricing not configured for this route.");
        })
        .finally(() => {
          setPricingLoading(false);
        });
    } else {
      setPricing(null);
      setPricingError(null);
    }
  }, [pickupLocationId, dropoffLocationId, carCategoryId, wheelchair, medicalSupport]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push(
        `/login?redirect=${encodeURIComponent(pathname || "/tourist/cabs/book-cab")}`
      );
    }
  }, [isLoggedIn, authLoading, router, pathname]);

  // Time slots generator
  const generateTimeSlots = () => {
    const slots = [];
    for (let h = 0; h < 24; h++) {
      const ampm = h >= 12 ? "PM" : "AM";
      const displayHour = h % 12 === 0 ? 12 : h % 12;
      const hrStr = String(displayHour).padStart(2, "0");
      slots.push(`${hrStr}:00 ${ampm}`);
      slots.push(`${hrStr}:30 ${ampm}`);
    }
    return slots;
  };

  const isSlotDisabled = (slot: string) => {
    if (!startDate) return false;
    const todayStr = new Date().toISOString().split("T")[0];
    if (startDate !== todayStr) return false;

    try {
      const parsedDateTime = parseDateTime(startDate, slot);
      const now = new Date();
      // Disable slot if it is less than 1 hour away from current time
      return parsedDateTime.getTime() - now.getTime() < 60 * 60 * 1000;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !fullName ||
      !phone ||
      !numPeople ||
      !startDate ||
      !pickupTime ||
      !pickupLocationId ||
      !dropoffLocationId ||
      !carCategoryId
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (phone.length !== 10) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }

    // Double check minimum advance booking time (1 hour away)
    try {
      const pickupDateTime = parseDateTime(startDate, pickupTime);
      const now = new Date();
      if (pickupDateTime.getTime() - now.getTime() < 60 * 60 * 1000) {
        setError("Cab bookings must be scheduled at least 1 hour in advance.");
        return;
      }
    } catch (e) {
      setError("Invalid pickup date or time.");
      return;
    }

    if (pricingError) {
      setError(pricingError);
      return;
    }

    setIsSubmitting(true);

    try {
      const createdBooking = await createCabBookingApi({
        fullName,
        phone,
        numPeople: Number(numPeople),
        startDate,
        pickupLocationId,
        dropoffLocationId,
        carCategoryId,
        pickupTime,
        specialAssistance: {
          wheelchair,
          medicalSupport,
          elderlyCare,
          childCare,
        },
      });

      const bId = createdBooking?._id || createdBooking?.id || createdBooking?.data?._id || createdBooking?.data?.id;
      setCurrentBooking({
        ...createdBooking,
        id: bId,
        bookingType: "CAB",
      });
      router.push(`/tourist/payment?bookingId=${bId}`);
    } catch (err: any) {
      console.error("Booking error:", err);
      setError(err?.message || "Failed to submit booking request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <main
        className={`${poppins.className} min-h-screen bg-slate-50 text-slate-900 flex flex-col`}
      >
        <Header />
        <div className="flex-grow flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main
      className={`${poppins.className} min-h-screen bg-white text-slate-900 flex flex-col`}
    >
      <Header showBackButton />
      <div className="flex items-center justify-center">

        {assets.evoke && (
          <Image
            src={assets.evoke}
            alt="Evoke Logo"
            className="relative pt-6 w-64 h-auto object-contain"
          />
        )}
      </div>
      <div className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* POSTER BANNER */}
          <section className="relative overflow-hidden rounded-[2.5rem] border border-indigo-100 bg-gradient-to-r from-amber-950 via-amber-900 to-amber-900 text-white p-8 sm:p-10 md:p-12 shadow-2xl shadow-indigo-950/20">
            <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />


            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
              <div className="space-y-4 text-center md:text-left">
                {/* Logo & Powered By Header */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pb-1">
                  <div className="inline-flex items-center gap-1.5 bg-amber-400/20 border border-amber-300/40 rounded-full px-3.5 py-1 text-xs font-bold text-amber-300 tracking-wide uppercase">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Powered by <strong className="text-white font-extrabold text-[12px] tracking-normal">GoGuide</strong></span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight tracking-tight text-white">
                  Travel Desk for <strong className="text-amber-300 font-extrabold tracking-normal">Evoke Rambagh {" "}</strong>Ayodhya
                </h1>

                <p className="text-indigo-200 text-xs sm:text-sm md:text-base max-w-md">
                  Experience a seamless, luxury journey tailored specifically to your route and assistance needs.
                </p>

                {/* Talk to Consultant Buttons */}
                <div className="pt-2">
                  {/* Mobile direct click tel */}
                  <a href="tel:+918881993735" className="block md:hidden">
                    <Button className="w-full bg-amber-300 hover:bg-amber-400 text-black font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" />
                      Talk to Consultant
                    </Button>
                  </a>

                  {/* Desktop show number */}
                  <div className="hidden md:block">
                    <a href="tel:+918881993735">
                      <Button className="bg-amber-300 hover:bg-amber-400 text-black font-semibold px-6 py-6 rounded-2xl flex items-center gap-3 text-base shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02]">
                        <Phone className="w-5 h-5 animate-pulse" />
                        <span>
                          Talk to Consultant: <strong>+91 88819 93735</strong>
                        </span>
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

              {/* Clipart - Minimalist Premium Car Graphic */}
              <div className="flex justify-center items-center">
                <svg
                  className="w-full max-w-[280px] h-auto text-indigo-400 drop-shadow-lg"
                  viewBox="0 0 200 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="100" cy="60" r="50" fill="url(#paint0_radial)" opacity="0.3" />
                  <path d="M10 95H190" stroke="#475569" strokeWidth="2" strokeDasharray="6 6" />
                  {/* Premium Car */}
                  <path
                    d="M50 78C50 78 54 62 68 60C82 58 118 58 132 60C146 62 150 78 150 78C156 78 162 81 162 87C162 93 156 95 150 95H50C44 95 38 93 38 87C38 81 44 78 50 78Z"
                    fill="url(#paint1_linear)"
                  />
                  <path d="M70 63H97V74H58C60 68 65 64 70 63Z" fill="#E2E8F0" opacity="0.9" />
                  <path d="M103 63H130C135 64 140 68 142 74H103V63Z" fill="#E2E8F0" opacity="0.9" />
                  {/* Wheels */}
                  <circle cx="70" cy="95" r="11" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2.5" />
                  <circle cx="70" cy="95" r="4" fill="#94A3B8" />
                  <circle cx="130" cy="95" r="11" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2.5" />
                  <circle cx="130" cy="95" r="4" fill="#94A3B8" />
                  <defs>
                    <radialGradient
                      id="paint0_radial"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(100 60) rotate(90) scale(50)"
                    >
                      <stop stopColor="#6366F1" stopOpacity="0.5" />
                      <stop offset="1" stopColor="#6366F1" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient
                      id="paint1_linear"
                      x1="38"
                      y1="78"
                      x2="162"
                      y2="78"
                      gradientUnits="userSpaceOnUse"
                    >
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
                Your booking request has been received. We will verify availability and send a confirmation email with complete details shortly.
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
                    setPickupLocationId("");
                    setDropoffLocationId("");
                    setCarCategoryId("");
                    setPickupTime("");
                    setPricing(null);
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
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-slate-200 rounded-[2rem] p-6 sm:p-10 shadow-md space-y-8"
            >
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-2xl font-bold text-slate-900">Ride Information Form</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Please provide accurate travel details. Asterisk (*) denotes required fields.
                </p>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Personal Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-l-4 border-amber-600 pl-3">
                  1. Contact Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullname" className="font-semibold text-slate-700">
                      Full Name *
                    </Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-semibold text-slate-700">
                      Mobile Number *
                    </Label>
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
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-l-4 border-amber-600 pl-3">
                  2. Travel Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="startdate" className="font-semibold text-slate-700">
                      Planned Start Date *
                    </Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="pickuptime" className="font-semibold text-slate-700">
                      Pickup Time Slot *
                    </Label>
                    <Select value={pickupTime} onValueChange={setPickupTime}>
                      <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50/50 h-11">
                        <SelectValue placeholder="Select Pickup Time" />
                      </SelectTrigger>
                      <SelectContent>
                        {generateTimeSlots().map((slot) => {
                          const disabled = isSlotDisabled(slot);
                          return (
                            <SelectItem key={slot} value={slot} disabled={disabled}>
                              {slot} {disabled ? "(Too early)" : ""}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2 col-span-1">
                    <Label htmlFor="numpeople" className="font-semibold text-slate-700">
                      Number of People *
                    </Label>
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

                  <div className="space-y-2 col-span-1">
                    <Label htmlFor="pickup" className="font-semibold text-slate-700">
                      Pickup Location *
                    </Label>
                    <Select value={pickupLocationId} onValueChange={setPickupLocationId}>
                      <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50/50 h-11">
                        <SelectValue placeholder="Select Pickup Location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations
                          .filter((l) => l.isActive && (l.type === "pickup" || l.type === "both"))
                          .map((l) => (
                            <SelectItem key={l._id} value={l._id}>
                              {l.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 col-span-1">
                    <Label htmlFor="dropoff" className="font-semibold text-slate-700">
                      Dropoff Location *
                    </Label>
                    <Select value={dropoffLocationId} onValueChange={setDropoffLocationId}>
                      <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50/50 h-11">
                        <SelectValue placeholder="Select Dropoff Location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations
                          .filter((l) => l.isActive && (l.type === "dropoff" || l.type === "both"))
                          .map((l) => (
                            <SelectItem key={l._id} value={l._id}>
                              {l.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                </div>
              </div>

              {/* Vehicle Specifications */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-l-4 border-amber-600 pl-3">
                  3. Vehicle Class
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2">
                    <Label className="font-semibold text-slate-700">Car Category *</Label>
                    <Select value={carCategoryId} onValueChange={setCarCategoryId}>
                      <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50/50 h-11">
                        <SelectValue placeholder="Select Car Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories
                          .filter((c) => c.isActive)
                          .map((c) => (
                            <SelectItem key={c._id} value={c._id}>
                              {c.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Special Assistance */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-l-4 border-amber-600 pl-3">
                  4. Special Assistance Required
                </h3>

                <p className="text-sm text-slate-500">
                  Check all categories that apply to travelers in your group. Selected add-ons add configured fees to final total:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${wheelchair
                      ? "bg-rose-50/50 border-rose-400 text-rose-700 font-semibold"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={wheelchair}
                      onChange={(e) => setWheelchair(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
                    />
                    <div className="flex flex-col">
                      <span>Wheelchair</span>
                      {assistanceRates.wheelchairCharge > 0 && (
                        <span className="text-[10px] text-slate-500 font-normal">
                          + ₹{assistanceRates.wheelchairCharge}
                        </span>
                      )}
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${medicalSupport
                      ? "bg-rose-50/50 border-rose-400 text-rose-700 font-semibold"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={medicalSupport}
                      onChange={(e) => setMedicalSupport(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
                    />
                    <div className="flex flex-col">
                      <span>Medical Support</span>
                      {assistanceRates.medicalSupportCharge > 0 && (
                        <span className="text-[10px] text-slate-500 font-normal">
                          + ₹{assistanceRates.medicalSupportCharge}
                        </span>
                      )}
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${elderlyCare
                      ? "bg-rose-50/50 border-rose-400 text-rose-700 font-semibold"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={elderlyCare}
                      onChange={(e) => setElderlyCare(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
                    />
                    <span>Elderly Care</span>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${childCare
                      ? "bg-rose-50/50 border-rose-400 text-rose-700 font-semibold"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                  >
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

              {/* Dynamic Rate Summary (Calculated entirely on Backend) */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-base font-bold text-slate-800 uppercase tracking-wider">
                  Price Details
                </h3>

                {pricingLoading && (
                  <div className="p-4 text-center rounded-xl bg-indigo-50/50 border border-indigo-100">
                    <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs text-indigo-600">Calculating fare from route pricing...</p>
                  </div>
                )}

                {!pricingLoading && pricing && (
                  <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Route Fare:</span>
                        <span className="font-semibold text-slate-900">₹{pricing.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">
                          GST / Tax ({pricing.taxPercent}%):
                        </span>
                        <span className="font-semibold text-slate-900">₹{pricing.tax}</span>
                      </div>
                      {pricing.wheelchairCharge > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Wheelchair Assistance Fee:</span>
                          <span className="font-semibold text-slate-900">₹{pricing.wheelchairCharge}</span>
                        </div>
                      )}
                      {pricing.medicalSupportCharge > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Medical Support Fee:</span>
                          <span className="font-semibold text-slate-900">₹{pricing.medicalSupportCharge}</span>
                        </div>
                      )}
                      <div className="border-t border-indigo-200/50 pt-2 flex justify-between font-bold text-base">
                        <span className="text-indigo-950 font-bold">Total price (incl. GST):</span>
                        <span className="text-indigo-950 font-bold">₹{pricing.totalAmount}</span>
                      </div>
                    </div>
                    {pricing.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-1 font-semibold">
                        Notes: {pricing.notes}
                      </p>
                    )}
                  </div>
                )}

                {!pricingLoading && !pricing && (
                  <div className="p-4 rounded-xl bg-slate-100 text-slate-500 text-xs text-center border border-dashed border-slate-200">
                    Select Pickup, Drop, and Vehicle Category to view fare (+ Tax GST always applicable).
                  </div>
                )}
              </div>

              {/* Terms & Conditions Checkbox */}
              <div className="pt-2 space-y-1">
                <label className="flex items-start gap-3 cursor-pointer text-xs sm:text-sm text-slate-700 select-none bg-slate-50 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-100/80 transition">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => {
                      setAgreedTerms(e.target.checked);
                      if (e.target.checked) setTermsError("");
                    }}
                    className="mt-0.5 h-4.5 w-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0 cursor-pointer"
                  />
                  <span className="leading-snug">
                    I have read and agree to the{" "}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowTermsModal(true);
                      }}
                      className="text-amber-600 hover:text-indigo-800 font-bold underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      Travel Desk Terms & Conditions
                    </button>{" "}
                    and Privacy Policy.
                  </span>
                </label>
                {termsError && (
                  <p className="text-xs text-rose-600 font-semibold pl-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{termsError}</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || pricingLoading || !!pricingError || !pricing || !agreedTerms}
                  className="w-full bg-amber-950 hover:bg-amber-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-amber-950 text-white font-semibold rounded-xl text-base shadow-lg transition-all"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2 justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting Request...
                    </span>
                  ) : (
                    "Submit Cab Booking Request"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Travel Desk Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-amber-950 text-white flex justify-between items-start shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg sm:text-xl font-bold">Travel Desk Terms & Conditions</h3>
                </div>
                <p className="text-xs sm:text-sm text-indigo-200">
                  Evoke Rambagh Ayodhya | Travel Desk Managed by GoGuide
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-700 leading-relaxed max-h-[60vh]">
              <p className="font-medium text-slate-900 bg-indigo-50/60 p-3 rounded-xl border border-indigo-100">
                By submitting a travel enquiry or confirming a booking through the Travel Desk, you agree to the following Terms & Conditions.
              </p>

              <ol className="space-y-4 list-decimal pl-4">
                <li className="pl-1">
                  <strong className="text-slate-900 font-semibold block mb-1">Booking Window</strong>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>Travel requests can be submitted up to 12 hours in advance.</li>
                    <li>The minimum booking time is 2 hours before the scheduled pickup, subject to vehicle availability.</li>
                    <li>Requests made within 2 hours of pickup may not be accommodated.</li>
                  </ul>
                </li>

                <li className="pl-1">
                  <strong className="text-slate-900 font-semibold block mb-1">Booking Confirmation</strong>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>A booking is considered confirmed only after receiving confirmation from the GoGuide Travel Desk.</li>
                    <li>Vehicle allocation is subject to availability at the time of confirmation.</li>
                  </ul>
                </li>

                <li className="pl-1">
                  <strong className="text-slate-900 font-semibold block mb-1">Guest Information</strong>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>Guests must provide accurate contact details, pickup location, destination, travel date, and passenger information.</li>
                    <li>Incorrect or incomplete information may result in delays or cancellation of the booking.</li>
                  </ul>
                </li>

                <li className="pl-1">
                  <strong className="text-slate-900 font-semibold block mb-1">Vehicle Allocation</strong>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>Vehicles are assigned based on availability and the selected category.</li>
                    <li>In exceptional circumstances, an equivalent or higher category vehicle may be provided without prior notice.</li>
                  </ul>
                </li>

                <li className="pl-1">
                  <strong className="text-slate-900 font-semibold block mb-1">Pickup & Waiting Time</strong>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>Complimentary waiting time: Hotel Pickup (15 min), Railway Station Pickup (30 min), Airport Pickup (45 min).</li>
                    <li>Additional waiting charges may apply beyond the complimentary waiting period.</li>
                  </ul>
                </li>

                <li className="pl-1">
                  <strong className="text-slate-900 font-semibold block mb-1">Cancellation Policy</strong>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>12 hours or more before pickup: Free Cancellation.</li>
                    <li>Between 2 and 12 hours before pickup: 70% Cancellation Charges will apply.</li>
                    <li>Less than 2 hours before pickup or No-Show: Up to 70% of the total booking amount will be charged.</li>
                  </ul>
                </li>

                <li className="pl-1">
                  <strong className="text-slate-900 font-semibold block mb-1">Route Changes</strong>
                  <p className="text-slate-600">Any change in route, destination, or additional stops after the trip has started may attract extra charges.</p>
                </li>

                <li className="pl-1">
                  <strong className="text-slate-900 font-semibold block mb-1">Toll, Parking & State Taxes</strong>
                  <p className="text-slate-600">Toll charges, parking fees, and applicable state taxes will be charged as per the selected package unless specifically mentioned as included.</p>
                </li>

                <li className="pl-1">
                  <strong className="text-slate-900 font-semibold block mb-1">Payment</strong>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>Payment may be collected in advance or at the completion of the trip, depending on the booking type.</li>
                    <li>Accepted payment methods include UPI, Cash, Credit/Debit Cards, and other available digital payment options.</li>
                  </ul>
                </li>

                <li className="pl-1">
                  <strong className="text-slate-900 font-semibold block mb-1">Luggage</strong>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>Guests are responsible for their personal luggage and belongings.</li>
                    <li>The Travel Desk and Hotel shall not be responsible for any lost, damaged, or unattended items.</li>
                  </ul>
                </li>

                <li className="pl-1">
                  <strong className="text-slate-900 font-semibold block mb-1">Flight or Train Delays</strong>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>Guests are requested to inform the Travel Desk immediately in case of any delay in flight or train arrival.</li>
                    <li>Every effort will be made to adjust the pickup; however, availability cannot be guaranteed.</li>
                  </ul>
                </li>

                <li className="pl-1">
                  <strong className="text-slate-900 font-semibold block mb-1">Driver Conduct</strong>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>All drivers are expected to maintain professional behavior and follow applicable traffic laws.</li>
                    <li>Guests are requested to treat drivers with respect throughout the journey.</li>
                  </ul>
                </li>

                <li className="pl-1">
                  <strong className="text-slate-900 font-semibold block mb-1">Force Majeure</strong>
                  <p className="text-slate-600">The Travel Desk shall not be held responsible for delays or service interruptions caused by circumstances beyond reasonable control, including but not limited to traffic congestion, road closures, adverse weather conditions, strikes, government restrictions, or natural disasters.</p>
                </li>

                <li className="pl-1">
                  <strong className="text-slate-900 font-semibold block mb-1">Liability</strong>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>The Travel Desk&apos;s responsibility is limited to arranging transportation services.</li>
                    <li>Neither Evoke Rambagh Ayodhya nor GoGuide shall be liable for indirect, incidental, or consequential losses arising from unforeseen circumstances.</li>
                  </ul>
                </li>

                <li className="pl-1">
                  <strong className="text-slate-900 font-semibold block mb-1">Right to Refuse Service</strong>
                  <p className="text-slate-600">The Travel Desk reserves the right to refuse or cancel any booking in cases involving safety concerns, abusive behavior, fraudulent activity, or violation of these Terms & Conditions.</p>
                </li>

                <li className="pl-1">
                  <strong className="text-slate-900 font-semibold block mb-1">Acceptance</strong>
                  <p className="text-slate-600">By submitting a booking request, the guest confirms that they have read, understood, and agreed to these Terms & Conditions.</p>
                </li>
              </ol>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTermsModal(false)}
                className="rounded-xl text-slate-600"
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setAgreedTerms(true);
                  setTermsError("");
                  setShowTermsModal(false);
                }}
                className="bg-amber-950 hover:bg-amber-900 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                I Agree & Accept Terms
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
