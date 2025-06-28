const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'netcafe.db');
const db = new sqlite3.Database(DB_PATH);

console.log('🔍 Checking database...');

// Check if database exists
db.serialize(() => {
    // Get all tables
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) {
            console.error('❌ Error reading tables:', err.message);
            return;
        }
        
        console.log('📋 Tables found:', tables.map(t => t.name).join(', '));
        
        // Check users
        db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
            if (err) {
                console.error('❌ Error counting users:', err.message);
            } else {
                console.log('👥 Users count:', row.count);
            }
        });
        
        // Check tournaments
        db.get("SELECT COUNT(*) as count FROM tournaments", (err, row) => {
            if (err) {
                console.error('❌ Error counting tournaments:', err.message);
            } else {
                console.log('🏆 Tournaments count:', row.count);
            }
        });
        
        // Check courses
        db.get("SELECT COUNT(*) as count FROM courses", (err, row) => {
            if (err) {
                console.error('❌ Error counting courses:', err.message);
            } else {
                console.log('📚 Courses count:', row.count);
            }
        });
        
        // Check bookings
        db.get("SELECT COUNT(*) as count FROM bookings", (err, row) => {
            if (err) {
                console.error('❌ Error counting bookings:', err.message);
            } else {
                console.log('📅 Bookings count:', row.count);
            }
        });
        
        // Check news
        db.get("SELECT COUNT(*) as count FROM news", (err, row) => {
            if (err) {
                console.error('❌ Error counting news:', err.message);
            } else {
                console.log('📰 News count:', row.count);
            }
        });
        
        // Check shop_items
        db.get("SELECT COUNT(*) as count FROM shop_items", (err, row) => {
            if (err) {
                console.error('❌ Error counting shop_items:', err.message);
            } else {
                console.log('🛒 Shop items count:', row.count);
                
                // Close database after all checks
                setTimeout(() => {
                    db.close();
                }, 100);
            }
        });
    });
}); 