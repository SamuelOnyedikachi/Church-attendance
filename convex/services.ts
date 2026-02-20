import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const createService = mutation({
  args: {
    title: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const serviceId = await ctx.db.insert('services', {
      title: args.title,
      date: args.date,
    });
    return serviceId;
  },
});

export const getService = query({
  args: { id: v.id('services') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listServicesWithAttendance = query({
  handler: async (ctx) => {
    const services = await ctx.db
      .query('services')
      .withIndex('by_date')
      .order('desc')
      .collect();

    return Promise.all(
      services.map(async (service) => {
        const attendance = await ctx.db
          .query('attendance')
          .withIndex('by_serviceId', (q) => q.eq('serviceId', service._id))
          .collect();
        return {
          ...service,
          attendanceCount: attendance.length,
          maleCount: attendance.filter((a) => a.category === 'male').length,
          femaleCount: attendance.filter((a) => a.category === 'female').length,
          kidsCount: attendance.filter((a) => a.category === 'kids').length,
        };
      })
    );
  },
});
