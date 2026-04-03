'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star, Loader2 } from 'lucide-react'
import type { BookingReview } from '@/contexts/BookingsContext'

interface ReviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (review: BookingReview) => void
}

export function ReviewModal({ open, onOpenChange, onSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating')
      return
    }

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

    const review: BookingReview = {
      rating,
      comment,
      date: new Date().toISOString(),
    }

    onSubmit(review)
    setIsLoading(false)
    setRating(0)
    setComment('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
          <DialogDescription>
            Share your experience with this guide to help other travelers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-all"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating
                        ? 'fill-secondary text-secondary'
                        : 'text-muted-foreground hover:text-secondary'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Comment</label>
            <Textarea
              placeholder="Share your thoughts about this guide..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isLoading}
              className="min-h-24 resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || rating === 0}
            className="bg-secondary hover:bg-secondary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
