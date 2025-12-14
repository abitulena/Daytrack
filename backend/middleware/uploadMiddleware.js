// middleware/uploadMiddleware.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Папка для сохранения
const uploadDir = 'public/uploads/gallery';

// Создаём папку, если её нет
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Настройка сохранения файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Уникальное имя файла: время-случайное_число-оригинальное_имя
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

// Проверка, что файл - изображение
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/i;
  const isImage = allowedTypes.test(file.mimetype);
  
  if (isImage) {
    cb(null, true);
  } else {
    cb(new Error('Можно загружать только изображения (JPEG, PNG, GIF, WebP)'), false);
  }
};

// Создаём загрузчик
const upload = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Экспортируем готовые middleware
export const uploadSingle = upload.single('photo');     // для 1 фото (поле "photo")
export const uploadMultiple = upload.array('photos', 20); // для до 20 фото (поле "photos")