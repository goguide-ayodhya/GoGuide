'use client'

import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useBooking } from '@/contexts/BookingsContext'
import { packages } from '@/lib/mockData'
import { Header } from '@/components/common/Header'
import { Footer } from '@/components/common/Footer'
import { BookingSummaryCard } from '@/components/booking/BookingSummaryCard'
import { PackageBookingForm } from '@/components/booking/PackageBookingForm'
import { notFound } from 'next/navigation'
import { useEffect } from 'react'

export default function PackageBookingPage() {
  const params = useParams()
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const { setBookingType } = useBooking()

  const packageId = params.id as string
  const pkg = packages.find((p) => p.id === packageId)

  // Store redirect URL for login page
  useEffect(() => {
    if (!isLoggedIn) {
      // Store the current page URL for redirect after login
      // This allows developers to see the template without logging in first
    }
  }, [isLoggedIn])

  if (!pkg) {
    notFound()
  }

  const handleProceedToPayment = () => {
    setBookingType('package', pkg.id, pkg.title, pkg.price, pkg.image)
    router.push('/payment')
  }

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Header showBack={true} title="Book a Package" />

      <div className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Package Summary */}
          <BookingSummaryCard
            itemName={pkg.title}
            itemPrice={pkg.price}
            itemImage={pkg.image}
            itemType="package"
            details={{
              'Duration': `${pkg.duration} days`,
              'Difficulty': pkg.difficulty,
            }}
          />

          {/* Booking Form */}
          {!isLoggedIn ? (
            <div className="bg-card rounded-lg p-6 border">
              <h2 className="text-xl font-semibold text-foreground mb-6">Booking Details</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Please <a href={`/login?redirect=/packages/book/${packageId}`} className="text-primary font-semibold hover:underline">sign in</a> to complete your booking.
                </p>
                <div className="opacity-50 pointer-events-none">
                  <PackageBookingForm onSubmit={handleProceedToPayment} />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-lg p-6 border">
              <h2 className="text-xl font-semibold text-foreground mb-6">Booking Details</h2>
              <PackageBookingForm onSubmit={handleProceedToPayment} />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
