const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const DB_PATH = path.join(__dirname, 'netcafe.db')

console.log('🔍 Checking database tables...')
console.log('📍 Database path:', DB_PATH)

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message)
    process.exit(1)
  } else {
    console.log('✅ Connected to database')
  }
})

// Check for academy-related tables
db.all("SELECT name FROM sqlite_master WHERE type='table' AND (name LIKE '%course%' OR name LIKE '%academy%');", (err, tables) => {
  if (err) {
    console.error('❌ Error querying tables:', err.message)
  } else {
    console.log('📋 Academy-related tables found:')
    if (tables.length === 0) {
      console.log('⚠️  No academy tables found!')
    } else {
      tables.forEach(table => {
        console.log(`  - ${table.name}`)
      })
    }
  }
  
  // Check specifically for user_course_purchases table
  db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='user_course_purchases';", (err, result) => {
    if (err) {
      console.error('❌ Error checking user_course_purchases:', err.message)
    } else {
      if (result.length === 0) {
        console.log('❌ user_course_purchases table NOT FOUND')
      } else {
        console.log('✅ user_course_purchases table EXISTS')
      }
    }
    
    db.close()
    process.exit(0)
  })
}) 