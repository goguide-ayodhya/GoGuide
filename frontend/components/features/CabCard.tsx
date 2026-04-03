'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Cab } from '@/lib/mockData'

interface CabCardProps {
  cab: Cab
}

export function CabCard({ cab }: CabCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="font-semibold text-foreground">{cab.type}</h3>
            <p className="text-sm text-muted-foreground">{cab.plate}</p>
          </div>
          <Badge variant="outline">{cab.capacity} seats</Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Driver:</span>
            <span className="text-foreground font-medium">{cab.driver}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">{cab.currentLocation}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="text-foreground font-medium">{cab.rating}</span>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground">Price</span>
            <span className="text-lg font-bold text-primary">₹{cab.pricePerKm}/km</span>
          </div>

          <Link href={`/cabs/book/${cab.id}`}>
            <Button className="w-full bg-secondary hover:bg-secondary/90">
              Book Now
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
