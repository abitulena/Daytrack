-- backend/sql/init.sql
CREATE TABLE IF NOT EXISTS emotions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_order INTEGER DEFAULT 0,
    image_url VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS sleep_quality (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_order INTEGER DEFAULT 0,
    image_url VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(50) UNIQUE NOT NULL,
    birth_date DATE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    gender CHAR(1) CHECK (gender IN ('M', 'Ж')),
    token_version INTEGER DEFAULT 0,  -- ВАЖНО: добавить это поле!
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (  -- ВАЖНО: добавить эту таблицу!
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS diary_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    emotion_id INTEGER REFERENCES emotions(id),
    sleep_id INTEGER REFERENCES sleep_quality(id),
    text_entry TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, entry_date)
);

CREATE TABLE IF NOT EXISTS gallery_photos (
    id SERIAL PRIMARY KEY,
    entry_id INTEGER REFERENCES diary_entries(id) ON DELETE CASCADE,
    image_path VARCHAR(500) NOT NULL,
    image_name VARCHAR(255),
    upload_order INTEGER,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ИЗМЕНИТЕ таблицу hashtags (добавьте is_custom):
CREATE TABLE IF NOT EXISTS hashtags (
    id SERIAL PRIMARY KEY,
    tag_name VARCHAR(100) UNIQUE NOT NULL,
    is_custom BOOLEAN DEFAULT true,  -- добавить это поле
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entry_hashtags (
    id SERIAL PRIMARY KEY,
    entry_id INTEGER REFERENCES diary_entries(id) ON DELETE CASCADE,
    hashtag_id INTEGER REFERENCES hashtags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавьте другие таблицы из models/index.js:
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_filename VARCHAR(255),
    condition_type VARCHAR(50) NOT NULL,
    display_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Наполняем базовыми данными
INSERT INTO emotions (id, name, display_order, image_url) VALUES
(1, 'Грустный', 1, '/images/emotions/sad.png'),
(2, 'Нейтральный', 2, '/images/emotions/neutral.png'),
(3, 'Спокойный', 3, '/images/emotions/calm.png'),
(4, 'Радостный', 4, '/images/emotions/happy.png'),
(5, 'Счастлив', 5, '/images/emotions/joyful.png')
ON CONFLICT (id) DO NOTHING;

INSERT INTO sleep_quality (id, name, display_order, image_url) VALUES
(1, 'Отлично поспал', 1, '/images/sleep/excellent.png'),
(2, 'Хорошо поспал', 2, '/images/sleep/good.png'),
(3, 'Нормально', 3, '/images/sleep/average.png'),
(4, 'Плохо спал', 4, '/images/sleep/bad.png'),
(5, 'бессоница', 5, '/images/sleep/terrible.png')
ON CONFLICT (id) DO NOTHING;

INSERT INTO hashtags (id, tag_name, is_custom, created_at) VALUES
(1, 'любовь', false, NOW()),
(2, 'работа', false, NOW()),
(3, 'отдых', false, NOW()),
(4, 'здоровье', false, NOW()),
(5, 'друзья', false, NOW()),
(6, 'семья', false, NOW()),
(7, 'учеба', false, NOW()),
(8, 'хобби', false, NOW()),
(9, 'путешествие', false, NOW()),
(10, 'мечты', false, NOW())
ON CONFLICT (id) DO NOTHING;