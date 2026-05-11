import { Router } from 'express';
import {
  createEvent,
  getEvents,
} from '../controllers/events.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/events', authMiddleware, getEvents);
router.post('/events', authMiddleware, createEvent);

export default router;