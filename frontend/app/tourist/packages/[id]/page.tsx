'use client'

import { useState } from 'react'
import { Header } from '@/components/common/Header'
import { Footer } from '@/components/common/Footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { BookingModal } from '@/components/features/BookingModal'
import { packages } from '@/lib/mockData'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Clock, MapPin, Check, Users } from 'lucide-react'
import { notFound } from 'next/navigation'

export default function PackageDetailsPage() {
  const params = useParams()
  const packageId = params.id as string
  const [bookingOpen, setBookingOpen] = useState(false)

  const pkg = packages.find((p) => p.id === packageId)

  if (!pkg) {
    notFound()
  }

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Header title={pkg.title} showBackButton />

      <div className="flex-grow">
        <div className="px-4 md:px-6 py-8">
          <div className="mx-auto max-w-3xl">
            {/* Hero Image */}
            <div className="aspect-video relative rounded-lg overflow-hidden mb-8 bg-muted">
              <Image
                src={pkg.image}
                alt={pkg.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 90vw"
              />
            </div>

            {/* Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 border-primary/20">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Duration</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{pkg.duration} hours</p>
              </Card>

              <Card className="p-6 border-secondary/20">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-5 w-5 text-secondary" />
                  <span className="text-sm text-muted-foreground">Group Size</span>
                </div>
                <p className="text-2xl font-bold text-foreground">2-8 people</p>
              </Card>

              <Card className="p-6 border-accent/20">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="h-5 w-5 text-accent" />
                  <span className="text-sm text-muted-foreground">Price</span>
                </div>
                <p className="text-2xl font-bold text-foreground">₹{pkg.price}</p>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-8">
                {/* Description */}
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">About This Package</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {pkg.description}
                  </p>
                </div>

                {/* Highlights */}
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Highlights</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {pkg.highlights.map((highlight) => (
                      <div key={highlight} className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-foreground">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Includes */}
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">What's Included</h3>
                  <div className="space-y-3">
                    {pkg.includes.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Booking Sidebar */}
              <div className="md:col-span-1">
                <Card className="p-6 sticky top-20">
                  <div className="mb-6">
                    <p className="text-muted-foreground mb-1">Total Price</p>
                    <p className="text-4xl font-bold text-primary">₹{pkg.price}</p>
                    <p className="text-sm text-muted-foreground mt-2">for {pkg.duration} hours</p>
                  </div>

                  <Button
                    className="w-full bg-secondary hover:bg-secondary/90 mb-3"
                    onClick={() => setBookingOpen(true)}
                  >
                    Book Now
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Flexible cancellation available
                  </p>
                </Card>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-12 p-6 bg-muted/50 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-3">Quick Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Duration</p>
                  <p className="font-medium text-foreground">{pkg.duration} hours</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Group Size</p>
                  <p className="font-medium text-foreground">2-8 people</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Language</p>
                  <p className="font-medium text-foreground">English, Hindi</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Difficulty</p>
                  <p className="font-medium text-foreground">Easy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <BookingModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        title={`Book ${pkg.title}`}
        type="package"
        itemName={pkg.title}
        itemPrice={pkg.price}
      />
    </main>
  )
}
