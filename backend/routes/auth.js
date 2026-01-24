import express from 'express';
import { register, login, refreshToken, logout, getCurrentUser } from '../controllers/authController.js';
import { authenticateToken, validateRefreshToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/sign-up', register);
router.post('/log-in', login);
router.post('/refresh', validateRefreshToken, refreshToken);
router.post('/logout', logout);

router.get('/me', authenticateToken, getCurrentUser);

export default router;