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

// Cambiar el tipo EventColor para limitar a 4 colores
export type EventColor = "blue" | "green" | "red" | "yellow"

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

  // Store the last deleted event ID for undo functionality
  const lastDeletedEventIdRef = useRef<string | null>(null)

  // Generate expanded events
  useEffect(() => {
    try {
      // Filter out soft-deleted events before generating instances
      const activeEvents = events.filter((event) => !event.isDeleted)

      // Generate expanded events (including recurring instances)
      const expanded = generateEventInstances(activeEvents, "month", currentDate)
      setExpandedEvents(expanded)
    } catch (error) {
      console.error("Error generating event instances:", error)
    }
  }, [events, currentDate])

  // Check for reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date()
      expandedEvents.forEach((event) => {
        event.reminders.forEach((reminder) => {
          const reminderTime = new Date(event.start.getTime() - reminder.time * 60 * 1000)
          // If reminder time is within the last minute, show notification
          if (reminderTime > now && reminderTime <= new Date(now.getTime() + 60 * 1000)) {
            toast.info(`Reminder: ${event.title} starts in ${reminder.time} minutes`)
          }
        })
      })
    }

    // Only check reminders if we have expanded events
    if (expandedEvents.length > 0) {
      checkReminders()
    }

    // Set up a timer to check reminders every minute
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
      // Update all instances of a recurring event
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
          isDeleted: false, // Ensure it's not deleted
        }

        setEvents(events.map((e) => (e.id === parentId ? updatedParent : e)))
      }
    } else {
      // Update single event
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
    // Store the event ID for potential undo
    lastDeletedEventIdRef.current = eventId

    if (deleteAll && selectedEvent?.parentId) {
      // Soft delete all instances of a recurring event
      const parentId = selectedEvent.parentId
      setEvents(events.map((e) => (e.id === parentId ? { ...e, isDeleted: true } : e)))
    } else {
      // Soft delete single event
      setEvents(events.map((e) => (e.id === eventId ? { ...e, isDeleted: true } : e)))
    }

    setIsViewingEvent(false)
    setSelectedEvent(null)

    // Show toast with undo button - using error variant for red color
    toast.error("Event deleted", {
      description: "The event has been successfully deleted",
      action: {
        label: "Undo",
        onClick: handleUndoDelete,
      },
      duration: 5000, // Give users 5 seconds to undo
    })
  }

  const handleUndoDelete = () => {
    // Restore the last deleted event if it exists
    if (lastDeletedEventIdRef.current) {
      // Find the event by ID and mark it as not deleted
      setEvents(
        events.map((event) => (event.id === lastDeletedEventIdRef.current ? { ...event, isDeleted: false } : event)),
      )

      // Use info variant for a different color
      toast.info("Event restored", {
        description: "The event has been successfully restored",
      })

      // Clear the reference after restoring
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

