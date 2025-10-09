import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { httpAction } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

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

      const openrouter = createOpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: "https://openrouter.ai/api/v1",
      });

      // Dynamic system prompt based on context
      const systemPrompt =
        systemContext === "notes-assistant"
          ? `You are a helpful notes assistant. You help users find and summarize information from their saved notes. 
              Key capabilities:
              - Search through user's notes
              - Summarize information
              - Answer questions based on saved content
              - Help organize and understand their notes

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
