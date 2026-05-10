import { Router } from 'express';
import {
  getGroups,
  createGroup,
  getGroupById,
  joinGroup,
  leaveGroup,
} from '../controllers/groups.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/groups', authMiddleware, getGroups);
router.post('/groups', authMiddleware, createGroup);
router.get('/groups/:id', authMiddleware, getGroupById);
router.post('/groups/:id/join', authMiddleware, joinGroup);
router.post('/groups/:id/leave', authMiddleware, leaveGroup);

export default router;
