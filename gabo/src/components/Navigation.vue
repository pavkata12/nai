<template>
  <!-- Clean Professional Navigation -->
  <nav class="nav-container">
    <div class="nav-inner">
      <div class="nav-content">
        
        <!-- Logo Section -->
        <div class="nav-logo">
          <router-link to="/" class="logo-link">
            <div class="logo-icon">
              <i class="fas fa-flag-checkered"></i>
          </div>
          <div class="logo-text">
              <div class="logo-main">Academy</div>
              <div class="logo-sub">SIM RACING</div>
            </div>
          </router-link>
            </div>

        <!-- Desktop Navigation Links -->
        <div class="nav-links">
          <router-link 
            to="/" 
            class="nav-link"
            :class="{ 'active': $route.path === '/' }"
          >
            {{ languageStore.t('home') }}
        </router-link>

          <router-link 
            to="/tournaments" 
            class="nav-link"
            :class="{ 'active': $route.path === '/tournaments' }"
          >
            {{ languageStore.t('tournaments') }}
          </router-link>
          
          <router-link 
            to="/academy" 
            class="nav-link"
            :class="{ 'active': $route.path === '/academy' }"
          >
            {{ languageStore.t('academy') }}
          </router-link>
          
          <router-link 
            to="/leaderboard" 
            class="nav-link"
            :class="{ 'active': $route.path === '/leaderboard' }"
          >
            {{ languageStore.t('leaderboard') }}
          </router-link>
          
          <router-link 
            to="/shop" 
            class="nav-link"
            :class="{ 'active': $route.path === '/shop' }"
          >
            {{ languageStore.t('shop') }}
          </router-link>
          
          <router-link 
            to="/booking" 
            class="nav-link"
            :class="{ 'active': $route.path === '/booking' }"
          >
            {{ languageStore.t('booking') }}
          </router-link>
          
            <router-link 
            to="/news" 
            class="nav-link"
            :class="{ 'active': $route.path === '/news' }"
            >
            {{ languageStore.t('news') }}
            </router-link>
          </div>

        <!-- User Actions -->
        <div class="nav-actions">
          <!-- Language Toggle Button -->
          <button 
            @click="languageStore.toggleLanguage()"
            class="language-toggle-btn"
            :title="languageStore.t('language')"
          >
            <i class="fas fa-globe"></i>
            <span class="language-text">{{ languageStore.currentLanguage.toUpperCase() }}</span>
          </button>
          
          <!-- User Menu (if logged in) -->
          <div v-if="authStore.user" class="user-menu-container">
            <button 
              @click="showUserMenu = !showUserMenu"
              class="user-menu-btn"
            >
              <div class="user-avatar">
                <i class="fas fa-user"></i>
              </div>
              <div class="user-info">
              <span class="user-name">{{ authStore.user.username }}</span>
                <span class="user-tokens">
                  <i class="fas fa-coins"></i>
                  {{ authStore.userTokens }} {{ languageStore.t('tokens') }}
                </span>
              </div>
              <i class="fas fa-chevron-down"></i>
            </button>

            <!-- User Dropdown -->
            <div v-if="showUserMenu" class="user-dropdown">
              <router-link 
                to="/profile" 
                class="dropdown-item"
                @click="showUserMenu = false"
              >
                <i class="fas fa-user-circle"></i>
                {{ languageStore.t('profile') }}
              </router-link>
              
                <router-link 
                to="/admin" 
                v-if="authStore.user.is_admin"
                class="dropdown-item"
                  @click="showUserMenu = false"
                >
                <i class="fas fa-cog"></i>
                {{ languageStore.t('adminPanel') }}
                </router-link>
                
                  <button 
                @click="logout"
                class="dropdown-item logout-btn"
                  >
                    <i class="fas fa-sign-out-alt"></i>
                {{ languageStore.t('logout') }}
                  </button>
                </div>
          </div>
          
          <!-- Login Button (if not logged in) -->
          <router-link 
            v-else
            to="/login" 
            class="login-btn"
          >
            {{ languageStore.t('login') }}
          </router-link>

          <!-- Mobile Menu Button -->
          <button 
            @click="showMobileMenu = !showMobileMenu"
            class="mobile-menu-btn"
          >
            <i class="fas fa-bars"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation Menu -->
    <div v-if="showMobileMenu" class="mobile-menu">
      <div class="mobile-menu-content">
        <router-link 
          to="/" 
          class="mobile-link"
          :class="{ 'active': $route.path === '/' }"
          @click="showMobileMenu = false"
        >
          {{ languageStore.t('home') }}
        </router-link>
        
        <router-link 
          to="/tournaments" 
          class="mobile-link"
          :class="{ 'active': $route.path === '/tournaments' }"
          @click="showMobileMenu = false"
        >
          {{ languageStore.t('tournaments') }}
        </router-link>
        
        <router-link 
          to="/academy" 
          class="mobile-link"
          :class="{ 'active': $route.path === '/academy' }"
          @click="showMobileMenu = false"
        >
          {{ languageStore.t('academy') }}
        </router-link>
        
        <router-link 
          to="/leaderboard" 
          class="mobile-link"
          :class="{ 'active': $route.path === '/leaderboard' }"
          @click="showMobileMenu = false"
        >
          {{ languageStore.t('leaderboard') }}
        </router-link>
        
        <router-link 
          to="/shop" 
          class="mobile-link"
          :class="{ 'active': $route.path === '/shop' }"
          @click="showMobileMenu = false"
        >
          {{ languageStore.t('shop') }}
        </router-link>
        
        <router-link 
          to="/booking" 
          class="mobile-link"
          :class="{ 'active': $route.path === '/booking' }"
          @click="showMobileMenu = false"
        >
          {{ languageStore.t('booking') }}
        </router-link>
        
            <router-link 
          to="/news" 
          class="mobile-link"
          :class="{ 'active': $route.path === '/news' }"
              @click="showMobileMenu = false"
            >
          {{ languageStore.t('news') }}
            </router-link>
          </div>
    </div>
  </nav>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useLanguageStore } from '../stores/language'
import { useRouter } from 'vue-router'

export default {
  name: 'Navigation',
  setup() {
    const authStore = useAuthStore()
    const languageStore = useLanguageStore()
    const router = useRouter()
    const showUserMenu = ref(false)
    const showMobileMenu = ref(false)
    
    const logout = () => {
      authStore.logout()
      showUserMenu.value = false
      router.push('/')
    }
    
    // Close menus when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu-btn') && !event.target.closest('.user-dropdown')) {
        showUserMenu.value = false
      }
      if (!event.target.closest('.mobile-menu-btn') && !event.target.closest('.mobile-menu')) {
        showMobileMenu.value = false
      }
    }
    
    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })
    
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })
    
    return {
      authStore,
      languageStore,
      showUserMenu,
      showMobileMenu,
      logout
    }
  }
}
</script>

<style scoped>
/* Navigation Container */
.nav-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

/* Logo Section */
.nav-logo {
  flex-shrink: 0;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(to bottom right, #22c55e, #16a34a);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
}

.logo-icon i {
  color: white;
  font-size: 14px;
}

.logo-main {
  color: white;
  font-weight: bold;
  font-size: 18px;
  letter-spacing: -0.025em;
}

.logo-sub {
  color: #00A19C;
  font-size: 12px;
  font-weight: 500;
  margin-top: -2px;
}

/* Navigation Links */
.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  position: relative;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  padding: 0.5rem 0;
  transition: color 0.2s ease;
}

.nav-link:hover,
.nav-link.active {
  color: #00A19C;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -20px;
  left: 0;
  width: 0;
  height: 2px;
  background: #00A19C;
  transition: width 0.3s ease;
}

.nav-link:hover::after,
.nav-link.active::after {
  width: 100%;
}

/* User Actions */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Language Toggle Button */
.language-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 161, 156, 0.1);
  border: 1px solid rgba(0, 161, 156, 0.3);
  color: #00A19C;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  font-weight: 500;
}

.language-toggle-btn:hover {
  background: rgba(0, 161, 156, 0.2);
  border-color: #00A19C;
  transform: translateY(-1px);
}

.language-text {
  font-weight: 600;
  letter-spacing: 0.5px;
}

.user-menu-container {
  position: relative;
}

.user-menu-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: color 0.2s ease;
}

.user-menu-btn:hover {
  color: white;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: #00A19C;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 161, 156, 0.3);
}

.user-avatar i {
  color: white;
  font-size: 14px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
}

.user-tokens {
  font-size: 12px;
  color: #00A19C;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 192px;
  background: #1f2937;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  animation: fadeInDown 0.2s ease;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.2s ease;
  border: none;
  background: none;
  width: 100%;
  cursor: pointer;
}

.dropdown-item:hover {
  color: white;
  background: rgba(255, 255, 255, 0.05);
}

.dropdown-item i {
  margin-right: 0.75rem;
}

.logout-btn {
  font-size: 14px;
}

.login-btn {
  background: #00A19C;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 161, 156, 0.3);
}

.login-btn:hover {
  background: #008F8A;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 161, 156, 0.4);
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: 18px;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s ease;
}

.mobile-menu-btn:hover {
  color: white;
}

/* Mobile Menu */
.mobile-menu {
  background: #1f2937;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideDown 0.2s ease;
}

.mobile-menu-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mobile-link {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 0;
  padding-left: 1rem;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
}

.mobile-link:hover,
.mobile-link.active {
  color: #00A19C;
  border-left-color: #00A19C;
  background: rgba(0, 161, 156, 0.1);
}

/* Animations */
@keyframes fadeInDown {
  from {
  opacity: 0;
    transform: translateY(-10px);
}
  to {
  opacity: 1;
  transform: translateY(0);
}
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
}
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .user-name {
    display: none;
  }
  
  .logo-text {
    font-size: 0.9rem;
  }
  
  .language-toggle-btn {
    padding: 0.375rem 0.5rem;
    font-size: 11px;
  }
  
  .language-text {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .nav-inner {
    padding: 0 0.5rem;
}

  .nav-content {
    height: 56px;
  }
  
  .logo-icon {
    width: 28px;
    height: 28px;
}

  .logo-main {
    font-size: 16px;
  }
}
</style> 