import { catchAsync } from '../../../utils/catch-async.js';
import { sendSuccess, sendError } from '../../../utils/api-response.js';
import { parentPostQuerySchema } from '../validations/post.validation.js';
import { parentPostService } from '../services/post.service.js';
import { requireParam } from '../../../utils/require-params.js';

export const listPosts = catchAsync(async (req, res) => {
  const parsed = parentPostQuerySchema.safeParse(req.query);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  const result = await parentPostService.listPosts(parsed.data);

  return sendSuccess(res, result, 'Posts retrieved successfully');
});

export const getPost = catchAsync(async (req, res) => {
  const id = requireParam(req, 'id');

  const result = await parentPostService.getPost(id);

  return sendSuccess(res, result, 'Post retrieved successfully');
});
