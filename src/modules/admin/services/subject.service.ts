import prisma from '../../../config/prisma.js';
import { createError } from '../../../middlewares/error-handler.js';
import type {
  PaginatedResponse,
  PaginationQuery,
} from '../../../types/common.types.js';
import type {
  AssignClassLevelInput,
  CreateSubjectInput,
  SubjectQuery,
  UpdateSubjectAssignmentInput,
  UpdateSubjectInput,
} from '../middlewares/subject-validation.js';
import type {
  SubjectAssignmentWithDetails,
  SubjectWithAssignments,
} from '../types/subject.types.js';

// Helpers
const subjectInclude = {
  classAssignments: {
    include: { classLevel: true },
    orderBy: { classLevel: { name: 'asc' as const } },
  },
};

// Subject Service
export const subjectService = {
  // Create subject
  async createSubject(
    data: CreateSubjectInput,
  ): Promise<SubjectWithAssignments> {
    const [nameConflict, codeConflict] = await Promise.all([
      prisma.subject.findUnique({ where: { name: data.name } }),
      prisma.subject.findUnique({ where: { code: data.code } }),
    ]);

    if (nameConflict)
      throw createError('A subject with this name already exists', 409);
    if (codeConflict)
      throw createError('A subject with this code already exist', 409);

    return prisma.subject.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description ?? null,
      },
      include: subjectInclude,
    });
  },

  //   List subjects
  async listSubjects(
    { page = 1, limit = 20 }: PaginationQuery,
    query: SubjectQuery,
  ): Promise<PaginatedResponse<SubjectWithAssignments>> {
    const skip = (page - 1) * limit;

    const where = {
      ...(query.search && {
        name: { contains: query.search, mode: 'insensitive' as const },
      }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.classLevelId || query.section
        ? {
            classAssignments: {
              some: {
                classLevel: {
                  ...(query.classLevelId && { id: query.classLevelId }),
                  ...(query.section && { section: query.section }),
                },
              },
            },
          }
        : {}),
    };

    const [subjects, total] = await prisma.$transaction([
      prisma.subject.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: subjectInclude,
      }),
      prisma.subject.count({ where }),
    ]);

    return {
      data: subjects,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  //   Get subject by Id
  async getSubjectById(id: string): Promise<SubjectWithAssignments> {
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: subjectInclude,
    });

    if (!subject) throw createError('Subject not found', 404);

    return subject;
  },

  //   Updae subject
  async updateSubject(
    id: string,
    data: UpdateSubjectInput,
  ): Promise<SubjectWithAssignments> {
    if (data.name || data.code) {
      const [nameConflict, codeConflict] = await Promise.all([
        data.name
          ? prisma.subject.findFirst({
              where: { name: data.name, NOT: { id } },
            })
          : null,
        data.code
          ? prisma.subject.findFirst({
              where: { code: data.code, Not: { id } },
            })
          : null,
      ]);

      if (nameConflict)
        throw createError('A subject with this name already exists', 409);
      if (codeConflict)
        throw createError('A subject with this code already exists', 409);
    }

    return prisma.subject.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.code && { code: data.code }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: subjectInclude,
    });
  },

  //   Delete Subject
  async deleteSubject(id: string): Promise<void> {
    const subject = await subjectService.getSubjectById(id);

    if (subject.classAssignments.length > 0) {
      throw createError(
        'Cannot delete a subject that is assigned to one or more classes. Remove all class assignments first.',
        400,
      );
    }

    await prisma.subject.delete({ where: { id } });
  },

  //   Subject Class Assignment Service
  //  Asign subject to class
  async assignToClassLevel(
    subjectId: string,
    data: AssignClassLevelInput,
  ): Promise<SubjectAssignmentWithDetails> {
    const classLevel = await prisma.classLevel.findUnique({
      where: { id: data.classLevelId },
    });

    if (!classLevel) throw createError('Class level not found', 404);

    const existing = await prisma.subjectAssignment.findUnique({
      where: {
        subjectId_classLevelId: { subjectId, classLevelId: data.classLevelId },
      },
    });
    if (existing)
      throw createError(
        'This subject is already assigned to this class level',
        409,
      );

    return prisma.subjectAssignment.create({
      data: {
        subjectId,
        classLevelId: data.classLevelId,
        isCompulsory: data.isCompulsory,
      },
      include: { subject: true, classLevel: true },
    });
  },

  //   Update subject assignment
  async updateAssignment(
    subjectId: string,
    classLevelId: string,
    data: UpdateSubjectAssignmentInput,
  ): Promise<SubjectAssignmentWithDetails> {
    const assignment = await prisma.subjectAssignment.findUnique({
      where: { subjectId_classLevelId: { subjectId, classLevelId } },
    });
    if (!assignment)
      throw createError('Subject is not assigned to this class level', 404);

    return prisma.subjectAssignment.update({
      where: { subjectId_classLevelId: { subjectId, classLevelId } },
      data: { isCompulsory: data.isCompulsory },
      include: { subject: true, classLevel: true },
    });
  },

  //   Remove subject from class level
  async removeFromClassLevel(
    subjectId: string,
    classLevelId: string,
  ): Promise<void> {
    const assignment = await prisma.subjectAssignment.findUnique({
      where: { subjectId_classLevelId: { subjectId, classLevelId } },
    });
    if (!assignment)
      throw createError('Subject is not assigned to this class level', 404);

    // Guard: no teacher assignments linked (add when class & subject assignment module is built)
    // const teacherCount = await prisma.teacherSubjectArm.count({ where: { subjectId, classArm: { classLevelId } } });
    // if (teacherCount > 0) throw createError('Subject has teacher assignments in this class. Remove them first.', 400);

    await prisma.subjectAssignment.delete({
      where: { subjectId_classLevelId: { subjectId, classLevelId } },
    });
  },

  //   Get all subjects for a class level
  async getSubjectsByClassLevel(
    classLevelId: string,
    { page = 1, limit = 20 }: PaginationQuery,
  ): Promise<PaginatedResponse<SubjectAssignmentWithDetails>> {
    const classLevel = await prisma.classLevel.findUnique({
      where: { id: classLevelId },
    });

    if (!classLevel) throw createError('Class level not found', 404);

    const skip = (page - 1) * limit;

    const [assignments, total] = await prisma.$transaction([
      prisma.subjectAssignment.findMany({
        where: { classLevelId },
        skip,
        take: limit,
        orderBy: { subject: { name: 'asc' } },
        include: { subject: true, classLevel: true },
      }),
      prisma.subjectAssignment.count({ where: { classLevelId } }),
    ]);

    return {
      data: assignments,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },
};
