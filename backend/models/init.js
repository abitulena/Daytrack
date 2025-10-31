// models/init.js
const { Sequelize, DataTypes } = require('sequelize');


const sequelize = new Sequelize('daytrack_db', 'postgres', '54321', {
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

module.exports = { sequelize, DataTypes, testConnection };