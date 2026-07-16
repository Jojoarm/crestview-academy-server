import type { NextFunction, Request, Response } from 'express';

export const requireTeacher = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const role = req.user?.userRole;

  if (role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden, teacher access required',
    });
  }

  next();
};
