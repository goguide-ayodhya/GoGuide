import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Token } from '@/lib/mockData'

interface TokenCardProps {
  token: Token
}

export function TokenCard({ token }: TokenCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between gap-2 mb-4">
          <div>
            <h3 className="text-xl font-semibold text-foreground">{token.type}</h3>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Valid for {token.validity} day{token.validity !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg mb-4">
          <div className="text-3xl font-bold text-primary mb-1">₹{token.price}</div>
          <p className="text-sm text-muted-foreground">{token.description}</p>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-foreground mb-3 text-sm">Benefits</h4>
          <ul className="space-y-2">
            {token.benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-foreground mb-2 text-sm">Includes Access To</h4>
          <div className="flex flex-wrap gap-2">
            {token.sites.map((site) => (
              <Badge key={site} variant="secondary" className="text-xs">
                {site}
              </Badge>
            ))}
          </div>
        </div>

        <Link href={`/tokens/buy/${token.id}`}>
          <Button className="w-full bg-secondary hover:bg-secondary/90">
            Purchase Pass
          </Button>
        </Link>
      </div>
    </Card>
  )
}
