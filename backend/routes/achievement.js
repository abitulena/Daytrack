import express from 'express';
import { achievementController } from '../controllers/achievementController.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

// Получить все достижения пользователя
router.get('/', achievementController.getUserAchievements);

// Получить конкретное достижение
router.get('/achievement/:id', achievementController.getAchievement);

// Получить статистику и прогресс
router.get('/stats/progress', achievementController.getUserStats);

export default router;