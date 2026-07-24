import prisma from '../../../config/prisma.js';
import { resolveTerm } from '../../../lib/utils.js';
import { getChildContext } from './child-access.service.js';
import type { ParentAssignmentQuery } from '../validations/assignment.validation.js';

export const parentAssignmentService = {
  async getChildAssignments(
    parentId: string,
    studentId: string,
    query: ParentAssignmentQuery,
  ) {
    const { sessionId, termId, page, limit } = query;

    const { session, enrollment } = await getChildContext(
      parentId,
      studentId,
      sessionId,
    );
    const term = await resolveTerm(session.id, termId);

    const where = {
      classArmId: enrollment.classArmId,
      sessionId: session.id,
      termId: term.id,
      isPublished: true,
    };

    const [total, assignments] = await Promise.all([
      prisma.assignment.count({ where }),
      prisma.assignment.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          dueDate: true,
          subject: { select: { name: true, code: true } },
        },
        orderBy: { dueDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      classArm: {
        classLevel: enrollment.classArm.classLevel.name,
        arm: enrollment.classArm.arm.name,
      },
      session: { id: session.id, name: session.name },
      term: { id: term.id, name: term.name },
      data: assignments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};
