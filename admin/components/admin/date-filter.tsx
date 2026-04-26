"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Filter, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface DateFilterProps {
  onFilter: (startDate?: Date, endDate?: Date) => void
  loading?: boolean
}

export function DateFilter({ onFilter, loading }: DateFilterProps) {
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [startOpen, setStartOpen] = useState(false)
  const [endOpen, setEndOpen] = useState(false)

  const handleFilter = () => {
    onFilter(startDate, endDate)
  }

  const handleClear = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    onFilter(undefined, undefined)
  }

  const hasFilter = startDate || endDate

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Start Date */}
      <Popover open={startOpen} onOpenChange={setStartOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[140px] justify-start text-left font-normal",
              !startDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate ? format(startDate, "PPP") : "Start date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={(date) => {
              setStartDate(date)
              setStartOpen(false)
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* End Date */}
      <Popover open={endOpen} onOpenChange={setEndOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[140px] justify-start text-left font-normal",
              !endDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {endDate ? format(endDate, "PPP") : "End date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={(date) => {
              setEndDate(date)
              setEndOpen(false)
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Filter Button */}
      <Button
        onClick={handleFilter}
        disabled={loading}
        size="sm"
        className="gap-2"
      >
        <Filter className="h-4 w-4" />
        Filter
      </Button>

      {/* Clear Button */}
      {hasFilter && (
        <Button
          onClick={handleClear}
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  )
}