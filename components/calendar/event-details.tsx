"use client"

import { useState } from "react"
import { format } from "date-fns"
import { enUS } from "date-fns/locale"
import { MapPin, Clock, Bell, Repeat } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { DeleteConfirmation } from "./delete-confirmation"
import type { Event } from "./calendar"

interface EventDetailsProps {
  event: Event
  onClose: () => void
  onEdit: () => void
  onDelete: (id: string, deleteAll: boolean) => void
}

export function EventDetails({ event, onClose, onEdit, onDelete }: EventDetailsProps) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const isRecurringInstance = !!event.parentId

  const formatReminderTime = (minutes: number) => {
    if (minutes === 0) return "At time of event"
    if (minutes < 60) return `${minutes} minutes before`
    if (minutes === 60) return "1 hour before"
    if (minutes < 1440) return `${minutes / 60} hours before`
    return `${minutes / 1440} days before`
  }

  const formatRecurrence = () => {
    if (event.recurrence.type === "none") return "Does not repeat"

    let text = ""

    switch (event.recurrence.type) {
      case "daily":
        text = event.recurrence.interval === 1 ? "Every day" : `Every ${event.recurrence.interval} days`
        break
      case "weekly":
        text = event.recurrence.interval === 1 ? "Every week" : `Every ${event.recurrence.interval} weeks`
        break
      case "monthly":
        text = event.recurrence.interval === 1 ? "Every month" : `Every ${event.recurrence.interval} months`
        break
      case "custom":
        text = "Custom"
        break
    }

    if (event.recurrence.endDate) {
      text += ` until ${format(event.recurrence.endDate, "d MMMM yyyy", { locale: enUS })}`
    } else if (event.recurrence.occurrences) {
      text += `, ${event.recurrence.occurrences} times`
    }

    return text
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true)
  }

  const handleConfirmDelete = () => {
    // Close both modals and delete the event
    setShowDeleteConfirmation(false)
    onDelete(event.id, false)
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false)
  }

  return (
    <>
      <Dialog open onOpenChange={() => onClose()}>
        <DialogContent className="max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">{event.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div
              className={
                event.color === "red"
                  ? "w-full h-2 rounded-full bg-red-500"
                  : event.color === "blue"
                    ? "w-full h-2 rounded-full bg-blue-500"
                    : event.color === "green"
                      ? "w-full h-2 rounded-full bg-green-500"
                      : event.color === "yellow"
                        ? "w-full h-2 rounded-full bg-yellow-500"
                        : ""
              }
            />

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <div>{format(event.start, "EEEE, d MMMM yyyy", { locale: enUS })}</div>
                <div>
                  {format(event.start, "HH:mm", { locale: enUS })} - {format(event.end, "HH:mm", { locale: enUS })}
                </div>
              </div>
            </div>

            {event.location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>{event.location}</div>
              </div>
            )}

            {event.reminders.length > 0 && (
              <div className="flex items-start gap-3">
                <Bell className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  {event.reminders.map((reminder, index) => (
                    <div key={reminder.id}>{formatReminderTime(reminder.time)}</div>
                  ))}
                </div>
              </div>
            )}

            {(event.recurrence.type !== "none" || isRecurringInstance) && (
              <div className="flex items-start gap-3">
                <Repeat className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>{formatRecurrence()}</div>
              </div>
            )}

            {event.description && (
              <>
                <Separator />
                <div className="whitespace-pre-wrap">{event.description}</div>
              </>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-2 mt-4">
            <Button variant="destructive" onClick={handleDeleteClick} className="w-full sm:w-auto order-2 sm:order-1">
              Delete
            </Button>
            <Button onClick={onEdit} className="w-full sm:w-auto order-1 sm:order-2">
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmation
        isOpen={showDeleteConfirmation}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={event.title}
      />
    </>
  )
}

