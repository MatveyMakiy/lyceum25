import { Router } from 'express';
import {
  getGroups,
  createGroup,
  getGroupById,
} from '../controllers/groups.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/groups', authMiddleware, getGroups);
router.post('/groups', authMiddleware, createGroup);
router.get('/groups/:id', authMiddleware, getGroupById);

export default router;
