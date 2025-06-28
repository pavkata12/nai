<template>
  <div id="app" class="redzone-bg min-h-screen">
    <Navigation />
    <main role="main">
      <router-view v-slot="{ Component }">
        <Suspense>
          <template #default>
            <component :is="Component" />
          </template>
          <template #fallback>
            <div class="loading-spinner" role="status" aria-label="Зареждане на страницата">
              <div class="spinner"></div>
              <p>Зареждане...</p>
            </div>
          </template>
        </Suspense>
      </router-view>
    </main>
    <Footer />
  </div>
</template>

<script>
import Navigation from './components/Navigation.vue'
import Footer from './components/Footer.vue'
import { useAuthStore } from './stores/auth'
import { useLanguageStore } from './stores/language'
import { onMounted } from 'vue'

export default {
  name: 'App',
  components: {
    Navigation,
    Footer
  },
  setup() {
    const authStore = useAuthStore()
    const languageStore = useLanguageStore()
    
    onMounted(() => {
      // Проверка за съществуващ токен при зареждане
      authStore.checkAuth()
      // Инициализиране на запаметения език
      languageStore.initLanguage()
    })
    
    return {}
  }
}
</script>

<style>
#app {
  font-family: 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Основни стилове за RedZone дизайн */
.btn-primary {
  background: linear-gradient(45deg, #00A19C, #00C4B4);
  color: #000;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-primary:hover {
  background: linear-gradient(45deg, #00C4B4, #00A19C);
  box-shadow: 0 0 20px rgba(0, 161, 156, 0.5);
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  color: #00A19C;
  border: 2px solid #00A19C;
  padding: 10px 22px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-secondary:hover {
  background: #00A19C;
  color: #000;
  box-shadow: 0 0 20px rgba(0, 161, 156, 0.3);
}

.card {
  background: rgba(0, 161, 156, 0.1);
  border: 1px solid rgba(0, 161, 156, 0.3);
  border-radius: 12px;
  padding: 24px;
  backdrop-filter: blur(10px);
  transition: all 0.3s;
}

.card:hover {
  border-color: #00A19C;
  box-shadow: 0 8px 32px rgba(0, 161, 156, 0.2);
}

.text-green {
  color: #00A19C;
}

.text-green-light {
  color: #00C4B4;
}

.bg-black {
  background: #000;
}

.bg-dark {
  background: #111;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-padding {
  padding: 80px 0;
}

/* Анимации */
@keyframes pulse-green {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.pulse-green {
  animation: pulse-green 2s infinite;
}

@keyframes glow-pulse {
  0%, 100% { 
    box-shadow: 0 0 20px rgba(0, 161, 156, 0.3);
  }
  50% { 
    box-shadow: 0 0 40px rgba(0, 161, 156, 0.6);
  }
}

.glow-pulse {
  animation: glow-pulse 2s infinite;
}

/* Spacing for fixed navigation */
.page-with-nav {
  padding-top: 90px; /* 64px nav height + 26px buffer */
}

.page-header-with-nav {
  padding-top: 144px !important; /* 64px nav height + 80px section padding */
}
</style> 