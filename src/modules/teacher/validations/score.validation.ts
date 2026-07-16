import { z } from 'zod';

export const markScoresSchema = z.object({
  classArmId: z.string('Class arm is required'),
  subjectId: z.string('Subject is required'),
  // Both optional — default to the active session's active term. Pass
  // both explicitly to enter/edit scores for a past term.
  sessionId: z.string().optional(),
  termId: z.string().optional(),
  records: z
    .array(
      z.object({
        studentId: z.string('Student id is required'),
        caScore: z.coerce
          .number('CA score is required')
          .min(0, 'CA score cannot be negative'),
        examScore: z.coerce
          .number('Exam score is required')
          .min(0, 'Exam score cannot be negative'),
      }),
    )
    .min(1, 'At least one score record is required'),
});

export type MarkScoresInput = z.infer<typeof markScoresSchema>;

export const listScoresQuerySchema = z.object({
  classArmId: z.string('Class arm is required'),
  subjectId: z.string().optional(),
  sessionId: z.string().optional(),
  termId: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type ListScoresQuery = z.infer<typeof listScoresQuerySchema>;

export const updateScoreSchema = z.object({
  caScore: z.coerce
    .number('CA score is required')
    .min(0, 'CA score cannot be negative'),
  examScore: z.coerce
    .number('Exam score is required')
    .min(0, 'Exam score cannot be negative'),
});

export type UpdateScoreInput = z.infer<typeof updateScoreSchema>;
