import type { Prisma } from '../../../generated/prisma/client.js';

export type PostWithAuthor = Prisma.PostGetPayload<{
  include: {
    author: {
      include: {
        user: {
          select: {
            id: true;
            name: true;
            email: true;
            userRole: true;
          };
        };
      };
    };
  };
}>;

export type ClassArmTeacherWithDetails = Prisma.ClassArmTeacherGetPayload<{
  include: {
    teacher: {
      include: {
        user: {
          select: {
            id: true;
            name: true;
            email: true;
            userRole: true;
          };
        };
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
      include: {
        user: {
          select: {
            id: true;
            name: true;
            email: true;
            userRole: true;
          };
        };
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
