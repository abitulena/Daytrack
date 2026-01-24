import { Op } from 'sequelize';
import { User, DiaryEntry, Event, sequelize } from '../models/index.js';
import { achievementController } from './achievementController.js';

export const notificationController = {
    /**
     * @swagger
     * /api/notifications/new-entry:
     *   post:
     *     summary: Обработка уведомлений после создания новой записи
     *     description: |
     *       Вызывается после создания записи дневника.
     *       1. Проверяет и выдаёт достижения пользователю.
     *       2. Создаёт напоминание-событие о продолжении серии, если стрик под угрозой.
     *       3. Возвращает полученные достижения и сводку.
     *     tags: [Notifications]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Уведомления обработаны успешно.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                 awards:
     *                   type: array
     *                   description: Массив полученных достижений
     *                   items:
     *                     type: object
     *                     properties:
     *                       type:
     *                         type: string
     *                       achievement_id:
     *                         type: integer
     *                       name:
     *                         type: string
     *                       message:
     *                         type: string
     *                 reminder:
     *                   type: object
     *                   nullable: true
     *                   description: Напоминание о серии
     *                   properties:
     *                     type:
     *                       type: string
     *                       example: "streak_alert"
     *                     message:
     *                       type: string
     *                     streak_days:
     *                       type: integer
     *       500:
     *         description: Внутренняя ошибка сервера.
     */

async handleNewEntryNotification(userId) { 
  try {
    // ФИКС: Преобразуем userId в число в любом случае
    const userIdNum = parseInt(userId);
    
    if (isNaN(userIdNum)) {
      console.error('Неверный userId, не могу преобразовать в число:', userId);
      return { awards: [], reminder: null };
    }
    
    console.log(' Обработка уведомлений для user_id:', userIdNum);
    
    // 1. Проверяем и выдаём достижения 
    const awards = await achievementController.checkAndAwardAchievements(userIdNum);
    
    // 2. Проверяем серию записей и создаём напоминание
    const reminder = await notificationController._checkStreakAndCreateReminder(userIdNum);
    
    // 3. Логируем результат 
    console.log(`Пользователь ${userIdNum} получил достижения:`, awards.length);
    
    return { awards, reminder };
    
  } catch (error) {
    console.error('Ошибка обработки уведомлений:', error);
    throw error; 
  }
},

    /**
     * @swagger
     * /api/notifications/reminders:
     *   get:
     *     summary: Получить активные напоминания для пользователя
     *     description: Возвращает список активных напоминаний (например, о необходимости сделать запись сегодня).
     *     tags: [Notifications]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Список напоминаний.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 reminders:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       id:
     *                         type: integer
     *                       type:
     *                         type: string
     *                       user_id:
     *                         type: integer
     *                       message:
     *                         type: string
     *                       created_at:
     *                         type: string
     *                         format: date-time
     *       500:
     *         description: Внутренняя ошибка сервера.
     */

async getUserReminders(req, res) {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0];
        
        const reminders = [];
        
        // 1. Проверяем, сделана ли сегодня запись
        const todaysEntry = await DiaryEntry.findOne({
            where: { user_id: userId, entry_date: today }
        });
        
        // 2. Если записи на сегодня нет
        if (!todaysEntry) {
            // Получаем последние записи для проверки стрика
            const recentEntries = await DiaryEntry.findAll({
                where: { user_id: userId },
                order: [['entry_date', 'DESC']],
                limit: 7
            });
            
            // Если есть хотя бы одна запись в последние 7 дней
            if (recentEntries.length > 0) {
                const lastEntryDate = new Date(recentEntries[0].entry_date);
                const todayDate = new Date(today);
                const daysDiff = Math.floor((todayDate - lastEntryDate) / (1000 * 60 * 60 * 24));
                
                if (daysDiff === 1) {
                    // Вчера была запись - есть стрик
                    reminders.push({
                        id: 0,
                        type: 'streak_warning',
                        message: `У вас активная серия из ${recentEntries.length} дней! Сделайте запись сегодня, чтобы продолжить.`,
                        created_at: new Date().toISOString(),
                        streak_days: recentEntries.length
                    });
                } else {
                    // Нет стрика
                    reminders.push({
                        id: 0,
                        type: 'daily_reminder',
                        message: 'Не забудьте сделать запись в дневнике сегодня!',
                        created_at: new Date().toISOString()
                    });
                }
            } else {
                // Вообще нет записей
                reminders.push({
                    id: 0,
                    type: 'first_entry',
                    message: 'Сделайте свою первую запись в дневнике!',
                    created_at: new Date().toISOString()
                });
            }
        }
        
        // 3. Получаем события из таблицы events (если таблица существует)
        try {
            const events = await Event.findAll({
                where: { user_id: userId },
                order: [['event_date', 'ASC']],
                limit: 5
            });
            
            events.forEach(event => {
                reminders.push({
                    id: event.id,
                    type: 'event',
                    message: event.description,
                    event_date: event.event_date,
                    created_at: event.created_at
                });
            });
        } catch (eventError) {
            console.log('Таблица events недоступна:', eventError.message);
            // Игнорируем ошибку - возможно таблицы нет
        }
        
        res.json({
            success: true,
            reminders,
            total: reminders.length
        });
        
    } catch (error) {
        console.error('Ошибка получения напоминаний:', error);
        res.status(500).json({
            success: false,
            error: 'Не удалось получить напоминания'
        });
    }
},

    /** Внутренний метод: проверяет серию записей и создаёт напоминание-событие */
    async _checkStreakAndCreateReminder(userId) {
        try {
            const userEntries = await DiaryEntry.findAll({
                where: { user_id: userId },
                order: [['entry_date', 'DESC']],
                limit: 5
            });

            // если записей меньше 3, создаём напоминание
            if (userEntries.length < 3) {
                const existingReminder = await Event.findOne({
                    where: {
                        user_id: userId,
                        description: { [sequelize.Op.like]: '%сери%' }
                    }
                });

                if (!existingReminder) {
                    await Event.create({
                        user_id: userId,
                        event_date: new Date(),
                        description: `Сделайте ещё ${3 - userEntries.length} записей, чтобы начать серию и получить первое достижение!`
                    });
                }

                return {
                    type: 'streak_alert',
                    message: `У вас ${userEntries.length} записей. Начните серию!`,
                    streak_days: userEntries.length
                };
            }
            return null;
        } catch (error) {
            console.error('Ошибка при проверке серии:', error);
            return null;
        }
    }
};