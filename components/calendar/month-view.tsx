"use client"

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns"
import { enUS } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { Event } from "./calendar"

interface MonthViewProps {
  currentDate: Date
  events: Event[]
  onDateClick: (date: Date) => void
  onEventClick: (event: Event) => void
}

export function MonthView({ currentDate, events, onDateClick, onEventClick }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart, { locale: enUS })
  const calendarEnd = endOfWeek(monthEnd, { locale: enUS })

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Group days into weeks
  const weeks: Date[][] = []
  let week: Date[] = []

  days.forEach((day) => {
    week.push(day)
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  })

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter((event) => isSameDay(event.start, day))
  }

  return (
    <div className="h-full grid grid-rows-[auto_1fr]">
      <div className="grid grid-cols-7 text-center border-b">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
          <div key={i} className="py-2 font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-rows-6 h-full">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 h-full border-b">
            {week.map((day, dayIndex) => {
              const dayEvents = getEventsForDay(day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isSelected = isToday(day)
              const isPastDay = day < new Date(new Date().setHours(0, 0, 0, 0))

              return (
                <div
                  key={dayIndex}
                  className={cn(
                    "border-r p-1 h-full relative transition-colors duration-150",
                    !isCurrentMonth && "bg-gray-100 dark:bg-gray-800",
                    isCurrentMonth && isPastDay && "bg-gray-50 dark:bg-gray-900",
                    isSelected && "ring-2 ring-primary ring-inset",
                    "hover:bg-blue-50 dark:hover:bg-blue-900/20",
                  )}
                  onClick={() => onDateClick(day)}
                >
                  <div className="flex justify-end">
                    <span
                      className={cn(
                        "text-sm p-1",
                        isToday(day) && "font-bold text-primary",
                        isPastDay && "text-gray-500 dark:text-gray-400",
                      )}
                    >
                      {format(day, "d")}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "text-xs p-1 rounded truncate cursor-pointer text-white",
                          event.color === "red"
                            ? "bg-red-500 dark:bg-red-600"
                            : event.color === "blue"
                              ? "bg-blue-500 dark:bg-blue-600"
                              : event.color === "green"
                                ? "bg-green-500 dark:bg-green-600"
                                : event.color === "yellow"
                                  ? "bg-yellow-500 dark:bg-yellow-600"
                                  : "",
                        )}
                        onClick={(e) => {
                          e.stopPropagation()
                          onEventClick(event)
                        }}
                      >
                        {event.title}
                      </div>
                    ))}

                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground">+{dayEvents.length - 3} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

