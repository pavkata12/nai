import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Лазово зареждане на компонентите
const Home = () => import('../views/Home.vue')
const News = () => import('../views/News.vue')
const Tournaments = () => import('../views/Tournaments.vue')
const Leaderboard = () => import('../views/Leaderboard.vue')
const Academy = () => import('../views/Academy.vue')
const Shop = () => import('../views/Shop.vue')
const Profile = () => import('../views/Profile.vue')
const Login = () => import('../views/Login.vue')
const AdminPanel = () => import('../views/AdminPanel.vue')
const Booking = () => import('../views/Booking.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { 
      title: 'Academy Sim Racing - Професионални симулатори за автомобилни състезания',
      description: 'Най-добрата академия за симулатори на автомобилни състезания в България. Професионални симулатори, експертно обучение, турнири с награди.',
      keywords: 'sim racing, симулатор, автомобилни състезания, академия, обучение, турнири, България'
    }
  },
  {
    path: '/news',
    name: 'News',
    component: News,
    meta: { 
      title: 'Новини - Academy Sim Racing',
      description: 'Последни новини от света на симулаторите за автомобилни състезания. Актуални събития, обновления и анонси от Academy Sim Racing.',
      keywords: 'новини, sim racing новини, автомобилни състезания новини, академия новини'
    }
  },
  {
    path: '/tournaments',
    name: 'Tournaments',
    component: Tournaments,
    meta: { 
      title: 'Турнири - Academy Sim Racing',
      description: 'Участвайте в турнири по автомобилни състезания с атрактивни награди. Покажете своите умения и спечелете големи призове.',
      keywords: 'турнири, състезания, награди, sim racing турнири, автомобилни състезания турнири'
    }
  },
  {
    path: '/leaderboard',
    name: 'Leaderboard',
    component: Leaderboard,
    meta: { 
      title: 'Класиране - Academy Sim Racing',
      description: 'Вижте най-добрите играчи в Academy Sim Racing. Проследете своя прогрес и сравнете резултатите си с други състезатели.',
      keywords: 'класиране, топ играчи, резултати, статистики, sim racing класиране'
    }
  },
  {
    path: '/academy',
    name: 'Academy',
    component: Academy,
    meta: { 
      title: 'Академия - Academy Sim Racing',
      description: 'Научете да карате като професионалист с нашите експертни курсове. Подобрете техниката си и станете по-добър състезател.',
      keywords: 'академия, обучение, курсове, техника на каране, професионално обучение'
    }
  },
  {
    path: '/shop',
    name: 'Shop',
    component: Shop,
    meta: { 
      requiresAuth: true,
      title: 'Магазин - Academy Sim Racing',
      description: 'Закупете време за игра, специални предложения и ексклузивни пакети в Academy Sim Racing магазина.',
      keywords: 'магазин, закупуване, пакети, време за игра, специални предложения'
    }
  },
  {
    path: '/booking',
    name: 'Booking',
    component: Booking,
    meta: { 
      title: 'Резервация - Academy Sim Racing',
      description: 'Резервирайте своето време за игра в Academy Sim Racing. Лесно и бързо онлайн резервиране на симулатори.',
      keywords: 'резервация, записване, време за игра, онлайн резервация, симулатор резервация'
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { 
      requiresAuth: true,
      title: 'Профил - Academy Sim Racing',
      description: 'Управлявайте своя профил, проследете статистиките си и персонализирайте настройките в Academy Sim Racing.',
      keywords: 'профил, статистики, настройки, лична информация, прогрес'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { 
      title: 'Вход - Academy Sim Racing',
      description: 'Влезте в своя акаунт в Academy Sim Racing за достъп до всички функции и услуги.',
      keywords: 'вход, логин, акаунт, регистрация, профил'
    }
  },
  {
    path: '/admin',
    name: 'AdminPanel',
    component: AdminPanel,
    meta: { 
      requiresAuth: true, 
      requiresAdmin: true,
      title: 'Администрация - Academy Sim Racing',
      description: 'Административен панел за управление на Academy Sim Racing.',
      keywords: 'администрация, управление, админ панел'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Function to update meta tags
function updateMetaTags(to) {
  // Update title
  if (to.meta.title) {
    document.title = to.meta.title
    
    // Update og:title
    let ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) {
      ogTitle.setAttribute('content', to.meta.title)
    }
    
    // Update twitter:title
    let twitterTitle = document.querySelector('meta[property="twitter:title"]')
    if (twitterTitle) {
      twitterTitle.setAttribute('content', to.meta.title)
    }
  }
  
  // Update description
  if (to.meta.description) {
    let description = document.querySelector('meta[name="description"]')
    if (description) {
      description.setAttribute('content', to.meta.description)
    }
    
    // Update og:description
    let ogDescription = document.querySelector('meta[property="og:description"]')
    if (ogDescription) {
      ogDescription.setAttribute('content', to.meta.description)
    }
    
    // Update twitter:description
    let twitterDescription = document.querySelector('meta[property="twitter:description"]')
    if (twitterDescription) {
      twitterDescription.setAttribute('content', to.meta.description)
    }
  }
  
  // Update keywords
  if (to.meta.keywords) {
    let keywords = document.querySelector('meta[name="keywords"]')
    if (keywords) {
      keywords.setAttribute('content', to.meta.keywords)
    }
  }
  
  // Update canonical URL
  let canonical = document.querySelector('link[rel="canonical"]')
  if (canonical) {
    canonical.setAttribute('href', `https://academysimracing.bg${to.path}`)
  }
  
  // Update og:url
  let ogUrl = document.querySelector('meta[property="og:url"]')
  if (ogUrl) {
    ogUrl.setAttribute('content', `https://academysimracing.bg${to.path}`)
  }
  
  // Update twitter:url
  let twitterUrl = document.querySelector('meta[property="twitter:url"]')
  if (twitterUrl) {
    twitterUrl.setAttribute('content', `https://academysimracing.bg${to.path}`)
  }
}

// Navigation Guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Update meta tags
  updateMetaTags(to)
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresAdmin && (!authStore.user || !authStore.user.is_admin)) {
    next('/')
  } else {
    next()
  }
})

export default router 