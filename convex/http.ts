import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { httpAction } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { internal } from "./_generated/api";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/api/chat",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      const userId = await getAuthUserId(ctx);
      if (!userId) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
        });
      }

      const { messages, systemContext } = await req.json();

      console.log("Received messages:", messages?.length);

      // Fetching user notes for context
      const userNotes = await ctx.runQuery(internal.notes.getNotesForChat, {
        userId,
      });

      const openrouter = createOpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: "https://openrouter.ai/api/v1",
      });

      // Building context aware system prompt with clickable links
      let notesContext = "";
      if (userNotes.length > 0) {
        notesContext = `\n\nUser's Recent Notes:\n${userNotes
          .map((note, idx) => {
            const createdDate = new Date(note.createdAt).toLocaleDateString();
            const updatedDate = new Date(note.updatedAt).toLocaleDateString();
            const noteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
              }/?noteId=${note.id}`;

            return `${idx + 1}. "${note.title}" 
                    Created: ${createdDate} | Updated: ${updatedDate}
                    Link: ${noteUrl}
                    Content: ${note.body}...`;
          })
          .join("\n\n")}`;
      } else {
        notesContext = "\n\nThe user hasn't created any notes yet.";
      }

      // Dynamic system prompt
      const systemPrompt =
        systemContext === "notes-assistant"
          ? `You are a helpful notes assistant. You help users find and summarize information from their saved notes.

              Key capabilities:
              - Search through user's notes
              - Summarize information  
              - Answer questions based on saved content
              - Help organize and understand their notes

              ${notesContext}

              IMPORTANT: When referencing a specific note, ALWAYS include its clickable link in markdown format like this: [Note Title](link). Users can click these links to open the note directly.

              Be friendly, concise, and helpful. If you don't have access to specific notes yet, let the user know you're ready to help once they ask specific questions.`
          : "You are a helpful assistant.";

      // Add system message
      const messagesWithSystem = [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messages,
      ];

      const result = streamText({
        model: openrouter("openai/gpt-4o-mini"),
        messages: messagesWithSystem,
      });

      return result.toDataStreamResponse({
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      console.error("Chat error:", error);
      return new Response(JSON.stringify({ error: "Internal error" }), {
        status: 500,
      });
    }
  }),
});

http.route({
  path: "/api/chat",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

export default http;
