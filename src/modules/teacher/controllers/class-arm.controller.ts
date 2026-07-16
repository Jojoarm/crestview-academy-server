import { sendSuccess } from '../../../utils/api-response.js';
import { catchAsync } from '../../../utils/catch-async.js';
import { requireParam } from '../../../utils/require-params.js';
import { requireTeacherId } from '../lib/utils.js';
import { teacherClassArmSubjectsService } from '../services/class-arm.service.js';

export const getClassArmStudents = catchAsync(async (req, res) => {
  const teacherId = requireTeacherId(req);
  const classArmId = requireParam(req, 'classArmId');

  const students = await teacherClassArmSubjectsService.getClassArmStudents(
    teacherId,
    classArmId,
  );

  return sendSuccess(
    res,
    students,
    'Class arm students retrieved successfully',
  );
});

export const getClassArmSubjects = catchAsync(async (req, res) => {
  const teacherId = requireTeacherId(req);
  const classArmId = requireParam(req, 'classArmId');

  const subjects = await teacherClassArmSubjectsService.getClassArmSubjects(
    teacherId,
    classArmId,
  );

  return sendSuccess(
    res,
    subjects,
    'Class arm subjects retrieved successfully',
  );
});
