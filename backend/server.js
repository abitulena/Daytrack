import 'dotenv/config';
import express from 'express';

import { testConnection } from './models/index.js';

// import { testConnection, User, DiaryEntry, Emotion, SleepQuality } from './models/index.js';
// import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs';

import authRoutes from './routes/auth.js';
import dataRoutes from './routes/data.js';
import diaryRoutes from './routes/diary.js';

const port = 5000;
const app = express()

app.use(express.json())

testConnection();

app.use('/auth', authRoutes);
app.use('/api', dataRoutes);

app.use('/api', diaryRoutes);

app.listen(port, () => {console.log('web on: http://localhost:%s', port)})
