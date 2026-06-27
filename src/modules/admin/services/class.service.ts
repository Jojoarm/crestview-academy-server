import prisma from '../../../config/prisma.js';
import type { Prisma } from '../../../generated/prisma/client.js';
import { createError } from '../../../middlewares/error-handler.js';
import type {
  PaginatedResponse,
  PaginationQuery,
} from '../../../types/common.types.js';
import type {
  AssignArmInput,
  ClassLevelQuery,
  CreateArmInput,
  CreateClassLevelInput,
  UpdateArmInput,
  UpdateClassArmInput,
  UpdateClassLevelInput,
} from '../middlewares/class-validation.js';
import type { ClassLevelWithSummary } from '../types/class.types.js';

// Helpers
const classLevelInclude = {
  classArms: {
    include: { arm: true },
    orderBy: { arm: { name: 'asc' as const } },
  },
};

type ClassLevelQueryResult = Prisma.ClassLevelGetPayload<{
  include: typeof classLevelInclude;
}>;

const withTotalCapacity = (
  classLevel: ClassLevelQueryResult,
): ClassLevelWithSummary => ({
  ...classLevel,
  totalCapacity: classLevel.classArms.reduce((sum, ca) => sum + ca.capacity, 0),
});

// Class Level Service
export const classService = {
  // Create class level
  async createClassLevel(data: CreateClassLevelInput) {
    const existing = await prisma.classLevel.findUnique({
      where: { name: data.name },
    });

    if (existing)
      throw createError('A class with this name already exists', 409);

    const classLevel = await prisma.classLevel.create({
      data: {
        name: data.name,
        section: data.section,
        order: data.order,
      },
      include: classLevelInclude,
    });

    return withTotalCapacity(classLevel);
  },

  //   List class levels
  async listClassLevels(
    { page = 1, limit = 20 }: PaginationQuery,
    query: ClassLevelQuery,
  ): Promise<PaginatedResponse<ClassLevelWithSummary>> {
    const skip = (page - 1) * limit;

    const where = {
      ...(query.section && { section: query.section }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
    };

    const [classLevels, total] = await prisma.$transaction([
      prisma.classLevel.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ section: 'asc' }, { order: 'asc' }],
        include: classLevelInclude,
      }),
      prisma.classLevel.count({ where }),
    ]);

    return {
      data: classLevels.map(withTotalCapacity),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Get class level by Id
  async getClassLevelById(id: string) {
    const classLevel = await prisma.classLevel.findUnique({
      where: { id },
      include: classLevelInclude,
    });

    if (!classLevel) throw createError('Class not found', 404);

    return withTotalCapacity(classLevel);
  },

  //   Update class level
  async updateClassLevel(id: string, data: UpdateClassLevelInput) {
    await classService.getClassLevelById(id);

    if (data.name) {
      const conflict = await prisma.classLevel.findFirst({
        where: { name: data.name, NOT: { id } },
      });
      if (conflict)
        throw createError('A class with this name already exists', 409);
    }

    const classLevel = await prisma.classLevel.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.section && { section: data.section }),
        ...(data.order && { order: data.order }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: classLevelInclude,
    });

    return withTotalCapacity(classLevel);
  },

  //   Delete Class Level
  async deleteClassLevel(id: string) {
    await classService.getClassLevelById(id);

    // Guard: no students linked (add when student module is built)
    // const studentCount = await prisma.student.count({ where: { classArmId: { in: classArmIds } } });
    // if (studentCount > 0) throw createError('Class has enrolled students', 400);

    await prisma.classLevel.delete({ where: { id } });
  },

  //   Arm Services
  // Create Arm
  async createArm(data: CreateArmInput) {
    const existing = await prisma.arm.findUnique({
      where: { name: data.name },
    });

    if (existing) throw createError('An arm with this name already exists');

    return prisma.arm.create({ data: { name: data.name } });
  },

  // List arms
  async listArms({ page = 1, limit = 20 }: PaginationQuery) {
    const skip = (page - 1) * limit;

    const [arms, total] = await prisma.$transaction([
      prisma.arm.findMany({
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.arm.count(),
    ]);

    return {
      data: arms,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  //   Update arm
  async updateArm(id: string, data: UpdateArmInput) {
    const arm = await prisma.arm.findUnique({ where: { id } });
    if (!arm) throw createError('Arm not found', 404);

    if (data.name) {
      const conflict = await prisma.arm.findFirst({
        where: { name: data.name, NOT: { id } },
      });
      if (conflict)
        throw createError('An arm with this name already exists', 409);
    }

    return prisma.arm.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  },

  //   Delete arm
  async deleteArm(id: string) {
    const arm = await prisma.arm.findUnique({ where: { id } });
    if (!arm) throw createError('Arm not found', 404);

    const assignedCount = await prisma.classArm.count({ where: { armId: id } });
    if (assignedCount > 0) {
      throw createError(
        'Cannot delete an arm that is assigned to one or more classes',
        400,
      );
    }

    await prisma.arm.delete({ where: { id } });
  },

  //   Class Arm Assignment Service
  // Assign arm to class
  async assignArm(classLevelId: string, data: AssignArmInput) {
    await classService.getClassLevelById(classLevelId);

    const arm = await prisma.arm.findUnique({ where: { id: data.armId } });
    if (!arm) throw createError('Arm not found', 404);
    if (!arm.isActive) throw createError('Cannot assign an inactive arm', 400);

    const existing = await prisma.classArm.findUnique({
      where: { classLevelId_armId: { classLevelId, armId: data.armId } },
    });
    if (existing) {
      throw createError('This arm is already assigned to this class', 409);
    }

    return prisma.classArm.create({
      data: {
        classLevelId,
        armId: data.armId,
        capacity: data.capacity,
      },
      include: { arm: true, classLevel: true },
    });
  },

  //   update class arm
  async updateClassArm(
    classLevelId: string,
    armId: string,
    data: UpdateClassArmInput,
  ) {
    const classArm = await prisma.classArm.findUnique({
      where: { classLevelId_armId: { classLevelId, armId } },
    });
    if (!classArm)
      throw createError('This arm is not assigned to this class', 404);

    return prisma.classArm.update({
      where: { classLevelId_armId: { classLevelId, armId } },
      data: { capacity: data.capacity },
      include: { arm: true, classLevel: true },
    });
  },

  //   Remove Arm from class
  async removeClassArm(classLevelId: string, armId: string) {
    const classArm = await prisma.classArm.findUnique({
      where: { classLevelId_armId: { classLevelId, armId } },
    });
    if (!classArm)
      throw createError('This arm is not assigned to this class', 404);

    // Guard: no students in this class-arm (add when student module is built)
    // const studentCount = await prisma.student.count({ where: { classArmId: classArm.id } });
    // if (studentCount > 0) throw createError('Class arm has enrolled students', 400);

    await prisma.classArm.delete({
      where: { classLevelId_armId: { classLevelId, armId } },
    });
  },
};
