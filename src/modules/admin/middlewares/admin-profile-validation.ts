import { z } from 'zod';

export const updateAdminSchema = z.object({
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  photoUrl: z.url('Photo must be a valid URL').optional(),
});

export const adminQuerySchema = z.object({
  search: z.string().optional(),
  isActive: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

export type UpdateAdminInput = z.infer<typeof updateAdminSchema>;
export type AdminQuery = z.infer<typeof adminQuerySchema>;
