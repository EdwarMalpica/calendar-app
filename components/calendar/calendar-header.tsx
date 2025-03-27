"use client"

import { format } from "date-fns"
import { enUS } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Plus, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

interface CalendarHeaderProps {
  currentDate: Date
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
  onDateSelect: (date: Date) => void
  onAddEvent: () => void
}

export function CalendarHeader({
  currentDate,
  onPrevious,
  onNext,
  onToday,
  onDateSelect,
  onAddEvent,
}: CalendarHeaderProps) {
  const formatTitle = () => {
    return format(currentDate, "MMMM yyyy", { locale: enUS })
  }

  return (
    <div className="p-4 border-b flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="icon" onClick={onPrevious} className="rounded-md">
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal" id="start-date">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span className="text-xl font-bold capitalize">{formatTitle()}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[60]" align="start">
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={(date) => date && onDateSelect(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="icon" onClick={onNext} className="rounded-md">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={onToday} className="w-full sm:w-auto">
            Today
          </Button>
          <Button variant="default" size="sm" onClick={onAddEvent} className="hidden sm:flex gap-1">
            <Plus className="h-4 w-4" />
            Add Event
          </Button>
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile-only Add Event button */}
      <Button variant="default" size="sm" onClick={onAddEvent} className="w-full sm:hidden gap-1">
        <Plus className="h-4 w-4" />
        Add Event
      </Button>
    </div>
  )
}

