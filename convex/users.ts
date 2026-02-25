import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

export const createAndUpdateUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    image: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email,
        image: args.image,
        isOnline: true,
        lastSeen: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
      image: args.image,
      isOnline: true,
      lastSeen: Date.now(),
    });
  },
});

export const getUsersWithLastMessage = query({
  args: {
    currentUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();

    const results = [];

    for (const user of users) {
      if (user.clerkId === args.currentUserId) continue;

      const participants = [args.currentUserId, user.clerkId].sort();

      const conversation = await ctx.db
        .query("conversations")
        .withIndex("by_participants", (q) => q.eq("participants", participants))
        .unique();

      let lastMessage = null;
      let unreadCount = 0;

      if (conversation) {
        // ✅ Get last message
        lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", conversation._id),
          )
          .order("desc")
          .first();

        // ✅ Get unread messages (only from other user)
        const unreadMessages = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", conversation._id),
          )
          .filter((q) =>
            q.and(
              q.eq(q.field("read"), false),
              q.neq(q.field("senderId"), args.currentUserId),
            ),
          )
          .collect();

        unreadCount = unreadMessages.length;
      }

      results.push({
        ...user,
        lastMessage,
        unreadCount,
      });
    }

    return results;
  },
});

export const setUserOffline = mutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      return;
    }

    await ctx.db.patch(user._id, {
      isOnline: false,
      lastSeen: Date.now(),
    });
  },
});
