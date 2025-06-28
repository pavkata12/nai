-- Data export from local database

INSERT OR IGNORE INTO courses (id, title, description, category_id, difficulty, duration_hours, price, instructor, content, objectives, prerequisites, is_active, featured, created_at) VALUES (1, 'Formula 1 за начинаещи', 'Научете основите на Formula 1 симулацията. Включва управление, спирачки, линии на пистата и базови техники.', 1, 'beginner', 2, 50, 'Мартин Петков', 'Съдържание на курса', 'Цели на курса', 'Няма', 1, 1, datetime('now'));
INSERT OR IGNORE INTO courses (id, title, description, category_id, difficulty, duration_hours, price, instructor, content, objectives, prerequisites, is_active, featured, created_at) VALUES (2, 'Майсторско Rally вождене', 'Напреднали техники за рали състезания. Научете се да управлявате автомобила в екстремни условия.', 2, 'advanced', 2, 100, 'Иван Стойков', 'Съдържание на курса', 'Цели на курса', 'Няма', 1, 1, datetime('now'));
INSERT OR IGNORE INTO courses (id, title, description, category_id, difficulty, duration_hours, price, instructor, content, objectives, prerequisites, is_active, featured, created_at) VALUES (3, 'Безплатен курс - Основи на симулацията', 'Безплатен вводен курс за всички нови потребители. Научете основите на racing симулаторите.', 6, 'beginner', 2, 100, 'Academy Team', 'Съдържание на курса', 'Цели на курса', 'Няма', 1, 0, datetime('now'));
INSERT OR IGNORE INTO courses (id, title, description, category_id, difficulty, duration_hours, price, instructor, content, objectives, prerequisites, is_active, featured, created_at) VALUES (4, 'Професионални техники за дрифт', 'Всичко за дрифт техниките - от базови до напреднали. Ексклузивни съвети от професионални дрифтъри.', 4, 'intermediate', 2, 75, 'Георги Драганов', 'Съдържание на курса', 'Цели на курса', 'Няма', 1, 0, datetime('now'));


-- Additional sample data
INSERT OR IGNORE INTO tournaments (name, description, game, start_date, end_date, entry_fee, max_participants, prize_pool, status, rules, created_at) VALUES 
('Formula 1 Championship 2025', 'Официален шампионат по Formula 1', 'F1 2024', '2025-07-01 18:00:00', '2025-07-15 20:00:00', 100, 32, 5000, 'upcoming', 'Стандартни правила на FIA', datetime('now')),
('GT3 Sprint Series', 'Кратка серия състезания с GT3 коли', 'Assetto Corsa Competizione', '2025-06-30 19:00:00', '2025-06-30 22:00:00', 50, 24, 2000, 'open', 'Sprint формат - 3 състезания', datetime('now')),
('Rookie Cup', 'Турнир за начинаещи пилоти', 'Gran Turismo 7', '2025-07-10 17:00:00', '2025-07-10 19:00:00', 25, 16, 500, 'upcoming', 'Само за пилоти под Safety Rating B', datetime('now'));

-- Add bookings
INSERT OR IGNORE INTO bookings (user_id, simulator_id, start_time, end_time, duration_minutes, status, total_cost, payment_status, notes, created_at) VALUES
(13, 1, '2025-06-28 14:00:00', '2025-06-28 16:00:00', 120, 'confirmed', 240, 'paid', 'Formula 1 тренировка', datetime('now')),
(23, 2, '2025-06-28 18:00:00', '2025-06-28 19:30:00', 90, 'confirmed', 180, 'paid', 'GT3 сесия', datetime('now')),
(13, 3, '2025-06-29 10:00:00', '2025-06-29 12:00:00', 120, 'pending', 240, 'pending', 'Rally тренировка', datetime('now'));

-- Add simulators
INSERT OR IGNORE INTO simulators (name, type, description, hourly_rate, is_active, specifications, location, created_at) VALUES
('Formula Pro Simulator', 'Formula', 'Професионален Formula симулатор с 3 монитора', 120, 1, 'Triple screen, Direct Drive wheel, Load cell pedals', 'Зала 1', datetime('now')),
('GT Racing Rig', 'GT', 'GT симулатор за спортни коли', 100, 1, 'Ultrawide monitor, T300 wheel, Sparco seat', 'Зала 2', datetime('now')),
('Rally Simulator', 'Rally', 'Специализиран Rally симулатор', 90, 1, 'VR headset, Handbrake, Sequential shifter', 'Зала 3', datetime('now'));
