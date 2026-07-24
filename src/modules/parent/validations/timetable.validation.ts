import { z } from 'zod';

export const parentTimetableQuerySchema = z.object({
  sessionId: z.string().optional(),
});

export type ParentTimetableQuery = z.infer<typeof parentTimetableQuerySchema>;
