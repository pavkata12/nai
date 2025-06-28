-- Initialize Academy Tables

-- Course categories
CREATE TABLE IF NOT EXISTS course_categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL,  -- Font Awesome icon class
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Academy courses
CREATE TABLE IF NOT EXISTS academy_courses (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price_tokens INTEGER NOT NULL,  -- Price in tokens
    thumbnail_url TEXT,  -- Background image URL for thumbnail
    youtube_url TEXT NOT NULL,  -- Unlisted YouTube video URL
    duration TEXT,  -- e.g. "45 minutes"
    difficulty TEXT DEFAULT 'beginner',  -- 'beginner', 'intermediate', 'advanced'
    category_id INTEGER,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES course_categories(id) ON DELETE SET NULL
);

-- User course purchases
CREATE TABLE IF NOT EXISTS user_course_purchases (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    tokens_paid INTEGER NOT NULL,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES academy_courses(id) ON DELETE CASCADE
);

-- Insert demo categories
INSERT OR IGNORE INTO course_categories (id, name, description, icon) VALUES
(1, 'Основи на управлението', 'Научете се на основните техники за управление на автомобила', 'fas fa-steering-wheel'),
(2, 'Напреднали техники', 'Усъвършенствайте уменията си с професионални техники', 'fas fa-tachometer-alt'),
(3, 'Setup и настройки', 'Оптимизирайте настройките на автомобила за максимална производителност', 'fas fa-cogs'),
(4, 'Състезателни стратегии', 'Стратегии и тактики за спечелване на състезания', 'fas fa-trophy');

-- Insert demo courses
INSERT OR IGNORE INTO academy_courses (id, title, description, price_tokens, thumbnail_url, youtube_url, duration, difficulty, category_id, is_active) VALUES
(1, 'Основи на Sim Racing', 'Въведение в света на симулационното каране. Научете се на основните техники за управление и настройка на симулатора.', 200, 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=450&fit=crop', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '45 минути', 'beginner', 1, 1),

(2, 'Напреднали техники на завиване', 'Усъвършенствайте техниката си на завиване с професионални съвети и трикове.', 350, 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=450&fit=crop', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '60 минути', 'intermediate', 2, 1),

(3, 'Настройка на окачването', 'Научете се как да настроите окачването за различни писти и условия.', 300, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=450&fit=crop', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '50 минути', 'advanced', 3, 1),

(4, 'Стратегии за дългосрочни състезания', 'Тактики за управление на гориво, гуми и стратегии за pit stop.', 400, 'https://images.unsplash.com/photo-1530450514508-770734cf66c4?w=800&h=450&fit=crop', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '75 минути', 'advanced', 4, 1),

(5, 'Анализ на телеметрия', 'Научете се да четете и анализирате данни от телеметрията за подобряване на времената.', 450, 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=450&fit=crop', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '90 минути', 'advanced', 2, 1),

(6, 'Психология на състезанието', 'Ментални техники за справяне с натиска и подобряване на концентрацията.', 250, 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=450&fit=crop', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '40 минути', 'beginner', 4, 1);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_academy_courses_category ON academy_courses(category_id);
CREATE INDEX IF NOT EXISTS idx_academy_courses_active ON academy_courses(is_active);
CREATE INDEX IF NOT EXISTS idx_user_course_purchases_user ON user_course_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_course_purchases_course ON user_course_purchases(course_id); 