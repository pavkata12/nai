<template>
  <div class="profile-page">
    <!-- Header Section -->
    <div class="page-header">
      <div class="container mx-auto px-4 py-8">
        <div class="header-content">
          <h1 class="page-title">
            <i class="fas fa-user-circle"></i>
            {{ languageStore.t('myProfile') }}
          </h1>
          <p class="page-subtitle">
            {{ languageStore.t('profileSubtitle') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- User Info Card -->
        <div class="lg:col-span-1">
          <div class="user-card">
            <div class="user-avatar-section">
              <div class="user-avatar">
                <i class="fas fa-user-circle"></i>
              </div>
              <h2 class="user-name">{{ user?.username || 'Guest' }}</h2>
              <div class="user-tier-badge" :style="{ backgroundColor: currentTierData.color }">
                <i :class="currentTierData.icon"></i>
                <span>{{ currentTierData.name }}</span>
              </div>
            </div>
            
            <!-- Quick Stats -->
            <div class="quick-stats">
              <div class="stat-item">
                <div class="stat-icon">
                  <i class="fas fa-star"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ user?.xp || 0 }}</div>
                  <div class="stat-label">XP</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">
                  <i class="fas fa-coins"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ user?.tokens || 0 }}</div>
                  <div class="stat-label">{{ languageStore.t('tokens') }}</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">
                  <i class="fas fa-clock"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ playedHours }}</div>
                  <div class="stat-label">{{ languageStore.t('hours') }}</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">
                  <i class="fas fa-chart-line"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ currentTierData.multiplier }}x</div>
                  <div class="stat-label">{{ languageStore.t('multiplier') }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="lg:col-span-2 space-y-8">
          
          <!-- Progress Section -->
          <div class="progress-card">
            <div class="card-header">
              <h3 class="card-title">
                <i class="fas fa-chart-line"></i>
              {{ languageStore.t('progressToNext') }}
            </h3>
            </div>
            
            <div class="progress-content">
              <div class="tier-progression">
                <div class="current-tier">
                  <i :class="currentTierData.icon" :style="{ color: currentTierData.color }"></i>
                  <span>{{ currentTierData.name }}</span>
                </div>
                <div class="progress-arrow">
                  <i class="fas fa-arrow-right"></i>
                </div>
                <div class="next-tier">
                  <i :class="nextTierData.icon" :style="{ color: nextTierData.color }"></i>
                  <span>{{ nextTierData.name }}</span>
                </div>
              </div>
              
              <div class="progress-bar-container">
                <div class="progress-bar">
                <div 
                    class="progress-fill"
                  :style="{ width: progressPercent + '%' }"
                ></div>
                </div>
                <div class="progress-text">
                  <span>{{ user?.xp || 0 }} / {{ nextTierData.minXP }} XP</span>
                  <span class="xp-remaining">{{ xpToNext }} {{ languageStore.t('xpToNext') }} {{ nextTierData.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Sessions -->
          <div class="sessions-card">
            <div class="card-header">
              <h3 class="card-title">
                <i class="fas fa-history"></i>
              {{ languageStore.t('recentSessions') }}
            </h3>
              <button class="refresh-btn" @click="loadRecentSessions">
                <i class="fas fa-sync-alt"></i>
                {{ languageStore.t('refresh') }}
              </button>
            </div>
            
            <div class="sessions-list">
              <div 
                v-for="session in recentSessions" 
                :key="session.id"
                class="session-item"
              >
                <div class="session-info">
                  <div class="session-date">{{ formatDate(session.date) }}</div>
                  <div class="session-duration">
                    <i class="fas fa-clock"></i>
                    {{ session.duration }} {{ languageStore.t('minutes') }}
                  </div>
                </div>
                <div class="session-rewards">
                  <div class="reward-item xp">
                    <i class="fas fa-star"></i>
                    +{{ session.xp }} XP
                  </div>
                  <div class="reward-item tokens">
                    <i class="fas fa-coins"></i>
                    +{{ session.tokens }}
                  </div>
                </div>
              </div>
              
              <div v-if="recentSessions.length === 0" class="empty-sessions">
                <i class="fas fa-calendar-times"></i>
                <span>{{ languageStore.t('noSessions') }}</span>
              </div>
            </div>
          </div>

          <!-- Achievements -->
          <div class="achievements-card">
            <div class="card-header">
              <h3 class="card-title">
                <i class="fas fa-trophy"></i>
              {{ languageStore.t('achievements') }}
            </h3>
              <div class="achievement-progress">
                {{ unlockedAchievements }}/{{ achievements.length }} {{ languageStore.t('achievementsUnlocked') }}
              </div>
            </div>
            
            <div class="achievements-grid">
              <div 
                v-for="achievement in achievements"
                :key="achievement.id"
                :class="[
                  'achievement-item',
                  { 'unlocked': achievement.unlocked }
                ]"
                :title="achievement.description"
              >
                <div class="achievement-icon">
                  <i :class="achievement.icon"></i>
                </div>
                <div class="achievement-info">
                  <div class="achievement-name">{{ achievement.name }}</div>
                  <div class="achievement-description">{{ achievement.description }}</div>
                </div>
                <div v-if="achievement.unlocked" class="achievement-badge">
                  <i class="fas fa-check"></i>
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

export default {
  name: 'Profile',
  setup() {
    const authStore = useAuthStore()
    const languageStore = useLanguageStore()
    const recentSessions = ref([])
    
    const user = computed(() => authStore.user)
    
    const tiers = [
      { 
        name: 'Rookie', 
        multiplier: 1.0, 
        color: '#666666',
        icon: 'fas fa-user',
        minXP: 0,
        maxXP: 49
      },
      { 
        name: 'Novice', 
        multiplier: 1.2, 
        color: '#0088ff',
        icon: 'fas fa-user-plus',
        minXP: 50,
        maxXP: 149
      },
      { 
        name: 'Intermediate', 
        multiplier: 1.4, 
        color: '#ff8800',
        icon: 'fas fa-user-graduate',
        minXP: 150,
        maxXP: 449
      },
      { 
        name: 'Pro', 
        multiplier: 1.6, 
        color: '#ff0088',
        icon: 'fas fa-user-tie',
        minXP: 450,
        maxXP: 999
      },
      { 
        name: 'Elite', 
        multiplier: 1.8, 
        color: '#8800ff',
        icon: 'fas fa-crown',
        minXP: 1000,
        maxXP: 1599
      },
      { 
        name: 'Unreal', 
        multiplier: 2.0, 
        color: '#00A19C',
        icon: 'fas fa-star',
        minXP: 1600,
        maxXP: Infinity
      }
    ]
    
    const currentTierData = computed(() => {
      const userXP = user.value?.xp || 0
      return tiers.find(tier => userXP >= tier.minXP && userXP <= tier.maxXP) || tiers[0]
    })
    
    const nextTierData = computed(() => {
      const currentIndex = tiers.findIndex(tier => tier.name === currentTierData.value.name)
      return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : currentTierData.value
    })
    
    const playedHours = computed(() => {
      return user.value?.total_time_played ? Math.floor(user.value.total_time_played / 60) : 0
    })
    
    const progressPercent = computed(() => {
      const userXP = user.value?.xp || 0
      const current = currentTierData.value
      const next = nextTierData.value
      
      if (current.name === next.name) return 100 // Max tier
      
      const progress = (userXP - current.minXP) / (next.minXP - current.minXP)
      return Math.min(Math.max(progress * 100, 0), 100)
    })
    
    const xpToNext = computed(() => {
      const userXP = user.value?.xp || 0
      const next = nextTierData.value
      
      if (currentTierData.value.name === next.name) return 0 // Max tier
      
      return Math.max(next.minXP - userXP, 0)
    })
    
    const achievements = computed(() => [
      { 
        id: 1, 
        name: 'Първа стъпка', 
        description: 'Завърши първата си сесия',
        icon: 'fas fa-play', 
        unlocked: playedHours.value > 0 
      },
      { 
        id: 2, 
        name: 'Новобранец', 
        description: 'Достигни Novice ниво',
        icon: 'fas fa-star', 
        unlocked: currentTierData.value.name !== 'Rookie' 
      },
      { 
        id: 3, 
        name: 'Упорит', 
        description: 'Изиграй 10 часа',
        icon: 'fas fa-clock', 
        unlocked: playedHours.value >= 10 
      },
      { 
        id: 4, 
        name: 'Колекционер', 
        description: 'Събери 1000 токена',
        icon: 'fas fa-coins', 
        unlocked: (user.value?.tokens || 0) >= 1000 
      },
      { 
        id: 5, 
        name: 'Професионал', 
        description: 'Достигни Pro ниво',
        icon: 'fas fa-trophy', 
        unlocked: ['Pro', 'Elite', 'Unreal'].includes(currentTierData.value.name)
      },
      { 
        id: 6, 
        name: 'Легенда', 
        description: 'Достигни Unreal ниво',
        icon: 'fas fa-crown', 
        unlocked: currentTierData.value.name === 'Unreal' 
      },
      { 
        id: 7, 
        name: 'Маратонец', 
        description: 'Изиграй 100 часа',
        icon: 'fas fa-running', 
        unlocked: playedHours.value >= 100 
      },
      { 
        id: 8, 
        name: 'Богаташ', 
        description: 'Събери 10000 токена',
        icon: 'fas fa-gem', 
        unlocked: (user.value?.tokens || 0) >= 10000 
      }
    ])
    
    const unlockedAchievements = computed(() => {
      return achievements.value.filter(a => a.unlocked).length
    })
    
    const loadRecentSessions = async () => {
      // Mock data for now - in real app would fetch from API
      recentSessions.value = [
        { 
          id: 1, 
          date: new Date().toISOString(), 
          duration: 60, 
          xp: 100, 
          tokens: 120 
        },
        { 
          id: 2, 
          date: new Date(Date.now() - 86400000).toISOString(), 
          duration: 45, 
          xp: 75, 
          tokens: 90 
        },
        { 
          id: 3, 
          date: new Date(Date.now() - 172800000).toISOString(), 
          duration: 30, 
          xp: 50, 
          tokens: 60 
        }
      ]
    }
    
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) return 'Днес'
      if (diffDays === 2) return 'Вчера'
      if (diffDays <= 7) return `Преди ${diffDays - 1} дни`
      
      return date.toLocaleDateString('bg-BG')
    }
    
    onMounted(() => {
      loadRecentSessions()
    })
    
    return {
      languageStore,
      user,
      currentTierData,
      nextTierData,
      playedHours,
      progressPercent,
      xpToNext,
      achievements,
      unlockedAchievements,
      recentSessions,
      loadRecentSessions,
      formatDate
    }
  }
}
</script>

<style scoped>
.profile-page {
  padding-top: 80px;
  min-height: 100vh;
  background: linear-gradient(135deg, #000000 0%, #001a19 100%);
}

.page-header {
  background: linear-gradient(135deg, #000000 0%, #001a19 100%);
  border-bottom: 1px solid rgba(0, 161, 156, 0.3);
}

.header-content {
  text-align: center;
  margin-bottom: 2rem;
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

/* User Card */
.user-card {
  background: rgba(0, 30, 29, 0.4);
  border: 1px solid rgba(0, 161, 156, 0.3);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
}

.user-avatar-section {
  margin-bottom: 2rem;
}

.user-avatar {
  width: 120px;
  height: 120px;
  margin: 0 auto 1rem;
  background: rgba(0, 161, 156, 0.1);
  border: 3px solid rgba(0, 161, 156, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: #00A19C;
}

.user-name {
  font-family: 'Orbitron', monospace;
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 1rem;
}

.user-tier-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  color: #000;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.quick-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(0, 161, 156, 0.05);
  border: 1px solid rgba(0, 161, 156, 0.2);
  border-radius: 12px;
}

.stat-icon {
  font-size: 1.5rem;
  color: #00A19C;
}

.stat-value {
  font-family: 'Orbitron', monospace;
  font-size: 1.3rem;
  font-weight: 700;
  color: #00A19C;
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: #999;
  text-transform: uppercase;
}

/* Progress Card */
.progress-card {
  background: rgba(0, 30, 29, 0.4);
  border: 1px solid rgba(0, 161, 156, 0.3);
  border-radius: 16px;
  padding: 2rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.card-title {
  font-family: 'Orbitron', monospace;
  font-size: 1.3rem;
  color: #00A19C;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tier-progression {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.current-tier,
.next-tier {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.current-tier i,
.next-tier i {
  font-size: 2rem;
}

.progress-arrow {
  color: #00A19C;
  font-size: 1.5rem;
}

.progress-bar-container {
  margin-bottom: 1rem;
}

.progress-bar {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  height: 12px;
  overflow: hidden;
  border: 1px solid rgba(0, 161, 156, 0.2);
}

.progress-fill {
  background: linear-gradient(90deg, #00A19C, #00C4B4);
  height: 100%;
  transition: width 1s ease;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #ccc;
}

.xp-remaining {
  color: #00A19C;
  font-weight: 600;
}

/* Sessions Card */
.sessions-card {
  background: rgba(0, 30, 29, 0.4);
  border: 1px solid rgba(0, 161, 156, 0.3);
  border-radius: 16px;
  padding: 2rem;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(0, 161, 156, 0.1);
  border: 1px solid rgba(0, 161, 156, 0.3);
  border-radius: 6px;
  color: #00A19C;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.refresh-btn:hover {
  background: rgba(0, 161, 156, 0.2);
  border-color: #00A19C;
}

.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 161, 156, 0.05);
  border: 1px solid rgba(0, 161, 156, 0.2);
  border-radius: 12px;
  transition: all 0.3s;
}

.session-item:hover {
  background: rgba(0, 161, 156, 0.1);
  border-color: rgba(0, 161, 156, 0.4);
}

.session-date {
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.25rem;
}

.session-duration {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: #999;
}

.session-rewards {
  display: flex;
  gap: 1rem;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.reward-item.xp {
  color: #00A19C;
}

.reward-item.tokens {
  color: #ffa500;
}

.empty-sessions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  color: #666;
  font-style: italic;
}

/* Achievements Card */
.achievements-card {
  background: rgba(0, 30, 29, 0.4);
  border: 1px solid rgba(0, 161, 156, 0.3);
  border-radius: 16px;
  padding: 2rem;
}

.achievement-progress {
  color: #00A19C;
  font-weight: 600;
  font-size: 0.9rem;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(100, 100, 100, 0.3);
  border-radius: 12px;
  transition: all 0.3s;
  position: relative;
}

.achievement-item.unlocked {
  background: rgba(0, 161, 156, 0.1);
  border-color: rgba(0, 161, 156, 0.3);
}

.achievement-icon {
  font-size: 2rem;
  color: #666;
  transition: color 0.3s;
}

.achievement-item.unlocked .achievement-icon {
  color: #00A19C;
}

.achievement-name {
  font-weight: 600;
  color: #666;
  transition: color 0.3s;
}

.achievement-item.unlocked .achievement-name {
  color: #fff;
}

.achievement-description {
  font-size: 0.8rem;
  color: #999;
  margin-top: 0.25rem;
}

.achievement-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 24px;
  height: 24px;
  background: #00A19C;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  font-size: 0.8rem;
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 2.5rem;
  }
  
  .quick-stats {
    grid-template-columns: 1fr;
  }
  
  .tier-progression {
    gap: 1rem;
  }
  
  .achievements-grid {
    grid-template-columns: 1fr;
  }
  
  .session-item {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .session-rewards {
    justify-content: center;
  }
}
</style>