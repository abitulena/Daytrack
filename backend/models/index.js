// models/index.js
import { sequelize, DataTypes, testConnection } from './init.js'; 

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  login: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  email: { type: DataTypes.STRING(255), unique: true, allowNull: false },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  birth_date: { type: DataTypes.DATEONLY, allowNull: false },
  gender: { type: DataTypes.ENUM('M', 'F'), allowNull: false }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

const Emotion = sequelize.define('Emotion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  image_url: { type: DataTypes.STRING(500), allowNull: false },
  display_order: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: 'emotions',
  timestamps: false
});

const SleepQuality = sequelize.define('SleepQuality', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  image_url: { type: DataTypes.STRING(500), allowNull: false },
  display_order: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: 'sleep_quality',
  timestamps: false
});

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

const Hashtag = sequelize.define('Hashtag', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tag_name: { type: DataTypes.STRING(50), unique: true, allowNull: false }, 
  is_custom: { type: DataTypes.BOOLEAN, defaultValue: false } 
}, {
  tableName: 'hashtags',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

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

const Achievement = sequelize.define('Achievement', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  image_filename: { type: DataTypes.STRING(100) },
  condition_type: { 
    type: DataTypes.ENUM('first_entry', 'streak_5', 'streak_15', 'streak_30'),
    allowNull: false 
  },
  display_order: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: 'achievements',
  timestamps: false
});

const UserAchievement = sequelize.define('UserAchievement', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  achievement_id: { type: DataTypes.INTEGER, allowNull: false },
  unlocked_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'user_achievements',
  timestamps: false
});

const Event = sequelize.define('Event', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  event_date: { type: DataTypes.DATEONLY, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false }
}, {
  tableName: 'events',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      name: 'idx_events_user_date',
      fields: ['user_id', 'event_date']
    },
    {
      name: 'idx_events_date',
      fields: ['event_date']
    }
  ]
});


User.hasMany(DiaryEntry, { foreignKey: 'user_id', onDelete: 'CASCADE' });
DiaryEntry.belongsTo(User, { foreignKey: 'user_id' });

DiaryEntry.belongsTo(Emotion, { foreignKey: 'emotion_id' });
DiaryEntry.belongsTo(SleepQuality, { foreignKey: 'sleep_id' });

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


User.belongsToMany(Achievement, {
  through: UserAchievement, 
  foreignKey: 'user_id',
  otherKey: 'achievement_id'
});

Achievement.belongsToMany(User, {
  through: UserAchievement, 
  foreignKey: 'achievement_id',
  otherKey: 'user_id'
});

UserAchievement.belongsTo(User, { foreignKey: 'user_id' });
UserAchievement.belongsTo(Achievement, { foreignKey: 'achievement_id' });


User.hasMany(Event, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Event.belongsTo(User, { foreignKey: 'user_id' });

export { 
  sequelize,
  User,
  DiaryEntry,
  Emotion, 
  SleepQuality,
  Hashtag,
  GalleryPhoto,
  EntryHashtag,
  Achievement,
  UserAchievement,
  Event,
  testConnection
};