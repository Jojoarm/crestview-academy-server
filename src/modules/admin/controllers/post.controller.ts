import type { Request, Response } from 'express';
import { postService } from '../services/post.service.js';
import {
  createPostSchema,
  updatePostSchema,
  postQuerySchema,
} from '../middlewares/post-validation.js';
import { catchAsync } from '../../../utils/catch-async.js';
import { sendError, sendSuccess } from '../../../utils/api-response.js';

export const createPost = catchAsync(async (req: Request, res: Response) => {
  const parsed = createPostSchema.safeParse(req.body);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  // req.user is populated by your auth middleware
  const authorId = req.user?.id as string;

  const post = await postService.createPost(parsed.data, authorId);
  return sendSuccess(res, post, 'Post created successfully', 201);
});

export const listPosts = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const queryParsed = postQuerySchema.safeParse(req.query);
  if (!queryParsed.success)
    return sendError(res, queryParsed.error.issues[0]?.message, 400);

  const result = await postService.listPosts({ page, limit }, queryParsed.data);
  return sendSuccess(res, result, 'Posts retrieved successfully');
});

export const getPost = catchAsync(async (req: Request, res: Response) => {
  const post = await postService.getPostById(req.params.id as string);
  return sendSuccess(res, post, 'Post retrieved successfully');
});

export const updatePost = catchAsync(async (req: Request, res: Response) => {
  const parsed = updatePostSchema.safeParse(req.body);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  const post = await postService.updatePost(
    req.params.id as string,
    parsed.data,
  );
  return sendSuccess(res, post, 'Post updated successfully');
});

export const publishPost = catchAsync(async (req: Request, res: Response) => {
  const post = await postService.publishPost(req.params.id as string);
  return sendSuccess(res, post, 'Post published successfully');
});

export const deletePost = catchAsync(async (req: Request, res: Response) => {
  await postService.deletePost(req.params.id as string);
  return sendSuccess(res, null, 'Post deleted successfully');
});
