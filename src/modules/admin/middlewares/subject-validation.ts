import { z } from 'zod';

// Subject Schemas

export const createSubjectSchema = z.object({
  name: z
    .string('Subject name is required')
    .min(1, 'Subject name cannot be empty')
    .trim(),
  code: z
    .string('Subject code is required')
    .min(2, 'Code must be at least 2 characters')
    .max(10, 'Code msut be at most 10 characters')
    .trim()
    .transform((val) => val.toUpperCase()),
  description: z.string().trim().optional(),
});

export const updateSubjectSchema = z.object({
  name: z.string().min(1, 'Subject name cannot be empty').trim().optional(),
  code: z
    .string()
    .min(2, 'Code must be at least 2 characters')
    .max(10, 'Code must be at most 10 characters')
    .trim()
    .transform((val) => val.toUpperCase())
    .optional(),
  description: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

// Subject Assignment Schemas
export const assignClassLevelSchema = z.object({
  classLevelId: z
    .string('Class level ID is required')
    .min(1, 'Class level ID cannot be empty'),
  isCompulsory: z.boolean().default(false),
});

export const updateSubjectAssignmentSchema = z.object({
  isCompulsory: z.boolean(),
});

// Types
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
export type AssignClassLevelInput = z.infer<typeof assignClassLevelSchema>;
export type UpdateSubjectAssignmentInput = z.infer<
  typeof updateSubjectAssignmentSchema
>;
