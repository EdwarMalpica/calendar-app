"use client"

import { useState, useEffect, useRef } from "react"
import { addMonths, subMonths } from "date-fns"
import { CalendarHeader } from "./calendar-header"
import { MonthView } from "./month-view"
import { EventForm } from "./event-form"
import { EventDetails } from "./event-details"
import { toast } from "sonner"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { generateEventInstances } from "@/lib/event-utils"

export type ViewType = "month" | "week" | "day"

// Usando colores estándar de Tailwind
export type EventColor = "blue" | "green" | "red" | "purple" | "yellow" | "orange" | "indigo" | "pink" | "teal" | "cyan"

export type Reminder = {
  id: string
  time: number // minutes before event
}

export type RecurrenceType = "daily" | "weekly" | "monthly" | "custom" | "none"

export type RecurrenceRule = {
  type: RecurrenceType
  interval: number
  endDate?: Date | null
  occurrences?: number | null
  daysOfWeek?: number[] // 0-6, where 0 is Sunday
  dayOfMonth?: number
}

export type Event = {
  id: string
  title: string
  description: string
  start: Date
  end: Date
  location?: string
  color: EventColor
  reminders: Reminder[]
  recurrence: RecurrenceRule
  parentId?: string
  isDeleted?: boolean
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useLocalStorage<Event[]>("calendar-events", [])
  const [expandedEvents, setExpandedEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const [isViewingEvent, setIsViewingEvent] = useState(false)
  const [isEditingEvent, setIsEditingEvent] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const lastDeletedEventIdRef = useRef<string | null>(null)

  useEffect(() => {
    try {
      const activeEvents = events.filter((event) => !event.isDeleted)

      const expanded = generateEventInstances(activeEvents, "month", currentDate)
      setExpandedEvents(expanded)
    } catch (error) {
      console.error("Error generating event instances:", error)
    }
  }, [events, currentDate])

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date()
      expandedEvents.forEach((event) => {
        event.reminders.forEach((reminder) => {
          const reminderTime = new Date(event.start.getTime() - reminder.time * 60 * 1000)
          if (reminderTime > now && reminderTime <= new Date(now.getTime() + 60 * 1000)) {
            toast.info(`Reminder: ${event.title} starts in ${reminder.time} minutes`)
          }
        })
      })
    }

    if (expandedEvents.length > 0) {
      checkReminders()
    }

    const timerId = setInterval(checkReminders, 60000)
    return () => clearInterval(timerId)
  }, [expandedEvents])

  const handlePrevious = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNext = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date)
  }

  const handleAddEvent = () => {
    setSelectedDate(new Date())
    setIsCreatingEvent(true)
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setIsCreatingEvent(true)
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setIsViewingEvent(true)
  }

  const handleCreateEvent = (event: Event) => {
    setEvents([...events, { ...event, isDeleted: false }])
    setIsCreatingEvent(false)
    toast.success("Event created", {
      description: "The event has been successfully created",
    })
  }

  const handleUpdateEvent = (updatedEvent: Event, updateAll = false) => {
    if (updateAll && updatedEvent.parentId) {
      const parentId = updatedEvent.parentId
      const parentEvent = events.find((e) => e.id === parentId)

      if (parentEvent) {
        const updatedParent = {
          ...parentEvent,
          title: updatedEvent.title,
          description: updatedEvent.description,
          location: updatedEvent.location,
          color: updatedEvent.color,
          reminders: updatedEvent.reminders,
          isDeleted: false, 
        }

        setEvents(events.map((e) => (e.id === parentId ? updatedParent : e)))
      }
    } else {
      setEvents(events.map((e) => (e.id === updatedEvent.id ? { ...updatedEvent, isDeleted: false } : e)))
    }

    setIsEditingEvent(false)
    setIsViewingEvent(false)
    setSelectedEvent(null)

    toast.success("Event updated", {
      description: "The event has been successfully updated",
    })
  }

  const handleDeleteEvent = (eventId: string, deleteAll = false) => {
    lastDeletedEventIdRef.current = eventId

    if (deleteAll && selectedEvent?.parentId) {
      const parentId = selectedEvent.parentId
      setEvents(events.map((e) => (e.id === parentId ? { ...e, isDeleted: true } : e)))
    } else {
      setEvents(events.map((e) => (e.id === eventId ? { ...e, isDeleted: true } : e)))
    }

    setIsViewingEvent(false)
    setSelectedEvent(null)

    toast.error("Event deleted", {
      description: "The event has been successfully deleted",
      action: {
        label: "Undo",
        onClick: handleUndoDelete,
      },
      duration: 5000, 
    })
  }

  const handleUndoDelete = () => {
    if (lastDeletedEventIdRef.current) {
      setEvents(
        events.map((event) => (event.id === lastDeletedEventIdRef.current ? { ...event, isDeleted: false } : event)),
      )

      toast.info("Event restored", {
        description: "The event has been successfully restored",
      })

      lastDeletedEventIdRef.current = null
    }
  }

  const handleEditEvent = () => {
    setIsViewingEvent(false)
    setIsEditingEvent(true)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-background rounded-lg border">
      <CalendarHeader
        currentDate={currentDate}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
        onDateSelect={handleDateSelect}
        onAddEvent={handleAddEvent}
      />

      <div className="flex-1">
        <MonthView
          currentDate={currentDate}
          events={expandedEvents}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
        />
      </div>

      {isCreatingEvent && selectedDate && (
        <EventForm initialDate={selectedDate} onClose={() => setIsCreatingEvent(false)} onSave={handleCreateEvent} />
      )}

      {isViewingEvent && selectedEvent && (
        <EventDetails
          event={selectedEvent}
          onClose={() => {
            setIsViewingEvent(false)
            setSelectedEvent(null)
          }}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
        />
      )}

      {isEditingEvent && selectedEvent && (
        <EventForm
          event={selectedEvent}
          onClose={() => {
            setIsEditingEvent(false)
            setSelectedEvent(null)
          }}
          onSave={handleUpdateEvent}
        />
      )}
    </div>
  )
}

