import { Router } from 'express';
import {
  getGroups,
  createGroup,
  getGroupById,
  getGroupMembers,
  joinGroup,
  leaveGroup,
  updateGroupMemberRole,
} from '../controllers/groups.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/groups', authMiddleware, getGroups);
router.post('/groups', authMiddleware, createGroup);
router.get('/groups/:id', authMiddleware, getGroupById);
router.get('/groups/:id/members', authMiddleware, getGroupMembers);
router.post('/groups/:id/join', authMiddleware, joinGroup);
router.post('/groups/:id/leave', authMiddleware, leaveGroup);
router.patch(
  '/groups/:id/members/:userId/role',
  authMiddleware,
  updateGroupMemberRole,
);

export default router;