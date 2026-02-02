import 'dotenv/config';
import express from 'express';

import cookieParser from 'cookie-parser'; 
import cors from 'cors';
import path from 'path';
import fs from 'fs';

import { testConnection } from './models/index.js';

// import { testConnection, User, DiaryEntry, Emotion, SleepQuality } from './models/index.js';
// import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs';

import authRoutes from './routes/auth.js';
import dataRoutes from './routes/data.js';
import diaryRoutes from './routes/diary.js';

import photoRoutes from './routes/photo.js';
import searchRoutes from './routes/search.js';
import hashtagRoutes from './routes/hashtags.js';
import achievementRoutes from './routes/achievement.js';
import notificationRoutes from './routes/notificationRoutes.js';


const port = process.env.PORT || 5000;
const app = express()

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://frontend:5173'], 
  credentials: true
}));
app.use(cookieParser()); 
app.use(express.json());

app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

// Подключение к БД
testConnection();

// Маршруты
app.use('/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/diary', diaryRoutes);

app.use('/api/hashtags', hashtagRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/search', searchRoutes);

app.use('/api/achievements', achievementRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'API работает' });
});

app.listen(port, '0.0.0.0', () => {
  console.log('web on: http://localhost:%s', port)
})
