'use client'

import { Header } from '@/components/common/Header'
import { Footer } from '@/components/common/Footer'
import { TokenCard } from '@/components/features/TokenCard'
// import { tokens } from '@/lib/mockData'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Info } from 'lucide-react'

export default function TokensPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Header title="Passes & Tickets" showBackButton />

      <div className="flex-grow">
        <div className="px-4 md:px-6 py-8">
          <div className="mx-auto max-w-7xl">
            {/* Info Banner */}
            <Card className="p-6 mb-8 bg-secondary/10 border-secondary/20">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">About Our Passes</h3>
                  <p className="text-sm text-muted-foreground">
                    Get instant access to all major temples and attractions in Ayodhya. Choose a pass that fits your travel plans.
                  </p>
                </div>
              </div>
            </Card>

            {/* Tokens Grid */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Available Passes</h2>
              {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {tokens.map((token) => (
                  <TokenCard key={token.id} token={token} />
                ))}
              </div> */}
            </div>

            {/* Comparison Table */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">Pass Comparison</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-border">
                      <th className="text-left py-4 px-4 font-semibold text-foreground">Feature</th>
                      {/* {tokens.map((token) => (
                        <th key={token.id} className="text-left py-4 px-4 font-semibold text-foreground text-sm">
                          {token.type}
                        </th>
                      ))} */}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border hover:bg-muted/30">
                      <td className="py-4 px-4 font-medium text-foreground">Price</td>
                      {/* {tokens.map((token) => (
                        <td key={token.id} className="py-4 px-4 text-foreground">
                          ₹{token.price}
                        </td>
                      ))} */}
                    </tr>
                    <tr className="border-b border-border hover:bg-muted/30">
                      <td className="py-4 px-4 font-medium text-foreground">Validity</td>
                      {/* {tokens.map((token) => (
                        <td key={token.id} className="py-4 px-4 text-foreground">
                          {token.validity} day{token.validity !== 1 ? 's' : ''}
                        </td>
                      ))} */}
                    </tr>
                    <tr className="border-b border-border hover:bg-muted/30">
                      <td className="py-4 px-4 font-medium text-foreground">Temple Access</td>
                      {/* {tokens.map((token) => (
                        <td key={token.id} className="py-4 px-4">
                          <Check className="h-5 w-5 text-secondary" />
                        </td>
                      ))} */}
                    </tr>
                    <tr className="border-b border-border hover:bg-muted/30">
                      <td className="py-4 px-4 font-medium text-foreground">Parking</td>
                      {/* {tokens.map((token) => (
                        <td key={token.id} className="py-4 px-4">
                          {token.benefits.some((b) => b.includes('Parking')) ? (
                            <Check className="h-5 w-5 text-secondary" />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      ))} */}
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="py-4 px-4 font-medium text-foreground">Discounts</td>
                      {/* {tokens.map((token) => (
                        <td key={token.id} className="py-4 px-4">
                          {token.benefits.some((b) => b.includes('discount')) ? (
                            <Badge variant="secondary" className="text-xs">
                              Yes
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      ))} */}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* FAQs */}
            <div className="mt-12 max-w-2xl">
              <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div className="p-6 bg-muted/50 rounded-lg border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Can I extend my pass validity?</h3>
                  <p className="text-muted-foreground text-sm">
                    Yes, you can extend your pass before it expires. Contact our support team for extension options.
                  </p>
                </div>
                <div className="p-6 bg-muted/50 rounded-lg border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Is there a refund policy?</h3>
                  <p className="text-muted-foreground text-sm">
                    Passes can be refunded within 24 hours of purchase if unused. No refunds after that.
                  </p>
                </div>
                <div className="p-6 bg-muted/50 rounded-lg border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Can multiple people use one pass?</h3>
                  <p className="text-muted-foreground text-sm">
                    No, passes are personal and non-transferable. Each person needs their own pass.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
