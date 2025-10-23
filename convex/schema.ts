import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  notes: defineTable({
    title: v.string(),
    body: v.string(),
    userId: v.id("users"),
    createdAt: v.number(), 
    updatedAt: v.number(), 
  })
    .index("by_userId", ["userId"])
    .index("by_userId_createdAt", ["userId", "createdAt"]),
});

export default schema;