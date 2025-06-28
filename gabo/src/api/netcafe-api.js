import axios from 'axios'

// Website API Configuration (communicates with NetCafe Bridge)
const WEBSITE_API_BASE = import.meta.env.VITE_API_URL || '/api'

class NetCafeAPI {
  constructor() {
    this.client = axios.create({
      baseURL: WEBSITE_API_BASE,
      timeout: 15000, // Increased timeout for bridge communication
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    // Add response interceptor for better error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.code === 'ECONNREFUSED') {
          console.error('Cannot connect to website server')
        } else if (error.response?.status === 500 && error.response?.data?.message?.includes('NetCafe')) {
          console.error('NetCafe Bridge connection failed')
        }
        return Promise.reject(error)
      }
    )
  }

  /**
   * Set authorization token for API requests
   * @param {string} token 
   */
  setAuthToken(token) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete this.client.defaults.headers.common['Authorization']
    }
  }

  /**
   * Authenticate user with NetCafe database (READ ONLY - no session creation)
   * @param {string} username 
   * @param {string} password 
   * @returns {Promise<Object>}
   */
  async login(username, password) {
    try {
      const response = await this.client.post('/login', {
        username,
        password
      })

      if (response.data.success) {
        return {
          success: true,
          token: response.data.token,
          user: {
            id: response.data.user.id,
            username: response.data.user.username,
            is_admin: response.data.user.is_admin,
            minutes: response.data.minutes,
            total_spent: response.data.user.total_spent,
            created_at: response.data.user.created_at,
            last_login: response.data.user.last_login
          }
        }
      } else {
        return {
          success: false,
          error: response.data.message || 'Login failed'
        }
      }
    } catch (error) {
      console.error('NetCafe API Login Error:', error)
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status
        const message = error.response.data?.message || 'Authentication failed'
        
        if (status === 401) {
          return { success: false, error: 'Invalid username or password' }
        } else if (status === 403) {
          return { success: false, error: message }
        } else {
          return { success: false, error: `Server error: ${status}` }
        }
      } else if (error.code === 'ECONNREFUSED') {
        return { success: false, error: 'NetCafe server is not running' }
      } else {
        return { success: false, error: 'Network error - please try again' }
      }
    }
  }

  /**
   * Get user profile data
   * @param {number} userId 
   * @returns {Promise<Object>}
   */
  async getUserProfile(userId) {
    try {
      const response = await this.client.get(`/users/${userId}`)
      return response.data
    } catch (error) {
      console.error('Get user profile error:', error)
      throw error
    }
  }

  /**
   * Get user tokens
   * @param {number} userId 
   * @returns {Promise<Object>}
   */
  async getUserTokens(userId) {
    try {
      const response = await this.client.get(`/users/${userId}/tokens`)
      return response.data
    } catch (error) {
      console.error('Get user tokens error:', error)
      throw error
    }
  }

  /**
   * Get shop items
   * @param {string} category 
   * @returns {Promise<Object>}
   */
  async getShopItems(category = null) {
    try {
      const params = category ? { category } : {}
      const response = await this.client.get('/shop/items', { params })
      return response.data
    } catch (error) {
      console.error('Get shop items error:', error)
      if (error.response) {
        return { success: false, error: error.response.data?.message || 'Failed to get shop items' }
      }
      return { success: false, error: 'Network error - could not connect to server' }
    }
  }

  /**
   * Purchase shop item
   * @param {number} userId 
   * @param {number} itemId 
   * @returns {Promise<Object>}
   */
  async purchaseItem(userId, itemId) {
    try {
      const response = await this.client.post('/shop/purchase', {
        item_id: itemId
      })
      return response.data
    } catch (error) {
      console.error('Purchase item error:', error)
      if (error.response) {
        return { success: false, error: error.response.data?.message || 'Purchase failed' }
      }
      throw error
    }
  }

  /**
   * Get user purchases
   * @returns {Promise<Object>}
   */
  async getUserPurchases() {
    try {
      const response = await this.client.get('/user/purchases')
      return response.data
    } catch (error) {
      console.error('Get user purchases error:', error)
      if (error.response) {
        return { success: false, error: error.response.data?.message || 'Failed to get purchases' }
      }
      throw error
    }
  }

  /**
   * Admin: Create shop item
   * @param {Object} itemData 
   * @returns {Promise<Object>}
   */
  async createShopItem(itemData) {
    try {
      const response = await this.client.post('/admin/shop/items', itemData)
      return response.data
    } catch (error) {
      console.error('Create shop item error:', error)
      if (error.response) {
        return { success: false, error: error.response.data?.message || 'Failed to create item' }
      }
      throw error
    }
  }

  /**
   * Admin: Update shop item
   * @param {number} itemId 
   * @param {Object} itemData 
   * @returns {Promise<Object>}
   */
  async updateShopItem(itemId, itemData) {
    try {
      const response = await this.client.put(`/admin/shop/items/${itemId}`, itemData)
      return response.data
    } catch (error) {
      console.error('Update shop item error:', error)
      if (error.response) {
        return { success: false, error: error.response.data?.message || 'Failed to update item' }
      }
      throw error
    }
  }

  /**
   * Admin: Delete shop item
   * @param {number} itemId 
   * @returns {Promise<Object>}
   */
  async deleteShopItem(itemId) {
    try {
      const response = await this.client.delete(`/admin/shop/items/${itemId}`)
      return response.data
    } catch (error) {
      console.error('Delete shop item error:', error)
      if (error.response) {
        return { success: false, error: error.response.data?.message || 'Failed to delete item' }
      }
      throw error
    }
  }

  /**
   * Get posts/news
   * @param {string} category 
   * @param {number} limit 
   * @returns {Promise<Object>}
   */
  async getPosts(category = null, limit = null) {
    try {
      const params = {}
      if (category) params.category = category
      if (limit) params.limit = limit
      
      const response = await this.client.get('/posts', { params })
      return response.data
    } catch (error) {
      console.error('Get posts error:', error)
      throw error
    }
  }

  /**
   * Get leaderboard with XP and tokens
   * @param {number} limit 
   * @returns {Promise<Object>}
   */
  async getLeaderboard(limit = 10) {
    try {
      const response = await this.client.get('/leaderboard', {
        params: { limit }
      })
      return response.data
    } catch (error) {
      console.error('Get leaderboard error:', error)
      throw error
    }
  }

  /**
   * Get admin leaderboard (raw data)
   * @param {number} limit 
   * @returns {Promise<Object>}
   */
  async getAdminLeaderboard(limit = 10) {
    try {
      const response = await this.client.get('/admin/leaderboard', {
        params: { limit }
      })
      return response.data
    } catch (error) {
      console.error('Get admin leaderboard error:', error)
      throw error
    }
  }

  /**
   * Admin: Get all users
   * @returns {Promise<Object>}
   */
  async getUsers() {
    try {
      const response = await this.client.get('/admin/users')
      return response.data
    } catch (error) {
      console.error('Get users error:', error)
      throw error
    }
  }

  /**
   * Admin: Add tokens to user
   * @param {number} userId 
   * @param {number} amount 
   * @param {string} description 
   * @returns {Promise<Object>}
   */
  async addTokensToUser(userId, amount, description = '') {
    try {
      const response = await this.client.post('/admin/tokens/add', {
        user_id: userId,
        amount: amount,
        description: description
      })
      return response.data
    } catch (error) {
      console.error('Error adding tokens:', error)
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status
        const message = error.response.data?.message || 'Неизвестна грешка от сървъра'
        
        if (status === 401) {
          return { 
            success: false, 
            message: 'Сесията е изтекла. Моля, влезте отново в системата.',
            needsReauth: true 
          }
        } else if (status === 403) {
          return { 
            success: false, 
            message: 'Нямате права за тази операция.' 
          }
        } else if (status === 404) {
          return { 
            success: false, 
            message: 'Потребителят не е намерен.' 
          }
        } else if (status === 400) {
          return { 
            success: false, 
            message: message 
          }
        } else {
          return { 
            success: false, 
            message: `Грешка от сървъра (${status}): ${message}` 
          }
        }
      } else if (error.request) {
        return {
          success: false,
          message: 'Няма връзка със сървъра. Моля, проверете интернет връзката.'
        }
      } else {
      return {
        success: false,
          message: 'Грешка при заявката: ' + error.message
        }
      }
    }
  }

  /**
   * Admin: Create post
   * @param {Object} postData 
   * @returns {Promise<Object>}
   */
  async createPost(postData) {
    try {
      const response = await this.client.post('/admin/posts', postData)
      return response.data
    } catch (error) {
      console.error('Create post error:', error)
      throw error
    }
  }

  /**
   * Admin: Update post
   * @param {number} postId 
   * @param {Object} postData 
   * @returns {Promise<Object>}
   */
  async updatePost(postId, postData) {
    try {
      const response = await this.client.put(`/admin/posts/${postId}`, postData)
      return response.data
    } catch (error) {
      console.error('Update post error:', error)
      throw error
    }
  }

  /**
   * Admin: Delete post
   * @param {number} postId 
   * @returns {Promise<Object>}
   */
  async deletePost(postId) {
    try {
      const response = await this.client.delete(`/admin/posts/${postId}`)
      return response.data
    } catch (error) {
      console.error('Delete post error:', error)
      throw error
    }
  }

  /**
   * Admin: Get statistics
   * @returns {Promise<Object>}
   */
  async getStats() {
    try {
      const response = await this.client.get('/admin/stats')
      return response.data
    } catch (error) {
      console.error('Get stats error:', error)
      throw error
    }
  }

  /**
   * Get tournaments
   * @param {string} status - Filter by status (active, upcoming, completed)
   * @returns {Promise<Object>}
   */
  async getTournaments(status = null) {
    try {
      const params = status ? { status } : {}
      const response = await this.client.get('/tournaments', { params })
      return response.data
    } catch (error) {
      console.error('Get tournaments error:', error)
      // Return fallback data structure for demo
      return {
        success: false,
        error: 'Tournaments API not available',
        tournaments: { active: [], upcoming: [], completed: [] }
      }
    }
  }

  /**
   * Join tournament
   * @param {number} tournamentId 
   * @returns {Promise<Object>}
   */
  async joinTournament(tournamentId) {
    try {
      const response = await this.client.post('/tournaments/join', {
        tournament_id: tournamentId
      })
      return response.data
    } catch (error) {
      console.error('Join tournament error:', error)
      if (error.response) {
        return { success: false, error: error.response.data?.message || 'Failed to join tournament' }
      }
      return { success: false, error: 'Network error' }
    }
  }

  /**
   * Get user's tournament registrations
   * @returns {Promise<Object>}
   */
  async getMyTournamentRegistrations() {
    try {
      const response = await this.client.get('/tournaments/my-registrations')
      return response.data
    } catch (error) {
      console.error('Get my registrations error:', error)
      throw error
    }
  }

  /**
   * Admin: Get tournament participants
   * @param {number} tournamentId 
   * @returns {Promise<Object>}
   */
  async getTournamentParticipants(tournamentId) {
    try {
      const response = await this.client.get(`/admin/tournaments/${tournamentId}/participants`)
      return response.data
    } catch (error) {
      console.error('Get tournament participants error:', error)
      throw error
    }
  }

  /**
   * Leave tournament
   * @param {number} tournamentId 
   * @returns {Promise<Object>}
   */
  async leaveTournament(tournamentId) {
    try {
      const response = await this.client.post('/tournaments/leave', {
        tournament_id: tournamentId
      })
      return response.data
    } catch (error) {
      console.error('Leave tournament error:', error)
      return {
        success: false,
        error: 'Failed to leave tournament'
      }
    }
  }

  /**
   * Get tournament details
   * @param {number} tournamentId 
   * @returns {Promise<Object>}
   */
  async getTournamentDetails(tournamentId) {
    try {
      const response = await this.client.get(`/tournaments/${tournamentId}`)
      return response.data
    } catch (error) {
      console.error('Get tournament details error:', error)
      throw error
    }
  }

  /**
   * Admin: Create tournament
   * @param {Object} tournamentData 
   * @returns {Promise<Object>}
   */
  async createTournament(tournamentData) {
    try {
      const response = await this.client.post('/admin/tournaments', tournamentData)
      return response.data
    } catch (error) {
      console.error('Create tournament error:', error)
      throw error
    }
  }

  /**
   * Admin: Update tournament
   * @param {number} tournamentId 
   * @param {Object} tournamentData 
   * @returns {Promise<Object>}
   */
  async updateTournament(tournamentId, tournamentData) {
    try {
      const response = await this.client.put(`/admin/tournaments/${tournamentId}`, tournamentData)
      return response.data
    } catch (error) {
      console.error('Update tournament error:', error)
      throw error
    }
  }

  /**
   * Admin: Delete tournament
   * @param {number} tournamentId 
   * @returns {Promise<Object>}
   */
  async deleteTournament(tournamentId) {
    try {
      const response = await this.client.delete(`/admin/tournaments/${tournamentId}`)
      return response.data
    } catch (error) {
      console.error('Delete tournament error:', error)
      throw error
    }
  }

  /**
   * Generic GET request
   * @param {string} url 
   * @returns {Promise<Object>}
   */
  async get(url) {
    try {
      const response = await this.client.get(url)
      return response.data
    } catch (error) {
      console.error('GET request error:', error)
      throw error
    }
  }

  /**
   * Generic POST request
   * @param {string} url 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async post(url, data) {
    try {
      const response = await this.client.post(url, data)
      return response.data
    } catch (error) {
      console.error('POST request error:', error)
      throw error
    }
  }

  /**
   * Generic PUT request
   * @param {string} url 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async put(url, data) {
    try {
      const response = await this.client.put(url, data)
      return response.data
    } catch (error) {
      console.error('PUT request error:', error)
      throw error
    }
  }

  /**
   * Generic DELETE request
   * @param {string} url 
   * @returns {Promise<Object>}
   */
  async delete(url) {
    try {
      const response = await this.client.delete(url)
      return response.data
    } catch (error) {
      console.error('DELETE request error:', error)
      throw error
    }
  }

  // ============================================
  // ACADEMY MANAGEMENT
  // ============================================

  /**
   * Get all academy courses
   * @returns {Promise<Object>}
   */
  async getAcademyCourses() {
    try {
      const response = await this.client.get('/academy/courses')
      return response.data
    } catch (error) {
      console.error('Error getting academy courses:', error)
      return {
        success: false,
        message: 'Грешка при зареждане на курсовете'
      }
    }
  }

  /**
   * Get academy course categories
   * @returns {Promise<Object>}
   */
  async getAcademyCategories() {
    try {
      const response = await this.client.get('/academy/categories')
      return response.data
    } catch (error) {
      console.error('Error getting academy categories:', error)
      return {
        success: false,
        message: 'Грешка при зареждане на категориите'
      }
    }
  }

  /**
   * Get user's purchased courses
   * @returns {Promise<Object>}
   */
  async getMyAcademyCourses() {
    try {
      const response = await this.client.get('/academy/my-courses')
      return response.data
    } catch (error) {
      console.error('Error getting my courses:', error)
      return {
        success: false,
        message: 'Грешка при зареждане на закупените курсове'
      }
    }
  }

  /**
   * Purchase a course
   * @param {number} courseId 
   * @returns {Promise<Object>}
   */
  async purchaseAcademyCourse(courseId) {
    try {
      const response = await this.client.post('/academy/purchase', {
        courseId: courseId  // Fixed: Use courseId instead of course_id to match server expectations
      })
      return response.data
    } catch (error) {
      console.error('Error purchasing course:', error)
      return {
        success: false,
        message: 'Грешка при закупуване на курса'
      }
    }
  }

  /**
   * Get all academy courses (admin only)
   * @returns {Promise<Object>}
   */
  async getAdminAcademyCourses() {
    try {
      const response = await this.client.get('/admin/academy/courses')
      return response.data
    } catch (error) {
      console.error('Error getting admin academy courses:', error)
      return {
        success: false,
        message: 'Грешка при зареждане на курсовете'
      }
    }
  }

  /**
   * Create academy course (admin only)
   * @param {Object} courseData 
   * @returns {Promise<Object>}
   */
  async createAcademyCourse(courseData) {
    try {
      const response = await this.client.post('/admin/academy/courses', courseData)
      return response.data
    } catch (error) {
      console.error('Error creating course:', error)
      return {
        success: false,
        message: 'Грешка при създаване на курса'
      }
    }
  }

  /**
   * Update academy course (admin only)
   * @param {number} courseId 
   * @param {Object} courseData 
   * @returns {Promise<Object>}
   */
  async updateAcademyCourse(courseId, courseData) {
    try {
      const response = await this.client.put(`/admin/academy/courses/${courseId}`, courseData)
      return response.data
    } catch (error) {
      console.error('Error updating course:', error)
      return {
        success: false,
        message: 'Грешка при обновяване на курса'
      }
    }
  }

  /**
   * Delete academy course (admin only)
   * @param {number} courseId 
   * @returns {Promise<Object>}
   */
  async deleteAcademyCourse(courseId) {
    try {
      const response = await this.client.delete(`/admin/academy/courses/${courseId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting course:', error)
      return {
        success: false,
        message: 'Грешка при изтриване на курса'
      }
    }
  }

  /**
   * Get all academy categories (admin only)
   * @returns {Promise<Object>}
   */
  async getAdminAcademyCategories() {
    try {
      const response = await this.client.get('/admin/academy/categories')
      return response.data
    } catch (error) {
      console.error('Error getting admin academy categories:', error)
      return {
        success: false,
        message: 'Грешка при зареждане на категориите'
      }
    }
  }

  /**
   * Create academy category (admin only)
   * @param {Object} categoryData 
   * @returns {Promise<Object>}
   */
  async createAcademyCategory(categoryData) {
    try {
      const response = await this.client.post('/admin/academy/categories', categoryData)
      return response.data
    } catch (error) {
      console.error('Error creating category:', error)
      return {
        success: false,
        message: 'Грешка при създаване на категорията'
      }
    }
  }

  /**
   * Update academy category (admin only)
   * @param {number} categoryId 
   * @param {Object} categoryData 
   * @returns {Promise<Object>}
   */
  async updateAcademyCategory(categoryId, categoryData) {
    try {
      const response = await this.client.put(`/admin/academy/categories/${categoryId}`, categoryData)
      return response.data
    } catch (error) {
      console.error('Error updating category:', error)
      return {
        success: false,
        message: 'Грешка при обновяване на категорията'
      }
    }
  }

  /**
   * Delete academy category (admin only)
   * @param {number} categoryId 
   * @returns {Promise<Object>}
   */
  async deleteAcademyCategory(categoryId) {
    try {
      const response = await this.client.delete(`/admin/academy/categories/${categoryId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting category:', error)
      return {
        success: false,
        message: 'Грешка при изтриване на категорията'
      }
    }
  }

}

// Export singleton instance
export const netcafeAPI = new NetCafeAPI()
export default netcafeAPI 