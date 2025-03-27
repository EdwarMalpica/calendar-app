"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteConfirmationProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
}

export function DeleteConfirmation({ isOpen, onClose, onConfirm, title }: DeleteConfirmationProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-lg">
        <DialogHeader>
          <DialogTitle>Delete Event</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p>Are you sure you want to delete "{title}"?</p>
          <p className="text-muted-foreground mt-2">This action cannot be undone.</p>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="w-full sm:w-auto order-1 sm:order-2">
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

