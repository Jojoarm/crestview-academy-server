import { z } from 'zod';

export const createAssignmentSchema = z.object({
  title: z.string('Title is required').min(1, 'Title is required'),
  description: z.string('Description must be a string').optional(),
  type: z.enum(['Typed', 'FileUpload'], 'Type must be Typed or FileUpload'),
  classArmId: z.string('Class arm is required'),
  subjectId: z.string('Subject is required'),
  dueDate: z.coerce.date('A valid due date is required'),
  isPublished: z.boolean().optional(),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;

export const updateAssignmentSchema = createAssignmentSchema.partial();

export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>;

export const listAssignmentsQuerySchema = z.object({
  classArmId: z.string().optional(),
  subjectId: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type ListAssignmentsQuery = z.infer<typeof listAssignmentsQuerySchema>;

export const gradeSubmissionSchema = z.object({
  score: z.coerce
    .number('A score is required')
    .min(0, 'Score cannot be negative'),
  feedback: z.string('Feedback must be a string').optional(),
});

export type GradeSubmissionInput = z.infer<typeof gradeSubmissionSchema>;
