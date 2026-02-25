import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    image: v.string(),
    isOnline: v.boolean(),
    lastSeen: v.number(),
  }).index("by_clerkId", ["clerkId"]),

  conversations: defineTable({
    participants: v.array(v.string()), // clerkIds
  }).index("by_participants", ["participants"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.string(), // clerkId
    content: v.string(),
    createdAt: v.number(),
    read: v.boolean(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_conversation_and_read", ["conversationId", "read"]),
});
