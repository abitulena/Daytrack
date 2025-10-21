CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(50) UNIQUE NOT NULL,
    birth_date DATE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    gender CHAR(1) CHECK (gender IN ('M', 'Ж')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE diary_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    emotion_id INTEGER REFERENCES emotions(id), -- выбранная эмоция
    sleep_id INTEGER REFERENCES sleep_quality(id), -- выбранное качество сна
    text_entry TEXT, -- поле для записей о дне
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, entry_date) -- одна запись в день на пользователя
);

CREATE TABLE emotions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_order INTEGER DEFAULT 0
);


CREATE TABLE sleep_quality (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_order INTEGER DEFAULT 0
);


CREATE TABLE gallery_photos (
    id SERIAL PRIMARY KEY,
    entry_id INTEGER REFERENCES diary_entries(id) ON DELETE CASCADE,
    image_path VARCHAR(500) NOT NULL,
    image_name VARCHAR(255),
    upload_order INTEGER, -- порядок загрузки (для отображения)
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hashtags (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    tag_name VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#000000',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE entry_hashtags (
    id SERIAL PRIMARY KEY,
    entry_id INTEGER REFERENCES diary_entries(id) ON DELETE CASCADE,
    hashtag_id INTEGER REFERENCES hashtags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);