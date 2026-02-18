import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const store = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Called store without authentication present");
        }

        // Check if we
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => 
                q.eq("tokenIdentifier", identity.tokenIdentifier)
        )
            .unique();

            if (user !== null) {
                //Update name if it changed
                if (user.name !== identity.name) {
                    await ctx.db.patch(user._id, {name: identity.name! });
                }
                return user;
            }

            // If it's a new identity, create a new User with 'client' role by default
    // You can manually change specific users to 'admin' in the Convex Dashboard
    const userId = await ctx.db.insert("users", {
      name: identity.name!,
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email,
      role: "client",
    });

    return await ctx.db.get(userId);
  },
});

// Helper to get current user and role
export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    return await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
  },
});