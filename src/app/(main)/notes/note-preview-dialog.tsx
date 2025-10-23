"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { Doc } from "../../../../convex/_generated/dataModel";
import { useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

interface NotePreviewDialogProps {
  note: Doc<"notes">;
}

export function NotePreviewDialog({ note }: NotePreviewDialogProps) {
  const searchParams = useSearchParams();
  const isOpen = searchParams.get("noteId") === note._id;

  const deleteNote = useMutation(api.notes.deleteNote);

  async function handleDelete() {
    try {
      await deleteNote({ noteId: note._id });
      toast.success("Note deleted");
      handleClose();
    } catch (error) {
      console.error("Failed to delete note", error);
      toast.error("Failed to delete note. Please try again.");
    }
  }

  function handleClose() {
    window.history.pushState(null, "", window.location.pathname);
  }

  // Time Stamp Format similar to Google Keep
  function formatEditedTime(timestamp: number) {
    const date = new Date(timestamp);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      // Show time if edited today (e.g., "Edited 1:32 PM")
      const timeString = date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
      return `Edited ${timeString}`;
    } else {
      // Show date if not today (e.g., "Edited Nov 26, 2024")
      const dateString = date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return `Edited ${dateString}`;
    }
  }

  const editedText = formatEditedTime(note.updatedAt || note.createdAt);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{note.title}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 whitespace-pre-wrap">{note.body}</div>

        <p className="text-sm text-muted-foreground mt-3 text-right">
          {editedText}
        </p>

        <DialogFooter>
          <Button
            variant="destructive"
            className="gap-2"
            onClick={handleDelete}
          >
            <Trash2 size={16} />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
