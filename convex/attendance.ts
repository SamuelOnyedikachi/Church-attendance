import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { query } from './_generated/server';
export const addAttendance = mutation({
  args: {
    serviceId: v.id('services'),
    name: v.string(),
    category: v.union(
      v.literal('male'),
      v.literal('female'),
      v.literal('kids')
    ),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    prayerRequest: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('attendance', {
      name: args.name,
      category: args.category,
      email: args.email ?? '',
      phone: args.phone ?? '',
      prayerRequest: args.prayerRequest ?? '',
      serviceId: args.serviceId,
    });
  },
});

export const getAttendanceByService = query({
  args: {
    serviceId: v.id('services'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
    .query('attendance')
    .filter((q) =>q.eq(q.field('serviceId'), args.serviceId))
    .collect();
  },
});