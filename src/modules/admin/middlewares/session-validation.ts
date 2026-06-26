import { z } from 'zod';

// Helpers
const dateString = z
  .string({ error: 'Date is required' })
  .min(1, 'Date is required')
  .refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  })
  .transform((val) => new Date(val));

const sessionNameRegex = /^\d{4}\/\d{4}$/;

// Session Schemas

export const createSessionSchema = z
  .object({
    name: z
      .string({ error: 'Session name is required' })
      .min(1, 'Session name is required')
      .regex(
        sessionNameRegex,
        'Session name must be in format YYYY/YYYY (e.g. 2025/2026)',
      )
      .refine((val) => {
        const [start, end] = val.split('/').map(Number);
        return end === start! + 1;
      }, 'End year must be exactly one year after start year'),

    startDate: dateString,

    endDate: dateString,
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

export const updateSessionSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Session name cannot be empty')
      .regex(sessionNameRegex, 'Session name must be in format YYYY/YYYY')
      .refine((val) => {
        const [start, end] = val.split('/').map(Number);
        return end === start! + 1;
      }, 'End year must be exactly one year after start year')
      .optional(),

    startDate: dateString.optional(),

    endDate: dateString.optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
      }

      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    },
  );

// Term Schemas

const termNameEnum = z.enum(['First', 'Second', 'Third'], {
  error: 'Term name must be First, Second, or Third',
});

export const createTermSchema = z
  .object({
    name: termNameEnum,

    startDate: dateString,

    endDate: dateString,
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

export const updateTermSchema = z
  .object({
    startDate: dateString.optional(),

    endDate: dateString.optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
      }

      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    },
  );

// Types

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type CreateTermInput = z.infer<typeof createTermSchema>;
export type UpdateTermInput = z.infer<typeof updateTermSchema>;
