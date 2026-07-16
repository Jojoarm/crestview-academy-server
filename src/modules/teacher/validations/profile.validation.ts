import { z } from 'zod';

export const updateTeacherSchema = z.object({
  dateOfBirth: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date of birth',
    })
    .transform((val) => new Date(val))
    .optional(),
  gender: z
    .enum(['Male', 'Female'], { error: 'Gender must be Male or Female' })
    .optional(),
  address: z.string().trim().optional(),
  photoUrl: z.url('Photo must be a valid URL').optional(),
  phone: z.string().trim().optional(),
  qualification: z.string().trim().optional(),
});

export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;
