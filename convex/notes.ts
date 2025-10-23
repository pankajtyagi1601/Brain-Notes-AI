import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internalQuery } from "./_generated/server";

export const getUserNotes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("notes")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Internal query for chatbot to get user's notes
export const getNotesForChat = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const allNotes = await ctx.db
      .query("notes")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const sortedNotes = allNotes
      .sort((a, b) => {
        const aTime = a.createdAt || a._creationTime;
        const bTime = b.createdAt || b._creationTime;
        return bTime - aTime;
      })
      .slice(0, 10);

    return sortedNotes.map((note) => ({
      id: note._id, // This is the note ID we'll use for links
      title: note.title,
      body: note.body.substring(0, 300),
      createdAt: note.createdAt || note._creationTime,
      updatedAt: note.updatedAt || note._creationTime,
    }));
  },
});

export const createNote = mutation({
  args: {
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Validation
    if (args.title.trim().length === 0) {
      throw new Error("Title cannot be empty");
    }

    const now = Date.now();
    const noteId = await ctx.db.insert("notes", {
      userId,
      title: args.title.trim(),
      body: args.body,
      createdAt: now,
      updatedAt: now,
    });

    return noteId;
  },
});

export const updateNote = mutation({
  args: {
    id: v.id("notes"),
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const note = await ctx.db.get(args.id);
    if (!note) {
      throw new Error("Note not found");
    }
    if (note.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, {
      title: args.title.trim(),
      body: args.body,
      updatedAt: Date.now(),
    });
  },
});

export const deleteNote = mutation({
  args: {
    noteId: v.id("notes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated to delete a note");
    }

    const note = await ctx.db.get(args.noteId);

    if (!note) {
      throw new Error("Note not found");
    }

    if (note.userId !== userId) {
      throw new Error("User is not authorized to delete this note");
    }

    await ctx.db.delete(args.noteId);
  },
});
