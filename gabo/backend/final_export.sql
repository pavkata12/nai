-- Final data export with correct server table structures

-- Courses data (✅ confirmed structure)
INSERT OR IGNORE INTO courses (id, title, description, category_id, difficulty, duration, price_tokens, youtube_url, thumbnail_url, instructor_name, status, is_featured, created_at, updated_at) VALUES 
(1, 'Formula 1 за начинаещи', 'Научете основите на Formula 1 симулацията. Включва управление, спирачки, линии на пистата и базови техники.', 1, 'beginner', '1.5 часа', 50, 'https://youtube.com/watch?v=f1basics', 'https://example.com/f1-thumb.jpg', 'Петър Иванов', 'active', 1, datetime('now'), datetime('now')),
(2, 'GT3 Racing Masterclass', 'Напреднали техники за GT3 състезания. Сетъп на колата, състезателни линии и стратегии.', 1, 'advanced', '2 часа', 150, 'https://youtube.com/watch?v=gt3master', 'https://example.com/gt3-thumb.jpg', 'Марио Стоянов', 'active', 1, datetime('now'), datetime('now')),
(3, 'Rally Driving Fundamentals', 'Основи на рали шофирането. Управление в различни условия и техники за бързо каране.', 2, 'intermediate', '1 час', 75, 'https://youtube.com/watch?v=rallyfund', 'https://example.com/rally-thumb.jpg', 'Димитър Георгиев', 'active', 0, datetime('now'), datetime('now')),
(4, 'Дрифт техники', 'Научете как да дрифтирате професионално. От основи до напреднали техники.', 3, 'intermediate', '1.5 часа', 100, 'https://youtube.com/watch?v=drifttech', 'https://example.com/drift-thumb.jpg', 'Стефан Николов', 'active', 0, datetime('now'), datetime('now'));

-- Tournaments data (✅ confirmed structure - using 'category' not 'game')
INSERT OR IGNORE INTO tournaments (name, description, category, start_date, end_date, entry_fee, max_participants, prize_pool, status, rules, created_at, updated_at) VALUES 
('Formula 1 Championship 2025', 'Официален шампионат по Formula 1. Състезанието включва 10 кръга от календара на F1 2024.', 'F1 2024', '2025-07-01 18:00:00', '2025-07-15 20:00:00', 100, 32, 5000, 'upcoming', 'Стандартни правила на FIA. Забранени са всички помощи освен ABS и Traction Control.', datetime('now'), datetime('now')),
('GT3 Sprint Series', 'Кратка серия състезания с GT3 коли на различни писти.', 'Assetto Corsa Competizione', '2025-06-30 19:00:00', '2025-06-30 22:00:00', 50, 24, 2000, 'open', 'Sprint формат - 3 състезания по 20 минути. Точки: 25-18-15-12-10-8-6-4-2-1', datetime('now'), datetime('now')),
('Rookie Cup', 'Турнир за начинаещи пилоти под Safety Rating B.', 'Gran Turismo 7', '2025-07-10 17:00:00', '2025-07-10 19:00:00', 25, 16, 500, 'upcoming', 'Само за пилоти под Safety Rating B. Разрешени са всички помощи.', datetime('now'), datetime('now')),
('Endurance Challenge', '6-часово състезание на отбори от по 3 пилота.', 'iRacing', '2025-07-20 14:00:00', '2025-07-20 20:00:00', 200, 18, 10000, 'upcoming', 'Отборно състезание. Минимум 2 часа за всеки пилот. Задължителни 4 pit stop-а.', datetime('now'), datetime('now'));

-- Bookings data (✅ using correct columns: booking_date instead of start_time/end_time)
INSERT OR IGNORE INTO bookings (user_id, simulator_id, booking_date, duration_minutes, status, notes, created_at) VALUES
(13, 1, '2025-06-28 14:00:00', 120, 'confirmed', 'Formula 1 тренировка преди турнира', datetime('now')),
(23, 2, '2025-06-28 18:00:00', 90, 'confirmed', 'GT3 сесия - подготовка за Sprint Series', datetime('now')),
(13, 3, '2025-06-29 10:00:00', 120, 'pending', 'Rally тренировка', datetime('now')),
(23, 1, '2025-06-29 16:00:00', 60, 'confirmed', 'Кратка F1 сесия', datetime('now')),
(13, 2, '2025-06-30 11:00:00', 120, 'confirmed', 'Подготовка за GT3 турнир', datetime('now'));

-- Simulators data (✅ using correct columns: specs, gpu, setup_type instead of type, specifications, location)
INSERT OR IGNORE INTO simulators (name, description, specs, gpu, setup_type, has_motion, has_vr, screen_setup, status, created_at, updated_at) VALUES
('Formula Pro Simulator', 'Професионален Formula симулатор с 3 монитора 32" и Direct Drive волан', 'Fanatec DD Pro wheel, Load cell pedals', 'RTX 4080', 'Formula', 1, 0, 'Triple 32" monitors', 'available', datetime('now'), datetime('now')),
('GT Racing Rig', 'GT симулатор за спортни коли с Ultrawide монитор', 'Thrustmaster T300 RS, Sparco racing seat', 'RTX 4070', 'GT', 0, 0, 'Ultrawide 49" monitor', 'available', datetime('now'), datetime('now')),
('Rally Simulator', 'Специализиран Rally симулатор с VR и ръчна спирачка', 'Handbrake, Sequential shifter, Bucket seat', 'RTX 4060', 'Rally', 0, 1, 'VR headset', 'available', datetime('now'), datetime('now')),
('Endurance Rig', 'Комфортен симулатор за дълги състезания', 'Comfortable racing seat, Cup holder', 'RTX 4070', 'Endurance', 0, 0, 'Triple 27" monitors', 'available', datetime('now'), datetime('now')); 