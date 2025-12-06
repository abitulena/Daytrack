import { Op } from 'sequelize';

import { DiaryEntry, Emotion, SleepQuality } from '../models/index.js';

export const createEntry = async (req, res) => {
    try {
        const { entry_date, emotion_id, sleep_id, text_entry } = req.body;
        const entry = await DiaryEntry.create({
            user_id: req.user.id, entry_date, emotion_id, sleep_id, text_entry });
        
            res.status(201).json({
                success: true,
                message: 'запись создана',
                entry
            });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getUserEntries = async (req, res) => {
    try {
        const entries = await DiaryEntry.findAll({
            where: { user_id: req.user.id },
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
    const { id } = req.params;
    const { entry_date, emotion_id, sleep_id, text_entry } = req.body;
    
    const entry = await DiaryEntry.findOne({
      where: { id, user_id: req.user.id }
    });
    
    if (!entry) {
      return res.status(404).json({ error: 'запись не найдена' });
    }
    
    await entry.update({
      entry_date: entry_date || entry.entry_date,
      emotion_id: emotion_id || entry.emotion_id,
      sleep_id: sleep_id || entry.sleep_id,
      text_entry: text_entry || entry.text_entry,
      updated_at: new Date()
    });
    
    res.json({
      success: true,
      message: 'запись обновлена',
      entry
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

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
