// models/index.js 
const { sequelize, DataTypes, testConnection } = require('./init');

// users
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  login: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  email: { type: DataTypes.STRING(255), unique: true, allowNull: false },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  birth_date: { type: DataTypes.DATEONLY, allowNull: false },
  gender: { type: DataTypes.ENUM('M', 'Ж'), allowNull: false }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// emotions
const Emotion = sequelize.define('Emotion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  display_order: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: 'emotions',
  timestamps: false
});

// sleep_quality
const SleepQuality = sequelize.define('SleepQuality', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  display_order: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: 'sleep_quality',
  timestamps: false
});

// diary_entries
const DiaryEntry = sequelize.define('DiaryEntry', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  entry_date: { type: DataTypes.DATEONLY, allowNull: false },
  emotion_id: { type: DataTypes.INTEGER },
  sleep_id: { type: DataTypes.INTEGER },   
  text_entry: { type: DataTypes.TEXT }
}, {
  tableName: 'diary_entries',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [ 
    {
      unique: true,
      fields: ['user_id', 'entry_date']
    }
  ]
});

// hashtags
const Hashtag = sequelize.define('Hashtag', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false }, // ⭐ УЖЕ БЫЛО
  tag_name: { type: DataTypes.STRING(50), allowNull: false },
  color: { type: DataTypes.STRING(7), defaultValue: '#000000' }
}, {
  tableName: 'hashtags',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// gallery_photos
const GalleryPhoto = sequelize.define('GalleryPhoto', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  entry_id: { type: DataTypes.INTEGER, allowNull: false }, 
  image_path: { type: DataTypes.STRING(500), allowNull: false },
  image_name: { type: DataTypes.STRING(255) },
  upload_order: { type: DataTypes.INTEGER }
}, {
  tableName: 'gallery_photos',
  timestamps: true,
  createdAt: 'uploaded_at',
  updatedAt: false
});

// entry_hashtags
const EntryHashtag = sequelize.define('EntryHashtag', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  entry_id: { type: DataTypes.INTEGER, allowNull: false },
  hashtag_id: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'entry_hashtags',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// СВЯЗИ МЕЖДУ МОДЕЛЯМИ 
User.hasMany(DiaryEntry, { foreignKey: 'user_id', onDelete: 'CASCADE' });
DiaryEntry.belongsTo(User, { foreignKey: 'user_id' });

DiaryEntry.belongsTo(Emotion, { foreignKey: 'emotion_id' });
DiaryEntry.belongsTo(SleepQuality, { foreignKey: 'sleep_id' });

User.hasMany(Hashtag, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Hashtag.belongsTo(User, { foreignKey: 'user_id' });

DiaryEntry.belongsToMany(Hashtag, {
  through: EntryHashtag, 
  foreignKey: 'entry_id',
  otherKey: 'hashtag_id'
});

Hashtag.belongsToMany(DiaryEntry, {
  through: EntryHashtag, 
  foreignKey: 'hashtag_id',
  otherKey: 'entry_id'
});

DiaryEntry.hasMany(GalleryPhoto, { foreignKey: 'entry_id', onDelete: 'CASCADE' });
GalleryPhoto.belongsTo(DiaryEntry, { foreignKey: 'entry_id' });

// ЭКСПОРТ ВСЕХ МОДЕЛЕЙ
module.exports = {
  sequelize,
  User,
  DiaryEntry,
  Emotion, 
  SleepQuality,
  Hashtag,
  GalleryPhoto,
  EntryHashtag,
  testConnection
};