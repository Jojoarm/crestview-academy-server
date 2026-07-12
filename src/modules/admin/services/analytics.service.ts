import prisma from '../../../config/prisma.js';
import { Prisma } from '../../../generated/prisma/client.js';

// Analytics Service

export const analyticsService = {
  async getDashboardStats() {
    const activeSession = await prisma.academicSession.findFirst({
      where: { isActive: true },
      include: {
        terms: { where: { isActive: true }, take: 1 },
      },
    });

    const activeTerm = activeSession?.terms[0] ?? null;

    // User counts
    const [
      totalStudents,
      activeStudents,
      totalTeachers,
      activeTeachers,
      totalParents,
      totalAdmins,
    ] = await prisma.$transaction([
      prisma.student.count(),
      prisma.student.count({ where: { isActive: true } }),
      prisma.teacher.count(),
      prisma.teacher.count({ where: { isActive: true } }),
      prisma.parent.count(),
      prisma.admin.count(),
    ]);

    // Class stats
    const [totalClasses, totalClassArms] = await prisma.$transaction([
      prisma.classLevel.count({ where: { isActive: true } }),
      prisma.classArm.count(),
    ]);

    // Enrollment stats for active session
    const enrollmentStats = activeSession
      ? await prisma.studentEnrollment.groupBy({
          by: ['classArmId'],
          where: { sessionId: activeSession.id, isActive: true },
          _count: { studentId: true },
        })
      : [];

    const totalEnrolled = enrollmentStats.reduce(
      (sum, e) => sum + e._count.studentId,
      0,
    );

    // Enrollment by section
    const enrollmentBySection = activeSession
      ? await prisma.studentEnrollment
          .groupBy({
            by: ['classArmId'],
            where: { sessionId: activeSession.id, isActive: true },
            _count: { studentId: true },
          })
          .then(async (enrollments) => {
            const classArmIds = enrollments.map((e) => e.classArmId);
            const classArms = await prisma.classArm.findMany({
              where: { id: { in: classArmIds } },
              include: { classLevel: true },
            });

            const sectionMap: Record<string, number> = {
              Kindergarten: 0,
              Nursery: 0,
              Primary: 0,
              Secondary: 0,
            };

            for (const enrollment of enrollments) {
              const classArm = classArms.find(
                (ca) => ca.id === enrollment.classArmId,
              );
              if (classArm) {
                sectionMap[classArm.classLevel.section] =
                  (sectionMap[classArm.classLevel.section] ?? 0) +
                  enrollment._count.studentId;
              }
            }

            return sectionMap;
          })
      : { Kindergarten: 0, Nursery: 0, Primary: 0, Secondary: 0 };

    // Subject stats
    const [totalSubjects, totalSubjectAssignments] = await prisma.$transaction([
      prisma.subject.count({ where: { isActive: true } }),
      prisma.subjectAssignment.count(),
    ]);

    // Teacher assignment stats (active session)
    const [classTeacherAssignments, subjectTeacherAssignments] = activeSession
      ? await prisma.$transaction([
          prisma.classArmTeacher.count({
            where: { sessionId: activeSession.id },
          }),
          prisma.subjectTeacher.count({
            where: { sessionId: activeSession.id },
          }),
        ])
      : [0, 0];

    // Fee stats (active session)
    const feeStructureCount = activeSession
      ? await prisma.feeStructure.count({
          where: {
            isActive: true,
            OR: [
              { sessionId: activeSession.id },
              { sessionId: null }, // OneTime fees
            ],
          },
        })
      : 0;

    // Post stats
    const [totalPosts, publishedPosts, draftPosts, upcomingEvents] =
      await prisma.$transaction([
        prisma.post.count(),
        prisma.post.count({ where: { status: 'Published' } }),
        prisma.post.count({ where: { status: 'Draft' } }),
        prisma.post.count({
          where: {
            type: 'Event',
            status: 'Published',
            eventStartDate: { gte: new Date() },
          },
        }),
      ]);
    // Recent posts
    const recentPosts = await prisma.post.findMany({
      where: { status: 'Published' },
      orderBy: { publishedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        type: true,
        audience: true,
        publishedAt: true,
        eventStartDate: true,
      },
    });

    // Upcoming events
    const upcomingEventsList = await prisma.post.findMany({
      where: {
        type: 'Event',
        status: 'Published',
        eventStartDate: { gte: new Date() },
      },
      orderBy: { eventStartDate: 'asc' },
      take: 5,
      select: {
        id: true,
        title: true,
        audience: true,
        eventStartDate: true,
        eventEndDate: true,
      },
    });

    // Class arm capacity overview
    const classArms = await prisma.classArm.findMany({
      include: {
        classLevel: true,
        arm: true,
      },
      orderBy: [
        { classLevel: { section: 'asc' } },
        { classLevel: { name: 'asc' } },
      ],
    });

    // Get enrollment counts separately
    const enrollmentCounts = activeSession
      ? await prisma.studentEnrollment.groupBy({
          by: ['classArmId'],
          where: { sessionId: activeSession.id, isActive: true },
          _count: { studentId: true },
        })
      : [];

    const enrollmentCountMap = new Map(
      enrollmentCounts.map((e) => [e.classArmId, e._count.studentId]),
    );

    const capacityOverview = classArms.map((ca) => {
      const enrolled = enrollmentCountMap.get(ca.id) ?? 0;
      return {
        id: ca.id,
        name: `${ca.classLevel.name} ${ca.arm.name}`,
        section: ca.classLevel.section,
        capacity: ca.capacity,
        enrolled,
        available: ca.capacity - enrolled,
        percentFull: Math.round((enrolled / ca.capacity) * 100),
      };
    });
    return {
      session: activeSession
        ? {
            id: activeSession.id,
            name: activeSession.name,
            activeTerm: activeTerm
              ? { id: activeTerm.id, name: activeTerm.name }
              : null,
          }
        : null,

      users: {
        students: { total: totalStudents, active: activeStudents },
        teachers: { total: totalTeachers, active: activeTeachers },
        parents: totalParents,
        admins: totalAdmins,
      },

      enrollment: {
        total: totalEnrolled,
        bySection: enrollmentBySection,
      },

      classes: {
        total: totalClasses,
        totalArms: totalClassArms,
        capacityOverview,
      },

      subjects: {
        total: totalSubjects,
        totalAssignments: totalSubjectAssignments,
      },

      teachers: {
        classAssignments: classTeacherAssignments,
        subjectAssignments: subjectTeacherAssignments,
      },

      fees: {
        activeStructures: feeStructureCount,
      },

      posts: {
        total: totalPosts,
        published: publishedPosts,
        drafts: draftPosts,
        upcomingEvents,
        recent: recentPosts,
        upcomingEventsList: upcomingEventsList,
      },
    };
  },
};
