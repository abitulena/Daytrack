/**
 * Контроллер для работы с дневниковыми записями
 * Основная бизнес-логика записей дневника
 */
import { DiaryEntry, Emotion, SleepQuality, Hashtag, EntryHashtag, GalleryPhoto } from '../models/index.js';

//  Вспомогательные функции для валидации
const validationUtils = {
  // Проверка что значение - целое положительное число
  isValidId(id) {
    return Number.isInteger(id) && id > 0;
  },

  // Проверка текста
  isValidText(text, maxLength = 10000) {
    if (typeof text !== 'string') return false;
    const trimmedText = text.trim();
    return trimmedText.length > 0 && trimmedText.length <= maxLength;
  },


  // Получить сегодняшнюю дату в формате YYYY-MM-DD
  getTodayDate() {
    return new Date().toISOString().split('T')[0];
  }
};

const diaryController = {
  /**
   *  ПОЛУЧИТЬ ВСЕ ЗАПИСИ пользователя
   * GET /api/diary
   * Используется для: истории, статистики, календаря
   */
  async getAllEntries(req, res) {
    try {
      const userId = req.user?.id;
      
      // Валидация: проверка авторизации
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Пользователь не авторизован'
        });
      }

      //  Получаем все записи пользователя из базы
      const entries = await DiaryEntry.findAll({
        where: { user_id: userId },
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
            through: { attributes: [] }, // Исключаем данные промежуточной таблицы
            attributes: ['id', 'tag_name', 'color']
          },
          {
            model: GalleryPhoto,
            attributes: ['id', 'image_path', 'image_name']
          }
        ],
        order: [['entry_date', 'DESC']] //  Сначала новые даты
      });

      //  Успешный ответ
      res.json({
        success: true,
        data: entries,
        meta: {
          total: entries.length,
          date_range: entries.length > 0 ? {
            oldest: entries[entries.length - 1]?.entry_date,
            newest: entries[0]?.entry_date
          } : null
        }
      });

    } catch (error) {
      console.error('Ошибка при получении всех записей:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось получить записи дневника'
      });
    }
  },

  /**
   *  ПОЛУЧИТЬ ЗАПИСЬ НА СЕГОДНЯ
   * GET /api/diary/today
   * Используется для: главной страницы (форма сегодняшней записи)
   */
  async getTodayEntry(req, res) {
    try {
      const userId = req.user?.id;
      
      //  проверка авторизации
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Пользователь не авторизован'
        });
      }

      const today = validationUtils.getTodayDate();

      //  Ищем запись на сегодня
      const entry = await DiaryEntry.findOne({
        where: { 
          user_id: userId,
          entry_date: today
        },
        include: [
          { model: Emotion, attributes: ['id', 'name', 'image_url'] },
          { model: SleepQuality, attributes: ['id', 'name', 'image_url'] },
          { 
            model: Hashtag,
            through: { attributes: [] },
            attributes: ['id', 'tag_name', 'color']
          },
          {
            model: GalleryPhoto,
            attributes: ['id', 'image_path', 'image_name']
          }
        ]
      });

      // Успешный ответ (даже если записи нет - это нормально)
      res.json({
        success: true,
        data: entry, // будет null если записи нет
        message: entry ? 'Запись на сегодня найдена' : 'Запись на сегодня не найдена'
      });

    } catch (error) {
      console.error(' Ошибка при получении сегодняшней записи:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось получить запись на сегодня'
      });
    }
  },

  /**
   * ПОЛУЧИТЬ ЗАПИСЬ ПО КОНКРЕТНОЙ ДАТЕ
   * GET /api/diary/date/:date
   * Используется для: календаря (просмотр записи за выбранную дату)
   */
  async getEntryByDate(req, res) {
    try {
      const userId = req.user?.id;
      const { date } = req.params;

      // Валидация: проверка авторизации
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Пользователь не авторизован'
        });
      }

      //  Ищем запись по дате
      const entry = await DiaryEntry.findOne({
        where: { 
          user_id: userId,
          entry_date: date
        },
        include: [
          { model: Emotion, attributes: ['id', 'name', 'image_url'] },
          { model: SleepQuality, attributes: ['id', 'name', 'image_url'] },
          { 
            model: Hashtag,
            through: { attributes: [] },
            attributes: ['id', 'tag_name', 'color']
          },
          {
            model: GalleryPhoto,
            attributes: ['id', 'image_path', 'image_name']
          }
        ]
      });

      // Если записи нет - возвращаем ошибку 404
      if (!entry) {
        return res.status(404).json({
          success: false,
          error: 'Запись на указанную дату не найдена',
          data: null
        });
      }

      //  Успешный ответ
      res.json({
        success: true,
        data: entry
      });

    } catch (error) {
      console.error(' Ошибка при получении записи по дате:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось получить запись'
      });
    }
  },

  /**
   * СОХРАНИТЬ ЗАПИСЬ НА СЕГОДНЯ
   * POST /api/diary
   * Используется для: сохранения данных с главной страницы
   */
  async saveTodayEntry(req, res) {
    try {
      const userId = req.user?.id;
      const { emotion_id, sleep_id, text_entry, hashtags = [] } = req.body;

      // ВАЛИДАЦИЯ 1: Проверка авторизации
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Пользователь не авторизован'
        });
      }

      //  ВАЛИДАЦИЯ: Проверка text_entry (если передан)
      if (text_entry !== undefined && text_entry !== null) {
        if (!validationUtils.isValidText(text_entry)) {
          return res.status(400).json({
            success: false,
            error: 'Текст записи не должен быть пустым и не должен превышать 10000 символов'
          });
        }
      }

      

      const today = validationUtils.getTodayDate();

      //  Находим или создаем запись на сегодня
      const [entry, created] = await DiaryEntry.findOrCreate({
        where: { 
          user_id: userId,
          entry_date: today
        },
        defaults: {
          user_id: userId,
          entry_date: today,
          emotion_id: emotion_id || null,
          sleep_id: sleep_id || null,
          text_entry: text_entry || null
        }
      });

      // Если запись уже существовала - обновляем ее
      if (!created) {
        await entry.update({
          emotion_id: emotion_id !== undefined ? emotion_id : entry.emotion_id,
          sleep_id: sleep_id !== undefined ? sleep_id : entry.sleep_id,
          text_entry: text_entry !== undefined ? text_entry : entry.text_entry
        });
      }

      // Обрабатываем хештеги (если они есть)
      if (hashtags.length > 0) {
        // Удаляем старые связи с хештегами
        await EntryHashtag.destroy({ where: { entry_id: entry.id } });
        
        // Создаем новые связи
        for (const hashtagId of hashtags) {
          await EntryHashtag.findOrCreate({
            where: {
              entry_id: entry.id,
              hashtag_id: hashtagId
            }
          });
        }
      }

      //  Получаем полную запись со всеми связями
      const fullEntry = await DiaryEntry.findByPk(entry.id, {
        include: [
          { model: Emotion, attributes: ['id', 'name', 'image_url'] },
          { model: SleepQuality, attributes: ['id', 'name', 'image_url'] },
          { 
            model: Hashtag,
            through: { attributes: [] },
            attributes: ['id', 'tag_name', 'color']
          },
          {
            model: GalleryPhoto,
            attributes: ['id', 'image_path', 'image_name']
          }
        ]
      });

      // Успешный ответ
      res.json({
        success: true,
        message: created ? 'Запись на сегодня создана' : 'Запись на сегодня обновлена',
        data: fullEntry
      });

    } catch (error) {
      console.error('Ошибка при сохранении записи:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось сохранить запись'
      });
    }
  },

  /**
   * УДАЛИТЬ ЗАПИСЬ
   * DELETE /api/diary/:id
   * Используется для: удаления записей из истории
   */
  async deleteEntry(req, res) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      // Валидация: проверка авторизации
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Пользователь не авторизован'
        });
      }

      // Валидация: проверка ID записи
      if (!validationUtils.isValidId(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: 'Неверный ID записи'
        });
      }

      //  Находим запись и проверяем права доступа
      const entry = await DiaryEntry.findOne({
        where: { id: parseInt(id), user_id: userId }
      });

      // Если запись не найдена или не принадлежит пользователю
      if (!entry) {
        return res.status(404).json({
          success: false,
          error: 'Запись не найдена или у вас нет прав для ее удаления'
        });
      }

      //  Удаляем запись (каскадно удалятся связанные хештеги и фото)
      await entry.destroy();

      // Успешный ответ
      res.json({
        success: true,
        message: 'Запись успешно удалена'
      });

    } catch (error) {
      console.error(' Ошибка при удалении записи:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось удалить запись'
      });
    }
  }
};

export { diaryController };