import { z } from 'zod';

export const timetableQuerySchema = z.object({
  sessionId: z.string().optional(),
});

export type TimetableQuery = z.infer<typeof timetableQuerySchema>;
