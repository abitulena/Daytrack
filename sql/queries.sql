-- queries.sql

-- === РЕГИСТРАЦИЯ И ВХОД ===
-- Регистрация нового пользователя
INSERT INTO users (login, birth_date, email, password_hash, gender) 
VALUES ($1, $2, $3, $4, $5) RETURNING id;

-- Вход (проверка пароля)
SELECT id, password_hash FROM users WHERE email = $1;

-- === ОСНОВНЫЕ ОПЕРАЦИИ С ЗАПИСЯМИ ===
-- 1. ДОБАВИТЬ запись (CREATE)
INSERT INTO diary_entries (user_id, entry_date, emotion_id, sleep_id, text_entry) 
VALUES ($1, $2, $3, $4, $5) RETURNING *;

-- 2. ПОЛУЧИТЬ ВСЕ записи пользователя (READ ALL)
SELECT de.*, e.name as emotion_name, sq.name as sleep_name
FROM diary_entries de
LEFT JOIN emotions e ON de.emotion_id = e.id
LEFT JOIN sleep_quality sq ON de.sleep_id = sq.id
WHERE de.user_id = $1
ORDER BY de.entry_date DESC;

-- 3. ПОЛУЧИТЬ запись по ДАТЕ (READ BY DATE)
SELECT de.*, e.name as emotion_name, sq.name as sleep_name
FROM diary_entries de
LEFT JOIN emotions e ON de.emotion_id = e.id
LEFT JOIN sleep_quality sq ON de.sleep_id = sq.id
WHERE de.user_id = $1 AND de.entry_date = $2;