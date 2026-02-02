# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Копируем зависимости
COPY package*.json ./

# Устанавливаем ВСЕ зависимости (включая devDependencies)
RUN npm install

# Копируем исходный код
COPY . .

# Создаем папку для загрузок
RUN mkdir -p public/uploads

EXPOSE 5000

# Используем nodemon для development
CMD ["npx", "nodemon", "server.js"]