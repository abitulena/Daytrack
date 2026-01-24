import { Hashtag } from '../models/index.js';
import { Op } from 'sequelize';

export const hashtagController = {

  /**
   * @swagger
   * /api/hashtags:
   *   get:
   *     summary: Получить все хештеги
   *     description: Возвращает список всех хештегов, отсортированных сначала пользовательские, потом стандартные.
   *     tags: [Hashtags]
   *     security:
   *       - bearerAuth: [] 
   *     responses:
   *       200:
   *         description: Успешный ответ с массивом хештегов
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 hashtags:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                       tag_name:
   *                         type: string
   *                       is_custom:
   *                         type: boolean
   *       500:
   *         description: Ошибка сервера
   */
  async getAll(req, res) {
    try {
      const hashtags = await Hashtag.findAll({
        order: [
          ['is_custom', 'ASC'],  
          ['tag_name', 'ASC']   
        ]
      });
      
      res.json({
        success: true,
        hashtags
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Ошибка сервера'
      });
    }
  },

  /**
   * @swagger
   * /api/hashtags:
   *   post:
   *     summary: Создать новый хештег
   *     description: Создаёт пользовательский хештег. Автоматически приводит к нижнему регистру и проверяет уникальность.
   *     tags: [Hashtags]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - tag_name
   *             properties:
   *               tag_name:
   *                 type: string
   *                 description: Название хештега (без #)
   *                 example: "отпуск2025"
   *     responses:
   *       200:
   *         description: Хештег успешно создан
   *       400:
   *         description: Неверные данные или хештег уже существует
   *       500:
   *         description: Ошибка сервера
   */
  async create(req, res) {
  try {
    const { tag_name } = req.body;
    
    if (!tag_name) {
      return res.status(400).json({
        success: false,
        error: 'Введите название хештега'
      });
    }
    
    const cleanTag = tag_name.trim().toLowerCase();
    
    // ВАЖНО: Ищем ИЛИ создаем хештег
    // findOrCreate = найди или создай
    const [hashtag, created] = await Hashtag.findOrCreate({
      where: { 
        tag_name: cleanTag 
      },
      defaults: {
        tag_name: cleanTag,
        is_custom: true  
      }
    });
    
    // created = true, если хештег БЫЛ создан
    // created = false, если хештег УЖЕ существовал
    
    let message;
    if (created) {
      message = 'Хештег создан';
    } else {
      // Проверяем, может это стандартный хештег?
      if (!hashtag.is_custom) {
        return res.status(400).json({
          success: false,
          error: 'Этот хештег уже существует как стандартный'
        });
      }
      message = 'Хештег уже существует, используем его';
    }
    
    res.json({
      success: true,
      message: message,
      hashtag: hashtag,
      wasCreated: created  // Просто для информации
    });
    
  } catch (error) {
    console.error('Ошибка создания хештега:', error);
    res.status(500).json({
      success: false,
      error: 'Не удалось создать хештег'
    });
  }
},

  /**
   * @swagger
   * /api/hashtags/{id}:
   *   delete:
   *     summary: Удалить хештег
   *     description: Удаляет пользовательский хештег по ID. Стандартные хештеги удалить нельзя.
   *     tags: [Hashtags]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID хештега для удаления
   *     responses:
   *       200:
   *         description: Хештег успешно удалён
   *       400:
   *         description: Попытка удалить стандартный хештег
   *       404:
   *         description: Хештег не найден
   *       500:
   *         description: Ошибка сервера
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const hashtag = await Hashtag.findByPk(id);
      
      if (!hashtag) {
        return res.status(404).json({
          success: false,
          error: 'Хештег не найден'
        });
      }
      
      if (!hashtag.is_custom) {
        return res.status(400).json({
          success: false,
          error: 'Нельзя удалить стандартный хештег'
        });
      }
      
      await hashtag.destroy();
      
      res.json({
        success: true,
        message: 'Хештег удалён'
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Не удалось удалить хештег'
      });
    }
  },

  /**
   * @swagger
   * /api/hashtags/search:
   *   get:
   *     summary: Поиск хештегов
   *     description: Поиск хештегов по началу названия (регистронезависимый).
   *     tags: [Hashtags]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: q
   *         schema:
   *           type: string
   *         required: false
   *         description: Строка для поиска
   *     responses:
   *       200:
   *         description: Успешный ответ с массивом найденных хештегов
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 hashtags:
   *                   type: array
   *       500:
   *         description: Ошибка сервера
   */
  async search(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.json({
          success: true,
          hashtags: []
        });
      }
      
      const hashtags = await Hashtag.findAll({
        where: {
          tag_name: {
            [Op.like]: `${q.toLowerCase()}%`  
          }
        },
        limit: 10
      });
      
      res.json({
        success: true,
        hashtags
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Ошибка поиска'
      });
    }
  }
};