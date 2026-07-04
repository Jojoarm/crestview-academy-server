import prisma from '../../../config/prisma.js';
import { createError } from '../../../middlewares/error-handler.js';
import type {
  PaginatedResponse,
  PaginationQuery,
} from '../../../types/common.types.js';
import type {
  CreatePostInput,
  PostQuery,
  UpdatePostInput,
} from '../middlewares/post-validation.js';
import type { PostWithAuthor } from '../types/post-types.js';

// Helpers
const postInclude = {
  author: {
    select: { id: true, name: true, email: true, userRole: true },
  },
};

// Post Service

export const postService = {
  // Create Post
  async createPost(
    data: CreatePostInput,
    authorId: string,
  ): Promise<PostWithAuthor> {
    return prisma.post.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type,
        audience: data.audience,
        status: data.status,
        bannerImageUrl: data.bannerImageUrl ?? null,
        eventStartDate: data.eventStartDate ?? null,
        eventEndDate: data.eventEndDate ?? null,
        publishedAt: data.status === 'Published' ? new Date() : null,
        authorId,
      },
      include: postInclude,
    });
  },

  //   List posts
  async listPosts(
    { page = 1, limit = 20 }: PaginationQuery,
    query: PostQuery,
  ): Promise<PaginatedResponse<PostWithAuthor>> {
    const skip = (page - 1) * limit;

    const where = {
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' as const } },
          { content: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
      ...(query.type && { type: query.type }),
      ...(query.status && { status: query.status }),
      ...(query.audience && { audience: query.audience }),
    };

    const [posts, total] = await prisma.$transaction([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: postInclude,
      }),
      prisma.post.count({ where }),
    ]);

    return {
      data: posts,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  //   Get Post by Id
  async getPostById(id: string): Promise<PostWithAuthor> {
    const post = await prisma.post.findUnique({
      where: { id },
      include: postInclude,
    });
    if (!post) throw createError('Post not found', 404);
    return post;
  },

  // Update Post
  async updatePost(id: string, data: UpdatePostInput): Promise<PostWithAuthor> {
    const post = await postService.getPostById(id);

    // Determine the effective type after this update (existing unless overridden)
    const effectiveType = data.type ?? post.type;
    const effectiveStartDate = data.eventStartDate ?? post.eventStartDate;

    if (effectiveType === 'Event' && !effectiveStartDate) {
      throw createError(
        'Event start date is required for posts of type Event',
        400,
      );
    }

    return prisma.post.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.type && { type: data.type }),
        ...(data.audience && { audience: data.audience }),
        ...(data.bannerImageUrl !== undefined && {
          bannerImageUrl: data.bannerImageUrl ?? null,
        }),
        ...(data.eventStartDate !== undefined && {
          eventStartDate: data.eventStartDate ?? null,
        }),
        ...(data.eventEndDate !== undefined && {
          eventEndDate: data.eventEndDate ?? null,
        }),
      },
      include: postInclude,
    });
  },

  // Publish Post
  async publishPost(id: string): Promise<PostWithAuthor> {
    const post = await postService.getPostById(id);

    if (post.status === 'Published') {
      throw createError('This post is already published', 400);
    }

    return prisma.post.update({
      where: { id },
      data: { status: 'Published', publishedAt: new Date() },
      include: postInclude,
    });
  },

  // Delete Post
  async deletePost(id: string): Promise<void> {
    await postService.getPostById(id);
    await prisma.post.delete({ where: { id } });
  },
};
