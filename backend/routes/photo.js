import express from 'express';
import { galleryController } from '../controllers/photoController.js';
import { uploadSingle, uploadMultiple } from '../middleware/uploadMiddleware.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// загрузить фотографии к записи 
router.post('/entries/:entryId/photos',
  uploadMultiple, 
  galleryController.uploadPhotos
);

// получить все фотографии записи
router.get('/entries/:entryId/photos',
  galleryController.getPhotos
);

// получить информацию о конкретной фотографии
router.get('/:photoId',
  galleryController.getPhoto
);

// удалить фотографию
router.delete('/:photoId',
  galleryController.deletePhoto
);

// изменить порядок фотографий записи
router.put('/entries/:entryId/photos/reorder',
  galleryController.reorderPhotos
);

export default router;