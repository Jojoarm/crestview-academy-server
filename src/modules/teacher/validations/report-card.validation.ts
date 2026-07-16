import { z } from 'zod';

export const reportCardQuerySchema = z.object({
  sessionId: z.string().optional(),
  termId: z.string().optional(),
});

export type ReportCardQuery = z.infer<typeof reportCardQuerySchema>;

export const upsertRemarkSchema = z.object({
  remark: z
    .string('Remark is required')
    .trim()
    .min(1, 'Remark cannot be empty')
    .max(1000, 'Remark is too long (max 1000 characters)'),
  sessionId: z.string().optional(),
  termId: z.string().optional(),
});

export type UpsertRemarkInput = z.infer<typeof upsertRemarkSchema>;
