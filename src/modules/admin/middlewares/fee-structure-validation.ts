import { z } from 'zod';

// Enums

export const feeFrequencyEnum = z.enum(['OneTime', 'Annual', 'PerTerm'], {
  error: 'Frequency must be OneTime, Annual, or PerTerm',
});

export const feeScopeEnum = z.enum(['SchoolWide', 'PerClass'], {
  error: 'Scope must be SchoolWide or PerClass',
});

// Fee Type Schemas

export const createFeeTypeSchema = z.object({
  name: z
    .string('Fee type name is required')
    .min(1, 'Fee type name cannot be empty')
    .trim(),
  description: z.string().trim().optional(),
  frequency: feeFrequencyEnum,
  scope: feeScopeEnum,
  isOptional: z.boolean().default(false),
});

export const updateFeeTypeSchema = z.object({
  name: z.string().min(1, 'Fee type name cannot be empty').trim().optional(),
  description: z.string().trim().optional(),
  frequency: feeFrequencyEnum.optional(),
  scope: feeScopeEnum.optional(),
  isOptional: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// Fee Structure Schemas

export const createFeeStructureSchema = z.object({
  feeTypeId: z.string('Fee type ID is required').min(1),
  amount: z
    .number('Amount is required')
    .positive('Amount must be greater than 0')
    .multipleOf(0.01, 'Amount cannot have more than 2 decimal places'),
  classLevelId: z.string().min(1).optional(), // required when scope = PerClass
  sessionId: z.string().min(1).optional(), // required when frequency != OneTime
  termId: z.string().min(1).optional(), // required when frequency = PerTerm
});

export const updateFeeStructureSchema = z.object({
  amount: z
    .number('Amount is required')
    .positive('Amount must be greater than 0')
    .multipleOf(0.01, 'Amount cannot have more than 2 decimal places'),
});

export const feeStructureQuerySchema = z.object({
  feeTypeId: z.string().optional(),
  classLevelId: z.string().optional(),
  sessionId: z.string().optional(),
  termId: z.string().optional(),
  frequency: feeFrequencyEnum.optional(),
  scope: feeScopeEnum.optional(),
  isActive: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type CreateFeeTypeInput = z.infer<typeof createFeeTypeSchema>;
export type UpdateFeeTypeInput = z.infer<typeof updateFeeTypeSchema>;
export type CreateFeeStructureInput = z.infer<typeof createFeeStructureSchema>;
export type UpdateFeeStructureInput = z.infer<typeof updateFeeStructureSchema>;
export type FeeStructureQuery = z.infer<typeof feeStructureQuerySchema>;
