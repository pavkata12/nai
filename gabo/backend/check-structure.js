const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const DB_PATH = path.join(__dirname, 'netcafe.db')

console.log('🔍 Checking table structures...')

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message)
    process.exit(1)
  }
})

// Check courses table structure
db.all("PRAGMA table_info(courses)", (err, columns) => {
  if (err) {
    console.error('❌ Error reading courses structure:', err.message)
  } else {
    console.log('📚 Courses table structure:')
    columns.forEach(col => {
      console.log(`  ${col.name} - ${col.type} - ${col.notnull ? 'NOT NULL' : 'NULL'}`)
    })
    console.log('')
  }
  
  // Check tournaments table structure
  db.all("PRAGMA table_info(tournaments)", (err, columns) => {
    if (err) {
      console.error('❌ Error reading tournaments structure:', err.message)
    } else {
      console.log('🏆 Tournaments table structure:')
      columns.forEach(col => {
        console.log(`  ${col.name} - ${col.type} - ${col.notnull ? 'NOT NULL' : 'NULL'}`)
      })
      console.log('')
    }
    
    // Check actual data
    db.all("SELECT * FROM courses LIMIT 2", (err, courses) => {
      if (err) {
        console.error('❌ Error reading courses data:', err.message)
      } else {
        console.log('📚 Sample courses data:')
        console.table(courses)
      }
      
      db.close()
    })
  })
}) 