"use client"

import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  eachHourOfInterval,
  format,
  isSameDay,
  isWithinInterval,
  differenceInMinutes,
  isToday,
} from "date-fns"
import { enUS } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { Event } from "./calendar"

interface WeekViewProps {
  currentDate: Date
  events: Event[]
  onDateClick: (date: Date) => void
  onEventClick: (event: Event) => void
}

export function WeekView({ currentDate, events, onDateClick, onEventClick }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { locale: enUS })
  const weekEnd = endOfWeek(currentDate, { locale: enUS })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Create hours from 0 to 23
  const hours = eachHourOfInterval({
    start: new Date(weekStart.setHours(0, 0, 0, 0)),
    end: new Date(weekStart.setHours(23, 0, 0, 0)),
  })

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter(
      (event) => isSameDay(event.start, day) || isWithinInterval(day, { start: event.start, end: event.end }),
    )
  }

  // Calculate event position and height based on time
  const getEventStyle = (event: Event, day: Date) => {
    const dayStart = new Date(day.setHours(0, 0, 0, 0))
    const dayEnd = new Date(day.setHours(23, 59, 59, 999))

    const eventStart = event.start < dayStart ? dayStart : event.start
    const eventEnd = event.end > dayEnd ? dayEnd : event.end

    const startMinutes = eventStart.getHours() * 60 + eventStart.getMinutes()
    const durationMinutes = differenceInMinutes(eventEnd, eventStart)

    const top = (startMinutes / (24 * 60)) * 100
    const height = (durationMinutes / (24 * 60)) * 100

    return {
      top: `${top}%`,
      height: `${height}%`,
    }
  }

  return (
    <div className="h-full grid grid-cols-[auto_1fr]">
      {/* Time labels */}
      <div className="pr-2 border-r">
        {hours.map((hour, i) => (
          <div key={i} className="h-12 text-xs text-right pr-2 -mt-2">
            {format(hour, "HH:mm")}
          </div>
        ))}
      </div>

      {/* Days and events */}
      <div className="grid grid-cols-7 h-full overflow-auto">
        {days.map((day, dayIndex) => (
          <div key={dayIndex} className="relative border-r">
            {/* Day header */}
            <div
              className={cn(
                "sticky top-0 z-10 text-center py-1 border-b font-medium",
                isToday(day) ? "bg-primary/10" : "bg-background",
              )}
            >
              <div>{format(day, "EEE", { locale: enUS })}</div>
              <div
                className={cn(
                  "h-6 w-6 mx-auto flex items-center justify-center rounded-full",
                  isToday(day) && "bg-primary text-primary-foreground",
                )}
              >
                {format(day, "d")}
              </div>
            </div>

            {/* Hour grid lines */}
            <div>
              {hours.map((hour, hourIndex) => {
                const isPastHour = new Date() > new Date(day.setHours(hour.getHours(), 59, 59, 999))
                return (
                  <div
                    key={hourIndex}
                    className={cn(
                      "h-12 border-b border-dashed hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-150",
                      isPastHour && "bg-gray-50 dark:bg-gray-900/50",
                    )}
                    onClick={() => {
                      const clickedDate = new Date(day)
                      clickedDate.setHours(hour.getHours(), 0, 0, 0)
                      onDateClick(clickedDate)
                    }}
                  />
                )
              })}
            </div>

            {/* Events */}
            <div className="absolute inset-0 mt-16 pointer-events-none">
              {getEventsForDay(day).map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "absolute left-1 right-1 rounded px-1 text-xs overflow-hidden pointer-events-auto cursor-pointer",
                    `bg-${event.color}-500/20 border-l-2 border-${event.color}-500 dark:bg-${event.color}-600/20 dark:border-${event.color}-600`,
                  )}
                  style={getEventStyle(event, day)}
                  onClick={(e) => {
                    e.stopPropagation()
                    onEventClick(event)
                  }}
                >
                  <div className="font-medium truncate">{event.title}</div>
                  <div className="truncate">
                    {format(event.start, "HH:mm")} - {format(event.end, "HH:mm")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

