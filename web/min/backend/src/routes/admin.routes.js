import { Router } from 'express';
import {
  adminDeleteComment,
  adminDeleteEvent,
  adminDeleteGroup,
  adminDeletePost,
  getAdminContent,
  getAdminStats,
} from '../controllers/admin.controller.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/admin/stats', authMiddleware, adminMiddleware, getAdminStats);
router.get('/admin/content', authMiddleware, adminMiddleware, getAdminContent);

router.delete('/admin/posts/:id', authMiddleware, adminMiddleware, adminDeletePost);
router.delete(
  '/admin/comments/:id',
  authMiddleware,
  adminMiddleware,
  adminDeleteComment,
);
router.delete(
  '/admin/groups/:id',
  authMiddleware,
  adminMiddleware,
  adminDeleteGroup,
);
router.delete(
  '/admin/events/:id',
  authMiddleware,
  adminMiddleware,
  adminDeleteEvent,
);

export default router;