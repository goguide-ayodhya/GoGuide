"use client";

import { useEffect, useState } from "react";
import { useBooking } from "@/contexts/BookingsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "./FormField";
import { PriceBreakdown } from "./PriceBreakdown";
import { Card } from "@/components/ui/card";
import { Calendar, Users, FileText, MapPin } from "lucide-react";
import { poppins } from "@/lib/fonts";

interface PackageBookingFormProps {
  packagePrice?: number;
  packageTitle?: string;
  boxBorder?: string;
  borderStyle?: string;
  boxStyle?: string;
  buttonStyle?: string;
  maxGroupSize?: number;
  discount?: number;
  onSubmit: (data: {
    startDate: string;
    groupSize: number;
    notes: string;
    touristName: string;
    email: string;
    phone: string;
    totalPrice: number;
    bookingDate: string;
    bookingType: string;
  }) => void;
  isLoading?: boolean;
}

export function PackageBookingForm({
  packagePrice = 0,
  packageTitle = "Tour Package",
  discount = 0,
  onSubmit,
  isLoading,
  boxStyle,
  boxBorder,
  buttonStyle,
  maxGroupSize = 3,
}: PackageBookingFormProps) {
  const { currentBooking, setCurrentBooking } = useBooking();
  const [startDate, setStartDate] = useState(currentBooking?.bookingDate || "");
  const [groupSize, setGroupSize] = useState(
    currentBooking?.groupSize?.toString() || "1",
  );
  const [notes, setNotes] = useState(currentBooking?.notes || "");
  const [touristName, setTouristName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hydrated, setHydrated] = useState(false);

  const numParticipants = parseInt(groupSize) || 1;
  const discountedUnitPrice = discount
    ? Math.round(packagePrice * (1 - discount / 100))
    : packagePrice;
  const discountAmount = discount
    ? Math.round(packagePrice * (discount / 100))
    : 0;
  const totalPrice = discountedUnitPrice;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!startDate) newErrors.startDate = "Start date is required";
    if (!groupSize) newErrors.groupSize = "Number of participants is required";
    if (!touristName.trim()) newErrors.touristName = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!phone.trim()) newErrors.phone = "Phone is required";

    const numParticipantsNum = parseInt(groupSize);
    if (
      isNaN(numParticipantsNum) ||
      numParticipantsNum < 1 ||
      numParticipantsNum > 50
    ) {
      newErrors.groupSize = "Please enter 1-50 participants";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Phone validation
    if (phone.length < 10) {
      newErrors.phone = "Phone must be at least 10 digits";
    }

    // Check if date is in future
    const selectedDate = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      newErrors.startDate = "Please select a future date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({
        startDate,
        groupSize: numParticipants,
        notes,
        touristName,
        email,
        phone,
        totalPrice,
        bookingDate: new Date(startDate).toISOString(),
        bookingType: "PACKAGE",
      });
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("packageBooking");

    if (saved) {
      const data = JSON.parse(saved);

      setStartDate(data.startDate || "");
      setGroupSize(String(data.groupSize || "1"));
      setNotes(data.notes || "");
      setTouristName(data.touristName || "");
      setEmail(data.email || "");
      setPhone(data.phone || "");
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const data = {
      startDate,
      groupSize,
      notes,
      touristName,
      email,
      phone,
    };

    setCurrentBooking(data as any);
    localStorage.setItem("packageBooking", JSON.stringify(data));
  }, [hydrated, startDate, groupSize, notes, touristName, email, phone]);

  return (
    <div className={`${poppins.className} space-y-6`}>
      {/* Personal Information Section */}
      <Card
        className={`rounded-3xl ${boxStyle || "border border-slate-200 bg-white"} p-6 shadow-lg shadow-slate-200/20`}
      >
        <h3 className="text-lg font-semibold text-slate-950 mb-4">
          Your Information
        </h3>
        <div className="space-y-4">
          {/* Name */}
          <FormField label="Full Name" error={errors.touristName} required>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Enter your full name"
                value={touristName}
                onChange={(e) => setTouristName(e.target.value)}
                className="pl-12 rounded-2xl border-slate-200 bg-slate-50"
              />
            </div>
          </FormField>

          {/* Email */}
          <FormField label="Email" error={errors.email} required>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 rounded-2xl border-slate-200 bg-slate-50"
              />
            </div>
          </FormField>

          {/* Phone */}
          <FormField label="Phone Number" error={errors.phone} required>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-12 rounded-2xl border-slate-200 bg-slate-50"
              />
            </div>
          </FormField>
        </div>
      </Card>

      {/* Booking Details Section */}
      <Card
        className={`rounded-3xl ${boxStyle || "border border-slate-200 bg-white"} p-6 shadow-lg shadow-slate-200/20`}
      >
        <h3 className="text-lg font-semibold text-slate-950 mb-4">
          Booking Details
        </h3>
        <div className="space-y-4">
          {/* Start Date */}
          <FormField
            label="Package Start Date"
            error={errors.startDate}
            required
          >
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-12 rounded-2xl border-slate-200 bg-slate-50"
              />
            </div>
          </FormField>

          {/* Participants */}
          <FormField
            label="Number of Participants"
            error={errors.groupSize}
            required
          >
            <div className="relative">
              <Users className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                type="number"
                min="1"
                max={maxGroupSize}
                placeholder={`1 - ${maxGroupSize} people`}
                value={groupSize}
                onChange={(e) => {
                  let value = Number(e.target.value);

                  if (value < 1) value = 1;
                  if (value > maxGroupSize) {
                    value = maxGroupSize;
                    setErrors((prev) => ({
                      ...prev,
                      groupSize: `Max allowed is ${maxGroupSize}`,
                    }));
                  }

                  setGroupSize(value.toString());
                }}
                className="pl-12 rounded-2xl border-slate-200 bg-slate-50"
              />
            </div>
          </FormField>
        </div>
      </Card>

      {/* Special Requests */}
      <Card
        className={`rounded-3xl ${boxStyle || "border border-slate-200 bg-white"} p-6 shadow-lg shadow-slate-200/20`}
      >
        <h3 className="text-lg font-semibold text-slate-950 mb-4">
          Additional Information
        </h3>
        <FormField label="Special Requests (Optional)">
          <div className="relative">
            <FileText className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
            <textarea
              placeholder="Any special requirements, dietary restrictions, or preferences..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="pl-12 pt-2 w-full min-h-24 p-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>
        </FormField>
      </Card>

      {/* Price Breakdown */}
      <Card
        className={`rounded-3xl ${boxStyle || "border-orange-200 bg-orange-50"} p-6 shadow-lg shadow-slate-200/20`}
      >
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-700">
              Price Breakdown
            </span>
          </div>
          <div
            className={`space-y-2 border-b ${boxBorder || "border-orange-200"} pb-3`}
          >
            <div className="flex justify-between text-sm text-slate-700">
              <span>Package Price</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-700 gap-3">
              <span className="text-slate-600">Package price</span>
              <div className="flex items-center gap-3">
                {discount ? (
                  <>
                    <span className="line-through text-gray-400">
                      ₹{packagePrice.toLocaleString()}
                    </span>
                    <span className="text-red-500 font-semibold">
                      -{discount}%
                    </span>
                  </>
                ) : null}
                <span className="font-bold">
                  ₹{discountedUnitPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-base font-bold text-slate-950">
              Total Amount
            </span>
            <span className="text-2xl font-bold text-slate-700">
              ₹{totalPrice.toLocaleString()}
            </span>
          </div>
        </div>
      </Card>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full rounded-2xl h-12 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-base"
      >
        {isLoading ? "Processing..." : "Proceed to Payment"}
      </Button>
    </div>
  );
}
