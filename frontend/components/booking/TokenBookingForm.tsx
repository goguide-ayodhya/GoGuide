'use client'

import { useState } from 'react'
import { useBooking } from '@/contexts/BookingsContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from './FormField'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ShoppingCart, Ticket } from 'lucide-react'

interface TokenBookingFormProps {
  onSubmit: () => void
  isLoading?: boolean
}

export function TokenBookingForm({ onSubmit, isLoading }: TokenBookingFormProps) {
  const { currentBooking, setCurrentBooking } = useBooking()
  const [quantity, setQuantity] = useState(currentBooking?.quantity || '1')
  const [deliveryMethod, setDeliveryMethod] = useState(currentBooking?.deliveryMethod || 'eticket')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!quantity) newErrors.quantity = 'Quantity is required'

    const numQuantity = parseInt(quantity)
    if (isNaN(numQuantity) || numQuantity < 1 || numQuantity > 10) {
      newErrors.quantity = 'Please enter 1-10 passes'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      setFormData({
        quantity: parseInt(quantity),
        deliveryMethod,
      })
      onSubmit()
    }
  }

  return (
    <div className="space-y-6">
      {/* Quantity */}
      <FormField label="Number of Passes" error={errors.quantity} required>
        <div className="relative">
          <ShoppingCart className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="number"
            min="1"
            max="10"
            placeholder="Enter number of passes"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="pl-10 bg-muted border-0"
          />
        </div>
      </FormField>

      {/* Delivery Method */}
      <FormField label="Delivery Method" required>
        <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod}>
          <div className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
            <RadioGroupItem value="eticket" id="eticket" />
            <label htmlFor="eticket" className="flex-1 cursor-pointer">
              <p className="font-medium text-foreground">E-Ticket</p>
              <p className="text-sm text-muted-foreground">Instant digital pass via email</p>
            </label>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
            <RadioGroupItem value="physical" id="physical" />
            <label htmlFor="physical" className="flex-1 cursor-pointer">
              <div>
                <p className="font-medium text-foreground">Physical Pass</p>
                <p className="text-sm text-muted-foreground">Courier delivery (5-7 business days)</p>
              </div>
            </label>
          </div>
        </RadioGroup>
      </FormField>

      {/* Pricing Info */}
      <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Ticket className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Price Details</p>
            <p className="text-sm text-muted-foreground mt-1">
              {quantity} × ₹{booking.itemPrice} = <span className="font-semibold text-foreground">₹{parseInt(quantity || '1') * (booking.itemPrice || 0)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full bg-secondary cursor-pointer hover:bg-secondary/90 h-11"
      >
        Proceed to Payment
      </Button>
    </div>
  )
}
