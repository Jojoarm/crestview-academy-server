import prisma from '../../../config/prisma.js';
import type { Prisma } from '../../../generated/prisma/client.js';
import { createError } from '../../../middlewares/error-handler.js';
import type {
  PaginatedResponse,
  PaginationQuery,
} from '../../../types/common.types.js';
import type {
  TeacherQuery,
  UpdateTeacherInput,
} from '../middlewares/teacher-validation.js';

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
} as const;

type TeacherWithUser = Prisma.TeacherGetPayload<{
  include: typeof teacherInclude;
}>;

// Teacher Service

export const teacherService = {
  async listTeachers(
    { page = 1, limit = 20 }: PaginationQuery,
    query: TeacherQuery,
  ): Promise<PaginatedResponse<TeacherWithUser>> {
    const skip = (page - 1) * limit;

    const where: Prisma.TeacherWhereInput = {
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.employmentType && { employmentType: query.employmentType }),
      ...(query.search && {
        user: {
          name: { contains: query.search, mode: 'insensitive' as const },
        },
      }),
    };

    const [teachers, total] = await prisma.$transaction([
      prisma.teacher.findMany({
        where,
        skip,
        take: limit,
        orderBy: { user: { name: 'asc' } },
        include: teacherInclude,
      }),
      prisma.teacher.count({ where }),
    ]);

    return {
      data: teachers,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async getTeacherById(id: string): Promise<TeacherWithUser> {
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        ...teacherInclude,
        classArmTeachers: {
          where: { session: { isActive: true } },
          include: {
            classArm: { include: { arm: true, classLevel: true } },
            session: true,
          },
        },
        subjectTeachers: {
          where: { session: { isActive: true } },
          include: {
            subject: true,
            classArm: { include: { arm: true, classLevel: true } },
          },
        },
      },
    });
    if (!teacher) throw createError('Teacher not found', 404);
    return teacher as TeacherWithUser;
  },

  async getTeacherByUserId(userId: string): Promise<TeacherWithUser> {
    const teacher = await prisma.teacher.findUnique({
      where: { userId },
      include: teacherInclude,
    });
    if (!teacher) throw createError('Teacher not found', 404);
    return teacher;
  },

  async updateTeacher(
    id: string,
    data: UpdateTeacherInput,
  ): Promise<TeacherWithUser> {
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) throw createError('Teacher not found', 404);

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
        ...(data.designation !== undefined && {
          designation: data.designation ?? null,
        }),
        ...(data.employmentType && { employmentType: data.employmentType }),
        ...(data.dateOfEmployment && {
          dateOfEmployment: data.dateOfEmployment,
        }),
      },
      include: teacherInclude,
    });
  },

  async deactivateTeacher(id: string): Promise<void> {
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) throw createError('Teacher not found', 404);

    await prisma.$transaction([
      prisma.teacher.update({ where: { id }, data: { isActive: false } }),
      prisma.user.update({
        where: { id: teacher.userId },
        data: { banned: true },
      }),
    ]);
  },
};
