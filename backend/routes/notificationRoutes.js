import express from 'express';
import { notificationController } from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// router.post('/new-entry', notificationController.handleNewEntryNotification);

router.post('/new-entry', (req, res) => {
  const userId = req.user.id;
  notificationController.handleNewEntryNotification(userId)
    .then(result => {
      res.json({ 
        success: true, 
        message: 'Уведомления обработаны',
        data: result 
      });
    })
    .catch(error => {
      console.error('Ошибка:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Не удалось обработать уведомления' 
      });
    });
});

router.get('/reminders', notificationController.getUserReminders);

export default router;