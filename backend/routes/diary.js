// routes/diary.js 
import express from 'express';
import { diaryController } from '../controllers/diaryController.js';

const router = express.Router();

// GET /api/diary - ВСЕ записи пользователя
router.get('/', diaryController.getAllEntries);

// GET /api/diary/today - запись на СЕГОДНЯ
router.get('/today', diaryController.getTodayEntry);

// GET /api/diary/date/:date - запись по КОНКРЕТНОЙ ДАТЕ
router.get('/date/:date', diaryController.getEntryByDate);

// POST /api/diary - СОХРАНИТЬ запись на сегодня
router.post('/', diaryController.saveTodayEntry);

// DELETE /api/diary/:id - УДАЛИТЬ запись
router.delete('/:id', diaryController.deleteEntry);

export default router; 