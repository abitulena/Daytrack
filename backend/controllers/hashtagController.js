/**
 * Контроллер для работы с хештегами
 * Пользовательские хештеги 
 */
import { Hashtag, DiaryEntry, EntryHashtag } from '../models/index.js';

export const hashtagController = {
  /**
   * Получить все хештеги пользователя
   * GET /api/hashtags
   */
  async getHashtags(req, res) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Пользователь не авторизован'
        });
      }

      const hashtags = await Hashtag.findAll({
        where: { user_id: userId },
        attributes: ['id', 'tag_name', 'color', 'created_at'],
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: hashtags
      });

    } catch (error) {
      console.error('Ошибка при получении хештегов:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось получить хештеги'
      });
    }
  },

  /**
   * Создать хештег
   * POST /api/hashtags
   */
  async createHashtag(req, res) {
    try {
      const userId = req.user?.id;
      const { tag_name, color = '#000000' } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Пользователь не авторизован'
        });
      }

      if (!tag_name || typeof tag_name !== 'string' || tag_name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Название хештега обязательно'
        });
      }

      const normalizedTag = tag_name.trim().toLowerCase();

      // Проверяем, существует ли уже такой хештег
      const existingHashtag = await Hashtag.findOne({
        where: { user_id: userId, tag_name: normalizedTag }
      });

      if (existingHashtag) {
        return res.status(409).json({
          success: false,
          error: 'Хештег с таким названием уже существует'
        });
      }

      const newHashtag = await Hashtag.create({
        user_id: userId,
        tag_name: normalizedTag,
        color
      });

      res.status(201).json({
        success: true,
        message: 'Хештег успешно создан',
        data: newHashtag
      });

    } catch (error) {
      console.error('Ошибка при создании хештега:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось создать хештег'
      });
    }
  }
};