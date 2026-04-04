'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import type { Guide } from '@/contexts/GuideContext'

interface BookingFormProps {
  guide: Guide
  onSubmit: (bookingData: BookingData) => void
  isLoading?: boolean
}

export interface BookingData {
  date: string
  time: string
  duration: number
  meetingPoint: string
  vipPass: boolean
  specialRequests: string
}

export function BookingForm({ guide, onSubmit, isLoading = false }: BookingFormProps) {
  const [formData, setFormData] = useState<BookingData>({
    date: '',
    time: '',
    duration: 2,
    meetingPoint: '',
    vipPass: false,
    specialRequests: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.date && formData.time && formData.meetingPoint) {
      onSubmit(formData)
    }
  }

  const totalPrice = (guide.price * formData.duration) + (formData.vipPass ? 500 : 0)

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Booking Details</h3>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Date</label>
          <Input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="bg-background"
          />
        </div>

        {/* Time */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Time</label>
          <Input
            type="time"
            required
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="bg-background"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Duration (hours)</label>
          <Select value={formData.duration.toString()} onValueChange={(value) => setFormData({ ...formData, duration: parseInt(value) })}>
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 hour</SelectItem>
              <SelectItem value="2">2 hours</SelectItem>
              <SelectItem value="3">3 hours</SelectItem>
              <SelectItem value="4">4 hours</SelectItem>
              <SelectItem value="6">6 hours (Full day)</SelectItem>
              <SelectItem value="8">8 hours (Full day)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Meeting Point */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Meeting Point</label>
          <Select value={formData.meetingPoint} onValueChange={(value) => setFormData({ ...formData, meetingPoint: value })}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select a meeting point" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ram-mandir">Ram Mandir</SelectItem>
              <SelectItem value="railway-station">Railway Station</SelectItem>
              <SelectItem value="airport">Airport</SelectItem>
              <SelectItem value="hotel">Hotel (specify below)</SelectItem>
              <SelectItem value="other">Other Location</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* VIP Pass */}
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border">
          <Checkbox
            id="vip-pass"
            checked={formData.vipPass}
            onCheckedChange={(checked) => setFormData({ ...formData, vipPass: checked as boolean })}
          />
          <div className="flex-grow">
            <label htmlFor="vip-pass" className="text-sm font-medium text-foreground cursor-pointer">
              Add VIP Pass (+₹500)
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              Skip lines and get priority access at all temples
            </p>
          </div>
        </div>

        {/* Special Requests */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Special Requests (Optional)</label>
          <textarea
            placeholder="Any special requirements or preferences..."
            value={formData.specialRequests}
            onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            rows={3}
          />
        </div>

        {/* Price Summary */}
        <div className="border-t border-border pt-6">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-muted-foreground">
              <span>Guide fee ({formData.duration}h × ₹{guide.price}/h)</span>
              <span>₹{guide.price * formData.duration}</span>
            </div>
            {formData.vipPass && (
              <div className="flex justify-between text-muted-foreground">
                <span>VIP Pass</span>
                <span>₹500</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-primary">₹{totalPrice}</span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !formData.date || !formData.time || !formData.meetingPoint}
            className="w-full bg-secondary hover:bg-secondary/90"
          >
            {isLoading ? 'Processing...' : 'Confirm Booking'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
