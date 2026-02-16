import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const add = mutation({
  args: {
    name: v.string(),
    gender: v.union(v.literal('male'), v.literal('female')),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    serviceId: v.id('services'),
  },
  handler: async (ctx, args) => {
    const attendanceId = await ctx.db.insert('attendance', args);
    return attendanceId;
  },
});
