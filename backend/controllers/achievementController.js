//achievementController.js
import { UserAchievement, DiaryEntry, Achievement, sequelize } from '../models/index.js';

export const achievementController = {
  // Основная функция проверки и выдачи достижений
  async checkAndAwardAchievements(userId) {
    try {
      const awards = [];
      
      // 1. Проверяем, есть ли у пользователя первая запись
      const firstEntryCheck = await this.checkFirstEntry(userId);
      if (firstEntryCheck) {
        awards.push(firstEntryCheck);
      }
      
      // 2. Проверяем серии (стрики) записей
      const streakCheck = await this.checkStreakAchievements(userId);
      if (streakCheck && streakCheck.length > 0) {
        awards.push(...streakCheck);
      }
      
      return awards;
      
    } catch (error) {
      console.error('Ошибка при проверке достижений:', error);
      return [];
    }
  },
  
  // Проверка достижения "Первая запись"
  async checkFirstEntry(userId) {
    try {
      // Проверяем, есть ли уже это достижение у пользователя
      const existingAchievement = await UserAchievement.findOne({
        where: { 
          user_id: userId,
          achievement_id: 1 // ID достижения "Первая запись"
        }
      });
      
      if (existingAchievement) {
        return null; // Достижение уже есть
      }
      
      // Проверяем, есть ли у пользователя хотя бы одна запись
      const entryCount = await DiaryEntry.count({
        where: { user_id: userId }
      });
      
      if (entryCount > 0) {
        // Выдаем достижение
        const userAchievement = await UserAchievement.create({
          user_id: userId,
          achievement_id: 1
        });
        
        const achievement = await Achievement.findByPk(1);
        
        return {
          type: 'first_entry',
          achievement_id: 1,
          name: achievement.name,
          message: 'Поздравляем с первой записью в дневнике!'
        };
      }
      
      return null;
      
    } catch (error) {
      console.error('Ошибка при проверке первой записи:', error);
      return null;
    }
  },
  
  // Проверка достижений за серии записей
  async checkStreakAchievements(userId) {
    try {
      const awards = [];
      
      // Получаем все записи пользователя, отсортированные по дате
      const entries = await DiaryEntry.findAll({
        where: { user_id: userId },
        order: [['entry_date', 'ASC']],
        attributes: ['entry_date']
      });
      
      if (entries.length === 0) {
        return [];
      }
      
      // Рассчитываем текущую серию (стрик)
      const currentStreak = this.calculateCurrentStreak(entries);
      
      // Проверяем каждое достижение по серии
      const streakAchievements = [
        { id: 2, days: 5, type: 'streak_5' },
        { id: 3, days: 15, type: 'streak_15' },
        { id: 4, days: 30, type: 'streak_30' }
      ];
      
      for (const streakAchievement of streakAchievements) {
        // Проверяем, есть ли уже это достижение
        const existingAchievement = await UserAchievement.findOne({
          where: { 
            user_id: userId,
            achievement_id: streakAchievement.id
          }
        });
        
        // Если достижение уже есть, пропускаем
        if (existingAchievement) {
          continue;
        }
        
        // Проверяем, достигнута ли нужная серия
        if (currentStreak >= streakAchievement.days) {
          // Выдаем достижение
          await UserAchievement.create({
            user_id: userId,
            achievement_id: streakAchievement.id
          });
          
          const achievement = await Achievement.findByPk(streakAchievement.id);
          
          awards.push({
            type: streakAchievement.type,
            achievement_id: streakAchievement.id,
            name: achievement.name,
            message: `Вы ведете дневник уже ${streakAchievement.days} дней подряд!`
          });
        }
      }
      
      return awards;
      
    } catch (error) {
      console.error('Ошибка при проверке серий достижений:', error);
      return [];
    }
  },
  
  // Рассчет текущей серии (стрика) дней подряд
  calculateCurrentStreak(entries) {
    if (entries.length === 0) return 0;
    
    // Преобразуем даты в timestamp и сортируем по убыванию (от новых к старым)
    const dates = entries.map(e => new Date(e.entry_date).getTime());
    dates.sort((a, b) => b - a); // Сортируем по убыванию
    
    let streak = 0;
    const oneDay = 24 * 60 * 60 * 1000; // миллисекунд в дне
    
    // Начинаем с сегодняшнего дня
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Сбрасываем время
    
    for (let i = 0; i < dates.length; i++) {
      const entryDate = new Date(dates[i]);
      entryDate.setHours(0, 0, 0, 0);
      
      // Проверяем, есть ли запись на нужную дату
      if (this.datesAreConsecutive(entryDate, currentDate, oneDay)) {
        streak++;
        // Переходим к предыдущему дню
        currentDate = new Date(currentDate.getTime() - oneDay);
      } else {
        // Прерываем стрик, если нашли разрыв
        break;
      }
    }
    
    return streak;
  },
  
  // Проверка, идут ли даты подряд
  datesAreConsecutive(date1, date2, oneDay) {
    const diff = Math.abs(date1 - date2);
    return diff <= oneDay;
  },
  
  /**
   * @swagger
   * /api/achievements:
   *   get:
   *     summary: Получить все достижения пользователя
   *     description: |
   *       Возвращает список всех достижений системы с отметкой, какие из них получены пользователем.
   *       - Сортировка по display_order
   *       - Для каждого достижения указано unlocked: true/false
   *       - Показывает общее количество полученных/доступных достижений
   *     tags: [Achievements]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Список достижений пользователя
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 achievements:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                         example: 1
   *                       name:
   *                         type: string
   *                         example: "Первая запись"
   *                       image_filename:
   *                         type: string
   *                         example: "first_entry.png"
   *                       condition_type:
   *                         type: string
   *                         enum: [first_entry, streak_5, streak_15, streak_30]
   *                       display_order:
   *                         type: integer
   *                         example: 1
   *                       unlocked:
   *                         type: boolean
   *                         example: true
   *                       unlocked_at:
   *                         type: string
   *                         format: date-time
   *                         nullable: true
   *                 total_unlocked:
   *                   type: integer
   *                   example: 3
   *                 total_available:
   *                   type: integer
   *                   example: 4
   *       500:
   *         description: Ошибка сервера
   */
  // Получить все достижения пользователя
 async getUserAchievements(req, res) {
  try {
    const userId = req.user.id; 
    
    console.log('getUserAchievements для пользователя:', userId);
    
    // Получаем ВСЕ достижения системы
    const allAchievements = await Achievement.findAll({
      order: [['display_order', 'ASC']]
    });
    
    console.log('Достижений в системе:', allAchievements.length);
    
    // Получаем ID достижений пользователя
    const userAchievements = await UserAchievement.findAll({
      where: { user_id: userId },
      attributes: ['achievement_id', 'unlocked_at']
    });
    
    console.log('Достижений у пользователя:', userAchievements.length);
    
    // Преобразуем в Set для быстрого поиска
    const userAchievementIds = new Set(
      userAchievements.map(ua => ua.achievement_id)
    );
    
    // Формируем ответ
    const achievements = allAchievements.map(achievement => {
      const userAchievement = userAchievements.find(
        ua => ua.achievement_id === achievement.id
      );
      
      return {
        id: achievement.id,
        name: achievement.name,
        image_filename: achievement.image_filename,
        condition_type: achievement.condition_type,
        display_order: achievement.display_order,
        unlocked: userAchievementIds.has(achievement.id),
        unlocked_at: userAchievement ? userAchievement.unlocked_at : null
      };
    });
    
    console.log('Ответ сформирован успешно');
    
    res.json({
      success: true,
      achievements,
      total_unlocked: userAchievements.length,
      total_available: allAchievements.length
    });
    
  } catch (error) {
    console.error('Ошибка при получении достижений:', error);
    console.error('Подробности ошибки:', error.message);
    res.status(500).json({
      success: false,
      error: 'Не удалось получить достижения',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
},
  
  /**
   * @swagger
   * /api/achievements/{achievementId}:
   *   get:
   *     summary: Получить конкретное достижение пользователя
   *     description: Возвращает детальную информацию о конкретном достижении пользователя.
   *     tags: [Achievements]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: achievementId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID достижения
   *     responses:
   *       200:
   *         description: Информация о достижении
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 achievement:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                     name:
   *                       type: string
   *                     image_filename:
   *                       type: string
   *                     condition_type:
   *                       type: string
   *                     display_order:
   *                       type: integer
   *                     unlocked_at:
   *                       type: string
   *                       format: date-time
   *       404:
   *         description: Достижение не найдено у пользователя
   *       500:
   *         description: Ошибка сервера
   */
  // Получить конкретное достижение пользователя
  async getAchievement(req, res) {
    try {
      const userId = req.user.id;
      const { achievementId } = req.params;
      
      const userAchievement = await UserAchievement.findOne({
        where: { 
          user_id: userId,
          achievement_id: achievementId 
        },
        include: [{
          model: Achievement,
          attributes: ['id', 'name', 'image_filename', 'condition_type', 'display_order']
        }]
      });
      
      if (!userAchievement) {
        return res.status(404).json({
          success: false,
          error: 'Достижение не найдено'
        });
      }
      
      res.json({
        success: true,
        achievement: {
          id: userAchievement.Achievement.id,
          name: userAchievement.Achievement.name,
          image_filename: userAchievement.Achievement.image_filename,
          condition_type: userAchievement.Achievement.condition_type,
          display_order: userAchievement.Achievement.display_order,
          unlocked_at: userAchievement.unlocked_at
        }
      });
      
    } catch (error) {
      console.error('Ошибка при получении достижения:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось получить достижение'
      });
    }
  },
  
  /**
   * @swagger
   * /api/achievements/stats/progress:
   *   get:
   *     summary: Получить статистику и прогресс пользователя
   *     description: |
   *       Возвращает статистику пользователя для отслеживания прогресса к достижениям.
   *       - Общее количество записей
   *       - Текущая серия дней подряд (стрик)
   *       - Следующая цель по стрику
   *       - Прогресс в процентах до следующего достижения
   *     tags: [Achievements]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Статистика и прогресс пользователя
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 stats:
   *                   type: object
   *                   properties:
   *                     total_entries:
   *                       type: integer
   *                       example: 12
   *                     current_streak:
   *                       type: integer
   *                       example: 5
   *                     first_entry_date:
   *                       type: string
   *                       format: date
   *                       nullable: true
   *                     next_goal:
   *                       type: object
   *                       nullable: true
   *                       properties:
   *                         days_needed:
   *                           type: integer
   *                         total_days:
   *                           type: integer
   *                         achievement_id:
   *                           type: integer
   *                         progress_percentage:
   *                           type: integer
   *                     max_streak_possible:
   *                       type: integer
   *                       example: 30
   *       500:
   *         description: Ошибка сервера
   */
  // Получить статистику пользователя для прогресса
  async getUserStats(req, res) {
    try {
      const userId = req.user.id;
      
      // Общее количество записей
      const totalEntries = await DiaryEntry.count({
        where: { user_id: userId }
      });
      
      // Дата первой записи
      const firstEntry = await DiaryEntry.findOne({
        where: { user_id: userId },
        order: [['entry_date', 'ASC']],
        attributes: ['entry_date']
      });
      
      // Текущий стрик
      const entries = await DiaryEntry.findAll({
        where: { user_id: userId },
        order: [['entry_date', 'ASC']],
        attributes: ['entry_date']
      });
      
      const currentStreak = achievementController.calculateCurrentStreak(entries);
      
      // Следующее достижение по стрику
      let nextStreakGoal = null;
      if (currentStreak < 5) {
        nextStreakGoal = { days: 5, achievement_id: 2 };
      } else if (currentStreak < 15) {
        nextStreakGoal = { days: 15, achievement_id: 3 };
      } else if (currentStreak < 30) {
        nextStreakGoal = { days: 30, achievement_id: 4 };
      }
      
      // Процент выполнения для следующей цели
      let progressPercentage = 0;
      if (nextStreakGoal) {
        progressPercentage = Math.min(100, Math.round((currentStreak / nextStreakGoal.days) * 100));
      }
      
      res.json({
        success: true,
        stats: {
          total_entries: totalEntries,
          current_streak: currentStreak,
          first_entry_date: firstEntry ? firstEntry.entry_date : null,
          next_goal: nextStreakGoal ? {
            days_needed: nextStreakGoal.days - currentStreak,
            total_days: nextStreakGoal.days,
            achievement_id: nextStreakGoal.achievement_id,
            progress_percentage: progressPercentage
          } : null,
          max_streak_possible: 30 
        }
      });
      
    } catch (error) {
      console.error('Ошибка при получении статистики:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось получить статистику'
      });
    }
  }
};

/**
 * @swagger
 * components:
 *   schemas:
 *     AchievementCondition:
 *       type: string
 *       enum: [first_entry, streak_5, streak_15, streak_30]
 *       description: |
 *         Тип условия для получения достижения:
 *         - first_entry - первая запись в дневнике
 *         - streak_5 - 5 дней подряд
 *         - streak_15 - 15 дней подряд
 *         - streak_30 - 30 дней подряд
 */

/**
 * @swagger
 * tags:
 *   name: Achievements
 *   description: Управление достижениями пользователя
 */

export async function checkAchievementsAfterEntry(userId) {
  try {
    const awards = await achievementController.checkAndAwardAchievements(userId);
    
    if (awards.length > 0) {
      console.log(`Пользователь ${userId} получил достижения:`, awards);
    }
    
    return awards;
  } catch (error) {
    console.error('Ошибка в middleware проверки достижений:', error);
    return [];
  }
}