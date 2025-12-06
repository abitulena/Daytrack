import { Op } from 'sequelize';

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { User, RefreshToken } from '../models/index.js';

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { 
      id: user.id, 
      login: user.login,
      email: user.email 
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' } // Access Token живет 15 минут
  );

  const refreshToken = jwt.sign(
    { 
      id: user.id,
      tokenVersion: user.tokenVersion || 0 
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' } // Refresh Token живет 7 дней
  );

  return { accessToken, refreshToken };
};

// Сохранение Refresh Token в базу данных
const saveRefreshToken = async (userId, refreshToken) => {
  try {
    // Удаляем старые токены пользователя (опционально, можно ограничить количество)
    await RefreshToken.destroy({
      where: { user_id: userId }
    });

    // Сохраняем новый токен
    return await RefreshToken.create({
      user_id: userId,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 дней
    });
  } catch (error) {
    console.error('Ошибка сохранения refresh token:', error);
    throw error;
  }
};

// Регистрация
export const register = async (req, res) => {
  try {
    const { login, birth_date, email, password, gender } = req.body;

    if (!login || !email || !password) {
      return res.status(400).json({ error: 'Заполните все обязательные поля' });
    }

    // Проверка существующего пользователя
    const existingUser = await User.findOne({
      where: { 
        [Op.or]: [{ login }, { email }] 
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'Пользователь с таким логином или email уже существует' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ 
      login, 
      birth_date, 
      email, 
      password_hash: hashedPassword, 
      gender,
      tokenVersion: 0 // Версия токена для инвалидации
    });

    // Генерация токенов
    const { accessToken, refreshToken } = generateTokens(user);
    
    // Сохраняем Refresh Token
    await saveRefreshToken(user.id, refreshToken);

    // Устанавливаем Refresh Token в HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS в production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
    });

    res.status(201).json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        login: user.login,
        email: user.email,
        birth_date: user.birth_date,
        gender: user.gender
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Вход
export const login = async (req, res) => {
  try {
    const { login, password } = req.body;

    const user = await User.findOne({ where: { login } });

    if (!user) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    // Генерация токенов
    const { accessToken, refreshToken } = generateTokens(user);
    
    // Сохраняем Refresh Token
    await saveRefreshToken(user.id, refreshToken);

    // Устанавливаем Refresh Token в HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        login: user.login,
        email: user.email,
        birth_date: user.birth_date,
        gender: user.gender
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Обновление Access Token
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token отсутствует' });
    }

    // Проверяем токен в базе данных
    const storedToken = await RefreshToken.findOne({
      where: { token: refreshToken },
      include: [{ model: User }]
    });

    if (!storedToken) {
      return res.status(403).json({ error: 'Недействительный refresh token' });
    }

    // Проверяем срок действия
    if (new Date() > storedToken.expires_at) {
      await storedToken.destroy();
      return res.status(403).json({ error: 'Refresh token истек' });
    }

    // Верифицируем токен
    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
      await storedToken.destroy();
      return res.status(403).json({ error: 'Недействительный refresh token' });
    }

    // Проверяем версию токена (для инвалидации при смене пароля)
    const user = storedToken.User;
    if (user.tokenVersion !== payload.tokenVersion) {
      // Удаляем все токены пользователя
      await RefreshToken.destroy({ where: { user_id: user.id } });
      return res.status(403).json({ error: 'Токен устарел' });
    }

    // Генерируем новую пару токенов
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user);
    
    // Обновляем Refresh Token в базе
    await storedToken.update({
      token: newRefreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    // Устанавливаем новый Refresh Token в cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      accessToken: newAccessToken
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Выход (логаут)
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (refreshToken) {
      // Удаляем токен из базы данных
      await RefreshToken.destroy({ where: { token: refreshToken } });
    }

    // Очищаем cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({
      success: true,
      message: 'Выход выполнен успешно'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Получение информации о текущем пользователе
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// //регистрация
// export const register = async (req,res) => {
//     try{
//         const { login, birth_date, email, password, gender } = req.body;

//         if (!login || !email || !password) {
//             return res.status(400).json({ error: 'заполните все поля' });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);

//         const user = await User.create({ login, birth_date, email, password_hash: hashedPassword, gender });
//         res.status(201).json({ success: true, 
//             user: { 
//             id: user.id, 
//             login: user.login, 
//             email: user.email }  
//         });
//     }  
//     catch (error) {
//         res.status(400).json({ error: error.message });
//   }
    
// };

// //вход
// export const login = async (req,res) => {
//     try{
//         const { login, password } = req.body;

//         const user = await User.findOne({where: {login}});

//         if (!user) {
//             return res.status(401).json({ error: 'неверный логин или пароль' });
//         }

//         const isValidPassword = await bcrypt.compare(password, user.password_hash);
//         if (!isValidPassword) {
//           return res.status(401).json({ error: 'неверный логин или пароль' });
//         }

//         const token = jwt.sign({ id: user.id, login: user.login },
//             process.env.TOKEN_SECRET, 
//       { expiresIn: '24h' }
//     );
//         res.json({ success: true, token: token, user: { id: user.id, login: user.login, email: user.email } });
//     } catch (error) {
//     res.status(500).json({ error: error.message });
//   }  
// };