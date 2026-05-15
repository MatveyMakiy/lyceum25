import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateMyProfile,
} from '../controllers/users.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/users', authMiddleware, getUsers);
router.get('/users/:id', authMiddleware, getUserById);
router.put('/me', authMiddleware, updateMyProfile);

export default router;
