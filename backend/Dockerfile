# Используем официальный образ Node.js
FROM node:18-alpine

# Рабочая директория в контейнере
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем весь код проекта
COPY . .

# Открываем порт, на котором работает приложение
EXPOSE 5000

# Команда запуска
CMD ["node", "server.js"]