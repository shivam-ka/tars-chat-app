import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      content: args.content,
      createdAt: Date.now(),
      read: false,
    });
  },
});

export const getMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .collect();
  },
});

export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_conversation_and_read", (q) =>
        q.eq("conversationId", args.conversationId).eq("read", false),
      )
      .collect();

    for (const msg of unreadMessages) {
      if (msg.senderId !== args.userId) {
        await ctx.db.patch(msg._id, { read: true });
      }
    }
  },
});
