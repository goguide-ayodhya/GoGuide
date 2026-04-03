'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'
import type { useGuide } from '@/contexts/GuideContext'

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  type: 'cab' | 'token' | 'package'
  itemName: string
  itemPrice?: number | string
}

export function BookingModal({
  open,
  onOpenChange,
  title,
  type,
  itemName,
  itemPrice,
}: BookingModalProps) {
  const [confirmed, setConfirmed] = useState(false)

  const handleConfirm = () => {
    setConfirmed(true)
    setTimeout(() => {
      setConfirmed(false)
      onOpenChange(false)
    }, 2000)
  }

  if (confirmed) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-secondary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h2>
            <p className="text-muted-foreground mb-2">{title}</p>
            <p className="text-sm text-muted-foreground">
              Confirmation details will be sent to your email shortly.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {type === 'cab' && 'Complete your cab booking'}
            {type === 'token' && 'Purchase your pass'}
            {type === 'package' && 'Book this tour package'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground mb-1">
              {type === 'cab' ? 'Vehicle:' : type === 'token' ? 'Pass:' : 'Package:'}
            </p>
            <p className="font-semibold text-foreground">{itemName}</p>
            {itemPrice && (
              <p className="text-lg font-bold text-primary mt-2">
                ₹{itemPrice}
              </p>
            )}
          </div>

          <div className="rounded-lg bg-secondary/10 p-4 border border-secondary/20">
            <p className="text-sm text-muted-foreground">
              {type === 'cab' &&
                'Your cab will be assigned shortly. You will receive a call from the driver with exact arrival time.'}
              {type === 'token' &&
                'Your pass will be activated immediately after payment. You can start using it right away.'}
              {type === 'package' &&
                'Your booking is tentative. Our team will confirm within 24 hours.'}
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-secondary hover:bg-secondary/90"
            onClick={handleConfirm}
          >
            Confirm {type === 'token' ? 'Purchase' : 'Booking'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
