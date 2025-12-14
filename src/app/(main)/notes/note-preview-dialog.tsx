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
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

interface NotePreviewDialogProps {
  note: Doc<"notes">;
  /** Optional callback for parent to refresh the list after a deletion */
  onNoteDeleted?: (id: string) => void;
}

export function NotePreviewDialog({
  note,
  onNoteDeleted,
}: NotePreviewDialogProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isOpen = searchParams.get("noteId") === note._id;

  const deleteNote = useMutation(api.notes.deleteNote);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleClose() {
    router.push(window.location.pathname);
  }

  async function handleDelete() {
    const confirmed = confirm("Are you sure you want to delete this note?");
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteNote({ noteId: note._id });
      toast.success("Note deleted");
      onNoteDeleted?.(note._id);
      handleClose();
    } catch (error) {
      console.error("Failed to delete note", error);
      toast.error("Failed to delete note. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  // Relative time format (e.g., “Edited 2 hours ago”)
  function formatEditedTime(timestamp: number | string) {
    const date = new Date(Number(timestamp));
    return `Edited ${formatDistanceToNow(date, { addSuffix: true })}`;
  }

  const editedText = formatEditedTime(note.updatedAt || note.createdAt);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl selection:bg-primary selection:text-primary-foreground rounded-xl border-primary max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{note.title || "Untitled"}</DialogTitle>
        </DialogHeader>

        {/* Scrollable content */}
        <div className="flex-1 min-h-0 mt-4 scroll-thumb-primary  text-muted-foreground overflow-y-auto whitespace-pre-wrap pr-3">
          {note.body || (
            <span className="text-muted-foreground italic">No content</span>
          )}
        </div>

        <p className="text-sm mt-3 text-right">{editedText}</p>

        <DialogFooter>
          <Button
            className="gap-2 bg-primary/50"
            onClick={handleDelete}
            aria-label="Delete note"
            disabled={isDeleting}
          >
            <Trash2 size={16} />
            <span className="sr-only">Delete note</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
