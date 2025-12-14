// middlewares/achievementMiddleware.js
import { checkAchievementsAfterEntry } from '../controllers/achievementController.js';

export const achievementMiddleware = async (req, res, next) => {
  // Сохраняем оригинальный метод json
  const originalJson = res.json;
  
  res.json = function(data) {
    // Если запись создана успешно, проверяем достижения
    if (req.method === 'POST' && 
        req.originalUrl.includes('/api/entries') && 
        data.success) {
      
      // Асинхронно проверяем достижения (не блокируем ответ)
      setTimeout(async () => {
        try {
          const awards = await checkAchievementsAfterEntry(req.user.id);
          if (awards.length > 0) {
            console.log(`Выданы достижения пользователю ${req.user.id}:`, awards);
          }
        } catch (error) {
          console.error('Ошибка в middleware достижений:', error);
        }
      }, 0);
    }
    
    // Вызываем оригинальный метод
    return originalJson.call(this, data);
  };
  
  next();
};