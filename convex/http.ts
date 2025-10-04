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

      const { messages } = await req.json();

      console.log("Received messages:", messages?.length);

      const openrouter = createOpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: "https://openrouter.ai/api/v1",
      });

      const result = streamText({
        model: openrouter("openai/gpt-4o-mini"),
        messages,
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
