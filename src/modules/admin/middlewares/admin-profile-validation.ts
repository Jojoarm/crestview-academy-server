import { z } from 'zod';

export const updateAdminSchema = z.object({
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  photoUrl: z.url('Photo must be a valid URL').optional(),
});

export type UpdateAdminInput = z.infer<typeof updateAdminSchema>;
