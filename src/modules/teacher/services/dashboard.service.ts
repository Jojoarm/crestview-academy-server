import prisma from '../../../config/prisma.js';
import type { Prisma } from '../../../generated/prisma/client.js';
import { getActiveSession, todayDateOnly } from '../../../lib/utils.js';
import { createError } from '../../../middlewares/error-handler.js';

const teacherVisiblePostWhere = {
  status: 'Published',
  audience: { in: ['Everyone', 'Teachers'] },
} satisfies Prisma.PostWhereInput;

export const teacherDashboardService = {
  async getDashboard(teacherId: string) {
    const session = await getActiveSession();
    const today = todayDateOnly();

    const [classTeacherOfAssignments, subjectAssignments] = await Promise.all([
      prisma.classArmTeacher.findMany({
        where: { teacherId, sessionId: session.id },
        select: { classArmId: true },
      }),
      prisma.subjectTeacher.findMany({
        where: { teacherId, sessionId: session.id },
        select: { classArmId: true, subjectId: true },
      }),
    ]);

    const classTeacherOfIds = classTeacherOfAssignments.map(
      (a) => a.classArmId,
    );
    const teachingClassArmIds = [
      ...new Set(subjectAssignments.map((a) => a.classArmId)),
    ];
    const allClassArmIds = [
      ...new Set([...classTeacherOfIds, ...teachingClassArmIds]),
    ];

    const [
      classTeacherOfClassArms,
      attendanceMarkedToday,
      totalStudents,
      recentPosts,
    ] = await Promise.all([
      classTeacherOfIds.length
        ? prisma.classArm.findMany({
            where: { id: { in: classTeacherOfIds } },
            select: {
              id: true,
              classLevel: { select: { name: true } },
              arm: { select: { name: true } },
            },
          })
        : Promise.resolve([]),
      classTeacherOfIds.length
        ? prisma.attendance.groupBy({
            by: ['classArmId'],
            where: {
              classArmId: { in: classTeacherOfIds },
              sessionId: session.id,
              date: today,
            },
            _count: true,
          })
        : Promise.resolve([]),
      allClassArmIds.length
        ? prisma.studentEnrollment.count({
            where: {
              classArmId: { in: allClassArmIds },
              sessionId: session.id,
              isActive: true,
            },
          })
        : Promise.resolve(0),
      prisma.post.findMany({
        where: teacherVisiblePostWhere,
        select: { id: true, title: true, type: true, publishedAt: true },
        orderBy: { publishedAt: 'desc' },
        take: 5,
      }),
    ]);

    const markedClassArmIds = new Set(
      attendanceMarkedToday.map((a) => a.classArmId),
    );

    const attendanceStatusToday = classTeacherOfClassArms.map((classArm) => ({
      classArmId: classArm.id,
      classLevel: classArm.classLevel.name,
      arm: classArm.arm.name,
      isMarked: markedClassArmIds.has(classArm.id),
    }));

    return {
      attendanceStatusToday,
      summary: {
        classTeacherOfCount: classTeacherOfIds.length,
        teachingClassArmCount: teachingClassArmIds.length,
        subjectCount: new Set(subjectAssignments.map((a) => a.subjectId)).size,
        totalStudents,
      },
      recentPosts,
    };
  },
};
