// import { mutation, query } from "./_generated/server";
// import { v } from "convex/values";

// export const store = mutation({
//     args: {},
//     handler: async (ctx) => {
//         const identity = await ctx.auth.getUserIdentity();
//         if (!identity) {
//             throw new Error("Called store without authentication present");
//         }

//         // Check if we
//         const user = await ctx.db
//             .query("users")
//             .withIndex("by_token", (q) => 
//                 q.eq("tokenIdentifier", identity.tokenIdentifier)
//         )
//             .unique();

//             if (user !== null) {
//                 //Update name if it changed
//                 if (user.name !== identity.name) {
//                     await ctx.db.patch(user._id, {name: identity.name! });
//                 }
//                 return user;
//             }

//             // If it's a new identity, create a new User with 'client' role by default
//     // You can manually change specific users to 'admin' in the Convex Dashboard
//     const userId = await ctx.db.insert("users", {
//       name: identity.name!,
//       tokenIdentifier: identity.tokenIdentifier,
//       email: identity.email,
//       role: "client",
//     });

//     return await ctx.db.get(userId);
//   },
// });

// // Helper to get current user and role
// export const current = query({
//   args: {},
//   handler: async (ctx) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) {
//       return null;
//     }
//     return await ctx.db
//       .query("users")
//       .withIndex("by_token", (q) =>
//         q.eq("tokenIdentifier", identity.tokenIdentifier)
//       )
//       .unique();
//   },
// });

// export const getByEmailForLogin = query({
//   args: {
//     email: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const normalizedEmail = args.email.trim().toLowerCase();

//     return await ctx.db
//       .query("users")
//       .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
//       .unique();
//   },
// });


// export const listUsers = query({
//   args: {},
//   handler: async (ctx) => {
//     return await ctx.db
//       .query('users')
//       .collect();
//   },
// });

// export const createUser = mutation({
//   args: {
//     name: v.string(),
//     email: v.string(),
//     phone: v.string(),
//     role: v.union(
//       v.literal('admin'),
//       v.literal('client'),
//       v.literal('volunteer')
//     ),
//   },
//   handler: async (ctx, args) => {
//     const normalizedEmail = args.email.trim().toLowerCase();

//     const existing = await ctx.db
//       .query('users')
//       .withIndex('by_email', (q) => q.eq('email', normalizedEmail))
//       .unique();

//     if (existing) {
//       throw new Error('A user with this email already exists.');
//     }

//     return await ctx.db.insert('users', {
//       name: args.name,
//       email: normalizedEmail,
//       phone: args.phone,
//       tokenIdentifier: `local:${normalizedEmail}`,
//       role: args.role,
//       createdAt: Date.now(),
//     });
//   },
// });

// export const updateUser = mutation({
//   args: {
//     id: v.id('users'),
//     name: v.string(),
//     email: v.string(),
//     phone: v.string(),
//     role: v.union(
//       v.literal('admin'),
//       v.literal('client'),
//       v.literal('volunteer')
//     ),
//   },
//   handler: async (ctx, args) => {
//     await ctx.db.patch(args.id, {
//       name: args.name,
//       email: args.email,
//       phone: args.phone,
//       role: args.role,
//     });
//   },
// });

// export const removeUser = mutation({
//   args: { id: v.id('users') },
//   handler: async (ctx, args) => {
//     await ctx.db.delete(args.id);
//   },
// });

// export const registerWithEmail = mutation({
//   args: {
//     name: v.string(),
//     email: v.string(),
//     phone: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const normalizedEmail = args.email.trim().toLowerCase();

//     const existing = await ctx.db
//       .query("users")
//       .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
//       .unique();

//     if (existing) {
//       throw new Error("A user with this email already exists.");
//     }

//     const userId = await ctx.db.insert("users", {
//       name: args.name.trim(),
//       email: normalizedEmail,
//       phone: args.phone.trim(),
//       tokenIdentifier: `local:${normalizedEmail}`,
//       role: "client",
//     });

//     return await ctx.db.get(userId);
//   },
// });


import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Store authenticated user from auth provider
 */
export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Called store without authentication present");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (user !== null) {
      if (user.name !== identity.name) {
        await ctx.db.patch(user._id, { name: identity.name! });
      }

      return user;
    }

    const userId = await ctx.db.insert("users", {
      name: identity.name!,
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email,
      role: "client",
      createdAt: Date.now(),
    });

    return await ctx.db.get(userId);
  },
});

/**
 * Get current logged-in user
 */
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

/**
 * Login helper (used by login page)
 */
export const getByEmailForLogin = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.trim().toLowerCase();

    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .unique();
  },
});

/**
 *Signup from public signup page 
 */
export const registerWithEmail = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.trim().toLowerCase();

    const existing = await ctx.db
    .query('users')
    .withIndex('by_email', (q) => q.eq('email', normalizedEmail))
    .unique();

    if (existing) {
      throw new Error(' A user with this email already exists');
    }

    const userId = await ctx.db.insert('users', {
      name: args.name.trim(),
      email: normalizedEmail,
      phone: args.phone.trim(),
      tokenIdentifier: `local:${normalizedEmail}`,
      role: 'client',
      createdAt: Date.now(),
    });

    return await ctx.db.get(userId);
  },
});

/**
 * List all users (for admin dashboard)
 */
export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

/**
 * Get user by email
 */
export const getUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.trim().toLowerCase();

    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .unique();
  },
});

/**
 * Create user from admin panel
 */
export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("client"),
      v.literal("volunteer")
    ),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.trim().toLowerCase();

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .unique();

    if (existingUser) {
      throw new Error("A user with this email already exists.");
    }

    return await ctx.db.insert("users", {
      name: args.name.trim(),
      email: normalizedEmail,
      phone: args.phone.trim(),
      tokenIdentifier: `local:${normalizedEmail}`,
      role: args.role,
      createdAt: Date.now(),
    });
  },
});

/**
 * Update user
 */
export const updateUser = mutation({
  args: {
    id: v.id("users"),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("client"),
      v.literal("volunteer")
    ),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.trim().toLowerCase();

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .unique();

    if (existingUser && existingUser._id !== args.id) {
      throw new Error("A user with this email already exists.");
    }

    await ctx.db.patch(args.id, {
      name: args.name.trim(),
      email: normalizedEmail,
      phone: args.phone.trim(),
      role: args.role,
    });
  },
});

/**
 * Remove user
 */
export const removeUser = mutation({
  args: {
    id: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});