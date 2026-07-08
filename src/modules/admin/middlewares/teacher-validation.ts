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
  designation: z.string().trim().optional(),
  employmentType: z
    .enum(['FullTime', 'PartTime', 'Contract'], {
      error: 'Employment type must be FullTime, PartTime, or Contract',
    })
    .optional(),
  dateOfEmployment: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date of employment',
    })
    .transform((val) => new Date(val))
    .optional(),
});

export const teacherQuerySchema = z.object({
  search: z.string().optional(),
  employmentType: z.enum(['FullTime', 'PartTime', 'Contract']).optional(),
  isActive: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;
export type TeacherQuery = z.infer<typeof teacherQuerySchema>;
