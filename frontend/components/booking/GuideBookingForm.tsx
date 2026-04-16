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
  const [customLocation, setCustomLocation] = useState("");

  const [dropoffLocation, setDropoffLocation] = useState(
    "Ram Mandir Main Gate",
  );
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touristName, setTouristName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [groupSize, setGroupSize] = useState("1");
  const [showDropdown, setShowDropdown] = useState(false);

  const durationHours = parseInt(duration) || 0;
  const basePrice = durationHours * guideHourlyRate;
  const totalPrice = basePrice;

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
    if (!touristName.trim()) newErrors.touristName = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!phone.trim()) newErrors.phone = "Phone is required";
    else if (phone.length < 10)
      newErrors.phone = "Phone must be at least 10 digits";
    if (!groupSize || parseInt(groupSize) < 1)
      newErrors.groupSize = "Group size must be at least 1";

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
        notes,
        totalPrice,
      });
    }
  };

  const meetingOptions = [
    "Hotel Lobby",
    "Ram Mandir Main Gate",
    "Hanuman Garhi Temple",
    "Ayodhya Train Station",
  ];

  const filteredOptions = meetingOptions.filter((option) =>
    option.toLowerCase().includes(meetingPoint.toLowerCase()),
  );

  const [showDropoffDropdown, setShowDropoffDropdown] = useState(false);

  const filteredDropoffOptions = meetingOptions.filter((option) =>
    option.toLowerCase().includes(dropoffLocation.toLowerCase()),
  );

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

      <FormField label="Your Name" error={errors.touristName} required>
        <Input
          value={touristName}
          onChange={(e) => setTouristName(e.target.value)}
          className="w-full h-11 bg-muted border-0 rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </FormField>

      <FormField label="Email" error={errors.email} required>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-11 bg-muted border-0 rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </FormField>

      <FormField label="Phone" error={errors.phone} required>
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full h-11 bg-muted border-0 rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </FormField>

      {/* Meeting Point */}
      <FormField label="Meeting Point" error={errors.meetingPoint} required>
        <div className="relative w-full">
          {/* Input */}
          <input
            type="text"
            value={meetingPoint}
            onChange={(e) => {
              setMeetingPoint(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            placeholder="Type or select meeting point..."
            className="w-full h-11 px-4 bg-muted rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {/* Dropdown Suggestions */}
          {showDropdown && filteredOptions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto no-scrollbar">
              {filteredOptions.map((option, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setMeetingPoint(option);
                    setShowDropdown(false);
                  }}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>
      </FormField>

      {/* Drop-off Location */}
      <FormField
        label="Drop-off Location"
        error={errors.dropoffLocation}
        required
      >
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />

          <input
            type="text"
            value={dropoffLocation}
            onChange={(e) => {
              setDropoffLocation(e.target.value);
              setShowDropoffDropdown(true);
            }}
            onFocus={() => setShowDropoffDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropoffDropdown(false), 150)}
            placeholder="Type or select drop-off location..."
            className="pl-10 w-full h-11 bg-muted border-0 rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {showDropoffDropdown && filteredDropoffOptions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto no-scrollbar">
              {filteredDropoffOptions.map((option, index) => (
                <div
                  key={index}
                  onMouseDown={() => {
                    setDropoffLocation(option);
                    setShowDropoffDropdown(false);
                  }}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>
      </FormField>

      <FormField label="Group Size" error={errors.groupSize} required>
        <Input
          type="number"
          value={groupSize}
          onChange={(e) => setGroupSize(e.target.value)}
          className="w-full h-11 bg-muted border-0 rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </FormField>

      {/* Notes */}
      <FormField label="Any Special Requests / Routes">
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
