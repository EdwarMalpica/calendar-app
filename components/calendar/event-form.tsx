"use client"

import type React from "react"

import { useState } from "react"
import { format } from "date-fns"
import { enUS } from "date-fns/locale"
import { v4 as uuidv4 } from "uuid"
import { Plus, Trash, Clock, CalendarIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Event, EventColor, Reminder, RecurrenceRule, RecurrenceType } from "./calendar"

interface EventFormProps {
  event?: Event
  initialDate?: Date
  onClose: () => void
  onSave: (event: Event, updateAll?: boolean) => void
}

export function EventForm({ event, initialDate, onClose, onSave }: EventFormProps) {
  const isEditing = !!event
  const isRecurringInstance = isEditing && !!event.parentId

  const [title, setTitle] = useState(event?.title || "")
  const [description, setDescription] = useState(event?.description || "")

  // Use Date objects for easier manipulation
  const [startDate, setStartDate] = useState<Date>(event?.start || initialDate || new Date())
  const [endDate, setEndDate] = useState<Date>(
    event?.end ||
      (initialDate ? new Date(initialDate.getTime() + 60 * 60 * 1000) : new Date(Date.now() + 60 * 60 * 1000)),
  )

  const [location, setLocation] = useState(event?.location || "")
  const [color, setColor] = useState<EventColor>(event?.color || "blue")
  const [reminders, setReminders] = useState<Reminder[]>(event?.reminders || [])
  const [recurrence, setRecurrence] = useState<RecurrenceRule>(event?.recurrence || { type: "none", interval: 1 })
  const [updateAll, setUpdateAll] = useState(false)

  const handleAddReminder = () => {
    const newReminder: Reminder = {
      id: uuidv4(),
      time: 30, // Default 30 minutes before
    }
    setReminders([...reminders, newReminder])
  }

  const handleRemoveReminder = (id: string) => {
    setReminders(reminders.filter((reminder) => reminder.id !== id))
  }

  const handleUpdateReminder = (id: string, time: number) => {
    setReminders(reminders.map((reminder) => (reminder.id === id ? { ...reminder, time } : reminder)))
  }

  // Update start time without changing the date
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(":").map(Number)
    const newDate = new Date(startDate)
    newDate.setHours(hours, minutes)
    setStartDate(newDate)
  }

  // Update end time without changing the date
  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(":").map(Number)
    const newDate = new Date(endDate)
    newDate.setHours(hours, minutes)
    setEndDate(newDate)
  }

  // Update start date from calendar picker
  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      const newDate = new Date(date)
      // Preserve the time from the current startDate
      newDate.setHours(
        startDate.getHours(),
        startDate.getMinutes(),
        startDate.getSeconds(),
        startDate.getMilliseconds(),
      )
      setStartDate(newDate)
    }
  }

  // Update end date from calendar picker
  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      const newDate = new Date(date)
      // Preserve the time from the current endDate
      newDate.setHours(endDate.getHours(), endDate.getMinutes(), endDate.getSeconds(), endDate.getMilliseconds())
      setEndDate(newDate)
    }
  }

  const handleSave = () => {
    const newEvent: Event = {
      id: event?.id || uuidv4(),
      title,
      description,
      start: startDate,
      end: endDate,
      location,
      color,
      reminders,
      recurrence,
      parentId: event?.parentId,
      isDeleted: false,
    }

    onSave(newEvent, updateAll)
  }

  // Actualizar las opciones de colores en el formulario para mostrar solo 4 colores
  const colorOptions: { value: EventColor; label: string }[] = [
    { value: "blue", label: "Blue" },
    { value: "green", label: "Green" },
    { value: "red", label: "Red" },
    { value: "yellow", label: "Yellow" },
  ]

  const reminderOptions = [
    { value: 0, label: "At time of event" },
    { value: 5, label: "5 minutes before" },
    { value: 10, label: "10 minutes before" },
    { value: 15, label: "15 minutes before" },
    { value: 30, label: "30 minutes before" },
    { value: 60, label: "1 hour before" },
    { value: 120, label: "2 hours before" },
    { value: 1440, label: "1 day before" },
  ]

  // Format date for display in a more compact way
  const formatDateForDisplay = (date: Date) => {
    return format(date, "MMM d, yyyy", { locale: enUS })
  }

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Event" : "Create Event"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add title"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal" id="start-date">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateForDisplay(startDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[60]" align="start">
                  <Calendar mode="single" selected={startDate} onSelect={handleStartDateSelect} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-time">Start time</Label>
              <div className="relative">
                <Input
                  id="start-time"
                  type="time"
                  value={format(startDate, "HH:mm")}
                  onChange={handleStartTimeChange}
                  className="custom-time-input focus:ring-primary focus:border-primary"
                />
                <Clock className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="end-date">End date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal" id="end-date">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateForDisplay(endDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[60]" align="start">
                  <Calendar mode="single" selected={endDate} onSelect={handleEndDateSelect} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">End time</Label>
              <div className="relative">
                <Input
                  id="end-time"
                  type="time"
                  value={format(endDate, "HH:mm")}
                  onChange={handleEndTimeChange}
                  className="custom-time-input focus:ring-primary focus:border-primary"
                />
                <Clock className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          <Tabs defaultValue="details">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="reminders">Reminders</TabsTrigger>
              <TabsTrigger value="recurrence">Recurrence</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Add location"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Select value={color} onValueChange={(value) => setColor(value as EventColor)}>
                  <SelectTrigger id="color">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <div
                            className={
                              option.value === "red"
                                ? "w-4 h-4 rounded-full mr-2 bg-red-500"
                                : option.value === "blue"
                                  ? "w-4 h-4 rounded-full mr-2 bg-blue-500"
                                  : option.value === "green"
                                    ? "w-4 h-4 rounded-full mr-2 bg-green-500"
                                    : option.value === "yellow"
                                      ? "w-4 h-4 rounded-full mr-2 bg-yellow-500"
                                      : ""
                            }
                          />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="reminders" className="space-y-4">
              {reminders.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No reminders set</div>
              ) : (
                <div className="space-y-2">
                  {reminders.map((reminder) => (
                    <div key={reminder.id} className="flex items-center gap-2">
                      <Select
                        value={reminder.time.toString()}
                        onValueChange={(value) => handleUpdateReminder(reminder.id, Number.parseInt(value))}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {reminderOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveReminder(reminder.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button variant="outline" size="sm" className="w-full" onClick={handleAddReminder}>
                <Plus className="h-4 w-4 mr-2" />
                Add reminder
              </Button>
            </TabsContent>

            <TabsContent value="recurrence" className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-medium">Repeat</Label>
                <RadioGroup
                  value={recurrence.type}
                  onValueChange={(value) => setRecurrence({ ...recurrence, type: value as RecurrenceType })}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="r-none" />
                    <Label htmlFor="r-none" className="font-normal">
                      Does not repeat
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="daily" id="r-daily" />
                    <Label htmlFor="r-daily" className="font-normal">
                      Daily
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly" id="r-weekly" />
                    <Label htmlFor="r-weekly" className="font-normal">
                      Weekly
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly" id="r-monthly" />
                    <Label htmlFor="r-monthly" className="font-normal">
                      Monthly
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {recurrence.type !== "none" && (
                <div className="space-y-2">
                  <Label htmlFor="interval" className="text-base font-medium">
                    Every
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="interval"
                      type="number"
                      min="1"
                      value={recurrence.interval}
                      onChange={(e) =>
                        setRecurrence({
                          ...recurrence,
                          interval: Number.parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-20"
                    />
                    <span>
                      {recurrence.type === "daily" && "days"}
                      {recurrence.type === "weekly" && "weeks"}
                      {recurrence.type === "monthly" && "months"}
                    </span>
                  </div>
                </div>
              )}

              {recurrence.type !== "none" && (
                <div className="space-y-2">
                  <Label htmlFor="end-recurrence" className="text-base font-medium">
                    Ends
                  </Label>
                  <Select
                    value={recurrence.endDate ? "date" : recurrence.occurrences ? "count" : "never"}
                    onValueChange={(value) => {
                      if (value === "never") {
                        setRecurrence({
                          ...recurrence,
                          endDate: null,
                          occurrences: null,
                        })
                      } else if (value === "date") {
                        setRecurrence({
                          ...recurrence,
                          endDate: new Date(),
                          occurrences: null,
                        })
                      } else if (value === "count") {
                        setRecurrence({
                          ...recurrence,
                          endDate: null,
                          occurrences: 10,
                        })
                      }
                    }}
                  >
                    <SelectTrigger id="end-recurrence">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="date">On date</SelectItem>
                      <SelectItem value="count">After</SelectItem>
                    </SelectContent>
                  </Select>

                  {recurrence.endDate && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal mt-2">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formatDateForDisplay(recurrence.endDate)}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[60]" align="start">
                        <Calendar
                          mode="single"
                          selected={recurrence.endDate}
                          onSelect={(date) =>
                            setRecurrence({
                              ...recurrence,
                              endDate: date || new Date(),
                            })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}

                  {recurrence.occurrences && (
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="number"
                        min="1"
                        value={recurrence.occurrences}
                        onChange={(e) =>
                          setRecurrence({
                            ...recurrence,
                            occurrences: Number.parseInt(e.target.value) || 1,
                          })
                        }
                        className="w-20"
                      />
                      <span>occurrences</span>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {isRecurringInstance && (
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="update-all"
                checked={updateAll}
                onCheckedChange={(checked) => setUpdateAll(checked as boolean)}
              />
              <Label htmlFor="update-all">Update all occurrences</Label>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title} className="w-full sm:w-auto order-1 sm:order-2">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

