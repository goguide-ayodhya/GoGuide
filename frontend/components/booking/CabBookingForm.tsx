'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from './FormField'
import { MapPin, Clock, Calendar, Users } from 'lucide-react'

interface CabBookingFormProps {
  onSubmit: (formData: {
    meetingPoint: string
    dropoffLocation: string
    bookingDate: string
    startTime: string
    groupSize: number
    touristName: string
    email: string
    phone: string
  }) => void
  isLoading?: boolean
}

export function CabBookingForm({ onSubmit, isLoading }: CabBookingFormProps) {
  const [meetingPoint, setMeetingPoint] = useState('')
  const [dropoffLocation, setDropoffLocation] = useState('')
  const [bookingDate, setBookingDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [groupSize, setGroupSize] = useState(1)
  const [touristName, setTouristName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!meetingPoint.trim()) newErrors.meetingPoint = 'Pickup location is required'
    if (!dropoffLocation.trim()) newErrors.dropoffLocation = 'Dropoff location is required'
    if (meetingPoint.trim() === dropoffLocation.trim()) newErrors.dropoffLocation = 'Pickup and dropoff must be different'
    if (!bookingDate) newErrors.bookingDate = 'Date is required'
    if (!startTime) newErrors.startTime = 'Time is required'
    if (!touristName.trim()) newErrors.touristName = 'Name is required'
    if (!email.trim()) newErrors.email = 'Email is required'
    if (!phone.trim()) newErrors.phone = 'Phone is required'
    else if (phone.length < 10) newErrors.phone = 'Phone must be at least 10 digits'
    if (groupSize < 1) newErrors.groupSize = 'Group size must be at least 1'

    // Check if date is in future
    const selectedDate = new Date(bookingDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selectedDate < today) {
      newErrors.bookingDate = 'Please select a future date'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (email && !emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({
        meetingPoint,
        dropoffLocation,
        bookingDate,
        startTime,
        groupSize,
        touristName,
        email,
        phone,
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Tourist Name */}
      <FormField label="Full Name" error={errors.touristName} required>
        <Input
          type="text"
          placeholder="Enter your full name"
          value={touristName}
          onChange={(e) => setTouristName(e.target.value)}
          className="bg-muted border-0"
        />
      </FormField>

      {/* Email */}
      <FormField label="Email" error={errors.email} required>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-muted border-0"
        />
      </FormField>

      {/* Phone */}
      <FormField label="Phone Number" error={errors.phone} required>
        <Input
          type="tel"
          placeholder="Enter your phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="bg-muted border-0"
        />
      </FormField>

      {/* Pickup Location */}
      <FormField label="Pickup Location" error={errors.meetingPoint} required>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter pickup location"
            value={meetingPoint}
            onChange={(e) => setMeetingPoint(e.target.value)}
            className="pl-10 bg-muted border-0"
          />
        </div>
      </FormField>

      {/* Dropoff Location */}
      <FormField label="Dropoff Location" error={errors.dropoffLocation} required>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter dropoff location"
            value={dropoffLocation}
            onChange={(e) => setDropoffLocation(e.target.value)}
            className="pl-10 bg-muted border-0"
          />
        </div>
      </FormField>

      {/* Date */}
      <FormField label="Travel Date" error={errors.bookingDate} required>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            className="pl-10 bg-muted border-0"
          />
        </div>
      </FormField>

      {/* Time */}
      <FormField label="Departure Time" error={errors.startTime} required>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="pl-10 bg-muted border-0"
          />
        </div>
      </FormField>

      {/* Group Size */}
      <FormField label="Number of Passengers" error={errors.groupSize} required>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="number"
            min="1"
            placeholder="Number of passengers"
            value={groupSize}
            onChange={(e) => setGroupSize(parseInt(e.target.value) || 1)}
            className="pl-10 bg-muted border-0"
          />
        </div>
      </FormField>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full bg-secondary cursor-pointer hover:bg-secondary/90 h-11 mt-6"
      >
        Proceed to Payment
      </Button>
    </div>
  )
}
