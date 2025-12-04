import { Hashtag } from '../models/index.js';
import { Op } from 'sequelize';

export const hashtagController = {

  //получить все хештеги
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

  //создать хештег
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
      
      const exists = await Hashtag.findOne({ 
        where: { tag_name: cleanTag } 
      });
      
      if (exists) {
        return res.status(400).json({
          success: false,
          error: 'Такой хештег уже существует'
        });
      }
      
      const hashtag = await Hashtag.create({
        tag_name: cleanTag,
        is_custom: true  
      });
      
      res.json({
        success: true,
        message: 'Хештег создан',
        hashtag
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Не удалось создать хештег'
      });
    }
  },

  //удалить хештег
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
      
      // Проверяем, можно ли удалить
      // Можно удалять только свои хештеги (is_custom = true)
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

  // поиск хештегов
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