import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const ALL_ROLES = [
  'super_admin',
  'admin',
  'teacher',
  'parent',
  'student',
] as const;

const createUserSchema = z.object({
  email: z.email({ message: 'Invalid email address' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  temporaryPassword: z
    .string()
    .min(8, { message: 'Temporary password must be at least 8 characters' }),
  userRole: z.enum(ALL_ROLES, { error: 'Invalid role' }),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  userRole: z.enum(ALL_ROLES, { error: 'Invalid role' }).optional(),
});

const banUserSchema = z.object({
  reason: z.string().min(3).optional(),
});

const validate =
  (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = z.flattenError(result.error);

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.fieldErrors,
      });
    }

    req.body = result.data;
    next();
  };

export const validateCreateUser = validate(createUserSchema);
export const validateUpdateUser = validate(updateUserSchema);
export const validateBanUser = validate(banUserSchema);
