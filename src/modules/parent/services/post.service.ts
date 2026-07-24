import prisma from '../../../config/prisma.js';
import type { Prisma } from '../../../generated/prisma/client.js';
import { createError } from '../../../middlewares/error-handler.js';
import type { ParentPostQuery } from '../validations/post.validation.js';

const parentVisiblePostWhere = {
  status: 'Published',
  audience: { in: ['Parents', 'Students', 'Everyone'] },
} satisfies Prisma.PostWhereInput;

const postListSelect = {
  id: true,
  title: true,
  content: true,
  type: true,
  audience: true,
  bannerImageUrl: true,
  eventStartDate: true,
  eventEndDate: true,
  publishedAt: true,
} satisfies Prisma.PostSelect;

export const parentPostService = {
  async listPosts(query: ParentPostQuery) {
    const where: Prisma.PostWhereInput = {
      ...parentVisiblePostWhere,
      ...(query.type ? { type: query.type } : {}),
    };

    const [total, data] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        select: postListSelect,
        orderBy: { publishedAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  },

  async getPost(postId: string) {
    const post = await prisma.post.findFirst({
      where: { id: postId, ...parentVisiblePostWhere },
      select: postListSelect,
    });

    if (!post) throw createError('Post not found', 404);

    return post;
  },
};
