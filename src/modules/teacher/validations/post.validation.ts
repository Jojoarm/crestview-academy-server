import { z } from 'zod';

export const listPostsQuerySchema = z.object({
  type: z.enum(['Announcement', 'News', 'Event']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;
