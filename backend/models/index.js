// models/index.js
const { sequelize, DataTypes, testConnection } = require('./init');

//  МОДЕЛЬ ПОЛЬЗОВАТЕЛЯ (users)
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  login: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: false
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('M', 'Ж'),
    allowNull: false
  }
}, {
  tableName: 'users',       // название таблицы в базе
  timestamps: true,         // использовать временные метки
  createdAt: 'created_at',  // название поля "создано"
  updatedAt: false          // не использовать поле "обновлено"
});

// МОДЕЛЬ ЭМОЦИЙ (emotions)
const Emotion = sequelize.define('Emotion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'emotions',
  timestamps: false  // не использовать временные метки
});

//  МОДЕЛЬ СНА (sleep_quality)
const SleepQuality = sequelize.define('SleepQuality', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'sleep_quality',
  timestamps: false
});

//  МОДЕЛЬ ЗАПИСЕЙ ДНЕВНИКА (diary_entries)
const DiaryEntry = sequelize.define('DiaryEntry', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  entry_date: {
    type: DataTypes.DATEONLY,  // только дата (без времени)
    allowNull: false
  },
  text_entry: {
    type: DataTypes.TEXT       // длинный текст
  }
}, {
  tableName: 'diary_entries',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 🏷️ МОДЕЛЬ ХЕШТЕГОВ (hashtags)
const Hashtag = sequelize.define('Hashtag', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tag_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  color: {
    type: DataTypes.STRING(7),
    defaultValue: '#000000'
  }
}, {
  tableName: 'hashtags',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

//  МОДЕЛЬ ФОТОГРАФИЙ (gallery_photos)
const GalleryPhoto = sequelize.define('GalleryPhoto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  image_path: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  image_name: {
    type: DataTypes.STRING(255)
  },
  upload_order: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'gallery_photos',
  timestamps: true,
  createdAt: 'uploaded_at',
  updatedAt: false
});

// СВЯЗИ МЕЖДУ МОДЕЛЯМИ

// 1. ПОЛЬЗОВАТЕЛЬ → ЗАПИСИ (1 пользователь → много записей)
User.hasMany(DiaryEntry, { 
  foreignKey: 'user_id', 
  onDelete: 'CASCADE'  // если удалить пользователя → удалить его записи
});
DiaryEntry.belongsTo(User, { 
  foreignKey: 'user_id' 
});

// 2. ЗАПИСИ → ЭМОЦИИ (много записей → одна эмоция)
DiaryEntry.belongsTo(Emotion, { 
  foreignKey: 'emotion_id' 
});

// 3. ЗАПИСИ → СОН (много записей → одно качество сна)
DiaryEntry.belongsTo(SleepQuality, { 
  foreignKey: 'sleep_id' 
});

// 4. ПОЛЬЗОВАТЕЛЬ → ХЕШТЕГИ (1 пользователь → много хештегов)
User.hasMany(Hashtag, { 
  foreignKey: 'user_id', 
  onDelete: 'CASCADE' 
});
Hashtag.belongsTo(User, { 
  foreignKey: 'user_id' 
});

// 5. ЗАПИСИ ↔ ХЕШТЕГИ (многие-ко-многим через entry_hashtags)
DiaryEntry.belongsToMany(Hashtag, {
  through: 'entry_hashtags',    // через какую таблицу
  foreignKey: 'entry_id',       // ключ от DiaryEntry
  otherKey: 'hashtag_id'        // ключ от Hashtag
});

Hashtag.belongsToMany(DiaryEntry, {
  through: 'entry_hashtags',
  foreignKey: 'hashtag_id', 
  otherKey: 'entry_id'
});

// 6. ЗАПИСИ → ФОТО (1 запись → много фото)
DiaryEntry.hasMany(GalleryPhoto, { 
  foreignKey: 'entry_id', 
  onDelete: 'CASCADE' 
});
GalleryPhoto.belongsTo(DiaryEntry, { 
  foreignKey: 'entry_id' 
});

// ЭКСПОРТ ВСЕХ МОДЕЛЕЙ
module.exports = {
  sequelize,
  User,
  DiaryEntry,
  Emotion, 
  SleepQuality,
  Hashtag,
  GalleryPhoto,
  testConnection
};