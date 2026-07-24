import type { Request, Response, NextFunction } from 'express';

export const requireParent = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const role = req.user?.userRole;

  if (role !== 'parent') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden! Parent access required',
    });
  }

  next();
};
