/**
 * Sync Endpoints - Receives data from NetCafe Production Bridge
 * Processes gaming sessions to create tokens and XP automatically
 */

const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// Token and XP calculation rates
const TOKENS_PER_MINUTE = 2    // 2 tokens per minute played
const XP_PER_MINUTE = 5        // 5 XP per minute played
const BONUS_TOKENS_THRESHOLD = 60  // Bonus tokens after 60 minutes
const BONUS_TOKENS_AMOUNT = 50     // Bonus tokens amount

// Middleware to verify external API key
function verifyExternalAPIKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.headers['x-netcafe-api-key']
  const validKey = process.env.EXTERNAL_API_KEY || 'netcafe-bridge-2024-secure-key'
  
  if (!apiKey || apiKey !== validKey) {
    console.log('❌ Invalid external API key:', apiKey)
    return res.status(401).json({
      success: false,
      message: 'Invalid external API key'
    })
  }
  
  console.log('✅ External API key verified for sync')
  next()
}

// Database connection for main website database
function getMainDB() {
  const dbPath = path.join(__dirname, 'netcafe.db')
  return new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Error opening main database:', err.message)
    } else {
      console.log('✅ Main database connection successful')
    }
  })
}

// Database connection for website cache
function getWebsiteDB() {
  const dbPath = path.join(__dirname, 'website_cache.db')
  return new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Error opening website cache database:', err.message)
    } else {
      console.log('✅ Website cache database connection successful')
    }
  })
}

// Calculate tokens and XP from gaming minutes with tier multipliers
function calculateRewards(minutes, userXP = 0) {
  const baseTokens = Math.floor(minutes * TOKENS_PER_MINUTE)
  const xp = Math.floor(minutes * XP_PER_MINUTE)
  
  // Calculate tier multiplier based on user's current XP
  let tierMultiplier = 1.0
  if (userXP >= 1600) tierMultiplier = 2.0      // Unreal: 2x multiplier
  else if (userXP >= 1000) tierMultiplier = 1.8  // Elite: 1.8x multiplier
  else if (userXP >= 450) tierMultiplier = 1.6   // Pro: 1.6x multiplier
  else if (userXP >= 150) tierMultiplier = 1.4   // Intermediate: 1.4x multiplier
  else if (userXP >= 50) tierMultiplier = 1.2    // Novice: 1.2x multiplier
  // Rookie: 1.0x multiplier (default)
  
  const tokens = Math.floor(baseTokens * tierMultiplier)
  
  // Bonus tokens for long sessions
  let bonusTokens = 0
  if (minutes >= BONUS_TOKENS_THRESHOLD) {
    bonusTokens = Math.floor(minutes / BONUS_TOKENS_THRESHOLD) * BONUS_TOKENS_AMOUNT
  }
  
  return {
    tokens: tokens + bonusTokens,
    xp: xp,
    bonusTokens: bonusTokens,
    tierMultiplier: tierMultiplier,
    baseTokens: baseTokens
  }
}

// Process user data and create/update tokens
async function processUserTokens(user) {
  return new Promise((resolve, reject) => {
    const db = getMainDB()
    
    // Check if user exists in main database first to get current XP
    db.get(
      'SELECT u.id, ut.xp FROM users u LEFT JOIN user_tokens ut ON u.id = ut.user_id WHERE u.username = ?',
      [user.username],
      (err, existingUser) => {
        if (err) {
          console.error('❌ Error checking user:', err)
          db.close()
          return reject(err)
        }
        
        // Calculate rewards based on total minutes played and current XP
        const currentXP = existingUser ? (existingUser.xp || 0) : 0
        const rewards = calculateRewards(user.minutes || 0, currentXP)
        
        if (existingUser) {
          // Update existing user tokens
          db.run(
            `UPDATE user_tokens SET 
             tokens = ?, 
             total_earned = ?, 
             minutes_played = ?,
             xp = ?,
             updated_at = CURRENT_TIMESTAMP
             WHERE user_id = ?`,
            [rewards.tokens, rewards.tokens, user.minutes, rewards.xp, existingUser.id],
            function(err) {
              if (err) {
                console.error('❌ Error updating user tokens:', err)
                db.close()
                return reject(err)
              }
              
              // If no rows were updated, insert new token record
              if (this.changes === 0) {
                db.run(
                  `INSERT INTO user_tokens (user_id, tokens, total_earned, minutes_played, xp) 
                   VALUES (?, ?, ?, ?, ?)`,
                  [existingUser.id, rewards.tokens, rewards.tokens, user.minutes, rewards.xp],
                  (err) => {
                    if (err) {
                      console.error('❌ Error inserting user tokens:', err)
                      db.close()
                      return reject(err)
                    }
                    
                    console.log(`💰 Created tokens for user ${user.username}: ${rewards.tokens} tokens, ${rewards.xp} XP`)
                    db.close()
                    resolve(rewards)
                  }
                )
              } else {
                console.log(`💰 Updated tokens for user ${user.username}: ${rewards.tokens} tokens, ${rewards.xp} XP (${rewards.tierMultiplier}x multiplier)`)
                db.close()
                resolve(rewards)
              }
            }
          )
        } else {
          // Create new user first - for new users, calculate rewards with 0 XP (Rookie tier)
          const newUserRewards = calculateRewards(user.minutes || 0, 0)
          const bcrypt = require('bcrypt')
          const hashedPassword = user.password_hash || bcrypt.hashSync('default123', 10)
          
          db.run(
            `INSERT INTO users (username, password_hash, is_admin, minutes, total_spent, is_active) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [user.username, hashedPassword, user.is_admin || 0, user.minutes || 0, user.total_spent || 0, user.is_active !== false ? 1 : 0],
            function(err) {
              if (err) {
                console.error('❌ Error creating user:', err)
                db.close()
                return reject(err)
              }
              
              const newUserId = this.lastID
              
              // Create token record for new user
              db.run(
                `INSERT INTO user_tokens (user_id, tokens, total_earned, minutes_played, xp) 
                 VALUES (?, ?, ?, ?, ?)`,
                [newUserId, newUserRewards.tokens, newUserRewards.tokens, user.minutes, newUserRewards.xp],
                (err) => {
                  if (err) {
                    console.error('❌ Error creating user tokens:', err)
                    db.close()
                    return reject(err)
                  }
                  
                  console.log(`👤 Created new user ${user.username} with ${newUserRewards.tokens} tokens, ${newUserRewards.xp} XP (${newUserRewards.tierMultiplier}x multiplier)`)
                  db.close()
                  resolve(newUserRewards)
                }
              )
            }
          )
        }
      }
    )
  })
}

// Process session data and award tokens
async function processSessionTokens(session) {
  return new Promise((resolve, reject) => {
    const db = getMainDB()
    
    // Find user by session data and get current XP for tier calculation
    db.get(
      'SELECT u.id, u.username, ut.xp FROM users u LEFT JOIN user_tokens ut ON u.id = ut.user_id WHERE u.id = ?',
      [session.user_id],
      (err, user) => {
        if (err || !user) {
          console.error('❌ User not found for session:', session.user_id)
          db.close()
          return reject(err || new Error('User not found'))
        }
        
        // Calculate rewards for this session with tier multiplier
        const sessionMinutes = session.duration_minutes || 0
        const currentXP = user.xp || 0
        const rewards = calculateRewards(sessionMinutes, currentXP)
        
        // Add tokens to user's account
        db.run(
          `UPDATE user_tokens SET 
           tokens = tokens + ?, 
           total_earned = total_earned + ?,
           updated_at = CURRENT_TIMESTAMP
           WHERE user_id = ?`,
          [rewards.tokens, rewards.tokens, user.id],
          function(err) {
            if (err) {
              console.error('❌ Error adding session tokens:', err)
              db.close()
              return reject(err)
            }
            
            // Record the token transaction
            db.run(
              `INSERT INTO token_transactions (user_id, amount, transaction_type, description, session_id) 
               VALUES (?, ?, ?, ?, ?)`,
              [user.id, rewards.tokens, 'gaming_session', `Gaming session: ${sessionMinutes} minutes`, session.session_id],
              (err) => {
                if (err) {
                  console.error('❌ Error recording token transaction:', err)
                }
                
                console.log(`🎮 Session tokens awarded to ${user.username}: +${rewards.tokens} tokens for ${sessionMinutes} minutes (${rewards.tierMultiplier}x multiplier)`)
                db.close()
                resolve(rewards)
              }
            )
          }
        )
      }
    )
  })
}

// Initialize website cache database
function initWebsiteCacheDB() {
  const db = getWebsiteDB()
  
  // Create tables if they don't exist
  db.serialize(() => {
    // Users cache table
    db.run(`
      CREATE TABLE IF NOT EXISTS users_cache (
        id INTEGER PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        is_admin BOOLEAN DEFAULT 0,
        minutes INTEGER DEFAULT 0,
        total_spent REAL DEFAULT 0.0,
        created_at TEXT,
        last_login TEXT,
        is_active BOOLEAN DEFAULT 1,
        synced_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Sessions cache table
    db.run(`
      CREATE TABLE IF NOT EXISTS sessions_cache (
        id INTEGER PRIMARY KEY,
        session_id TEXT,
        user_id INTEGER,
        computer_id TEXT,
        start_time TEXT,
        end_time TEXT,
        duration_minutes INTEGER,
        amount_paid REAL,
        is_active BOOLEAN,
        synced_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Leaderboard cache table
    db.run(`
      CREATE TABLE IF NOT EXISTS leaderboard_cache (
        id INTEGER PRIMARY KEY,
        user_id INTEGER,
        username TEXT,
        total_time_minutes INTEGER,
        xp INTEGER,
        tokens INTEGER,
        position INTEGER,
        synced_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    console.log('✅ Website cache database initialized')
  })
  
  db.close()
}

// Setup sync endpoints
function setupSyncEndpoints(app) {
  
  // Initialize cache database
  initWebsiteCacheDB()
  
  // Sync users endpoint - Process and create tokens automatically
  app.post('/api/sync/users', verifyExternalAPIKey, async (req, res) => {
    try {
      const { users, timestamp } = req.body
      
      if (!users || !Array.isArray(users)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid users data'
        })
      }
      
      console.log(`📡 Received sync request for ${users.length} users`)
      
      // Process each user and create/update tokens
      let processedUsers = 0
      let totalTokensAwarded = 0
      
      for (const user of users) {
        try {
          const rewards = await processUserTokens(user)
          processedUsers++
          totalTokensAwarded += rewards.tokens
        } catch (error) {
          console.error(`❌ Error processing user ${user.username}:`, error)
        }
      }
      
      console.log(`💰 Processed ${processedUsers} users, awarded ${totalTokensAwarded} total tokens`)
      
      res.json({
        success: true,
        message: `Processed ${processedUsers} users with ${totalTokensAwarded} tokens awarded`,
        processed_users: processedUsers,
        total_tokens_awarded: totalTokensAwarded,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      console.error('❌ User sync error:', error)
      res.status(500).json({
        success: false,
        message: 'User sync failed'
      })
    }
  })
  
  // Sync sessions endpoint - Award tokens for completed sessions
  app.post('/api/sync/sessions', verifyExternalAPIKey, async (req, res) => {
    try {
      const { sessions, timestamp } = req.body
      
      if (!sessions || !Array.isArray(sessions)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid sessions data'
        })
      }
      
      console.log(`📡 Received sync request for ${sessions.length} sessions`)
      
      // Process completed sessions and award tokens
      let processedSessions = 0
      let totalTokensAwarded = 0
      
      for (const session of sessions) {
        // Only process completed sessions (is_active = false)
        if (session.is_active === false && session.duration_minutes > 0) {
          try {
            const rewards = await processSessionTokens(session)
            processedSessions++
            totalTokensAwarded += rewards.tokens
          } catch (error) {
            console.error(`❌ Error processing session ${session.session_id}:`, error)
          }
        }
      }
      
      console.log(`🎮 Processed ${processedSessions} completed sessions, awarded ${totalTokensAwarded} tokens`)
      
      res.json({
        success: true,
        message: `Processed ${processedSessions} sessions with ${totalTokensAwarded} tokens awarded`,
        processed_sessions: processedSessions,
        total_tokens_awarded: totalTokensAwarded,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      console.error('❌ Session sync error:', error)
      res.status(500).json({
        success: false,
        message: 'Session sync failed'
      })
    }
  })
  
  // Sync leaderboard endpoint - Update XP and rankings
  app.post('/api/sync/leaderboard', verifyExternalAPIKey, (req, res) => {
    try {
      const { leaderboard, timestamp } = req.body
      
      if (!leaderboard || !Array.isArray(leaderboard)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid leaderboard data'
        })
      }
      
      console.log(`📡 Received sync request for ${leaderboard.length} leaderboard entries`)
      
      // Update leaderboard in main database
      const db = getMainDB()
      
      db.serialize(() => {
        // Clear existing leaderboard
        db.run('DELETE FROM leaderboard', (err) => {
          if (err) {
            console.error('❌ Error clearing leaderboard:', err)
          }
        })
        
        // Insert new leaderboard data
        const stmt = db.prepare(`
          INSERT INTO leaderboard (user_id, username, total_minutes, points, position) 
          VALUES (?, ?, ?, ?, ?)
        `)
        
        leaderboard.forEach((entry, index) => {
          stmt.run([
            entry.user_id,
            entry.username,
            entry.total_time_minutes || 0,
            entry.xp || entry.points || 0,
            index + 1
          ])
        })
        
        stmt.finalize()
        
        console.log(`🏆 Updated leaderboard with ${leaderboard.length} entries`)
      })
      
      db.close()
      
      res.json({
        success: true,
        message: `Updated leaderboard with ${leaderboard.length} entries`,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      console.error('❌ Leaderboard sync error:', error)
      res.status(500).json({
        success: false,
        message: 'Leaderboard sync failed'
      })
    }
  })
  
  // Sync status endpoint
  app.get('/api/sync/status', verifyExternalAPIKey, (req, res) => {
    const db = getMainDB()
    
    db.serialize(() => {
      let userCount = 0
      let sessionCount = 0
      let tokenCount = 0
      let totalTokens = 0
      
      db.get('SELECT COUNT(*) as count FROM users', (err, result) => {
        if (!err) userCount = result.count
      })
      
      db.get('SELECT COUNT(*) as count FROM sessions', (err, result) => {
        if (!err) sessionCount = result.count
      })
      
      db.get('SELECT COUNT(*) as count, SUM(tokens) as total FROM user_tokens', (err, result) => {
        if (!err) {
          tokenCount = result.count
          totalTokens = result.total || 0
        }
        
        res.json({
          success: true,
          status: 'NetCafe sync system ready',
          statistics: {
            users: userCount,
            sessions: sessionCount,
            token_accounts: tokenCount,
            total_tokens: totalTokens,
            tokens_per_minute: TOKENS_PER_MINUTE,
            xp_per_minute: XP_PER_MINUTE,
            bonus_threshold: BONUS_TOKENS_THRESHOLD
          },
          timestamp: new Date().toISOString()
        })
      })
    })
    
    db.close()
  })
  
  console.log('✅ NetCafe Production sync endpoints setup complete')
  console.log(`💰 Token rate: ${TOKENS_PER_MINUTE} tokens per minute`)
  console.log(`⭐ XP rate: ${XP_PER_MINUTE} XP per minute`)
  console.log(`🎁 Bonus: ${BONUS_TOKENS_AMOUNT} tokens every ${BONUS_TOKENS_THRESHOLD} minutes`)
}

module.exports = { setupSyncEndpoints } 