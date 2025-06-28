<template>
  <!-- Login Modal Overlay -->
  <div class="login-modal-overlay" @click="closeModal">
    
    <!-- Animated Background -->
    <div class="modal-background">
      <div class="bg-animation"></div>
      <div class="bg-particles"></div>
    </div>
    
    <!-- Login Card -->
    <div class="login-card" @click.stop>
          
          <!-- Close Button -->
      <button @click="closeModal" class="close-button">
        <i class="fas fa-times"></i>
            </button>
      
      <!-- Header -->
      <div class="login-header">
        <div class="logo-section">
          <div class="logo-icon">
            <i class="fas fa-flag-checkered"></i>
          </div>
          <h2>{{ languageStore.t('welcomeBack') }}</h2>
          <p>{{ languageStore.t('viewStats') }}</p>
            </div>
          </div>

          <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="login-form">
        
            <!-- Username Field -->
        <div class="form-field">
          <label>{{ languageStore.t('username') }}</label>
              <div class="input-wrapper">
            <i class="fas fa-user input-icon"></i>
                <input
                  v-model="credentials.username"
                  type="text"
              :placeholder="languageStore.t('enterUsername')"
                  required
              class="form-input"
                />
              </div>
            </div>

            <!-- Password Field -->
        <div class="form-field">
          <label>{{ languageStore.t('password') }}</label>
              <div class="input-wrapper">
            <i class="fas fa-lock input-icon"></i>
                <input
                  v-model="credentials.password"
                  :type="showPassword ? 'text' : 'password'"
              :placeholder="languageStore.t('enterPassword')"
                  required
              class="form-input"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
              class="password-toggle"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
        </div>
        
        <!-- Info Message -->
        <div class="info-message">
          <i class="fas fa-info-circle"></i>
          <span>{{ languageStore.t('infoMessage') }}</span>
        </div>
        
        <!-- Connection Status -->
        <div v-if="connectionStatus" class="connection-status" :class="connectionStatus.type">
          <i :class="connectionStatus.icon"></i>
          <span>{{ connectionStatus.message }}</span>
        </div>
        
        <!-- Form Options -->
        <div class="form-options">
          <label class="checkbox-wrapper">
            <input v-model="rememberMe" type="checkbox" class="hidden-checkbox">
            <div class="custom-checkbox">
              <i v-if="rememberMe" class="fas fa-check"></i>
            </div>
            <span>{{ languageStore.t('rememberMe') }}</span>
          </label>
          
          <a href="#" class="forgot-link">{{ languageStore.t('forgotPassword') }}</a>
            </div>

            <!-- Error Message -->
        <div v-if="error" class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          <span>{{ error }}</span>
            </div>

            <!-- Login Button -->
            <button
              type="submit"
              :disabled="loading"
          class="login-button"
        >
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-sign-in-alt"></i>
          <span>{{ loading ? languageStore.t('signingIn') : languageStore.t('signIn') }}</span>
        </button>
        
          </form>

          <!-- Footer -->
      <div class="login-footer">
        <div class="divider">
          <span>{{ languageStore.t('orContinueWith') }}</span>
        </div>
        
        <!-- Social Login -->
        <div class="social-buttons">
          <button class="social-btn discord">
            <i class="fab fa-discord"></i>
            <span>{{ languageStore.t('discord') }}</span>
          </button>
          <button class="social-btn steam">
            <i class="fab fa-steam"></i>
            <span>{{ languageStore.t('steam') }}</span>
          </button>
          </div>

        <!-- Register Link -->
        <div class="register-section">
          <p>{{ languageStore.t('noAccount') }}</p>
          <router-link to="/register" class="register-link">
            {{ languageStore.t('createAccount') }}
          </router-link>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useLanguageStore } from '../stores/language'
import axios from 'axios'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const languageStore = useLanguageStore()
    
    const credentials = reactive({
      username: '',
      password: ''
    })
    
    const showPassword = ref(false)
    const rememberMe = ref(false)
    const loading = ref(false)
    const error = ref('')
    const connectionStatus = ref(null)

    const closeModal = () => {
      router.push('/')
    }

    const checkConnection = async () => {
      try {
        const response = await axios.get('/api/health', { timeout: 5000 })
        if (response.data.success) {
          if (response.data.netcafe_bridge === 'OK') {
            connectionStatus.value = {
              type: 'success',
              icon: 'fas fa-check-circle',
              message: 'Свързан с NetCafe системата'
            }
          } else if (response.data.netcafe_bridge === 'DISCONNECTED') {
            connectionStatus.value = {
              type: 'warning',
              icon: 'fas fa-exclamation-triangle',
              message: 'NetCafe системата не е достъпна - работи с кеширани данни'
            }
          }
        }
      } catch (error) {
        connectionStatus.value = {
          type: 'error',
          icon: 'fas fa-times-circle',
          message: 'Няма връзка със сървъра'
        }
      }
    }

    const handleLogin = async () => {
      if (!credentials.username || !credentials.password) {
        error.value = 'Моля въведете потребителско име и парола'
        return
      }

      loading.value = true
      error.value = ''
      
      try {
        await authStore.login(credentials)
          router.push('/')
      } catch (err) {
        // Show user-friendly error messages in Bulgarian
        if (err.message.includes('NetCafe connection failed')) {
          error.value = 'Няма връзка с NetCafe системата. Моля свържете се с администратора.'
        } else if (err.message.includes('Invalid username or password')) {
          error.value = 'Грешно потребителско име или парола'
        } else if (err.message.includes('Account is disabled')) {
          error.value = 'Акаунтът е деактивиран'
        } else if (err.message.includes('Network error')) {
          error.value = 'Мрежова грешка. Моля опитайте отново.'
        } else {
          error.value = err.message || 'Грешка при влизане. Моля опитайте отново.'
        }
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      checkConnection()
    })

    return {
      languageStore,
      credentials,
      showPassword,
      rememberMe,
      loading,
      error,
      connectionStatus,
      closeModal,
      handleLogin
    }
  }
}
</script>

<style scoped>
/* Modal Overlay */
.login-modal-overlay {
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
  backdrop-filter: blur(10px);
  animation: fadeIn 0.3s ease;
}

.modal-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.bg-animation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, 
    rgba(0, 161, 156, 0.1) 0%, 
    rgba(0, 161, 156, 0.1) 25%, 
    rgba(0, 161, 156, 0.1) 50%, 
    rgba(0, 161, 156, 0.1) 75%, 
    rgba(0, 161, 156, 0.1) 100%);
  background-size: 400% 400%;
  animation: gradientShift 8s ease infinite;
}

.bg-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(0, 161, 156, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(0, 161, 156, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(0, 161, 156, 0.06) 0%, transparent 50%);
  background-size: 300px 300px, 400px 400px, 200px 200px;
  animation: particleFloat 15s ease-in-out infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes particleFloat {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-20px) rotate(1deg); }
  66% { transform: translateY(10px) rotate(-1deg); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Login Card */
.login-card {
  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 161, 156, 0.2);
  border-radius: 24px;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.5),
    0 0 100px rgba(0, 161, 156, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  width: 100%;
  max-width: 420px;
  margin: 1rem;
  position: relative;
  animation: slideIn 0.4s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Close Button */
.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.close-button:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
  color: #ef4444;
  transform: scale(1.1);
}

/* Header */
.login-header {
  padding: 2rem 2rem 1rem;
  text-align: center;
}

.logo-section {
  margin-bottom: 1rem;
}

.logo-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #00A19C, #008F8A);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  box-shadow: 
    0 8px 25px rgba(0, 161, 156, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  animation: logoFloat 3s ease-in-out infinite;
}

@keyframes logoFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

.logo-icon i {
  color: white;
  font-size: 24px;
}

.login-header h2 {
  color: white;
  font-size: 1.875rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  letter-spacing: -0.025em;
}

.login-header p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  margin: 0;
}

/* Form */
.login-form {
  padding: 0 2rem;
}

.form-field {
  margin-bottom: 1.5rem;
}

.form-field label {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.4);
  font-size: 1rem;
  transition: color 0.3s ease;
}

.form-input {
  width: 100%;
  height: 52px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0 1rem 0 3rem;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  outline: none;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-input:focus {
  border-color: #00A19C;
  box-shadow: 0 0 0 3px rgba(0, 161, 156, 0.1);
}

.form-input:focus + .input-icon {
  color: #00A19C;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: rgba(255, 255, 255, 0.8);
}

/* Form Options */
.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

.hidden-checkbox {
  display: none;
}

.custom-checkbox {
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.checkbox-wrapper:hover .custom-checkbox {
  border-color: #00A19C;
}

.hidden-checkbox:checked + .custom-checkbox {
  background: #00A19C;
  border-color: #00A19C;
}

.custom-checkbox i {
  color: white;
  font-size: 12px;
}

.forgot-link {
  color: #00A19C;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.forgot-link:hover {
  color: #008F8A;
}

/* Info Message */
.info-message {
  background: rgba(0, 161, 156, 0.1);
  border: 1px solid rgba(0, 161, 156, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #80E5E0;
  font-size: 0.875rem;
}

.info-message i {
  color: #00A19C;
}

/* Connection Status */
.connection-status {
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  animation: slideIn 0.3s ease;
}

.connection-status.success {
  background: rgba(0, 161, 156, 0.1);
  border: 1px solid rgba(0, 161, 156, 0.3);
  color: #80E5E0;
}

.connection-status.success i {
  color: #00A19C;
}

.connection-status.warning {
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  color: #fde68a;
}

.connection-status.warning i {
  color: #fbbf24;
}

.connection-status.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.connection-status.error i {
  color: #ef4444;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Error Message */
.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #fca5a5;
  font-size: 0.875rem;
}

.error-message i {
  color: #ef4444;
}

/* Login Button */
.login-button {
  width: 100%;
  height: 52px;
  background: linear-gradient(135deg, #00A19C, #008F8A);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(0, 161, 156, 0.3);
}

.login-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.login-button:hover::before {
  left: 100%;
}

.login-button:hover {
  background: linear-gradient(135deg, #008F8A, #007D78);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 161, 156, 0.4);
}

.login-button:active {
  transform: translateY(0);
}

.login-button:disabled {
  background: rgba(75, 85, 99, 0.5);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Footer */
.login-footer {
  padding: 0 2rem 2rem;
}

.divider {
  display: flex;
  align-items: center;
  margin: 2rem 0 1.5rem;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.875rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.divider span {
  padding: 0 1rem;
  background: rgba(17, 24, 39, 0.95);
}

/* Social Buttons */
.social-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 44px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.social-btn:hover {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.05);
}

.social-btn.discord:hover {
  border-color: #5865f2;
  background: rgba(88, 101, 242, 0.1);
  color: #5865f2;
}

.social-btn.steam:hover {
  border-color: #1b2838;
  background: rgba(27, 40, 56, 0.3);
  color: #66c0f4;
}

/* Register Section */
.register-section {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.register-section p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  margin: 0 0 1rem;
}

.register-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
  color: #22c55e;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.register-link:hover {
  background: rgba(34, 197, 94, 0.1);
  border-color: #22c55e;
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 480px) {
  .login-card {
    margin: 0.5rem;
    border-radius: 16px;
  }
  
  .login-header {
    padding: 1.5rem 1.5rem 1rem;
  }
  
  .login-form {
    padding: 0 1.5rem;
  }
  
  .login-footer {
    padding: 0 1.5rem 1.5rem;
  }
  
  .social-buttons {
    grid-template-columns: 1fr;
  }
  
  .form-options {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style> 