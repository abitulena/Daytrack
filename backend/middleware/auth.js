import jwt from 'jsonwebtoken';

import { RefreshToken } from '../models/index.js';

//для проверки Access Token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

 if (!token) {
    return res.status(401).json({ 
      success: false,
      error: 'Требуется авторизация. Access token отсутствует.',
      code: 'ACCESS_TOKEN_REQUIRED'
    });
  }

jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          error: 'Access token истек',
          code: 'ACCESS_TOKEN_EXPIRED'
        });
      }
      return res.status(403).json({ 
        success: false,
        error: 'Недействительный access token',
        code: 'INVALID_ACCESS_TOKEN'
      });
    }
    req.user = user;
    next();
  });
};

// Middleware для проверки Refresh Token (для эндпоинта refresh)
export const validateRefreshToken = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ 
      error: 'Refresh token отсутствует' 
    });
  }

  try {
    // Проверяем наличие токена в базе данных
    const storedToken = await RefreshToken.findOne({
      where: { token: refreshToken }
    });

    if (!storedToken) {
      return res.status(403).json({ 
        error: 'Refresh token не найден в системе' 
      });
    }

    req.refreshToken = refreshToken;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
