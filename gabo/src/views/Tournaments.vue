<template>
  <div class="tournaments-page">
    <!-- Header Section -->
    <div class="tournaments-header section-padding page-header-with-nav">
      <div class="header-bg-pattern"></div>
      <div class="header-particles"></div>
      <div class="container">
        <div class="header-content animate__animated animate__fadeInDown">
          <div class="header-icon-wrapper">
            <div class="icon-glow"></div>
            <i class="fas fa-trophy header-main-icon"></i>
      </div>
          <h1 class="page-title">
            {{ languageStore.t('tournamentsTitle') }}
          </h1>
          <p class="page-subtitle">
            {{ languageStore.t('competeWithBest') }}
            </p>
          <div class="header-decorative-line">
            <span class="line-segment"></span>
            <span class="line-diamond">◆</span>
            <span class="line-segment"></span>
          </div>
        </div>
              </div>
            </div>
            
    <!-- Main Content -->
    <div class="tournaments-content section-padding">
      <div class="container">
        
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
              </div>
          <p>{{ languageStore.t('loadingTournaments') }}</p>
            </div>
            
        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <div class="error-icon">
            <i class="fas fa-exclamation-triangle"></i>
              </div>
          <p>{{ error }}</p>
          <button @click="loadTournaments" class="retry-btn">
            <i class="fas fa-sync-alt"></i>
            {{ languageStore.t('tryAgain') }}
          </button>
      </div>

        <!-- Tournaments Content -->
        <div v-else>

      <!-- Active Tournaments -->
          <section class="tournaments-section" v-if="tournaments.active.length > 0">
            <div class="section-header">
              <h2 class="section-title">
                <i class="fas fa-fire section-icon"></i>
                {{ languageStore.t('activeTournaments') }}
                <span class="live-badge">{{ languageStore.t('live') }}</span>
          </h2>
        </div>

            <div class="tournaments-grid">
          <div 
            v-for="tournament in tournaments.active" 
            :key="tournament.id"
                class="tournament-card"
                :class="{ 'featured': tournament.featured }"
          >
                <div 
                  class="tournament-image"
                  :style="tournament.image_url ? `background-image: url('${tournament.image_url}')` : ''"
                >
                  <div class="image-overlay"></div>
                  
                  <div class="tournament-status">
                    <span class="status-badge active">{{ languageStore.t('active') }}</span>
                    <div class="prize-amount">{{ tournament.prize }} {{ languageStore.t('tokens') }}</div>
                  </div>

                  <div class="tournament-badges">
                    <span class="badge game-type">
                      <i class="fas" :class="{
                        'fa-flag-checkered': tournament.game_type === 'racing',
                        'fa-stopwatch': tournament.game_type === 'time_trial',
                        'fa-car-side': tournament.game_type === 'drift',
                        'fa-road': tournament.game_type === 'endurance'
                      }"></i>
                      {{ getGameTypeText(tournament.game_type) }}
                    </span>
                    
                    <span class="badge difficulty" :class="tournament.difficulty">
                      <i class="fas fa-star"></i>
                      {{ getDifficultyText(tournament.difficulty) }}
                    </span>
                  </div>
                </div>

                <div class="card-content">
                  <h3 class="tournament-name">{{ tournament.name }}</h3>
                  <p class="tournament-description">{{ tournament.description }}</p>

                  <div class="tournament-info">
                    <div class="info-item">
                      <span class="info-label">{{ languageStore.t('participants') }}:</span>
                      <span class="info-value">{{ tournament.current_participants || 0 }}/{{ tournament.max_participants }}</span>
                </div>
                    <div class="info-item">
                      <span class="info-label">{{ languageStore.t('entryFee') }}:</span>
                      <span class="info-value">{{ tournament.entry_fee || 0 }} {{ languageStore.t('tokens') }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">{{ languageStore.t('date') }}:</span>
                      <span class="info-value">{{ formatDate(tournament.date) }}</span>
                    </div>
                  </div>

                  <div class="progress-section">
                    <div class="progress-bar">
                  <div 
                        class="progress-fill" 
                    :style="{ width: ((tournament.current_participants || 0) / tournament.max_participants * 100) + '%' }"
                  ></div>
                </div>
                    <span class="progress-text">{{ Math.round(((tournament.current_participants || 0) / tournament.max_participants) * 100) }}% {{ languageStore.t('filled') }}</span>
                </div>
              </div>

                <div class="card-footer">
                  <button 
                    @click="joinTournament(tournament)" 
                    :class="[
                      'join-btn',
                      { 
                        'registered': tournament.isUserRegistered,
                        'full': tournament.participants >= tournament.maxParticipants,
                        'loading': tournament.isJoining
                      }
                    ]"
                    :disabled="tournament.isUserRegistered || (tournament.current_participants || 0) >= tournament.max_participants || tournament.isJoining"
                  >
                    <i v-if="tournament.isJoining" class="fas fa-spinner fa-spin"></i>
                    <i v-else-if="tournament.isUserRegistered" class="fas fa-check"></i>
                    <i v-else-if="tournament.participants >= tournament.max_participants" class="fas fa-lock"></i>
                    <i v-else class="fas fa-bolt"></i>
                    
                    <span v-if="tournament.isJoining">{{ languageStore.t('joining') }}</span>
                    <span v-else-if="tournament.isUserRegistered">{{ languageStore.t('registered') }}</span>
                    <span v-else-if="(tournament.current_participants || 0) >= tournament.max_participants">{{ languageStore.t('full') }}</span>
                    <span v-else>{{ languageStore.t('joinTournament') }}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Upcoming Tournaments -->
          <section class="tournaments-section" v-if="tournaments.upcoming.length > 0">
            <div class="section-header">
              <h2 class="section-title">
                <i class="fas fa-calendar-alt section-icon"></i>
                {{ languageStore.t('upcomingTournaments') }}
          </h2>
        </div>

            <div class="upcoming-list">
          <div 
            v-for="tournament in tournaments.upcoming" 
            :key="tournament.id"
                class="upcoming-card"
          >
                <div class="upcoming-icon">
                  <i class="fas fa-clock"></i>
                  </div>
                <div class="upcoming-info">
                  <h3 class="upcoming-name">{{ tournament.name }}</h3>
                  <p class="upcoming-description">{{ tournament.description }}</p>
                  <div class="upcoming-details">
                    <span class="upcoming-date">{{ tournament.date }}</span>
                    <span class="upcoming-prize">{{ tournament.prize }} {{ languageStore.t('tokens') }}</span>
                  </div>
                </div>
                <div class="upcoming-action">
                  <button class="register-btn">
                    <i class="fas fa-bell"></i>
                    {{ languageStore.t('remindMe') }}
                  </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Completed Tournaments -->
          <section class="tournaments-section" v-if="tournaments.completed.length > 0">
            <div class="section-header">
              <h2 class="section-title">
                <i class="fas fa-trophy section-icon"></i>
                {{ languageStore.t('completedTournaments') }}
          </h2>
        </div>

            <div class="completed-table">
              <div class="table-header">
                <div class="header-cell">Турнир</div>
                <div class="header-cell">Победител</div>
                <div class="header-cell">Награда</div>
                <div class="header-cell">Дата</div>
            </div>
          <div class="table-body">
            <div 
                  v-for="tournament in tournaments.completed" 
              :key="tournament.id"
                  class="table-row"
            >
                  <div class="table-cell tournament-cell">{{ tournament.name }}</div>
                  <div class="table-cell winner-cell">
                    <i class="fas fa-crown"></i>
                    {{ tournament.winner }}
              </div>
                  <div class="table-cell prize-cell">{{ tournament.prize }} токена</div>
                  <div class="table-cell date-cell">{{ tournament.date }}</div>
              </div>
              </div>
              </div>
          </section>

            </div>
          </div>
    </div>

    <!-- Success Notification -->
    <transition name="notification">
      <div v-if="showNotification" class="notification">
        <div class="notification-content">
          <i class="fas fa-check-circle"></i>
          <div class="notification-text">
            <div class="notification-title">Успешно записване!</div>
            <div class="notification-message">Записахте се в турнира</div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useLanguageStore } from '../stores/language'
import { netcafeAPI } from '../api/netcafe-api'

export default {
  name: 'Tournaments',
  setup() {
    const showNotification = ref(false)
    const loading = ref(true)
    const error = ref(null)
    
    const authStore = useAuthStore()
    const languageStore = useLanguageStore()
    const tournaments = ref({
      active: [],
      upcoming: [],
      completed: []
    })

    const loadTournaments = async () => {
      loading.value = true
      error.value = null
      
      try {
        // Load tournaments from API
        const response = await netcafeAPI.getTournaments()
        
        if (response.success) {
          const tournamentData = response.tournaments || {}
          
          // Handle both organized (by status) and flat array responses
          let allTournaments = []
          if (Array.isArray(tournamentData)) {
            allTournaments = tournamentData
          } else {
            allTournaments = [
              ...(tournamentData.active || []),
              ...(tournamentData.upcoming || []),
              ...(tournamentData.completed || [])
            ]
          }
          
          // Get user's registrations to check which tournaments they're registered for
          let userRegistrations = []
          try {
            const regResponse = await netcafeAPI.getMyTournamentRegistrations()
            if (regResponse.success) {
              userRegistrations = regResponse.registrations || []
            }
          } catch (regErr) {
            console.warn('Could not load user registrations:', regErr)
          }
          
          // Categorize tournaments by status and check user registration
          if (tournamentData.active && tournamentData.upcoming && tournamentData.completed) {
            // Response is already organized
            tournaments.value.active = tournamentData.active.map(t => ({
              ...t,
              isUserRegistered: userRegistrations.some(reg => reg.tournament_id === t.id),
              isJoining: false
            }))
            tournaments.value.upcoming = tournamentData.upcoming.map(t => ({
              ...t,
              isUserRegistered: userRegistrations.some(reg => reg.tournament_id === t.id),
              isJoining: false
            }))
            tournaments.value.completed = tournamentData.completed.map(t => ({
              ...t,
              isUserRegistered: userRegistrations.some(reg => reg.tournament_id === t.id),
              isJoining: false
            }))
          } else {
            // Organize manually
            tournaments.value.active = allTournaments
              .filter(t => t.status === 'active')
              .map(t => ({
                ...t,
                isUserRegistered: userRegistrations.some(reg => reg.tournament_id === t.id),
                isJoining: false
              }))
            tournaments.value.upcoming = allTournaments
              .filter(t => t.status === 'upcoming')
              .map(t => ({
                ...t,
                isUserRegistered: userRegistrations.some(reg => reg.tournament_id === t.id),
                isJoining: false
              }))
            tournaments.value.completed = allTournaments
              .filter(t => t.status === 'completed')
              .map(t => ({
                ...t,
                isUserRegistered: userRegistrations.some(reg => reg.tournament_id === t.id),
                isJoining: false
              }))
          }
        } else {
          throw new Error('API response not successful')
        }
      } catch (err) {
        console.error('Error loading tournaments:', err)
        
        // Use fallback demo data
        tournaments.value = {
      active: [
        {
          id: 1,
          name: 'Monza Speed Challenge',
          description: 'Кой е най-бързият на легендарната италианска писта? Докажете скоростта си в този интензивен турнир!',
          prize: 500,
          current_participants: 8,
          max_participants: 16,
              date: '20 Януари 2024',
              status: 'active',
              isUserRegistered: false,
              isJoining: false
        },
        {
          id: 2,
          name: 'Nürburgring Masters',
          description: 'Покорете "Зеленият ад" - най-предизвикателната писта в света на автомобилните спортове!',
          prize: 750,
          current_participants: 12,
          max_participants: 20,
              date: '22 Януари 2024',
              status: 'active',
              isUserRegistered: false,
              isJoining: false
        },
        {
          id: 3,
          name: 'Monaco Street Circuit',
          description: 'Най-престижният градски турнир! Навигирайте през тесните улици на Монако като истински професионалист.',
          prize: 1000,
          current_participants: 15,
          max_participants: 24,
              date: '25 Януари 2024',
              status: 'active',
              isUserRegistered: false,
              isJoining: false
        }
      ],
      upcoming: [
        {
          id: 4,
          name: 'Spa Championship',
          description: 'Класическият белгийски кръг',
          prize: 1000,
              date: '25 Януари 2024',
              status: 'upcoming'
        },
        {
          id: 5,
          name: 'Monaco Grand Prix',
          description: 'Най-престижната писта във формула 1',
          prize: 1500,
              date: '28 Януари 2024',
              status: 'upcoming'
        },
        {
          id: 6,
          name: 'Le Mans Endurance',
          description: '24-часово състезание на издръжливост',
          prize: 2000,
              date: '1 Февруари 2024',
              status: 'upcoming'
        }
      ],
      completed: [
        {
              id: 7,
          name: 'Silverstone Sprint',
          winner: 'SpeedDemon',
          prize: 400,
              date: '15 Януари 2024',
              status: 'completed'
        },
        {
              id: 8,
          name: 'Imola Challenge',
          winner: 'RacingPro',
          prize: 600,
              date: '10 Януари 2024',
              status: 'completed'
        },
        {
              id: 9,
          name: 'Suzuka Masters',
          winner: 'TurboRacer',
          prize: 800,
              date: '5 Януари 2024',
              status: 'completed'
            }
          ]
        }
      } finally {
        loading.value = false
      }
    }

    const joinTournament = async (tournament) => {
      // Check if user is already registered
      if (tournament.isUserRegistered) {
        alert('Вече сте записани в този турнир!')
        return
      }
      
      // Check if tournament is full
      if ((tournament.current_participants || 0) >= tournament.max_participants) {
        alert('Турнирът е пълен!')
        return
      }
      
      // Disable button to prevent multiple clicks
      tournament.isJoining = true
      
      try {
        const response = await netcafeAPI.joinTournament(tournament.id)
        
        if (response.success) {
          // Update local data
          tournament.current_participants = (tournament.current_participants || 0) + 1
          tournament.isUserRegistered = true
          
          // Update tokens immediately from response
          if (typeof response.remaining_tokens === 'number') {
            await authStore.updateTokens(response.remaining_tokens)
          }
          
          // Show success notification with token info
          showNotification.value = true
          setTimeout(() => {
            showNotification.value = false
          }, 3000)
          
          // Show detailed success message
          alert(`Успешно се записахте в турнира!\nПлатени токени: ${response.tokens_paid}\nОставащи токени: ${response.remaining_tokens}`)
        } else {
          alert('Грешка при записването: ' + (response.error || response.message || 'Неизвестна грешка'))
        }
      } catch (err) {
        console.error('Error joining tournament:', err)
        
        if (err.response && err.response.data && err.response.data.message) {
          alert('Грешка при записването: ' + err.response.data.message)
        } else {
          alert('Грешка при записването. Моля, опитайте отново.')
        }
      } finally {
        // Re-enable button
        tournament.isJoining = false
      }
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('bg-BG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const getGameTypeText = (type) => {
      const types = {
        'racing': 'Състезание',
        'time_trial': 'Time Trial',
        'drift': 'Дрифт',
        'endurance': 'Издръжливост'
      }
      return types[type] || 'Състезание'
    }

    const getDifficultyText = (difficulty) => {
      const difficulties = {
        'beginner': 'За начинаещи',
        'medium': 'Средно ниво',
        'expert': 'За експерти',
        'pro': 'Професионално'
      }
      return difficulties[difficulty] || 'Средно ниво'
    }

    onMounted(() => {
      loadTournaments()
    })

    return {
      languageStore,
      tournaments,
      showNotification,
      loading,
      error,
      joinTournament,
      loadTournaments,
      formatDate,
      getGameTypeText,
      getDifficultyText
    }
  }
}
</script>

<style scoped>
.tournaments-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  color: white;
}

/* Header Styles */
.tournaments-header {
  position: relative;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  overflow: hidden;
}



.header-bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(0, 161, 156, 0.1) 2px, transparent 2px),
    radial-gradient(circle at 75% 75%, rgba(0, 161, 156, 0.05) 1px, transparent 1px);
  background-size: 50px 50px, 25px 25px;
  animation: pattern-float 20s ease-in-out infinite;
}

.header-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, rgba(0, 161, 156, 0.3), transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(0, 161, 156, 0.2), transparent),
    radial-gradient(1px 1px at 90px 40px, rgba(0, 161, 156, 0.4), transparent);
  background-repeat: repeat;
  background-size: 100px 100px;
  animation: particles-drift 15s linear infinite;
}

@keyframes pattern-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes particles-drift {
  0% { transform: translateX(0px); }
  100% { transform: translateX(100px); }
}

.header-content {
  text-align: center;
  position: relative;
  z-index: 2;
}

.header-icon-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 2rem;
}

.icon-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(0, 161, 156, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: glow-pulse 2s ease-in-out infinite;
}

.header-main-icon {
  font-size: 4rem;
  color: #00A19C;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 0 20px rgba(0, 161, 156, 0.5));
}

@keyframes glow-pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
  50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
}

.page-title {
  font-size: 4rem;
  font-weight: 900;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #00A19C 0%, #00C4B4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(0, 161, 156, 0.3);
}

.page-subtitle {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
  font-weight: 300;
}

.header-decorative-line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.line-segment {
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00A19C, transparent);
}

.line-diamond {
  color: #00A19C;
  font-size: 1.2rem;
  animation: diamond-spin 4s linear infinite;
}

@keyframes diamond-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Content Styles */
.tournaments-content {
  position: relative;
  z-index: 1;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-padding {
  padding: 4rem 0;
}

/* Loading and Error States */
.loading-state, .error-state {
  text-align: center;
  padding: 4rem 0;
}

.loading-spinner, .error-icon {
  font-size: 3rem;
  color: #00A19C;
  margin-bottom: 1rem;
}

.loading-spinner i {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-btn {
  background: #00A19C;
  color: black;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.retry-btn:hover {
  background: #00C4B4;
  transform: translateY(-2px);
}

/* Section Styles */
.tournaments-section {
  margin-bottom: 4rem;
}

.section-header {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
}

.section-icon {
  color: #00A19C;
}

.live-badge {
  background: #ff4444;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Tournament Cards */
.tournaments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.tournament-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(0, 161, 156, 0.3);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.tournament-card.featured {
  border-color: #ffd700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
}

.tournament-card:hover {
  border-color: #00A19C;
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 161, 156, 0.2);
}

.tournament-image {
  position: relative;
  height: 200px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%);
}

.tournament-status {
  position: relative;
  z-index: 1;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.tournament-badges {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  z-index: 1;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge.game-type {
  background: rgba(0, 161, 156, 0.2);
  color: #00A19C;
  border: 1px solid #00A19C;
}

.badge.difficulty {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid #ffc107;
}

.badge.difficulty.beginner { color: #4CAF50; border-color: #4CAF50; }
.badge.difficulty.medium { color: #FFC107; border-color: #FFC107; }
.badge.difficulty.expert { color: #FF5722; border-color: #FF5722; }
.badge.difficulty.pro { color: #9C27B0; border-color: #9C27B0; }

.card-content {
  padding: 1.5rem;
}

.tournament-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: white;
}

.tournament-description {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.tournament-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  }

.info-value {
  font-weight: 600;
  color: white;
  }

.progress-section {
  margin-bottom: 1rem;
  }

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00A19C 0%, #00C4B4 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
}

.card-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1rem;
}

.join-btn {
  width: 100%;
  background: #00A19C;
  color: black;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.join-btn:hover:not(:disabled) {
  background: #00C4B4;
  transform: translateY(-2px);
}

.join-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.join-btn.registered {
  background: #28a745;
  color: white;
}

.join-btn.full {
  background: #6c757d;
  color: white;
}

.join-btn.loading {
  background: #00A19C;
  opacity: 0.8;
}

/* Upcoming Tournaments */
.upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upcoming-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.3s ease;
}

.upcoming-card:hover {
  border-color: #ffc107;
  transform: translateX(5px);
}

.upcoming-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffc107;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.upcoming-info {
  flex: 1;
}

.upcoming-name {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: white;
}

.upcoming-description {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
}

.upcoming-details {
  display: flex;
  gap: 2rem;
}

.upcoming-date, .upcoming-prize {
  font-size: 0.9rem;
  font-weight: 600;
}

.upcoming-date {
  color: #ffc107;
}

.upcoming-prize {
  color: #00A19C;
}

.register-btn {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.register-btn:hover {
  background: rgba(255, 193, 7, 0.2);
  border-color: #ffc107;
}

/* Completed Tournaments Table */
.completed-table {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(138, 43, 226, 0.3);
  border-radius: 12px;
  overflow: hidden;
}

.table-header {
  background: rgba(138, 43, 226, 0.1);
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid rgba(138, 43, 226, 0.3);
}

.header-cell {
  font-weight: 600;
  color: #da70d6;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.table-body {
  display: flex;
  flex-direction: column;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.table-row:hover {
  background: rgba(138, 43, 226, 0.05);
  transform: translateX(5px);
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  display: flex;
  align-items: center;
}

.tournament-cell {
  font-weight: 600;
  color: white;
}

.winner-cell {
  color: #00A19C;
  font-weight: 600;
  gap: 0.5rem;
}

.winner-cell i {
  color: #ffc107;
}

.prize-cell {
  color: #da70d6;
  font-weight: 600;
}

.date-cell {
  color: rgba(255, 255, 255, 0.7);
}

/* Notification */
.notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: #00A19C;
  color: black;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 161, 156, 0.3);
  z-index: 1000;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.notification-content i {
  font-size: 1.5rem;
  }
  
.notification-title {
  font-weight: 700;
  margin-bottom: 0.25rem;
  }
  
.notification-message {
  font-size: 0.9rem;
  opacity: 0.8;
  }
  
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
  }
  
.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
  }
  
/* Responsive Design */
@media (max-width: 768px) {
  .page-title {
    font-size: 3rem;
  }
  
  .tournaments-grid {
    grid-template-columns: 1fr;
  }
  
  .upcoming-card {
    flex-direction: column;
    text-align: center;
}

  .upcoming-details {
    justify-content: center;
}

  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
}

  .header-cell,
  .table-cell {
    padding: 0.5rem 0;
}

  .notification {
    top: 1rem;
    right: 1rem;
    left: 1rem;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 1rem;
  }
  
  .section-padding {
    padding: 2rem 0;
}

  .page-title {
    font-size: 2.5rem;
  }
  
  .tournament-card {
    padding: 1rem;
  }
}
</style>