import express from 'express';
import { getEmotions, getSleepQualities } from '../controllers/emotionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/emotions', authenticateToken, getEmotions);

router.get('/sleep-qualities', authenticateToken, getSleepQualities);



export default router;