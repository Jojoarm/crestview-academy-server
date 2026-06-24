import type { Request, Response, NextFunction } from 'express';
import { success, z } from 'zod';

const createAdminSchema = z.object({
  email: z.email({ message: 'Invalid email address' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  role: z.enum(['SUPER_ADMIN', 'ADMIN']).optional(),
});

const updateAdminSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
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

export const validateCreateAdmin = validate(createAdminSchema);
export const validateUpdateAdmin = validate(updateAdminSchema);
