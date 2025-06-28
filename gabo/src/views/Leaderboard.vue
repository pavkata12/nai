<template>
  <div class="leaderboard-page">
    <div class="page-header section-padding">
      <div class="container">
        <div class="header-content animate__animated animate__fadeInDown">
          <h1 class="page-title">
            <i class="fas fa-crown"></i>
            {{ languageStore.t('leaderboardTitle') }}
          </h1>
          <p class="page-subtitle">
            {{ languageStore.t('topDrivers') }}
          </p>
        </div>
        
        <!-- Tier System Overview -->
        <div class="tier-overview animate__animated animate__fadeInUp animate__delay-1s">
          <h3 class="tier-title">Система от нива</h3>
          <div class="tier-grid">
            <div 
              v-for="tier in tiers" 
              :key="tier.name"
              class="tier-card"
              :class="{ 'current': currentUserTier === tier.name }"
            >
              <div class="tier-header">
                <div class="tier-icon" :style="{ color: tier.color }">
                  <i :class="tier.icon"></i>
                </div>
                <div class="tier-info">
                  <h4 class="tier-name" :style="{ color: tier.color }">
                    {{ tier.name }}
                  </h4>
                  <div class="tier-xp">{{ tier.xpRange }}</div>
                </div>
              </div>
              <div class="tier-multiplier">
                {{ tier.multiplier }}x множител
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="leaderboard-content section-padding">
      <div class="container">
        <!-- Current User Stats -->
        <div 
          v-if="authStore.isAuthenticated" 
          class="user-stats-card animate__animated animate__fadeInLeft"
        >
          <div class="stats-header">
            <h3>Вашата статистика</h3>
            <div class="user-tier-badge" :style="{ backgroundColor: authStore.userTier.color }">
              {{ authStore.userTier.name }}
            </div>
          </div>
          
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-icon">
                <i class="fas fa-star"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ authStore.userXP || 0 }}</div>
                <div class="stat-label">XP</div>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon">
                <i class="fas fa-coins"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ authStore.userTokens || 0 }}</div>
                <div class="stat-label">Токени</div>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon">
                <i class="fas fa-clock"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ Math.floor((authStore.user?.total_time_played || 0) / 60) }}</div>
                <div class="stat-label">Часа</div>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon">
                <i class="fas fa-trophy"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ userRank || 'N/A' }}</div>
                <div class="stat-label">Позиция</div>
              </div>
            </div>
          </div>
          
          <!-- Progress to Next Tier -->
          <div v-if="nextTierProgress" class="tier-progress">
            <div class="progress-header">
              <span>Прогрес към {{ nextTierProgress.nextTier }}</span>
              <span>{{ nextTierProgress.current }} / {{ nextTierProgress.target }} XP</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: nextTierProgress.percentage + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="leaderboard-filters animate__animated animate__fadeInRight">
          <div class="filter-group">
            <label class="filter-label">Покажи по:</label>
            <select v-model="filterBy" class="filter-select">
              <option value="xp">XP (опит)</option>
              <option value="time">Време за игра</option>
              <option value="tokens">Токени</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">Нивo:</label>
            <select v-model="tierFilter" class="filter-select">
              <option value="">Всички нива</option>
              <option v-for="tier in tiers" :key="tier.name" :value="tier.name">
                {{ tier.name }}
              </option>
            </select>
          </div>
          
          <button @click="loadLeaderboard" class="btn-secondary refresh-btn">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            Обнови
          </button>
          

        </div>

        <!-- Leaderboard Table -->
        <div class="leaderboard-table animate__animated animate__fadeInUp animate__delay-2s">
          <div v-if="loading" class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Зареждане на класацията...</span>
          </div>
          
          <div v-else-if="filteredLeaderboard.length === 0" class="empty-state">
            <i class="fas fa-users-slash"></i>
            <span>Няма данни за показване</span>
          </div>
          
          <div v-else class="leaderboard-list">
            <div class="leaderboard-header">
              <div class="rank-col">Позиция</div>
              <div class="player-col">Играч</div>
              <div class="stats-col">Статистики</div>
              <div class="tier-col">Ниво</div>
            </div>
            

            
            <div 
              v-for="(player, index) in filteredLeaderboard" 
              :key="player.id"
              class="leaderboard-row"
              :class="{ 
                'highlight': player.id === authStore.user?.id,
                'top-3': index < 3 
              }"
            >
              <div class="rank-col">
                <div class="rank-number" :class="getRankClass(index + 1)">
                  <i v-if="index === 0" class="fas fa-crown"></i>
                  <i v-else-if="index === 1" class="fas fa-medal"></i>
                  <i v-else-if="index === 2" class="fas fa-award"></i>
                  <span v-else>{{ index + 1 }}</span>
                </div>
              </div>
              
              <div class="player-col">
                <div class="player-info">
                  <div class="player-avatar">
                    <i class="fas fa-user-circle"></i>
                  </div>
                  <div class="player-details">
                    <div class="player-name">{{ player.username }}</div>
                    <div class="player-status" v-if="player.last_login">
                      Последен: {{ formatDate(player.last_login) }}
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="stats-col">
                <div class="player-stats">
                  <div class="stat-primary">
                    <span class="stat-value">{{ getDisplayValue(player) }}</span>
                    <span class="stat-unit">{{ getDisplayUnit() }}</span>
                  </div>
                  <div class="stat-secondary">
                    <div class="mini-stat">
                      <i class="fas fa-clock"></i>
                      {{ Math.floor((player.total_time_played || 0) / 60) }}ч
                    </div>
                    <div class="mini-stat">
                      <i class="fas fa-coins"></i>
                      {{ getPlayerTokens(player) }}
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="tier-col">
                <div class="player-tier" :style="{ color: getTierForPlayer(player).color }">
                  <i :class="getTierForPlayer(player).icon"></i>
                  <span>{{ getTierForPlayer(player).name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useLanguageStore } from '../stores/language'
import { netcafeAPI } from '../api/netcafe-api'

export default {
  name: 'Leaderboard',
  setup() {
    const authStore = useAuthStore()
    const languageStore = useLanguageStore()
    
    const loading = ref(false)
    const leaderboard = ref([])
    const filterBy = ref('xp')
    const tierFilter = ref('')
    
    const tiers = [
      { 
        name: 'Rookie', 
        xpRange: '0-49 XP', 
        multiplier: 1.0, 
        color: '#666666',
        icon: 'fas fa-user',
        minXP: 0,
        maxXP: 49
      },
      { 
        name: 'Novice', 
        xpRange: '50-149 XP', 
        multiplier: 1.2, 
        color: '#0088ff',
        icon: 'fas fa-user-plus',
        minXP: 50,
        maxXP: 149
      },
      { 
        name: 'Intermediate', 
        xpRange: '150-449 XP', 
        multiplier: 1.4, 
        color: '#ff8800',
        icon: 'fas fa-user-graduate',
        minXP: 150,
        maxXP: 449
      },
      { 
        name: 'Pro', 
        xpRange: '450-999 XP', 
        multiplier: 1.6, 
        color: '#ff0088',
        icon: 'fas fa-user-tie',
        minXP: 450,
        maxXP: 999
      },
      { 
        name: 'Elite', 
        xpRange: '1000-1599 XP', 
        multiplier: 1.8, 
        color: '#8800ff',
        icon: 'fas fa-crown',
        minXP: 1000,
        maxXP: 1599
      },
      { 
        name: 'Unreal', 
        xpRange: '1600+ XP', 
        multiplier: 2.0, 
        color: '#00A19C',
        icon: 'fas fa-star',
        minXP: 1600,
        maxXP: Infinity
      }
    ]
    
    // Computed properties
    const currentUserTier = computed(() => {
      return authStore.userTier?.name || 'Rookie'
    })
    
    const filteredLeaderboard = computed(() => {
      let filtered = [...leaderboard.value]
      
      // Filter by tier
      if (tierFilter.value) {
        filtered = filtered.filter(player => {
          const playerTier = getTierForPlayer(player)
          return playerTier.name === tierFilter.value
        })
      }
      
      // Sort by selected criteria
      filtered.sort((a, b) => {
        switch (filterBy.value) {
          case 'xp':
            return getPlayerXP(b) - getPlayerXP(a)
          case 'time':
            return (b.total_time_played || 0) - (a.total_time_played || 0)
          case 'tokens':
            return getPlayerTokens(b) - getPlayerTokens(a)
          default:
            return getPlayerXP(b) - getPlayerXP(a)
        }
      })
      
      return filtered
    })
    
    const userRank = computed(() => {
      if (!authStore.user) return null
      const rank = filteredLeaderboard.value.findIndex(player => player.id === authStore.user.id)
      return rank >= 0 ? rank + 1 : null
    })
    
    const nextTierProgress = computed(() => {
      if (!authStore.user) return null
      
      const currentXP = authStore.userXP
      const currentTier = tiers.find(tier => 
        currentXP >= tier.minXP && currentXP <= tier.maxXP
      )
      
      if (!currentTier || currentTier.name === 'Unreal') return null
      
      const nextTier = tiers.find(tier => tier.minXP > currentTier.maxXP)
      if (!nextTier) return null
      
      return {
        nextTier: nextTier.name,
        current: currentXP,
        target: nextTier.minXP,
        percentage: Math.min(100, (currentXP / nextTier.minXP) * 100)
      }
    })
    
    // Methods
    const loadLeaderboard = async () => {
      loading.value = true
      
      try {
        // Try direct fetch first
        let response
        try {
          response = await fetch('/api/leaderboard?limit=50')
        } catch (fetchError) {
          // Fallback to direct backend call
          response = await fetch('http://localhost:3001/api/leaderboard?limit=50')
        }
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        if (data.success && data.leaderboard) {
          leaderboard.value = [...data.leaderboard] // Force reactivity
        } else {
          throw new Error(data.error || 'API returned no data')
        }
      } catch (error) {
        console.error('Error loading leaderboard:', error)
        
        // Set fallback data on error so UI doesn't hang
        leaderboard.value = [
          {
            id: 1,
            username: 'Тест потребител (Fallback)',
            total_time_played: 60,
            xp: 100,
            level: 'Novice',
            tokens: 120,
            total_time_minutes: 60,
            total_sessions: 1
          }
        ]
      } finally {
        loading.value = false
      }
    }
    
    const getPlayerXP = (player) => {
      return player.xp || 0
    }
    
    const getPlayerTokens = (player) => {
      return player.tokens || 0
    }
    
    const getTierForPlayer = (player) => {
      const xp = getPlayerXP(player)
      if (xp >= 1600) return tiers[5] // Unreal
      if (xp >= 1000) return tiers[4] // Elite
      if (xp >= 450) return tiers[3]  // Pro
      if (xp >= 150) return tiers[2]  // Intermediate
      if (xp >= 50) return tiers[1]   // Novice
      return tiers[0] // Rookie
    }
    
    const getDisplayValue = (player) => {
      switch (filterBy.value) {
        case 'xp':
          return getPlayerXP(player)
        case 'time':
          return Math.floor((player.total_time_played || 0) / 60)
        case 'tokens':
          return getPlayerTokens(player)
        default:
          return getPlayerXP(player)
      }
    }
    
    const getDisplayUnit = () => {
      switch (filterBy.value) {
        case 'xp':
          return 'XP'
        case 'time':
          return 'часа'
        case 'tokens':
          return 'токена'
        default:
          return 'XP'
      }
    }
    
    const getRankClass = (rank) => {
      if (rank === 1) return 'rank-1'
      if (rank === 2) return 'rank-2'
      if (rank === 3) return 'rank-3'
      return ''
    }
    
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('bg-BG', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
    

    
    onMounted(() => {
      // Load leaderboard immediately
      loadLeaderboard()
    })
    
    return {
      languageStore,
      authStore,
      loading,
      leaderboard,
      filterBy,
      tierFilter,
      tiers,
      currentUserTier,
      filteredLeaderboard,
      userRank,
      nextTierProgress,
      loadLeaderboard,
      getTierForPlayer,
      getDisplayValue,
      getDisplayUnit,
      getRankClass,
      formatDate,

      getPlayerTokens,
      getPlayerXP
    }
  }
}
</script>

<style scoped>
.leaderboard-page {
  padding-top: 80px;
}

.page-header {
  background: linear-gradient(135deg, #000000 0%, #001a19 100%);
  border-bottom: 1px solid rgba(0, 161, 156, 0.3);
}

.header-content {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-family: 'Orbitron', monospace;
  font-size: 3.5rem;
  font-weight: 700;
  color: #00A19C;
  text-shadow: 0 0 20px rgba(0, 161, 156, 0.5);
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.page-subtitle {
  font-size: 1.2rem;
  color: #ccc;
  margin: 0;
}

/* Tier Overview */
.tier-overview {
  max-width: 1200px;
  margin: 0 auto;
}

.tier-title {
  font-family: 'Orbitron', monospace;
  font-size: 1.5rem;
  color: #00A19C;
  text-align: center;
  margin: 0 0 2rem;
}

.tier-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.tier-card {
  background: rgba(0, 26, 25, 0.3);
  border: 1px solid rgba(0, 161, 156, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s;
}

.tier-card.current {
  border-color: #00A19C;
  box-shadow: 0 0 20px rgba(0, 161, 156, 0.3);
  background: rgba(0, 40, 39, 0.4);
}

.tier-card:hover {
  border-color: rgba(0, 161, 156, 0.5);
  transform: translateY(-2px);
}

.tier-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tier-icon {
  font-size: 2rem;
}

.tier-name {
  font-weight: 600;
  margin: 0;
  font-size: 1.1rem;
}

.tier-xp {
  font-size: 0.8rem;
  color: #999;
}

.tier-multiplier {
  font-size: 0.9rem;
  color: #00A19C;
  font-weight: 500;
}

/* User Stats Card */
.user-stats-card {
  background: rgba(0, 30, 29, 0.4);
  border: 1px solid rgba(0, 161, 156, 0.3);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.stats-header h3 {
  font-family: 'Orbitron', monospace;
  color: #00A19C;
  margin: 0;
}

.user-tier-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  color: #000;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 1.5rem;
  color: #00A19C;
}

.stat-value {
  font-family: 'Orbitron', monospace;
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: #999;
  text-transform: uppercase;
}

/* Progress Bar */
.tier-progress {
  border-top: 1px solid rgba(0, 161, 156, 0.2);
  padding-top: 1.5rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #ccc;
}

.progress-bar {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  height: 8px;
  overflow: hidden;
}

.progress-fill {
  background: linear-gradient(90deg, #00A19C, #00C4B4);
  height: 100%;
  transition: width 1s ease;
}

/* Filters */
.leaderboard-filters {
  display: flex;
  gap: 2rem;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label {
  color: #00A19C;
  font-weight: 500;
  font-size: 0.9rem;
}

.filter-select {
  background: rgba(0, 161, 156, 0.1);
  border: 1px solid rgba(0, 161, 156, 0.3);
  border-radius: 6px;
  padding: 0.5rem 1rem;
  color: #fff;
  font-size: 0.9rem;
}

.filter-select:focus {
  outline: none;
  border-color: #00A19C;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

/* Leaderboard Table */
.leaderboard-table {
  background: rgba(0, 161, 156, 0.1);
  border: 1px solid rgba(0, 161, 156, 0.2);
  border-radius: 16px;
  overflow: hidden;
}

.loading-state,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  color: #ccc;
  font-size: 1.1rem;
}

.leaderboard-header {
  display: grid;
  grid-template-columns: 80px 1fr 200px 150px;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: rgba(0, 161, 156, 0.1);
  border-bottom: 1px solid rgba(0, 161, 156, 0.2);
  font-weight: 600;
  color: #00A19C;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.leaderboard-row {
  display: grid;
  grid-template-columns: 80px 1fr 200px 150px;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(0, 161, 156, 0.1);
  transition: all 0.3s;
}

.leaderboard-row:hover {
  background: rgba(0, 161, 156, 0.05);
}

.leaderboard-row.highlight {
  background: rgba(0, 161, 156, 0.1);
  border-color: rgba(0, 161, 156, 0.3);
}

.leaderboard-row.top-3 {
  background: rgba(255, 215, 0, 0.05);
}

.rank-col {
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-weight: 700;
  font-family: 'Orbitron', monospace;
}

.rank-number.rank-1 {
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  color: #000;
  font-size: 1.2rem;
}

.rank-number.rank-2 {
  background: linear-gradient(45deg, #c0c0c0, #e5e5e5);
  color: #000;
  font-size: 1.1rem;
}

.rank-number.rank-3 {
  background: linear-gradient(45deg, #cd7f32, #daa520);
  color: #000;
  font-size: 1.1rem;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.player-avatar {
  font-size: 2rem;
  color: #00A19C;
}

.player-name {
  font-weight: 600;
  color: #fff;
  font-size: 1.1rem;
}

.player-status {
  font-size: 0.8rem;
  color: #999;
}

.player-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-primary {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.stat-primary .stat-value {
  font-family: 'Orbitron', monospace;
  font-size: 1.3rem;
  font-weight: 700;
  color: #00A19C;
}

.stat-primary .stat-unit {
  font-size: 0.8rem;
  color: #999;
}

.stat-secondary {
  display: flex;
  gap: 1rem;
}

.mini-stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: #999;
}

.mini-stat i {
  color: #00A19C;
}

.player-tier {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 1024px) {
  .leaderboard-header,
  .leaderboard-row {
    grid-template-columns: 60px 1fr 120px;
  }
  
  .tier-col {
    display: none;
  }
  
  .stats-col {
    text-align: right;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2.5rem;
  }
  
  .tier-grid {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.75rem;
  }
  
  .tier-card {
    padding: 1rem;
  }
  
  .user-stats-card {
    padding: 1.5rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
  }
  
  .leaderboard-filters {
    gap: 1rem;
  }
  
  .leaderboard-header,
  .leaderboard-row {
    grid-template-columns: 50px 1fr 80px;
    padding: 0.75rem 1rem;
  }
  
  .player-info {
    gap: 0.5rem;
  }
  
  .player-avatar {
    font-size: 1.5rem;
  }
  
  .player-name {
    font-size: 1rem;
  }
  
  .stat-secondary {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style> 