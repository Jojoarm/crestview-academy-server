import prisma from '../../../config/prisma.js';
import { createError } from '../../../middlewares/error-handler.js';
import { catchAsync } from '../../../utils/catch-async.js';

export const loadTeacherContext = catchAsync(async (req, res, next) => {
  const teacher = await prisma.teacher.findUnique({
    where: { userId: req.user.id },
    select: { id: true },
  });

  if (!teacher) {
    throw createError('Teacher profile not found', 404);
  }

  req.teacherId = teacher.id;
  next();
});
