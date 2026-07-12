import { Prisma } from '../../../generated/prisma/client.js';

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
