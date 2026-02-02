import express from 'express';
import { hashtagController } from '../controllers/hashtagController.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use((req, res, next) => {
  console.log(`Hashtag route: ${req.method} ${req.url}`);
  console.log('User:', req.user);
  next();
});

router.use(authenticateToken);

router.get('/', hashtagController.getAll);           // GET /api/hashtags
router.post('/', hashtagController.create);          // POST /api/hashtags
router.delete('/:id', hashtagController.delete);     // DELETE /api/hashtags/:id
router.get('/search', hashtagController.search);     // GET /api/hashtags/search?q=текст

export default router;
