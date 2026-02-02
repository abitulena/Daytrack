import express from 'express';
import { galleryController } from '../controllers/photoController.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

// загрузить фотографии к записи 
router.post('/entries/:entryId/photos',
  upload.array('photos', 20), 
  galleryController.uploadPhotos
);

// получить все фотографии записи
router.get('/entries/:entryId/photos',
  galleryController.getPhotos
);

// получить информацию о конкретной фотографии
router.get('/photos/:photoId', galleryController.getPhoto);

// удалить фотографию
router.delete('/:photoId',
  galleryController.deletePhoto
);

// изменить порядок фотографий записи
router.put('/entries/:entryId/photos/reorder',
  galleryController.reorderPhotos
);

export default router;