<template>
  <div class="shop-page min-h-screen page-with-nav">
    <!-- Hero Section -->
    <div class="hero">
      <div class="hero-overlay"></div>
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">
            ACADEMY <span class="hero-title-accent">{{ languageStore.t('shopTitle').toUpperCase() }}</span>
        </h1>
          <p class="hero-subtitle">
          {{ languageStore.t('shopSubtitle') }}
        </p>
          <div class="tokens-display">
            <i class="fas fa-coins"></i>
            Налични токени: <span class="tokens-amount">{{ authStore.userTokens }}</span>
          </div>
        </div>
        </div>
      </div>

    <div class="section-padding">
      <div class="container">
      <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Зареждане на продукти...</span>
      </div>

      <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <p>{{ error }}</p>
        <button @click="loadShopItems" class="btn-primary">
            <i class="fas fa-sync-alt"></i>
          Опитай отново
        </button>
      </div>

      <!-- Shop Content -->
      <div v-else>
          <!-- Categories -->
          <div class="categories-section">
            <div class="categories-grid">
          <button
            v-for="category in categories"
            :key="category"
            @click="selectedCategory = category"
            :class="[
                  'category-btn',
                  selectedCategory === category ? 'active' : ''
                ]"
              >
                <i :class="getCategoryIcon(category)"></i>
            {{ category }}
          </button>
        </div>
      </div>

          <!-- Products Grid -->
          <div class="products-grid">
        <div
          v-for="item in filteredItems"
          :key="item.id"
              class="product-card"
            >
              <!-- Background Image -->
              <div 
                class="product-image"
                :style="item.image_url ? `background-image: url('${item.image_url}')` : ''"
              >
                <!-- Status Badge -->
                <div class="status-badge" v-if="item.stock !== -1">
                  <span 
                    :class="item.stock > 0 ? 'status-available' : 'status-unavailable'"
                  >
                    {{ item.stock > 0 ? `Налични: ${item.stock}` : 'Изчерпано' }}
                  </span>
              </div>
              
                <!-- Feature Badges -->
                <div class="feature-badges">
                  <span v-if="item.popular" class="badge badge-popular">
                    <i class="fas fa-fire"></i> Популярен
                  </span>
                  <span v-if="item.premium" class="badge badge-premium">
                    <i class="fas fa-crown"></i> Premium
                  </span>
                  <span v-if="item.limited" class="badge badge-limited">
                    <i class="fas fa-bolt"></i> Ограничен
                  </span>
              </div>
              
                <!-- Price Badge -->
                <div class="price-badge">
                  <i class="fas fa-coins"></i>
                  <span class="price-amount">{{ item.price }}</span>
                  <span v-if="item.original_price && item.discount" class="original-price">
                  {{ item.original_price }}
                </span>
              </div>
              </div>

              <!-- Content -->
              <div class="product-content">
                <h3 class="product-name">{{ item.title }}</h3>
                <p class="product-description">{{ item.description }}</p>
                
                <!-- Features -->
                <div v-if="item.features" class="features-grid">
                  <div 
                v-for="feature in item.features.split(',')" 
                :key="feature"
                    class="feature-item"
              >
                    <i class="fas fa-check"></i>
                {{ feature.trim() }}
            </div>
          </div>
            
                <!-- Purchase Button -->
          <button
            @click="purchaseItem(item)"
              :disabled="!canPurchase(item)"
                  class="purchase-btn"
                  :class="{ 'disabled': !canPurchase(item) }"
          >
                  <i class="fas fa-shopping-cart"></i>
              <span v-if="item.stock === 0">Изчерпано</span>
              <span v-else-if="authStore.userTokens < item.price">Недостатъчно токени</span>
              <span v-else>Купи сега</span>
          </button>
              </div>
        </div>
      </div>

          <!-- Empty State -->
          <div v-if="filteredItems.length === 0" class="empty-state">
            <i class="fas fa-shopping-bag"></i>
            <p>Няма налични продукти в тази категория</p>
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
  name: 'Shop',
  setup() {
    const authStore = useAuthStore()
    const languageStore = useLanguageStore()
    
    const selectedCategory = ref('Всички')
    const items = ref([])
    const loading = ref(false)
    const error = ref(null)
    
    const loadShopItems = async (retryCount = 0) => {
      console.log('Loading shop items... (attempt', retryCount + 1, ')')
      loading.value = true
      error.value = null
      
      try {
        const response = await netcafeAPI.getShopItems()
        console.log('Shop items response:', response)
        if (response.success) {
          items.value = response.items || []
          console.log('Shop items loaded successfully:', items.value.length, 'items')
        } else {
          console.error('Shop items API error:', response.error)
          // Retry on API error if it's the first attempt
          if (retryCount < 2 && response.error && (response.error.includes('502') || response.error.includes('Failed to get shop items'))) {
            console.log('Retrying in 1 second due to server error...')
            setTimeout(() => loadShopItems(retryCount + 1), 1000)
            return
          }
          error.value = response.error || 'Грешка при зареждане на продуктите'
        }
      } catch (err) {
        console.error('Error loading shop items:', err)
        // Retry on network error if it's the first attempt  
        if (retryCount < 2) {
          console.log('Retrying in 1 second due to network error...')
          setTimeout(() => loadShopItems(retryCount + 1), 1000)
          return
        }
        error.value = 'Грешка при свързване със сървъра'
      } finally {
        loading.value = false
        console.log('Loading finished. Items count:', items.value.length)
      }
    }
    
    const categories = computed(() => {
      if (items.value.length === 0) return ['Всички']
      const cats = ['Всички', ...new Set(items.value.map(item => item.category))]
      return cats
    })
    
    const filteredItems = computed(() => {
      if (selectedCategory.value === 'Всички') {
        return items.value.filter(item => item.is_active)
      }
      return items.value.filter(item => 
        item.category === selectedCategory.value && item.is_active
      )
    })
    
    const canPurchase = (item) => {
      return item.stock !== 0 && authStore.userTokens >= item.price
    }
    
    const purchaseItem = async (item) => {
      if (!canPurchase(item)) return
      
      if (!authStore.isLoggedIn) {
        alert('Моля, влезте в профила си за да купувате продукти.')
        return
      }
      
      if (confirm(`Сигурни ли сте, че искате да купите ${item.title} за ${item.price} токена?`)) {
         try {
          const response = await netcafeAPI.purchaseItem(null, item.id)
          
          if (response.success) {
            if (typeof response.remaining_tokens === 'number') {
              await authStore.updateTokens(response.remaining_tokens)
            }
            
            await authStore.refreshUserData()
            console.log('Reloading shop items after purchase...')
            await loadShopItems()
            
            alert(`✅ Успешно закупихте ${item.title}!\n💰 Платени токени: ${response.tokens_spent}\n💰 Оставащи токени: ${authStore.userTokens}`)
          } else {
            alert('❌ Грешка при покупката: ' + (response.error || 'Неизвестна грешка'))
          }
        } catch (err) {
          console.error('Purchase error:', err)
          alert('❌ Грешка при покупката. Моля, опитайте отново.')
        }
      }
    }
    
    const getCategoryIcon = (category) => {
      const icons = {
        'Всички': 'fas fa-th-large',
        'VIP': 'fas fa-crown',
        'VR': 'fas fa-vr-cardboard',
        'Обучение': 'fas fa-graduation-cap',
        'Настройки': 'fas fa-cogs',
        'Анализ': 'fas fa-chart-line',
        'Оборудване': 'fas fa-gamepad',
        'Премиум': 'fas fa-star'
      }
      return icons[category] || 'fas fa-tag'
    }
    
    onMounted(async () => {
      // Refresh user data to ensure latest token count
      if (authStore.isLoggedIn) {
        await authStore.refreshUserData()
      }
      await loadShopItems()
    })
    
    return {
      languageStore,
      authStore,
      selectedCategory,
      items,
      loading,
      error,
      categories,
      filteredItems,
      canPurchase,
      purchaseItem,
      getCategoryIcon
    }
  }
}
</script>

<style scoped>
/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

.shop-page {
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
  margin: 0 0 2rem;
}

.tokens-display {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: rgba(0, 161, 156, 0.1);
  border: 1px solid rgba(0, 161, 156, 0.3);
  border-radius: 12px;
  font-size: 1.25rem;
  color: #ccc;
}

.tokens-display i {
  color: #fbbf24;
}

.tokens-amount {
  color: #fbbf24;
  font-weight: 700;
  font-family: 'Orbitron', monospace;
}

/* Section Padding */
.section-padding {
  padding: 4rem 0;
}

/* Categories Section */
.categories-section {
  margin-bottom: 3rem;
}

.categories-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: rgba(0, 161, 156, 0.1);
  border: 1px solid rgba(0, 161, 156, 0.3);
  border-radius: 12px;
  color: #ccc;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
}

.category-btn:hover {
  background: rgba(0, 161, 156, 0.2);
  border-color: rgba(0, 161, 156, 0.5);
  transform: translateY(-2px);
}

.category-btn.active {
  background: rgba(0, 161, 156, 0.2);
  border-color: #00A19C;
  color: #00A19C;
}

.category-btn i {
  font-size: 1.1rem;
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

/* Product Card */
.product-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 161, 156, 0.3);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  border-color: rgba(0, 161, 156, 0.6);
  box-shadow: 0 8px 32px rgba(0, 161, 156, 0.2);
}

.product-image {
  height: 200px;
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
}

.product-image::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 161, 156, 0.1) 0%, rgba(0, 0, 0, 0.6) 100%);
}

.status-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 2;
}

.status-available {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.4);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-unavailable {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.4);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.feature-badges {
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 2;
}

.badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid;
}

.badge-popular {
  background: rgba(249, 115, 22, 0.2);
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.4);
}

.badge-premium {
  background: rgba(147, 51, 234, 0.2);
  color: #9333ea;
  border-color: rgba(147, 51, 234, 0.4);
}

.badge-limited {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  border-color: rgba(251, 191, 36, 0.4);
}

.price-badge {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(251, 191, 36, 0.4);
  border-radius: 12px;
  z-index: 2;
}

.price-badge i {
  color: #fbbf24;
}

.price-amount {
  color: #fbbf24;
  font-weight: 700;
  font-family: 'Orbitron', monospace;
}

.original-price {
  color: #666;
  text-decoration: line-through;
  font-size: 0.8rem;
}

.product-content {
  padding: 1.5rem;
}

.product-name {
  color: #00A19C;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  font-family: 'Orbitron', monospace;
}

.product-description {
  color: #ccc;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 1rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(0, 161, 156, 0.1);
  border: 1px solid rgba(0, 161, 156, 0.2);
  border-radius: 8px;
  font-size: 0.8rem;
  color: #e0e0e0;
}

.feature-item i {
  color: #00A19C;
  font-size: 0.9rem;
}

.purchase-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, #00A19C 0%, #008B8B 100%);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.purchase-btn:not(:disabled):hover {
  background: linear-gradient(135deg, #008B8B 0%, #006666 100%);
  transform: translateY(-2px);
}

.purchase-btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #333;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 4rem 0;
  color: #00A19C;
}

.loading-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Error State */
.error-state {
  text-align: center;
  padding: 4rem 0;
  color: #ef4444;
}

.error-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 0;
  color: #666;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: rgba(0, 161, 156, 0.3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 3rem;
  }
  
  .hero-subtitle {
    font-size: 1.25rem;
  }
  
  .tokens-display {
    font-size: 1rem;
    padding: 0.75rem 1.5rem;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .category-btn {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
}
</style> 