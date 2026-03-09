import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

// Generates that day's follow-up allocations from the latest service record.
crons.daily(
  'generate-daily-follow-up-assignments',
  { hourUTC: 18, minuteUTC: 0 },
  internal.tasks.generateDailyAssignmentsForLatestService
);

export default crons;
