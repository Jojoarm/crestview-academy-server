import prisma from '../../../config/prisma.js';
import type { Prisma } from '../../../generated/prisma/client.js';
import { createError } from '../../../middlewares/error-handler.js';
import type { ListPostsQuery } from '../validations/post.validation.js';

// Teachers only ever see Published posts targeted at them or everyone —
// Draft posts and posts scoped to Parents/Students are invisible here
// regardless of query params.
const teacherVisiblePostWhere = {
  status: 'Published',
  audience: { in: ['Everyone', 'Teachers'] },
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
  author: {
    select: { user: { select: { name: true } } },
  },
} satisfies Prisma.PostSelect;

export const teacherPostService = {
  async listPosts(query: ListPostsQuery) {
    const where: Prisma.PostWhereInput = {
      ...teacherVisiblePostWhere,
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

  async getPostById(postId: string) {
    const post = await prisma.post.findFirst({
      where: { id: postId, ...teacherVisiblePostWhere },
      select: postListSelect,
    });

    if (!post) throw createError('Post not found', 404);

    return post;
  },
};
