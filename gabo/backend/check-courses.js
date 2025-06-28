const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'netcafe.db');
const db = new sqlite3.Database(DB_PATH);

console.log('🔍 Checking courses in local database...');

db.all("SELECT id, title, description, difficulty, price, instructor FROM courses", (err, courses) => {
    if (err) {
        console.error('❌ Error reading courses:', err.message);
    } else {
        console.log('📚 Courses found:');
        courses.forEach(course => {
            console.log(`${course.id}. ${course.title} - ${course.difficulty} - ${course.price} tokens - ${course.instructor}`);
            console.log(`   ${course.description}\n`);
        });
    }
    
    // Check tournaments
    db.all("SELECT id, name, description, game, status FROM tournaments", (err, tournaments) => {
        if (err) {
            console.error('❌ Error reading tournaments:', err.message);
        } else {
            console.log('🏆 Tournaments found:', tournaments.length);
            tournaments.forEach(tournament => {
                console.log(`${tournament.id}. ${tournament.name} - ${tournament.game} - ${tournament.status}`);
                console.log(`   ${tournament.description}\n`);
            });
        }
        
        db.close();
    });
}); 