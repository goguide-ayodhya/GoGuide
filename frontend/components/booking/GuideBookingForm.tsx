"use client";

import { useState } from "react";
import { useBooking } from "@/contexts/BookingsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "./FormField";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, MapPin, Zap } from "lucide-react";

interface GuideBookingFormProps {
  guideHourlyRate: number;
  onSubmit: (data: {
    date?: string;
    time?: string;
    duration: number;
    meetingPoint: string;
    vipPass: boolean;
    notes: string;
    totalPrice: number;
    touristName: string;
    email: string;
    phone: string;
    groupSize: number;
    bookingDate: string;
    startTime: string;
    bookingType: string;
    tourType: string;
    dropoffLocation: string;
  }) => void;
  isLoading?: boolean;
}

export function GuideBookingForm({
  guideHourlyRate,
  onSubmit,
  isLoading,
}: GuideBookingFormProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("2");
  const [meetingPoint, setMeetingPoint] = useState("Hotel Lobby");
  const [dropoffLocation, setDropoffLocation] = useState("Ram Mandir Main Gate");
  const [vipPass, setVipPass] = useState(false);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touristName, setTouristName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [groupSize, setGroupSize] = useState("1");

  const durationHours = parseInt(duration) || 0;
  const basePrice = durationHours * guideHourlyRate;
  const vipPrice = vipPass ? 500 : 0;
  const totalPrice = basePrice + vipPrice;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!date) newErrors.date = "Date is required";
    if (!time) newErrors.time = "Time is required";
    if (!duration || parseInt(duration) < 1 || parseInt(duration) > 8) {
      newErrors.duration = "Duration must be 1-8 hours";
    }
    if (!meetingPoint.trim())
      newErrors.meetingPoint = "Meeting point is required";
    if (!dropoffLocation.trim())
      newErrors.dropoffLocation = "Drop-off location is required";
    if (!touristName.trim())
      newErrors.touristName = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!phone.trim()) newErrors.phone = "Phone is required";
    else if (phone.length < 10) newErrors.phone = "Phone must be at least 10 digits";
    if (!groupSize || parseInt(groupSize) < 1) newErrors.groupSize = "Group size must be at least 1";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Check if date is in future
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      newErrors.date = "Please select a future date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({
        touristName,
        email,
        phone,
        groupSize: Number(groupSize),

        bookingDate: new Date(date).toISOString(),
        startTime: time,
        bookingType: "GUIDE",
        tourType: "Personalized Tour",
        dropoffLocation,

        duration: durationHours,
        meetingPoint,
        vipPass,
        notes,
        totalPrice,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Date */}
      <FormField label="Tour Date" error={errors.date} required>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="pl-10 bg-muted border-0"
          />
        </div>
      </FormField>

      {/* Time */}
      <FormField label="Start Time" error={errors.time} required>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="pl-10 bg-muted border-0"
          />
        </div>
      </FormField>

      {/* Duration */}
      <FormField label="Duration (Hours)" error={errors.duration} required>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="number"
              min="1"
              max="8"
              placeholder="Enter hours"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="pl-10 bg-muted border-0"
            />
          </div>
          <div className="flex items-center px-3 bg-muted rounded-md">
            <span className="text-sm font-medium text-foreground">
              ₹{basePrice}
            </span>
          </div>
        </div>
      </FormField>

      {/* Meeting Point */}
      <FormField label="Meeting Point" error={errors.meetingPoint} required>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <select
            value={meetingPoint}
            onChange={(e) => setMeetingPoint(e.target.value)}
            className="pl-10 w-full h-11 bg-muted border-0 rounded-md text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option>Hotel Lobby</option>
            <option>Ram Mandir Main Gate</option>
            <option>Hanuman Garhi Temple</option>
            <option>Ayodhya Train Station</option>
            <option>Other Location</option>
          </select>
        </div>
      </FormField>

      {/* Drop-off Location */}
      <FormField label="Drop-off Location" error={errors.dropoffLocation} required>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <select
            value={dropoffLocation}
            onChange={(e) => setDropoffLocation(e.target.value)}
            className="pl-10 w-full h-11 bg-muted border-0 rounded-md text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option>Hotel Lobby</option>
            <option>Ram Mandir Main Gate</option>
            <option>Hanuman Garhi Temple</option>
            <option>Ayodhya Train Station</option>
            <option>Other Location</option>
          </select>
        </div>
      </FormField>

      <FormField label="Your Name" error={errors.touristName} required>
        <Input
          value={touristName}
          onChange={(e) => setTouristName(e.target.value)}
        />
      </FormField>

      <FormField label="Email" error={errors.email} required>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
      </FormField>

      <FormField label="Phone" error={errors.phone} required>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </FormField>

      <FormField label="Group Size" error={errors.groupSize} required>
        <Input
          type="number"
          value={groupSize}
          onChange={(e) => setGroupSize(e.target.value)}
        />
      </FormField>

      {/* VIP Pass */}
      <div
        className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer"
        onClick={() => setVipPass(!vipPass)}
      >
        <Checkbox
          id="vippass"
          checked={vipPass}
          onCheckedChange={(checked: any) => setVipPass(checked as boolean)}
        />
        <label htmlFor="vippass" className="flex-1 cursor-pointer">
          <p className="font-medium text-foreground">Add VIP Experience Pass</p>
          <p className="text-sm text-muted-foreground">
            Skip queues + Priority entry (+₹500)
          </p>
        </label>
      </div>

      {/* Notes */}
      <FormField label="Special Requests (Optional)">
        <textarea
          placeholder="Any dietary restrictions, mobility needs, or special requests..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full min-h-20 p-3 bg-muted border-0 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </FormField>

      {/* Price Summary */}
      {durationHours > 0 && (
        <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {durationHours} hours × ₹{guideHourlyRate}/hr
            </span>
            <span className="font-medium text-foreground">₹{basePrice}</span>
          </div>
          {vipPass && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">VIP Pass</span>
              <span className="font-medium text-foreground">+₹500</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-bold text-secondary text-lg">
              ₹{totalPrice}
            </span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full bg-secondary cursor-pointer hover:bg-secondary/90 h-11 mt-6"
      >
        Proceed to Payment
      </Button>
    </div>
  );
}
