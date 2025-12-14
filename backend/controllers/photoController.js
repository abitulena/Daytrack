import { GalleryPhoto, DiaryEntry } from '../models/index.js';
import fs from 'fs';
import path from 'path';

export const galleryController = {
  /**
   * @swagger
   * /api/photos/entries/{entryId}/photos:
   *   post:
   *     summary: Загрузить фотографии к записи
   *     description: |
   *       Загружает фотографии к конкретной записи дневника.
   *       - Максимум 20 фото на запись
   *       - Форматы: JPEG, PNG, GIF, WebP (до 5MB каждая)
   *       - Файлы сохраняются в `public/uploads/gallery/`
   *     tags: [Photos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: entryId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID записи дневника
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               photos:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: binary
   *                 description: Фотографии (поле "photos")
   *     responses:
   *       201:
   *         description: Фотографии успешно загружены
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 photos:
   *                   type: array
   *                 total:
   *                   type: integer
   *       400:
   *         description: Превышен лимит (макс. 20 фото)
   *       404:
   *         description: Запись не найдена или нет доступа
   *       500:
   *         description: Ошибка сервера при загрузке
   */
  async uploadPhotos(req, res) {
    try {
      const userId = req.user.id;
      const { entryId } = req.params;
      const files = req.files || [req.file];
      
      // 1. Проверяем, существует ли запись И принадлежит ли пользователю
      const entry = await DiaryEntry.findOne({
        where: {
          id: entryId,
          user_id: userId 
        }
      });
      
      if (!entry) {
        // Удаляем загруженные файлы
        if (files && files.length > 0) {
          files.forEach(file => {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          });
        }
        return res.status(404).json({
          success: false,
          error: 'Запись не найдена или нет доступа'
        });
      }
      
      // 2. Проверяем лимит
      const currentCount = await GalleryPhoto.count({
        where: { entry_id: entryId }
      });
      
      if (currentCount + files.length > 20) {
        files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
        return res.status(400).json({
          success: false,
          error: `Максимум 20 фотографий на запись. У вас уже ${currentCount}`
        });
      }
      
      // 3. Сохраняем фото
      const savedPhotos = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        const photo = await GalleryPhoto.create({
          entry_id: parseInt(entryId),
          image_path: `/uploads/gallery/${file.filename}`,
          image_name: file.originalname,
          upload_order: currentCount + i + 1
        });
        
        savedPhotos.push(photo);
      }
      
      res.status(201).json({
        success: true,
        message: `Загружено ${files.length} фотографий`,
        photos: savedPhotos,
        total: currentCount + files.length
      });
      
    } catch (error) {
      console.error('Ошибка при загрузке фото:', error);
      
      if (req.files || req.file) {
        const files = req.files || [req.file];
        files.forEach(file => {
          if (file && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Не удалось загрузить фотографии'
      });
    }
  },

  /**
   * @swagger
   * /api/photos/entries/{entryId}/photos:
   *   get:
   *     summary: Получить все фотографии записи
   *     description: Возвращает все фотографии, прикреплённые к конкретной записи дневника.
   *     tags: [Photos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: entryId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID записи дневника
   *     responses:
   *       200:
   *         description: Список фотографий записи
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 count:
   *                   type: integer
   *                   example: 5
   *                 photos:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                       image_path:
   *                         type: string
   *                       image_name:
   *                         type: string
   *                       upload_order:
   *                         type: integer
   *                       uploaded_at:
   *                         type: string
   *                         format: date-time
   *       404:
   *         description: Запись не найдена или нет доступа
   *       500:
   *         description: Ошибка сервера
   */
  async getPhotos(req, res) {
    try {
      const userId = req.user.id;
      const { entryId } = req.params;
      
      const entry = await DiaryEntry.findOne({
        where: {
          id: entryId,
          user_id: userId  
        }
      });
      
      if (!entry) {
        return res.status(404).json({
          success: false,
          error: 'Запись не найдена или нет доступа'
        });
      }
      
      const photos = await GalleryPhoto.findAll({
        where: { entry_id: entryId },
        order: [['upload_order', 'ASC']],
        attributes: ['id', 'image_path', 'image_name', 'upload_order', 'uploaded_at']

      });
      
      res.json({
        success: true,
        count: photos.length,
        photos
      });
      
    } catch (error) {
      console.error('Ошибка при получении фото:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось получить фотографии'
      });
    }
  },

  /**
   * @swagger
   * /api/photos/{photoId}:
   *   get:
   *     summary: Получить информацию о фотографии
   *     description: Возвращает детальную информацию о конкретной фотографии.
   *     tags: [Photos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: photoId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID фотографии
   *     responses:
   *       200:
   *         description: Информация о фотографии
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 photo:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                     image_path:
   *                       type: string
   *                     image_name:
   *                       type: string
   *                     upload_order:
   *                       type: integer
   *                     uploaded_at:
   *                       type: string
   *                     entry:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: integer
   *                         entry_date:
   *                           type: string
   *                           format: date
   *       404:
   *         description: Фотография не найдена или нет доступа
   *       500:
   *         description: Ошибка сервера
   */
  async getPhoto(req, res) {
    try {
      const userId = req.user.id;
      const { photoId } = req.params;
      
      // Проверяем через связь с записью пользователя
      const photo = await GalleryPhoto.findByPk(photoId, {
        include: [{
          model: DiaryEntry,
          attributes: ['id', 'entry_date', 'user_id'],
          where: { user_id: userId },  
          required: true
        }]
      });
      
      if (!photo) {
        return res.status(404).json({
          success: false,
          error: 'Фотография не найдена или нет доступа'
        });
      }
      
      res.json({
        success: true,
        photo: {
          id: photo.id,
          image_path: photo.image_path,
          image_name: photo.image_name,
          upload_order: photo.upload_order,
          uploaded_at: photo.uploaded_at,
          entry: {
            id: photo.DiaryEntry.id,
            entry_date: photo.DiaryEntry.entry_date
          }
        }
      });
      
    } catch (error) {
      console.error('Ошибка при получении фото:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось получить информацию о фотографии'
      });
    }
  },

  /**
   * @swagger
   * /api/photos/{photoId}:
   *   delete:
   *     summary: Удалить фотографию
   *     description: |
   *       Удаляет фотографию по ID.
   *       - Удаляет файл с диска
   *       - Удаляет запись из БД
   *       - Автоматически обновляет порядок оставшихся фото
   *     tags: [Photos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: photoId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID фотографии для удаления
   *     responses:
   *       200:
   *         description: Фотография успешно удалена
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 remainingCount:
   *                   type: integer
   *       404:
   *         description: Фотография не найдена или нет доступа
   *       500:
   *         description: Ошибка сервера
   */
  async deletePhoto(req, res) {
    try {
      const userId = req.user.id;
      const { photoId } = req.params;
      
      // Проверяем через связь с записью пользователя
      const photo = await GalleryPhoto.findByPk(photoId, {
        include: [{
          model: DiaryEntry,
          where: { user_id: userId },  
          required: true
        }]
      });
      
      if (!photo) {
        return res.status(404).json({
          success: false,
          error: 'Фотография не найдена или нет доступа'
        });
      }
      
      // Удаляем файл
      const filePath = path.join('public', photo.image_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Удаляем из БД
      await photo.destroy();
      
      // Обновляем порядок
      const remainingPhotos = await GalleryPhoto.findAll({
        where: { entry_id: photo.entry_id },
        order: [['upload_order', 'ASC']]
      });
      
      for (let i = 0; i < remainingPhotos.length; i++) {
        await remainingPhotos[i].update({ upload_order: i + 1 });
      }
      
      res.json({
        success: true,
        message: 'Фотография удалена',
        remainingCount: remainingPhotos.length
      });
      
    } catch (error) {
      console.error('Ошибка при удалении фото:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось удалить фотографию'
      });
    }
  },

  /**
   * @swagger
   * /entries/{entryId}/photos/reorder: 
   *   put:
   *     summary: Изменить порядок фотографий
   *     description: Изменяет порядок фотографий в записи на основе переданного массива ID.
   *     tags: [Photos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: entryId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID записи дневника
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - photoIds
   *             properties:
   *               photoIds:
   *                 type: array
   *                 items:
   *                   type: integer
   *                 description: Массив ID фотографий в новом порядке
   *                 example: [3, 1, 2]
   *     responses:
   *       200:
   *         description: Порядок успешно изменён
   *       400:
   *         description: Неверный формат или ID не принадлежат записи
   *       404:
   *         description: Запись не найдена или нет доступа
   *       500:
   *         description: Ошибка сервера
   */
  async reorderPhotos(req, res) {
    try {
      const userId = req.user.id;
      const { entryId } = req.params;
      const { photoIds } = req.body;
      
      if (!Array.isArray(photoIds)) {
        return res.status(400).json({
          success: false,
          error: 'Нужен массив ID фотографий в новом порядке'
        });
      }
      
      // Проверяем, что запись принадлежит пользователю
      const entry = await DiaryEntry.findOne({
        where: {
          id: entryId,
          user_id: userId  
        }
      });
      
      if (!entry) {
        return res.status(404).json({
          success: false,
          error: 'Запись не найдена или нет доступа'
        });
      }
      
      // Проверяем, что все фото принадлежат этой записи
      const photos = await GalleryPhoto.findAll({
        where: { 
          id: photoIds,
          entry_id: entryId 
        }
      });
      
      if (photos.length !== photoIds.length) {
        return res.status(400).json({
          success: false,
          error: 'Некоторые фотографии не принадлежат этой записи'
        });
      }
      
      // Обновляем порядок
      for (let i = 0; i < photoIds.length; i++) {
        await GalleryPhoto.update(
          { upload_order: i + 1 },
          { where: { id: photoIds[i], entry_id: entryId } }
        );
      }
      
      res.json({
        success: true,
        message: 'Порядок фотографий обновлен'
      });
      
    } catch (error) {
      console.error('Ошибка при изменении порядка:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось изменить порядок фотографий'
      });
    }
  }
};