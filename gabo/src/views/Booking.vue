<template>
  <div class="booking-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-overlay"></div>
      <div class="container hero-content">
        <div class="hero-text">
          <h1 class="hero-title animate__animated animate__fadeInUp">
            {{ languageStore.t('bookingTitle').toUpperCase() }}
            <span class="hero-title-accent">SIM RACING</span>
          </h1>
          <p class="hero-subtitle animate__animated animate__fadeInUp animate__delay-1s">
            {{ languageStore.t('bookingSubtitle') }}
          </p>
          <!-- Selected Plan Indicator -->
          <div v-if="selectedPlanName" class="selected-plan-indicator animate__animated animate__fadeInUp animate__delay-2s">
            <i class="fas fa-check-circle"></i>
            {{ languageStore.t('selectedPlan') }}: <strong>{{ selectedPlanName }}</strong>
          </div>
        </div>
      </div>
    </section>

    <!-- Booking Form Section -->
    <section class="booking-form-section section-padding">
      <div class="container">
        <form @submit.prevent="submitBooking" class="booking-form">
          <!-- Personal Information Card -->
          <div class="form-card animate__animated animate__fadeInUp">
            <div class="card-header">
              <h3 class="card-title">
                <i class="fas fa-user"></i>
                {{ languageStore.t('personalInfo') }}
              </h3>
            </div>
            <div class="card-content">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-user"></i>
                    {{ languageStore.t('fullName') }} *
                  </label>
                  <input 
                    v-model="booking.name"
                    type="text" 
                    required
                    class="form-input"
                    :placeholder="languageStore.t('enterName')"
                  />
                </div>
                
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-phone"></i>
                    {{ languageStore.t('phone') }} *
                  </label>
                  <input 
                    v-model="booking.phone"
                    type="tel" 
                    required
                    class="form-input"
                    placeholder="0888 123 456"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-envelope"></i>
                  {{ languageStore.t('email') }}
                </label>
                <input 
                  v-model="booking.email"
                  type="email"
                  class="form-input"
                  placeholder="your@email.com"
                />
              </div>
            </div>
          </div>

          <!-- Date and Time Card -->
          <div class="form-card animate__animated animate__fadeInUp animate__delay-1s">
            <div class="card-header">
              <h3 class="card-title">
                <i class="fas fa-calendar"></i>
                {{ languageStore.t('dateAndTime') }}
              </h3>
            </div>
            <div class="card-content">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-calendar-alt"></i>
                    {{ languageStore.t('date') }} *
                  </label>
                  <input 
                    v-model="booking.date"
                    type="date" 
                    required
                    :min="today"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-clock"></i>
                    {{ languageStore.t('startTime') }} *
                  </label>
                  <select 
                    v-model="booking.startTime"
                    required
                    class="form-input"
                  >
                    <option value="">{{ languageStore.t('selectHour') }}</option>
                    <option v-for="time in availableTimes" :key="time" :value="time">{{ time }}</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-hourglass-half"></i>
                    {{ languageStore.t('duration') }} *
                  </label>
                  <select 
                    v-model="booking.duration"
                    required
                    @change="calculatePrice"
                    class="form-input"
                  >
                    <option value="">{{ languageStore.t('selectHours') }}</option>
                    <option value="0.25">15 {{ languageStore.t('minutes') }}</option>
                    <option value="0.5">30 {{ languageStore.t('minutes') }}</option>
                    <option value="1">1 {{ languageStore.t('hour') }}</option>
                    <option value="2">2 {{ languageStore.t('hours2') }}</option>
                    <option value="3">3 {{ languageStore.t('hours2') }}</option>
                    <option value="4">4 {{ languageStore.t('hours2') }}</option>
                    <option value="6">6 {{ languageStore.t('hours2') }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Booking Type Card -->
          <div class="form-card animate__animated animate__fadeInUp animate__delay-2s">
            <div class="card-header">
              <h3 class="card-title">
                <i class="fas fa-star"></i>
                {{ languageStore.t('bookingType') }}
              </h3>
            </div>
            <div class="card-content">
              <div class="booking-types-grid">
                <div 
                  v-for="type in bookingTypes" 
                  :key="type.id"
                  @click="booking.type = type.id; calculatePrice()"
                  class="booking-type-card"
                  :class="{ 'selected': booking.type === type.id }"
                >
                  <div class="type-icon">{{ type.icon }}</div>
                  <div class="type-name">{{ type.name }}</div>
                  <div class="type-description">{{ type.description }}</div>
                  <div class="type-price">+{{ Math.round((type.multiplier - 1) * 100) }}%</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Simulator Selection Card -->
          <div class="form-card animate__animated animate__fadeInUp animate__delay-3s">
            <div class="card-header">
              <h3 class="card-title">
                <i class="fas fa-desktop"></i>
                {{ languageStore.t('selectSimulator') }} *
              </h3>
            </div>
            <div class="card-content">
              <div class="simulators-grid">
                <div 
                  v-for="simulator in simulators" 
                  :key="simulator.id"
                  @click="booking.computerId = simulator.id"
                  class="simulator-card"
                  :class="{ 'selected': booking.computerId === simulator.id }"
                >
                  <!-- Background Image -->
                  <div 
                    class="simulator-image"
                    :style="simulator.image_url ? `background-image: url('${simulator.image_url}')` : ''"
                  >
                    <!-- Status Badge -->
                    <div class="simulator-status">
                      <span 
                        class="status-badge"
                        :class="simulator.status === 'available' ? 'status-available' : 'status-unavailable'"
                      >
                        {{ simulator.status === 'available' ? languageStore.t('available') : languageStore.t('unavailable') }}
                      </span>
                    </div>

                    <!-- Features -->
                    <div class="simulator-features">
                      <span v-if="simulator.has_motion" class="feature-badge motion-badge">Motion</span>
                      <span v-if="simulator.has_vr" class="feature-badge vr-badge">VR</span>
                    </div>
                  </div>

                  <!-- Content -->
                  <div class="simulator-content">
                    <h4 class="simulator-name">{{ simulator.name }}</h4>
                    
                    <div class="simulator-specs">
                      <div class="spec-item">
                        <i class="fas fa-microchip"></i>
                        {{ simulator.gpu }}
                      </div>
                      <div class="spec-item">
                        <i class="fas fa-tv"></i>
                        {{ getScreenSetupText(simulator.screen_setup) }}
                      </div>
                      <div class="spec-item">
                        <i class="fas fa-cogs"></i>
                        {{ getSetupTypeText(simulator.setup_type) }}
                      </div>
                    </div>

                    <p class="simulator-description">{{ simulator.description }}</p>
                  </div>

                  <!-- Selection Indicator -->
                  <div v-if="booking.computerId === simulator.id" class="selection-indicator">
                    <i class="fas fa-check"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Special Requests Card -->
          <div class="form-card animate__animated animate__fadeInUp animate__delay-4s">
            <div class="card-header">
              <h3 class="card-title">
                <i class="fas fa-comment"></i>
                Специални изисквания
              </h3>
            </div>
            <div class="card-content">
              <div class="form-group">
                <textarea 
                  v-model="booking.specialRequests"
                  rows="4"
                  class="form-textarea"
                  placeholder="Напишете специални изисквания, предпочитания за игри, настройки и т.н."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Price Summary Card -->
          <div v-if="totalPrice > 0" class="form-card price-card animate__animated animate__fadeInUp animate__delay-5s">
            <div class="card-header">
              <h3 class="card-title">
                <i class="fas fa-calculator"></i>
                Обща цена
              </h3>
            </div>
            <div class="card-content">
              <div class="price-breakdown">
                <div class="price-line">
                  <span>{{ booking.duration }} час(а) × {{ pricePerHour }}лв.</span>
                  <span class="price-amount">{{ basePrice }}лв.</span>
                </div>
                <div v-if="selectedBookingType && selectedBookingType.multiplier > 1" class="price-line">
                  <span>{{ selectedBookingType.name }} (+{{ Math.round((selectedBookingType.multiplier - 1) * 100) }}%)</span>
                  <span class="price-amount">+{{ (basePrice * (selectedBookingType.multiplier - 1)).toFixed(2) }}лв.</span>
                </div>
              </div>
              <div class="total-price">
                <span class="total-label">Общо:</span>
                <span class="total-amount">{{ totalPrice }}лв.</span>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="form-actions animate__animated animate__fadeInUp animate__delay-6s">
            <button
              type="submit"
              :disabled="loading || !canSubmit"
              class="btn-primary submit-btn"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-calendar-check"></i>
              {{ loading ? 'Обработва се...' : 'Резервирай сега' }}
            </button>
          </div>
        </form>
      </div>
    </section>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="modal-overlay">
      <div class="modal-content animate__animated animate__bounceIn">
        <div class="modal-icon">🎉</div>
        <h3 class="modal-title">Резервацията е изпратена!</h3>
        <p class="modal-text">
          Вашата резервация за {{ booking.date }} в {{ booking.startTime }} е получена. 
          Ще се свържем с вас скоро за потвърждение.
        </p>
        <button @click="closeSuccessModal" class="btn-primary modal-btn">
          Затвори
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useLanguageStore } from '../stores/language'
import axios from 'axios'

export default {
  name: 'Booking',
  setup() {
    const route = useRoute()
    const languageStore = useLanguageStore()
    const booking = ref({
      name: '',
      phone: '',
      email: '',
      date: '',
      startTime: '',
      duration: '',
      type: 'standard',
      computerId: null,
      specialRequests: ''
    })

    const loading = ref(false)
    const showSuccessModal = ref(false)
    const pricePerHour = ref(30)

    const today = computed(() => {
      return new Date().toISOString().split('T')[0]
    })

    const availableTimes = ref([
      '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
      '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
    ])

    const bookingTypes = ref([
      {
        id: 'standard',
        name: 'Standard',
        description: 'Стандартен опит',
        icon: '🏁',
        multiplier: 1.0
      },
      {
        id: 'vip',
        name: 'VIP',
        description: 'VIP опит с инструктор',
        icon: '👑',
        multiplier: 1.5
      },
      {
        id: 'group',
        name: 'Група',
        description: 'Групова резервация',
        icon: '👥',
        multiplier: 1.2
      },
      {
        id: 'endurance',
        name: 'Endurance',
        description: 'Дълги състезания',
        icon: '⏱️',
        multiplier: 1.3
      }
    ])

    const simulators = ref([])
    const loadingSimulators = ref(false)

    // Load simulators from API
    const loadSimulators = async () => {
      loadingSimulators.value = true
      try {
        const response = await axios.get('/api/simulators/available')
        if (response.data.success) {
          simulators.value = response.data.simulators
        }
      } catch (error) {
        console.error('Error loading simulators:', error)
        // Fallback to demo data if API fails
        simulators.value = [
          { 
            id: 1, 
            name: 'Elite Racing Rig Pro', 
            description: 'Професионален симулатор с motion platform и VR поддръжка',
            specs: 'RTX 4090, Triple 32" 4K монитори, Direct Drive wheel base',
            gpu: 'RTX 4090', 
            setup_type: 'motion',
            has_motion: 1,
            has_vr: 1,
            screen_setup: 'triple',
            image_url: '/simulators/elite-rig-pro.jpg',
            status: 'available' 
          },
          { 
            id: 2, 
            name: 'VIP Racing Cockpit', 
            description: 'VIP симулатор с професионални компоненти',
            specs: 'RTX 4080 Super, Triple 27" QHD монитори',
            gpu: 'RTX 4080 Super', 
            setup_type: 'full_set',
            has_motion: 0,
            has_vr: 1,
            screen_setup: 'triple',
            image_url: '/simulators/vip-cockpit.jpg',
            status: 'available' 
          },
          { 
            id: 3, 
            name: 'Racing Simulator Alpha', 
            description: 'Висококласен симулатор с ultrawide монитор',
            specs: 'RTX 4070 Ti, 49" Ultrawide 5120x1440',
            gpu: 'RTX 4070 Ti', 
            setup_type: 'full_set',
            has_motion: 0,
            has_vr: 1,
            screen_setup: 'ultrawide',
            image_url: '/simulators/alpha-sim.jpg',
            status: 'available' 
          }
        ]
      } finally {
        loadingSimulators.value = false
      }
    }

    // Helper functions for text display
    const getScreenSetupText = (screenSetup) => {
      const setups = {
        'single': 'Single Screen',
        'triple': 'Triple Screen',
        'ultrawide': 'Ultrawide',
        'vr': 'VR Headset'
      }
      return setups[screenSetup] || screenSetup
    }

    const getSetupTypeText = (setupType) => {
      const types = {
        'wheel_only': 'Само волан',
        'full_set': 'Пълен сет',
        'motion': 'Motion Platform'
      }
      return types[setupType] || setupType
    }

    const selectedBookingType = computed(() => {
      return bookingTypes.value.find(type => type.id === booking.value.type)
    })

    const basePrice = computed(() => {
      if (!booking.value.duration) return 0
      return parseInt(booking.value.duration) * pricePerHour.value
    })

    const totalPrice = computed(() => {
      if (!selectedBookingType.value) return basePrice.value
      return (basePrice.value * selectedBookingType.value.multiplier).toFixed(2)
    })

    const canSubmit = computed(() => {
      return booking.value.name && 
             booking.value.phone && 
             booking.value.date && 
             booking.value.startTime && 
             booking.value.duration &&
             booking.value.computerId &&
             !loading.value
    })

    const selectedPlanName = computed(() => {
      const selectedPlan = route.query.plan
      const planNames = {
        'tester': 'TESTER',
        'rookie': 'ROOKIE', 
        'racer': 'RACER'
      }
      return planNames[selectedPlan] || null
    })

    const calculatePrice = () => {
      // Price calculation is reactive through computed properties
    }

    // Set plan duration based on selected plan
    const setPlanDuration = () => {
      const selectedPlan = route.query.plan
      if (selectedPlan) {
        switch (selectedPlan) {
          case 'tester':
            booking.value.duration = '0.25' // 15 минути
            break
          case 'rookie':
            booking.value.duration = '0.5' // 30 минути
            break
          case 'racer':
            booking.value.duration = '1' // 60 минути
            break
        }
      }
    }

    // Load simulators when component mounts
    onMounted(() => {
      loadSimulators()
      setPlanDuration()
    })

    const submitBooking = async () => {
      if (!canSubmit.value) return

      loading.value = true
      
      try {
        const bookingData = {
          name: booking.value.name,
          phone: booking.value.phone,
          email: booking.value.email,
          date: booking.value.date,
          start_time: booking.value.startTime,
          duration_hours: parseInt(booking.value.duration),
          booking_type: booking.value.type,
          computer_id: booking.value.computerId,
          special_requests: booking.value.specialRequests,
          total_price: parseFloat(totalPrice.value)
        }

        const response = await axios.post('/api/bookings', bookingData)
        
        if (response.data.success) {
          showSuccessModal.value = true
          // Reset form
          booking.value = {
            name: '',
            phone: '',
            email: '',
            date: '',
            startTime: '',
            duration: '',
            type: 'standard',
            computerId: null,
            specialRequests: ''
          }
        }
      } catch (error) {
        console.error('Booking error:', error)
        alert('Грешка при изпращане на резервацията. Моля опитайте отново.')
      } finally {
        loading.value = false
      }
    }

    const closeSuccessModal = () => {
      showSuccessModal.value = false
    }

    return {
      languageStore,
      booking,
      loading,
      showSuccessModal,
      today,
      availableTimes,
      bookingTypes,
      simulators,
      selectedBookingType,
      selectedPlanName,
      basePrice,
      totalPrice,
      pricePerHour,
      canSubmit,
      calculatePrice,
      submitBooking,
      closeSuccessModal,
      loadSimulators,
      getScreenSetupText,
      getSetupTypeText
    }
  }
}
</script>

<style scoped>
/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

.booking-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #000 0%, #001a1a 50%, #000 100%);
  color: #fff;
}

/* Hero Section */
.hero {
  position: relative;
  background: linear-gradient(135deg, #000 0%, #001a1a 25%, #002626 50%, #001a1a 75%, #000 100%);
  padding: 6rem 0 4rem;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 50%, rgba(0, 161, 156, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(0, 161, 156, 0.1) 0%, transparent 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
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
  margin: 0;
  max-width: 600px;
  margin: 0 auto;
}

.selected-plan-indicator {
  margin-top: 1.5rem;
  padding: 1rem 2rem;
  background: rgba(0, 161, 156, 0.2);
  border: 1px solid rgba(0, 161, 156, 0.4);
  border-radius: 25px;
  color: #00A19C;
  font-size: 1.1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.selected-plan-indicator i {
  color: #00A19C;
}

.selected-plan-indicator strong {
  color: #fff;
}

/* Section Padding */
.section-padding {
  padding: 4rem 0;
}

/* Form Styles */
.booking-form {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-card {
  background: rgba(0, 161, 156, 0.1);
  border: 1px solid rgba(0, 161, 156, 0.3);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.form-card:hover {
  border-color: rgba(0, 161, 156, 0.5);
  box-shadow: 0 8px 32px rgba(0, 161, 156, 0.2);
}

.card-header {
  background: rgba(0, 161, 156, 0.2);
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(0, 161, 156, 0.3);
}

.card-title {
  font-family: 'Orbitron', monospace;
  font-size: 1.25rem;
  font-weight: 700;
  color: #00A19C;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-content {
  padding: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #ccc;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.form-label i {
  color: #00A19C;
  width: 16px;
}

.form-input, .form-textarea {
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 161, 156, 0.3);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #00A19C;
  box-shadow: 0 0 0 3px rgba(0, 161, 156, 0.2);
}

.form-input::placeholder, .form-textarea::placeholder {
  color: #666;
}

/* Booking Types Grid */
.booking-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.booking-type-card {
  padding: 1.5rem;
  text-align: center;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(0, 161, 156, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.booking-type-card:hover {
  border-color: rgba(0, 161, 156, 0.6);
  transform: translateY(-2px);
}

.booking-type-card.selected {
  border-color: #00A19C;
  background: rgba(0, 161, 156, 0.2);
  box-shadow: 0 0 20px rgba(0, 161, 156, 0.3);
}

.type-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.type-name {
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  color: #00A19C;
  margin-bottom: 0.5rem;
}

.type-description {
  color: #ccc;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.type-price {
  color: #00A19C;
  font-weight: 700;
}

/* Simulators Grid */
.simulators-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.simulator-card {
  position: relative;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(0, 161, 156, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.simulator-card:hover {
  border-color: rgba(0, 161, 156, 0.6);
  transform: translateY(-2px);
}

.simulator-card.selected {
  border-color: #00A19C;
  background: rgba(0, 161, 156, 0.2);
  box-shadow: 0 0 20px rgba(0, 161, 156, 0.3);
}

.simulator-image {
  height: 200px;
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
}

.simulator-image::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 161, 156, 0.1) 0%, rgba(0, 0, 0, 0.6) 100%);
}

.simulator-content {
  padding: 1.5rem;
}

.simulator-status {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 2;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-available {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-unavailable {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.simulator-features {
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  gap: 0.5rem;
  z-index: 2;
}

.feature-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.motion-badge {
  background: rgba(249, 115, 22, 0.2);
  color: #f97316;
  border: 1px solid rgba(249, 115, 22, 0.3);
}

.vr-badge {
  background: rgba(147, 51, 234, 0.2);
  color: #9333ea;
  border: 1px solid rgba(147, 51, 234, 0.3);
}

.simulator-name {
  font-family: 'Orbitron', monospace;
  font-size: 1.25rem;
  font-weight: 700;
  color: #00A19C;
  margin: 0 0 1rem;
}

.simulator-specs {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.spec-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ccc;
  font-size: 0.9rem;
}

.spec-item i {
  color: #00A19C;
  width: 16px;
}

.simulator-description {
  color: #999;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
}

.selection-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #00A19C;
  color: #000;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  box-shadow: 0 0 20px rgba(0, 161, 156, 0.5);
}

/* Price Card */
.price-card {
  border-color: #00A19C;
  box-shadow: 0 0 30px rgba(0, 161, 156, 0.2);
}

.price-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 161, 156, 0.3);
}

.price-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #ccc;
}

.price-amount {
  color: #00A19C;
  font-weight: 600;
}

.total-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.25rem;
}

.total-label {
  font-family: 'Orbitron', monospace;
  font-weight: 700;
}

.total-amount {
  font-family: 'Orbitron', monospace;
  font-size: 2rem;
  font-weight: 700;
  color: #00A19C;
  text-shadow: 0 0 10px rgba(0, 161, 156, 0.5);
}

/* Form Actions */
.form-actions {
  text-align: center;
}

.btn-primary {
  background: linear-gradient(135deg, #00A19C 0%, #008B8B 100%);
  color: #fff;
  border: none;
  padding: 1rem 3rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #008B8B 0%, #006666 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 161, 156, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.submit-btn {
  min-width: 200px;
  justify-content: center;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  background: rgba(0, 161, 156, 0.1);
  border: 1px solid rgba(0, 161, 156, 0.3);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.modal-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.modal-title {
  font-family: 'Orbitron', monospace;
  font-size: 1.5rem;
  font-weight: 700;
  color: #00A19C;
  margin: 0 0 1rem;
}

.modal-text {
  color: #ccc;
  line-height: 1.6;
  margin: 0 0 2rem;
}

.modal-btn {
  padding: 0.75rem 2rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .booking-types-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .simulators-grid {
    grid-template-columns: 1fr;
  }
  
  .card-content {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .booking-types-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .card-header {
    padding: 1rem 1.5rem;
  }
  
  .card-content {
    padding: 1rem;
  }
}

/* Animations */
.glow-pulse {
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    box-shadow: 0 0 20px rgba(0, 161, 156, 0.2);
  }
  to {
    box-shadow: 0 0 30px rgba(0, 161, 156, 0.4);
  }
}
</style>