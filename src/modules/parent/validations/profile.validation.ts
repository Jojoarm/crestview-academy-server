import { z } from 'zod';

export const updateParentSchema = z.object({
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  photoUrl: z.url('Photo must be a valid URL').optional(),
  occupation: z.string().trim().optional(),
});

export type UpdateParentInput = z.infer<typeof updateParentSchema>;
