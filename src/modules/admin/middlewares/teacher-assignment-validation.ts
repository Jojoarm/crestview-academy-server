import { z } from 'zod';

export const assignClassTeacherSchema = z.object({
  teacherId: z
    .string('Teacher ID is required')
    .min(1, 'Teacher ID cannot be empty'),
});

export const assignSubjectTeacherSchema = z.object({
  teacherId: z
    .string('Teacher ID is required')
    .min(1, 'Teacher ID cannot be empty'),
});

export const removeTeacherSchema = z.object({
  teacherId: z
    .string('Teacher ID is required')
    .min(1, 'Teacher ID cannot be empty'),
});

export type AssignClassTeacherInput = z.infer<typeof assignClassTeacherSchema>;
export type AssignSubjectTeacherInput = z.infer<
  typeof assignSubjectTeacherSchema
>;
export type RemoveTeacherInput = z.infer<typeof removeTeacherSchema>;
