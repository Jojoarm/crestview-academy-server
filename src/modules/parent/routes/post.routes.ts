import { Router } from 'express';
import { listPosts, getPost } from '../controllers/post.controller.js';

const router = Router();

router.get('/', listPosts);
router.get('/:id', getPost);

export default router;
