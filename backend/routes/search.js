import express from 'express';
import { searchController } from '../controllers/searchController.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

// 1. Поиск записей с фильтрами
// GET /api/search/entries?q=текст&emotion=1&sleep=2&hashtag=отпуск
router.get('/entries', searchController.searchEntries);

// 2. Получить данные для фильтров
// GET /api/search/filters
router.get('/filters', searchController.getFilterData);

export default router;