import prisma from '../../../config/prisma.js';
import { createError } from '../../../middlewares/error-handler.js';
import { catchAsync } from '../../../utils/catch-async.js';

export const loadParentContext = catchAsync(async (req, res, next) => {
  const parent = await prisma.parent.findUnique({
    where: { userId: req.user.id },
    select: { id: true },
  });

  if (!parent) {
    throw createError('Parent profile not found', 404);
  }

  req.parentId = parent.id;
  next();
});
