import { defineStore } from 'pinia'
import { netcafeAPI } from '../api/netcafe-api.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),

  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated,
    userTier: (state) => {
      if (!state.user || !state.user.xp) return { name: 'Rookie', color: '#666666' }
      const xp = state.user.xp
      if (xp >= 1600) return { name: 'Unreal', color: '#00ff00' }
      if (xp >= 1000) return { name: 'Elite', color: '#8800ff' }
      if (xp >= 450) return { name: 'Pro', color: '#ff0088' }
      if (xp >= 150) return { name: 'Intermediate', color: '#ff8800' }
      if (xp >= 50) return { name: 'Novice', color: '#0088ff' }
      return { name: 'Rookie', color: '#666666' }
    },
    userXP: (state) => state.user?.xp || 0,
    userTokens: (state) => state.user?.tokens || 0,
    
    // Helper method to get formatted token display
    userTokensFormatted: (state) => {
      const tokens = state.user?.tokens || 0
      return `${tokens}` // Ще показваме превода в компонентите
    },
    
    // Helper method to check if user has enough tokens
    hasEnoughTokens: (state) => (requiredTokens) => {
      const currentTokens = state.user?.tokens || 0
      return currentTokens >= requiredTokens
    },
    
    xpMultiplier: (state) => {
      const tier = state.userTier
      const multipliers = {
        'Rookie': 1.0,
        'Novice': 1.2,
        'Intermediate': 1.4,
        'Pro': 1.6,
        'Elite': 1.8,
        'Unreal': 2.0
      }
      return multipliers[tier.name] || 1.0
    }
  },

  actions: {
    async login(credentials) {
      this.loading = true
      this.error = null
      
      try {
        // Use NetCafe API for authentication
        const result = await netcafeAPI.login(credentials.username, credentials.password)
        
        if (result.success) {
          // Get real playtime data from NetCafe API
          let totalPlayTime = 0
          let xp = 0
          let tokens = 0
          
          try {
            // Get user's real playtime from leaderboard API
            const leaderboardData = await netcafeAPI.getLeaderboard(100)
            if (leaderboardData.success) {
              const userEntry = leaderboardData.leaderboard.find(entry => 
                entry.username === result.user.username
              )
              if (userEntry) {
                totalPlayTime = userEntry.total_time_minutes || 0
                xp = userEntry.xp || 0
                // Don't use leaderboard tokens - we'll get real tokens from user_tokens table
              }
            }
          } catch (error) {
            console.warn('Could not fetch leaderboard data:', error)
            // Fallback to basic calculation - but don't use result.user.minutes as it's wrong
            totalPlayTime = 0
            xp = 0
          }
          
          // Set auth token in API client FIRST (before calling getUserTokens)
          netcafeAPI.setAuthToken(result.token)
          
          // Calculate tokens from playtime (more reliable than user_tokens table)
          const hours = totalPlayTime / 60
          const baseTokens = hours * 100
          
          // Calculate tier multiplier based on XP
          let levelMultiplier = 1.0
          if (xp >= 1600) {
            levelMultiplier = 2.0
          } else if (xp >= 1000) {
            levelMultiplier = 1.8
          } else if (xp >= 450) {
            levelMultiplier = 1.6
          } else if (xp >= 150) {
            levelMultiplier = 1.4
          } else if (xp >= 50) {
            levelMultiplier = 1.2
          }
          
          tokens = Math.floor(baseTokens * levelMultiplier)
          
          // Optional: Try to get real tokens from user_tokens table as backup
          try {
            const tokenData = await netcafeAPI.getUserTokens(result.user.id)
            if (tokenData.success && tokenData.tokens > tokens) {
              // Only use user_tokens if it's higher than calculated tokens
              tokens = tokenData.tokens
            }
          } catch (error) {
            console.warn('Could not fetch user tokens, using calculated tokens:', error)
          }
          
          // Set user data from NetCafe response (READ ONLY - no session creation)
          this.user = {
            id: result.user.id,
            username: result.user.username,
            email: `${result.user.username}@academy.bg`,
            played_time: totalPlayTime, // Total time played (read-only)
            total_time_played: totalPlayTime, // For compatibility
            xp: xp,
            tokens: tokens, // Real tokens from user_tokens table
            is_admin: Boolean(result.user.is_admin), // Ensure it's always a boolean
            avatar: null,
            created_at: result.user.created_at || new Date().toISOString().split('T')[0],
            last_session: result.user.last_login || new Date().toISOString(),
            total_spent: result.user.total_spent || 0,
            auth_token: result.token
          }
          
          this.isAuthenticated = true
          localStorage.setItem('user', JSON.stringify(this.user))
          localStorage.setItem('auth_token', result.token)
          
          return { success: true }
        } else {
          this.error = result.error
          throw new Error(result.error)
        }
      } catch (error) {
        this.error = error.message || 'Грешка при влизане'
        console.error('Login error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.user = null
      this.isAuthenticated = false
      this.error = null
      localStorage.removeItem('user')
      localStorage.removeItem('auth_token')
      
      // Clear auth token from API client
      netcafeAPI.setAuthToken(null)
    },

    async checkAuth() {
      const savedUser = localStorage.getItem('user')
      const authToken = localStorage.getItem('auth_token')
      
      if (savedUser && authToken) {
        try {
          this.user = JSON.parse(savedUser)
          // Ensure is_admin is always a boolean
          if (this.user) {
            this.user.is_admin = Boolean(this.user.is_admin)
          }
          this.isAuthenticated = true
          
          // Set auth token in API client
          netcafeAPI.setAuthToken(authToken)
          
          // TODO: Optionally verify token with server
          // For now, we trust the stored data
        } catch (error) {
          console.error('Error parsing saved user:', error)
          this.logout()
        }
      }
    },

    async updateTokens(newTokenCount) {
      if (this.user) {
        this.user.tokens = newTokenCount
        localStorage.setItem('user', JSON.stringify(this.user))
      }
    },

    async deductTokens(amount, description = 'Purchase') {
      if (this.user && this.user.tokens >= amount) {
        const oldTokens = this.user.tokens
        this.user.tokens -= amount
        localStorage.setItem('user', JSON.stringify(this.user))
        
        console.log(`💰 Tokens deducted: ${amount} (${description})`, {
          old: oldTokens,
          new: this.user.tokens,
          remaining: this.user.tokens
        })
        
        return { success: true, remaining: this.user.tokens }
      } else {
        console.error('❌ Insufficient tokens for deduction:', {
          required: amount,
          available: this.user?.tokens || 0
        })
        return { success: false, error: 'Insufficient tokens' }
      }
    },

    async refreshUserData() {
      if (this.user && this.user.username) {
        try {
          console.log('🔄 Refreshing user data for:', this.user.username)
          
          // Get playtime and XP from leaderboard
          try {
            const apiPromise = netcafeAPI.getLeaderboard(100)
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('User data refresh timeout')), 8000)
            )
            
            const leaderboardData = await Promise.race([apiPromise, timeoutPromise])
            console.log('📊 User refresh API response success:', leaderboardData.success)
            
            if (leaderboardData.success) {
              const userEntry = leaderboardData.leaderboard.find(entry => 
                entry.username === this.user.username
              )
              console.log('👤 Found user entry:', !!userEntry)
              
              if (userEntry) {
                this.user.total_time_played = userEntry.total_time_minutes || 0
                this.user.xp = userEntry.xp || 0
                // Don't update tokens from leaderboard - get from user_tokens table
              }
            }
          } catch (error) {
            console.error('❌ Error refreshing leaderboard data:', error)
          }
          
          // Calculate tokens from playtime (more reliable)
          const hours = this.user.total_time_played / 60
          const baseTokens = hours * 100
          
          // Calculate tier multiplier based on XP
          let levelMultiplier = 1.0
          const userXP = this.user.xp || 0
          if (userXP >= 1600) {
            levelMultiplier = 2.0
          } else if (userXP >= 1000) {
            levelMultiplier = 1.8
          } else if (userXP >= 450) {
            levelMultiplier = 1.6
          } else if (userXP >= 150) {
            levelMultiplier = 1.4
          } else if (userXP >= 50) {
            levelMultiplier = 1.2
          }
          
          const calculatedTokens = Math.floor(baseTokens * levelMultiplier)
          
          // Always try to get real tokens from user_tokens table first
          try {
            const tokenData = await netcafeAPI.getUserTokens(this.user.id)
            if (tokenData.success && typeof tokenData.tokens === 'number') {
              // Always use user_tokens as primary source (includes purchases/tournaments)
              const oldTokens = this.user.tokens
              this.user.tokens = tokenData.tokens
              console.log('✅ Tokens updated (from user_tokens):', { old: oldTokens, new: this.user.tokens })
            } else {
              // Fallback: only use calculated tokens if they're higher than current tokens
              if (calculatedTokens > this.user.tokens) {
              const oldTokens = this.user.tokens
              this.user.tokens = calculatedTokens
                console.log('✅ Tokens updated (calculated, higher):', { old: oldTokens, new: this.user.tokens })
              } else {
                console.log('✅ Keeping existing tokens (calculated is lower):', { existing: this.user.tokens, calculated: calculatedTokens })
              }
            }
          } catch (error) {
            console.error('❌ Error refreshing user tokens, keeping existing:', error)
            // Don't update tokens if API fails - keep existing tokens
            console.log('✅ Keeping existing tokens due to API error:', this.user.tokens)
          }
          
          // Save updated user data
          localStorage.setItem('user', JSON.stringify(this.user))
          
        } catch (error) {
          console.error('❌ Error refreshing user data:', error)
        }
      }
    }
  }
})