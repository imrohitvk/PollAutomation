// apps/backend/src/web/routes/achievements.routes.ts

import { Router } from 'express';
import { getUserAchievements, getDebugAchievementData } from '../controllers/achievements.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Get user's achievements and progress
router.get('/me', authenticate, getUserAchievements);

// Debug endpoint to check achievement data
router.get('/debug', authenticate, getDebugAchievementData);

export default router;