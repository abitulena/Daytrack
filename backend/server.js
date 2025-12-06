import 'dotenv/config';
import express from 'express';

import cookieParser from 'cookie-parser'; 
import cors from 'cors';

import { testConnection } from './models/index.js';

import authRoutes from './routes/auth.js';
import dataRoutes from './routes/data.js';
import diaryRoutes from './routes/diary.js';

const port = process.env.PORT || 5000;
const app = express()

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // или ваш фронтенд
  credentials: true
}));
app.use(cookieParser()); 
app.use(express.json());

// Подключение к БД
testConnection();

// Маршруты
app.use('/auth', authRoutes);
app.use('/api', dataRoutes);
app.use('/api', diaryRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'API работает' });
});

app.listen(port, () => {console.log('web on: http://localhost:%s', port)})

