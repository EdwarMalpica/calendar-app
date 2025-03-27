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
        toastOptions={{
          error: { style: { background: "#fee2e2", border: "1px solid #ef4444", color: "#7f1d1d" } },
          info: { style: { background: "#dbeafe", border: "1px solid #3b82f6", color: "#1e3a8a" } },
        }}
      />
    </main>
  )
}

