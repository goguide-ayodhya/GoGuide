import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface BookingSummaryCardProps {
  itemName: string
  itemPrice: number
  itemImage?: string
  itemType: 'cab' | 'package' | 'token' | 'guide'
  details?: Record<string, string | number>
}

export function BookingSummaryCard({
  itemName,
  itemPrice,
  itemImage,
  itemType,
  details,
}: BookingSummaryCardProps) {
  return (
    <Card className="overflow-hidden mb-6">
      {itemImage && (
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Image
            src={itemImage}
            alt={itemName}
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      )}
      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Badge className="mb-2 bg-primary text-primary-foreground capitalize">
              {itemType}
            </Badge>
            <h3 className="text-lg font-semibold text-foreground">{itemName}</h3>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Base price</p>
            <p className="text-2xl font-bold text-secondary">₹{itemPrice}</p>
          </div>
        </div>

        {details && Object.keys(details).length > 0 && (
          <div className="border-t pt-4 space-y-2">
            {Object.entries(details).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-muted-foreground capitalize">{key}:</span>
                <span className="font-medium text-foreground">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
