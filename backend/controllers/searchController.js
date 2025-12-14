import { DiaryEntry, Emotion, SleepQuality, Hashtag, EntryHashtag, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

export const searchController = {
  /**
   * @swagger
   * /api/search/entries:
   *   get:
   *     summary: Поиск записей дневника с фильтрами
   *     description: |
   *       Позволяет искать записи дневника по различным критериям:
   *       - По тексту записи
   *       - По эмоции
   *       - По качеству сна
   *       - По хештегам
   *       - По диапазону дат
   *       Возвращает до 50 записей, отсортированных по дате (новые сначала).
   *     tags: [Search]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: q
   *         schema:
   *           type: string
   *         description: Поисковый текст (ищет в тексте записи)
   *         example: "отпуск"
   *       - in: query
   *         name: emotion
   *         schema:
   *           type: integer
   *         description: ID эмоции для фильтрации
   *         example: 1
   *       - in: query
   *         name: sleep
   *         schema:
   *           type: integer
   *         description: ID качества сна для фильтрации
   *         example: 2
   *       - in: query
   *         name: hashtag
   *         schema:
   *           type: string
   *         description: Текст хештега (регистронезависимый)
   *         example: "отпуск2025"
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Начальная дата диапазона (включительно)
   *         example: "2025-01-01"
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Конечная дата диапазона (включительно)
   *         example: "2025-12-31"
   *     responses:
   *       200:
   *         description: Успешный поиск
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                       entry_date:
   *                         type: string
   *                         format: date
   *                       text_entry:
   *                         type: string
   *                       Emotion:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: integer
   *                           name:
   *                             type: string
   *                           image_url:
   *                             type: string
   *                       SleepQuality:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: integer
   *                           name:
   *                             type: string
   *                           image_url:
   *                             type: string
   *                       Hashtags:
   *                         type: array
   *                         items:
   *                           type: object
   *                           properties:
   *                             id:
   *                               type: integer
   *                             tag_name:
   *                               type: string
   *                 count:
   *                   type: integer
   *                   description: Количество найденных записей
   *       500:
   *         description: Ошибка сервера при поиске
   */
  async searchEntries(req, res) {
    try {
      const userId = req.user.id;
      const { 
        q,           // поисковый текст
        emotion,     // ID эмоции
        sleep,       // ID качества сна
        hashtag,     // текст хештега
        startDate,   // с даты
        endDate      // по дату
      } = req.query;
      
      // Базовые условия
      const where = { user_id: userId };
      
      // 1. Поиск по тексту записи
      if (q && q.trim()) {
        where.text_entry = {
          [Op.iLike]: `%${q.trim()}%`
        };
      }
      
      // 2. Фильтр по эмоции
      if (emotion) {
        where.emotion_id = parseInt(emotion);
      }
      
      // 3. Фильтр по сну
      if (sleep) {
        where.sleep_id = parseInt(sleep);
      }
      
      // 4. Фильтр по датам
      if (startDate && endDate) {
        where.entry_date = {
          [Op.between]: [startDate, endDate]
        };
      }
      
      // Поиск записей
      let entries = await DiaryEntry.findAll({
        where,
        include: [
          {
            model: Emotion,
            attributes: ['id', 'name', 'image_url']
          },
          {
            model: SleepQuality,
            attributes: ['id', 'name', 'image_url']
          },
          {
            model: Hashtag,
            through: { attributes: [] }, // не показываем таблицу связи
            attributes: ['id', 'tag_name']
          }
        ],
        order: [['entry_date', 'DESC']],
        limit: 50
      });
      
      // 5. Дополнительная фильтрация по хештегу 
      if (hashtag) {
        const normalizedHashtag = hashtag.trim().toLowerCase();
        entries = entries.filter(entry => 
          entry.Hashtags.some(h => 
            h.tag_name.toLowerCase().includes(normalizedHashtag)
          )
        );
      }
      
      res.json({
        success: true,
        data: entries,
        count: entries.length
      });
      
    } catch (error) {
      console.error('Ошибка поиска:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось выполнить поиск'
      });
    }
  },

  /**
   * @swagger
   * /api/search/filters:
   *   get:
   *     summary: Получить данные для фильтров поиска
   *     description: |
   *       Возвращает данные для построения интерфейса фильтров:
   *       - Часто используемые эмоции пользователя (топ-5)
   *       - Часто выбираемые качества сна (топ-4)
   *       - Популярные хештеги пользователя (топ-10)
   *       - Полный список всех эмоций
   *       - Полный список всех вариантов сна
   *     tags: [Search]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Данные для фильтров
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     frequentEmotions:
   *                       type: array
   *                       description: Частые эмоции пользователя с количеством использований
   *                       items:
   *                         type: object
   *                         properties:
   *                           emotion_id:
   *                             type: integer
   *                           count:
   *                             type: integer
   *                           Emotion:
   *                             type: object
   *                     frequentSleep:
   *                       type: array
   *                       description: Частые качества сна пользователя с количеством использований
   *                       items:
   *                         type: object
   *                     popularHashtags:
   *                       type: array
   *                       description: Популярные хештеги пользователя с количеством использований
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: integer
   *                           tag_name:
   *                             type: string
   *                           usage_count:
   *                             type: integer
   *                     allEmotions:
   *                       type: array
   *                       description: Полный список всех доступных эмоций
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: integer
   *                           name:
   *                             type: string
   *                           image_url:
   *                             type: string
   *                           display_order:
   *                             type: integer
   *                     allSleepOptions:
   *                       type: array
   *                       description: Полный список всех вариантов качества сна
   *                       items:
   *                         type: object
   *       500:
   *         description: Ошибка сервера
   */
 async getFilterData(req, res) {
  try {
    const userId = req.user.id;
    
    // 1. Частые эмоции пользователя
    const frequentEmotions = await DiaryEntry.findAll({
      where: { user_id: userId },
      attributes: [
        'emotion_id',
        [sequelize.fn('COUNT', sequelize.col('emotion_id')), 'count']
      ],
      include: [{
        model: Emotion,
        attributes: ['id', 'name', 'image_url']
      }],
      group: ['emotion_id', 'Emotion.id'],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 5
    });
    
    // 2. Частые качества сна
    const frequentSleep = await DiaryEntry.findAll({
      where: { user_id: userId },
      attributes: [
        'sleep_id',
        [sequelize.fn('COUNT', sequelize.col('sleep_id')), 'count']
      ],
      include: [{
        model: SleepQuality,
        attributes: ['id', 'name', 'image_url']
      }],
      group: ['sleep_id', 'SleepQuality.id'],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 4
    });
    
    // 3. Популярные хештеги пользователя - ИСПРАВЛЕННЫЙ ЗАПРОС
    const popularHashtags = await Hashtag.findAll({
      attributes: [
        'id', 
        'tag_name',
        [sequelize.fn('COUNT', sequelize.col('EntryHashtags.id')), 'usage_count']
      ],
      include: [{
        model: EntryHashtag,
        attributes: [],
        required: true,
        include: [{
          model: DiaryEntry,
          attributes: [],
          where: { user_id: userId },
          required: true
        }]
      }],
      group: ['Hashtag.id'],
      order: [[sequelize.literal('usage_count'), 'DESC']],
      limit: 10,
      subQuery: false // Важно для сложных запросов с агрегацией
    });
    
    // Альтернативный вариант запроса для популярных хештегов
    // const popularHashtags = await sequelize.query(`
    //   SELECT 
    //     h.id,
    //     h.tag_name,
    //     COUNT(eh.id) as usage_count
    //   FROM hashtags h
    //   INNER JOIN entry_hashtags eh ON h.id = eh.hashtag_id
    //   INNER JOIN diary_entries de ON eh.entry_id = de.id
    //   WHERE de.user_id = :userId
    //   GROUP BY h.id, h.tag_name
    //   ORDER BY usage_count DESC
    //   LIMIT 10
    // `, {
    //   type: sequelize.QueryTypes.SELECT,
    //   replacements: { userId }
    // });
    
    // 4. Все эмоции для полного списка
    const allEmotions = await Emotion.findAll({
      order: [['display_order', 'ASC']]
    });
    
    // 5. Все варианты сна для полного списка
    const allSleepOptions = await SleepQuality.findAll({
      order: [['display_order', 'ASC']]
    });
    
    res.json({
      success: true,
      data: {
        frequentEmotions,
        frequentSleep,
        popularHashtags,
        allEmotions,
        allSleepOptions
      }
    });
    
  } catch (error) {
    console.error('Ошибка получения фильтров:', error);
    res.status(500).json({
      success: false,
      error: 'Не удалось получить данные фильтров'
    });
  }
}
};

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Поиск и фильтрация записей дневника
 */