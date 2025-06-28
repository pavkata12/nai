const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// External API for NetCafe remote connections
class ExternalAPI {
  constructor(app, getDB) {
    this.app = app;
    this.getDB = getDB;
    this.setupExternalEndpoints();
  }

  // Middleware to verify external API key
  verifyExternalAPIKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    const validKey = process.env.EXTERNAL_API_KEY || 'netcafe-external-key-2024';
    
    if (!apiKey || apiKey !== validKey) {
      console.log('❌ Invalid external API key:', apiKey);
      return res.status(401).json({
        success: false,
        message: 'Invalid external API key'
      });
    }
    
    console.log('✅ External API key verified');
    next();
  }

  // Rate limiting for external connections
  rateLimitExternal(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // Simple rate limiting - 60 requests per minute
    if (!this.rateLimitStore) this.rateLimitStore = {};
    if (!this.rateLimitStore[ip]) this.rateLimitStore[ip] = [];
    
    // Clean old requests
    this.rateLimitStore[ip] = this.rateLimitStore[ip].filter(time => now - time < 60000);
    
    if (this.rateLimitStore[ip].length >= 60) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded'
      });
    }
    
    this.rateLimitStore[ip].push(now);
    next();
  }

  setupExternalEndpoints() {
    // Apply middleware to all external routes
    this.app.use('/api/external/*', this.verifyExternalAPIKey.bind(this));
    this.app.use('/api/external/*', this.rateLimitExternal.bind(this));

    // 1. External login for NetCafe clients
    this.app.post('/api/external/login', async (req, res) => {
      try {
        const { username, password, computer_id } = req.body;
        
        if (!username || !password || !computer_id) {
          return res.status(400).json({
            success: false,
            message: 'Missing required fields'
          });
        }

        const db = this.getDB();
        
        // Find user
        const user = await new Promise((resolve, reject) => {
          db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });

        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
          });
        }

        // Verify password (assuming bcrypt)
        const passwordValid = await bcrypt.compare(password, user.password_hash);
        if (!passwordValid) {
          return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
          });
        }

        // Check if user has time/tokens
        const userTokens = await this.getUserTokens(user.id, db);
        if (userTokens < 60) { // Need at least 60 tokens (1 hour)
          return res.status(403).json({
            success: false,
            message: 'Insufficient tokens. Please purchase more time.'
          });
        }

        // Create session
        const sessionId = crypto.randomBytes(16).toString('hex');
        const startTime = new Date().toISOString();
        
        await new Promise((resolve, reject) => {
          db.run(`
            INSERT INTO sessions (session_id, user_id, computer_id, start_time, is_active)
            VALUES (?, ?, ?, ?, 1)
          `, [sessionId, user.id, computer_id, startTime], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        console.log(`🔐 External login: ${username} on ${computer_id}`);

        res.json({
          success: true,
          session_id: sessionId,
          user: {
            id: user.id,
            username: user.username,
            is_admin: user.is_admin,
            tokens: userTokens
          },
          minutes: Math.floor(userTokens / 100) // 100 tokens = 1 hour
        });

      } catch (error) {
        console.error('External login error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    });

    // 2. Session status/update
    this.app.post('/api/external/session', async (req, res) => {
      try {
        const { session_id, action, duration } = req.body;
        
        if (!session_id || !action) {
          return res.status(400).json({
            success: false,
            message: 'Missing session_id or action'
          });
        }

        const db = this.getDB();

        if (action === 'end') {
          // End session and calculate cost
          const endTime = new Date().toISOString();
          
          await new Promise((resolve, reject) => {
            db.run(`
              UPDATE sessions 
              SET end_time = ?, is_active = 0, duration_minutes = ?
              WHERE session_id = ?
            `, [endTime, duration || 0, session_id], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });

          // Deduct tokens (100 tokens per hour)
          if (duration) {
            const tokensToDeduct = Math.ceil((duration / 60) * 100);
            await this.deductTokens(session_id, tokensToDeduct, db);
          }

          console.log(`🛑 External session ended: ${session_id}`);
        }

        res.json({
          success: true,
          message: `Session ${action} successful`
        });

      } catch (error) {
        console.error('External session error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    });

    // 3. External status check
    this.app.get('/api/external/status', (req, res) => {
      res.json({
        success: true,
        status: 'online',
        timestamp: new Date().toISOString(),
        api_version: '1.0',
        endpoints: [
          'POST /api/external/login',
          'POST /api/external/session',
          'GET /api/external/status',
          'POST /api/external/webhook'
        ]
      });
    });

    // 4. Webhook receiver (for notifications from NetCafe)
    this.app.post('/api/external/webhook', (req, res) => {
      try {
        const { event, data } = req.body;
        
        console.log(`📡 External webhook: ${event}`, data);

        // Process webhook based on event type
        switch (event) {
          case 'session_start':
            this.handleExternalSessionStart(data);
            break;
          case 'session_end':
            this.handleExternalSessionEnd(data);
            break;
          case 'user_purchase':
            this.handleExternalUserPurchase(data);
            break;
          default:
            console.log(`Unknown external webhook: ${event}`);
        }

        res.json({
          success: true,
          message: `Webhook ${event} processed`
        });

      } catch (error) {
        console.error('External webhook error:', error);
        res.status(500).json({
          success: false,
          message: 'Webhook processing failed'
        });
      }
    });

    console.log('🌐 External API initialized');
    console.log('🔑 External endpoints protected with API key');
    console.log('⚡ Rate limiting: 60 requests/minute per IP');
  }

  // Helper methods
  async getUserTokens(userId, db) {
    return new Promise((resolve, reject) => {
      db.get('SELECT tokens FROM user_tokens WHERE user_id = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.tokens : 0);
      });
    });
  }

  async deductTokens(sessionId, tokens, db) {
    // Get user_id from session
    const session = await new Promise((resolve, reject) => {
      db.get('SELECT user_id FROM sessions WHERE session_id = ?', [sessionId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (session) {
      await new Promise((resolve, reject) => {
        db.run(`
          UPDATE user_tokens 
          SET tokens = tokens - ?
          WHERE user_id = ?
        `, [tokens, session.user_id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }

  // Webhook handlers
  handleExternalSessionStart(data) {
    console.log('🎮 External session started:', data);
    // Update local database if needed
  }

  handleExternalSessionEnd(data) {
    console.log('🛑 External session ended:', data);
    // Update local database, recalculate tokens, etc.
  }

  handleExternalUserPurchase(data) {
    console.log('💰 External purchase:', data);
    // Update user tokens, send confirmation, etc.
  }
}

module.exports = ExternalAPI; 