import { Router } from 'express';
import {
  createComment,
  deleteComment,
  getPostComments,
} from '../controllers/comments.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/posts/:id/comments', getPostComments);
router.post('/comments', authMiddleware, createComment);
router.delete('/comments/:id', authMiddleware, deleteComment);

export default router;