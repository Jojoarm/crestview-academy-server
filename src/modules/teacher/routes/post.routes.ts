import { Router } from 'express';
import * as postController from '../controllers/post.controller.js';

const router = Router();

router.get('/', postController.listPosts);
router.get('/:id', postController.getPost);

export default router;
