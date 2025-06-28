const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// Get database path from command line argument or use default
const dbPath = process.argv[2] || path.join(__dirname, 'New folder (2)', 'server', 'netcafe.db')

console.log('🚀 Populating database with demo data...')
console.log('Database path:', dbPath)

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Грешка при свързване с базата данни:', err.message)
    process.exit(1)
  }
  console.log('✅ Свързан с NetCafe база данни')
})

// Create Simulators table
const createSimulatorsTable = `
  CREATE TABLE IF NOT EXISTS simulators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    specs TEXT NOT NULL,
    gpu TEXT NOT NULL,
    setup_type TEXT NOT NULL, -- 'wheel_only', 'full_set', 'motion'
    has_motion BOOLEAN DEFAULT 0,
    has_vr BOOLEAN DEFAULT 0,
    screen_setup TEXT, -- 'single', 'triple', 'ultrawide'
    image_url TEXT,
    status TEXT DEFAULT 'available', -- 'available', 'maintenance', 'unavailable'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

// Simulators Demo Data
const simulators = [
  {
    name: "Elite Racing Rig Pro",
    description: "Професионален симулатор с motion platform и VR поддръжка",
    specs: "RTX 4090, Triple 32\" 4K монитори,\nDirect Drive wheel base,\nLoadcell педали,\nMotion platform 3DOF",
    gpu: "RTX 4090",
    setup_type: "motion",
    has_motion: 1,
    has_vr: 1,
    screen_setup: "triple",
    image_url: "/simulators/elite-rig-pro.jpg",
    status: "available"
  },
  {
    name: "VIP Racing Cockpit",
    description: "VIP симулатор с професионални компоненти и triple screen setup",
    specs: "RTX 4080 Super, Triple 27\" QHD монитори,\nSimucube Pro wheel base,\nHeusinkveld Sprint педали,\nНастоящо седало OMP",
    gpu: "RTX 4080 Super",
    setup_type: "full_set",
    has_motion: 0,
    has_vr: 1,
    screen_setup: "triple",
    image_url: "/simulators/vip-cockpit.jpg",
    status: "available"
  },
  {
    name: "Racing Simulator Alpha",
    description: "Висококласен симулатор с ultrawide монитор и професионални компоненти",
    specs: "RTX 4070 Ti, 49\" Ultrawide 5120x1440,\nThrustmaster T-GT II,\nT-LCM педали с Load Cell",
    gpu: "RTX 4070 Ti",
    setup_type: "full_set",
    has_motion: 0,
    has_vr: 1,
    screen_setup: "ultrawide",
    image_url: "/simulators/alpha-sim.jpg",
    status: "available"
  },
  {
    name: "VR Racing Station",
    description: "Специализиран VR симулатор за максимално потапяне",
    specs: "RTX 4080, Varjo Aero VR Headset,\nSimucube 2 Sport,\nПрофесионални педали,\nHaptic обратна връзка",
    gpu: "RTX 4080",
    setup_type: "full_set",
    has_motion: 0,
    has_vr: 1,
    screen_setup: "vr",
    image_url: "/simulators/vr-station.jpg",
    status: "available"
  },
  {
    name: "Formula Cockpit",
    description: "Реплика на Formula 1 cockpit с authentic компоненти",
    specs: "RTX 4070, Triple 24\" Full HD,\nFormula wheel replica,\nРеплика F1 педали,\nАвтентично F1 седало",
    gpu: "RTX 4070",
    setup_type: "full_set",
    has_motion: 0,
    has_vr: 0,
    screen_setup: "triple",
    image_url: "/simulators/formula-cockpit.jpg",
    status: "available"
  },
  {
    name: "GT Racing Rig",
    description: "GT стил симулатор с комфортна позиция и отлична ергономия",
    specs: "RTX 4060 Ti, 32\" QHD монитор,\nLogitech G Pro wheel,\nG Pro педали,\nРегулируемо GT седало",
    gpu: "RTX 4060 Ti",
    setup_type: "wheel_only",
    has_motion: 0,
    has_vr: 0,
    screen_setup: "single",
    image_url: "/simulators/gt-rig.jpg",
    status: "available"
  }
];

// Academy Categories Demo Data
const academyCategories = [
  {
    name: "Основи на управлението",
    description: "Научете основите на sim racing - контроли, техники и базови умения",
    icon: "fas fa-steering-wheel"
  },
  {
    name: "Напреднали техники",
    description: "Усъвършенствайте уменията си с професионални техники",
    icon: "fas fa-tachometer-alt"
  },
  {
    name: "Setup и настройки",
    description: "Научете се да настройвате колата за максимална производителност",
    icon: "fas fa-wrench"
  },
  {
    name: "Състезателни стратегии",
    description: "Развийте състезателно мислене и стратегии за победа",
    icon: "fas fa-trophy"
  }
];

// Academy Courses Demo Data
const academyCourses = [
  {
    title: "Основи на Sim Racing",
    description: "Научете основните контроли, техники за завиване и базови принципи на безопасното карайте.",
    price_tokens: 200,
    thumbnail_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&q=80",
    youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "45 минути",
    difficulty: "beginner",
    category_id: 1,
    is_active: 1
  },
  {
    title: "Перфектен Racing Line",
    description: "Овладейте идеалната racing линия за различни типове завои и писти.",
    price_tokens: 350,
    thumbnail_url: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=400&fit=crop&q=80",
    youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "60 минути",
    difficulty: "intermediate",
    category_id: 2,
    is_active: 1
  },
  {
    title: "Trail Braking Техника",
    description: "Напреднала техника за спиране, която ще ви направи по-бърз в завоите.",
    price_tokens: 400,
    thumbnail_url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=400&fit=crop&q=80",
    youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "50 минути",
    difficulty: "advanced",
    category_id: 2,
    is_active: 1
  },
  {
    title: "Setup Основи",
    description: "Научете как да настройвате suspension, differential и аеродинамика.",
    price_tokens: 500,
    thumbnail_url: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=600&h=400&fit=crop&q=80",
    youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "75 минути",
    difficulty: "intermediate",
    category_id: 3,
    is_active: 1
  },
  {
    title: "Състезателна Психология",
    description: "Развийте менталната сила нужна за състезания под натиск.",
    price_tokens: 300,
    thumbnail_url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop&q=80",
    youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "40 минути",
    difficulty: "beginner",
    category_id: 4,
    is_active: 1
  },
  {
    title: "Wetrace Техники",
    description: "Специализирани техники за карайте в дъждовни условия.",
    price_tokens: 450,
    thumbnail_url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=400&fit=crop&q=80",
    youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "55 минути",
    difficulty: "advanced",
    category_id: 2,
    is_active: 1
  }
];

// Shop Items Demo Data
const shopItems = [
  {
    name: "VIP Racing Опит",
    description: "Ексклузивен достъп до VIP симулатори с професионални настройки",
    category: "VIP",
    price: 500,
    original_price: 600,
    icon: "🏎️",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&q=80",
    popular: 1,
    premium: 1,
    discount: 17,
    stock: 10,
    features: "VIP Cockpit,Professional Wheel,Telemetry Data",
    stats: "Duration: 30min,Experience: Premium"
  },
  {
    name: "Личен Инструктор",
    description: "Персонален тренинг с професионален инструктор",
    category: "Обучение",
    price: 800,
    icon: "👨‍🏫",
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop&q=80",
    premium: 1,
    stock: 5,
    features: "1-on-1 Training,Video Analysis,Custom Setup",
    stats: "Duration: 60min,Level: Advanced"
  },
  {
    name: "Racing Setup Пакет",
    description: "Професионални настройки за вашия любим автомобил",
    category: "Настройки",
    price: 200,
    icon: "⚙️",
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&q=80",
    popular: 1,
    stock: -1,
    features: "Car Setup,Suspension Tuning,Aerodynamics",
    stats: "Cars: Multiple,Tracks: All"
  },
  {
    name: "VR Racing Опит",
    description: "Пълно потапяне с VR очила и хаптик обратна връзка",
    category: "VR",
    price: 400,
    icon: "🥽",
    image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400&h=300&fit=crop&q=80",
    popular: 1,
    stock: 8,
    features: "VR Headset,Haptic Feedback,360° View",
    stats: "Duration: 30min,Immersion: 100%"
  },
  {
    name: "Данни от Телеметрия",
    description: "Подробен анализ на вашето представяне с графики и препоръки",
    category: "Анализ",
    price: 150,
    icon: "📊",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&q=80",
    stock: -1,
    features: "Data Analysis,Performance Graphs,Improvement Tips",
    stats: "Sessions: Unlimited,Detail: Professional"
  },
  {
    name: "VIP Членство",
    description: "Месечно членство с неограничен достъп до всички функции",
    category: "Членство",
    price: 2000,
    original_price: 2500,
    icon: "💎",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&q=80",
    premium: 1,
    limited: 1,
    discount: 20,
    stock: 50,
    features: "Unlimited Access,Priority Booking,Exclusive Events",
    stats: "Duration: 30 days,Benefits: All"
  },
  {
    name: "Custom Livery Design",
    description: "Персонализиран дизайн на вашия racing автомобил",
    category: "Персонализация",
    price: 300,
    icon: "🎨",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=300&fit=crop&q=80",
    stock: 20,
    features: "Custom Design,Logo Placement,Color Schemes",
    stats: "Cars: Any,Revisions: 3"
  },
  {
    name: "Racing Wheel Upgrade",
    description: "Upgrade до професионално рул с force feedback",
    category: "Hardware",
    price: 600,
    icon: "🎮",
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop&q=80",
    popular: 1,
    stock: 3,
    features: "Force Feedback,Metal Pedals,Shifter",
    stats: "Duration: Session,Quality: Pro"
  },
  {
    name: "Endurance Race Token",
    description: "Специален токен за участие в endurance състезания",
    category: "События",
    price: 1000,
    icon: "⏱️",
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&q=80",
    limited: 1,
    stock: 10,
    features: "Long Distance,Team Racing,Pit Strategy",
    stats: "Duration: 2-6 hours,Difficulty: Expert"
  },
  {
    name: "Racing Курс",
    description: "Пълен курс за начинаещи с теория и практика",
    category: "Обучение",
    price: 1200,
    icon: "📚",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop&q=80",
    premium: 1,
    stock: 15,
    features: "Theory + Practice,Certificate,Beginner Friendly",
    stats: "Duration: 5 sessions,Level: Beginner to Intermediate"
  }
]

// Tournament Demo Data
const tournaments = [
  {
    name: "Winter Grand Prix",
    description: "Престижното състезание с най-добрите sim racing пилоти",
    category: "racing",
    status: "upcoming",
    start_date: "2024-02-15 19:00:00",
    end_date: "2024-02-15 22:00:00",
    max_participants: 32,
    entry_fee: 100,
    prize_pool: 3000,
    first_prize: 1500,
    second_prize: 900,
    third_prize: 600,
    rules: "Стандартни FIA правила, без помощни системи, 50% race distance",
    requirements: "Минимум 20 часа опит, Elite ниво или по-високо",
    image_url: "/tournaments/grand-prix.jpg",
    created_by: 1
  },
  {
    name: "Drift Masters Championship",
    description: "Показни drift състезания с judge система и стил точки",
    category: "drift",
    status: "active",
    start_date: "2024-01-20 18:00:00",
    end_date: "2024-01-20 21:00:00",
    max_participants: 16,
    entry_fee: 50,
    prize_pool: 800,
    first_prize: 400,
    second_prize: 240,
    third_prize: 160,
    rules: "Drift състезание с judge система, 3 рунда, най-добри 8 в финал",
    requirements: "Drift опит препоръчан, всички нива добре дошли",
    created_by: 1
  },
  {
    name: "Rookie Cup",
    description: "Турнир за начинаещи пилоти с обучителна цел",
    category: "rookie",
    status: "upcoming",
    start_date: "2024-02-25 17:00:00",
    end_date: "2024-02-25 19:00:00",
    max_participants: 20,
    entry_fee: 25,
    prize_pool: 500,
    first_prize: 250,
    second_prize: 150,
    third_prize: 100,
    rules: "Помощни системи разрешени, кратки спринт race-ове",
    requirements: "Rookie или Novice ниво, под 10 часа опит",
    created_by: 1
  },
  {
    name: "Endurance Challenge",
    description: "Отборен endurance race с pit stop стратегия",
    category: "endurance",
    status: "upcoming",
    start_date: "2024-03-10 14:00:00",
    end_date: "2024-03-10 18:00:00",
    max_participants: 24,
    entry_fee: 200,
    prize_pool: 4800,
    first_prize: 2400,
    second_prize: 1440,
    third_prize: 960,
    rules: "Отборни състезания по 2-3 души, задължителни pit stops, управление на гориво",
    requirements: "Pro ниво или по-високо, отборна регистрация",
    created_by: 1
  },
  {
    name: "Street Racing Showdown",
    description: "Неофициални street racing състезания с модифицирани коли",
    category: "street",
    status: "completed",
    start_date: "2024-01-05 20:00:00",
    end_date: "2024-01-05 23:00:00",
    max_participants: 12,
    entry_fee: 75,
    prize_pool: 900,
    first_prize: 450,
    second_prize: 270,
    third_prize: 180,
    rules: "Модифицирани коли, нощни писти, elimination format",
    requirements: "Intermediate ниво минимум",
    created_by: 1
  }
]

// Booking Demo Data
const bookings = [
  {
    user_id: 2,
    computer_id: 1,
    date: "2024-12-25",
    start_time: "14:00",
    end_time: "16:00",
    duration_hours: 2,
    total_price: 60.00,
    status: "confirmed",
    booking_type: "standard",
    phone: "0888123456",
    email: "novak@example.com",
    special_requests: "Искам F1 симулатор"
  },
  {
    user_id: 3,
    computer_id: 2,
    date: "2024-12-26",
    start_time: "10:00",
    end_time: "12:00",
    duration_hours: 2,
    total_price: 60.00,
    status: "pending",
    booking_type: "vip",
    phone: "0888654321",
    email: "speedster@example.com",
    special_requests: "VIP Experience с инструктор"
  },
  {
    user_id: 4,
    computer_id: 3,
    date: "2024-12-27",
    start_time: "18:00",
    end_time: "20:00",
    duration_hours: 2,
    total_price: 60.00,
    status: "confirmed",
    booking_type: "group",
    phone: "0888987654",
    email: "drifter@example.com",
    special_requests: "Drift setup с приятели"
  },
  {
    user_id: 5,
    computer_id: 4,
    date: "2024-12-28",
    start_time: "16:00",
    end_time: "19:00",
    duration_hours: 3,
    total_price: 90.00,
    status: "completed",
    booking_type: "endurance",
    phone: "0888111222",
    email: "racer@example.com",
    special_requests: "Endurance race тренировка"
  },
  {
    user_id: 6,
    computer_id: 5,
    date: "2024-12-29",
    start_time: "20:00",
    end_time: "22:00",
    duration_hours: 2,
    total_price: 60.00,
    status: "cancelled",
    booking_type: "standard",
    phone: "0888333444",
    email: "legend@example.com",
    special_requests: "Отменена заради болест"
  },
  {
    user_id: 1,
    computer_id: 1,
    date: "2024-12-30",
    start_time: "15:00",
    end_time: "17:00",
    duration_hours: 2,
    total_price: 60.00,
    status: "confirmed",
    booking_type: "admin",
    phone: "0888999888",
    email: "admin@simracing.com",
    special_requests: "Тестване на нови настройки"
  }
]

// Create and populate simulators
db.serialize(() => {
  console.log('🏎️ Създаване на таблица за симулатори...')
  
  db.run(createSimulatorsTable, (err) => {
    if (err) {
      console.error('❌ Грешка при създаване на таблица simulators:', err.message)
    } else {
      console.log('✅ Таблица simulators създадена успешно')
    }
  })
  
  console.log('🏁 Добавяне на симулатори...')
  
  const insertSimulator = db.prepare(`
    INSERT OR REPLACE INTO simulators (
      name, description, specs, gpu, setup_type, has_motion, has_vr, screen_setup, image_url, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  
  simulators.forEach((simulator, index) => {
    insertSimulator.run(
      simulator.name, simulator.description, simulator.specs, simulator.gpu,
      simulator.setup_type, simulator.has_motion, simulator.has_vr, 
      simulator.screen_setup, simulator.image_url, simulator.status
    )
    console.log(`✅ Добавен симулатор: ${simulator.name}`)
  })
  
  insertSimulator.finalize()

  console.log('📦 Добавяне на shop items...')
  
  const insertItem = db.prepare(`
    INSERT OR REPLACE INTO shop_items (
      title, description, category, price, icon, stock, features, stats
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  
  shopItems.forEach((item, index) => {
    insertItem.run(
      item.name, item.description, item.category, item.price,
      item.icon, item.stock || -1, item.features || null, item.stats || null
    )
    console.log(`✅ Добавен: ${item.name}`)
  })
  
  insertItem.finalize()
  
  // Add academy categories
  console.log('📚 Добавяне на academy categories...')
  
  const insertCategory = db.prepare(`
    INSERT OR REPLACE INTO course_categories (
      name, description, icon
    ) VALUES (?, ?, ?)
  `)
  
  academyCategories.forEach((category, index) => {
    insertCategory.run(
      category.name, category.description, category.icon
    )
    console.log(`✅ Добавена категория: ${category.name}`)
  })
  
  insertCategory.finalize()
  
  // Add academy courses
  console.log('🎓 Добавяне на academy courses...')
  
  const insertCourse = db.prepare(`
    INSERT OR REPLACE INTO academy_courses (
      title, description, price_tokens, thumbnail_url, youtube_url, duration, difficulty, category_id, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  
  academyCourses.forEach((course, index) => {
    insertCourse.run(
      course.title, course.description, course.price_tokens, course.thumbnail_url,
      course.youtube_url, course.duration, course.difficulty, course.category_id, course.is_active
    )
    console.log(`✅ Добавен курс: ${course.title}`)
  })
  
  insertCourse.finalize()
  
  console.log('🏆 Добавяне на tournaments...')
  
  const insertTournament = db.prepare(`
    INSERT OR REPLACE INTO tournaments (
      name, description, status, date,
      max_participants, entry_fee, prize
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  
  tournaments.forEach((tournament, index) => {
    insertTournament.run(
      tournament.name, tournament.description, tournament.status,
      tournament.start_date, tournament.max_participants,
      tournament.entry_fee, tournament.prize_pool
    )
    console.log(`✅ Добавен турнир: ${tournament.name}`)
  })
  
  insertTournament.finalize()
  
  // Add bookings
  console.log('📅 Добавяне на bookings...')
  
  // Create bookings table first
  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      computer_id INTEGER,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      duration_hours INTEGER NOT NULL,
      total_price REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      booking_type TEXT DEFAULT 'standard',
      special_requests TEXT,
      phone TEXT,
      email TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `)
  
  const insertBooking = db.prepare(`
    INSERT OR REPLACE INTO bookings (
      user_id, computer_id, date, start_time, end_time,
      duration_hours, total_price, status, booking_type,
      special_requests, phone, email
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  
  bookings.forEach((booking, index) => {
    insertBooking.run(
      booking.user_id, booking.computer_id, booking.date,
      booking.start_time, booking.end_time, booking.duration_hours,
      booking.total_price, booking.status, booking.booking_type,
      booking.special_requests, booking.phone, booking.email
    )
    console.log(`✅ Добавена резервация: ${booking.date} ${booking.start_time}-${booking.end_time}`)
  })
  
  insertBooking.finalize()
  
  // Add some tournament registrations for the active tournament
  console.log('👥 Добавяне на примерни регистрации...')
  
  const insertRegistration = db.prepare(`
    INSERT OR IGNORE INTO tournament_registrations (tournament_id, user_id)
    VALUES (?, ?)
  `)
  
  // Register admin and some fake users for active tournament (ID 2)
  insertRegistration.run(2, 1)
  
  insertRegistration.finalize()
  
  console.log('🎉 Демо данни добавени успешно!')
  console.log('')
  console.log('📊 Резултат:')
  console.log(`   • ${simulators.length} симулатора`)
  console.log(`   • ${shopItems.length} shop items`)
  console.log(`   • ${tournaments.length} турнира`)
  console.log(`   • ${bookings.length} резервации`)
  console.log(`   • Примерни регистрации`)
  console.log('')
  console.log('🚀 Стартирайте сървъра и проверете симулаторите, магазина, турнирите и booking системата!')
})

db.close((err) => {
  if (err) {
    console.error('❌ Грешка при затваряне на базата данни:', err.message)
  } else {
    console.log('✅ Връзката с базата данни е затворена')
  }
}) 