import { Router } from 'express';
import { togglePostLike } from '../controllers/likes.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/posts/:id/like', authMiddleware, togglePostLike);

export default router;
