'use client'

import { useState } from 'react'
import { useBooking } from '@/contexts/BookingsContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from './FormField'
import { MapPin, Clock, Calendar } from 'lucide-react'

interface CabBookingFormProps {
  onSubmit: () => void
  isLoading?: boolean
}

export function CabBookingForm({ onSubmit, isLoading }: CabBookingFormProps) {
  const { bookings, setFormData } = useBooking()
  const [pickup, setPickup] = useState(bookings.formData.pickup || '')
  const [dropoff, setDropoff] = useState(bookings.formData.dropoff || '')
  const [date, setDate] = useState(bookings.formData.date || '')
  const [time, setTime] = useState(bookings.formData.time || '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!pickup.trim()) newErrors.pickup = 'Pickup location is required'
    if (!dropoff.trim()) newErrors.dropoff = 'Dropoff location is required'
    if (pickup.trim() === dropoff.trim()) newErrors.dropoff = 'Pickup and dropoff must be different'
    if (!date) newErrors.date = 'Date is required'
    if (!time) newErrors.time = 'Time is required'

    // Check if date is in future
    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selectedDate < today) {
      newErrors.date = 'Please select a future date'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      setFormData({
        pickup,
        dropoff,
        date,
        time,
      })
      onSubmit()
    }
  }

  return (
    <div className="space-y-4">
      {/* Pickup Location */}
      <FormField label="Pickup Location" error={errors.pickup} required>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter pickup location"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            className="pl-10 bg-muted border-0"
          />
        </div>
      </FormField>

      {/* Dropoff Location */}
      <FormField label="Dropoff Location" error={errors.dropoff} required>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter dropoff location"
            value={dropoff}
            onChange={(e) => setDropoff(e.target.value)}
            className="pl-10 bg-muted border-0"
          />
        </div>
      </FormField>

      {/* Date */}
      <FormField label="Travel Date" error={errors.date} required>
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
      <FormField label="Departure Time" error={errors.time} required>
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
