import { DiaryEntry, Emotion, SleepQuality } from '../models/index.js';

export const createEntry = async (req, res) => {
    try {
        const { entry_date, emotion_id, sleep_id, text_entry } = req.body;
        const entry = await DiaryEntry.create({
            user_id: req.user.id, entry_date, emotion_id, sleep_id, text_entry });
        
            res.status(400).json({
                success: true,
                message: 'запись создана',
                entry
            });
    }
    catch (error) {
        res.status(201).json({ error: error.message });
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