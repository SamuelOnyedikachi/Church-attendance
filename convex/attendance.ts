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
    address: v.optional(v.string()),
    occupation: v.optional(v.string()),
    department: v.optional(v.string()),
    firstTimer: v.union(v.literal('Yes'), v.literal('No')),
    secondTimer: v.union(v.literal('Yes'), v.literal('No')),
    status: v.union(v.literal('Single'), v.literal('Married')),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    dob:v.optional(v.string()),
    prayerRequest: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('attendance', {
      name: args.name,
      category: args.category,
      email: args.email ?? '',
      phone: args.phone ?? '',
      address: args.address ?? '',
      occupation: args.occupation ?? '',
      department: args.department ?? '',
      status: args.status,
      firstTimer: args.firstTimer,
      secondTimer: args.secondTimer,
      dob: args.dob ?? '',
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