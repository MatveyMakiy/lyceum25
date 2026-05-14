import { Router } from 'express';
import {
  createDirectChat,
  getChatById,
  getChats,
  sendChatMessage,
  getOrCreateGroupChat,
} from '../controllers/chats.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/chats', authMiddleware, getChats);
router.post('/chats/direct', authMiddleware, createDirectChat);
router.get('/chats/:id', authMiddleware, getChatById);
router.post('/chats/:id/messages', authMiddleware, sendChatMessage);
router.post('/groups/:groupId/chat', authMiddleware, getOrCreateGroupChat);

export default router;