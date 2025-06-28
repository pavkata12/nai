const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const path = require('path');

// Sync API endpoints for NetCafe <-> Cloud synchronization
class NetCafeSyncAPI {
  constructor(app, getDB) {
    this.app = app;
    this.getDB = getDB;
    this.setupSyncEndpoints();
  }

  // Generate API key for NetCafe authentication
  generateAPIKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Verify NetCafe API key
  verifyNetCafeAuth(req, res, next) {
    const apiKey = req.headers['x-netcafe-api-key'];
    const validKey = process.env.NETCAFE_API_KEY || 'netcafe-bridge-2024-secure-key';
    
    if (!apiKey || apiKey !== validKey) {
      return res.status(401).json({
        success: false,
        message: 'Invalid NetCafe API key'
      });
    }
    
    next();
  }

  setupSyncEndpoints() {
    // 1. Bulk sync users from NetCafe to Cloud
    this.app.post('/api/sync/users', this.verifyNetCafeAuth.bind(this), (req, res) => {
      const { users } = req.body;
      
      if (!users || !Array.isArray(users)) {
        return res.status(400).json({
          success: false,
          message: 'Users array is required'
        });
      }

      const db = this.getDB();
      let syncedCount = 0;
      let errors = [];

      const syncUser = (user) => {
        return new Promise((resolve, reject) => {
          db.run(`
            INSERT OR REPLACE INTO users (
              id, username, password_hash, is_admin, minutes, 
              is_active, total_spent, created_at, last_login
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            user.id, user.username, user.password_hash, user.is_admin,
            user.minutes, user.is_active, user.total_spent, 
            user.created_at, user.last_login
          ], (err) => {
            if (err) {
              errors.push(`User ${user.username}: ${err.message}`);
              reject(err);
            } else {
              syncedCount++;
              resolve();
            }
          });
        });
      };

      Promise.allSettled(users.map(syncUser))
        .then(() => {
          db.close();
          res.json({
            success: true,
            message: `Synced ${syncedCount} users from NetCafe`,
            synced: syncedCount,
            errors: errors
          });
        });
    });

    // 2. Bulk sync sessions from NetCafe to Cloud
    this.app.post('/api/sync/sessions', this.verifyNetCafeAuth.bind(this), (req, res) => {
      const { sessions } = req.body;
      
      if (!sessions || !Array.isArray(sessions)) {
        return res.status(400).json({
          success: false,
          message: 'Sessions array is required'
        });
      }

      const db = this.getDB();
      let syncedCount = 0;
      let errors = [];

      const syncSession = (session) => {
        return new Promise((resolve, reject) => {
          db.run(`
            INSERT OR REPLACE INTO sessions (
              id, user_id, duration_minutes, is_active, 
              start_time, end_time
            ) VALUES (?, ?, ?, ?, ?, ?)
          `, [
            session.id, session.user_id, session.duration_minutes,
            session.is_active, session.start_time, session.end_time
          ], (err) => {
            if (err) {
              errors.push(`Session ${session.id}: ${err.message}`);
              reject(err);
            } else {
              syncedCount++;
              resolve();
            }
          });
        });
      };

      Promise.allSettled(sessions.map(syncSession))
        .then(() => {
          // Recalculate tokens after syncing sessions
          this.recalculateTokens(sessions.map(s => s.user_id), db)
            .then(() => {
              db.close();
              res.json({
                success: true,
                message: `Synced ${syncedCount} sessions and recalculated tokens`,
                synced: syncedCount,
                errors: errors
              });
            });
        });
    });

    // 3. Get cloud database status
    this.app.get('/api/sync/status', this.verifyNetCafeAuth.bind(this), (req, res) => {
      const db = this.getDB();
      
      const queries = [
        'SELECT COUNT(*) as count FROM users',
        'SELECT COUNT(*) as count FROM sessions', 
        'SELECT COUNT(*) as count FROM user_tokens',
        'SELECT COUNT(*) as count FROM shop_items',
        'SELECT COUNT(*) as count FROM tournaments'
      ];

      Promise.all(queries.map(query => {
        return new Promise((resolve, reject) => {
          db.get(query, (err, row) => {
            if (err) reject(err);
            else resolve(row.count);
          });
        });
      }))
      .then(results => {
        db.close();
        res.json({
          success: true,
          cloud_status: {
            users: results[0],
            sessions: results[1], 
            tokens: results[2],
            shop_items: results[3],
            tournaments: results[4],
            last_sync: new Date().toISOString()
          }
        });
      })
      .catch(err => {
        db.close();
        res.status(500).json({
          success: false,
          message: 'Failed to get status',
          error: err.message
        });
      });
    });

    // 4. Real-time webhook for immediate updates
    this.app.post('/api/sync/webhook', this.verifyNetCafeAuth.bind(this), (req, res) => {
      const { event, data } = req.body;

      console.log(`🔄 NetCafe Webhook: ${event}`, data);

      switch (event) {
        case 'session_end':
          this.handleSessionEnd(data);
          break;
        case 'user_created':
          this.handleUserCreated(data);
          break;
        case 'user_updated':
          this.handleUserUpdated(data);
          break;
        default:
          console.log(`Unknown webhook event: ${event}`);
      }

      res.json({
        success: true,
        message: `Webhook ${event} processed`
      });
    });

    console.log('🔄 NetCafe Sync API initialized');
    console.log('📡 Sync endpoints:');
    console.log('  POST /api/sync/users - Bulk sync users');
    console.log('  POST /api/sync/sessions - Bulk sync sessions');
    console.log('  GET  /api/sync/status - Get cloud status');
    console.log('  POST /api/sync/webhook - Real-time notifications');
    console.log('');
    console.log('🔑 API Key required: x-netcafe-api-key header');
  }

  // Recalculate tokens based on playing time
  recalculateTokens(userIds, db) {
    return new Promise((resolve) => {
      const uniqueUserIds = [...new Set(userIds)];

      const promises = uniqueUserIds.map(userId => {
        return new Promise((resolveUser) => {
          db.get(`
            SELECT 
              u.id, u.username,
              COALESCE(SUM(s.duration_minutes), 0) as total_minutes
            FROM users u 
            LEFT JOIN sessions s ON u.id = s.user_id AND s.is_active = 0
            WHERE u.id = ?
            GROUP BY u.id
          `, [userId], (err, user) => {
            if (err || !user) {
              resolveUser();
              return;
            }

            const totalMinutes = user.total_minutes || 0;
            const hours = totalMinutes / 60;
            const xp = Math.floor(hours * 100);

            // Calculate tier multiplier
            let levelMultiplier = 1.0;
            if (xp >= 1600) levelMultiplier = 2.0;
            else if (xp >= 1000) levelMultiplier = 1.8;
            else if (xp >= 450) levelMultiplier = 1.6;
            else if (xp >= 150) levelMultiplier = 1.4;
            else if (xp >= 50) levelMultiplier = 1.2;

            const baseTokens = hours * 100;
            const earnedTokens = Math.floor(baseTokens * levelMultiplier);

            db.run(`
              INSERT OR REPLACE INTO user_tokens (
                user_id, tokens, total_earned, last_updated
              ) VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            `, [userId, earnedTokens, earnedTokens], () => {
              console.log(`💰 Tokens updated for user ${userId}: ${earnedTokens}`);
              resolveUser();
            });
          });
        });
      });

      Promise.allSettled(promises).then(() => resolve());
    });
  }

  // Webhook handlers
  handleSessionEnd(data) {
    if (!data.session) return;
    
    const db = this.getDB();
    const session = data.session;
    
    db.run(`
      INSERT OR REPLACE INTO sessions (
        id, user_id, duration_minutes, is_active, 
        start_time, end_time
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      session.id, session.user_id, session.duration_minutes,
      session.is_active, session.start_time, session.end_time
    ], (err) => {
      if (!err) {
        this.recalculateTokens([session.user_id], db)
          .then(() => db.close());
      }
    });
  }

  handleUserCreated(data) {
    if (!data.user) return;
    
    const db = this.getDB();
    const user = data.user;
    
    db.run(`
      INSERT OR REPLACE INTO users (
        id, username, password_hash, is_admin, minutes, 
        is_active, total_spent, created_at, last_login
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      user.id, user.username, user.password_hash, user.is_admin,
      user.minutes, user.is_active, user.total_spent, 
      user.created_at, user.last_login
    ], () => {
      db.close();
      console.log(`✨ New user synced: ${user.username}`);
    });
  }

  handleUserUpdated(data) {
    if (!data.user) return;
    
    const db = this.getDB();
    const user = data.user;
    
    db.run(`
      INSERT OR REPLACE INTO users (
        id, username, password_hash, is_admin, minutes, 
        is_active, total_spent, created_at, last_login
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      user.id, user.username, user.password_hash, user.is_admin,
      user.minutes, user.is_active, user.total_spent, 
      user.created_at, user.last_login
    ], () => {
      db.close();
      console.log(`🔄 User updated: ${user.username}`);
    });
  }
}

module.exports = NetCafeSyncAPI; 