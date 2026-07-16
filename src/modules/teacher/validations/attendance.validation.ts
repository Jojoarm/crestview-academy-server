import { z } from 'zod';

const attendanceStatusEnum = z.enum(['Present', 'Absent', 'Late', 'Excused'], {
  error: 'Status must be Present, Absent, Late, or Excused',
});

export const markAttendanceSchema = z.object({
  classArmId: z.string('Class arm is required'),
  date: z
    .string('Date is required')
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date' }),
  records: z
    .array(
      z.object({
        studentId: z.string('Student id is required'),
        status: attendanceStatusEnum,
      }),
    )
    .min(1, 'At least one attendance record is required'),
});

export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;

export const listAttendanceQuerySchema = z.object({
  classArmId: z.string('Class arm is required'),
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date' })
    .optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type ListAttendanceQuery = z.infer<typeof listAttendanceQuerySchema>;

export const updateAttendanceSchema = z.object({
  status: attendanceStatusEnum,
});

export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>;
