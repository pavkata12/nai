<template>
  <div class="admin-panel">
    <!-- Authentication Check -->
    <div v-if="!authStore.isLoggedIn || !authStore.user?.is_admin" class="auth-required">
      <div class="auth-message">
        <div class="auth-icon">
          <i class="fas fa-lock"></i>
        </div>
        <h2>Достъп отказан</h2>
        <p v-if="!authStore.isLoggedIn">Моля, влезте в профила си за достъп до админ панела.</p>
        <p v-else>Нямате администраторски права за достъп до този панел.</p>
        <router-link to="/login" class="btn-primary">
          <i class="fas fa-sign-in-alt"></i>
          Вход
        </router-link>
      </div>
    </div>

    <!-- Admin Panel Content -->
    <div v-else>
    <div class="admin-header section-padding">
        <div class="header-bg-pattern"></div>
        <div class="header-particles"></div>
      <div class="container">
        <div class="header-content animate__animated animate__fadeInDown">
            <div class="header-icon-wrapper">
              <div class="icon-glow"></div>
              <i class="fas fa-cog header-main-icon"></i>
            </div>
          <h1 class="page-title">
            Admin Panel
          </h1>
          <p class="page-subtitle">
            Управление на Academy Sim Racing
          </p>
            <div class="header-decorative-line">
              <span class="line-segment"></span>
              <span class="line-diamond">◆</span>
              <span class="line-segment"></span>
            </div>
        </div>
      </div>
    </div>

    <div class="admin-content section-padding">
      <div class="container">
        <!-- Admin Navigation -->
        <div class="admin-nav animate__animated animate__fadeInLeft">
          <button 
            v-for="tab in adminTabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            class="nav-tab"
            :class="{ 'active': activeTab === tab.id }"
          >
            <i :class="tab.icon"></i>
            <span>{{ tab.name }}</span>
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content animate__animated animate__fadeInUp animate__delay-1s">
          
          <!-- Posts Management -->
          <div v-if="activeTab === 'posts'" class="tab-panel">
            <div class="panel-header">
              <h2>Управление на новини</h2>
              <button @click="showCreatePost = true" class="btn-primary">
                <i class="fas fa-plus"></i>
                Нова новина
              </button>
            </div>
            
            <div v-if="loading.posts" class="loading-state">
              <i class="fas fa-spinner fa-spin"></i>
              <span>Зареждане на новини...</span>
            </div>
              
              <div v-else-if="error.posts" class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <span>{{ error.posts }}</span>
                <button @click="loadPosts" class="btn-secondary">Опитай отново</button>
            </div>
            
            <div v-else class="posts-table">
              <div class="table-header">
                <div class="col-title">Заглавие</div>
                <div class="col-category">Категория</div>
                <div class="col-status">Статус</div>
                <div class="col-date">Дата</div>
                <div class="col-actions">Действия</div>
              </div>
              
              <div 
                v-for="post in posts" 
                :key="post.id"
                class="table-row"
              >
                <div class="col-title">
                  <div class="post-title">{{ post.title }}</div>
                  <div class="post-excerpt">{{ truncate(post.content, 100) }}</div>
                </div>
                <div class="col-category">
                  <span class="category-tag">{{ post.category }}</span>
                </div>
                <div class="col-status">
                  <span :class="'status-' + post.status">{{ post.status }}</span>
                </div>
                <div class="col-date">{{ formatDate(post.created_at) }}</div>
                <div class="col-actions">
                  <button @click="editPost(post)" class="btn-icon btn-edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="deletePost(post.id)" class="btn-icon btn-delete">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Tournament Management -->
          <div v-if="activeTab === 'tournaments'" class="tab-panel">
            <div class="panel-header">
              <h2>Управление на турнири</h2>
              <button @click="showCreateTournament = true" class="btn-primary">
                <i class="fas fa-plus"></i>
                Нов турнир
              </button>
            </div>
            
            <div v-if="loading.tournaments" class="loading-state">
              <i class="fas fa-spinner fa-spin"></i>
              <span>Зареждане на турнири...</span>
            </div>
              
            <div v-else-if="error.tournaments" class="error-state">
              <i class="fas fa-exclamation-triangle"></i>
              <span>{{ error.tournaments }}</span>
              <button @click="loadTournaments" class="btn-secondary">Опитай отново</button>
            </div>
            
            <div v-else class="tournaments-table">
              <div class="table-header">
                <div class="col-tournament">Турнир</div>
                <div class="col-date">Дата</div>
                <div class="col-participants">Участници</div>
                <div class="col-prize">Награда</div>
                <div class="col-entry-fee">Цена</div>
                <div class="col-status">Статус</div>
                <div class="col-actions">Действия</div>
              </div>
              
              <div 
                v-for="tournament in tournaments" 
                :key="tournament.id"
                class="table-row"
              >
                <div class="col-tournament">
                  <div class="tournament-title">{{ tournament.name }}</div>
                  <div class="tournament-description">{{ truncate(tournament.description, 80) }}</div>
                </div>
                <div class="col-date">{{ formatDate(tournament.date) }}</div>
                <div class="col-participants">
                  <div class="participants-info">
                    <span class="participants-count">{{ tournament.participants || 0 }}/{{ tournament.max_participants }}</span>
                    <div class="participants-bar">
                      <div 
                        class="participants-fill" 
                        :style="{ width: ((tournament.participants || 0) / tournament.max_participants * 100) + '%' }"
                      ></div>
                    </div>
                  </div>
                </div>
                <div class="col-prize">
                  <span class="prize-amount">{{ tournament.prize }}</span>
                  <i class="fas fa-coins"></i>
                </div>
                <div class="col-entry-fee">
                  <span class="entry-fee-amount">{{ tournament.entry_fee || 0 }}</span>
                  <i class="fas fa-ticket-alt"></i>
                </div>
                <div class="col-status">
                  <span :class="'status-' + tournament.status">
                    {{ getStatusText(tournament.status) }}
                  </span>
                </div>
                <div class="col-actions">
                  <button @click="viewParticipants(tournament)" class="btn-icon btn-view" title="Преглед на участници">
                    <i class="fas fa-users"></i>
                  </button>
                  <button @click="editTournament(tournament)" class="btn-icon btn-edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="deleteTournament(tournament.id)" class="btn-icon btn-delete">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Booking Management -->
          <div v-if="activeTab === 'bookings'" class="tab-panel">
            <div class="panel-header">
              <h2>Управление на резервации</h2>
              <div class="panel-actions">
                <button @click="loadBookings" class="btn-secondary">
                  <i class="fas fa-sync-alt"></i>
                  Обнови
                </button>
              </div>
            </div>
            
            <div v-if="loading.bookings" class="loading-state">
              <i class="fas fa-spinner fa-spin"></i>
              <span>Зареждане на резервации...</span>
            </div>
              
            <div v-else-if="error.bookings" class="error-state">
              <i class="fas fa-exclamation-triangle"></i>
              <span>{{ error.bookings }}</span>
              <button @click="loadBookings" class="btn-secondary">Опитай отново</button>
            </div>
            
            <div v-else class="bookings-table">
              <div class="table-header">
                <div class="col-booking">Резервация</div>
                <div class="col-contact">Контакт</div>
                <div class="col-datetime">Дата/Час</div>
                <div class="col-computer">Компютър</div>
                <div class="col-price">Цена</div>
                <div class="col-status">Статус</div>
                <div class="col-actions">Действия</div>
              </div>
              
              <div 
                v-for="booking in bookings" 
                :key="booking.id"
                class="table-row"
              >
                <div class="col-booking">
                  <div class="booking-info">
                    <div class="booking-client">
                      <i class="fas fa-user"></i>
                      {{ booking.user_name || 'Гост' }}
                    </div>
                    <div class="booking-type">
                      <span class="type-badge" :class="'type-' + booking.booking_type">
                        {{ booking.booking_type }}
                      </span>
                    </div>
                    <div v-if="booking.special_requests" class="booking-requests">
                      <i class="fas fa-comment"></i>
                      {{ truncate(booking.special_requests, 50) }}
                    </div>
                  </div>
                </div>
                
                <div class="col-contact">
                  <div class="contact-info">
                    <div class="contact-phone">
                      <i class="fas fa-phone"></i>
                      {{ booking.phone }}
                    </div>
                    <div v-if="booking.email" class="contact-email">
                      <i class="fas fa-envelope"></i>
                      {{ booking.email }}
                    </div>
                  </div>
                </div>
                
                <div class="col-datetime">
                  <div class="datetime-info">
                    <div class="booking-date">
                      <i class="fas fa-calendar"></i>
                      {{ formatDate(booking.date) }}
                    </div>
                    <div class="booking-time">
                      <i class="fas fa-clock"></i>
                      {{ booking.start_time }} - {{ booking.end_time }}
                    </div>
                    <div class="booking-duration">
                      {{ booking.duration_hours }}ч
                    </div>
                  </div>
                </div>
                
                <div class="col-computer">
                  <div class="computer-info">
                    <i class="fas fa-desktop"></i>
                    {{ booking.computer_id ? `PC #${booking.computer_id}` : 'Няма' }}
                  </div>
                </div>
                
                <div class="col-price">
                  <div class="price-info">
                    <span class="price-amount">{{ booking.total_price }}лв</span>
                  </div>
                </div>
                
                <div class="col-status">
                  <div class="status-actions">
                    <select 
                      :value="booking.status"
                      @change="updateBookingStatus(booking.id, $event.target.value)"
                      class="status-select"
                      :class="'status-' + booking.status"
                    >
                      <option value="pending">Изчакваща</option>
                      <option value="confirmed">Потвърдена</option>
                      <option value="cancelled">Отменена</option>
                      <option value="completed">Завършена</option>
                    </select>
                  </div>
                </div>
                
                <div class="col-actions">
                  <button @click="deleteBooking(booking.id)" class="btn-icon btn-delete">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Simulator Management -->
          <div v-if="activeTab === 'simulators'" class="tab-panel">
            <div class="panel-header">
              <h2>Управление на симулатори</h2>
              <button @click="showCreateSimulator = true" class="btn-primary">
                <i class="fas fa-plus"></i>
                Нов симулатор
              </button>
            </div>
            

            
            <div v-if="loading.simulators" class="loading-state">
              <i class="fas fa-spinner fa-spin"></i>
              <span>Зареждане на симулатори...</span>
            </div>
              
            <div v-else-if="error.simulators" class="error-state">
              <i class="fas fa-exclamation-triangle"></i>
              <span>{{ error.simulators }}</span>
              <button @click="loadSimulators" class="btn-secondary">Опитай отново</button>
            </div>
            
            <div v-else class="simulators-grid">
              <div 
                v-for="simulator in simulators" 
                :key="simulator.id"
                class="simulator-card"
              >
                <!-- Background Image -->
                <div 
                  class="simulator-image"
                  :style="simulator.image_url ? `background-image: url('${simulator.image_url}')` : ''"
                >
                  <!-- Status Badge -->
                  <div class="status-badge">
                    <span 
                      :class="simulator.status === 'available' ? 'status-available' : 'status-unavailable'"
                    >
                      {{ simulator.status === 'available' ? 'Наличен' : 'Недостъпен' }}
                    </span>
                  </div>

                  <!-- Feature Badges -->
                  <div class="feature-badges">
                    <span v-if="simulator.has_motion" class="badge badge-motion">Motion</span>
                    <span v-if="simulator.has_vr" class="badge badge-vr">VR</span>
                  </div>

                  <!-- Actions -->
                  <div class="simulator-actions">
                    <button @click="editSimulator(simulator)" class="btn-icon btn-edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click="deleteSimulator(simulator.id)" class="btn-icon btn-delete">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>

                <!-- Simulator Info -->
                <div class="simulator-info">
                  <h3 class="simulator-name">{{ simulator.name }}</h3>
                  <p class="simulator-description">{{ truncate(simulator.description, 80) }}</p>
                  
                  <!-- Specs Grid -->
                  <div class="specs-grid">
                    <div class="spec-item">
                      <i class="fas fa-microchip"></i>
                      <span>{{ simulator.gpu }}</span>
                    </div>
                    <div class="spec-item">
                      <i class="fas fa-tv"></i>
                      <span>{{ getScreenSetupText(simulator.screen_setup) }}</span>
                    </div>
                    <div class="spec-item">
                      <i class="fas fa-cogs"></i>
                      <span>{{ getSetupTypeText(simulator.setup_type) }}</span>
                    </div>
                  </div>

                  <!-- Full Specs -->
                  <div class="full-specs">
                    <small>{{ simulator.specs }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Shop Management -->
          <div v-if="activeTab === 'shop'" class="tab-panel">
            <div class="panel-header">
              <h2>Управление на магазина</h2>
              <button @click="showCreateItem = true" class="btn-primary">
                <i class="fas fa-plus"></i>
                Нов продукт
              </button>
            </div>
            
            <div v-if="loading.shop" class="loading-state">
              <i class="fas fa-spinner fa-spin"></i>
              <span>Зареждане на продукти...</span>
            </div>
              
              <div v-else-if="error.shop" class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <span>{{ error.shop }}</span>
                <button @click="loadShopItems" class="btn-secondary">Опитай отново</button>
            </div>
            
            <div v-else class="shop-table">
              <div class="table-header">
                <div class="col-item">Продукт</div>
                <div class="col-price">Цена</div>
                <div class="col-stock">Наличност</div>
                <div class="col-status">Статус</div>
                <div class="col-actions">Действия</div>
              </div>
              
              <div 
                v-for="item in shopItems" 
                :key="item.id"
                class="table-row"
              >
                <div class="col-item">
                  <div class="item-info">
                    <span class="item-icon">{{ item.icon || '🎁' }}</span>
                    <div>
                      <div class="item-title">{{ item.title }}</div>
                      <div class="item-category">{{ item.category }}</div>
                    </div>
                  </div>
                </div>
                <div class="col-price">
                  <span class="price-amount">{{ item.price }}</span>
                  <i class="fas fa-coins"></i>
                </div>
                <div class="col-stock">
                  {{ item.stock === -1 ? 'Неограничено' : item.stock }}
                </div>
                <div class="col-status">
                  <span :class="item.is_active ? 'status-active' : 'status-inactive'">
                    {{ item.is_active ? 'Активен' : 'Неактивен' }}
                  </span>
                </div>
                <div class="col-actions">
                  <button @click="editShopItem(item)" class="btn-icon btn-edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="deleteShopItem(item.id)" class="btn-icon btn-delete">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- User Management -->
          <div v-if="activeTab === 'users'" class="tab-panel">
            <div class="panel-header">
              <h2>Управление на потребители</h2>
            </div>
            
            <div v-if="loading.users" class="loading-state">
              <i class="fas fa-spinner fa-spin"></i>
              <span>Зареждане на потребители...</span>
            </div>
              
              <div v-else-if="error.users" class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <span>{{ error.users }}</span>
                <button @click="loadUsers" class="btn-secondary">Опитай отново</button>
            </div>
            
            <div v-else class="users-table">
              <div class="table-header">
                <div class="col-user">Потребител</div>
                <div class="col-stats">Статистики</div>
                <div class="col-tokens">Токени</div>
                <div class="col-actions">Действия</div>
              </div>
              
              <div 
                v-for="user in users" 
                :key="user.id"
                class="table-row"
              >
                <div class="col-user">
                  <div class="user-info">
                    <i class="fas fa-user-circle"></i>
                    <div>
                      <div class="user-name">{{ user.username }}</div>
                      <div class="user-status">
                        {{ user.is_admin ? 'Admin' : 'Потребител' }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-stats">
                  <div class="stat-item">
                    <span>{{ Math.floor((user.total_time_played || 0) / 60) }}ч игра</span>
                  </div>
                  <div class="stat-item">
                      <span>{{ user.sessions_played || 0 }} сесии</span>
                  </div>
                </div>
                <div class="col-tokens">
                  <div class="token-display">
                      <span>{{ calculateUserTokens(user) }}</span>
                    <i class="fas fa-coins"></i>
                  </div>
                </div>
                <div class="col-actions">
                  <button @click="addTokensToUser(user)" class="btn-icon btn-tokens">
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Academy Management -->
          <div v-if="activeTab === 'academy'" class="tab-panel">
            <div class="panel-header">
              <h2>Управление на академията</h2>
              <div class="header-actions">
                <button @click="showCreateAcademyCategory = true" class="btn-secondary">
                  <i class="fas fa-folder-plus"></i>
                  Нова категория
                </button>
                <button @click="showCreateAcademyCourse = true" class="btn-primary">
                  <i class="fas fa-plus"></i>
                  Нов курс
                </button>
              </div>
            </div>
            
            <div v-if="loading.academy || loading.academyCategories" class="loading-state">
              <i class="fas fa-spinner fa-spin"></i>
              <span>Зареждане на курсове...</span>
            </div>
              
            <div v-else-if="error.academy || error.academyCategories" class="error-state">
              <i class="fas fa-exclamation-triangle"></i>
              <span>{{ error.academy || error.academyCategories }}</span>
              <button @click="loadAcademyCourses(); loadAcademyCategories()" class="btn-secondary">Опитай отново</button>
            </div>
            
            <div v-else class="academy-content">
              <!-- Categories Section -->
              <div class="categories-section">
                <h3>Категории</h3>
                <div class="categories-grid">
                  <div 
                    v-for="category in academyCategories" 
                    :key="category.id"
                    class="category-card"
                  >
                    <div class="category-icon">
                      <i :class="category.icon"></i>
                    </div>
                    <div class="category-info">
                      <h4>{{ category.name }}</h4>
                      <p>{{ category.description }}</p>
                    </div>
                    <div class="category-actions">
                      <button @click="editAcademyCategory(category)" class="btn-icon btn-edit">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button @click="deleteAcademyCategory(category.id)" class="btn-icon btn-delete">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Courses Section -->
              <div class="courses-section">
                <h3>Курсове</h3>
                <div class="courses-table">
              <div class="table-header">
                <div class="col-course">Курс</div>
                <div class="col-category">Категория</div>
                    <div class="col-price">Цена</div>
                    <div class="col-difficulty">Трудност</div>
                    <div class="col-status">Статус</div>
                <div class="col-actions">Действия</div>
              </div>
              
                  <div 
                    v-for="course in academyCourses" 
                    :key="course.id"
                    class="table-row"
                  >
                <div class="col-course">
                  <div class="course-info">
                        <div 
                          class="course-thumbnail"
                          :style="course.thumbnail_url ? `background-image: url('${course.thumbnail_url}')` : ''"
                        ></div>
                    <div class="course-details">
                      <div class="course-title">{{ course.title }}</div>
                          <div class="course-description">{{ truncate(course.description, 60) }}</div>
                          <div v-if="course.duration" class="course-duration">
                            <i class="fas fa-clock"></i>
                            {{ course.duration }}
                    </div>
                  </div>
                </div>
                    </div>
                <div class="col-category">
                  <div class="category-badge">
                    <i :class="getCategoryIcon(course.category_id)"></i>
                        {{ getCategoryName(course.category_id) }}
                  </div>
                </div>
                    <div class="col-price">
                      <span class="price-amount">{{ course.price_tokens }}</span>
                      <i class="fas fa-coins"></i>
                    </div>
                <div class="col-difficulty">
                      <span 
                        class="difficulty-badge"
                        :class="`difficulty-${course.difficulty}`"
                      >
                    {{ getDifficultyText(course.difficulty) }}
                  </span>
                </div>
                    <div class="col-status">
                      <span :class="course.is_active ? 'status-active' : 'status-inactive'">
                        {{ course.is_active ? 'Активен' : 'Неактивен' }}
                  </span>
                </div>
                <div class="col-actions">
                      <button @click="editAcademyCourse(course)" class="btn-icon btn-edit">
                    <i class="fas fa-edit"></i>
                  </button>
                      <button @click="deleteAcademyCourse(course.id)" class="btn-icon btn-delete">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
            </div>
                </div>
                
          <!-- Statistics -->
          <div v-if="activeTab === 'stats'" class="tab-panel">
            <div class="panel-header">
              <h2>Статистики</h2>
              <button @click="loadStats" class="btn-secondary">
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading.stats }"></i>
                Обнови
              </button>
                </div>
                
              <div v-if="error.stats" class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <span>{{ error.stats }}</span>
                <button @click="loadStats" class="btn-secondary">Опитай отново</button>
                  </div>
                  
              <div v-else class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="fas fa-users"></i>
                  </div>
                <div class="stat-content">
                  <div class="stat-value">{{ stats.total_users || 0 }}</div>
                  <div class="stat-label">Потребители</div>
                </div>
                  </div>
                  
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="fas fa-clock"></i>
                  </div>
                <div class="stat-content">
                  <div class="stat-value">{{ Math.floor((stats.total_time || 0) / 60) }}</div>
                  <div class="stat-label">Часа игра</div>
                </div>
                </div>
                
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="fas fa-coins"></i>
                  </div>
                <div class="stat-content">
                    <div class="stat-value">{{ calculateTotalTokens() }}</div>
                  <div class="stat-label">Общо токени</div>
                  </div>
                </div>
                
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="fas fa-shopping-cart"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ shopItems.length }}</div>
                  <div class="stat-label">Продукти</div>
                </div>
                </div>
                </div>
                </div>
                </div>
                

        </div>
      </div>
    </div>

    <!-- Create Post Modal -->
    <div v-if="showCreatePost" class="modal-overlay" @click="closeCreatePost">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingPost ? 'Редактиране на новина' : 'Нова новина' }}</h3>
          <button @click="closeCreatePost" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="savePost" class="modal-body">
          <div class="form-group">
            <label class="form-label">Заглавие</label>
            <input 
              v-model="postForm.title" 
              type="text" 
              class="form-input" 
              required 
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Съдържание</label>
            <textarea 
              v-model="postForm.content" 
              class="form-textarea" 
              rows="6" 
              required
            ></textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">Категория</label>
            <select v-model="postForm.category" class="form-select">
              <option value="news">Новини</option>
              <option value="tournaments">Турнири</option>
              <option value="updates">Обновления</option>
              <option value="general">Общи</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-checkbox">
              <input type="checkbox" v-model="postForm.featured" />
              <span class="checkbox-custom"></span>
              Препоръчано
            </label>
          </div>
          
          <div class="modal-footer">
            <button type="button" @click="closeCreatePost" class="btn-secondary">
              Отказ
            </button>
            <button type="submit" class="btn-primary" :disabled="savingPost">
              <i v-if="savingPost" class="fas fa-spinner fa-spin"></i>
              <span v-else>{{ editingPost ? 'Обнови' : 'Създай' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Create Tournament Modal -->
    <div v-if="showCreateTournament" class="modal-overlay" @click="closeCreateTournament">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingTournament ? 'Редактиране на турнир' : 'Нов турнир' }}</h3>
          <button @click="closeCreateTournament" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="saveTournament" class="modal-body">
          <!-- Tournament Form -->
          <div class="form-group">
            <label class="form-label">Име на турнира</label>
            <input 
              v-model="tournamentForm.name" 
              type="text" 
              class="form-input" 
              required 
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Описание</label>
            <textarea 
              v-model="tournamentForm.description" 
              class="form-textarea" 
              rows="4" 
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">URL на изображение</label>
            <input 
              v-model="tournamentForm.image_url" 
              type="url" 
              class="form-input"
              placeholder="https://example.com/image.jpg"
            />
            <div class="image-preview" v-if="tournamentForm.image_url">
              <img :src="tournamentForm.image_url" alt="Tournament preview" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Тип игра</label>
              <select v-model="tournamentForm.game_type" class="form-select">
                <option value="racing">Състезание</option>
                <option value="time_trial">Time Trial</option>
                <option value="drift">Дрифт</option>
                <option value="endurance">Издръжливост</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Трудност</label>
              <select v-model="tournamentForm.difficulty" class="form-select">
                <option value="beginner">За начинаещи</option>
                <option value="medium">Средно ниво</option>
                <option value="expert">За експерти</option>
                <option value="pro">Професионално</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-checkbox">
              <input 
                type="checkbox" 
                v-model="tournamentForm.featured"
              />
              <span class="checkbox-label">Специален турнир</span>
            </label>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Дата</label>
              <input 
                v-model="tournamentForm.date" 
                type="date" 
                class="form-input" 
                required 
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Час</label>
              <input 
                v-model="tournamentForm.time" 
                type="time" 
                class="form-input" 
                required 
              />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Награда (токени)</label>
              <input 
                v-model.number="tournamentForm.prize" 
                type="number" 
                class="form-input" 
                min="0"
                required 
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Цена за записване (токени)</label>
              <input 
                v-model.number="tournamentForm.entry_fee" 
                type="number" 
                class="form-input" 
                min="0"
                required 
              />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Макс. участници</label>
              <input 
                v-model.number="tournamentForm.maxParticipants" 
                type="number" 
                class="form-input" 
                min="2"
                max="50"
                required 
              />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Статус</label>
            <select v-model="tournamentForm.status" class="form-select">
              <option value="upcoming">Предстоящ</option>
              <option value="active">Активен</option>
              <option value="completed">Завършен</option>
            </select>
          </div>
          
          <div class="modal-footer">
            <button type="button" @click="closeCreateTournament" class="btn-secondary">
              Отказ
            </button>
            <button type="submit" class="btn-primary" :disabled="savingTournament">
              <i v-if="savingTournament" class="fas fa-spinner fa-spin"></i>
              <span v-else>{{ editingTournament ? 'Обнови' : 'Създай' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Create Simulator Modal -->
    <div v-if="showCreateSimulator" class="modal-overlay" @click="closeCreateSimulator">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingSimulator ? 'Редактиране на симулатор' : 'Нов симулатор' }}</h3>
          <button @click="closeCreateSimulator" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="saveSimulator" class="modal-body">
          <div class="form-group">
            <label class="form-label">Име на симулатора *</label>
            <input 
              v-model="simulatorForm.name" 
              type="text" 
              class="form-input" 
              required 
              placeholder="Elite Racing Rig Pro"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Описание</label>
            <textarea 
              v-model="simulatorForm.description" 
              class="form-textarea" 
              rows="3" 
              placeholder="Професионален симулатор с motion platform и VR поддръжка"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">GPU *</label>
              <input 
                v-model="simulatorForm.gpu" 
                type="text" 
                class="form-input" 
                required 
                placeholder="RTX 4090"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Setup тип *</label>
              <select v-model="simulatorForm.setup_type" class="form-select" required>
                <option value="wheel_only">Само волан</option>
                <option value="full_set">Пълен сет</option>
                <option value="motion">Motion Platform</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Screen Setup</label>
              <select v-model="simulatorForm.screen_setup" class="form-select">
                <option value="single">Single Screen</option>
                <option value="triple">Triple Screen</option>
                <option value="ultrawide">Ultrawide</option>
                <option value="vr">VR Headset</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Статус</label>
              <select v-model="simulatorForm.status" class="form-select">
                <option value="available">Наличен</option>
                <option value="maintenance">Поддръжка</option>
                <option value="unavailable">Недостъпен</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Пълни спецификации *</label>
            <textarea 
              v-model="simulatorForm.specs" 
              class="form-textarea" 
              rows="4" 
              required
              placeholder="RTX 4090, Triple 32&quot; 4K монитори,&#10;Direct Drive wheel base,&#10;Loadcell педали,&#10;Motion platform 3DOF"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">URL на изображението</label>
            <input 
              v-model="simulatorForm.image_url" 
              type="text" 
              class="form-input" 
              placeholder="/simulators/elite-rig-pro.jpg"
            />
          </div>

          <div class="form-group">
            <div class="checkbox-row">
              <label class="form-checkbox">
                <input type="checkbox" v-model="simulatorForm.has_motion" />
                <span class="checkbox-custom"></span>
                Motion Platform
              </label>
              
              <label class="form-checkbox">
                <input type="checkbox" v-model="simulatorForm.has_vr" />
                <span class="checkbox-custom"></span>
                VR Support
              </label>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" @click="closeCreateSimulator" class="btn-secondary">
              Отказ
            </button>
            <button type="submit" class="btn-primary" :disabled="savingSimulator">
              <i v-if="savingSimulator" class="fas fa-spinner fa-spin"></i>
              <span v-else>{{ editingSimulator ? 'Обнови' : 'Създай' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Tournament Participants Modal -->
    <div v-if="showParticipants" class="modal-overlay" @click="closeParticipants">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Участници в турнира</h3>
          <button @click="closeParticipants" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div v-if="selectedTournament" class="tournament-info-display">
            <h4>{{ selectedTournament.name }}</h4>
            <p>{{ selectedTournament.description }}</p>
            <div class="tournament-stats">
              <span>Участници: {{ participants.length }}/{{ selectedTournament.max_participants }}</span>
              <span>Награда: {{ selectedTournament.prize }} токена</span>
              <span>Цена за записване: {{ selectedTournament.entry_fee || 0 }} токена</span>
            </div>
          </div>
          
          <div v-if="loadingParticipants" class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Зареждане на участници...</span>
          </div>
          
          <div v-else-if="participants.length === 0" class="empty-state">
            <i class="fas fa-users-slash"></i>
            <span>Няма записани участници</span>
          </div>
          
          <div v-else class="participants-table">
            <div class="table-header">
              <div class="col-username">Потребител</div>
              <div class="col-tokens-paid">Платени токени</div>
              <div class="col-registered-at">Дата на записване</div>
            </div>
            
            <div 
              v-for="participant in participants" 
              :key="participant.id"
              class="table-row"
            >
              <div class="col-username">
                <i class="fas fa-user"></i>
                {{ participant.username }}
              </div>
              <div class="col-tokens-paid">
                {{ participant.tokens_paid }} токена
              </div>
              <div class="col-registered-at">
                {{ formatDate(participant.registered_at) }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeParticipants" class="btn-secondary">
            Затвори
          </button>
        </div>
      </div>
    </div>

    <!-- Create Shop Item Modal -->
    <div v-if="showCreateItem" class="modal-overlay" @click="closeCreateItem">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingShopItem ? 'Редактиране на продукт' : 'Създаване на продукт' }}</h3>
          <button @click="closeCreateItem" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="saveShopItem" class="modal-body">
          <div class="form-group">
            <label class="form-label">Име на продукта</label>
            <input 
              v-model="shopItemForm.title" 
              type="text" 
              class="form-input" 
              required 
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Описание</label>
            <textarea 
              v-model="shopItemForm.description" 
              class="form-textarea" 
              rows="4" 
              required
            ></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Категория</label>
              <select v-model="shopItemForm.category" class="form-select">
                <option value="experience">Преживяване</option>
                <option value="equipment">Оборудване</option>
                <option value="training">Обучение</option>
                <option value="premium">Премиум</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Цена (токени)</label>
              <input 
                v-model.number="shopItemForm.price" 
                type="number" 
                class="form-input" 
                min="1"
                required 
              />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Икона</label>
              <input 
                v-model="shopItemForm.icon" 
                type="text" 
                class="form-input" 
                placeholder="🎁"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Наличност (-1 за неограничено)</label>
              <input 
                v-model.number="shopItemForm.stock" 
                type="number" 
                class="form-input" 
                min="-1"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-checkbox">
              <input 
                v-model="shopItemForm.is_active" 
                type="checkbox"
              />
              <span class="checkbox-custom"></span>
              Активен продукт
            </label>
          </div>
          
          <div class="form-group">
            <label class="form-label">URL на изображението</label>
            <input 
              v-model="shopItemForm.image_url" 
              type="text" 
              class="form-input" 
              placeholder="https://example.com/image.jpg"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Функции (разделени със запетая)</label>
            <textarea 
              v-model="shopItemForm.features" 
              class="form-textarea" 
              rows="3" 
              placeholder="Функция 1, Функция 2, Функция 3"
            ></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Оригинална цена</label>
              <input 
                v-model.number="shopItemForm.original_price" 
                type="number" 
                class="form-input" 
                min="0"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Отстъпка (%)</label>
              <input 
                v-model.number="shopItemForm.discount" 
                type="number" 
                class="form-input" 
                min="0"
                max="100"
              />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-checkbox">
                <input 
                  v-model="shopItemForm.popular" 
                  type="checkbox"
                />
                <span class="checkbox-custom"></span>
                Популярен продукт
              </label>
            </div>
            
            <div class="form-group">
              <label class="form-checkbox">
                <input 
                  v-model="shopItemForm.premium" 
                  type="checkbox"
                />
                <span class="checkbox-custom"></span>
                Premium продукт
              </label>
            </div>
            
            <div class="form-group">
              <label class="form-checkbox">
                <input 
                  v-model="shopItemForm.limited" 
                  type="checkbox"
                />
                <span class="checkbox-custom"></span>
                Ограничена наличност
              </label>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" @click="closeCreateItem" class="btn-secondary">
              Отказ
            </button>
            <button type="submit" class="btn-primary" :disabled="savingShopItem">
              <i v-if="savingShopItem" class="fas fa-spinner fa-spin"></i>
              <span v-else>{{ editingShopItem ? 'Обнови' : 'Създай' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Tokens Modal -->
    <div v-if="showAddTokens" class="modal-overlay" @click="closeAddTokens">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Добавяне на токени</h3>
          <button @click="closeAddTokens" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="saveTokens" class="modal-body">
          <div class="user-info-display" v-if="selectedUser">
            <i class="fas fa-user-circle"></i>
            <div>
              <div class="user-name">{{ selectedUser.username }}</div>
              <div class="current-tokens">
                Текущи токени: {{ calculateUserTokens(selectedUser) }}
                <br>
                Изиграно време: {{ Math.floor((selectedUser.total_time_played || 0) / 60) }}ч от {{ selectedUser.sessions_played || 0 }} сесии
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Брой токени за добавяне</label>
            <input 
              v-model.number="tokenForm.amount" 
              type="number" 
              class="form-input" 
              min="1"
              required 
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Описание</label>
            <input 
              v-model="tokenForm.description" 
              type="text" 
              class="form-input" 
              placeholder="Причина за добавянето"
            />
          </div>
          
          <div class="modal-footer">
            <button type="button" @click="closeAddTokens" class="btn-secondary">
              Отказ
            </button>
            <button type="submit" class="btn-primary" :disabled="savingTokens">
              <i v-if="savingTokens" class="fas fa-spinner fa-spin"></i>
              <span v-else>Добави токени</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Create Academy Course Modal -->
    <div v-if="showCreateAcademyCourse" class="modal-overlay" @click="closeCreateAcademyCourse">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingAcademyCourse ? 'Редактиране на курс' : 'Нов курс' }}</h3>
          <button @click="closeCreateAcademyCourse" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="saveAcademyCourse" class="modal-body">
          <div class="form-group">
            <label class="form-label">Заглавие на курса *</label>
            <input 
              v-model="academyCourseForm.title" 
              type="text" 
              class="form-input" 
              required 
              placeholder="Основи на Sim Racing"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Описание *</label>
            <textarea 
              v-model="academyCourseForm.description" 
              class="form-textarea" 
              rows="4" 
              required
              placeholder="Подробно описание на курса..."
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Цена в токени *</label>
              <input 
                v-model.number="academyCourseForm.price_tokens" 
                type="number" 
                class="form-input" 
                min="1"
                required 
                placeholder="200"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Продължителност</label>
              <input 
                v-model="academyCourseForm.duration" 
                type="text" 
                class="form-input" 
                placeholder="45 минути"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Трудност</label>
              <select v-model="academyCourseForm.difficulty" class="form-select">
                <option value="beginner">За начинаещи</option>
                <option value="intermediate">За напреднали</option>
                <option value="advanced">За експерти</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Категория</label>
              <select v-model="academyCourseForm.category_id" class="form-select">
                <option value="">Изберете категория</option>
                <option 
                  v-for="category in academyCategories" 
                  :key="category.id" 
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">URL на thumbnail изображението</label>
            <input 
              v-model="academyCourseForm.thumbnail_url" 
              type="url" 
              class="form-input" 
              placeholder="https://example.com/course-thumbnail.jpg"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">YouTube URL (unlisted) *</label>
            <input 
              v-model="academyCourseForm.youtube_url" 
              type="url" 
              class="form-input" 
              required
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <small class="form-hint">Използвайте unlisted YouTube видео за курса</small>
          </div>

          <div class="form-group">
            <label class="form-checkbox">
              <input 
                v-model="academyCourseForm.is_active" 
                type="checkbox"
              />
              <span class="checkbox-custom"></span>
              Активен курс
            </label>
          </div>
          
          <div class="modal-footer">
            <button type="button" @click="closeCreateAcademyCourse" class="btn-secondary">
              Отказ
            </button>
            <button type="submit" class="btn-primary" :disabled="savingAcademyCourse">
              <i v-if="savingAcademyCourse" class="fas fa-spinner fa-spin"></i>
              <span v-else>{{ editingAcademyCourse ? 'Обнови' : 'Създай' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Create Academy Category Modal -->
    <div v-if="showCreateAcademyCategory" class="modal-overlay" @click="closeCreateAcademyCategory">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingAcademyCategory ? 'Редактиране на категория' : 'Нова категория' }}</h3>
          <button @click="closeCreateAcademyCategory" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="saveAcademyCategory" class="modal-body">
          <div class="form-group">
            <label class="form-label">Име на категорията *</label>
            <input 
              v-model="academyCategoryForm.name" 
              type="text" 
              class="form-input" 
              required 
              placeholder="Основи на управлението"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Описание</label>
            <textarea 
              v-model="academyCategoryForm.description" 
              class="form-textarea" 
              rows="3" 
              placeholder="Кратко описание на категорията..."
            ></textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">Икона (Font Awesome класс)</label>
            <input 
              v-model="academyCategoryForm.icon" 
              type="text" 
              class="form-input" 
              placeholder="fas fa-steering-wheel"
            />
            <small class="form-hint">Използвайте Font Awesome 5 класове (например: fas fa-car, fas fa-tachometer-alt)</small>
          </div>
          
          <div class="modal-footer">
            <button type="button" @click="closeCreateAcademyCategory" class="btn-secondary">
              Отказ
            </button>
            <button type="submit" class="btn-primary" :disabled="savingAcademyCategory">
              <i v-if="savingAcademyCategory" class="fas fa-spinner fa-spin"></i>
              <span v-else>{{ editingAcademyCategory ? 'Обнови' : 'Създай' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { netcafeAPI } from '../api/netcafe-api'
import Modal from '../components/Modal.vue'

export default {
  name: 'AdminPanel',
  components: {
    Modal
  },
  setup() {
    const authStore = useAuthStore()
    
    const activeTab = ref('posts')
    const loading = reactive({
      posts: false,
      tournaments: false,
      bookings: false,
      simulators: false,
      shop: false,
      users: false,
      academy: false,
      academyCategories: false,
      stats: false
    })
    
    const error = reactive({
      posts: null,
      tournaments: null,
      bookings: null,
      simulators: null,
      shop: null,
      users: null,
      academy: null,
      academyCategories: null,
      stats: null
    })
    
    const posts = ref([])
    const tournaments = ref([])
    const bookings = ref([])
    const simulators = ref([])
    const shopItems = ref([])
    const users = ref([])
    const academyCourses = ref([])
    const academyCategories = ref([])
    const stats = ref({})
    
    const showCreatePost = ref(false)
    const showCreateTournament = ref(false)
    const showCreateSimulator = ref(false)
    const showCreateItem = ref(false)
    const showAddTokens = ref(false)
    const showParticipants = ref(false)
    const showCreateAcademyCourse = ref(false)
    const showCreateAcademyCategory = ref(false)
    const editingPost = ref(null)
    const editingTournament = ref(null)
    const editingSimulator = ref(null)
    const editingShopItem = ref(null)
    const editingAcademyCourse = ref(null)
    const editingAcademyCategory = ref(null)
    const selectedUser = ref(null)
    const selectedTournament = ref(null)
    const participants = ref([])
    const loadingParticipants = ref(false)
    
    const savingPost = ref(false)
    const savingTournament = ref(false)
    const savingSimulator = ref(false)
    const savingShopItem = ref(false)
    const savingTokens = ref(false)
    const savingAcademyCourse = ref(false)
    const savingAcademyCategory = ref(false)
    
    const postForm = reactive({
      title: '',
      content: '',
      category: 'news',
      featured: false
    })
    
    const tournamentForm = reactive({
      name: '',
      description: '',
      date: '',
      time: '',
      prize: 0,
      entry_fee: 0,
      maxParticipants: 8,
      status: 'upcoming',
      image_url: '', // Add image URL field
      featured: false, // Add featured field for highlighting special tournaments
      game_type: 'racing', // Add game type field
      difficulty: 'medium' // Add difficulty level field
    })
    
    const simulatorForm = reactive({
      name: '',
      description: '',
      specs: '',
      gpu: '',
      setup_type: 'full_set',
      has_motion: false,
      has_vr: false,
      screen_setup: 'single',
      image_url: '',
      status: 'available'
    })
    
    const shopItemForm = reactive({
      title: '',
      description: '',
      category: 'experience',
      price: 0,
      icon: '🎁',
      stock: -1,
      is_active: true,
      image_url: '',
      popular: false,
      premium: false,
      limited: false,
      features: '',
      original_price: 0,
      discount: 0
    })
    
    const tokenForm = reactive({
      amount: 0,
      description: ''
    })
    
    const academyCourseForm = reactive({
      title: '',
      description: '',
      price_tokens: 0,
      thumbnail_url: '',
      youtube_url: '',
      duration: '',
      difficulty: 'beginner',
      category_id: null,
      is_active: true
    })
    
    const academyCategoryForm = reactive({
      name: '',
      description: '',
      icon: 'fas fa-graduation-cap'
    })
    

    
    const adminTabs = ref([
      { id: 'posts', name: 'Новини', icon: 'fas fa-newspaper' },
      { id: 'tournaments', name: 'Турнири', icon: 'fas fa-trophy' },
      { id: 'bookings', name: 'Резервации', icon: 'fas fa-calendar-alt' },
      { id: 'simulators', name: 'Симулатори', icon: 'fas fa-racing-gear' },
      { id: 'shop', name: 'Магазин', icon: 'fas fa-store' },
      { id: 'users', name: 'Потребители', icon: 'fas fa-users' },
      { id: 'academy', name: 'Академия', icon: 'fas fa-graduation-cap' },
      { id: 'stats', name: 'Статистики', icon: 'fas fa-chart-bar' }
    ])
    
    // Methods
    const loadPosts = async () => {
      loading.posts = true
      error.posts = null
      try {
        const response = await netcafeAPI.getPosts()
        if (response.success) {
          posts.value = response.posts || []
        } else {
          error.posts = response.error || 'Грешка при зареждане на новините'
        }
      } catch (err) {
        console.error('Error loading posts:', err)
        error.posts = 'Грешка при свързване със сървъра'
      } finally {
        loading.posts = false
      }
    }
    
    const loadShopItems = async () => {
      loading.shop = true
      error.shop = null
      try {
        const response = await netcafeAPI.getShopItems()
        if (response.success) {
          shopItems.value = response.items || []
        } else {
          error.shop = response.error || 'Грешка при зареждане на продуктите'
        }
      } catch (err) {
        console.error('Error loading shop items:', err)
        error.shop = 'Грешка при свързване със сървъра'
      } finally {
        loading.shop = false
      }
    }
    
    const loadUsers = async () => {
      loading.users = true
      error.users = null
      try {
        // Get users data from admin endpoint (includes calculated tokens)
        const usersResponse = await netcafeAPI.getUsers()
        
        if (usersResponse.success) {
          const usersData = usersResponse.users || []
          
          // Backend now calculates tokens automatically (100 per hour with tier multiplier)
          users.value = usersData.map(user => {
            const realMinutes = user.total_time_played || 0
            const hours = realMinutes / 60
            const xp = Math.floor(hours * 100) // 100 XP per hour
            
            // Determine level based on XP
            let level = 'Rookie'
            if (xp >= 1600) level = 'Unreal'
            else if (xp >= 1000) level = 'Elite'
            else if (xp >= 450) level = 'Pro'
            else if (xp >= 150) level = 'Intermediate'
            else if (xp >= 50) level = 'Novice'
            
            return {
              ...user,
              xp: xp,
              level: level
              // tokens are already calculated in backend
            }
          })
        } else {
          error.users = 'Грешка при зареждане на потребителите'
        }
      } catch (err) {
        console.error('Error loading users:', err)
        error.users = 'Грешка при свързване със сървъра'
      } finally {
        loading.users = false
      }
    }
    
    const loadTournaments = async () => {
      loading.tournaments = true
      error.tournaments = null
      try {
        console.log('🔄 Loading tournaments...')
        const response = await netcafeAPI.getTournaments()
        console.log('📨 Tournaments response:', response)
        
        if (response.success) {
          // Flatten tournament data structure for admin panel
          const allTournaments = [
            ...(response.tournaments?.active || []),
            ...(response.tournaments?.upcoming || []),
            ...(response.tournaments?.completed || [])
          ]
          
          // Fix data mapping for admin panel
          tournaments.value = allTournaments.map(tournament => ({
            ...tournament,
            date: tournament.date || tournament.start_date,
            prize: tournament.prize || tournament.prize_pool || tournament.first_prize,
            participants: tournament.registered_participants || tournament.participants || 0
          }))
          
          console.log('✅ Tournaments loaded:', tournaments.value.length)
        } else {
          console.error('❌ Failed to load tournaments:', response.error)
          throw new Error(response.error || 'Failed to load tournaments')
        }
      } catch (err) {
        console.error('❌ Error loading tournaments:', err)
        error.tournaments = 'Грешка при зареждане на турнирите: ' + err.message
      } finally {
        loading.tournaments = false
      }
    }

    const loadBookings = async () => {
      loading.bookings = true
      error.bookings = null
      try {
        console.log('🔄 Loading bookings...')
        const response = await netcafeAPI.get('/admin/bookings')
        console.log('📨 Bookings response:', response)
        
        if (response.success) {
          bookings.value = response.bookings || []
          console.log('✅ Bookings loaded:', bookings.value.length)
        } else {
          throw new Error(response.message || 'Failed to load bookings')
        }
      } catch (err) {
        console.error('❌ Error loading bookings:', err)
        error.bookings = 'Грешка при зареждане на резервациите: ' + err.message
      } finally {
        loading.bookings = false
      }
    }

    const loadSimulators = async () => {
      loading.simulators = true
      error.simulators = null
      try {
        const response = await netcafeAPI.get('/simulators')
        
        if (response.success) {
          simulators.value = response.simulators || []
        } else {
          throw new Error(response.message || 'Failed to load simulators')
        }
      } catch (err) {
        console.error('❌ Error loading simulators:', err)
        error.simulators = 'Грешка при зареждане на симулаторите: ' + err.message
      } finally {
        loading.simulators = false
      }
    }

    const saveSimulator = async () => {
      if (!simulatorForm.name || !simulatorForm.specs || !simulatorForm.gpu) {
        alert('Моля попълнете всички задължителни полета')
        return
      }

      savingSimulator.value = true
      try {
        const simulatorData = {
          name: simulatorForm.name,
          description: simulatorForm.description,
          specs: simulatorForm.specs,
          gpu: simulatorForm.gpu,
          setup_type: simulatorForm.setup_type,
          has_motion: simulatorForm.has_motion,
          has_vr: simulatorForm.has_vr,
          screen_setup: simulatorForm.screen_setup,
          image_url: simulatorForm.image_url,
          status: simulatorForm.status
        }

        let response
        if (editingSimulator.value) {
          response = await netcafeAPI.put(`/admin/simulators/${editingSimulator.value.id}`, simulatorData)
          console.log('✏️ Simulator updated:', response)
        } else {
          response = await netcafeAPI.post('/admin/simulators', simulatorData)
          console.log('➕ Simulator created:', response)
        }

        if (response.success) {
          await loadSimulators()
          closeCreateSimulator()
          alert(editingSimulator.value ? 'Симулаторът е обновен успешно!' : 'Симулаторът е създаден успешно!')
        } else {
          throw new Error(response.message || 'Failed to save simulator')
        }
      } catch (err) {
        console.error('❌ Error saving simulator:', err)
        alert('Грешка при запазване на симулатора: ' + err.message)
      } finally {
        savingSimulator.value = false
      }
    }

    const editSimulator = (simulator) => {
      editingSimulator.value = simulator
      simulatorForm.name = simulator.name
      simulatorForm.description = simulator.description || ''
      simulatorForm.specs = simulator.specs
      simulatorForm.gpu = simulator.gpu
      simulatorForm.setup_type = simulator.setup_type
      simulatorForm.has_motion = Boolean(simulator.has_motion)
      simulatorForm.has_vr = Boolean(simulator.has_vr)
      simulatorForm.screen_setup = simulator.screen_setup
      simulatorForm.image_url = simulator.image_url || ''
      simulatorForm.status = simulator.status
      showCreateSimulator.value = true
    }

    const deleteSimulator = async (simulatorId) => {
      if (!confirm('Сигурни ли сте, че искате да изтриете този симулатор?')) {
        return
      }

      try {
        const response = await netcafeAPI.delete(`/admin/simulators/${simulatorId}`)
        console.log('🗑️ Simulator deleted:', response)
        
        if (response.success) {
          await loadSimulators()
          alert('Симулаторът е изтрит успешно!')
        } else {
          throw new Error(response.message || 'Failed to delete simulator')
        }
      } catch (err) {
        console.error('❌ Error deleting simulator:', err)
        alert('Грешка при изтриване на симулатора: ' + err.message)
      }
    }

    const closeCreateSimulator = () => {
      showCreateSimulator.value = false
      editingSimulator.value = null
      simulatorForm.name = ''
      simulatorForm.description = ''
      simulatorForm.specs = ''
      simulatorForm.gpu = ''
      simulatorForm.setup_type = 'full_set'
      simulatorForm.has_motion = false
      simulatorForm.has_vr = false
      simulatorForm.screen_setup = 'single'
      simulatorForm.image_url = ''
      simulatorForm.status = 'available'
    }

    const getSetupTypeText = (setupType) => {
      const types = {
        'wheel_only': 'Само волан',
        'full_set': 'Пълен сет',
        'motion': 'Motion Platform'
      }
      return types[setupType] || setupType
    }

    const getScreenSetupText = (screenSetup) => {
      const setups = {
        'single': 'Single Screen',
        'triple': 'Triple Screen',
        'ultrawide': 'Ultrawide',
        'vr': 'VR Headset'
      }
      return setups[screenSetup] || screenSetup
    }
    
    const loadStats = async () => {
      loading.stats = true
      error.stats = null
      try {
        const [statsResponse, leaderboardResponse] = await Promise.all([
          netcafeAPI.getStats(),
          netcafeAPI.getLeaderboard(100)
        ])
        
        if (statsResponse.success) {
          const baseStats = statsResponse.stats || {}
          
          // Calculate real total time from leaderboard
          let totalRealTime = 0
          if (leaderboardResponse.success && leaderboardResponse.leaderboard) {
            totalRealTime = leaderboardResponse.leaderboard.reduce((sum, entry) => {
              return sum + (entry.total_time_minutes || 0)
            }, 0)
          }
          
          stats.value = {
            ...baseStats,
            total_time: totalRealTime, // Override with real playtime
            real_total_time: totalRealTime
          }
        } else {
          error.stats = 'Грешка при зареждане на статистиките'
        }
      } catch (err) {
        console.error('Error loading stats:', err)
        error.stats = 'Грешка при свързване със сървъра'
      } finally {
        loading.stats = false
      }
    }
    
    // Academy functions
    const loadAcademyCourses = async () => {
      loading.academy = true
      error.academy = null
      try {
        const response = await netcafeAPI.getAdminAcademyCourses()
        if (response.success) {
          academyCourses.value = response.courses || []
        } else {
          error.academy = response.message || 'Грешка при зареждане на курсовете'
        }
      } catch (err) {
        console.error('Error loading academy courses:', err)
        error.academy = 'Грешка при свързване със сървъра'
      } finally {
        loading.academy = false
      }
    }
    
    const loadAcademyCategories = async () => {
      loading.academyCategories = true
      error.academyCategories = null
      try {
        const response = await netcafeAPI.getAdminAcademyCategories()
        if (response.success) {
          academyCategories.value = response.categories || []
        } else {
          error.academyCategories = response.message || 'Грешка при зареждане на категориите'
        }
      } catch (err) {
        console.error('Error loading academy categories:', err)
        error.academyCategories = 'Грешка при свързване със сървъра'
      } finally {
        loading.academyCategories = false
      }
    }
    
    const getCategoryName = (categoryId) => {
      const category = academyCategories.value.find(cat => cat.id === categoryId)
      return category ? category.name : 'Няма категория'
    }
    
    const getCategoryIcon = (categoryId) => {
      const category = academyCategories.value.find(cat => cat.id === categoryId)
      return category ? category.icon : 'fas fa-graduation-cap'
    }
    
    const getDifficultyText = (difficulty) => {
      const difficultyTexts = {
        'beginner': 'За начинаещи',
        'intermediate': 'За напреднали', 
        'advanced': 'За експерти'
      }
      return difficultyTexts[difficulty] || difficulty
    }
    
    const editPost = (post) => {
      editingPost.value = post
      postForm.title = post.title
      postForm.content = post.content
      postForm.category = post.category
      postForm.featured = post.featured
      showCreatePost.value = true
    }
    
    const closeCreatePost = () => {
      showCreatePost.value = false
      editingPost.value = null
      postForm.title = ''
      postForm.content = ''
      postForm.category = 'news'
      postForm.featured = false
    }
    
    const savePost = async () => {
      savingPost.value = true
      
      try {
        let response
        if (editingPost.value) {
          response = await netcafeAPI.updatePost(editingPost.value.id, postForm)
        } else {
          response = await netcafeAPI.createPost(postForm)
        }
        
        if (response.success) {
          await loadPosts()
          closeCreatePost()
        } else {
          alert('Грешка при запазването: ' + response.message)
        }
      } catch (error) {
        console.error('Error saving post:', error)
        alert('Грешка при запазването на новината')
      } finally {
        savingPost.value = false
      }
    }
    
    const deletePost = async (postId) => {
      if (!confirm('Сигурни ли сте, че искате да изтриете тази новина?')) return
      
      try {
        const response = await netcafeAPI.deletePost(postId)
        if (response.success) {
          await loadPosts()
        } else {
          alert('Грешка при изтриването: ' + response.message)
        }
      } catch (error) {
        console.error('Error deleting post:', error)
        alert('Грешка при изтриването на новината')
      }
    }
    
    // Tournament functions
    const editTournament = (tournament) => {
      editingTournament.value = tournament
      tournamentForm.name = tournament.name
      tournamentForm.description = tournament.description
      
      // Split datetime into date and time
      const eventDate = new Date(tournament.date)
      tournamentForm.date = eventDate.toISOString().split('T')[0]
      tournamentForm.time = eventDate.toTimeString().slice(0, 5)
      
      tournamentForm.prize = tournament.prize
      tournamentForm.entry_fee = tournament.entry_fee || 0
      tournamentForm.maxParticipants = tournament.max_participants
      tournamentForm.status = tournament.status
      tournamentForm.image_url = tournament.image_url || ''
      tournamentForm.featured = tournament.featured || false
      tournamentForm.game_type = tournament.game_type || 'racing'
      tournamentForm.difficulty = tournament.difficulty || 'medium'
      showCreateTournament.value = true
    }
    
    const closeCreateTournament = () => {
      showCreateTournament.value = false
      editingTournament.value = null
      tournamentForm.name = ''
      tournamentForm.description = ''
      tournamentForm.date = ''
      tournamentForm.time = ''
      tournamentForm.prize = 0
      tournamentForm.entry_fee = 0
      tournamentForm.maxParticipants = 8
      tournamentForm.status = 'upcoming'
      tournamentForm.image_url = ''
      tournamentForm.featured = false
      tournamentForm.game_type = 'racing'
      tournamentForm.difficulty = 'medium'
    }
    
    const saveTournament = async () => {
      savingTournament.value = true
      
      try {
        console.log('🔄 Saving tournament with data:', tournamentForm)
        
        // Combine date and time for server
        const datetime = `${tournamentForm.date}T${tournamentForm.time}:00`
        const tournamentData = {
          name: tournamentForm.name,
          description: tournamentForm.description,
          date: datetime,
          prize: tournamentForm.prize,
          entry_fee: tournamentForm.entry_fee,
          max_participants: tournamentForm.maxParticipants,
          status: tournamentForm.status,
          image_url: tournamentForm.image_url,
          featured: tournamentForm.featured,
          game_type: tournamentForm.game_type,
          difficulty: tournamentForm.difficulty
        }
        
        console.log('📤 Sending tournament data:', tournamentData)
        
        let response
        if (editingTournament.value) {
          console.log('✏️ Updating tournament:', editingTournament.value.id)
          response = await netcafeAPI.updateTournament(editingTournament.value.id, tournamentData)
        } else {
          console.log('➕ Creating new tournament')
          response = await netcafeAPI.createTournament(tournamentData)
        }
        
        console.log('📨 Tournament save response:', response)
        
        if (response.success) {
          console.log('✅ Tournament saved successfully!')
          alert(`✅ Турнирът беше ${editingTournament.value ? 'обновен' : 'създаден'} успешно!`)
          await loadTournaments()
          closeCreateTournament()
        } else {
          console.error('❌ Tournament save failed:', response.message)
          alert('❌ Грешка при запазването: ' + response.message)
        }
      } catch (error) {
        console.error('❌ Error saving tournament:', error)
        if (error.response) {
          console.error('Response data:', error.response.data)
          alert('❌ Грешка от сървъра: ' + (error.response.data?.message || error.response.status))
        } else if (error.request) {
          alert('❌ Няма връзка със сървъра. Моля, проверете дали backend сървърът работи.')
        } else {
          alert('❌ Грешка при запазването на турнира: ' + error.message)
        }
      } finally {
        savingTournament.value = false
      }
    }
    
    const deleteTournament = async (tournamentId) => {
      if (!confirm('Сигурни ли сте, че искате да изтриете този турнир?')) return
      
      try {
        console.log('🗑️ Deleting tournament:', tournamentId)
        const response = await netcafeAPI.deleteTournament(tournamentId)
        console.log('📨 Delete response:', response)
        
        if (response.success) {
          console.log('✅ Tournament deleted successfully!')
          alert('✅ Турнирът беше изтрит успешно!')
          await loadTournaments()
        } else {
          console.error('❌ Tournament deletion failed:', response.message)
          alert('❌ Грешка при изтриването: ' + response.message)
        }
      } catch (error) {
        console.error('❌ Error deleting tournament:', error)
        if (error.response) {
          console.error('Response data:', error.response.data)
          alert('❌ Грешка от сървъра: ' + (error.response.data?.message || error.response.status))
        } else if (error.request) {
          alert('❌ Няма връзка със сървъра. Моля, проверете дали backend сървърът работи.')
        } else {
          alert('❌ Грешка при изтриването на турнира: ' + error.message)
        }
      }
    }
    
    const getStatusText = (status) => {
      const statusTexts = {
        'upcoming': 'Предстоящ',
        'active': 'Активен',
        'completed': 'Завършен'
      }
      return statusTexts[status] || status
    }

    const getBookingStatusText = (status) => {
      const statusTexts = {
        'pending': 'Изчакваща',
        'confirmed': 'Потвърдена',
        'cancelled': 'Отменена',
        'completed': 'Завършена'
      }
      return statusTexts[status] || status
    }

    const updateBookingStatus = async (bookingId, newStatus) => {
      try {
        const response = await netcafeAPI.put(`/admin/bookings/${bookingId}/status`, {
          status: newStatus
        })
        
        if (response.success) {
          await loadBookings()
          alert('✅ Статусът на резервацията е обновен!')
        } else {
          alert('❌ Грешка при обновяването: ' + response.message)
        }
      } catch (error) {
        console.error('Error updating booking status:', error)
        alert('❌ Грешка при обновяването на статуса')
      }
    }

    const deleteBooking = async (bookingId) => {
      if (!confirm('Сигурни ли сте, че искате да изтриете тази резервация?')) return
      
      try {
        const response = await netcafeAPI.delete(`/admin/bookings/${bookingId}`)
        
        if (response.success) {
          await loadBookings()
          alert('✅ Резервацията е изтрита успешно!')
        } else {
          alert('❌ Грешка при изтриването: ' + response.message)
        }
      } catch (error) {
        console.error('Error deleting booking:', error)
        alert('❌ Грешка при изтриването на резервацията')
      }
    }
    
    const addTokensToUser = (user) => {
      selectedUser.value = user
      tokenForm.amount = 0
      tokenForm.description = ''
      showAddTokens.value = true
    }
    
    const closeAddTokens = () => {
      showAddTokens.value = false
      selectedUser.value = null
    }

    const viewParticipants = async (tournament) => {
      selectedTournament.value = tournament
      participants.value = []
      showParticipants.value = true
      loadingParticipants.value = true
      
      try {
        const response = await netcafeAPI.getTournamentParticipants(tournament.id)
        if (response.success) {
          participants.value = response.participants || []
        } else {
          alert('Грешка при зареждането на участниците: ' + response.message)
        }
      } catch (error) {
        console.error('Error loading participants:', error)
        alert('Грешка при зареждането на участниците')
      } finally {
        loadingParticipants.value = false
      }
    }

    const closeParticipants = () => {
      showParticipants.value = false
      selectedTournament.value = null
      participants.value = []
    }
    
    const saveTokens = async () => {
      if (!selectedUser.value || tokenForm.amount <= 0) {
        alert('Моля, въведете валиден брой токени')
        return
      }
      
      savingTokens.value = true
      
      try {
        console.log('Adding tokens:', {
          userId: selectedUser.value.id,
          amount: tokenForm.amount,
          description: tokenForm.description
        })
        
        const response = await netcafeAPI.addTokensToUser(
          selectedUser.value.id,
          tokenForm.amount,
          tokenForm.description || 'Администраторско добавяне'
        )
        
        console.log('API Response:', response)
        
        if (response.success) {
          alert(`Успешно добавени ${tokenForm.amount} токени на ${selectedUser.value.username}`)
          await loadUsers()
          closeAddTokens()
        } else {
          // Handle specific error cases
          if (response.needsReauth) {
            if (confirm('Сесията е изтекла. Искате ли да влезете отново?')) {
              // Redirect to login or refresh the page
              window.location.reload()
            }
          } else {
          alert('Грешка при добавянето: ' + (response.message || 'Неизвестна грешка'))
          }
        }
      } catch (error) {
        console.error('Error adding tokens:', error)
        if (error.response) {
          console.error('Response error:', error.response.data)
          alert('Грешка от сървъра: ' + (error.response.data.message || error.response.status))
        } else if (error.request) {
          alert('Няма връзка със сървъра. Моля, проверете дали backend сървърът работи.')
        } else {
          alert('Грешка при заявката: ' + error.message)
        }
      } finally {
        savingTokens.value = false
      }
    }
    
    const truncate = (text, length) => {
      if (!text) return ''
      return text.length > length ? text.substring(0, length) + '...' : text
    }
    
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('bg-BG')
    }
    

    
    const calculateUserTokens = (user) => {
      // Tokens are now calculated in backend based on playtime
      // 100 tokens per hour with tier multiplier
      return user?.tokens || 0
    }
    
    const calculateTotalTokens = () => {
      if (!users.value || users.value.length === 0) return 0
      return users.value.reduce((total, user) => {
        return total + calculateUserTokens(user)
      }, 0)
    }
    
    // Shop Management Functions
    const editShopItem = (item) => {
      editingShopItem.value = item
      shopItemForm.title = item.title
      shopItemForm.description = item.description
      shopItemForm.category = item.category
      shopItemForm.price = item.price
      shopItemForm.icon = item.icon
      shopItemForm.stock = item.stock
      shopItemForm.is_active = item.is_active
      shopItemForm.image_url = item.image_url || ''
      shopItemForm.popular = item.popular || false
      shopItemForm.premium = item.premium || false
      shopItemForm.limited = item.limited || false
      shopItemForm.features = item.features || ''
      shopItemForm.original_price = item.original_price || 0
      shopItemForm.discount = item.discount || 0
      showCreateItem.value = true
    }

    const closeCreateItem = () => {
      showCreateItem.value = false
      editingShopItem.value = null
      shopItemForm.title = ''
      shopItemForm.description = ''
      shopItemForm.category = 'experience'
      shopItemForm.price = 0
      shopItemForm.icon = '🎁'
      shopItemForm.stock = -1
      shopItemForm.is_active = true
      shopItemForm.image_url = ''
      shopItemForm.popular = false
      shopItemForm.premium = false
      shopItemForm.limited = false
      shopItemForm.features = ''
      shopItemForm.original_price = 0
      shopItemForm.discount = 0
    }

    const saveShopItem = async () => {
      savingShopItem.value = true
      
      try {
        console.log('🔄 Saving shop item with data:', shopItemForm)
        
        let response
        if (editingShopItem.value) {
          console.log('✏️ Updating shop item:', editingShopItem.value.id)
          response = await netcafeAPI.updateShopItem(editingShopItem.value.id, shopItemForm)
        } else {
          console.log('➕ Creating new shop item')
          response = await netcafeAPI.createShopItem(shopItemForm)
        }
        
        console.log('📨 Shop item save response:', response)
        
        if (response.success) {
          console.log('✅ Shop item saved successfully!')
          alert(`✅ Продуктът беше ${editingShopItem.value ? 'обновен' : 'създаден'} успешно!`)
          await loadShopItems()
          closeCreateItem()
        } else {
          console.error('❌ Shop item save failed:', response.message)
          alert('❌ Грешка при запазването: ' + response.message)
        }
      } catch (error) {
        console.error('❌ Error saving shop item:', error)
        alert('❌ Грешка при запазването на продукта: ' + error.message)
      } finally {
        savingShopItem.value = false
      }
    }

    const deleteShopItem = async (itemId) => {
      if (!confirm('Сигурни ли сте, че искате да изтриете този продукт?')) return
      
      try {
        console.log('🗑️ Deleting shop item:', itemId)
        const response = await netcafeAPI.deleteShopItem(itemId)
        console.log('📨 Delete response:', response)
        
        if (response.success) {
          console.log('✅ Shop item deleted successfully!')
          alert('✅ Продуктът беше изтрит успешно!')
          await loadShopItems()
        } else {
          console.error('❌ Shop item deletion failed:', response.message)
          alert('❌ Грешка при изтриването: ' + response.message)
        }
      } catch (error) {
        console.error('❌ Error deleting shop item:', error)
        alert('❌ Грешка при изтриването на продукта: ' + error.message)
      }
    }

    // Academy Course functions
    const editAcademyCourse = (course) => {
      editingAcademyCourse.value = course
      academyCourseForm.title = course.title
      academyCourseForm.description = course.description
      academyCourseForm.price_tokens = course.price_tokens
      academyCourseForm.thumbnail_url = course.thumbnail_url || ''
      academyCourseForm.youtube_url = course.youtube_url
      academyCourseForm.duration = course.duration || ''
      academyCourseForm.difficulty = course.difficulty
      academyCourseForm.category_id = course.category_id
      academyCourseForm.is_active = course.is_active
      showCreateAcademyCourse.value = true
    }
    
    const closeCreateAcademyCourse = () => {
      showCreateAcademyCourse.value = false
      editingAcademyCourse.value = null
      academyCourseForm.title = ''
      academyCourseForm.description = ''
      academyCourseForm.price_tokens = 0
      academyCourseForm.thumbnail_url = ''
      academyCourseForm.youtube_url = ''
      academyCourseForm.duration = ''
      academyCourseForm.difficulty = 'beginner'
      academyCourseForm.category_id = null
      academyCourseForm.is_active = true
    }
    
    const saveAcademyCourse = async () => {
      savingAcademyCourse.value = true
      
      try {
        let response
        if (editingAcademyCourse.value) {
          response = await netcafeAPI.updateAcademyCourse(editingAcademyCourse.value.id, academyCourseForm)
        } else {
          response = await netcafeAPI.createAcademyCourse(academyCourseForm)
        }
        
        if (response.success) {
          alert(`✅ Курсът беше ${editingAcademyCourse.value ? 'обновен' : 'създаден'} успешно!`)
          await loadAcademyCourses()
          closeCreateAcademyCourse()
        } else {
          alert('❌ Грешка при запазването: ' + response.message)
        }
      } catch (error) {
        console.error('❌ Error saving academy course:', error)
        alert('❌ Грешка при запазването на курса: ' + error.message)
      } finally {
        savingAcademyCourse.value = false
      }
    }
    
    const deleteAcademyCourse = async (courseId) => {
      if (!confirm('Сигурни ли сте, че искате да изтриете този курс?')) return
      
      try {
        const response = await netcafeAPI.deleteAcademyCourse(courseId)
        
        if (response.success) {
          alert('✅ Курсът беше изтрит успешно!')
          await loadAcademyCourses()
        } else {
          alert('❌ Грешка при изтриването: ' + response.message)
        }
      } catch (error) {
        console.error('❌ Error deleting academy course:', error)
        alert('❌ Грешка при изтриването на курса: ' + error.message)
      }
    }
    
    // Academy Category functions
    const editAcademyCategory = (category) => {
      editingAcademyCategory.value = category
      academyCategoryForm.name = category.name
      academyCategoryForm.description = category.description
      academyCategoryForm.icon = category.icon
      showCreateAcademyCategory.value = true
    }
    
    const closeCreateAcademyCategory = () => {
      showCreateAcademyCategory.value = false
      editingAcademyCategory.value = null
      academyCategoryForm.name = ''
      academyCategoryForm.description = ''
      academyCategoryForm.icon = 'fas fa-graduation-cap'
    }
    
    const saveAcademyCategory = async () => {
      savingAcademyCategory.value = true
      
      try {
        let response
        if (editingAcademyCategory.value) {
          response = await netcafeAPI.updateAcademyCategory(editingAcademyCategory.value.id, academyCategoryForm)
        } else {
          response = await netcafeAPI.createAcademyCategory(academyCategoryForm)
        }
        
        if (response.success) {
          alert(`✅ Категорията беше ${editingAcademyCategory.value ? 'обновена' : 'създадена'} успешно!`)
          await loadAcademyCategories()
          closeCreateAcademyCategory()
        } else {
          alert('❌ Грешка при запазването: ' + response.message)
        }
      } catch (error) {
        console.error('❌ Error saving academy category:', error)
        alert('❌ Грешка при запазването на категорията: ' + error.message)
      } finally {
        savingAcademyCategory.value = false
      }
    }
    
    const deleteAcademyCategory = async (categoryId) => {
      if (!confirm('Сигурни ли сте, че искате да изтриете тази категория?')) return
      
      try {
        const response = await netcafeAPI.deleteAcademyCategory(categoryId)
        
        if (response.success) {
          alert('✅ Категорията беше изтрита успешно!')
          await loadAcademyCategories()
          await loadAcademyCourses() // Reload courses too since they might reference this category
        } else {
          alert('❌ Грешка при изтриването: ' + response.message)
        }
      } catch (error) {
        console.error('❌ Error deleting academy category:', error)
        alert('❌ Грешка при изтриването на категорията: ' + error.message)
      }
    }

    // Load data based on active tab
    const loadTabData = () => {
      switch (activeTab.value) {
        case 'posts':
          loadPosts()
          break
        case 'tournaments':
          loadTournaments()
          break
        case 'bookings':
          loadBookings()
          break
        case 'simulators':
          loadSimulators()
          break
        case 'shop':
          loadShopItems()
          break
        case 'users':
          loadUsers()
          break
        case 'academy':
          loadAcademyCourses()
          loadAcademyCategories()
          break
        case 'stats':
          loadStats()
          break
      }
    }
    
    onMounted(async () => {
      // Check authentication first
      await authStore.checkAuth()
      
      // Only load data if user is authenticated and is admin
      if (authStore.isLoggedIn && authStore.user?.is_admin) {
        loadTabData()
      } else {
        console.warn('User is not authenticated or not admin')
      }
    })
    
    // Watch for tab changes
    let previousTab = activeTab.value
    const checkTabChange = () => {
      if (activeTab.value !== previousTab) {
        previousTab = activeTab.value
        loadTabData()
      }
      requestAnimationFrame(checkTabChange)
    }
    checkTabChange()
    

    
    return {
      authStore,
      activeTab,
      loading,
      error,
      posts,
      tournaments,
      bookings,
      simulators,
      shopItems,
      users,
      academyCourses,
      academyCategories,
      stats,
      showCreatePost,
      showCreateTournament,
      showCreateSimulator,
      showCreateItem,
      showAddTokens,
      showParticipants,
      showCreateAcademyCourse,
      showCreateAcademyCategory,
      editingPost,
      editingTournament,
      editingSimulator,
      editingAcademyCourse,
      editingAcademyCategory,
      selectedUser,
      selectedTournament,
      participants,
      loadingParticipants,
      savingPost,
      savingTournament,
      savingSimulator,
      savingShopItem,
      savingTokens,
      savingAcademyCourse,
      savingAcademyCategory,
      editingShopItem,
      postForm,
      tournamentForm,
      simulatorForm,
      shopItemForm,
      tokenForm,
      academyCourseForm,
      academyCategoryForm,
      adminTabs,
      editPost,
      closeCreatePost,
      savePost,
      deletePost,
      editTournament,
      closeCreateTournament,
      saveTournament,
      deleteTournament,
      editShopItem,
      closeCreateItem,
      saveShopItem,
      deleteShopItem,
      viewParticipants,
      closeParticipants,
      getStatusText,
      getBookingStatusText,
      updateBookingStatus,
      deleteBooking,
      addTokensToUser,
      closeAddTokens,
      saveTokens,
      loadStats,
      loadPosts,
      loadTournaments,
      loadBookings,
      loadSimulators,
      loadShopItems,
      loadUsers,
      truncate,
      formatDate,
      calculateUserTokens,
      calculateTotalTokens,
      saveSimulator,
      editSimulator,
      deleteSimulator,
      closeCreateSimulator,
      getSetupTypeText,
      getScreenSetupText,
      loadAcademyCourses,
      loadAcademyCategories,
      getCategoryName,
      getCategoryIcon,
      getDifficultyText,
      editAcademyCourse,
      closeCreateAcademyCourse,
      saveAcademyCourse,
      deleteAcademyCourse,
      editAcademyCategory,
      closeCreateAcademyCategory,
      saveAcademyCategory,
      deleteAcademyCategory
    }
  }
}
</script>

<style scoped>
.admin-panel {
  padding-top: 80px;
}

.admin-header {
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
  animation: iconRotate 10s linear infinite;
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

@keyframes iconRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

/* Admin Navigation */
.admin-nav {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: rgba(0, 161, 156, 0.1);
  border: 1px solid rgba(0, 161, 156, 0.2);
  border-radius: 8px;
  color: #ccc;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.nav-tab.active {
  background: rgba(0, 161, 156, 0.2);
  border-color: #00A19C;
  color: #00A19C;
}

.nav-tab:hover {
  border-color: #00A19C;
  color: #00A19C;
}

/* Tab Content */
.tab-content {
  background: rgba(0, 161, 156, 0.1);
  border: 1px solid rgba(0, 161, 156, 0.2);
  border-radius: 16px;
  padding: 2rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.panel-header h2 {
  color: #00A19C;
  margin: 0;
  font-family: 'Orbitron', monospace;
}

/* Tables */
.posts-table,
.tournaments-table,
.bookings-table,
.shop-table,
.users-table {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 161, 156, 0.2);
  border-radius: 12px;
  overflow: hidden;
}

.table-header {
  display: grid;
  padding: 1rem 1.5rem;
  background: rgba(0, 161, 156, 0.1);
  border-bottom: 1px solid rgba(0, 161, 156, 0.2);
  font-weight: 600;
  color: #00A19C;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.table-row {
  display: grid;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(0, 161, 156, 0.1);
  transition: all 0.3s;
}

.table-row:hover {
  background: rgba(0, 161, 156, 0.05);
}

/* Posts Table */
.posts-table .table-header,
.posts-table .table-row {
  grid-template-columns: 1fr 120px 100px 120px 100px;
  gap: 1rem;
}

.post-title {
  color: #fff;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.post-excerpt {
  color: #999;
  font-size: 0.8rem;
}

.category-tag {
  background: rgba(0, 161, 156, 0.1);
  color: #00A19C;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.status-published {
  color: #00A19C;
}

.status-draft {
  color: #ffa500;
}

/* Tournaments Table */
.tournaments-table .table-header,
.tournaments-table .table-row {
  grid-template-columns: 1fr 120px 130px 100px 100px 100px;
  gap: 1rem;
}

.tournament-title {
  color: #fff;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.tournament-description {
  color: #999;
  font-size: 0.8rem;
}

.participants-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.participants-count {
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
}

.participants-bar {
  width: 100%;
  height: 4px;
  background: rgba(0, 161, 156, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.participants-fill {
  height: 100%;
  background: linear-gradient(90deg, #00A19C, #00C4B4);
  transition: width 0.3s ease;
}

.prize-amount {
  color: #fbbf24;
  font-weight: 700;
  font-family: 'Orbitron', monospace;
}

.status-upcoming {
  color: #60a5fa;
}

.status-active {
  color: #00A19C;
}

.status-completed {
  color: #9ca3af;
}

/* Bookings Table */
.bookings-table .table-header,
.bookings-table .table-row {
  grid-template-columns: 1fr 140px 120px 100px 80px 120px 80px;
  gap: 1rem;
}

.booking-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.booking-client {
  color: #fff;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.booking-client i {
  color: #00A19C;
}

.booking-type {
  margin: 0.25rem 0;
}

.type-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.7rem;
  text-transform: uppercase;
  font-weight: 600;
}

.type-standard {
  background: rgba(100, 116, 139, 0.2);
  color: #94a3b8;
}

.type-vip {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.type-group {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.type-endurance {
  background: rgba(168, 85, 247, 0.2);
  color: #a855f7;
}

.booking-requests {
  color: #999;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.booking-requests i {
  color: #00A19C;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.contact-phone,
.contact-email {
  color: #ccc;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.contact-phone i,
.contact-email i {
  color: #00A19C;
  width: 12px;
}

.datetime-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.booking-date,
.booking-time,
.booking-duration {
  color: #ccc;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.booking-date i,
.booking-time i {
  color: #00A19C;
  width: 12px;
}

.booking-duration {
  color: #fbbf24;
  font-weight: 600;
}

.computer-info {
  color: #ccc;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.computer-info i {
  color: #00A19C;
}

.price-info {
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-select {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 161, 156, 0.3);
  border-radius: 6px;
  color: #fff;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s;
}

.status-select:focus {
  outline: none;
  border-color: #00A19C;
  box-shadow: 0 0 0 2px rgba(0, 161, 156, 0.2);
}

.status-select.status-pending {
  color: #60a5fa;
}

.status-select.status-confirmed {
  color: #00A19C;
}

.status-select.status-cancelled {
  color: #ff4444;
}

.status-select.status-completed {
  color: #9ca3af;
}

/* Shop Table */
.shop-table .table-header,
.shop-table .table-row {
  grid-template-columns: 1fr 120px 120px 100px 100px;
  gap: 1rem;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.item-icon {
  font-size: 1.5rem;
}

.item-title {
  color: #fff;
  font-weight: 600;
}

.item-category {
  color: #999;
  font-size: 0.8rem;
  text-transform: capitalize;
}

.price-amount {
  color: #fbbf24;
  font-weight: 700;
  font-family: 'Orbitron', monospace;
}

.status-active {
  color: #00A19C;
}

.status-inactive {
  color: #ff4444;
}

/* Users Table */
.users-table .table-header,
.users-table .table-row {
  grid-template-columns: 1fr 150px 120px 80px;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info i {
  font-size: 1.5rem;
  color: #00A19C;
}

.user-name {
  color: #fff;
  font-weight: 600;
}

.user-status {
  color: #999;
  font-size: 0.8rem;
}

.stat-item {
  color: #ccc;
  font-size: 0.9rem;
}

.token-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #fbbf24;
  font-weight: 600;
}

/* Action Buttons */
.col-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-edit {
  color: #00A19C;
  border-color: rgba(0, 161, 156, 0.3);
}

.btn-edit:hover {
  background: rgba(0, 161, 156, 0.1);
  border-color: #00A19C;
}

.btn-delete {
  color: #ff4444;
  border-color: rgba(255, 68, 68, 0.3);
}

.btn-delete:hover {
  background: rgba(255, 68, 68, 0.1);
  border-color: #ff4444;
}

.btn-tokens {
  color: #fbbf24;
  border-color: rgba(251, 191, 36, 0.3);
}

.btn-tokens:hover {
  background: rgba(251, 191, 36, 0.1);
  border-color: #fbbf24;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: rgba(0, 50, 0, 0.3);
  border: 1px solid rgba(0, 161, 156, 0.3);
  border-radius: 12px;
  padding: 2rem;
}

.stat-icon {
  font-size: 2.5rem;
  color: #00A19C;
}

.stat-value {
  font-family: 'Orbitron', monospace;
  font-size: 2rem;
  font-weight: 700;
  color: #00A19C;
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Modal Styles */
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
  background: rgba(0, 20, 20, 0.9);
  border: 1px solid rgba(0, 161, 156, 0.3);
  border-radius: 16px;
  max-width: 600px;
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

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

.form-label {
  display: block;
  color: #00A19C;
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 161, 156, 0.3);
  border-radius: 8px;
  padding: 0.75rem;
  color: #fff;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #00A19C;
  box-shadow: 0 0 15px rgba(0, 161, 156, 0.2);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.form-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.form-checkbox input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 161, 156, 0.3);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.form-checkbox input[type="checkbox"]:checked + .checkbox-custom {
  background: #00A19C;
  border-color: #00A19C;
}

.form-checkbox input[type="checkbox"]:checked + .checkbox-custom::after {
  content: '✓';
  color: #000;
  font-weight: bold;
}

.user-info-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(0, 161, 156, 0.05);
  border: 1px solid rgba(0, 161, 156, 0.2);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.user-info-display i {
  font-size: 2rem;
  color: #00A19C;
}

.current-tokens {
  color: #fbbf24;
  font-size: 0.9rem;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid rgba(0, 161, 156, 0.2);
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  color: #ccc;
  font-size: 1.1rem;
}

/* Auth Required Styles */
.auth-required {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #000000 0%, #001a00 25%, #000d00 50%, #002200 75%, #000000 100%);
  padding: 2rem;
}

.auth-message {
  text-align: center;
  background: rgba(0, 161, 156, 0.1);
  border: 1px solid rgba(0, 161, 156, 0.3);
  border-radius: 16px;
  padding: 3rem;
  max-width: 500px;
  width: 100%;
}

.auth-icon {
  font-size: 4rem;
  color: #00A19C;
  margin-bottom: 2rem;
}

.auth-message h2 {
  color: #00A19C;
  font-family: 'Orbitron', monospace;
  font-size: 2rem;
  margin-bottom: 1rem;
}

.auth-message p {
  color: #ccc;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

/* Error State Styles */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  color: #ff4444;
  font-size: 1.1rem;
  text-align: center;
}

.error-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.error-state button {
  margin-top: 1rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .posts-table .table-header,
  .posts-table .table-row {
    grid-template-columns: 1fr 80px 80px;
  }
  
  .col-category,
  .col-date {
    display: none;
  }
  
  .tournaments-table .table-header,
  .tournaments-table .table-row {
    grid-template-columns: 1fr 80px 80px 80px;
  }
  
  .col-date,
  .col-participants {
    display: none;
  }
  
  .shop-table .table-header,
  .shop-table .table-row {
    grid-template-columns: 1fr 80px 80px;
  }
  
  .col-stock,
  .col-status {
    display: none;
  }
  
  .users-table .table-header,
  .users-table .table-row {
    grid-template-columns: 1fr 80px;
  }
  
  .col-stats,
  .col-tokens {
    display: none;
  }
}

@media (max-width: 768px) {
  .admin-header {
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
  
  .admin-nav {
    flex-direction: column;
  }
  
  .panel-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .modal-content {
    width: 95%;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .admin-header {
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
}

/* Form Checkbox Styling */
.form-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 1rem;
  color: #e0e0e0;
}

.form-checkbox input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #00A19C;
  border-radius: 4px;
  position: relative;
  background: transparent;
  transition: all 0.3s ease;
}

.form-checkbox input[type="checkbox"]:checked + .checkbox-custom {
  background: #00A19C;
}

.form-checkbox input[type="checkbox"]:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #000;
  font-weight: bold;
  font-size: 14px;
}

/* Simulator Management Styles */
.simulators-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  padding: 1rem 0;
}

.simulator-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border: 1px solid rgba(0, 161, 156, 0.3);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.simulator-card:hover {
  transform: translateY(-4px);
  border-color: rgba(0, 161, 156, 0.6);
  box-shadow: 0 8px 32px rgba(0, 161, 156, 0.2);
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
  gap: 0.5rem;
  z-index: 2;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid;
}

.badge-motion {
  background: rgba(249, 115, 22, 0.2);
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.4);
}

.badge-vr {
  background: rgba(147, 51, 234, 0.2);
  color: #9333ea;
  border-color: rgba(147, 51, 234, 0.4);
}

.simulator-actions {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  z-index: 2;
}

.simulator-info {
  padding: 1.5rem;
}

.simulator-name {
  color: #00A19C;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.simulator-description {
  color: #ccc;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 1rem;
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.spec-item {
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

.spec-item i {
  color: #00A19C;
  font-size: 0.9rem;
}

.full-specs {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.75rem;
}

.full-specs small {
  color: #aaa;
  font-size: 0.8rem;
  line-height: 1.4;
  white-space: pre-line;
}

/* Checkbox Row */
.checkbox-row {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .simulators-grid {
    grid-template-columns: 1fr;
  }
  
  .checkbox-row {
    flex-direction: column;
    gap: 1rem;
  }
}





.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #ccc;
  font-size: 0.9rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #00A19C;
  box-shadow: 0 0 0 2px rgba(0, 161, 156, 0.2);
}

.form-group small {
  color: #999;
  font-size: 0.8rem;
}

.form-check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.form-check input[type="checkbox"] {
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.form-check label {
  color: #ccc;
  font-size: 0.9rem;
  cursor: pointer;
}

/* Academy Management Styles */
.academy-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.categories-section {
  background: rgba(0, 161, 156, 0.05);
  border: 1px solid rgba(0, 161, 156, 0.2);
  border-radius: 16px;
  padding: 2rem;
}

.categories-section h3 {
  color: #00A19C;
  font-family: 'Orbitron', monospace;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.category-card {
  background: linear-gradient(135deg, rgba(0, 161, 156, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%);
  border: 1px solid rgba(0, 161, 156, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #00A19C, #00C4B4);
}

.category-card:hover {
  transform: translateY(-4px);
  border-color: rgba(0, 161, 156, 0.6);
  box-shadow: 0 8px 32px rgba(0, 161, 156, 0.2);
}

.category-icon {
  font-size: 2.5rem;
  color: #00A19C;
  margin-bottom: 1rem;
  text-shadow: 0 0 10px rgba(0, 161, 156, 0.5);
}

.category-info h4 {
  color: #fff;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  font-family: 'Orbitron', monospace;
}

.category-info p {
  color: #ccc;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.category-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.courses-section {
  background: rgba(0, 161, 156, 0.05);
  border: 1px solid rgba(0, 161, 156, 0.2);
  border-radius: 16px;
  padding: 2rem;
}

.courses-section h3 {
  color: #00A19C;
  font-family: 'Orbitron', monospace;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.courses-table {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 161, 156, 0.2);
  border-radius: 12px;
  overflow: hidden;
}

.courses-table .table-header,
.courses-table .table-row {
  grid-template-columns: 2fr 1fr 100px 120px 100px 120px;
  gap: 1.5rem;
  align-items: center;
}

.course-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.course-thumbnail {
  width: 60px;
  height: 40px;
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  border: 1px solid rgba(0, 161, 156, 0.3);
  flex-shrink: 0;
}

.course-details {
  flex: 1;
  min-width: 0;
}

.course-title {
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.course-description {
  color: #aaa;
  font-size: 0.85rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.course-duration {
  color: #00A19C;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.course-duration i {
  font-size: 0.7rem;
}

.category-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 161, 156, 0.1);
  border: 1px solid rgba(0, 161, 156, 0.3);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  color: #00A19C;
  font-size: 0.85rem;
  font-weight: 500;
}

.category-badge i {
  font-size: 0.9rem;
}

.difficulty-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

.price-amount {
  color: #fbbf24;
  font-weight: 700;
  font-family: 'Orbitron', monospace;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.price-amount i {
  font-size: 0.9rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.header-actions .btn-secondary,
.header-actions .btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
  border: 1px solid;
  background: transparent;
  cursor: pointer;
}

.header-actions .btn-secondary {
  color: #ccc;
  border-color: rgba(255, 255, 255, 0.2);
}

.header-actions .btn-secondary:hover {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.05);
}

.header-actions .btn-primary {
  color: #00A19C;
  border-color: rgba(0, 161, 156, 0.3);
}

.header-actions .btn-primary:hover {
  background: rgba(0, 161, 156, 0.1);
  border-color: #00A19C;
  box-shadow: 0 0 15px rgba(0, 161, 156, 0.3);
}

/* Responsive Academy Styles */
@media (max-width: 1024px) {
  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
  
  .courses-table .table-header,
  .courses-table .table-row {
    grid-template-columns: 2fr 1fr 80px 100px;
  }
  
  .col-difficulty,
  .col-status {
    display: none;
  }
}

@media (max-width: 768px) {
  .academy-content {
    gap: 2rem;
  }
  
  .categories-section,
  .courses-section {
    padding: 1.5rem;
  }
  
  .categories-grid {
    grid-template-columns: 1fr;
  }
  
  .courses-table .table-header,
  .courses-table .table-row {
    grid-template-columns: 1fr 80px;
  }
  
  .col-category,
  .col-price {
    display: none;
  }
  
  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .course-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .course-thumbnail {
    width: 100%;
    height: 60px;
  }
}

/* Form Hint Styles */
.form-hint {
  color: #999;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  line-height: 1.4;
}

/* Responsive */

</style> 