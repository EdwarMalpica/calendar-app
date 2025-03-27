import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { enUS } from "date-fns/locale"
import type { Event, ViewType } from "@/components/calendar/calendar"
import { v4 as uuidv4 } from "uuid"

// Generate instances of recurring events for the current view
export function generateEventInstances(events: Event[], view: ViewType, currentDate: Date): Event[] {
  // Define the date range for the current view
  let viewStart: Date
  let viewEnd: Date

  // Always use month view
  viewStart = startOfMonth(currentDate)
  viewEnd = endOfMonth(currentDate)
  // Extend to include the full weeks
  viewStart = startOfWeek(viewStart, { locale: enUS })
  viewEnd = endOfWeek(viewEnd, { locale: enUS })

  // Start with non-recurring events (filter out deleted events)
  const nonRecurringEvents = events.filter(
    (event) => event.recurrence.type === "none" && !event.parentId && !event.isDeleted,
  )

  // Filter events that fall within the view range
  const eventsInRange = nonRecurringEvents.filter((event) => isEventInRange(event, viewStart, viewEnd))

  // Generate instances for recurring events (filter out deleted events)
  const recurringEvents = events.filter(
    (event) => event.recurrence.type !== "none" && !event.parentId && !event.isDeleted,
  )

  const recurringInstances = recurringEvents.flatMap((event) => generateRecurringInstances(event, viewStart, viewEnd))

  // Combine all events
  return [...eventsInRange, ...recurringInstances]
}

// Check if an event falls within a date range
function isEventInRange(event: Event, rangeStart: Date, rangeEnd: Date): boolean {
  // Event starts within range
  if (isWithinInterval(event.start, { start: rangeStart, end: rangeEnd })) {
    return true
  }

  // Event ends within range
  if (isWithinInterval(event.end, { start: rangeStart, end: rangeEnd })) {
    return true
  }

  // Event spans the entire range
  if (event.start <= rangeStart && event.end >= rangeEnd) {
    return true
  }

  return false
}

// Generate instances of a recurring event within a date range
function generateRecurringInstances(event: Event, rangeStart: Date, rangeEnd: Date): Event[] {
  const instances: Event[] = []
  const { recurrence } = event

  // Start with the original event date
  let currentDate = new Date(event.start)
  let currentEndDate = new Date(event.end)
  const duration = event.end.getTime() - event.start.getTime()

  // Maximum number of occurrences to prevent infinite loops
  const maxOccurrences = recurrence.occurrences || 100
  let occurrenceCount = 0

  while (occurrenceCount < maxOccurrences) {
    // Check if we've reached the end date or max occurrences
    if (recurrence.endDate && currentDate > recurrence.endDate) {
      break
    }

    if (recurrence.occurrences && occurrenceCount >= recurrence.occurrences) {
      break
    }

    // Check if the current instance is after the range end
    if (currentDate > rangeEnd) {
      break
    }

    // If the current instance is within or overlaps the range, add it
    if (currentEndDate >= rangeStart) {
      const instance: Event = {
        ...event,
        id: uuidv4(), // Generate a unique ID for this instance
        parentId: event.id, // Reference to the parent event
        start: new Date(currentDate),
        end: new Date(currentEndDate),
        isDeleted: false, // Ensure instances are not deleted
      }

      instances.push(instance)
    }

    // Move to the next occurrence based on recurrence type
    switch (recurrence.type) {
      case "daily":
        currentDate = addDays(currentDate, recurrence.interval)
        currentEndDate = new Date(currentDate.getTime() + duration)
        break

      case "weekly":
        currentDate = addWeeks(currentDate, recurrence.interval)
        currentEndDate = new Date(currentDate.getTime() + duration)
        break

      case "monthly":
        currentDate = addMonths(currentDate, recurrence.interval)
        currentEndDate = new Date(currentDate.getTime() + duration)
        break

      case "custom":
        // For custom recurrence, we'd need more complex logic
        // This is a simplified version
        currentDate = addDays(currentDate, recurrence.interval)
        currentEndDate = new Date(currentDate.getTime() + duration)
        break

      default:
        // Should not reach here
        break
    }

    occurrenceCount++
  }

  return instances
}

