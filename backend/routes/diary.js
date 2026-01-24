import express from 'express';
import { createEntry, getUserEntries,  updateEntry, deleteEntry, getStats, getEntryById  } from '../controllers/diaryController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/entries', createEntry);

router.get('/entries', getUserEntries);

router.get('/entries/:id', getEntryById);

router.put('/entries/:id', updateEntry);

router.delete('/entries/:id', deleteEntry);

router.get('/stats', getStats);

export default router;