'use client'

import { useState } from 'react'
import { useBooking } from '@/contexts/BookingsContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from './FormField'
import { Calendar, Users, FileText } from 'lucide-react'

interface PackageBookingFormProps {
  onSubmit: () => void
  isLoading?: boolean
}

export function PackageBookingForm({ onSubmit, isLoading }: PackageBookingFormProps) {
  const { booking, setFormData } = useBooking()
  const [startDate, setStartDate] = useState(booking.formData.startDate || '')
  const [participants, setParticipants] = useState(booking.formData.participants || '1')
  const [notes, setNotes] = useState(booking.formData.notes || '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!startDate) newErrors.startDate = 'Start date is required'
    if (!participants) newErrors.participants = 'Number of participants is required'

    const numParticipants = parseInt(participants)
    if (isNaN(numParticipants) || numParticipants < 1 || numParticipants > 20) {
      newErrors.participants = 'Please enter 1-20 participants'
    }

    // Check if date is in future
    const selectedDate = new Date(startDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selectedDate < today) {
      newErrors.startDate = 'Please select a future date'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      setFormData({
        startDate,
        participants: parseInt(participants),
        notes,
      })
      onSubmit()
    }
  }

  return (
    <div className="space-y-4">
      {/* Start Date */}
      <FormField label="Package Start Date" error={errors.startDate} required>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="pl-10 bg-muted border-0"
          />
        </div>
      </FormField>

      {/* Participants */}
      <FormField label="Number of Participants" error={errors.participants} required>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="number"
            min="1"
            max="20"
            placeholder="Enter number of people"
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
            className="pl-10 bg-muted border-0"
          />
        </div>
      </FormField>

      {/* Notes */}
      <FormField label="Special Requests (Optional)">
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <textarea
            placeholder="Any special requirements or requests..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="pl-10 pt-2 w-full min-h-24 p-3 bg-muted border-0 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
