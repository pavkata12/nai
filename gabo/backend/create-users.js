const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path - use local database
const DB_PATH = path.join(__dirname, 'netcafe.db');

// Create users table and add demo users
const db = new sqlite3.Database(DB_PATH);

// Hash for passwords (using simple hashing for demo)
const crypto = require('crypto');

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Create users table if it doesn't exist
db.serialize(() => {
    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        minutes INTEGER DEFAULT 0,
        total_spent REAL DEFAULT 0.0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    // Add demo users
    const users = [
        {
            username: 'admin',
            password: 'admin123',
            is_admin: 1,
            minutes: 999999
        },
        {
            username: 'test',
            password: 'test123',
            is_admin: 0,
            minutes: 1000
        },
        {
            username: 'player1',
            password: 'player123',
            is_admin: 0,
            minutes: 500
        },
        {
            username: 'vip',
            password: 'vip123',
            is_admin: 0,
            minutes: 2000
        }
    ];

    // Insert users
    users.forEach(user => {
        const hashedPassword = hashPassword(user.password);
        db.run(`INSERT OR REPLACE INTO users (username, password_hash, is_admin, is_active, minutes, total_spent) 
                VALUES (?, ?, ?, ?, ?, ?)`, 
                [user.username, hashedPassword, user.is_admin, 1, user.minutes, 0.0],
                function(err) {
                    if (err) {
                        console.error('Error inserting user:', user.username, err.message);
                    } else {
                        console.log(`✅ User created: ${user.username} (ID: ${this.lastID})`);
                    }
                });
    });

    // Show created users
    setTimeout(() => {
        db.all("SELECT id, username, is_admin, minutes FROM users", (err, rows) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log('\n📊 Created users:');
                console.table(rows);
            }
            db.close();
        });
    }, 1000);
});

console.log('🚀 Creating demo users...'); 