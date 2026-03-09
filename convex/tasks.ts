import {
  internalMutation,
  mutation,
  MutationCtx,
  query,
} from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';

const taskStatus = v.union(
  v.literal('todo'),
  v.literal('in_progress'),
  v.literal('done')
);

export const listTasks = query({
  args: {
    assignmentDate: v.optional(v.string()),
    serviceId: v.optional(v.id('services')),
  },
  handler: async (ctx, args) => {
    let tasks;

    if (args.assignmentDate && args.serviceId) {
      tasks = await ctx.db
        .query('taskAssignments')
        .withIndex('by_assignmentDate_service', (q) =>
          q
            .eq('assignmentDate', args.assignmentDate!)
            .eq('serviceId', args.serviceId!)
        )
        .collect();
    } else if (args.assignmentDate) {
      tasks = await ctx.db
        .query('taskAssignments')
        .withIndex('by_assignmentDate', (q) =>
          q.eq('assignmentDate', args.assignmentDate!)
        )
        .collect();
    } else {
      tasks = await ctx.db
        .query('taskAssignments')
        .withIndex('by_createdAt')
        .order('desc')
        .collect();
    }

    return await Promise.all(
      tasks.map(async (task) => {
        const user = await ctx.db.get(task.userId);
        const service = await ctx.db.get(task.serviceId);
        const attendee = await ctx.db.get(task.attendeeId);
        return {
          ...task,
          attendee,
          user,
          service,
        };
      })
    );
  },
});

async function assignAttendeesForDay(
  ctx: MutationCtx,
  serviceId: Id<'services'>,
  assignmentDate: string
) {
  const users = (
    await ctx.db
    .query('users')
    .collect()
  ).filter((user) => user.role !== 'client');

  if (users.length === 0) {
    throw new Error(
      'Add at least one admin or volunteer before generating assignments.'
    );
  }

  const attendance = await ctx.db
    .query('attendance')
    .withIndex('by_serviceId', (q) => q.eq('serviceId', serviceId))
    .collect();

  const reachableAttendees = attendance.filter(
    (entry) =>
      (entry.phone && entry.phone.trim()) || (entry.email && entry.email.trim())
  );

  const existingAssignments = await ctx.db
    .query('taskAssignments')
    .withIndex('by_assignmentDate_service', (q) =>
      q.eq('assignmentDate', assignmentDate).eq('serviceId', serviceId)
    )
    .collect();

  const assignedAttendeeIds = new Set(
    existingAssignments.map((assignment) => assignment.attendeeId)
  );
  const assignmentsPerUser = new Map<Id<'users'>, number>();

  users.forEach((user) => assignmentsPerUser.set(user._id, 0));
  existingAssignments.forEach((assignment) => {
    assignmentsPerUser.set(
      assignment.userId,
      (assignmentsPerUser.get(assignment.userId) ?? 0) + 1
    );
  });

  const unassignedAttendees = reachableAttendees.filter(
    (entry) => !assignedAttendeeIds.has(entry._id)
  );

  for (const attendee of unassignedAttendees) {
    const nextUser = [...users].sort((left, right) => {
      const leftCount = assignmentsPerUser.get(left._id) ?? 0;
      const rightCount = assignmentsPerUser.get(right._id) ?? 0;
      if (leftCount !== rightCount) {
        return leftCount - rightCount;
      }
      return left.name.localeCompare(right.name);
    })[0];

    await ctx.db.insert('taskAssignments', {
      userId: nextUser._id,
      serviceId,
      attendeeId: attendee._id,
      assignmentDate,
      status: 'todo',
      createdAt: Date.now(),
    });

    assignmentsPerUser.set(
      nextUser._id,
      (assignmentsPerUser.get(nextUser._id) ?? 0) + 1
    );
  }

  return {
    assignedNow: unassignedAttendees.length,
    alreadyAssigned: existingAssignments.length,
    totalReachable: reachableAttendees.length,
    totalUsers: users.length,
  };
}

export const generateDailyAssignments = mutation({
  args: {
    serviceId: v.id('services'),
    assignmentDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const assignmentDate =
      args.assignmentDate ?? new Date().toISOString().slice(0, 10);
    return await assignAttendeesForDay(ctx, args.serviceId, assignmentDate);
  },
});

export const generateDailyAssignmentsForLatestService = internalMutation({
  args: {},
  handler: async (ctx) => {
    const services = await ctx.db
      .query('services')
      .withIndex('by_date')
      .order('desc')
      .collect();
    const latestService = services[0];

    if (!latestService) {
      return {
        assignedNow: 0,
        alreadyAssigned: 0,
        totalReachable: 0,
        totalUsers: 0,
      };
    }

    const assignmentDate = new Date().toISOString().slice(0, 10);
    return await assignAttendeesForDay(ctx, latestService._id, assignmentDate);
  },
});

export const updateTaskStatus = mutation({
  args: {
    id: v.id('taskAssignments'),
    status: taskStatus,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const removeTask = mutation({
  args: {
    id: v.id('taskAssignments'),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
