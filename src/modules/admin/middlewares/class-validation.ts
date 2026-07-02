import { z } from 'zod';

export const sectionEnum = z.enum(
  ['Kindergarten', 'Nursery', 'Primary', 'Secondary'],
  { error: 'Section must be Kindergarten, Nursery, Primary or Secondary' },
);

// Class Schemas
export const createClassLevelSchema = z.object({
  name: z
    .string('Class name is required')
    .min(1, 'Class name cannot be empty')
    .trim(),
  section: sectionEnum,
});

export const updateClassLevelSchema = z.object({
  name: z.string().min(1, 'Class name cannot be empty').trim().optional(),
  section: sectionEnum.optional(),
  isActive: z.boolean().optional(),
});

// Arm Schemas
export const createArmSchema = z.object({
  name: z
    .string('Arm name is required')
    .min(1, 'Arm name cannot be empty')
    .trim(),
});

export const updateArmSchema = z.object({
  name: z.string().min(1, 'Arm name cannot be empty').trim().optional(),
  isActive: z.boolean().optional(),
});

export const assignArmSchema = z.object({
  armId: z.string('Arm ID is required').min(1, 'Arm ID cannot be empty'),
  capacity: z
    .number('Capacity is required')
    .int('Capacity must be a whole number')
    .min(1, 'Capacity must be at least 1'),
});

export const updateClassArmSchema = z.object({
  capacity: z
    .number('Capacity is required')
    .int('Capacity must be a whole number')
    .min(1, 'Capacity must be at least 1'),
});

export const classLevelQuerySchema = z.object({
  section: sectionEnum.optional(),
  isActive: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

export type CreateClassLevelInput = z.infer<typeof createClassLevelSchema>;
export type UpdateClassLevelInput = z.infer<typeof updateClassLevelSchema>;
export type CreateArmInput = z.infer<typeof createArmSchema>;
export type UpdateArmInput = z.infer<typeof updateArmSchema>;
export type AssignArmInput = z.infer<typeof assignArmSchema>;
export type UpdateClassArmInput = z.infer<typeof updateClassArmSchema>;
export type ClassLevelQuery = z.infer<typeof classLevelQuerySchema>;
