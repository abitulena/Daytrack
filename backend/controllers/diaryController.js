import { Op } from 'sequelize';
import { notificationController } from './notificationController.js';

import { DiaryEntry, Emotion, SleepQuality } from '../models/index.js';

export const createEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const { entry_date, emotion_id, sleep_id, text_entry } = req.body;
    
    // есть ли уже запись на эту дату
    const existingEntry = await DiaryEntry.findOne({
      where: { user_id: userId, entry_date }
    });
    
    if (existingEntry) {
      return res.status(400).json({ 
        success: false, 
        error: 'На эту дату уже есть запись' 
      });
    }
    
  
    const newEntry = await DiaryEntry.create({
      user_id: userId,
      entry_date,
      emotion_id,
      sleep_id,
      text_entry
    });
    
    // 3. ВЫЗЫВАЕМ ПРОВЕРКУ УВЕДОМЛЕНИЙ В ФОНЕ (БЕЗ ПЕРЕДАЧИ res)
    // Создаем копию объекта запроса для фоновой задачи
    process.nextTick(() => {
      notificationController.handleNewEntryNotification(userId)
        .catch(error => console.error('Фоновая ошибка уведомлений:', error));
    });
    
    // 4. ОТВЕЧАЕМ ПОЛЬЗОВАТЕЛЮ СРАЗУ
    res.status(201).json({
      success: true,
      message: 'Запись создана',
      data: newEntry
    });
    
  } catch (error) {
    console.error('Ошибка создания записи:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Не удалось создать запись' 
    });
  }
};

export const getUserEntries = async (req, res) => {
    try {
        const { entry_date } = req.query;
        const whereClause = { user_id: req.user.id };
        
        if (entry_date) {
            whereClause.entry_date = entry_date;
        }
        
        const entries = await DiaryEntry.findAll({
            where: whereClause,
            include: [
                { model: Emotion, attributes: ['name'] },
                { model: SleepQuality, attributes: ['name'] }
            ],
            order: [['entry_date', 'DESC']]
        });
        res.json(entries);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateEntry = async (req, res) => {
  try {
    console.log('=== UPDATE ENTRY START ===');
    console.log('Params id:', req.params.id, 'Type:', typeof req.params.id);
    console.log('User id:', req.user.id, 'Type:', typeof req.user.id);
    console.log('Body:', req.body);
    
    const { id } = req.params;
    const { entry_date, emotion_id, sleep_id, text_entry } = req.body;
    
    // Добавим явное преобразование к числу
    const entryId = parseInt(id);
    console.log('Parsed entryId:', entryId);
    
    const entry = await DiaryEntry.findOne({
      where: { 
        id: entryId,  // используем преобразованный ID
        user_id: req.user.id 
      }
    });
    
    console.log('Found entry:', entry ? `ID: ${entry.id}, User: ${entry.user_id}` : 'NOT FOUND');
    
    if (!entry) {
      console.log('Entry not found for user');
      return res.status(404).json({ 
        success: false,
        error: 'запись не найдена' 
      });
    }
    
    await entry.update({
      entry_date: entry_date || entry.entry_date,
      emotion_id: emotion_id || entry.emotion_id,
      sleep_id: sleep_id || entry.sleep_id,
      text_entry: text_entry || entry.text_entry,
      updated_at: new Date()
    });
    
    console.log('=== UPDATE ENTRY SUCCESS ===');
    
    res.json({
      success: true,
      message: 'запись обновлена',
      entry
    });
  } catch (error) {
    console.error('=== UPDATE ENTRY ERROR ===', error);
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

// export const updateEntry = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { entry_date, emotion_id, sleep_id, text_entry } = req.body;
    
//     const entry = await DiaryEntry.findOne({
//       where: { id, user_id: req.user.id }
//     });
    
//     if (!entry) {
//       return res.status(404).json({ error: 'запись не найдена' });
//     }
    
//     await entry.update({
//       entry_date: entry_date || entry.entry_date,
//       emotion_id: emotion_id || entry.emotion_id,
//       sleep_id: sleep_id || entry.sleep_id,
//       text_entry: text_entry || entry.text_entry,
//       updated_at: new Date()
//     });
    
//     res.json({
//       success: true,
//       message: 'запись обновлена',
//       entry
//     });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

export const deleteEntry = async (req, res) => {
  try {
    const { id } = req.params;
    
    const entry = await DiaryEntry.findOne({
      where: { id, user_id: req.user.id }
    });
    
    if (!entry) {
      return res.status(404).json({ error: 'запись не найдена' });
    }
    
    await entry.destroy();
    
    res.json({
      success: true,
      message: 'запись удалена'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEntryById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const entry = await DiaryEntry.findOne({
      where: { 
        id: id,
        user_id: userId 
      },
      include: [
        { model: Emotion, attributes: ['id', 'name'] },
        { model: SleepQuality, attributes: ['id', 'name'] }
      ]
    });
    
    if (!entry) {
      return res.status(404).json({ 
        success: false,
        error: 'Запись не найдена' 
      });
    }
    
    res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    console.error('Ошибка при получении записи:', error);
    res.status(500).json({ 
      success: false,
      error: 'Не удалось получить запись' 
    });
  }
};

export const getStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;
    
    const whereClause = { user_id: userId };
    
    if (startDate && endDate) {
      whereClause.entry_date = {
        [Op.between]: [startDate, endDate]
      };
    }
    
    const entries = await DiaryEntry.findAll({
      where: whereClause,
      include: [
        { model: Emotion },
        { model: SleepQuality }
      ]
    });
    
    // Статистика по настроениям
    const moodStats = {};
    entries.forEach(entry => {
      if (entry.Emotion) {
        const moodName = entry.Emotion.name;
        moodStats[moodName] = (moodStats[moodName] || 0) + 1;
      }
    });
    
    // Статистика по сну
    const sleepStats = {};
    entries.forEach(entry => {
      if (entry.SleepQuality) {
        const sleepName = entry.SleepQuality.name;
        sleepStats[sleepName] = (sleepStats[sleepName] || 0) + 1;
      }
    });
    
    res.json({
      success: true,
      stats: {
        totalEntries: entries.length,
        moodStats,
        sleepStats,
        period: { startDate, endDate }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};