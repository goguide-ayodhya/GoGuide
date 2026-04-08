'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Driver } from '@/contexts/DriverContext'

interface CabCardProps {
  driver: Driver
}

export function CabCard({ driver }: CabCardProps) {
  const initials = driver.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)

  return (
    <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/40 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
            {driver.avatar ? (
              <Image
                src={driver.avatar}
                alt={driver.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200 text-xl font-semibold text-orange-700">
                {initials}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-slate-950">{driver.name}</h3>
            <p className="text-sm text-slate-500">{driver.vehicleName}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Vehicle</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{driver.vehicleType}</p>
            <p className="mt-1 text-sm text-slate-500">{driver.vehicleNumber}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Capacity</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{driver.seats} seats</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-orange-50 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-orange-700">Rating</p>
            <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-950">
              <Star className="h-5 w-5 fill-orange-500 text-orange-500" />
              {driver.averageRating.toFixed(1)}
            </div>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">
            {driver.totalRides} rides
          </span>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Best rate</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">₹{driver.pricePerKm}/km</p>
            </div>
            <MapPin className="h-5 w-5 text-orange-500" />
          </div>
        </div>

        <Link href={`/tourist/cabs/book/${driver.id}`}>
          <Button variant="secondary" size="lg" className="mt-6 w-full rounded-2xl">
            Book Now
          </Button>
        </Link>
      </div>
    </Card>
  )
}
