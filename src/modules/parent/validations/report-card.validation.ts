import { z } from 'zod';

export const parentReportCardQuerySchema = z.object({
  sessionId: z.string().optional(),
  termId: z.string().optional(),
});

export type ParentReportCardQuery = z.infer<typeof parentReportCardQuerySchema>;
