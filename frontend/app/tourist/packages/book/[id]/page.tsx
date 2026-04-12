'use client'

import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { usePackage } from '@/contexts/TourPackageContext'
import { Header } from '@/components/common/Header'
import { Footer } from '@/components/common/Footer'
import { PackageBookingForm } from '@/components/booking/PackageBookingForm'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, Users, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { poppins } from '@/lib/fonts'

export default function PackageBookingPage() {
  const params = useParams()
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const { packages } = usePackage()
  const packageId = params.id as string
  const [pkg, setPkg] = useState<any>(null)

  useEffect(() => {
    if (packages.length > 0) {
      const foundPackage = packages.find((p) => p._id === packageId)
      setPkg(foundPackage)
    }
  }, [packages, packageId])

  const handleBookingSubmit = (data: any) => {
    console.log('Booking data:', data)
    // TODO: Process booking and redirect to payment
    router.push('/payment')
  }

  return (
    <main className={`${poppins.className} min-h-screen flex flex-col bg-slate-50 text-slate-950`}>
      <Header showBackButton />

      {pkg ? (
        <div className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Booking Form */}
              <div className="lg:col-span-2">
                {!isLoggedIn ? (
                  <Card className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/20">
                    <div className="space-y-4">
                      <h2 className="text-2xl font-semibold text-slate-950">Sign in Required</h2>
                      <p className="text-slate-600">
                        Please sign in to complete your booking.
                      </p>
                      <Button
                        onClick={() => router.push(`/login?redirect=/packages/book/${packageId}`)}
                        className="w-full rounded-2xl h-12 bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                      >
                        Sign In to Book
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <PackageBookingForm
                    packagePrice={pkg.price}
                    packageTitle={pkg.title}
                    onSubmit={handleBookingSubmit}
                  />
                )}
              </div>

              {/* Right Column - Package Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                  {/* Package Card Summary */}
                  <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/20">
                    {/* Image */}
                    <div className="relative w-full h-40 bg-slate-100 overflow-hidden">
                      <img
                        src={pkg.image}
                        alt={pkg.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Package'
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-slate-950 mb-2 line-clamp-2">
                        {pkg.title}
                      </h3>

                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                        <MapPin className="h-4 w-4 text-orange-600" />
                        <span>{pkg.location}</span>
                      </div>

                      {/* Duration & Days */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                          <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold">Duration</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">{pkg.duration} days</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-orange-50 p-3">
                          <p className="text-xs uppercase tracking-[0.15em] text-orange-700 font-semibold">Per Person</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">₹{pkg.price.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 mb-4 line-clamp-3">
                        {pkg.description}
                      </p>

                      {/* Includes */}
                      {pkg.includes && pkg.includes.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-[0.15em]">Included</p>
                          <div className="space-y-2">
                            {pkg.includes.slice(0, 3).map((item: string, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                                <ChevronRight className="h-3.5 w-3.5 text-orange-600 flex-shrink-0" />
                                <span>{item}</span>
                              </div>
                            ))}
                            {pkg.includes.length > 3 && (
                              <div className="text-xs text-slate-500 italic">
                                +{pkg.includes.length - 3} more included
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Contact Support */}
                  <Card className="rounded-3xl border border-slate-200 bg-gradient-to-br from-orange-50 to-yellow-50 p-6 shadow-lg shadow-slate-200/20">
                    <p className="text-sm font-semibold text-slate-950 mb-2">Have questions?</p>
                    <p className="text-xs text-slate-600 mb-4">
                      Our team is here to help you plan the perfect tour.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full rounded-2xl border-slate-200 bg-white hover:bg-slate-50"
                    >
                      Contact Support
                    </Button>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <Card className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/20">
            <p className="text-slate-600">Loading package details...</p>
          </Card>
        </div>
      )}

      <Footer />
    </main>
  )
}
