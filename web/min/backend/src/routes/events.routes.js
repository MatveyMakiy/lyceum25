import { Router } from 'express';
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
  getPublicEvents,
  joinEvent,
  leaveEvent,
  updateEvent,
} from '../controllers/events.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/public/events', getPublicEvents);

router.get('/events', authMiddleware, getEvents);
router.post('/events', authMiddleware, createEvent);
router.get('/events/:id', authMiddleware, getEventById);
router.put('/events/:id', authMiddleware, updateEvent);
router.delete('/events/:id', authMiddleware, deleteEvent);
router.post('/events/:id/join', authMiddleware, joinEvent);
router.post('/events/:id/leave', authMiddleware, leaveEvent);

export default router;