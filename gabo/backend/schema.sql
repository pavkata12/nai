-- Website Database Schema

-- Users table (synced with NetCafe)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    netcafe_id INTEGER UNIQUE,  -- ID from NetCafe system
    total_time_played INTEGER DEFAULT 0,  -- Minutes played (synced from NetCafe)
    xp INTEGER DEFAULT 0,  -- Calculated from time played
    tokens INTEGER DEFAULT 0,  -- Calculated from time played
    is_admin BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    avatar_url TEXT
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT,
    required_xp INTEGER NOT NULL,
    required_time INTEGER,  -- Minutes required
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    user_id INTEGER,
    achievement_id INTEGER,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
);

-- Shop items
CREATE TABLE IF NOT EXISTS shop_items (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,  -- Token price
    category TEXT NOT NULL,  -- 'vip', 'vr', 'education', 'settings', 'analysis'
    image_url TEXT,
    stock INTEGER DEFAULT -1,  -- -1 for unlimited
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User purchases
CREATE TABLE IF NOT EXISTS user_purchases (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    item_id INTEGER,
    price_paid INTEGER NOT NULL,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES shop_items(id) ON DELETE CASCADE
);

-- Tournaments
CREATE TABLE IF NOT EXISTS tournaments (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    entry_fee INTEGER DEFAULT 0,  -- Token cost to enter
    prize_pool INTEGER NOT NULL,  -- Total tokens for prizes
    max_participants INTEGER,
    status TEXT DEFAULT 'upcoming',  -- 'upcoming', 'active', 'completed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tournament participants
CREATE TABLE IF NOT EXISTS tournament_participants (
    tournament_id INTEGER,
    user_id INTEGER,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    position INTEGER,  -- Final position
    prize_tokens INTEGER,  -- Tokens won
    PRIMARY KEY (tournament_id, user_id),
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- News posts
CREATE TABLE IF NOT EXISTS news_posts (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER,
    image_url TEXT,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_netcafe_id ON users(netcafe_id);
CREATE INDEX IF NOT EXISTS idx_users_xp ON users(xp DESC);
CREATE INDEX IF NOT EXISTS idx_shop_items_category ON shop_items(category);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_news_posts_date ON news_posts(published_at DESC); 