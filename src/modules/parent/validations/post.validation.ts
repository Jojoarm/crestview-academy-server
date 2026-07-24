import { z } from 'zod';

export const parentPostQuerySchema = z.object({
  type: z.enum(['Announcement', 'News', 'Event']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ParentPostQuery = z.infer<typeof parentPostQuerySchema>;
