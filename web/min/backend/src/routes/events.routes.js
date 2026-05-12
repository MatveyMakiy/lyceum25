import { Router } from 'express';
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
  updateEvent,
} from '../controllers/events.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/events', authMiddleware, getEvents);
router.post('/events', authMiddleware, createEvent);
router.get('/events/:id', authMiddleware, getEventById);
router.put('/events/:id', authMiddleware, updateEvent);
router.delete('/events/:id', authMiddleware, deleteEvent);

export default router;