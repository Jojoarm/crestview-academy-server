import { sendError, sendSuccess } from '../../../utils/api-response.js';
import { catchAsync } from '../../../utils/catch-async.js';
import { requireParam } from '../../../utils/require-params.js';
import { teacherPostService } from '../services/post.service.js';
import { listPostsQuerySchema } from '../validations/post.validation.js';

export const listPosts = catchAsync(async (req, res) => {
  const parsed = listPostsQuerySchema.safeParse(req.query);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  const result = await teacherPostService.listPosts(parsed.data);

  return sendSuccess(res, result, 'Posts retrieved successfully');
});

export const getPost = catchAsync(async (req, res) => {
  const postId = requireParam(req, 'id');

  const post = await teacherPostService.getPostById(postId);

  return sendSuccess(res, post, 'Post retrieved successfully');
});
