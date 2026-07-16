import prisma from '../../../config/prisma.js';
import type { Prisma } from '../../../generated/prisma/client.js';
import { getActiveSession } from '../../../lib/utils.js';
import { createError } from '../../../middlewares/error-handler.js';
import type { UpdateTeacherInput } from '../validations/profile.validation.js';

const teacherInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      userRole: true,
      banned: true,
      createdAt: true,
    },
  },
};

type TeacherWithUser = Prisma.TeacherGetPayload<{
  include: typeof teacherInclude;
}>;

const classArmInclude = {
  classLevel: true,
  arm: true,
} satisfies Prisma.ClassArmInclude;

type ClassArmsWithDetails = Prisma.ClassArmGetPayload<{
  include: typeof classArmInclude;
}>;

const subjectTeacherInclude = {
  classArm: {
    include: classArmInclude,
  },
  subject: true,
} satisfies Prisma.SubjectTeacherInclude;

type SubjectTeacherWithDetails = Prisma.SubjectTeacherGetPayload<{
  include: typeof subjectTeacherInclude;
}>;

export const teacherProfileService = {
  async getTeacherProfile(id: string): Promise<TeacherWithUser> {
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: teacherInclude,
    });

    if (!teacher) throw createError('Teacher profile not found', 404);

    return teacher;
  },

  async updateTeacherProfile(
    id: string,
    data: UpdateTeacherInput,
  ): Promise<TeacherWithUser> {
    return prisma.teacher.update({
      where: { id },
      data: {
        ...(data.dateOfBirth && { dateOfBirth: data.dateOfBirth }),
        ...(data.gender && { gender: data.gender }),
        ...(data.address !== undefined && { address: data.address ?? null }),
        ...(data.photoUrl !== undefined && { photoUrl: data.photoUrl ?? null }),
        ...(data.phone !== undefined && { phone: data.phone ?? null }),
        ...(data.qualification !== undefined && {
          qualification: data.qualification ?? null,
        }),
      },
      include: teacherInclude,
    });
  },

  async getTeacherClasses(id: string): Promise<ClassArmsWithDetails[]> {
    const session = await getActiveSession();

    const classArms = await prisma.classArmTeacher.findMany({
      where: { teacherId: id, sessionId: session.id },
      include: {
        classArm: {
          include: classArmInclude,
        },
      },
    });

    return classArms.map((cat) => cat.classArm);
  },

  async getTeacherSubjects(id: string): Promise<SubjectTeacherWithDetails[]> {
    const session = await getActiveSession();

    return prisma.subjectTeacher.findMany({
      where: { teacherId: id, sessionId: session.id },
      include: subjectTeacherInclude,
    });
  },
};
