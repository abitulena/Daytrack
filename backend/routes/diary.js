import express from 'express';
import { createEntry, getUserEntries } from '../controllers/diaryController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/entries', authenticateToken, createEntry);

router.get('/entries', authenticateToken, getUserEntries);

export default router;