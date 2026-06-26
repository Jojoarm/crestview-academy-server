import type { Request, Response, NextFunction } from 'express';

const ADMIN_ROLES = ['admin', 'super_admin'];

// Checks user has an admin or super_admin role
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const role = req.user?.userRole;

  if (!role || !ADMIN_ROLES.includes(role)) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden — admin access required',
    });
  }

  next();
};

// Extra gate for super_admin only routes
export const requireSuperAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.userRole !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden — super admin access required',
    });
  }

  next();
};
