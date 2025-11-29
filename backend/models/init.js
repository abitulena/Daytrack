// models/init.js
import { Sequelize, DataTypes } from 'sequelize';


const sequelize = new Sequelize('daytrack_db', 'postgres', '12345', {
  host: 'localhost',
  dialect: 'postgres',
  port: 5432, 
  logging: false 
});


async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

export { sequelize, DataTypes, testConnection };