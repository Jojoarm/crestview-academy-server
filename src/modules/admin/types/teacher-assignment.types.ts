import type { Prisma } from '../../../generated/prisma/client.js';

export type ClassArmTeacherWithDetails = Prisma.ClassArmTeacherGetPayload<{
  include: {
    teacher: {
      select: {
        id: true;
        name: true;
        email: true;
        userRole: true;
      };
    };
    classArm: {
      include: {
        arm: true;
        classLevel: true;
      };
    };
    session: true;
  };
}>;

export type SubjectTeacherWithDetails = Prisma.SubjectTeacherGetPayload<{
  include: {
    teacher: {
      select: {
        id: true;
        name: true;
        email: true;
        userRole: true;
      };
    };
  };
  subject: true;
  classArm: {
    include: {
      arm: true;
      classLevel: true;
    };
  };
  session: true;
}>;
