<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3 class="footer-title">Academy Sim Racing</h3>
          <p class="footer-description">
            Професионална академия за симулационни състезания в Плевен.
            Научете се да карате като професионалист!
          </p>
          <div class="footer-location">
            <i class="fas fa-map-marker-alt"></i>
            <span>Плевен, България</span>
          </div>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-section-title">Връзки</h4>
          <ul class="footer-links">
            <li><router-link to="/">Начало</router-link></li>
            <li><router-link to="/tournaments">Турнири</router-link></li>
            <li><router-link to="/leaderboard">Класиране</router-link></li>
            <li><router-link to="/academy">Академия</router-link></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-section-title">Информация</h4>
          <ul class="footer-links">
            <li><a href="#" @click.prevent>Контакти</a></li>
            <li><a href="#" @click.prevent>За нас</a></li>
            <li><a href="#" @click.prevent>Правила</a></li>
            <li><a href="#" @click.prevent>Поверителност</a></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-section-title">Свържете се с нас</h4>
          <div class="footer-social">
            <a href="#" class="social-link">
              <i class="fab fa-facebook"></i>
            </a>
            <a href="#" class="social-link">
              <i class="fab fa-instagram"></i>
            </a>
            <a href="#" class="social-link">
              <i class="fab fa-youtube"></i>
            </a>
            <a href="#" class="social-link">
              <i class="fab fa-discord"></i>
            </a>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <div class="footer-bottom-content">
          <p>&copy; 2024 Academy Sim Racing. Всички права запазени.</p>
          <p class="footer-tech">Powered by NetCafe Pro 2.0</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style scoped>
.footer {
  background: linear-gradient(135deg, #000000 0%, #001a1a 100%);
  border-top: 1px solid rgba(0, 161, 156, 0.3);
  padding: 3rem 0 1rem;
  margin-top: 4rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer-title {
  font-family: 'Orbitron', monospace;
  font-size: 1.5rem;
  font-weight: 700;
  color: #00A19C;
  text-shadow: 0 0 10px rgba(0, 161, 156, 0.5);
  margin: 0;
}

.footer-section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #00A19C;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.footer-description {
  color: #ccc;
  line-height: 1.6;
  margin: 0;
}

.footer-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #00A19C;
  font-weight: 500;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-links a {
  color: #ccc;
  text-decoration: none;
  transition: all 0.3s;
  padding: 0.25rem 0;
}

.footer-links a:hover {
  color: #00A19C;
  padding-left: 0.5rem;
}

.footer-social {
  display: flex;
  gap: 1rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(0, 161, 156, 0.1);
  border: 1px solid rgba(0, 161, 156, 0.3);
  border-radius: 50%;
  color: #00A19C;
  text-decoration: none;
  transition: all 0.3s;
  font-size: 1.1rem;
}

.social-link:hover {
  background: rgba(0, 161, 156, 0.2);
  border-color: #00A19C;
  box-shadow: 0 0 15px rgba(0, 161, 156, 0.3);
  transform: translateY(-2px);
}

.footer-bottom {
  border-top: 1px solid rgba(0, 161, 156, 0.2);
  padding-top: 1rem;
}

.footer-bottom-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  color: #999;
  font-size: 0.9rem;
}

.footer-tech {
  color: #00A19C;
  font-weight: 500;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .footer-bottom-content {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .footer-social {
    justify-content: center;
  }
}
</style> 