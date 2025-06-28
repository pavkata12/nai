import { defineStore } from 'pinia'

export const useLanguageStore = defineStore('language', {
  state: () => ({
    currentLanguage: 'bg', // Default to Bulgarian
    translations: {
      bg: {
        // Navigation
        home: 'Начало',
        tournaments: 'Турнири', 
        academy: 'Академия',
        leaderboard: 'Класиране',
        shop: 'Магазин',
        booking: 'Резервация',
        news: 'Новини',
        profile: 'Профил',
        adminPanel: 'Админ панел',
        login: 'Вход',
        logout: 'Изход',
        
        // Hero Section
        heroTitle: 'ACADEMY',
        heroSubtitle: 'Професионална академия за симулационни състезания в Плевен',
        heroDescription: 'Научете се да карате като професионалист с най-добрите симулатори и инструктори',
        startNow: 'Започни сега',
        ranking: 'Класация',
        
        // Stats
        registered: 'Регистрирани',
        hoursPlayed: 'Общо часове',
        activeTournaments: 'Активни турнири',
        
        // Features Section
        whyAcademy: 'Защо Academy Sim Racing?',
        bestConditions: 'Най-добрите условия за симулационни състезания',
        professionalSimulators: 'Професионални симулатори',
        profSimDescription: 'Най-модерни симулатори с реалистична физика и професионални рулета',
        expertTraining: 'Експертно обучение',
        expertTrainingDescription: 'Курсове с професионални инструктори за всички нива',
        tournamentsAndPrizes: 'Турнири и награди',
        tournamentsDescription: 'Редовни турнири с атрактивни награди и признание',
        progressTracking: 'Проследяване на прогреса',
        progressDescription: 'Детайлна статистика и анализ на вашето представяне',
        
        // Pricing Section
        pricingPlans: 'Ценови планове',
        choosePlan: 'Изберете плана, който отговаря на вашите нужди',
        minutes: 'минути',
        selectPlan: 'Изберете',
        popular: 'Популярен',
        basicIntro: 'Базово въведение',
        oneTrack: 'Една писта',
        basicSetup: 'Основна настройка',
        allTracks: 'Всички писти',
        basicInstruction: 'Базов инструктаж',
        statistics: 'Статистики',
        allFeatures: 'Всички функции',
        personalTraining: 'Персонален тренинг',
        sessionRecording: 'Запис на сесията',
        dataAnalysis: 'Анализ на данни',
        
        // User Menu
        tokens: 'токена',
        
        // Recent Activity
        recentActivity: 'Последна активност',
        academyActivity: 'Вижте какво се случва в академията',
        completedSession: 'завърши сесия от',
        minutesSession: 'минути',
        justNow: 'Преди момент',
        minutesAgo: 'мин',
        hoursAgo: 'часа',
        daysAgo: 'дни',
        ago: 'Преди',
        
        // Login Page
        welcomeBack: 'Добре дошли отново',
        viewStats: 'Вижте вашите статистики в Академията',
        username: 'Потребителско име',
        enterUsername: 'Въведете потребителското си име',
        password: 'Парола',
        enterPassword: 'Въведете паролата си',
        infoMessage: 'Само за преглед на статистики - не стартира сесия в NetCafe',
        rememberMe: 'Запомни ме',
        forgotPassword: 'Забравена парола?',
        signingIn: 'Влизане...',
        signIn: 'Вход',
        orContinueWith: 'или продължи с',
        discord: 'Discord',
        steam: 'Steam',
        noAccount: 'Нямате акаунт?',
        createAccount: 'Създайте акаунт',
        connectedToNetcafe: 'Свързан с NetCafe системата',
        netcafeDisconnected: 'NetCafe системата не е достъпна - работи с кеширани данни',
        noServerConnection: 'Няма връзка със сървъра',
        
        // Academy Page
        racingAcademy: 'RACING ACADEMY',
        learnToDrive: 'Научете се да карате като професионалист',
        academyCourses: 'Курсове в Академията',
        chooseCourse: 'Изберете курса, който отговаря на вашето ниво',
        allCourses: 'Всички',
        loadingCourses: 'Зареждане на курсове...',
        tryAgain: 'Опитай отново',
        purchased: 'Закупен',
        watchCourse: 'Гледай курса',
        buyFor: 'Купи за',
        notEnoughTokens: 'Недостатъчно токени',
        noCoursesAvailable: 'Няма налични курсове',
        addCoursesSoon: 'Скоро ще добавим нови курсове в академията',
        confirmPurchase: 'Потвърдете покупката',
        price: 'Цена',
        yourTokens: 'Вашите токени',
        remaining: 'Остават',
        confirm: 'Потвърди',
        cancel: 'Отказ',
        
        // Tournaments Page
        tournamentsTitle: 'Турнири',
        competeWithBest: 'Състезавайте се с най-добрите пилоти',
        loadingTournaments: 'Зареждане на турнири...',
        activeTournaments: 'Активни Турнири',
        live: 'LIVE',
        active: 'АКТИВЕН',
        participants: 'Участници',
        entryFee: 'Цена за записване',
        date: 'Дата',
        filled: 'запълнен',
        joining: 'Записване...',
        registered: 'Записани сте',
        full: 'Пълен',
        joinTournament: 'Запиши се',
        upcomingTournaments: 'Предстоящи Турнири',
        remindMe: 'Напомни ми',
        completedTournaments: 'Завършени Турнири',
        
        // Shop Page
        shopTitle: 'Магазин',
        shopSubtitle: 'Купете предмети с вашите токени',
        categories: 'Категории',
        addToCart: 'Добави в количката',
        outOfStock: 'Няма в наличност',
        cart: 'Количка',
        total: 'Общо',
        checkout: 'Плати',
        
        // Profile Page
        profileTitle: 'Профил',
        myProfile: 'Моят профил',
        profileSubtitle: 'Преглед на статистики и постижения',
        personalInfo: 'Лична информация',
        editProfile: 'Редактирай профил',
        statistics: 'Статистики',
        achievements: 'Постижения',
        sessionHistory: 'История на сесиите',
        quickStats: 'Бърза статистика',
        hours: 'Часове',
        multiplier: 'Множител',
        progressToNext: 'Прогрес до следващо ниво',
        recentSessions: 'Последни сесии',
        refresh: 'Обнови',
        minutes: 'мин',
        noSessions: 'Няма записани сесии',
        achievementsUnlocked: 'отключени',
        xpToNext: 'XP до',
        
        // Leaderboard Page
        leaderboardTitle: 'Класиране',
        topDrivers: 'Най-добрите пилоти',
        rank: 'Позиция',
        driver: 'Пилот',
        points: 'Точки',
        races: 'Състезания',
        
        // Booking Page
        bookingTitle: 'Резервация',
        bookingSubtitle: 'Резервирай своето време за незабравимо racing преживяване',
        bookSession: 'Резервирай сесия',
        selectTime: 'Изберете време',
        selectDuration: 'Изберете продължителност',
        fullName: 'Име и фамилия',
        enterName: 'Въведете вашето име',
        phone: 'Телефон',
        email: 'Email',
        dateAndTime: 'Дата и час',
        date: 'Дата',
        startTime: 'Начален час',
        selectHour: 'Избери час',
        duration: 'Продължителност',
        selectHours: 'Избери часове',
        hour: 'час',
        hours2: 'часа',
        bookingType: 'Тип резервация',
        selectSimulator: 'Избери симулатор',
        available: 'Наличен',
        unavailable: 'Недостъпен',
        motion: 'Motion',
        vr: 'VR',
        premium: 'Premium',
        submitBooking: 'Потвърди резервация',
        totalPrice: 'Обща цена',
        selectedPlan: 'Избран план',
        
        // News Page
        newsTitle: 'Новини',
        latestNews: 'Последни новини',
        readMore: 'Прочети повече',
        
        // Common
        language: 'Език',
        tokens: 'токена'
      },
      en: {
        // Navigation
        home: 'Home',
        tournaments: 'Tournaments',
        academy: 'Academy', 
        leaderboard: 'Leaderboard',
        shop: 'Shop',
        booking: 'Booking',
        news: 'News',
        profile: 'Profile',
        adminPanel: 'Admin Panel',
        login: 'Login',
        logout: 'Logout',
        
        // Hero Section
        heroTitle: 'ACADEMY',
        heroSubtitle: 'Professional sim racing academy in Pleven',
        heroDescription: 'Learn to drive like a professional with the best simulators and instructors',
        startNow: 'Start Now',
        ranking: 'Ranking',
        
        // Stats
        registered: 'Registered',
        hoursPlayed: 'Total Hours',
        activeTournaments: 'Active Tournaments',
        
        // Features Section
        whyAcademy: 'Why Academy Sim Racing?',
        bestConditions: 'The best conditions for sim racing',
        professionalSimulators: 'Professional Simulators',
        profSimDescription: 'State-of-the-art simulators with realistic physics and professional wheels',
        expertTraining: 'Expert Training',
        expertTrainingDescription: 'Courses with professional instructors for all levels',
        tournamentsAndPrizes: 'Tournaments & Prizes',
        tournamentsDescription: 'Regular tournaments with attractive prizes and recognition',
        progressTracking: 'Progress Tracking',
        progressDescription: 'Detailed statistics and analysis of your performance',
        
        // Pricing Section
        pricingPlans: 'Pricing Plans',
        choosePlan: 'Choose the plan that suits your needs',
        minutes: 'minutes',
        selectPlan: 'Select',
        popular: 'Popular',
        basicIntro: 'Basic introduction',
        oneTrack: 'One track',
        basicSetup: 'Basic setup',
        allTracks: 'All tracks',
        basicInstruction: 'Basic instruction',
        statistics: 'Statistics',
        allFeatures: 'All features',
        personalTraining: 'Personal training',
        sessionRecording: 'Session recording',
        dataAnalysis: 'Data analysis',
        
        // User Menu
        tokens: 'tokens',
        
        // Recent Activity
        recentActivity: 'Recent Activity',
        academyActivity: 'See what\'s happening at the academy',
        completedSession: 'completed a session of',
        minutesSession: 'minutes',
        justNow: 'Just now',
        minutesAgo: 'min',
        hoursAgo: 'hours',
        daysAgo: 'days',
        ago: 'ago',
        
        // Login Page
        welcomeBack: 'Welcome Back',
        viewStats: 'View your Academy statistics',
        username: 'Username',
        enterUsername: 'Enter your username',
        password: 'Password',
        enterPassword: 'Enter your password',
        infoMessage: 'Statistics view only - does not start NetCafe session',
        rememberMe: 'Remember me',
        forgotPassword: 'Forgot password?',
        signingIn: 'Signing in...',
        signIn: 'Sign In',
        orContinueWith: 'or continue with',
        discord: 'Discord',
        steam: 'Steam',
        noAccount: 'Don\'t have an account?',
        createAccount: 'Create Account',
        connectedToNetcafe: 'Connected to NetCafe system',
        netcafeDisconnected: 'NetCafe system unavailable - using cached data',
        noServerConnection: 'No server connection',
        
        // Academy Page
        racingAcademy: 'RACING ACADEMY',
        learnToDrive: 'Learn to drive like a professional',
        academyCourses: 'Academy Courses',
        chooseCourse: 'Choose the course that suits your level',
        allCourses: 'All',
        loadingCourses: 'Loading courses...',
        tryAgain: 'Try again',
        purchased: 'Purchased',
        watchCourse: 'Watch Course',
        buyFor: 'Buy for',
        notEnoughTokens: 'Not enough tokens',
        noCoursesAvailable: 'No courses available',
        addCoursesSoon: 'We will add new courses to the academy soon',
        confirmPurchase: 'Confirm Purchase',
        price: 'Price',
        yourTokens: 'Your tokens',
        remaining: 'Remaining',
        confirm: 'Confirm',
        cancel: 'Cancel',
        
        // Tournaments Page
        tournamentsTitle: 'Tournaments',
        competeWithBest: 'Compete with the best drivers',
        loadingTournaments: 'Loading tournaments...',
        activeTournaments: 'Active Tournaments',
        live: 'LIVE',
        active: 'ACTIVE',
        participants: 'Participants',
        entryFee: 'Entry fee',
        date: 'Date',
        filled: 'filled',
        joining: 'Joining...',
        registered: 'Registered',
        full: 'Full',
        joinTournament: 'Join',
        upcomingTournaments: 'Upcoming Tournaments',
        remindMe: 'Remind me',
        completedTournaments: 'Completed Tournaments',
        
        // Shop Page
        shopTitle: 'Shop',
        shopSubtitle: 'Buy items with your tokens',
        categories: 'Categories',
        addToCart: 'Add to cart',
        outOfStock: 'Out of stock',
        cart: 'Cart',
        total: 'Total',
        checkout: 'Checkout',
        
        // Profile Page
        profileTitle: 'Profile',
        myProfile: 'My Profile',
        profileSubtitle: 'View your statistics and achievements',
        personalInfo: 'Personal Information',
        editProfile: 'Edit Profile',
        statistics: 'Statistics',
        achievements: 'Achievements',
        sessionHistory: 'Session History',
        quickStats: 'Quick Stats',
        hours: 'Hours',
        multiplier: 'Multiplier',
        progressToNext: 'Progress to next level',
        recentSessions: 'Recent Sessions',
        refresh: 'Refresh',
        minutes: 'min',
        noSessions: 'No recorded sessions',
        achievementsUnlocked: 'unlocked',
        xpToNext: 'XP to',
        
        // Leaderboard Page
        leaderboardTitle: 'Leaderboard',
        topDrivers: 'Top Drivers',
        rank: 'Rank',
        driver: 'Driver',
        points: 'Points',
        races: 'Races',
        
        // Booking Page
        bookingTitle: 'Booking',
        bookingSubtitle: 'Reserve your time for an unforgettable racing experience',
        bookSession: 'Book Session',
        selectTime: 'Select time',
        selectDuration: 'Select duration',
        fullName: 'Full Name',
        enterName: 'Enter your name',
        phone: 'Phone',
        email: 'Email',
        dateAndTime: 'Date and Time',
        date: 'Date',
        startTime: 'Start Time',
        selectHour: 'Select hour',
        duration: 'Duration',
        selectHours: 'Select hours',
        hour: 'hour',
        hours2: 'hours',
        bookingType: 'Booking Type',
        selectSimulator: 'Select Simulator',
        available: 'Available',
        unavailable: 'Unavailable',
        motion: 'Motion',
        vr: 'VR',
        premium: 'Premium',
        submitBooking: 'Confirm Booking',
        totalPrice: 'Total Price',
        selectedPlan: 'Selected Plan',
        
        // News Page
        newsTitle: 'News',
        latestNews: 'Latest News',
        readMore: 'Read more',
        
        // Common
        language: 'Language',
        tokens: 'tokens'
      }
    }
  }),

  getters: {
    currentTranslations: (state) => state.translations[state.currentLanguage],
    isEnglish: (state) => state.currentLanguage === 'en',
    isBulgarian: (state) => state.currentLanguage === 'bg'
  },

  actions: {
    setLanguage(language) {
      if (this.translations[language]) {
        this.currentLanguage = language
        localStorage.setItem('selectedLanguage', language)
      }
    },
    
    toggleLanguage() {
      const newLang = this.currentLanguage === 'bg' ? 'en' : 'bg'
      this.setLanguage(newLang)
    },

    initLanguage() {
      const savedLanguage = localStorage.getItem('selectedLanguage')
      if (savedLanguage && this.translations[savedLanguage]) {
        this.currentLanguage = savedLanguage
      }
    },

    t(key) {
      return this.currentTranslations[key] || key
    }
  }
}) 