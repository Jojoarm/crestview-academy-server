import prisma from '../../../config/prisma.js';
import { activeSession } from '../../../lib/utils.js';
import { createError } from '../../../middlewares/error-handler.js';
import { assertParentOfStudent } from '../lib/utils.js';
import {
  parentInclude,
  type ChildProfile,
  type ChildSummary,
  type ParentWithUser,
} from '../types/profile.types.js';
import type { UpdateParentInput } from '../validations/profile.validation.js';

export const parentProfileService = {
  async getParentProfile(id: string): Promise<ParentWithUser> {
    const parent = await prisma.parent.findUnique({
      where: { id },
      include: parentInclude,
    });

    if (!parent) throw createError('Parent profile not found', 404);

    return parent;
  },

  async updateParentProfile(
    id: string,
    data: UpdateParentInput,
  ): Promise<ParentWithUser> {
    return prisma.parent.update({
      where: { id },
      data: {
        ...(data.phone !== undefined && { phone: data.phone ?? null }),
        ...(data.address !== undefined && { address: data.address ?? null }),
        ...(data.photoUrl !== undefined && { photoUrl: data.photoUrl ?? null }),
        ...(data.occupation !== undefined && {
          occupation: data.occupation ?? null,
        }),
      },
      include: parentInclude,
    });
  },

  async listChildren(parentId: string): Promise<ChildSummary[]> {
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

    if (links.length === 0) return [];

    const studentIds = links.map((l) => l.student.id);

    const enrollments = activeSession
      ? await prisma.studentEnrollment.findMany({
          where: {
            studentId: { in: studentIds },
            sessionId: activeSession.id,
            isActive: true,
          },
          select: {
            studentId: true,
            classArm: {
              select: {
                classLevel: { select: { name: true } },
                arm: { select: { name: true } },
              },
            },
          },
        })
      : [];

    const classByStudentId = new Map(
      enrollments.map((e) => [
        e.studentId,
        { classLevel: e.classArm.classLevel.name, arm: e.classArm.arm.name },
      ]),
    );

    return links.map((link) => ({
      studentId: link.student.id,
      admissionNumber: link.student.admissionNumber,
      name: link.student.user.name,
      photoUrl: link.student.photoUrl,
      relationship: link.relationship,
      isPrimary: link.isPrimary,
      currentClass: classByStudentId.get(link.student.id) ?? null,
    }));
  },

  async getChildProfile(
    parentId: string,
    studentId: string,
  ): Promise<ChildProfile> {
    const link = await assertParentOfStudent(parentId, studentId);

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        admissionNumber: true,
        photoUrl: true,
        dateOfBirth: true,
        gender: true,
        address: true,
        bloodGroup: true,
        genotype: true,
        medicalConditions: true,
        user: { select: { name: true } },
      },
    });

    if (!student) throw createError('Student not found', 404);
    const enrollment = activeSession
      ? await prisma.studentEnrollment.findFirst({
          where: { studentId, sessionId: activeSession.id, isActive: true },
          select: {
            classArm: {
              select: {
                classLevel: { select: { name: true } },
                arm: { select: { name: true } },
              },
            },
          },
        })
      : null;

    return {
      studentId: student.id,
      admissionNumber: student.admissionNumber,
      name: student.user.name,
      photoUrl: student.photoUrl,
      dateOfBirth: student.dateOfBirth?.toISOString() ?? null,
      gender: student.gender,
      address: student.address,
      bloodGroup: student.bloodGroup,
      genotype: student.genotype,
      medicalConditions: student.medicalConditions,
      relationship: link.relationship,
      isPrimary: link.isPrimary,
      currentClass: enrollment
        ? {
            classLevel: enrollment.classArm.classLevel.name,
            arm: enrollment.classArm.arm.name,
          }
        : null,
    };
  },
};
