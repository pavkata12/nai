<template>
  <div class="academy-page">
    <!-- Hero Section -->
    <section class="academy-hero section-padding">
      <div class="hero-bg-pattern"></div>
      <div class="hero-particles"></div>
      <div class="container">
        <div class="hero-content animate__animated animate__fadeInDown">
          <div class="hero-icon-wrapper">
            <div class="icon-glow"></div>
            <i class="fas fa-graduation-cap hero-main-icon"></i>
          </div>
          <h1 class="hero-title">
            {{ languageStore.t('racingAcademy') }}
          </h1>
          <p class="hero-subtitle">
            {{ languageStore.t('learnToDrive') }}
          </p>
          <div class="hero-decorative-line">
            <span class="line-segment"></span>
            <span class="line-diamond">◆</span>
            <span class="line-segment"></span>
        </div>
            </div>
            </div>
    </section>

    <!-- Courses Section -->
    <section class="courses-section section-padding">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">{{ languageStore.t('academyCourses') }}</h2>
          <p class="section-subtitle">{{ languageStore.t('chooseCourse') }}</p>
          </div>
          
        <!-- Category Filter -->
        <div class="category-filter" v-if="categories.length > 0">
          <button 
            @click="selectedCategory = null"
            class="category-btn"
            :class="{ 'active': selectedCategory === null }"
          >
            <i class="fas fa-th-large"></i>
            {{ languageStore.t('allCourses') }}
          </button>
          <button 
              v-for="category in categories" 
              :key="category.id"
              @click="selectedCategory = category.id"
            class="category-btn"
              :class="{ 'active': selectedCategory === category.id }"
            >
                <i :class="category.icon"></i>
            {{ category.name }}
          </button>
              </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <span>{{ languageStore.t('loadingCourses') }}</span>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <span>{{ error }}</span>
          <button @click="loadCourses" class="btn-secondary">{{ languageStore.t('tryAgain') }}</button>
          </div>
          
        <!-- Courses Grid -->
        <div v-else class="courses-grid">
            <div 
              v-for="course in filteredCourses" 
              :key="course.id"
              class="course-card"
            :class="{ 'purchased': isPurchased(course.id) }"
            >
            <!-- Course Thumbnail -->
              <div 
              class="course-thumbnail"
              :style="course.thumbnail_url ? `background-image: url('${course.thumbnail_url}')` : ''"
              >
              <div class="course-overlay"></div>
              
              <!-- Course Badges -->
                  <div class="course-badges">
                <span 
                  class="difficulty-badge"
                  :class="`difficulty-${course.difficulty}`"
                >
                      {{ getDifficultyText(course.difficulty) }}
                    </span>
                <span v-if="isPurchased(course.id)" class="purchased-badge">
                  <i class="fas fa-check"></i>
                  {{ languageStore.t('purchased') }}
                </span>
                </div>

              <!-- Play Button for purchased courses -->
              <div v-if="isPurchased(course.id)" class="play-button" @click="watchCourse(course)">
                <i class="fas fa-play"></i>
              </div>
              
              <!-- Price for non-purchased courses -->
              <div v-else class="course-price">
                <span class="price-amount">{{ course.price_tokens }}</span>
                <i class="fas fa-coins"></i>
              </div>
            </div>

            <!-- Course Info -->
            <div class="course-info">
              <div class="course-category" v-if="course.category_name">
                <i :class="course.category_icon || 'fas fa-graduation-cap'"></i>
                {{ course.category_name }}
              </div>
              
                <h3 class="course-title">{{ course.title }}</h3>
                <p class="course-description">{{ course.description }}</p>
                
                <div class="course-meta">
                <div class="meta-item" v-if="course.duration">
                    <i class="fas fa-clock"></i>
                  {{ course.duration }}
                  </div>
                </div>
                
              <!-- Action Button -->
              <div class="course-action">
                <button 
                  v-if="isPurchased(course.id)"
                  @click="watchCourse(course)"
                  class="btn-primary"
                >
                  <i class="fas fa-play"></i>
                  {{ languageStore.t('watchCourse') }}
                </button>
                <button 
                  v-else
                  @click="purchaseCourse(course)"
                  class="btn-secondary"
                  :disabled="!canAfford(course.price_tokens) || purchasing"
                >
                  <i v-if="purchasing" class="fas fa-spinner fa-spin"></i>
                  <i v-else class="fas fa-shopping-cart"></i>
                  {{ canAfford(course.price_tokens) ? languageStore.t('buyFor') + ' ' + course.price_tokens + ' ' + languageStore.t('tokens') : languageStore.t('notEnoughTokens') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!loading && !error && filteredCourses.length === 0" class="empty-state">
                    <i class="fas fa-graduation-cap"></i>
          <h3>{{ languageStore.t('noCoursesAvailable') }}</h3>
          <p>{{ languageStore.t('addCoursesSoon') }}</p>
                  </div>
                  </div>
    </section>

    <!-- Purchase Confirmation Modal -->
    <div v-if="showPurchaseModal" class="modal-overlay" @click="closePurchaseModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ languageStore.t('confirmPurchase') }}</h3>
          <button @click="closePurchaseModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body" v-if="selectedCourse">
          <div class="purchase-summary">
          <div class="course-preview">
              <div 
                class="preview-thumbnail"
                :style="selectedCourse.thumbnail_url ? `background-image: url('${selectedCourse.thumbnail_url}')` : ''"
              >
                <div class="preview-overlay"></div>
              </div>
              <div class="preview-info">
                <h4>{{ selectedCourse.title }}</h4>
                <p>{{ selectedCourse.description }}</p>
              </div>
            </div>
            
            <div class="purchase-details">
              <div class="detail-row">
                <span>{{ languageStore.t('price') }}:</span>
                <span class="price">{{ selectedCourse.price_tokens }} {{ languageStore.t('tokens') }}</span>
            </div>
              <div class="detail-row">
                <span>{{ languageStore.t('yourTokens') }}:</span>
                <span class="tokens">{{ userTokens }} {{ languageStore.t('tokens') }}</span>
              </div>
              <div class="detail-row total">
                <span>{{ languageStore.t('remaining') }}:</span>
                <span class="remaining">{{ userTokens - selectedCourse.price_tokens }} {{ languageStore.t('tokens') }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closePurchaseModal" class="btn-secondary">
            Отказ
          </button>
          <button @click="confirmPurchase" class="btn-primary" :disabled="purchasing">
            <i v-if="purchasing" class="fas fa-spinner fa-spin"></i>
            <span v-else>Купи курса</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useLanguageStore } from '../stores/language'
import { netcafeAPI } from '../api/netcafe-api'

export default {
  name: 'Academy',
  setup() {
    const authStore = useAuthStore()
    const languageStore = useLanguageStore()
    
    const loading = ref(false)
    const error = ref(null)
    const purchasing = ref(false)
    
    const courses = ref([])
    const categories = ref([])
    const purchasedCourses = ref([])
    const selectedCategory = ref(null)
    
    const showPurchaseModal = ref(false)
    const selectedCourse = ref(null)
    
    // Computed
    const filteredCourses = computed(() => {
      if (!selectedCategory.value) {
        return courses.value.filter(course => course.is_active)
      }
      return courses.value.filter(course => 
        course.is_active && course.category_id === selectedCategory.value
      )
    })
    
    const userTokens = computed(() => {
      return authStore.user?.tokens || 0
    })
    
    // Methods
    const loadCourses = async () => {
      loading.value = true
      error.value = null
      
      try {
        const [coursesResponse, categoriesResponse] = await Promise.all([
          netcafeAPI.getAcademyCourses(),
          netcafeAPI.getAcademyCategories()
        ])
        
        if (coursesResponse.success) {
          courses.value = coursesResponse.courses || []
        }
        
        if (categoriesResponse.success) {
          categories.value = categoriesResponse.categories || []
        }
        
        // Load purchased courses if user is logged in
        if (authStore.isLoggedIn) {
          await loadPurchasedCourses()
        }
        
      } catch (err) {
        console.error('Error loading courses:', err)
        error.value = 'Грешка при зареждане на курсовете'
      } finally {
        loading.value = false
      }
    }
    
    const loadPurchasedCourses = async () => {
      try {
        const response = await netcafeAPI.getMyAcademyCourses()
        if (response.success) {
          purchasedCourses.value = response.courses || []
        }
      } catch (err) {
        console.error('Error loading purchased courses:', err)
      }
    }
    
    const isPurchased = (courseId) => {
      return purchasedCourses.value.some(purchase => purchase.id === courseId)
    }
    
    const canAfford = (price) => {
      return userTokens.value >= price
    }
    
    const getDifficultyText = (difficulty) => {
      const difficulties = {
        'beginner': 'За начинаещи',
        'intermediate': 'За напреднали', 
        'advanced': 'За експерти'
      }
      return difficulties[difficulty] || difficulty
    }
    
    const purchaseCourse = (course) => {
      if (!authStore.isLoggedIn) {
        alert('Моля, влезте в профила си за да купите курс')
        return
      }
      
      if (!canAfford(course.price_tokens)) {
        alert('Нямате достатъчно токени за този курс')
        return
      }
      
      selectedCourse.value = course
      showPurchaseModal.value = true
    }
    
    const closePurchaseModal = () => {
      showPurchaseModal.value = false
      selectedCourse.value = null
    }
    
    const confirmPurchase = async () => {
      if (!selectedCourse.value) return
      
      purchasing.value = true
      
      try {
        const response = await netcafeAPI.purchaseAcademyCourse(selectedCourse.value.id)
        
        if (response.success) {
          // Update tokens immediately from response (same as tournaments)
          if (typeof response.remaining_tokens === 'number') {
            await authStore.updateTokens(response.remaining_tokens)
          }
          
          // Reload purchased courses
          await loadPurchasedCourses()
          
          // Show detailed success message (same as tournaments)
          alert(`Успешно закупихте курса!\nПлатени токени: ${response.tokens_spent}\nОставащи токени: ${response.remaining_tokens}`)
          closePurchaseModal()
        } else {
          alert('❌ Грешка при покупката: ' + (response.error || response.message || 'Неизвестна грешка'))
        }
      } catch (err) {
        console.error('Error purchasing course:', err)
        
        if (err.response && err.response.data && err.response.data.message) {
          alert('Грешка при покупката: ' + err.response.data.message)
        } else {
          alert('Грешка при покупката. Моля, опитайте отново.')
        }
      } finally {
        purchasing.value = false
      }
    }
    
    const watchCourse = (course) => {
      if (!course.youtube_url) {
        alert('Видеото не е налично в момента')
        return
      }
      
      // Open YouTube video in new tab
      window.open(course.youtube_url, '_blank')
    }
    
    onMounted(() => {
      loadCourses()
    })
    
    // Watch for authentication changes
    watch(() => authStore.isLoggedIn, (newValue) => {
      if (newValue) {
        // User just logged in, load their purchased courses
        loadPurchasedCourses()
      } else {
        // User logged out, clear purchased courses
        purchasedCourses.value = []
      }
    })
    
    return {
      languageStore,
      loading,
      error,
      purchasing,
      courses,
      categories,
      selectedCategory,
      filteredCourses,
      userTokens,
      showPurchaseModal,
      selectedCourse,
      loadCourses,
      isPurchased,
      canAfford,
      getDifficultyText,
      purchaseCourse,
      closePurchaseModal,
      confirmPurchase,
      watchCourse
    }
  }
}
</script>

<style scoped>
.academy-page {
  padding-top: 80px;
}

/* Hero Section */
.academy-hero {
  position: relative;
  min-height: 500px;
  background: linear-gradient(135deg, #000000 0%, #001a1a 25%, #000d0d 50%, #002222 75%, #000000 100%);
  border-bottom: 2px solid rgba(0, 161, 156, 0.5);
  overflow: hidden;
  display: flex;
  align-items: center;
}

.hero-bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(0, 161, 156, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(0, 196, 180, 0.08) 0%, transparent 50%);
  animation: patternFloat 20s ease-in-out infinite;
}

.hero-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(2px 2px at 20% 30%, rgba(0, 161, 156, 0.8), transparent),
    radial-gradient(1px 1px at 60% 90%, rgba(0, 196, 180, 0.4), transparent);
  background-size: 550px 550px, 350px 350px;
  animation: particleFloat 30s linear infinite;
}

@keyframes patternFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes particleFloat {
  0% { transform: translateX(0px) translateY(0px); }
  50% { transform: translateX(-30px) translateY(-30px); }
  100% { transform: translateX(0px) translateY(0px); }
}

.hero-content {
  text-align: center;
  position: relative;
  z-index: 2;
}

.hero-icon-wrapper {
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
  animation: iconGlow 3s ease-in-out infinite;
}

.hero-main-icon {
  position: relative;
  font-size: 4rem;
  color: #00A19C;
  text-shadow: 0 0 20px rgba(0, 161, 156, 0.8);
  z-index: 1;
}

@keyframes iconGlow {
  0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
}

.hero-title {
  font-family: 'Orbitron', monospace;
  font-size: 4rem;
  font-weight: 900;
  color: #00A19C;
  text-shadow: 0 0 20px rgba(0, 161, 156, 0.8);
  margin: 0 0 1rem;
  letter-spacing: 3px;
}

.hero-title-accent {
  background: linear-gradient(45deg, #00A19C, #00C4B4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.4rem;
  color: #ccc;
  margin: 0 0 2rem;
  font-weight: 300;
}

.hero-decorative-line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.line-segment {
  width: 80px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #00A19C, transparent);
}

.line-diamond {
  color: #00A19C;
  font-size: 1.2rem;
  text-shadow: 0 0 10px rgba(0, 161, 156, 0.8);
}

/* Courses Section */
.courses-section {
  background: linear-gradient(180deg, #0a0a0a 0%, #000000 100%);
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-family: 'Orbitron', monospace;
  font-size: 2.5rem;
  font-weight: 700;
  color: #00A19C;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.1rem;
  color: #ccc;
  max-width: 600px;
  margin: 0 auto;
}

/* Category Filter */
.category-filter {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(0, 161, 156, 0.1);
  border: 1px solid rgba(0, 161, 156, 0.2);
  border-radius: 25px;
  color: #ccc;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.category-btn.active,
.category-btn:hover {
  background: rgba(0, 161, 156, 0.2);
  border-color: #00A19C;
  color: #00A19C;
}

/* Courses Grid */
.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.course-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border: 1px solid rgba(0, 161, 156, 0.3);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.course-card:hover {
  transform: translateY(-4px);
  border-color: rgba(0, 161, 156, 0.6);
  box-shadow: 0 8px 32px rgba(0, 161, 156, 0.2);
}

.course-card.purchased {
  border-color: #22c55e;
  box-shadow: 0 4px 20px rgba(34, 197, 94, 0.2);
}

/* Course Thumbnail */
.course-thumbnail {
  height: 200px;
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
}

.course-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 161, 156, 0.1) 0%, rgba(0, 0, 0, 0.6) 100%);
}

.course-badges {
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  gap: 0.5rem;
  z-index: 2;
}

.difficulty-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid;
}

.difficulty-beginner {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.4);
}

.difficulty-intermediate {
  background: rgba(249, 115, 22, 0.2);
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.4);
}

.difficulty-advanced {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.4);
}

.purchased-badge {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.4);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: rgba(0, 161, 156, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 2;
}

.play-button:hover {
  background: #00A19C;
  transform: translate(-50%, -50%) scale(1.1);
}

.play-button i {
  font-size: 1.5rem;
  color: #000;
  margin-left: 3px;
}

.course-price {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(251, 191, 36, 0.9);
  color: #000;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 2;
}

.price-amount {
  font-family: 'Orbitron', monospace;
  font-size: 1.1rem;
}

/* Course Info */
.course-info {
  padding: 1.5rem;
}

.course-category {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #00A19C;
  font-size: 0.8rem;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.course-title {
  color: #fff;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  line-height: 1.3;
}

.course-description {
  color: #ccc;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.course-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #999;
  font-size: 0.8rem;
}

.meta-item i {
  color: #00A19C;
}

.course-action {
  margin-top: auto;
}

.course-action button {
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

/* States */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  text-align: center;
}

.loading-state {
  color: #ccc;
}

.error-state {
  color: #ff4444;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.empty-state i {
  font-size: 3rem;
  color: #00A19C;
  margin-bottom: 1rem;
}

/* Purchase Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: rgba(0, 20, 20, 0.95);
  border: 1px solid rgba(0, 161, 156, 0.3);
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 161, 156, 0.2);
}

.modal-header h3 {
  color: #00A19C;
  margin: 0;
  font-family: 'Orbitron', monospace;
}

.modal-close {
  background: transparent;
  border: none;
  color: #ccc;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.3s;
}

.modal-close:hover {
  color: #00A19C;
}

.modal-body {
  padding: 1.5rem;
}

.purchase-summary {
  display: flex;
    flex-direction: column;
  gap: 1.5rem;
  }
  
.course-preview {
  display: flex;
    gap: 1rem;
}

.preview-thumbnail {
  width: 80px;
  height: 60px;
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 161, 156, 0.1);
}

.preview-info h4 {
  color: #fff;
  margin: 0 0 0.5rem;
}

.preview-info p {
  color: #ccc;
  font-size: 0.9rem;
  margin: 0;
}

.purchase-details {
  background: rgba(0, 161, 156, 0.05);
  border: 1px solid rgba(0, 161, 156, 0.2);
  border-radius: 8px;
  padding: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: #ccc;
}

.detail-row.total {
  border-top: 1px solid rgba(0, 161, 156, 0.2);
  padding-top: 0.5rem;
  margin-top: 0.5rem;
  font-weight: 600;
}

.price {
  color: #fbbf24;
  font-weight: 600;
}

.tokens {
  color: #00A19C;
  font-weight: 600;
}

.remaining {
  color: #22c55e;
  font-weight: 600;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid rgba(0, 161, 156, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
    letter-spacing: 2px;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .courses-grid {
    grid-template-columns: 1fr;
  }
  
  .category-filter {
    flex-direction: column;
    align-items: center;
  }
  
  .course-preview {
    flex-direction: column;
  }
  
  .modal-footer {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
}
</style> 