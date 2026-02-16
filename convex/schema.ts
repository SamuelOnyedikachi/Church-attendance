import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  services: defineTable({
    title: v.string(),
    date: v.string(), // ISO date string like "2024-12-25"
  }).index('by_date', ['date']),

  attendance: defineTable({
    name: v.string(),
    gender: v.union(v.literal('male'), v.literal('female')),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    serviceId: v.id('services'),
  }).index('by_serviceId', ['serviceId']),
});
