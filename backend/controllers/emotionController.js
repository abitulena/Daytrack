import { Emotion, SleepQuality } from '../models/index.js';

//получение эмоции
export const getEmotions = async(req, res) => {
  try {
    const emotions = await Emotion.findAll();
    res.json(emotions);
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//получение сон
export const getSleepQualities = async (req, res) => {
  try{
    const sleepQualities = await SleepQuality.findAll();
    res.json(sleepQualities);
  }
  catch (error) {
    res.status(500).json( {error: error.message });
  }
};
