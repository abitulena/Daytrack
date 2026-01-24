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
    { expiresIn: '15m' } 
  );

  const refreshToken = jwt.sign(
    { 
      id: user.id,
      tokenVersion: user.tokenVersion || 0 
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' } 
  );

  return { accessToken, refreshToken };
};

const saveRefreshToken = async (userId, refreshToken) => {
  try {
   
    await RefreshToken.destroy({
      where: { user_id: userId }
    });


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


export const register = async (req, res) => {
  try {
    const { login, birth_date, email, password, gender } = req.body;

    if (!login || !email || !password) {
      return res.status(400).json({ error: 'Заполните все обязательные поля' });
    }

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
      tokenVersion: 0 
    });


    const { accessToken, refreshToken } = generateTokens(user);
    

    await saveRefreshToken(user.id, refreshToken);


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


    const { accessToken, refreshToken } = generateTokens(user);
    

    await saveRefreshToken(user.id, refreshToken);


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


export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token отсутствует' });
    }

    const storedToken = await RefreshToken.findOne({
      where: { token: refreshToken },
      include: [{ model: User }]
    });

    if (!storedToken) {
      return res.status(403).json({ error: 'Недействительный refresh token' });
    }

    if (new Date() > storedToken.expires_at) {
      await storedToken.destroy();
      return res.status(403).json({ error: 'Refresh token истек' });
    }


    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
      await storedToken.destroy();
      return res.status(403).json({ error: 'Недействительный refresh token' });
    }

    const user = storedToken.User;
    if (user.tokenVersion !== payload.tokenVersion) {

      await RefreshToken.destroy({ where: { user_id: user.id } });
      return res.status(403).json({ error: 'Токен устарел' });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user);
    
    await storedToken.update({
      token: newRefreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

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


export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (refreshToken) {
      await RefreshToken.destroy({ where: { token: refreshToken } });
    }


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