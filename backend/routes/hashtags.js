// routes/hashtags.js
import express from 'express';
import { hashtagController } from '../controllers/hashtagController.js';

const router = express.Router();



// GET /api/hashtags - Получить ВСЕ хештеги пользователя
router.get('/', hashtagController.getHashtags);

// POST /api/hashtags - Создать НОВЫЙ хештег
router.post('/', hashtagController.createHashtag);

export default router;