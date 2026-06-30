import { Router } from 'express';
import {
  createPost,
  listPosts,
  getPost,
  updatePost,
  publishPost,
  deletePost,
} from '../controllers/post.controller.js';
import { requireAdmin } from '../../../middlewares/require-admin.js';

const router = Router();

router.use(requireAdmin);

router.post('/', createPost);
router.get('/', listPosts);
router.get('/:id', getPost);
router.patch('/:id', updatePost);
router.patch('/:id/publish', publishPost);
router.delete('/:id', deletePost);

export default router;
