import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    image: v.optional(v.string()),
    tokenIdentifier: v.string(),
    role: v.union(
      v.literal('admin'),
      v.literal('client'),
      v.literal('volunteer')
    ),
    createdAt: v.optional(v.number()),
  })
    .index('by_token', ['tokenIdentifier'])
    .index('by_email', ['email']),

  services: defineTable({
    title: v.string(),
    date: v.string(), // ISO date string like "2024-12-25"
    createdAt: v.optional(v.number()), // timestamp in milliseconds
  }).index('by_date', ['date']),

  attendance: defineTable({
    name: v.string(),
    category: v.optional(
      v.union(v.literal('male'), v.literal('female'), v.literal('kids'))
    ),
    firstTimer: v.optional(v.union(v.literal('Yes'), v.literal('No'))),
    secondTimer: v.optional(v.union(v.literal('Yes'), v.literal('No'))),
    address: v.optional(v.string()),
    occupation: v.optional(v.string()),
    department: v.optional(v.string()),
    status: v.optional(v.union(v.literal('Single'), v.literal('Married'))),
    dob: v.optional(v.string()),
    // (replaced legacy `gender` with `category`)
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    prayerRequest: v.optional(v.string()),
    serviceId: v.id('services'),
  }).index('by_serviceId', ['serviceId']),

  // users: defineTable({
  //   name: v.string(),
  //   email: v.string(),
  //   phone: v.string(),
  //   role: v.union(
  //     v.literal('admin'),
  //     v.literal('client'),
  //     v.literal('volunteer')
  //   ),
  //   createdAt: v.number(),
  // })
  //   .index('by_email', ['email'])
  //   .index('by_createdAt', ['createdAt']),

  taskAssignments: defineTable({
    userId: v.id('users'),
    serviceId: v.id('services'),
    attendeeId: v.id('attendance'),
    assignmentDate: v.string(),
    status: v.union(
      v.literal('todo'),
      v.literal('in_progress'),
      v.literal('done')
    ),
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_service', ['serviceId'])
    .index('by_assignmentDate', ['assignmentDate'])
    .index('by_assignmentDate_service', ['assignmentDate', 'serviceId'])
    .index('by_createdAt', ['createdAt']),
});
