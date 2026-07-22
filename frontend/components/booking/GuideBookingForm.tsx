"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "./FormField";
import { PriceBreakdown } from "./PriceBreakdown";
import { Calendar as CalendarIcon, Clock, MapPin, Map, Check } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getPublicSettingsApi } from "@/lib/api/finance";
import { Badge } from "@/components/ui/badge";

interface GuideBookingFormProps {
  price?: number;
  onSubmit: (data: {
    date?: string;
    time?: string;
    meetingPoint: string;
    notes: string;
    touristName: string;
    email: string;
    phone: string;
    groupSize: number;
    bookingDate: string;
    startTime: string;
    bookingType: string;
    tourType: string;
    dropoffLocation: string;
    selectedLocations: string[];
    totalPrice: number;
  }) => void;
  isLoading?: boolean;
}

export function GuideBookingForm({
  onSubmit,
  isLoading,
}: GuideBookingFormProps) {
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("");
  const [meetingPoint, setMeetingPoint] = useState("Hotel Lobby");
  const [dropoffLocation, setDropoffLocation] = useState("Ram Mandir");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touristName, setTouristName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [groupSize, setGroupSize] = useState("1");
  const [open, setOpen] = useState(false);
  
  // New State for Tour Type and Locations
  const [tourType, setTourType] = useState<"halfDay" | "fullDay">("halfDay");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  
  // Admin Settings State
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    getPublicSettingsApi().then(data => setSettings(data)).catch(console.error);
  }, []);

  const availableLocations = settings?.locationsByTourType?.[tourType] || settings?.locations || [];
  const pricingConfig = settings?.guidePricing;
  
  const currentPricing = pricingConfig ? pricingConfig[tourType] : { touristPrice: 0, guideEarning: 0, maxLocations: 6 };
  const maxLocations = currentPricing.maxLocations;
  const totalPrice = currentPricing.touristPrice;

  const gstAmount = Math.round(totalPrice - totalPrice / 1.0);
  const finalPrice = Math.round(totalPrice + gstAmount);
  const priceItems = [
    { label: `${tourType === "halfDay" ? "Half Day" : "Full Day"} Tour`, amount: Math.round(totalPrice) },
    { label: "GST (0%)", amount: gstAmount },
  ];

  const handleLocationToggle = (loc: string) => {
    setSelectedLocations(prev => {
      if (prev.includes(loc)) return prev.filter(l => l !== loc);
      if (prev.length >= maxLocations) return prev;
      return [...prev, loc];
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!date) newErrors.date = "Date is required";
    if (!time) newErrors.time = "Time is required";
    if (!meetingPoint.trim())
      newErrors.meetingPoint = "Meeting point is required";
    if (!dropoffLocation.trim())
      newErrors.dropoffLocation = "Drop-off location is required";
    if (!touristName.trim()) newErrors.touristName = "Name is required";
    if (!phone.trim()) newErrors.phone = "Phone is required";
    else if (phone.length !== 10)
      newErrors.phone = "Phone must be exactly 10 digits";
    if (!groupSize || parseInt(groupSize) < 1)
      newErrors.groupSize = "Group size must be at least 1";
    if (selectedLocations.length === 0)
      newErrors.selectedLocations = "Select at least 1 location";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (date && time) {
      const selectedDateTime = new Date(date);
      const [hours, minutes] = time.split(":").map(Number);
      selectedDateTime.setHours(hours, minutes, 0, 0);

      const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDateTime < today) {
        newErrors.date = "Please select a future date";
      } else if (selectedDateTime < oneHourFromNow) {
        newErrors.time = "Booking must be at least 1 hour from now";
      }
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
        bookingDate: date!.toISOString(),
        startTime: time,
        bookingType: "GUIDE",
        // backend expects snake_case values
        tourType: tourType === "halfDay" ? "half_day" : "full_day",
        dropoffLocation,
        meetingPoint,
        selectedLocations,
        notes,
        totalPrice,
      });
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("bookingForm");
    if (saved) {
      const data = JSON.parse(saved);
      setTouristName(data.touristName || "");
      setEmail(data.email || "");
      setPhone(data.phone || "");
      setMeetingPoint(data.meetingPoint || "Hotel Lobby");
      setDropoffLocation(data.dropoffLocation || "Ram Mandir");
      setGroupSize(data.groupSize || "1");
      setNotes(data.notes || "");
      if (
        data.tourType === "Half Day" ||
        data.tourType === "halfDay" ||
        data.tourType === "half_day"
      )
        setTourType("halfDay");
      if (
        data.tourType === "Full Day" ||
        data.tourType === "fullDay" ||
        data.tourType === "full_day"
      )
        setTourType("fullDay");
      setSelectedLocations(data.selectedLocations || []);
    }
  }, []);

  useEffect(() => {
    if (!touristName && !email && !phone) return;
    const data = {
      touristName,
      email,
      phone,
      meetingPoint,
      dropoffLocation,
      groupSize,
      notes,
      tourType,
      selectedLocations
    };
    localStorage.setItem("bookingForm", JSON.stringify(data));
  }, [touristName, email, phone, meetingPoint, dropoffLocation, groupSize, notes, tourType, selectedLocations]);

  const isMounted = useRef(false);

  // Reset selected locations when tourType changes
  useEffect(() => {
    if (isMounted.current) {
      setSelectedLocations([]);
      setErrors((prev) => {
        const { selectedLocations, ...rest } = prev;
        return rest;
      });
    } else {
      isMounted.current = true;
    }
  }, [tourType]);

  if (!settings) {
    return <div className="p-4 text-center">Loading booking options...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Tour Type Selector */}
      <FormField label="Tour Type" required>
        <select
          value={tourType}
          onChange={(e) => setTourType(e.target.value as any)}
          className="w-full h-11 px-3 bg-muted border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="halfDay">Half Day Tour (Max {pricingConfig?.halfDay.maxLocations} Locations)</option>
          <option value="fullDay">Full Day Tour (Max {pricingConfig?.fullDay.maxLocations} Locations)</option>
        </select>
      </FormField>

      {/* Locations Selection */}
      <FormField label={`Select Locations (Max ${maxLocations})`} error={errors.selectedLocations} required>
        <div className="flex flex-wrap gap-2 mt-2 max-h-48 overflow-y-auto p-1">
          {availableLocations.map((loc: string) => {
            const isSelected = selectedLocations.includes(loc);
            const isDisabled = !isSelected && selectedLocations.length >= maxLocations;
            return (
              <Badge
                key={loc}
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "cursor-pointer text-xs py-1.5 px-3",
                  isDisabled && "opacity-50 cursor-not-allowed",
                  !isSelected && !isDisabled && "hover:bg-muted"
                )}
                onClick={() => !isDisabled && handleLocationToggle(loc)}
              >
                {isSelected && <Check className="w-3 h-3 mr-1" />}
                {loc}
              </Badge>
            );
          })}
        </div>
      </FormField>

      <FormField label="Tour Date" error={errors.date} required>
        <div className="relative">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                onClick={() => setOpen(true)}
                className={cn(
                  "w-full justify-start text-left font-normal group h-11 bg-muted border-0 hover:bg-muted/80",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-5 w-5 group-hover:text-black" />
                {date ? date.toLocaleDateString("en-GB") : <span className="group-hover:text-black">Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => {
                  setDate(date);
                  setOpen(false);
                }}
                disabled={(d) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return d < today;
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </FormField>

      <FormField label="Start Time" error={errors.time} required>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="pl-10 bg-muted border-0" />
        </div>
      </FormField>

      <FormField label="Your Name" error={errors.touristName} required>
        <Input value={touristName} onChange={(e) => setTouristName(e.target.value)} className="w-full h-11 bg-muted border-0" />
      </FormField>

      <FormField label="Email" error={errors.email}>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-11 bg-muted border-0" />
      </FormField>

      <FormField label="Phone" error={errors.phone} required>
        <Input
          type="tel"
          value={phone}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "").slice(0, 10);
            setPhone(val);
          }}
          className="w-full h-11 bg-muted border-0"
        />
      </FormField>

      <FormField label="Meeting Point" error={errors.meetingPoint} required>
        <Input value={meetingPoint} onChange={(e) => setMeetingPoint(e.target.value)} placeholder="Type meeting point..." className="w-full h-11 bg-muted border-0" />
      </FormField>

      <FormField label="Drop-off Location" error={errors.dropoffLocation} required>
        <Input value={dropoffLocation} onChange={(e) => setDropoffLocation(e.target.value)} placeholder="Type drop-off location..." className="w-full h-11 bg-muted border-0" />
      </FormField>

      <FormField label="Group Size" error={errors.groupSize} required>
        <Input type="number" min={1} value={groupSize} onChange={(e) => setGroupSize(e.target.value)} className="w-full h-11 bg-muted border-0" />
      </FormField>

      <FormField label="Any Special Requests / Routes">
        <textarea
          placeholder="Any dietary restrictions, mobility needs, or special requests..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full min-h-20 p-3 bg-muted border-0 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </FormField>

      <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-4">
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground mb-3 border-b border-secondary/20 pb-2">Price Breakdown</h4>
          <PriceBreakdown items={priceItems} total={finalPrice} />
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={isLoading} className="w-full bg-secondary cursor-pointer hover:bg-secondary/90 h-11 mt-6">
        Create Booking
      </Button>
    </div>
  );
}
