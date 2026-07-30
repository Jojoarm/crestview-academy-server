import { z } from 'zod';

export const updateStudentSchema = z.object({
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
  bloodGroup: z.string().trim().optional(),
  genotype: z.string().trim().optional(),
  medicalConditions: z.string().trim().optional(),
});

export const enrollStudentSchema = z.object({
  classArmId: z
    .string('Class arm ID is required')
    .min(1, 'Class arm ID cannot be empty'),
});

export const linkParentSchema = z.object({
  parentId: z
    .string('Parent ID is required')
    .min(1, 'Parent ID cannot be empty'),
  relationship: z.enum(['Father', 'Mother', 'Guardian'], {
    error: 'Relationship must be Father, Mother, or Guardian',
  }),
  isPrimary: z.boolean().default(false),
});

export const studentQuerySchema = z.object({
  search: z.string().optional(),
  classArmId: z.string().optional(),
  sessionId: z.string().optional(),
  section: z
    .enum(['Kindergarten', 'Nursery', 'Primary', 'Secondary'])
    .optional(),
  isActive: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

export const promoteStudentSchema = z.object({
  toSessionId: z.string('Target session ID is required'),
  toClassArmId: z.string('Target class arm ID is required'),
});
export type PromoteStudentInput = z.infer<typeof promoteStudentSchema>;

export const batchPromoteSchema = z.object({
  toSessionId: z.string('Target session ID is required'),
  students: z
    .array(
      z.object({
        studentId: z.string(),
        toClassArmId: z.string(),
      }),
    )
    .min(1, 'At least one student must be selected'),
});

export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type EnrollStudentInput = z.infer<typeof enrollStudentSchema>;
export type LinkParentInput = z.infer<typeof linkParentSchema>;
export type StudentQuery = z.infer<typeof studentQuerySchema>;
export type BatchPromoteInput = z.infer<typeof batchPromoteSchema>;
