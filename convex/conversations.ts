import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const getOrCreateConversation = mutation({
  args: {
    user1: v.string(),
    user2: v.string(),
  },

  handler: async (ctx, args) => {
    const existing = await ctx.db.query("conversations").collect();

    const found = existing.find(
      (c) =>
        c.participants.includes(args.user1) &&
        c.participants.includes(args.user2),
    );

    if (found) return found._id;

    return await ctx.db.insert("conversations", {
      participants: [args.user1, args.user2],
    });
  },
});
