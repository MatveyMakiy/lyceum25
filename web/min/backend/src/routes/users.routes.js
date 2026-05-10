import { Router } from 'express';
import { updateMyProfile } from '../controllers/users.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.put('/me', authMiddleware, updateMyProfile);

export default router;