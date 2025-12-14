"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Doc } from "../../../../convex/_generated/dataModel";
import { NotePreviewDialog } from "./note-preview-dialog";
import { useRouter } from "next/navigation";

interface NoteItemProps {
  note: Doc<"notes">;
  onNoteDeleted?: (id: string) => void; // optional parent sync
}

export function NoteItem({ note, onNoteDeleted }: NoteItemProps) {
  const router = useRouter();

  function handleOpenNote() {
    router.push(`?noteId=${note._id}`);
  }

  return (
    <>
      <Card
        className="cursor-pointer gap-3 border-primary hover:shadow-md transition-shadow"
        onClick={handleOpenNote}
      >
        <CardHeader>
          <CardTitle>{note.title || "Untitled"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="line-clamp-3 px-1 text-sm text-muted-foreground whitespace-pre-line">
            {note.body || "No content"}
          </div>
        </CardContent>
      </Card>

      <NotePreviewDialog note={note} onNoteDeleted={onNoteDeleted} />
    </>
  );
}
