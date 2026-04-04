'use client'

import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useBooking } from '@/contexts/BookingsContext'
// import { tokens } from '@/lib/mockData'
import { Header } from '@/components/common/Header'
import { Footer } from '@/components/common/Footer'
import { BookingSummaryCard } from '@/components/booking/BookingSummaryCard'
import { TokenBookingForm } from '@/components/booking/TokenBookingForm'
import { notFound } from 'next/navigation'
import { useEffect } from 'react'

export default function TokenPurchasePage() {
  const params = useParams()
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  // const { setBookingType } = useBooking()

  const tokenId = params.id as string
  // const token = tokens.find((t) => t.id === tokenId)

  // Store redirect URL for login page
  useEffect(() => {
    if (!isLoggedIn) {
      // Store the current page URL for redirect after login
      // This allows developers to see the template without logging in first
    }
  }, [isLoggedIn])

  // if (!token) {
  //   notFound()
  // }

  // const handleProceedToPayment = () => {
  //   setBookingType('token', token.id, token.type, token.price)
  //   router.push('/payment')
  // }

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Header showBack={true} title="Purchase Pass" />

      <div className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Token Summary */}
          {/* <BookingSummaryCard
            itemName={token.type}
            itemPrice={token.price}
            itemType="token"
            details={{
              'Validity': `${token.validity} day${token.validity !== 1 ? 's' : ''}`,
              'Access': token.sites.join(', '),
            }}
          /> */}

          {/* Purchase Form */}
          {!isLoggedIn ? (
            <div className="bg-card rounded-lg p-6 border">
              <h2 className="text-xl font-semibold text-foreground mb-6">Purchase Details</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Please <a href={`/login?redirect=/tokens/buy/${tokenId}`} className="text-primary font-semibold hover:underline">sign in</a> to complete your purchase.
                </p>
                <div className="opacity-50 pointer-events-none">
                  {/* <TokenBookingForm onSubmit={handleProceedToPayment} /> */}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-lg p-6 border">
              <h2 className="text-xl font-semibold text-foreground mb-6">Purchase Details</h2>
              {/* <TokenBookingForm onSubmit={handleProceedToPayment} /> */}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
