import prisma from '../../../config/prisma.js';
import { resolveSession } from '../../../lib/utils.js';
import { getAllApplicableFees } from '../../shared/services/fee-structure.service.js';

const DUE_SOON_DAYS = 7;

export const parentDashboardService = {
  async getDashboard(parentId: string) {
    const session = await resolveSession();
    const term = await prisma.term.findFirst({
      where: { sessionId: session.id, isActive: true },
    });

    // 1. Linked children + bio
    const links = await prisma.studentParent.findMany({
      where: { parentId },
      select: {
        relationship: true,
        isPrimary: true,
        student: {
          select: {
            id: true,
            admissionNumber: true,
            photoUrl: true,
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { isPrimary: 'desc' },
    });

    const studentIds = links.map((l) => l.student.id);
    if (studentIds.length === 0) {
      return {
        children: [],
        assignmentsDueSoon: [],
        recentPosts: await this.getRecentPosts(),
      };
    }

    // 2. Current enrollments (classArm per child, for this session)
    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        studentId: { in: studentIds },
        sessionId: session.id,
        isActive: true,
      },
      select: {
        studentId: true,
        classArmId: true,
        classArm: {
          select: {
            classLevel: { select: { id: true, name: true } },
            arm: { select: { name: true } },
          },
        },
      },
    });
    const enrollmentByStudent = new Map(
      enrollments.map((e) => [e.studentId, e]),
    );

    // 3. Attendance + report card status (only meaningful if there's an active term)
    let attendanceByStudent = new Map<string, Record<string, number>>();
    let reportCardByStudent = new Map<string, string>();

    if (term) {
      const [attendanceGrouped, reportCards] = await Promise.all([
        prisma.attendance.groupBy({
          by: ['studentId', 'status'],
          where: {
            studentId: { in: studentIds },
            termId: term.id,
            sessionId: session.id,
          },
          _count: true,
        }),
        prisma.reportCard.findMany({
          where: {
            studentId: { in: studentIds },
            termId: term.id,
            sessionId: session.id,
          },
          select: { studentId: true, status: true },
        }),
      ]);

      for (const row of attendanceGrouped) {
        const existing = attendanceByStudent.get(row.studentId) ?? {
          Present: 0,
          Absent: 0,
          Late: 0,
          Excused: 0,
        };
        existing[row.status] = row._count;
        attendanceByStudent.set(row.studentId, existing);
      }
      reportCardByStudent = new Map(
        reportCards.map((r) => [r.studentId, r.status]),
      );
    }

    // 4. Fees — outstanding item count per unique class level
    const classLevelIds = [
      ...new Set(enrollments.map((e) => e.classArm.classLevel.id)),
    ];
    const feeCountByClassLevel = new Map<string, number>();
    await Promise.all(
      classLevelIds.map(async (classLevelId) => {
        const { annual, perTerm } = await getAllApplicableFees(classLevelId);
        feeCountByClassLevel.set(classLevelId, annual.length + perTerm.length);
      }),
    );

    // 5. Assignments due soon, across all children's class arms
    const classArmIds = [...new Set(enrollments.map((e) => e.classArmId))];
    const now = new Date();
    const dueSoonCutoff = new Date(
      now.getTime() + DUE_SOON_DAYS * 24 * 60 * 60 * 1000,
    );

    const assignments = term
      ? await prisma.assignment.findMany({
          where: {
            classArmId: { in: classArmIds },
            sessionId: session.id,
            termId: term.id,
            isPublished: true,
            dueDate: { gte: now, lte: dueSoonCutoff },
          },
          select: {
            id: true,
            title: true,
            dueDate: true,
            classArmId: true,
            subject: { select: { name: true } },
          },
          orderBy: { dueDate: 'asc' },
        })
      : [];

    const classArmToStudents = new Map<string, string[]>();
    for (const e of enrollments) {
      const list = classArmToStudents.get(e.classArmId) ?? [];
      list.push(e.studentId);
      classArmToStudents.set(e.classArmId, list);
    }

    // 6. Assemble per-child summaries
    const children = links.map((l) => {
      const enrollment = enrollmentByStudent.get(l.student.id);
      return {
        studentId: l.student.id,
        name: l.student.user.name,
        admissionNumber: l.student.admissionNumber,
        photoUrl: l.student.photoUrl,
        relationship: l.relationship,
        isPrimary: l.isPrimary,
        currentClass: enrollment
          ? {
              classLevel: enrollment.classArm.classLevel.name,
              arm: enrollment.classArm.arm.name,
            }
          : null,
        attendance: attendanceByStudent.get(l.student.id) ?? null,
        reportCardStatus: reportCardByStudent.get(l.student.id) ?? null,
        outstandingFeeCount: enrollment
          ? (feeCountByClassLevel.get(enrollment.classArm.classLevel.id) ?? 0)
          : 0,
      };
    });

    const assignmentsDueSoon = assignments.flatMap((a) =>
      (classArmToStudents.get(a.classArmId) ?? []).map((studentId) => ({
        assignmentId: a.id,
        studentId,
        title: a.title,
        subject: a.subject.name,
        dueDate: a.dueDate,
      })),
    );

    return {
      session: { id: session.id, name: session.name },
      term: term ? { id: term.id, name: term.name } : null,
      children,
      assignmentsDueSoon,
      recentPosts: await this.getRecentPosts(),
    };
  },

  async getRecentPosts() {
    return prisma.post.findMany({
      where: {
        status: 'Published',
        audience: { in: ['Parents', 'Students', 'Everyone'] },
      },
      select: { id: true, title: true, type: true, publishedAt: true },
      orderBy: { publishedAt: 'desc' },
      take: 5,
    });
  },
};
