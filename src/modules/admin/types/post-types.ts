import { Prisma } from '../../../generated/prisma/client.js';

export type PostWithAuthor = Prisma.PostGetPayload<{
  include: {
    author: {
      select: {
        id: true;
        name: true;
        email: true;
        userRole: true;
      };
    };
  };
}>;
