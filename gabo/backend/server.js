const express = require('express')
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const path = require('path')


const app = express()
const PORT = process.env.PORT || 3002
const JWT_SECRET = process.env.JWT_SECRET || 'academy-sim-racing-secret-key'

// Database path - use local database for website
const DB_PATH = path.join(__dirname, 'netcafe.db')

// Middleware
app.use(cors())
app.use(express.json({ 
  limit: '50mb',
  verify: (req, res, buf, encoding) => {
    // Store raw body for error handling
    req.rawBody = buf
  }
}))

// Error handling middleware for JSON parsing
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    console.error('❌ JSON Parse Error:', error.message)
    console.error('Raw body length:', req.rawBody ? req.rawBody.length : 'N/A')
    
    // Try to extract image_url from raw body if it's a base64 image
    if (req.rawBody) {
      const bodyStr = req.rawBody.toString()
      console.log('Body preview:', bodyStr.substring(0, 200))
      
      // If it contains base64 image data, try to fix it
      if (bodyStr.includes('data:image/') && bodyStr.includes('base64,')) {
        try {
          // Try to parse manually and escape properly
          const fixedBody = bodyStr.replace(/\\/g, '\\\\')
          req.body = JSON.parse(fixedBody)
          return next()
        } catch (fixError) {
          console.error('❌ Failed to fix JSON:', fixError.message)
        }
      }
    }
    
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format. Base64 images might be too large or contain invalid characters.'
    })
  }
  next(error)
})

// Database connection helper
function getDB() {
  return new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('❌ Error opening database:', err.message)
      console.error('Database path:', DB_PATH)
    } else {
      console.log('✅ Database connection successful')
    }
  })
}

// Password verification helper (matches NetCafe's SHA256 hashing)
function verifyPassword(password, hash) {
  const crypto = require('crypto')
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex')
  return hashedPassword === hash
}

// JWT middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' })
    }
    req.user = user
    next()
  })
}

// Admin middleware
function requireAdmin(req, res, next) {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ success: false, message: 'Admin access required' })
  }
  next()
}

// Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Academy Sim Racing API is running',
    timestamp: new Date().toISOString(),
    database: 'Connected to NetCafe database'
  })
})

// Login endpoint - READ ONLY (no session creation)
app.post('/api/login', (req, res) => {
  console.log('🔐 Login attempt received:', req.body)
  const { username, password } = req.body

  if (!username || !password) {
    console.log('❌ Missing username or password')
    return res.status(400).json({
      success: false,
      message: 'Username and password are required'
    })
  }

  console.log('🔐 Attempting login for user:', username)
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('❌ Database connection error:', err.message)
      return res.status(500).json({
        success: false,
        message: 'Database connection error'
      })
    }
    
    console.log('✅ Database connection successful for login')
    
    // Database is connected, now run the query
    console.log('🔍 Executing user query for:', username)
    db.get(
      'SELECT id, username, password_hash, is_admin, minutes, is_active, total_spent, created_at FROM users WHERE username = ?',
      [username],
      (err, user) => {
        if (err) {
          console.error('❌ Database query error:', err)
          db.close()
          return res.status(500).json({
            success: false,
            message: 'Database error'
          })
        }
        
        console.log('✅ Query executed successfully, user found:', !!user)

      if (!user) {
        db.close()
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        })
      }

      if (!user.is_active) {
        db.close()
        return res.status(403).json({
          success: false,
          message: 'Account is disabled'
        })
      }

      if (!verifyPassword(password, user.password_hash)) {
        db.close()
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        })
      }

      // Create JWT token for web access only
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          is_admin: user.is_admin
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      )

      // Return user data for web display only - NO SESSION CREATION
      res.json({
        success: true,
        token,
        minutes: user.minutes, // Total minutes played (read-only)
        user: {
          id: user.id,
          username: user.username,
          is_admin: Boolean(user.is_admin),
          total_spent: user.total_spent,
            created_at: user.created_at
        }
      })

        db.close()
      }
    )
  })
})

// Get user profile - with real played time from sessions
app.get('/api/users/:id', authenticateToken, (req, res) => {
  const userId = req.params.id

  // Users can only access their own profile unless they're admin
  if (req.user.id !== parseInt(userId) && !req.user.is_admin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    })
  }

  const db = getDB()
  
  db.get(
    `SELECT 
      u.id, u.username, u.is_admin, u.minutes, u.total_spent, u.created_at,
      COALESCE(SUM(s.duration_minutes), 0) as total_time_played,
      COUNT(CASE WHEN s.is_active = 0 THEN 1 END) as sessions_played,
      COALESCE(ut.xp, 0) as xp,
      COALESCE(ut.minutes_played, u.minutes) as minutes_played
     FROM users u 
     LEFT JOIN sessions s ON u.id = s.user_id
     LEFT JOIN user_tokens ut ON u.id = ut.user_id
     WHERE u.id = ?
     GROUP BY u.id, u.username, u.is_admin, u.minutes, u.total_spent, u.created_at, ut.xp, ut.minutes_played`,
    [userId],
    (err, user) => {
      if (err) {
        console.error('Database error:', err)
        return res.status(500).json({
          success: false,
          message: 'Database error'
        })
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      // Use XP from user_tokens table if available, otherwise calculate from minutes
      const xp = user.xp > 0 ? user.xp : Math.floor((user.minutes || 0) / 60 * 100)
      const totalMinutes = user.total_time_played > 0 ? user.total_time_played : (user.minutes_played || user.minutes || 0)
      const hours = totalMinutes / 60

      res.json({
        success: true,
        user: {
          ...user,
          xp: xp,
          total_time_played: totalMinutes,
          hours_played: Math.round(hours * 10) / 10 // Round to 1 decimal
        }
      })

      db.close()
    }
  )
})

// Get user tokens - calculated from NetCafe minutes
app.get('/api/users/:id/tokens', authenticateToken, (req, res) => {
  const userId = req.params.id

  // Users can only access their own tokens unless they're admin
  if (req.user.id !== parseInt(userId) && !req.user.is_admin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    })
  }

  const db = getDB()
  
  // Get tokens directly from NetCafe user_tokens table
  db.get(
    'SELECT ut.tokens, ut.total_earned, ut.total_spent, u.minutes FROM user_tokens ut JOIN users u ON ut.user_id = u.id WHERE ut.user_id = ?',
    [userId],
    (err, result) => {
      if (err) {
        console.error('Database error:', err)
        return res.status(500).json({
          success: false,
          message: 'Database error'
        })
      }

      if (!result) {
        return res.status(404).json({
                success: false,
          message: 'User tokens not found'
        })
      }

      // Get real data from NetCafe system
      const currentTokens = result.tokens || 0
      const totalEarned = result.total_earned || 0
      const totalSpent = result.total_spent || 0
      const minutes = result.minutes || 0
      const xp = Math.floor(minutes / 60 * 100)
      
      // Calculate tier multiplier for display (informational only)
      let multiplier = 1.0
      if (xp >= 1600) multiplier = 2.0
      else if (xp >= 1000) multiplier = 1.8
      else if (xp >= 450) multiplier = 1.6
      else if (xp >= 150) multiplier = 1.4
      else if (xp >= 50) multiplier = 1.2

            res.json({
              success: true,
        tokens: currentTokens,
        total_earned: totalEarned,
        total_spent: totalSpent,
        xp: xp,
        minutes: minutes,
        tier_multiplier: multiplier
      })

      db.close()
    }
  )
})

// Get shop items
app.get('/api/shop/items', (req, res) => {
  const { category } = req.query
  const db = getDB()
  
  let query = 'SELECT * FROM shop_items WHERE is_active = 1'
  let params = []
  
  if (category) {
    query += ' AND category = ?'
    params.push(category)
  }
  
      query += ' ORDER BY created_at DESC'
  
  db.all(query, params, (err, items) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({
        success: false,
        message: 'Database error'
      })
    }

    res.json({
      success: true,
      items
    })

    db.close()
  })
})

// Get posts/news
app.get('/api/posts', (req, res) => {
  const { category, limit } = req.query
  const db = getDB()
  
  let query = `
    SELECT n.*, u.username as author_name 
    FROM news n 
    LEFT JOIN users u ON n.author_id = u.id 
    WHERE n.is_published = 1
  `
  let params = []
  
  if (category) {
    query += ' AND n.category = ?'
    params.push(category)
  }
  
  query += ' ORDER BY n.featured DESC, n.created_at DESC'
  
  if (limit) {
    query += ' LIMIT ?'
    params.push(parseInt(limit))
  }
  
  db.all(query, params, (err, posts) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({
        success: false,
        message: 'Database error'
      })
    }

    res.json({
      success: true,
      posts
    })

    db.close()
  })
})

// News endpoint alias
app.get('/api/news', (req, res) => {
  const { category, limit } = req.query
  const db = getDB()
  
  let query = `
    SELECT n.*, u.username as author_name 
    FROM news n 
    LEFT JOIN users u ON n.author_id = u.id 
    WHERE n.is_published = 1
  `
  let params = []
  
  if (category) {
    query += ' AND n.category = ?'
    params.push(category)
  }
  
  query += ' ORDER BY n.featured DESC, n.created_at DESC'
  
  if (limit) {
    query += ' LIMIT ?'
    params.push(parseInt(limit))
  }
  
  db.all(query, params, (err, news) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({
        success: false,
        message: 'Database error'
      })
    }

    res.json({
      success: true,
      news
    })

    db.close()
  })
})

// Get leaderboard - use real played time from sessions table
app.get('/api/leaderboard', (req, res) => {
  const { limit = 10 } = req.query
  const db = getDB()
  
  db.all(
    `SELECT 
      u.id, u.username, 
      COALESCE(SUM(s.duration_minutes), 0) as total_time_played,
      COUNT(CASE WHEN s.is_active = 0 THEN 1 END) as sessions_played,
      u.total_spent,
      COALESCE(ut.xp, 0) as xp,
      COALESCE(ut.minutes_played, u.minutes) as minutes_played,
      COALESCE(ut.tokens, 0) as tokens
     FROM users u 
     LEFT JOIN sessions s ON u.id = s.user_id
     LEFT JOIN user_tokens ut ON u.id = ut.user_id
     WHERE u.is_active = 1 AND u.username != 'admin'
     GROUP BY u.id, u.username, u.total_spent, ut.xp, ut.minutes_played, ut.tokens
     ORDER BY ut.xp DESC, u.total_spent DESC
     LIMIT ?`,
    [parseInt(limit)],
    (err, users) => {
      if (err) {
        console.error('Database error:', err)
        return res.status(500).json({
          success: false,
          message: 'Database error'
        })
      }

      // Calculate levels for each user based on their actual XP
      const leaderboard = users.map(user => {
        const xp = user.xp > 0 ? user.xp : Math.floor((user.minutes_played || user.minutes || 0) / 60 * 100)
        const totalMinutes = user.total_time_played > 0 ? user.total_time_played : (user.minutes_played || 0)
        
        let level = 'Rookie'
        
        if (xp >= 1600) {
          level = 'Unreal'
        } else if (xp >= 1000) {
          level = 'Elite'
        } else if (xp >= 450) {
          level = 'Pro'
        } else if (xp >= 150) {
          level = 'Intermediate'
        } else if (xp >= 50) {
          level = 'Novice'
        }
        
        return {
          ...user,
          xp: xp,
          level,
          tokens: user.tokens || 0,
          total_time_played: totalMinutes,
          total_time_minutes: totalMinutes, // For compatibility
          total_sessions: Math.floor(totalMinutes / 60) || 0 // Estimate sessions
        }
      })

      res.json({
        success: true,
        leaderboard
      })

      db.close()
    }
  )
})

// Admin routes
app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  const db = getDB()
  
  db.all(
    `SELECT 
      u.id, u.username, u.is_admin, u.minutes, 
      u.total_spent, u.created_at, u.last_login, u.is_active,
      COALESCE(SUM(s.duration_minutes), 0) as total_time_played,
      COUNT(CASE WHEN s.is_active = 0 THEN 1 END) as sessions_played,
      COALESCE(ut.tokens, 0) as tokens,
      COALESCE(ut.total_earned, 0) as total_earned,
      COALESCE(ut.total_spent, 0) as tokens_spent
     FROM users u 
     LEFT JOIN sessions s ON u.id = s.user_id
     LEFT JOIN user_tokens ut ON u.id = ut.user_id
     GROUP BY u.id, u.username, u.is_admin, u.minutes, u.total_spent, u.created_at, u.last_login, u.is_active, ut.tokens, ut.total_earned, ut.total_spent
     ORDER BY u.created_at DESC`,
    (err, users) => {
      if (err) {
        console.error('Database error:', err)
        return res.status(500).json({
          success: false,
          message: 'Database error'
        })
      }

      // Return users with actual tokens from user_tokens table
      res.json({
        success: true,
        users
      })

      db.close()
    }
  )
})

// Admin: Add tokens to user (using NetCafe user_tokens table)
app.post('/api/admin/tokens/add', authenticateToken, requireAdmin, (req, res) => {
  const { user_id, amount, description } = req.body

  if (!user_id || !amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid user_id and positive amount required'
    })
  }

  const db = getDB()
  
  // Check if user exists and get current tokens
  db.get(
    'SELECT u.id, u.username, ut.tokens, ut.total_earned FROM users u LEFT JOIN user_tokens ut ON u.id = ut.user_id WHERE u.id = ?',
    [user_id],
    function(err, user) {
      if (err) {
        console.error('Error finding user:', err)
        return res.status(500).json({
          success: false,
          message: 'Database error'
        })
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      // Ensure user_tokens record exists
  db.run(
    'INSERT OR IGNORE INTO user_tokens (user_id, tokens) VALUES (?, 0)',
    [user_id],
    function(err) {
      if (err) {
        console.error('Error creating token record:', err)
        return res.status(500).json({
          success: false,
          message: 'Database error'
        })
      }

          // Add tokens to user_tokens table
      db.run(
        'UPDATE user_tokens SET tokens = tokens + ?, total_earned = total_earned + ? WHERE user_id = ?',
        [amount, amount, user_id],
        function(err) {
          if (err) {
            console.error('Error adding tokens:', err)
            return res.status(500).json({
              success: false,
              message: 'Database error'
            })
          }

              // Log transaction in token_transactions table
          db.run(
            'INSERT INTO token_transactions (user_id, amount, transaction_type, description) VALUES (?, ?, ?, ?)',
                [user_id, amount, 'admin_add', description || 'Admin added tokens'],
                function(err) {
                  if (err) {
                    console.log('Note: Could not log transaction:', err.message)
                  }
                }
          )

          // Get updated token count
          db.get(
            'SELECT tokens FROM user_tokens WHERE user_id = ?',
            [user_id],
            (err, updatedTokens) => {
              const newTokenCount = updatedTokens ? updatedTokens.tokens : (user.tokens || 0) + amount

          res.json({
            success: true,
                message: `Successfully added ${amount} tokens to ${user.username}`,
                user: user.username,
                tokens_added: amount,
                previous_tokens: user.tokens || 0,
                new_tokens: newTokenCount
          })

          db.close()
            }
          )
            }
          )
        }
      )
    }
  )
})

// Admin: Get statistics
app.get('/api/admin/stats', authenticateToken, requireAdmin, (req, res) => {
  const db = getDB()
  
  // Get multiple stats in parallel
  const stats = {}
  let completed = 0
  const total = 4

  function checkComplete() {
    completed++
    if (completed === total) {
      res.json({
        success: true,
        stats
      })
      db.close()
    }
  }

  // Total users
  db.get('SELECT COUNT(*) as count FROM users WHERE is_active = 1', (err, result) => {
    if (!err) stats.total_users = result.count
    checkComplete()
  })

  // Total time played (from completed sessions)
  db.get('SELECT SUM(duration_minutes) as total FROM sessions WHERE is_active = 0', (err, result) => {
    if (!err) stats.total_time = result.total || 0
    checkComplete()
  })

  // Total revenue
  db.get('SELECT SUM(total_spent) as total FROM users', (err, result) => {
    if (!err) stats.total_revenue = result.total || 0
    checkComplete()
  })

  // Active sessions
  db.get('SELECT COUNT(*) as count FROM sessions WHERE is_active = 1', (err, result) => {
    if (!err) stats.active_sessions = result.count
    checkComplete()
  })
})

// Admin: Create post
app.post('/api/admin/posts', authenticateToken, requireAdmin, (req, res) => {
  const { title, content, category = 'news', featured = false } = req.body

  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: 'Title and content are required'
    })
  }

  const db = getDB()
  
  db.run(
    'INSERT INTO news (title, content, category, featured, is_published, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [title, content, category, featured ? 1 : 0, 1, new Date().toISOString()],
    function(err) {
      if (err) {
        console.error('Error creating post:', err)
        return res.status(500).json({
          success: false,
          message: 'Database error'
        })
      }

      res.json({
        success: true,
        message: 'Post created successfully',
        post_id: this.lastID
      })

      db.close()
    }
  )
})

// Admin: Update post
app.put('/api/admin/posts/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params
  const { title, content, category, featured } = req.body

  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: 'Title and content are required'
    })
  }

  const db = getDB()
  
  db.run(
    'UPDATE news SET title = ?, content = ?, category = ?, featured = ?, updated_at = ? WHERE id = ?',
    [title, content, category, featured ? 1 : 0, new Date().toISOString(), id],
    function(err) {
      if (err) {
        console.error('Error updating post:', err)
        return res.status(500).json({
          success: false,
          message: 'Database error'
        })
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        })
      }

      res.json({
        success: true,
        message: 'Post updated successfully'
      })

      db.close()
    }
  )
})

// Admin: Delete post
app.delete('/api/admin/posts/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params

  const db = getDB()
  
  db.run(
    'DELETE FROM news WHERE id = ?',
    [id],
    function(err) {
      if (err) {
        console.error('Error deleting post:', err)
        return res.status(500).json({
          success: false,
          message: 'Database error'
        })
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        })
      }

      res.json({
        success: true,
        message: 'Post deleted successfully'
      })

      db.close()
    }
  )
})

// Get posts (public endpoint)
app.get('/api/posts', (req, res) => {
  const db = getDB()
  
  db.all(
    'SELECT id, title, content, category, is_published, featured, created_at, updated_at FROM news WHERE is_published = 1 ORDER BY created_at DESC',
    (err, posts) => {
      if (err) {
        console.error('Database error:', err)
        return res.status(500).json({
          success: false,
          message: 'Database error'
        })
      }

      res.json({
        success: true,
        posts
      })

      db.close()
    }
  )
})

// Get shop items (public endpoint)
app.get('/api/shop/items', (req, res) => {
  const db = getDB()
  
  db.all(
    'SELECT * FROM shop_items WHERE is_active = 1 ORDER BY created_at DESC',
    (err, items) => {
      if (err) {
        console.error('Database error:', err)
        return res.status(500).json({
          success: false,
          message: 'Database error'
        })
      }

      res.json({
        success: true,
        items
      })

      db.close()
    }
  )
})

// Get public statistics (public endpoint)
app.get('/api/stats', (req, res) => {
  const db = getDB()
  
  const stats = {}
  let completed = 0
  const total = 3

  function checkComplete() {
    completed++
    if (completed === total) {
      res.json({
        success: true,
        stats
      })
      db.close()
    }
  }

  // Total registered users
  db.get('SELECT COUNT(*) as count FROM users WHERE is_active = 1', (err, result) => {
    if (!err) stats.total_users = result.count
    checkComplete()
  })

  // Total hours played (from users.minutes field - real NetCafe data)
  db.get('SELECT SUM(minutes) as total FROM users WHERE is_active = 1', (err, result) => {
    if (!err) stats.total_hours = Math.floor((result.total || 0) / 60)
    checkComplete()
  })

  // Active tournaments (from tournaments table)
  db.get('SELECT COUNT(*) as count FROM tournaments WHERE status = "active"', (err, result) => {
    if (!err) stats.active_tournaments = result.count || 0
    checkComplete()
  })
})

// Get recent activity (public endpoint) - Academy course purchases
app.get('/api/recent-activity', (req, res) => {
  const db = getDB()
  
  db.all(
    `SELECT 
      u.username,
      ac.title as course_title,
      ucp.tokens_paid,
      ucp.purchased_at,
      ucp.id
    FROM user_course_purchases ucp
    JOIN users u ON ucp.user_id = u.id
    JOIN courses ac ON ucp.course_id = ac.id
    WHERE u.is_active = 1
    ORDER BY ucp.purchased_at DESC 
    LIMIT 10`,
    (err, activities) => {
      if (err) {
        console.error('Database error:', err)
        db.close()
        return res.status(500).json({
          success: false,
          message: 'Database error'
        })
      }

      // Format the data for frontend
      const formattedActivities = activities.map(activity => ({
        id: activity.id,
        username: activity.username,
        course_title: activity.course_title,
        tokens_paid: activity.tokens_paid,
        purchased_at: activity.purchased_at
      }))

      res.json({
        success: true,
        activities: formattedActivities
      })

      db.close()
    }
  )
})

// Purchase shop item (authenticated)
app.post('/api/shop/purchase', authenticateToken, (req, res) => {
  const { item_id } = req.body
  const userId = req.user.id

  if (!item_id) {
    return res.status(400).json({
      success: false,
      message: 'Item ID is required'
    })
  }

  const db = getDB()
  
  // Start transaction
  db.serialize(() => {
    // Get item details
    db.get(
      'SELECT * FROM shop_items WHERE id = ? AND is_active = 1',
      [item_id],
      (err, item) => {
        if (err) {
          console.error('Database error:', err)
          return res.status(500).json({
            success: false,
            message: 'Database error'
          })
        }

        if (!item) {
          return res.status(404).json({
            success: false,
            message: 'Item not found or inactive'
          })
        }

        // Check stock
        if (item.stock === 0) {
          return res.status(400).json({
            success: false,
            message: 'Item out of stock'
          })
        }

        // Check user's token balance from NetCafe user_tokens table
        db.get(
          'SELECT tokens FROM user_tokens WHERE user_id = ?',
          [userId],
          (err, userTokens) => {
            if (err) {
              console.error('Database error:', err)
              return res.status(500).json({
                success: false,
                message: 'Database error'
              })
            }

            // If user has no token record, create one with 0 tokens
            if (!userTokens) {
              db.run(
                'INSERT INTO user_tokens (user_id, tokens, total_earned, total_spent) VALUES (?, 0, 0, 0)',
                [userId],
                (err) => {
                  if (err) {
                    console.error('Error creating token record:', err)
                    return res.status(500).json({
                      success: false,
                      message: 'Error creating token record'
                    })
                  }
                  
                  return res.status(400).json({
                    success: false,
                    message: `Insufficient tokens. Required: ${item.price}, Available: 0`
                  })
                }
              )
              return
            }

            const currentTokens = userTokens.tokens
            
            if (currentTokens < item.price) {
              return res.status(400).json({
                success: false,
                message: `Insufficient tokens. Required: ${item.price}, Available: ${currentTokens}`
              })
            }

            // Update tokens in NetCafe user_tokens table
            db.run(
              'UPDATE user_tokens SET tokens = tokens - ?, total_spent = total_spent + ? WHERE user_id = ?',
              [item.price, item.price, userId],
              (err) => {
                if (err) {
                  console.error('Error deducting tokens:', err)
                  return res.status(500).json({
                    success: false,
                    message: 'Error processing payment'
                  })
                }

                // Get updated token count
                db.get('SELECT tokens FROM user_tokens WHERE user_id = ?', [userId], (err, updatedTokens) => {
                  if (err) {
                    console.error('Error getting updated tokens:', err)
                    return res.status(500).json({
                      success: false,
                      message: 'Error retrieving updated token count'
                    })
                  }

                  const newTokenCount = updatedTokens ? updatedTokens.tokens : 0

                // Record purchase
                db.run(
                  'INSERT INTO user_purchases (user_id, item_id, tokens_spent) VALUES (?, ?, ?)',
                  [userId, item_id, item.price],
                  function(err) {
                    if (err) {
                      console.error('Error recording purchase:', err)
                      // Refund tokens on purchase failure
                      db.run(
                        'UPDATE user_tokens SET tokens = tokens + ?, total_spent = total_spent - ? WHERE user_id = ?',
                        [item.price, item.price, userId]
                      )
                      return res.status(500).json({
                        success: false,
                        message: 'Error recording purchase'
                      })
                    }

                    // Record token transaction
                    db.run(
                      'INSERT INTO token_transactions (user_id, amount, transaction_type, description, item_id) VALUES (?, ?, ?, ?, ?)',
                      [userId, -item.price, 'shop_purchase', `Purchased ${item.title}`, item_id]
                    )

                    // Update stock if limited
                    if (item.stock > 0) {
                      db.run('UPDATE shop_items SET stock = stock - 1 WHERE id = ?', [item_id])
                    }

                    res.json({
                      success: true,
                      message: 'Purchase successful',
                      item_title: item.title,
                      tokens_spent: item.price,
                        remaining_tokens: newTokenCount
                    })

                    db.close()
                  }
                )
                })
              }
            )
          }
        )
      }
    )
  })
})

// Get user purchases (authenticated)
app.get('/api/user/purchases', authenticateToken, (req, res) => {
  const userId = req.user.id
  const db = getDB()
  
  db.all(`
    SELECT 
      up.id,
      up.tokens_spent,
      up.purchase_date,
      up.status,
      si.title,
      si.icon,
      si.category
    FROM user_purchases up
    JOIN shop_items si ON up.item_id = si.id
    WHERE up.user_id = ?
    ORDER BY up.purchase_date DESC
  `, [userId], (err, purchases) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({
        success: false,
        message: 'Database error'
      })
    }

    res.json({
      success: true,
      purchases
    })

    db.close()
  })
})

// Admin: Create shop item
app.post('/api/admin/shop/items', authenticateToken, requireAdmin, (req, res) => {
  console.log('🔄 Admin creating shop item with body keys:', Object.keys(req.body))
  
  const { title, description, category, price, icon, stock, features, stats, image_url } = req.body

  // Validate and process image_url
  let processedImageUrl = image_url
  if (image_url && image_url.startsWith('data:image/')) {
    console.log('📸 Processing base64 image for shop item, length:', image_url.length)
    // Validate base64 format
    if (!image_url.includes('base64,')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid base64 image format'
      })
    }
    processedImageUrl = image_url // Keep as is for database storage
  }

  console.log('📊 Shop item fields:', { 
    title, description, category, price, icon, stock, features, stats,
    image_url_type: image_url ? (image_url.startsWith('data:') ? 'base64' : 'url') : 'none',
    image_url_length: image_url ? image_url.length : 0
  })

  if (!title || !description || !category || !price) {
    return res.status(400).json({
      success: false,
      message: 'Title, description, category, and price are required'
    })
  }

  const db = getDB()
  
  db.run(`
    INSERT INTO shop_items (title, description, category, price, icon, stock, features, stats, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [title, description, category, price, icon || '🎁', stock || -1, features, stats, processedImageUrl || null], function(err) {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({
        success: false,
        message: 'Database error'
      })
    }

    res.json({
      success: true,
      message: 'Shop item created successfully',
      item_id: this.lastID
    })

    db.close()
  })
})

// Admin: Update shop item
app.put('/api/admin/shop/items/:id', authenticateToken, requireAdmin, (req, res) => {
  const itemId = req.params.id
  console.log('🔄 Admin updating shop item with body keys:', Object.keys(req.body))
  
  const { title, description, category, price, icon, stock, features, stats, is_active, image_url } = req.body

  // Validate and process image_url
  let processedImageUrl = image_url
  if (image_url && image_url.startsWith('data:image/')) {
    console.log('📸 Processing base64 image for shop item update, length:', image_url.length)
    // Validate base64 format
    if (!image_url.includes('base64,')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid base64 image format'
      })
    }
    processedImageUrl = image_url // Keep as is for database storage
  }

  console.log('📊 Shop item update fields:', { 
    title, description, category, price, icon, stock, features, stats, is_active,
    image_url_type: image_url ? (image_url.startsWith('data:') ? 'base64' : 'url') : 'none',
    image_url_length: image_url ? image_url.length : 0
  })

  const db = getDB()
  
  db.run(`
    UPDATE shop_items 
    SET title = COALESCE(?, title),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        price = COALESCE(?, price),
        icon = COALESCE(?, icon),
        stock = COALESCE(?, stock),
        features = COALESCE(?, features),
        stats = COALESCE(?, stats),
        is_active = COALESCE(?, is_active),
        image_url = COALESCE(?, image_url),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [title, description, category, price, icon, stock, features, stats, is_active, processedImageUrl, itemId], function(err) {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({
        success: false,
        message: 'Database error'
      })
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Shop item not found'
      })
    }

    res.json({
      success: true,
      message: 'Shop item updated successfully'
    })

    db.close()
  })
})

// Admin: Delete shop item
app.delete('/api/admin/shop/items/:id', authenticateToken, requireAdmin, (req, res) => {
  const itemId = req.params.id
  const db = getDB()
  
  db.run('DELETE FROM shop_items WHERE id = ?', [itemId], function(err) {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({
        success: false,
        message: 'Database error'
      })
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Shop item not found'
      })
    }

    res.json({
      success: true,
      message: 'Shop item deleted successfully'
    })

    db.close()
  })
})

// Tournament endpoints

// Get tournaments (public endpoint)
app.get('/api/tournaments', (req, res) => {
  const db = getDB()
  const { status } = req.query
  
  let query = `
    SELECT t.*, 
           COUNT(tr.id) as current_participants
    FROM tournaments t
    LEFT JOIN tournament_registrations tr ON t.id = tr.tournament_id
  `
  
  const params = []
  if (status) {
    query += ' WHERE t.status = ?'
    params.push(status)
  }
  
  query += ' GROUP BY t.id ORDER BY t.created_at DESC'
  
  db.all(query, params, (err, tournaments) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({
        success: false,
        message: 'Database error'
      })
    }
    
    // Organize tournaments by status
    const organized = {
      active: tournaments.filter(t => t.status === 'active'),
      upcoming: tournaments.filter(t => t.status === 'upcoming'),
      completed: tournaments.filter(t => t.status === 'completed')
    }
    
    res.json({
      success: true,
      tournaments: organized,
      all: tournaments
    })
    
    db.close()
  })
})

// Get tournament details
app.get('/api/tournaments/:id', (req, res) => {
  const tournamentId = req.params.id
  const db = getDB()
  
  db.get(`
    SELECT t.*, 
           COUNT(tr.id) as current_participants
    FROM tournaments t
    LEFT JOIN tournament_registrations tr ON t.id = tr.tournament_id
    WHERE t.id = ?
    GROUP BY t.id
  `, [tournamentId], (err, tournament) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({
        success: false,
        message: 'Database error'
      })
    }
    
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      })
    }

    res.json({
      success: true,
      tournament
    })

    db.close()
  })
})

// Join tournament (authenticated)
app.post('/api/tournaments/join', authenticateToken, (req, res) => {
  const { tournament_id } = req.body
  const userId = req.user.id

  if (!tournament_id) {
    return res.status(400).json({
      success: false,
      message: 'Tournament ID is required'
    })
  }

  const db = getDB()
  
  // Start transaction
  db.serialize(() => {
    // Check if tournament exists and get details
    db.get(`
      SELECT t.*, COUNT(tr.id) as current_participants
      FROM tournaments t
      LEFT JOIN tournament_registrations tr ON t.id = tr.tournament_id
      WHERE t.id = ?
      GROUP BY t.id
    `, [tournament_id], (err, tournament) => {
      if (err) {
        console.error('Database error:', err)
        return res.status(500).json({
          success: false,
          message: 'Database error'
        })
      }

      if (!tournament) {
        return res.status(404).json({
          success: false,
          message: 'Tournament not found'
        })
      }

      if (tournament.status !== 'active' && tournament.status !== 'upcoming') {
        return res.status(400).json({
          success: false,
          message: 'Tournament is not accepting registrations'
        })
      }

      if (tournament.current_participants >= tournament.max_participants) {
        return res.status(400).json({
          success: false,
          message: 'Tournament is full'
        })
      }

      // Check if user is already registered
      db.get(
        'SELECT id FROM tournament_registrations WHERE tournament_id = ? AND user_id = ?',
        [tournament_id, userId],
        (err, existing) => {
          if (err) {
            console.error('Database error:', err)
            return res.status(500).json({
              success: false,
              message: 'Database error'
            })
          }

          if (existing) {
            return res.status(400).json({
              success: false,
              message: 'Already registered for this tournament'
            })
          }

          // Check user's token balance
          db.get(
            'SELECT tokens FROM user_tokens WHERE user_id = ?',
            [userId],
            (err, userTokens) => {
              if (err) {
                console.error('Database error:', err)
                return res.status(500).json({
                  success: false,
                  message: 'Database error'
                })
              }

              const currentTokens = userTokens ? userTokens.tokens : 0
              
              if (currentTokens < tournament.entry_fee) {
                return res.status(400).json({
                  success: false,
                  message: `Insufficient tokens. Required: ${tournament.entry_fee}, Available: ${currentTokens}`
                })
              }

              // Deduct tokens
              db.run(
                'UPDATE user_tokens SET tokens = tokens - ?, total_spent = total_spent + ? WHERE user_id = ?',
                [tournament.entry_fee, tournament.entry_fee, userId],
                (err) => {
                  if (err) {
                    console.error('Error deducting tokens:', err)
                    return res.status(500).json({
                      success: false,
                      message: 'Error processing payment'
                    })
                  }

                  // Register user for tournament
                  db.run(
                    'INSERT INTO tournament_registrations (tournament_id, user_id, status, notes) VALUES (?, ?, ?, ?)',
                    [tournament_id, userId, 'registered', `Entry fee: ${tournament.entry_fee} tokens`],
                    function(err) {
                      if (err) {
                        console.error('Error registering for tournament:', err)
                        // Refund tokens on registration failure
                        db.run(
                          'UPDATE user_tokens SET tokens = tokens + ?, total_spent = total_spent - ? WHERE user_id = ?',
                          [tournament.entry_fee, tournament.entry_fee, userId]
                        )
                        return res.status(500).json({
                          success: false,
                          message: 'Error registering for tournament'
                        })
                      }

                      // Record token transaction
                      db.run(
                        'INSERT INTO token_transactions (user_id, amount, transaction_type, description) VALUES (?, ?, ?, ?)',
                        [userId, -tournament.entry_fee, 'tournament_entry', `Tournament entry: ${tournament.name}`]
                      )

                      res.json({
                        success: true,
                        message: 'Successfully registered for tournament',
                        tokens_paid: tournament.entry_fee,
                        remaining_tokens: currentTokens - tournament.entry_fee
                      })

                      db.close()
                    }
                  )
                }
              )
            }
          )
        }
      )
    })
  })
})

// Get user's tournament registrations
app.get('/api/tournaments/my-registrations', authenticateToken, (req, res) => {
  const userId = req.user.id
  const db = getDB()
  
  db.all(`
    SELECT 
      t.*,
      tr.notes as tokens_paid_info,
      tr.registration_date as registered_at,
      COUNT(tr2.id) as total_participants
    FROM tournament_registrations tr
    JOIN tournaments t ON tr.tournament_id = t.id
    LEFT JOIN tournament_registrations tr2 ON t.id = tr2.tournament_id
    WHERE tr.user_id = ?
    GROUP BY t.id, tr.id
    ORDER BY t.start_date ASC
  `, [userId], (err, registrations) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({
        success: false,
        message: 'Database error'
      })
    }

    res.json({
      success: true,
      registrations
    })

    db.close()
  })
})

// Admin: Get tournament participants
app.get('/api/admin/tournaments/:id/participants', authenticateToken, requireAdmin, (req, res) => {
  const tournamentId = req.params.id
  const db = getDB()
  
  db.all(`
    SELECT 
      u.id,
      u.username,
      tr.notes as tokens_paid_info,
      tr.registration_date as registered_at
    FROM tournament_registrations tr
    JOIN users u ON tr.user_id = u.id
    WHERE tr.tournament_id = ?
    ORDER BY tr.registration_date ASC
  `, [tournamentId], (err, participants) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({
        success: false,
        message: 'Database error'
      })
    }

    res.json({
      success: true,
      participants
    })

    db.close()
  })
})

// Admin: Create tournament
app.post('/api/admin/tournaments', authenticateToken, requireAdmin, (req, res) => {
  console.log('🔄 Admin creating tournament with body keys:', Object.keys(req.body))
  
  const { 
    name, description, date, prize, entry_fee, max_participants, status, image_url,
    featured, game_type, difficulty
  } = req.body

  // Validate and process image_url
  let processedImageUrl = image_url
  if (image_url && image_url.startsWith('data:image/')) {
    console.log('📸 Processing base64 image, length:', image_url.length)
    // Validate base64 format
    if (!image_url.includes('base64,')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid base64 image format'
      })
    }
    processedImageUrl = image_url // Keep as is for database storage
  }

  console.log('📊 Extracted fields:', { 
    name, description, date, prize, entry_fee, max_participants, status, 
    image_url_type: image_url ? (image_url.startsWith('data:') ? 'base64' : 'url') : 'none',
    image_url_length: image_url ? image_url.length : 0,
    featured, game_type, difficulty 
  })

  if (!name || !date) {
    console.log('❌ Validation failed:', { name: !!name, date: !!date })
    return res.status(400).json({
      success: false,
      message: 'Name and date are required'
    })
  }

  const db = getDB()
  const userId = req.user.id
  
  db.run(`
    INSERT INTO tournaments (
      name, description, status, start_date, end_date,
      max_participants, entry_fee, prize_pool, first_prize, image_url, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `, [
    name, description, status || 'upcoming', date, date,
    max_participants || 32, entry_fee || 0, prize || 0, prize || 0, processedImageUrl || null
  ], function(err) {
      if (err) {
        console.error('Error creating tournament:', err)
        return res.status(500).json({
          success: false,
          message: 'Database error'
        })
      }

      res.json({
        success: true,
        message: 'Tournament created successfully',
        tournament_id: this.lastID
      })

      db.close()
  })
})

// Admin: Update tournament
app.put('/api/admin/tournaments/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params
  const { 
    name, description, date, prize, entry_fee, max_participants, status, image_url,
    featured, game_type, difficulty
  } = req.body

  console.log('🔄 Admin updating tournament with body keys:', Object.keys(req.body))

  // Validate and process image_url
  let processedImageUrl = image_url
  if (image_url && image_url.startsWith('data:image/')) {
    console.log('📸 Processing base64 image for update, length:', image_url.length)
    // Validate base64 format
    if (!image_url.includes('base64,')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid base64 image format'
      })
    }
    processedImageUrl = image_url // Keep as is for database storage
  }

  console.log('📊 Update fields:', { 
    name, description, date, prize, entry_fee, max_participants, status, 
    image_url_type: image_url ? (image_url.startsWith('data:') ? 'base64' : 'url') : 'none',
    image_url_length: image_url ? image_url.length : 0,
    featured, game_type, difficulty 
  })

  if (!name || !date) {
    return res.status(400).json({
      success: false,
      message: 'Name and date are required'
    })
  }

  const db = getDB()
  
  db.run(`
    UPDATE tournaments SET 
      name = ?, description = ?, start_date = ?, end_date = ?, max_participants = ?, 
      entry_fee = ?, prize_pool = ?, first_prize = ?, status = ?, image_url = ?,
      updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `, [
    name, description, date, date, max_participants || 32, entry_fee || 0, 
    prize || 0, prize || 0, status || 'upcoming', processedImageUrl || null, id
  ], function(err) {
      if (err) {
        console.error('Error updating tournament:', err)
        return res.status(500).json({
          success: false,
          message: 'Database error'
        })
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'Tournament not found'
        })
      }

      console.log('✅ Tournament updated successfully!')

      res.json({
        success: true,
        message: 'Tournament updated successfully'
      })

      db.close()
  })
})

// Admin: Delete tournament
app.delete('/api/admin/tournaments/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params
  const db = getDB()
  
  console.log(`🗑️ Admin deleting tournament ${id}`)
  
  // First delete all registrations for this tournament
  db.run('DELETE FROM tournament_registrations WHERE tournament_id = ?', [id], (err) => {
    if (err) {
      console.error('Error deleting tournament registrations:', err)
      return res.status(500).json({
        success: false,
        message: 'Database error'
      })
    }

    console.log(`✅ Deleted registrations for tournament ${id}`)

    // Then delete the tournament itself
    db.run('DELETE FROM tournaments WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Error deleting tournament:', err)
        return res.status(500).json({
          success: false,
          message: 'Database error'
        })
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'Tournament not found'
        })
      }

      console.log(`✅ Tournament ${id} deleted successfully`)

      res.json({
        success: true,
        message: 'Tournament and all registrations deleted successfully'
      })

      db.close()
    })
  })
})

// ============== SIMULATOR ENDPOINTS ==============

// Get all simulators
app.get('/api/simulators', (req, res) => {
  const db = getDB()
  
  db.all(`
    SELECT * FROM simulators 
    ORDER BY name
  `, [], (err, simulators) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({
        success: false,
        message: 'Database error'
      })
    }

    res.json({
      success: true,
      simulators: simulators || []
    })

    db.close()
  })
})

// Get available simulators (excluding those in maintenance)
app.get('/api/simulators/available', (req, res) => {
  const db = getDB()
  
  db.all(`
    SELECT * FROM simulators 
    WHERE status = 'available'
    ORDER BY name
  `, [], (err, simulators) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({
        success: false,
        message: 'Database error'
      })
    }

    res.json({
      success: true,
      simulators: simulators || []
    })

    db.close()
  })
})

// Create new simulator (admin only)
app.post('/api/admin/simulators', authenticateToken, requireAdmin, (req, res) => {
  const { name, description, specs, gpu, setup_type, has_motion, has_vr, screen_setup, image_url, status } = req.body

  if (!name || !specs || !gpu || !setup_type) {
    return res.status(400).json({
      success: false,
      message: 'Name, specs, GPU and setup type are required'
    })
  }

  const db = getDB()
  
  db.run(`
    INSERT INTO simulators (
      name, description, specs, gpu, setup_type, has_motion, has_vr, screen_setup, image_url, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    name, description, specs, gpu, setup_type, 
    has_motion ? 1 : 0, has_vr ? 1 : 0, screen_setup, image_url, status || 'available'
  ], function(err) {
    if (err) {
      console.error('Error creating simulator:', err)
      return res.status(500).json({
        success: false,
        message: 'Database error'
      })
    }

    console.log(`✅ New simulator created: ${name}`)

    res.json({
      success: true,
      message: 'Simulator created successfully',
      simulator_id: this.lastID
    })

    db.close()
  })
})

// Update simulator (admin only)
app.put('/api/admin/simulators/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params
  const { name, description, specs, gpu, setup_type, has_motion, has_vr, screen_setup, image_url, status } = req.body

  if (!name || !specs || !gpu || !setup_type) {
    return res.status(400).json({
      success: false,
      message: 'Name, specs, GPU and setup type are required'
    })
  }

  const db = getDB()
  
  db.run(`
    UPDATE simulators SET 
      name = ?, description = ?, specs = ?, gpu = ?, setup_type = ?, 
      has_motion = ?, has_vr = ?, screen_setup = ?, image_url = ?, status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [
    name, description, specs, gpu, setup_type, 
    has_motion ? 1 : 0, has_vr ? 1 : 0, screen_setup, image_url, status || 'available', id
  ], function(err) {
    if (err) {
      console.error('Error updating simulator:', err)
      return res.status(500).json({
        success: false,
        message: 'Database error'
      })
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Simulator not found'
      })
    }

    console.log(`✅ Simulator updated: ${name}`)

    res.json({
      success: true,
      message: 'Simulator updated successfully'
    })

    db.close()
  })
})

// Delete simulator (admin only)
app.delete('/api/admin/simulators/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params
  const db = getDB()
  
  // Check if simulator has active bookings
  db.get(`
    SELECT COUNT(*) as count FROM bookings 
    WHERE computer_id = ? AND status IN ('pending', 'confirmed') AND date >= date('now')
  `, [id], (err, result) => {
      if (err) {
        console.error('Database error:', err)
        return res.status(500).json({
          success: false,
          message: 'Database error'
        })
      }

      if (result.count > 0) {
        return res.status(400).json({
          success: false,
        message: 'Cannot delete simulator with active bookings'
      })
    }

    // Delete simulator
    db.run('DELETE FROM simulators WHERE id = ?', [id], function(err) {
          if (err) {
        console.error('Error deleting simulator:', err)
            return res.status(500).json({
              success: false,
              message: 'Database error'
            })
          }

          if (this.changes === 0) {
            return res.status(404).json({
              success: false,
          message: 'Simulator not found'
            })
          }

      console.log(`🗑️ Simulator deleted: ID ${id}`)

          res.json({
            success: true,
        message: 'Simulator deleted successfully'
          })

          db.close()
    })
  })
})

// ================== BOOKING ENDPOINTS ==================

// Get all bookings (for admin)
app.get('/api/admin/bookings', authenticateToken, requireAdmin, (req, res) => {
  const db = getDB()
  
  db.all(`
    SELECT 
      b.*,
      u.username as user_name
    FROM bookings b
    LEFT JOIN users u ON b.user_id = u.id
    ORDER BY b.booking_date DESC, b.created_at DESC
  `, [], (err, bookings) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({
        success: false,
        message: 'Database error'
      })
    }

    res.json({
      success: true,
      bookings
    })

    db.close()
  })
})

// Create new booking
app.post('/api/bookings', (req, res) => {
  const { 
    name, phone, email, date, start_time, duration_hours, 
    booking_type, computer_id, special_requests, total_price 
  } = req.body

  if (!name || !phone || !date || !start_time || !duration_hours) {
    return res.status(400).json({
      success: false,
      message: 'Моля попълнете всички задължителни полета'
    })
  }

  // Calculate end time
  const startHour = parseInt(start_time.split(':')[0])
  const endHour = startHour + parseInt(duration_hours)
  const end_time = `${endHour.toString().padStart(2, '0')}:00`

  const db = getDB()
  
  // Check for conflicts - simplified query
  db.get(`
    SELECT id FROM bookings 
    WHERE date = ? 
    AND computer_id = ? 
    AND status != 'cancelled'
    AND start_time < ? 
    AND end_time > ?
  `, [date, computer_id, end_time, start_time], (err, conflict) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({
        success: false,
        message: 'Database error'
      })
    }

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: 'Този час е вече зает. Моля изберете друг час.'
      })
    }

    // Insert booking
    db.run(`
      INSERT INTO bookings (
        user_id, computer_id, booking_date, date, start_time, end_time,
        duration_hours, duration_minutes, total_price, status, booking_type,
        special_requests, phone, email
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)
    `, [
      req.user ? req.user.id : null, computer_id, date, date, start_time, end_time,
      duration_hours, duration_hours * 60, total_price, booking_type || 'standard',
      special_requests, phone, email
    ], function(err) {
      if (err) {
        console.error('Error creating booking:', err)
        return res.status(500).json({
          success: false,
          message: 'Грешка при запазване на резервацията'
        })
      }

      console.log(`✅ New booking created: ${date} ${start_time}-${end_time}`)

      res.json({
        success: true,
        message: 'Резервацията е изпратена успешно!',
        booking_id: this.lastID
      })

      db.close()
    })
  })
})

// Update booking status (admin only)
app.put('/api/admin/bookings/:id/status', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params
  const { status } = req.body

  if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status'
    })
  }

  const db = getDB()
  
  db.run(`
    UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `, [status, id], function(err) {
    if (err) {
      console.error('Error updating booking status:', err)
      return res.status(500).json({
        success: false,
        message: 'Database error'
      })
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      })
    }

    res.json({
      success: true,
      message: 'Booking status updated successfully'
    })

    db.close()
  })
})

// Delete booking (admin only)
app.delete('/api/admin/bookings/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params
  const db = getDB()
  
  db.run('DELETE FROM bookings WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting booking:', err)
      return res.status(500).json({
        success: false,
        message: 'Database error'
      })
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      })
    }

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    })

    db.close()
  })
})

// Get available time slots for a specific date and computer
app.get('/api/bookings/availability', (req, res) => {
  const { date, computer_id } = req.query

  if (!date) {
    return res.status(400).json({
      success: false,
      message: 'Date is required'
    })
  }

  const db = getDB()
  
  let query = `
    SELECT start_time, end_time FROM bookings 
    WHERE date = ? AND status != 'cancelled'
  `
  let params = [date]

  if (computer_id) {
    query += ' AND computer_id = ?'
    params.push(computer_id)
  }

  query += ' ORDER BY start_time'

  db.all(query, params, (err, bookings) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({
        success: false,
        message: 'Database error'
      })
    }

    // Generate available slots (9:00 - 23:00)
    const allSlots = []
    for (let hour = 9; hour <= 22; hour++) {
      allSlots.push(`${hour.toString().padStart(2, '0')}:00`)
    }

    // Filter out booked slots
    const bookedSlots = new Set()
    bookings.forEach(booking => {
      const startHour = parseInt(booking.start_time.split(':')[0])
      const endHour = parseInt(booking.end_time.split(':')[0])
      
      for (let hour = startHour; hour < endHour; hour++) {
        bookedSlots.add(`${hour.toString().padStart(2, '0')}:00`)
      }
    })

    const availableSlots = allSlots.filter(slot => !bookedSlots.has(slot))

    res.json({
      success: true,
      available_slots: availableSlots,
      booked_slots: Array.from(bookedSlots)
    })

    db.close()
  })
})

// Helper function to get user from token
async function getUserFromToken(token) {
  return new Promise((resolve, reject) => {
    if (!token) {
      return reject(new Error('Token required'))
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return reject(new Error('Invalid token'))
      }

      const db = getDB()
      db.get(
        `SELECT 
          u.id, u.username, u.is_admin, u.minutes, u.total_spent, u.created_at, u.last_login,
          COALESCE(SUM(s.duration_minutes), 0) as total_time_played,
          COUNT(CASE WHEN s.is_active = 0 THEN 1 END) as sessions_played
         FROM users u 
         LEFT JOIN sessions s ON u.id = s.user_id
         WHERE u.id = ?
         GROUP BY u.id, u.username, u.is_admin, u.minutes, u.total_spent, u.created_at, u.last_login`,
        [decoded.id],
        (err, user) => {
          db.close()
          
          if (err) {
            return reject(new Error('Database error'))
          }

          if (!user) {
            return reject(new Error('User not found'))
          }

          // Calculate tokens from real played time
          const totalMinutes = user.total_time_played || 0
          const hours = totalMinutes / 60
          const baseTokens = Math.floor(hours * 100) // 100 tokens per hour

          // Calculate tier multiplier
          let tierMultiplier = 1.0
          if (baseTokens >= 1600) tierMultiplier = 2.0       // Unreal: 2x multiplier
          else if (baseTokens >= 1000) tierMultiplier = 1.75  // Elite: 1.75x multiplier
          else if (baseTokens >= 450) tierMultiplier = 1.5    // Pro: 1.5x multiplier
          else if (baseTokens >= 150) tierMultiplier = 1.25   // Intermediate: 1.25x multiplier
          else if (baseTokens >= 50) tierMultiplier = 1.1     // Novice: 1.1x multiplier

          const finalTokens = Math.floor(baseTokens * tierMultiplier)

          resolve({
            ...user,
            tokens: finalTokens
          })
        }
      )
    })
  })
}

// ACADEMY API ENDPOINTS

// Get all academy courses (public endpoint)
app.get('/api/academy/courses', (req, res) => {
  const db = getDB()
  
  db.all(`
    SELECT 
      c.id, c.title, c.description, c.price_tokens, c.thumbnail_url, 
      c.youtube_url, c.duration, c.difficulty, c.status as is_active,
      cat.name as category_name, cat.icon as category_icon,
      c.category_id
    FROM courses c
    LEFT JOIN course_categories cat ON c.category_id = cat.id
    WHERE c.status = 'active'
    ORDER BY c.created_at DESC
  `, (err, courses) => {
    if (err) {
      console.error('Error loading academy courses:', err)
      return res.status(500).json({
        success: false,
        message: 'Database error'
      })
    }

    res.json({
      success: true,
      courses: courses || []
    })

    db.close()
  })
})

// Get academy categories (public endpoint)
app.get('/api/academy/categories', (req, res) => {
  const db = getDB()
  
  db.all(`
    SELECT id, name, description, icon
    FROM course_categories
    ORDER BY name
  `, (err, categories) => {
    if (err) {
      console.error('Error loading academy categories:', err)
      return res.status(500).json({
        success: false,
        message: 'Database error'
      })
    }

    res.json({
      success: true,
      categories: categories || []
    })

    db.close()
  })
})

// Get user's purchased courses
app.get('/api/academy/my-courses', authenticateToken, (req, res) => {
  const db = getDB()
  
  db.all(`
    SELECT 
      c.id, c.title, c.description, c.price_tokens, c.thumbnail_url, 
      c.youtube_url, c.duration, c.difficulty,
      cat.name as category_name, cat.icon as category_icon,
      p.purchased_at, p.tokens_paid
    FROM user_course_purchases p
    JOIN courses c ON p.course_id = c.id
    LEFT JOIN course_categories cat ON c.category_id = cat.id
    WHERE p.user_id = ?
    ORDER BY p.purchased_at DESC
  `, [req.user.id], (err, courses) => {
    if (err) {
      console.error('Error loading user courses:', err)
      return res.status(500).json({
        success: false,
        message: 'Database error'
      })
    }

    res.json({
      success: true,
      courses: courses || []
    })

    db.close()
  })
})

// Purchase academy course
app.post('/api/academy/purchase', authenticateToken, (req, res) => {
  const { courseId } = req.body

  if (!courseId) {
    return res.status(400).json({
      success: false,
      message: 'Course ID is required'
    })
  }

  const db = getDB()
  
  // First, check if user already purchased this course
  db.get(`
    SELECT id FROM user_course_purchases 
    WHERE user_id = ? AND course_id = ?
  `, [req.user.id, courseId], (err, existingPurchase) => {
    if (err) {
      console.error('Error checking existing purchase:', err)
      return res.status(500).json({
        success: false,
        message: 'Database error'
      })
    }

    if (existingPurchase) {
      return res.status(400).json({
        success: false,
        message: 'You have already purchased this course'
      })
    }

    // Get course details and user data  
    db.get(`
      SELECT 
        c.price_tokens,
        c.title
      FROM courses c
      WHERE c.id = ? AND c.status = 'active'
    `, [courseId], (err, course) => {
      if (err) {
        console.error('Error getting course data:', err)
        return res.status(500).json({
          success: false,
          message: 'Database error'
        })
      }

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found or inactive'
        })
      }

              // Check user's token balance from user_tokens table (same as tournaments)
        db.get(
          'SELECT tokens FROM user_tokens WHERE user_id = ?',
          [req.user.id],
          (err, userTokens) => {
            if (err) {
              console.error('Database error:', err)
              return res.status(500).json({
                success: false,
                message: 'Database error'
              })
            }

            const currentTokens = userTokens ? userTokens.tokens : 0
            
            if (currentTokens < course.price_tokens) {
              return res.status(400).json({
                success: false,
                message: `Insufficient tokens. Required: ${course.price_tokens}, Available: ${currentTokens}`
              })
            }

            // Deduct tokens from user_tokens table (same as tournaments)
            db.run(
              'UPDATE user_tokens SET tokens = tokens - ?, total_spent = total_spent + ? WHERE user_id = ?',
              [course.price_tokens, course.price_tokens, req.user.id],
              (err) => {
                if (err) {
                  console.error('Error deducting tokens:', err)
                  return res.status(500).json({
                    success: false,
                    message: 'Error processing payment'
                  })
                }

                // Record the purchase
                db.run(`
                  INSERT INTO user_course_purchases (user_id, course_id, tokens_paid)
                  VALUES (?, ?, ?)
                `, [req.user.id, courseId, course.price_tokens], function(err) {
                  if (err) {
                    console.error('Error recording purchase:', err)
                    // Refund tokens on purchase failure
                    db.run(
                      'UPDATE user_tokens SET tokens = tokens + ?, total_spent = total_spent - ? WHERE user_id = ?',
                      [course.price_tokens, course.price_tokens, req.user.id]
                    )
                    return res.status(500).json({
                      success: false,
                      message: 'Error processing purchase'
                    })
                  }

                  // Record token transaction (same as tournaments)
                  db.run(
                    'INSERT INTO token_transactions (user_id, amount, transaction_type, description) VALUES (?, ?, ?, ?)',
                    [req.user.id, -course.price_tokens, 'academy_course', `Academy course: ${course.title}`]
                  )

                  console.log(`✅ Course purchased: User ${req.user.id} bought course ${courseId} for ${course.price_tokens} tokens`)

                  res.json({
                    success: true,
                    message: 'Course purchased successfully!',
                    purchase_id: this.lastID,
                    tokens_spent: course.price_tokens,
                    remaining_tokens: currentTokens - course.price_tokens
                  })

                  db.close()
                })
              }
            )
          }
        )
    })
  })
})

// ADMIN ACADEMY ENDPOINTS

// Get all academy courses (admin)
app.get('/api/admin/academy/courses', authenticateToken, requireAdmin, (req, res) => {
  const db = getDB()
  
  db.all(`
    SELECT 
      c.id, c.title, c.description, c.price_tokens, c.thumbnail_url, 
      c.youtube_url, c.duration, c.difficulty, c.status as is_active, c.category_id,
      cat.name as category_name, cat.icon as category_icon
    FROM courses c
    LEFT JOIN course_categories cat ON c.category_id = cat.id
    ORDER BY c.created_at DESC
  `, (err, courses) => {
    if (err) {
      console.error('Error loading academy courses:', err)
      return res.status(500).json({
        success: false,
        message: 'Database error'
      })
    }

    res.json({
      success: true,
      courses: courses || []
    })

    db.close()
  })
})

// Create academy course (admin)
app.post('/api/admin/academy/courses', authenticateToken, requireAdmin, (req, res) => {
  const {
    title, description, price_tokens, thumbnail_url, youtube_url,
    duration, difficulty, category_id, is_active
  } = req.body

  if (!title || !description || !price_tokens || !youtube_url) {
    return res.status(400).json({
      success: false,
      message: 'Title, description, price, and YouTube URL are required'
    })
  }

  const db = getDB()
  
  db.run(`
    INSERT INTO courses (
      title, description, price_tokens, thumbnail_url, youtube_url,
      duration, difficulty, category_id, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    title, description, price_tokens, thumbnail_url || null, youtube_url,
    duration || null, difficulty || 'beginner', category_id || null, is_active !== false ? 'active' : 'inactive'
  ], function(err) {
    if (err) {
      console.error('Error creating academy course:', err)
      return res.status(500).json({
        success: false,
        message: 'Error creating course'
      })
    }

    console.log(`✅ Academy course created: ${title}`)

    res.json({
      success: true,
      message: 'Course created successfully',
      course_id: this.lastID
    })

    db.close()
  })
})

// Update academy course (admin)
app.put('/api/admin/academy/courses/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params
  const {
    title, description, price_tokens, thumbnail_url, youtube_url,
    duration, difficulty, category_id, is_active
  } = req.body

  const db = getDB()
  
  db.run(`
    UPDATE courses SET
      title = ?, description = ?, price_tokens = ?, thumbnail_url = ?,
      youtube_url = ?, duration = ?, difficulty = ?, category_id = ?, status = ?
    WHERE id = ?
  `, [
    title, description, price_tokens, thumbnail_url || null, youtube_url,
    duration || null, difficulty || 'beginner', category_id || null, 
    is_active !== false ? 'active' : 'inactive', id
  ], function(err) {
    if (err) {
      console.error('Error updating academy course:', err)
      return res.status(500).json({
        success: false,
        message: 'Error updating course'
      })
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      })
    }

    console.log(`✅ Academy course updated: ${id}`)

    res.json({
      success: true,
      message: 'Course updated successfully'
    })

    db.close()
  })
})

// Delete academy course (admin)
app.delete('/api/admin/academy/courses/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params
  const db = getDB()
  
  db.run('DELETE FROM courses WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting academy course:', err)
      return res.status(500).json({
        success: false,
        message: 'Error deleting course'
      })
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      })
    }

    console.log(`✅ Academy course deleted: ${id}`)

    res.json({
      success: true,
      message: 'Course deleted successfully'
    })

    db.close()
  })
})

// Get all academy categories (admin)
app.get('/api/admin/academy/categories', authenticateToken, requireAdmin, (req, res) => {
  const db = getDB()
  
  db.all('SELECT * FROM course_categories ORDER BY name', [], (err, categories) => {
    if (err) {
      console.error('Error getting academy categories:', err)
      return res.status(500).json({
        success: false,
        message: 'Error loading categories'
      })
    }

    console.log(`✅ Loaded ${categories.length} academy categories`)
    
    res.json({
      success: true,
      categories: categories || []
    })

    db.close()
  })
})

// Create academy category (admin)
app.post('/api/admin/academy/categories', authenticateToken, requireAdmin, (req, res) => {
  const { name, description, icon } = req.body

  if (!name || !icon) {
    return res.status(400).json({
      success: false,
      message: 'Name and icon are required'
    })
  }

  const db = getDB()
  
  db.run(`
    INSERT INTO course_categories (name, description, icon)
    VALUES (?, ?, ?)
  `, [name, description || null, icon], function(err) {
    if (err) {
      console.error('Error creating academy category:', err)
      return res.status(500).json({
        success: false,
        message: 'Error creating category'
      })
    }

    console.log(`✅ Academy category created: ${name}`)

    res.json({
      success: true,
      message: 'Category created successfully',
      category_id: this.lastID
    })

    db.close()
  })
})

// Update academy category (admin)
app.put('/api/admin/academy/categories/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params
  const { name, description, icon } = req.body

  const db = getDB()
  
  db.run(`
    UPDATE course_categories SET name = ?, description = ?, icon = ?
    WHERE id = ?
  `, [name, description || null, icon, id], function(err) {
    if (err) {
      console.error('Error updating academy category:', err)
      return res.status(500).json({
        success: false,
        message: 'Error updating category'
      })
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      })
    }

    console.log(`✅ Academy category updated: ${id}`)

    res.json({
      success: true,
      message: 'Category updated successfully'
    })

    db.close()
  })
})

// Delete academy category (admin)
app.delete('/api/admin/academy/categories/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params
  const db = getDB()
  
  db.run('DELETE FROM course_categories WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting academy category:', err)
      return res.status(500).json({
        success: false,
        message: 'Error deleting category'
      })
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      })
    }

    console.log(`✅ Academy category deleted: ${id}`)

    res.json({
      success: true,
      message: 'Category deleted successfully'
    })

    db.close()
  })
})

// Start server
console.log('🔄 Starting server...')

// Add error handling middleware for JSON parsing
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    console.error('❌ JSON Parse Error:', error.message)
    console.error('❌ Request body:', req.body)
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format'
    })
  }
  next(error)
})

// Setup production sync endpoints (for receiving data from NetCafe bridge)
const { setupSyncEndpoints } = require('./sync-endpoints')
setupSyncEndpoints(app)

app.listen(PORT, () => {
  console.log(`🚀 Academy Sim Racing API Server running on port ${PORT}`)
  console.log(`📁 Using database: ${DB_PATH}`)
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🔄 NetCafe Sync API: http://localhost:${PORT}/api/sync/status`)
  console.log(`📡 Production Bridge Sync: http://localhost:${PORT}/api/sync/users`)
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...')
  process.exit(0)
}) 