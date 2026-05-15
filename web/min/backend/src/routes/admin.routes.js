import { Router } from 'express';
import {
  adminCreatePublicEvent,
  adminDeleteComment,
  adminDeleteEvent,
  adminDeleteGroup,
  adminDeletePost,
  adminDeleteUser,
  adminUpdateUserRole,
  getAdminContent,
  getAdminStats,
} from '../controllers/admin.controller.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/admin/stats', authMiddleware, adminMiddleware, getAdminStats);
router.get('/admin/content', authMiddleware, adminMiddleware, getAdminContent);

router.post(
  '/admin/public-events',
  authMiddleware,
  adminMiddleware,
  adminCreatePublicEvent,
);
router.patch(
  '/admin/users/:id/role',
  authMiddleware,
  adminMiddleware,
  adminUpdateUserRole,
);
router.delete('/admin/users/:id', authMiddleware, adminMiddleware, adminDeleteUser);
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