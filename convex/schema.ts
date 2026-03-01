import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    tokenIdentifier: v.string(),
    role: v.union(v.literal('admin'), v.literal('client')),
  }).index('by_token', ['tokenIdentifier']),

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
    firstTimer: v.optional(
      v.union(v.literal('Yes'), v.literal('No'))
    ),
    // (replaced legacy `gender` with `category`)
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    prayerRequest: v.optional(v.string()),
    serviceId: v.id('services'),
  }).index('by_serviceId', ['serviceId']),
});
