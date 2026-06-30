import { z } from 'zod';

// Shared

const timeStringRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:mm 24hr

export const sectionEnum = z.enum(
  ['Kindergarten', 'Nursery', 'Primary', 'Secondary'],
  { error: 'Section must be Kindergarten, Nursery, Primary, or Secondary' },
);

export const dayOfWeekEnum = z.enum(
  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  { error: 'Day must be Monday through Friday' },
);

// Period Slot Schemas
export const createPeriodSlotSchema = z
  .object({
    section: sectionEnum,
    name: z
      .string('Slot name is required')
      .min(1, 'Slot name cannot be empty')
      .trim(),
    startTime: z
      .string('Start time is required')
      .regex(timeStringRegex, 'Start time must be in HH:mm 24hr format'),
    endTime: z
      .string('End time is required')
      .regex(timeStringRegex, 'End time must be in HH:mm 24hr format'),
    order: z
      .number('Order is required')
      .int('Order must be a whole number')
      .min(1, 'Order must be at least 1'),
    isBreak: z.boolean().default(false),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

export const updatePeriodSlotSchema = z
  .object({
    name: z.string().min(1, 'Slot name cannot be empty').trim().optional(),
    startTime: z
      .string()
      .regex(timeStringRegex, 'Start time must be in HH:mm 24hr format')
      .optional(),
    endTime: z
      .string()
      .regex(timeStringRegex, 'End time must be in HH:mm 24hr format')
      .optional(),
    order: z.number().int('Order must be a whole number').min(1).optional(),
    isBreak: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) return data.endTime > data.startTime;
      return true;
    },
    { message: 'End time must be after start time', path: ['endTime'] },
  );

export const periodSlotQuerySchema = z.object({
  section: sectionEnum,
});

// Timetable Entry Schema
export const createTimetableEntrySchema = z
  .object({
    periodSlotId: z
      .string('Period slot ID is required')
      .min(1, 'Period slot ID cannot be empty'),
    dayOfWeek: dayOfWeekEnum,
    subjectId: z.string().min(1, 'Subject ID cannot be empty').optional(),
  })
  .refine((data) => data.subjectId === undefined || data.subjectId.length > 0, {
    message: 'Subject ID cannot be empty',
    path: ['subjectId'],
  });

export const updateTimetableEntrySchema = z.object({
  subjectId: z.string().min(1, 'Subject ID cannot be empty').nullable(),
});

// Types

export type CreatePeriodSlotInput = z.infer<typeof createPeriodSlotSchema>;
export type UpdatePeriodSlotInput = z.infer<typeof updatePeriodSlotSchema>;
export type PeriodSlotQuery = z.infer<typeof periodSlotQuerySchema>;
export type CreateTimetableEntryInput = z.infer<
  typeof createTimetableEntrySchema
>;
export type UpdateTimetableEntryInput = z.infer<
  typeof updateTimetableEntrySchema
>;
