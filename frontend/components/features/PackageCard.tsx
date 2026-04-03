import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'
import type { Package } from '@/lib/mockData'

interface PackageCardProps {
  pkg: Package
}

export function PackageCard({ pkg }: PackageCardProps) {
  return (
    <Link href={`/packages/book/${pkg.id}`}>
      <Card className="overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:border-primary/50">
        <div className="aspect-video relative overflow-hidden bg-muted">
          <Image
            src={pkg.image}
            alt={pkg.title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{pkg.title}</h3>

          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{pkg.duration} hours</span>
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            {pkg.highlights.slice(0, 3).map((highlight) => (
              <Badge key={highlight} variant="secondary" className="text-xs">
                {highlight}
              </Badge>
            ))}
          </div>

          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {pkg.description}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-primary">₹{pkg.price}</span>
            <span className="text-xs text-muted-foreground">View →</span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
