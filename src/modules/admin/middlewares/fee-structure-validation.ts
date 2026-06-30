import { z } from 'zod';

// Fee Type Schemas

export const createFeeTypeSchema = z.object({
  name: z
    .string('Fee type name is required')
    .min(1, 'Fee type name cannot be empty')
    .trim(),
  description: z.string().trim().optional(),
  isOptional: z.boolean().default(false),
});

export const updateFeeTypeSchema = z.object({
  name: z.string().min(1, 'Fee type name cannot be empty').trim().optional(),
  description: z.string().trim().optional(),
  isOptional: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// Fee Structure Schemas

export const createFeeStructureSchema = z.object({
  classLevelId: z
    .string('Class level ID is required')
    .min(1, 'Class level ID cannot be empty'),
  termId: z.string('Term ID is required').min(1, 'Term ID cannot be empty'),
});

export const feeStructureQuerySchema = z.object({
  classLevelId: z.string().optional(),
  termId: z.string().optional(),
  sessionId: z.string().optional(),
});

// Fee Structure Item Schemas

export const createFeeStructureItemSchema = z.object({
  feeTypeId: z
    .string('Fee type ID is required')
    .min(1, 'Fee type ID cannot be empty'),
  amount: z
    .number('Amount is required')
    .positive('Amount must be greater than 0')
    .multipleOf(0.01, 'Amount cannot have more than 2 decimal places'),
});

export const updateFeeStructureItemSchema = z.object({
  amount: z
    .number('Amount is required')
    .positive('Amount must be greater than 0')
    .multipleOf(0.01, 'Amount cannot have more than 2 decimal places'),
});

// Types

export type CreateFeeTypeInput = z.infer<typeof createFeeTypeSchema>;
export type UpdateFeeTypeInput = z.infer<typeof updateFeeTypeSchema>;
export type CreateFeeStructureInput = z.infer<typeof createFeeStructureSchema>;
export type FeeStructureQuery = z.infer<typeof feeStructureQuerySchema>;
export type CreateFeeStructureItemInput = z.infer<
  typeof createFeeStructureItemSchema
>;
export type UpdateFeeStructureItemInput = z.infer<
  typeof updateFeeStructureItemSchema
>;
