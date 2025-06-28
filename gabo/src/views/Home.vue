<template>
  <main class="home" role="main">
    <!-- Hero Section -->
    <section class="hero" role="banner" aria-labelledby="hero-title">
      <video 
        class="hero-video-bg" 
        autoplay 
        loop 
        muted 
        playsinline
        :style="{ display: videoLoaded ? 'block' : 'none' }"
        @canplay="handleVideoCanPlay"
        @error="handleVideoError"
        aria-label="Видео фон с автомобилни състезания"
      >
        <source :src="heroVideoUrl" type="video/mp4" />
        Вашият браузър не поддържа видео фон.
      </video>
      
      <!-- Fallback background when video fails to load -->
      <div 
        v-if="!videoLoaded || videoError" 
        class="hero-fallback-bg"
        aria-hidden="true"
      ></div>
      
      <!-- Dark overlay for better text readability -->
      <div class="hero-overlay" aria-hidden="true"></div>
      
      <div class="container hero-content">
        <header class="hero-text">
          <h1 id="hero-title" class="hero-title animate__animated animate__fadeInUp">
            {{ languageStore.t('heroTitle') }}
            <span class="hero-title-accent">SIM RACING</span>
          </h1>
          <p class="hero-subtitle animate__animated animate__fadeInUp animate__delay-1s">
            {{ languageStore.t('heroSubtitle') }}
          </p>
          <p class="hero-description animate__animated animate__fadeInUp animate__delay-2s">
            {{ languageStore.t('heroDescription') }}
          </p>
          
          <div class="hero-actions animate__animated animate__fadeInUp animate__delay-3s">
            <router-link to="/academy" class="btn-primary hero-btn">
              <i class="fas fa-play"></i>
              <span>{{ languageStore.t('startNow') }}</span>
            </router-link>
            <router-link to="/leaderboard" class="btn-secondary hero-btn">
              <i class="fas fa-crown"></i>
              <span>{{ languageStore.t('ranking') }}</span>
            </router-link>
          </div>
        </header>
        
        <div class="hero-stats animate__animated animate__fadeInRight animate__delay-1s">
          <div class="stat-card glow-pulse">
            <div class="stat-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">
                <span v-if="loading"><i class="fas fa-spinner fa-spin"></i></span>
                <span v-else>{{ stats.totalUsers }}</span>
              </div>
              <div class="stat-label">{{ languageStore.t('registered') }}</div>
            </div>
          </div>
          
          <div class="stat-card glow-pulse">
            <div class="stat-icon">
              <i class="fas fa-clock"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">
                <span v-if="loading"><i class="fas fa-spinner fa-spin"></i></span>
                <span v-else>{{ stats.totalHours }}</span>
              </div>
              <div class="stat-label">{{ languageStore.t('hoursPlayed') }}</div>
            </div>
          </div>
          
          <div class="stat-card glow-pulse">
            <div class="stat-icon">
              <i class="fas fa-trophy"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">
                <span v-if="loading"><i class="fas fa-spinner fa-spin"></i></span>
                <span v-else>{{ stats.activeTournaments }}</span>
              </div>
              <div class="stat-label">{{ languageStore.t('activeTournaments') }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features section-padding">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">{{ languageStore.t('whyAcademy') }}</h2>
          <p class="section-subtitle">{{ languageStore.t('bestConditions') }}</p>
        </div>
        
        <div class="features-grid">
          <article class="feature-card animate__animated animate__fadeInUp">
            <div class="feature-icon">
              <i class="fas fa-car-side"></i>
            </div>
            <h3 class="feature-title">{{ languageStore.t('professionalSimulators') }}</h3>
            <p class="feature-description">
              {{ languageStore.t('profSimDescription') }}
            </p>
          </article>
          
          <article class="feature-card animate__animated animate__fadeInUp animate__delay-1s">
            <div class="feature-icon">
              <i class="fas fa-graduation-cap"></i>
            </div>
            <h3 class="feature-title">{{ languageStore.t('expertTraining') }}</h3>
            <p class="feature-description">
              {{ languageStore.t('expertTrainingDescription') }}
            </p>
          </article>
          
          <article class="feature-card animate__animated animate__fadeInUp animate__delay-2s">
            <div class="feature-icon">
              <i class="fas fa-trophy"></i>
            </div>
            <h3 class="feature-title">{{ languageStore.t('tournamentsAndPrizes') }}</h3>
            <p class="feature-description">
              {{ languageStore.t('tournamentsDescription') }}
            </p>
          </article>
          
          <article class="feature-card animate__animated animate__fadeInUp animate__delay-3s">
            <div class="feature-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <h3 class="feature-title">{{ languageStore.t('progressTracking') }}</h3>
            <p class="feature-description">
              {{ languageStore.t('progressDescription') }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section class="pricing section-padding bg-dark">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">{{ languageStore.t('pricingPlans') }}</h2>
          <p class="section-subtitle">{{ languageStore.t('choosePlan') }}</p>
        </div>
        
        <div class="pricing-grid">
          <div class="pricing-card animate__animated animate__fadeInUp">
            <div class="pricing-header">
              <h3 class="pricing-title">TESTER</h3>
              <div class="pricing-price">
                <span class="price-amount">15</span>
                <span class="price-currency">лв</span>
              </div>
              <div class="pricing-duration">15 {{ languageStore.t('minutes') }}</div>
            </div>
            <ul class="pricing-features">
              <li><i class="fas fa-check"></i> {{ languageStore.t('basicIntro') }}</li>
              <li><i class="fas fa-check"></i> {{ languageStore.t('oneTrack') }}</li>
              <li><i class="fas fa-check"></i> {{ languageStore.t('basicSetup') }}</li>
            </ul>
            <button class="btn-secondary pricing-btn" @click="selectPlan('tester')">{{ languageStore.t('selectPlan') }}</button>
          </div>
          
          <div class="pricing-card featured animate__animated animate__fadeInUp animate__delay-1s">
            <div class="pricing-badge">{{ languageStore.t('popular') }}</div>
            <div class="pricing-header">
              <h3 class="pricing-title">ROOKIE</h3>
              <div class="pricing-price">
                <span class="price-amount">20</span>
                <span class="price-currency">лв</span>
              </div>
              <div class="pricing-duration">30 {{ languageStore.t('minutes') }}</div>
            </div>
            <ul class="pricing-features">
              <li><i class="fas fa-check"></i> {{ languageStore.t('allTracks') }}</li>
              <li><i class="fas fa-check"></i> {{ languageStore.t('basicInstruction') }}</li>
              <li><i class="fas fa-check"></i> {{ languageStore.t('statistics') }}</li>
              <li><i class="fas fa-check"></i> {{ languageStore.t('leaderboard') }}</li>
            </ul>
            <button class="btn-primary pricing-btn" @click="selectPlan('rookie')">{{ languageStore.t('selectPlan') }}</button>
          </div>
          
          <div class="pricing-card animate__animated animate__fadeInUp animate__delay-2s">
            <div class="pricing-header">
              <h3 class="pricing-title">RACER</h3>
              <div class="pricing-price">
                <span class="price-amount">35</span>
                <span class="price-currency">лв</span>
              </div>
              <div class="pricing-duration">60 {{ languageStore.t('minutes') }}</div>
            </div>
            <ul class="pricing-features">
              <li><i class="fas fa-check"></i> {{ languageStore.t('allFeatures') }}</li>
              <li><i class="fas fa-check"></i> {{ languageStore.t('personalTraining') }}</li>
              <li><i class="fas fa-check"></i> {{ languageStore.t('sessionRecording') }}</li>
              <li><i class="fas fa-check"></i> {{ languageStore.t('dataAnalysis') }}</li>
            </ul>
            <button class="btn-secondary pricing-btn" @click="selectPlan('racer')">{{ languageStore.t('selectPlan') }}</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Recent Activity -->
    <section class="recent-activity section-padding" v-if="recentActivity.length > 0">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">{{ languageStore.t('recentActivity') }}</h2>
          <p class="section-subtitle">{{ languageStore.t('academyActivity') }}</p>
        </div>
        
        <div class="activity-list">
          <div 
            v-for="activity in recentActivity" 
            :key="activity.id"
            class="activity-item animate__animated animate__fadeInLeft"
          >
            <div class="activity-icon">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="activity-content">
              <div class="activity-text">
                <strong>{{ activity.username }}</strong> 
                {{ languageStore.t('completedSession') }} {{ Math.floor(activity.duration / 60) }} {{ languageStore.t('minutesSession') }}
              </div>
              <div class="activity-time">{{ formatTime(activity.end_time) }}</div>
            </div>
            <div class="activity-xp">
              +{{ Math.floor(activity.duration / 60 * 100) }} XP
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguageStore } from '@/stores/language'
import axios from 'axios'
import heroVideoUrl from '@/assets/hero-bg.mp4'

export default {
  name: 'Home',
  setup() {
    const router = useRouter()
    const languageStore = useLanguageStore()
    const stats = ref({
      totalUsers: 0,
      totalHours: 0,
      activeTournaments: 0
    })
    const loading = ref(true)
    
    // Video handling
    const videoLoaded = ref(false)
    const videoError = ref(false)
    
    const recentActivity = ref([])

    const loadStats = async () => {
      try {
        const response = await axios.get('/api/stats')
        if (response.data.success) {
          stats.value = {
            totalUsers: response.data.stats.total_users || 0,
            totalHours: response.data.stats.total_hours || 0,
            activeTournaments: response.data.stats.active_tournaments || 0
          }
        }
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        loading.value = false
      }
    }

    const loadRecentActivity = async () => {
      try {
        const response = await axios.get('/api/recent-activity')
        if (response.data.success) {
          recentActivity.value = response.data.activities || []
        }
      } catch (error) {
        console.error('Error loading recent activity:', error)
      }
    }

    const formatTime = (timestamp) => {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      const minutes = Math.floor(diff / 60000)
      
      if (minutes < 1) return languageStore.t('justNow')
      if (minutes < 60) return `${languageStore.t('ago')} ${minutes} ${languageStore.t('minutesAgo')}`
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${languageStore.t('ago')} ${hours} ${languageStore.t('hoursAgo')}`
      const days = Math.floor(hours / 24)
      return `${languageStore.t('ago')} ${days} ${languageStore.t('daysAgo')}`
    }

    // Video event handlers
    const handleVideoCanPlay = () => {
      videoLoaded.value = true
      videoError.value = false
      console.log('Video loaded successfully')
    }
    
    const handleVideoError = (error) => {
      videoError.value = true
      videoLoaded.value = false
      console.error('Video loading error:', error)
    }

    // Pricing plan selection
    const selectPlan = (planType) => {
      // Пренасочваме към booking страницата с информация за избрания план
      router.push({
        path: '/booking',
        query: { plan: planType }
      })
    }

    onMounted(() => {
      loadStats()
      loadRecentActivity()
    })

    return {
      languageStore,
      stats,
      recentActivity,
      loading,
      formatTime,
      videoLoaded,
      videoError,
      handleVideoCanPlay,
      handleVideoError,
      heroVideoUrl,
      selectPlan
    }
  }
}
</script>

<style scoped>
/* Hero Section */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  margin-top: -80px;
  padding-top: 80px;
}

.hero-video-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.hero-fallback-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, 
    rgba(0, 0, 0, 0.8) 0%, 
    rgba(0, 26, 26, 0.9) 25%, 
    rgba(0, 0, 0, 0.95) 50%, 
    rgba(0, 34, 34, 0.9) 75%, 
    rgba(0, 0, 0, 0.8) 100%),
    url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0,161,156,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  background-size: cover, 50px 50px;
  z-index: 0;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, 
    rgba(0, 0, 0, 0.6) 0%, 
    rgba(0, 0, 0, 0.4) 25%, 
    rgba(0, 0, 0, 0.5) 50%, 
    rgba(0, 0, 0, 0.7) 75%, 
    rgba(0, 0, 0, 0.6) 100%);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4rem;
  align-items: center;
}

.hero-text {
  max-width: 600px;
}

.hero-title {
  font-family: 'Orbitron', monospace;
  font-size: 4rem;
  font-weight: 900;
  line-height: 1.1;
  margin: 0 0 1rem;
  color: #fff;
}

.hero-title-accent {
  display: block;
  color: #00A19C;
  text-shadow: 0 0 20px rgba(0, 161, 156, 0.5);
}

.hero-subtitle {
  font-size: 1.5rem;
  font-weight: 300;
  color: #ccc;
  margin: 0 0 1rem;
}

.hero-description {
  font-size: 1.1rem;
  color: #999;
  line-height: 1.6;
  margin: 0 0 2rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.hero-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  text-decoration: none;
  border-radius: 8px;
}

.hero-stats {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(0, 161, 156, 0.1);
  border: 1px solid rgba(0, 161, 156, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  min-width: 200px;
}

.stat-icon {
  font-size: 2rem;
  color: #00A19C;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-family: 'Orbitron', monospace;
  font-size: 2rem;
  font-weight: 700;
  color: #00A19C;
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: #ccc;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Features Section */
.features {
  background: #111;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  font-family: 'Orbitron', monospace;
  font-size: 3rem;
  font-weight: 700;
  color: #00A19C;
  margin: 0 0 1rem;
  text-shadow: 0 0 10px rgba(0, 161, 156, 0.3);
}

.section-subtitle {
  font-size: 1.2rem;
  color: #ccc;
  margin: 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  text-align: center;
  padding: 2rem;
  background: rgba(0, 161, 156, 0.1);
  border: 1px solid rgba(0, 161, 156, 0.2);
  border-radius: 12px;
  transition: all 0.3s;
}

.feature-card:hover {
  border-color: #00A19C;
  box-shadow: 0 8px 32px rgba(0, 161, 156, 0.2);
  transform: translateY(-4px);
}

.feature-icon {
  font-size: 3rem;
  color: #00A19C;
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 1rem;
}

.feature-description {
  color: #ccc;
  line-height: 1.6;
  margin: 0;
}

/* Pricing Section */
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.pricing-card {
  position: relative;
  background: rgba(0, 161, 156, 0.1);
  border: 1px solid rgba(0, 161, 156, 0.3);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s;
}

.pricing-card.featured {
  border-color: #00A19C;
  box-shadow: 0 0 30px rgba(0, 161, 156, 0.2);
  transform: scale(1.05);
}

.pricing-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: #00A19C;
  color: #000;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.pricing-header {
  margin-bottom: 2rem;
}

.pricing-title {
  font-family: 'Orbitron', monospace;
  font-size: 1.5rem;
  font-weight: 700;
  color: #00A19C;
  margin: 0 0 1rem;
}

.pricing-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.price-amount {
  font-family: 'Orbitron', monospace;
  font-size: 3rem;
  font-weight: 700;
  color: #fff;
}

.price-currency {
  font-size: 1.2rem;
  color: #ccc;
}

.pricing-duration {
  color: #999;
  font-size: 0.9rem;
}

.pricing-features {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem;
}

.pricing-features li {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  padding: 0.5rem 0;
  color: #ccc;
}

.pricing-features i {
  color: #00A19C;
}

.pricing-btn {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
}

/* Recent Activity */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(0, 161, 156, 0.1);
  border: 1px solid rgba(0, 161, 156, 0.2);
  border-radius: 8px;
  padding: 1rem;
}

.activity-icon {
  font-size: 2rem;
  color: #00A19C;
}

.activity-content {
  flex: 1;
}

.activity-text {
  color: #fff;
  margin-bottom: 0.25rem;
}

.activity-time {
  color: #999;
  font-size: 0.9rem;
}

.activity-xp {
  color: #00A19C;
  font-weight: 600;
  font-family: 'Orbitron', monospace;
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 2rem;
  }
  
  .hero-stats {
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .pricing-card.featured {
    transform: none;
  }
  
  .stat-card {
    min-width: auto;
  }
}
</style> 