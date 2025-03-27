"use client"

import { eachHourOfInterval, format, differenceInMinutes, isToday } from "date-fns"
import { enUS } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { Event } from "./calendar"

interface DayViewProps {
  currentDate: Date
  events: Event[]
  onDateClick: (date: Date) => void
  onEventClick: (event: Event) => void
}

export function DayView({ currentDate, events, onDateClick, onEventClick }: DayViewProps) {
  // Create hours from 0 to 23
  const hours = eachHourOfInterval({
    start: new Date(currentDate.setHours(0, 0, 0, 0)),
    end: new Date(currentDate.setHours(23, 0, 0, 0)),
  })

  // Get events for the current day
  const dayEvents = events.filter(
    (event) =>
      event.start.getDate() === currentDate.getDate() &&
      event.start.getMonth() === currentDate.getMonth() &&
      event.start.getFullYear() === currentDate.getFullYear(),
  )

  // Calculate event position and height based on time
  const getEventStyle = (event: Event) => {
    const dayStart = new Date(currentDate.setHours(0, 0, 0, 0))
    const dayEnd = new Date(currentDate.setHours(23, 59, 59, 999))

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
          <div key={i} className="h-16 text-xs text-right pr-2 -mt-2">
            {format(hour, "HH:mm")}
          </div>
        ))}
      </div>

      {/* Day and events */}
      <div className="relative">
        {/* Day header */}
        <div
          className={cn(
            "sticky top-0 z-10 text-center py-2 border-b font-medium",
            isToday(currentDate) ? "bg-primary/10" : "bg-background",
          )}
        >
          <div className="text-lg">{format(currentDate, "EEEE, d MMMM", { locale: enUS })}</div>
        </div>

        {/* Hour grid lines */}
        <div>
          {hours.map((hour, hourIndex) => {
            const isPastHour = new Date() > new Date(currentDate.setHours(hour.getHours(), 59, 59, 999))
            return (
              <div
                key={hourIndex}
                className={cn(
                  "h-16 border-b border-dashed hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-150",
                  isPastHour && "bg-gray-50 dark:bg-gray-900/50",
                )}
                onClick={() => {
                  const clickedDate = new Date(currentDate)
                  clickedDate.setHours(hour.getHours(), 0, 0, 0)
                  onDateClick(clickedDate)
                }}
              />
            )
          })}
        </div>

        {/* Events */}
        <div className="absolute inset-0 mt-12 pointer-events-none">
          {dayEvents.map((event) => (
            <div
              key={event.id}
              className={cn(
                "absolute left-4 right-4 rounded p-2 text-sm overflow-hidden pointer-events-auto cursor-pointer",
                `bg-${event.color}-500/20 border-l-2 border-${event.color}-500 dark:bg-${event.color}-600/20 dark:border-${event.color}-600`,
              )}
              style={getEventStyle(event)}
              onClick={(e) => {
                e.stopPropagation()
                onEventClick(event)
              }}
            >
              <div className="font-medium">{event.title}</div>
              <div>
                {format(event.start, "HH:mm")} - {format(event.end, "HH:mm")}
              </div>
              {event.location && <div className="text-xs truncate">{event.location}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

