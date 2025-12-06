// models/init.js
import { Sequelize, DataTypes } from 'sequelize';

import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'daytrack',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '88888',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
    logging: false
  }
);


async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

export { sequelize, DataTypes, testConnection };
