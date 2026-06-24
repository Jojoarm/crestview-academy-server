import type { NextFunction, Request, Response } from 'express';
import { success } from 'zod';
import prisma from '../config/prisma.js';

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized!',
      });
    }

    const admin = await prisma.admin.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!admin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden! Admin access required!!!',
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden! Your admin account as been deactivated.',
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    next(error);
  }
};

// Extra gate for SUPER_ADMIN only routes (e.g. creating/deleting other admins)
export const requireSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.admin?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden — super admin access required',
    });
  }
  next();
};
