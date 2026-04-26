'use client'

import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, Calendar, BarChart3 } from "lucide-react"

type FilterPeriod = 'today' | 'week' | 'month' | 'all'

interface DateFilterProps {
  activeFilter: FilterPeriod
  onFilterChange: (filter: FilterPeriod) => void
  loading?: boolean
}

export function DateFilter({ activeFilter, onFilterChange, loading }: DateFilterProps) {
  const filters = [
    { key: 'today' as const, label: 'Today', icon: Clock },
    { key: 'week' as const, label: 'This Week', icon: CalendarDays },
    { key: 'month' as const, label: 'This Month', icon: Calendar },
    { key: 'all' as const, label: 'All Time', icon: BarChart3 }
  ]

  const getDateRange = (period: FilterPeriod) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (period) {
      case 'today':
        return {
          startDate: today.toISOString().split('T')[0],
          endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString().split('T')[0]
        }
      case 'week':
        const weekStart = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000)
        const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000 - 1)
        return {
          startDate: weekStart.toISOString().split('T')[0],
          endDate: weekEnd.toISOString().split('T')[0]
        }
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
        return {
          startDate: monthStart.toISOString().split('T')[0],
          endDate: monthEnd.toISOString().split('T')[0]
        }
      default:
        return {}
    }
  }

  const handleFilterChange = (period: FilterPeriod) => {
    onFilterChange(period)
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {filters.map(({ key, label, icon: Icon }) => (
        <Button
          key={key}
          variant={activeFilter === key ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterChange(key)}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Icon className="w-4 h-4" />
          {label}
        </Button>
      ))}
    </div>
  )
}