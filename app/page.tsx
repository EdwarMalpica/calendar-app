import Calendar from "@/components/calendar/calendar"
import { Toaster } from "sonner"

export default function Home() {
  return (
    <main className="container mx-auto py-6">
      <h1 className="text-3xl font-bold text-center mb-6">Event Calendar</h1>
      <Calendar />
      <Toaster
        position="top-right"
        richColors
        closeButton
        theme="light"
      />
    </main>
  )
}

