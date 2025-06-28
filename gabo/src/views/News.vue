<template>
  <div class="news-page">
    <div class="news-header section-padding">
      <div class="header-bg-pattern"></div>
      <div class="header-particles"></div>
      <div class="container">
        <div class="header-content animate__animated animate__fadeInDown">
          <div class="header-icon-wrapper">
            <div class="icon-glow"></div>
            <i class="fas fa-newspaper header-main-icon"></i>
          </div>
          <h1 class="page-title">
            {{ languageStore.t('newsTitle') }}
          </h1>
          <p class="page-subtitle">
            {{ languageStore.t('latestNews') }}
          </p>
          <div class="header-decorative-line">
            <span class="line-segment"></span>
            <span class="line-diamond">◆</span>
            <span class="line-segment"></span>
          </div>
        </div>
      </div>
    </div>

    <div class="news-content section-padding">
      <div class="container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Зареждане на новини...</span>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <span>{{ error }}</span>
          <button @click="loadPosts" class="btn-secondary">Опитай отново</button>
        </div>

        <!-- News Grid -->
        <div v-else class="news-grid">
          <div v-if="posts.length === 0" class="no-posts">
            <i class="fas fa-newspaper"></i>
            <h3>Няма налични новини</h3>
            <p>Моментално няма публикувани новини.</p>
          </div>
          
          <article 
            v-for="post in posts" 
            :key="post.id"
            class="news-card animate__animated animate__fadeInUp"
            :class="{ 'featured': post.featured }"
          >
            <div class="card-header">
              <div class="category-tag" :class="'category-' + post.category">
                {{ getCategoryName(post.category) }}
              </div>
              <div class="post-date">
                <i class="fas fa-calendar-alt"></i>
                {{ formatDate(post.created_at) }}
              </div>
            </div>
            
            <div class="card-content">
              <h2 class="post-title">{{ post.title }}</h2>
              <p class="post-excerpt">{{ getExcerpt(post.content) }}</p>
              
              <div class="post-meta">
                <div class="author">
                  <i class="fas fa-user"></i>
                  {{ post.author || 'Academy Team' }}
                </div>
                <button @click="togglePost(post)" class="read-more-btn">
                  <span v-if="!expandedPosts.includes(post.id)">
                    Прочети повече
                    <i class="fas fa-chevron-down"></i>
                  </span>
                  <span v-else>
                    Скрий
                    <i class="fas fa-chevron-up"></i>
                  </span>
                </button>
              </div>
            </div>
            
            <!-- Expanded Content -->
            <div v-if="expandedPosts.includes(post.id)" class="expanded-content">
              <div class="full-content" v-html="formatContent(post.content)"></div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useLanguageStore } from '../stores/language'
import { netcafeAPI } from '../api/netcafe-api'

export default {
  name: 'News',
  setup() {
    const languageStore = useLanguageStore()
    const posts = ref([])
    const loading = ref(false)
    const error = ref(null)
    const expandedPosts = ref([])
    
    const loadPosts = async () => {
      loading.value = true
      error.value = null
      
      try {
        const response = await netcafeAPI.getPosts()
        if (response.success) {
          posts.value = response.posts || []
        } else {
          error.value = response.error || 'Грешка при зареждане на новините'
        }
      } catch (err) {
        console.error('Error loading posts:', err)
        error.value = 'Грешка при свързване със сървъра'
      } finally {
        loading.value = false
      }
    }
    
    const togglePost = (post) => {
      const index = expandedPosts.value.indexOf(post.id)
      if (index > -1) {
        expandedPosts.value.splice(index, 1)
      } else {
        expandedPosts.value.push(post.id)
      }
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('bg-BG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    
    const getCategoryName = (category) => {
      const categories = {
        'news': 'Новини',
        'tournaments': 'Турнири',
        'updates': 'Обновления',
        'general': 'Общи'
      }
      return categories[category] || 'Новини'
    }
    
    const getExcerpt = (content, length = 200) => {
      if (!content) return ''
      const text = content.replace(/<[^>]*>/g, '') // Remove HTML tags
      return text.length > length ? text.substring(0, length) + '...' : text
    }
    
    const formatContent = (content) => {
      if (!content) return ''
      // Basic HTML formatting - replace newlines with <br>
      return content.replace(/\n/g, '<br>')
    }
    
    onMounted(() => {
      loadPosts()
    })
    
    return {
      languageStore,
      posts,
      loading,
      error,
      expandedPosts,
      loadPosts,
      togglePost,
      formatDate,
      getCategoryName,
      getExcerpt,
      formatContent
    }
  }
}
</script>

<style scoped>
.news-page {
  padding-top: 80px;
}

.news-header {
  position: relative;
  min-height: 400px;
  background: linear-gradient(135deg, #000000 0%, #001a1a 25%, #000d0d 50%, #002222 75%, #000000 100%);
  border-bottom: 2px solid rgba(0, 161, 156, 0.5);
  overflow: hidden;
  display: flex;
  align-items: center;
}

.header-bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(0, 161, 156, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(0, 196, 180, 0.08) 0%, transparent 50%),
    linear-gradient(45deg, transparent 40%, rgba(0, 161, 156, 0.03) 50%, transparent 60%);
  background-size: 600px 600px, 800px 800px, 200px 200px;
  animation: patternFloat 20s ease-in-out infinite;
}

.header-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(2px 2px at 20% 30%, rgba(0, 161, 156, 0.8), transparent),
    radial-gradient(2px 2px at 40% 70%, rgba(0, 196, 180, 0.6), transparent),
    radial-gradient(1px 1px at 90% 40%, rgba(0, 161, 156, 0.5), transparent),
    radial-gradient(1px 1px at 60% 90%, rgba(0, 196, 180, 0.4), transparent);
  background-size: 550px 550px, 350px 350px, 250px 250px, 150px 150px;
  animation: particleFloat 30s linear infinite;
}

@keyframes patternFloat {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(2deg); }
}

@keyframes particleFloat {
  0% { transform: translateX(0px) translateY(0px); }
  33% { transform: translateX(-30px) translateY(-30px); }
  66% { transform: translateX(30px) translateY(-60px); }
  100% { transform: translateX(0px) translateY(0px); }
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
  background: radial-gradient(circle, rgba(0, 161, 156, 0.3) 0%, rgba(0, 161, 156, 0.1) 40%, transparent 70%);
  border-radius: 50%;
  animation: iconGlow 3s ease-in-out infinite;
}

.header-main-icon {
  position: relative;
  font-size: 4rem;
  color: #00A19C;
  text-shadow: 
    0 0 10px rgba(0, 161, 156, 0.8),
    0 0 20px rgba(0, 161, 156, 0.6),
    0 0 30px rgba(0, 161, 156, 0.4);
  z-index: 1;
}

@keyframes iconGlow {
  0%, 100% { 
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
  50% { 
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 1;
  }
}

.page-title {
  font-family: 'Orbitron', monospace;
  font-size: 4rem;
  font-weight: 900;
  color: #00A19C;
  text-shadow: 
    0 0 10px rgba(0, 161, 156, 0.8),
    0 0 20px rgba(0, 161, 156, 0.6),
    0 0 40px rgba(0, 161, 156, 0.4),
    2px 2px 4px rgba(0, 0, 0, 0.8);
  margin: 0 0 1rem;
  letter-spacing: 3px;
  text-transform: uppercase;
  position: relative;
}

.page-title::before {
  content: '';
  position: absolute;
  top: 50%;
  left: -80px;
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00A19C);
  transform: translateY(-50%);
}

.page-title::after {
  content: '';
  position: absolute;
  top: 50%;
  right: -80px;
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, #00A19C, transparent);
  transform: translateY(-50%);
}

.page-subtitle {
  font-size: 1.4rem;
  color: #00A19C;
  margin: 0 0 2rem;
  font-weight: 300;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(0, 161, 156, 0.5);
}

.header-decorative-line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.line-segment {
  width: 80px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #00A19C, transparent);
  animation: lineGlow 2s ease-in-out infinite alternate;
}

.line-diamond {
  color: #00A19C;
  font-size: 1.2rem;
  text-shadow: 0 0 10px rgba(0, 161, 156, 0.8);
  animation: diamondPulse 2s ease-in-out infinite;
}

@keyframes lineGlow {
  0% { opacity: 0.5; }
  100% { opacity: 1; }
}

@keyframes diamondPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

/* News Content */
.news-content {
  background: linear-gradient(135deg, #000000 0%, #001a1a 50%, #000000 100%);
  min-height: 60vh;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem 2rem;
  color: #ccc;
  font-size: 1.1rem;
  text-align: center;
}

.loading-state i {
  font-size: 2rem;
  color: #00A19C;
}

.error-state i {
  font-size: 2rem;
  color: #ff4444;
}

.error-state button {
  margin-top: 1rem;
}

.no-posts {
  text-align: center;
  padding: 4rem 2rem;
  color: #ccc;
}

.no-posts i {
  font-size: 4rem;
  color: #00A19C;
  margin-bottom: 1rem;
}

.no-posts h3 {
  color: #00A19C;
  font-family: 'Orbitron', monospace;
  margin-bottom: 1rem;
}

/* News Grid */
.news-grid {
  display: grid;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.news-card {
  background: rgba(0, 20, 0, 0.3);
  border: 1px solid rgba(0, 161, 156, 0.2);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.news-card:hover {
  border-color: rgba(0, 161, 156, 0.5);
  box-shadow: 0 10px 30px rgba(0, 161, 156, 0.1);
  transform: translateY(-5px);
}

.news-card.featured {
  border-color: rgba(0, 196, 180, 0.5);
  background: rgba(40, 20, 0, 0.3);
}

.news-card.featured::before {
  content: 'ПРЕПОРЪЧАНО';
  position: absolute;
  top: 1rem;
  right: -2rem;
  background: #00A19C;
  color: #000;
  padding: 0.25rem 3rem;
  font-size: 0.7rem;
  font-weight: bold;
  transform: rotate(45deg);
  z-index: 2;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0;
  margin-bottom: 1rem;
}

.category-tag {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.category-news {
  background: rgba(0, 161, 156, 0.1);
  color: #00A19C;
  border: 1px solid rgba(0, 161, 156, 0.3);
}

.category-tournaments {
  background: rgba(0, 196, 180, 0.1);
  color: #00A19C;
  border: 1px solid rgba(0, 196, 180, 0.3);
}

.category-updates {
  background: rgba(0, 150, 255, 0.1);
  color: #0096ff;
  border: 1px solid rgba(0, 150, 255, 0.3);
}

.category-general {
  background: rgba(150, 150, 150, 0.1);
  color: #999;
  border: 1px solid rgba(150, 150, 150, 0.3);
}

.post-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #999;
  font-size: 0.9rem;
}

.card-content {
  padding: 0 1.5rem 1.5rem;
}

.post-title {
  color: #fff;
  font-family: 'Orbitron', monospace;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.3;
}

.post-excerpt {
  color: #ccc;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #00A19C;
  font-size: 0.9rem;
}

.read-more-btn {
  background: transparent;
  border: 1px solid rgba(0, 161, 156, 0.3);
  color: #00A19C;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.read-more-btn:hover {
  background: rgba(0, 161, 156, 0.1);
  border-color: #00A19C;
}

.expanded-content {
  border-top: 1px solid rgba(0, 161, 156, 0.2);
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
}

.full-content {
  color: #ccc;
  line-height: 1.7;
}

/* Responsive */
@media (max-width: 768px) {
  .news-header {
    min-height: 300px;
  }
  
  .page-title {
    font-size: 2.5rem;
    letter-spacing: 2px;
  }
  
  .page-title::before,
  .page-title::after {
    width: 40px;
    left: -50px;
    right: -50px;
  }
  
  .page-subtitle {
    font-size: 1.1rem;
  }
  
  .header-main-icon {
    font-size: 3rem;
  }
  
  .icon-glow {
    width: 100px;
    height: 100px;
  }
  
  .line-segment {
    width: 60px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .post-meta {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .news-header {
    min-height: 250px;
  }
  
  .page-title {
    font-size: 2rem;
    letter-spacing: 1px;
  }
  
  .page-title::before,
  .page-title::after {
    display: none;
  }
  
  .page-subtitle {
    font-size: 1rem;
  }
  
  .header-main-icon {
    font-size: 2.5rem;
  }
  
  .header-decorative-line {
    margin-top: 1rem;
  }
  
  .news-grid {
    gap: 1rem;
  }
  
  .card-content {
    padding: 0 1rem 1rem;
  }
  
  .card-header {
    padding: 1rem 1rem 0;
  }
}
</style>