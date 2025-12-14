// test-server.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Статические файлы
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


const TEST_ACCESS_SECRET = 'test-access-secret-key-12345';
process.env.ACCESS_TOKEN_SECRET = TEST_ACCESS_SECRET;

const mockUser = {
  id: 1,
  login: 'testuser',
  email: 'test@example.com'
};

const generateTestToken = () => {
  return jwt.sign(
    { 
      id: mockUser.id,
      login: mockUser.login,
      email: mockUser.email
    },
    TEST_ACCESS_SECRET,
    { expiresIn: '24h' }
  );
};

const TEST_TOKEN = generateTestToken();

async function setupRoutes() {
  try {

    const { authenticateToken } = await import('./middleware/auth.js');
    const hashtagRoutes = (await import('./routes/hashtags.js')).default;
    const achievementRoutes = (await import('./routes/achievement.js')).default;
    const photoRoutes = (await import('./routes/photo.js')).default;
    const searchRoutes = (await import('./routes/search.js')).default;

    app.use('/api/hashtags', authenticateToken, hashtagRoutes);
    app.use('/api/achievements', authenticateToken, achievementRoutes);
    app.use('/api/photos', authenticateToken, photoRoutes);
    app.use('/api/search', authenticateToken, searchRoutes);
    
  } catch (error) {
    console.error('Ошибка:', error.message);
    process.exit(1);
  }
}

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DAYTRACK API',
      version: '1.0.0',
      description: `API для личного дневника-трекера\n\n**Тестовый токен:** \`${TEST_TOKEN}\``
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Тестовый сервер'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: `Введите токен: \`${TEST_TOKEN}\``
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Настраиваем Swagger UI с предзаполненным токеном
const swaggerUiOptions = {
  swaggerOptions: {
    persistAuthorization: true, // Сохраняет авторизацию
    authAction: {
      bearerAuth: {
        name: 'bearerAuth',
        schema: {
          type: 'http',
          in: 'header',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        value: TEST_TOKEN // ПРЕДЗАПОЛНЯЕМ ТОКЕН!
      }
    }
  }
};



app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));



async function startServer() {
  console.log(`Тестовый токен: ${TEST_TOKEN}`);
  console.log('');
  
  await setupRoutes();
  
  app.listen(PORT, () => {
    console.log(`Сервер запущен  http://localhost:${PORT}`);
    console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
    console.log('');
    console.log(`curl -H "Authorization: Bearer ${TEST_TOKEN}" http://localhost:${PORT}/api/hashtags`);
  });
}

app.use((err, req, res, next) => {
  console.error(' Ошибка:', err);
  res.status(500).json({
    success: false,
    error: err.message
  });
});

startServer().catch(console.error);
