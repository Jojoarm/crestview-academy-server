import { z } from 'zod';

export const updateParentSchema = z.object({
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  photoUrl: z.url('Photo must be a valid URL').optional(),
  occupation: z.string().trim().optional(),
});

export const parentQuerySchema = z.object({
  search: z.string().optional(),
  isActive: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

export type UpdateParentInput = z.infer<typeof updateParentSchema>;
export type ParentQuery = z.infer<typeof parentQuerySchema>;
