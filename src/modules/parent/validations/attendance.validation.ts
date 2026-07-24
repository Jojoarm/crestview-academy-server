import { z } from 'zod';

export const parentAttendanceQuerySchema = z.object({
  sessionId: z.string().optional(),
  termId: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ParentAttendanceQuery = z.infer<typeof parentAttendanceQuerySchema>;
