import { z } from 'zod';

export const sectionEnum = z.enum(
  ['Kindergarten', 'Nursery', 'Primary', 'Secondary'],
  { error: 'Section must be Kindergarten, Nursery, Primary, or Secondary' },
);

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

export const subjectQuerySchema = z.object({
  search: z.string().optional(),
  section: sectionEnum.optional(),
  classLevelId: z.string().optional(),
  isActive: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

export const updateSubjectAssignmentSchema = z.object({
  isCompulsory: z.boolean(),
});

// Types
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
export type AssignClassLevelInput = z.infer<typeof assignClassLevelSchema>;
export type SubjectQuery = z.infer<typeof subjectQuerySchema>;
export type UpdateSubjectAssignmentInput = z.infer<
  typeof updateSubjectAssignmentSchema
>;
