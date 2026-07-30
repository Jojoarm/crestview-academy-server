import { z } from 'zod';

export const reportCardQuerySchema = z.object({
  sessionId: z.string().optional(),
  termId: z.string().optional(),
});
export type ReportCardQuery = z.infer<typeof reportCardQuerySchema>;
