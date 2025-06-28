// Simple user creation script without external dependencies
const fs = require('fs');
const crypto = require('crypto');

// Hash passwords
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// SQL commands to create users table and insert users
const setupSQL = `
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    minutes INTEGER DEFAULT 0,
    total_spent REAL DEFAULT 0.0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Insert demo users
INSERT OR REPLACE INTO users (username, password_hash, is_admin, is_active, minutes, total_spent) VALUES 
('admin', '${hashPassword('admin123')}', 1, 1, 999999, 0.0),
('test', '${hashPassword('test123')}', 0, 1, 1000, 0.0),
('player1', '${hashPassword('player123')}', 0, 1, 500, 0.0),
('vip', '${hashPassword('vip123')}', 0, 1, 2000, 0.0);

-- Show created users
SELECT 'Created users:' as info;
SELECT id, username, is_admin, minutes FROM users;
`;

// Write SQL file
fs.writeFileSync('setup-users.sql', setupSQL);

console.log('✅ Created setup-users.sql file');
console.log('📋 Login credentials:');
console.log('👑 Admin: admin / admin123');
console.log('🧪 Test: test / test123');
console.log('🎮 Player: player1 / player123');
console.log('💎 VIP: vip / vip123');
console.log('');
console.log('🚀 To apply to database, run:');
console.log('sqlite3 netcafe.db < setup-users.sql'); 