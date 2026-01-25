<template>
  <div class="profile-container">
    <!-- Фоновое изображение -->
    <img 
      src="@/assets/lavanderall.png" 
      alt="Background" 
      class="background-image"
    >
    
    <!-- Модальное окно подтверждения выхода -->
    <div v-if="showLogoutModal" class="logout-modal-overlay" @click="closeLogoutModal">
      <div class="logout-modal" @click.stop>
        <div class="logout-modal-header">
          <div class="logout-modal-title">⚠️ Подтверждение выхода</div>
          <button class="logout-modal-close" @click="closeLogoutModal">×</button>
        </div>
        <div class="logout-modal-content">
          <p>Вы уверены, что хотите выйти из аккаунта?</p>
          <p class="logout-warning">Ваши данные сохранены на сервере.</p>
        </div>
        <div class="logout-modal-actions">
          <button class="logout-modal-cancel" @click="closeLogoutModal">
            Нет, остаться
          </button>
          <button class="logout-modal-confirm" @click="confirmLogout">
            Да, выйти
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно смены пароля -->
    <div v-if="showPasswordModal" class="password-modal-overlay" @click="closePasswordModal">
      <div class="password-modal" @click.stop>
        <div class="password-modal-header">
          <div class="password-modal-title">🔐 Смена пароля</div>
          <button class="password-modal-close" @click="closePasswordModal">×</button>
        </div>
        <div class="password-modal-content">
          <div class="form-group">
            <div class="label">Текущий пароль</div>
            <input 
              v-model="currentPassword" 
              type="password" 
              class="input-field"
              placeholder="Введите текущий пароль"
            />
          </div>
          <div class="form-group">
            <div class="label">Новый пароль</div>
            <input 
              v-model="newPassword" 
              type="password" 
              class="input-field"
              placeholder="Введите новый пароль"
            />
          </div>
          <div class="form-group">
            <div class="label">Повторите новый пароль</div>
            <input 
              v-model="confirmPassword" 
              type="password" 
              class="input-field"
              placeholder="Повторите новый пароль"
            />
          </div>
          <div v-if="passwordError" class="error-message">{{ passwordError }}</div>
        </div>
        <div class="password-modal-actions">
          <button class="password-modal-cancel" @click="closePasswordModal">
            Отмена
          </button>
          <button class="password-modal-confirm" @click="changePassword" :disabled="isChangingPassword">
            {{ isChangingPassword ? 'Сохранение...' : 'Сменить пароль' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Основной контент -->
    <div class="profile-content">
      <div class="profile-window">
        <div class="profile-title">профиль</div>
        
        <!-- Аватар - НЕ ИСПОЛЬЗУЕТСЯ, так как API не предоставляет эндпоинт для аватара -->
        <!-- <div class="avatar-section">
          <div class="avatar-preview" @click="triggerFileInput">
            <img v-if="avatarPreview" :src="avatarPreview" alt="Avatar" class="avatar-image-large" />
            <div v-else class="avatar-placeholder">
              <div class="plus-icon">+</div>
            </div>
            <div class="avatar-overlay">
              <div class="change-text">изменить фото</div>
            </div>
          </div>
        </div> -->
        
        <!-- Информация пользователя -->
        <div class="user-info">
          <div class="form-group">
            <div class="label login-label">логин</div>
            <input 
              v-model="userData.login" 
              type="text" 
              class="input-field"
              placeholder="Введите ваш логин"
              maxlength="20"
              :disabled="isLoading"
            />
          </div>

          <div class="form-group">
            <div class="label email-label">эл. почта</div>
            <input 
              v-model="userData.email" 
              type="email" 
              class="input-field"
              placeholder="example@mail.com"
              readonly
            />
          </div>

          <div class="form-group">
            <div class="label gender-label">пол</div>
            <div class="gender-display">
              {{ formatGender(userData.gender) }}
            </div>
          </div>

          <div class="form-group">
            <div class="label birthdate-label">дата рождения</div>
            <div class="birthdate-display">
              {{ formatBirthdate(userData.birthdate) }}
            </div>
          </div>

          <!-- Кнопка смены пароля - СКРЫТА, так как API не предоставляет эндпоинт для смены пароля -->
          <!-- <div class="form-group">
            <button class="change-password-btn" @click="showPasswordModal = true">
              Сменить пароль
            </button>
          </div> -->
        </div>
        
        <!-- Кнопки действий -->
        <div class="action-buttons">
          <!-- Кнопка сохранения - СКРЫТА, так как API не предоставляет эндпоинт для обновления профиля -->
          <!-- <button class="save-btn" @click="saveProfile" :disabled="isSaving">
            {{ isSaving ? 'Сохранение...' : 'сохранить' }}
          </button> -->
          <button class="home-btn" @click="goToHome" :disabled="isLoading">
            на главную
          </button>
          <button class="logout-btn" @click="showLogoutModal = true">
            выйти из аккаунта
          </button>
        </div>

        <!-- Сообщения об ошибках/успехе -->
        <div v-if="serverMessage" class="server-message" :class="{ 'error': serverMessageType === 'error', 'success': serverMessageType === 'success' }">
          {{ serverMessage }}
        </div>
      </div>
    </div>

    <!-- Скрытый input для выбора файла - УБРАН -->
    <!-- <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleAvatarSelect"
    /> -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Данные пользователя
const userData = ref({
  login: '',
  email: '',
  gender: '',
  birthdate: ''
})

// Состояния
const showLogoutModal = ref(false)
const showPasswordModal = ref(false)
const isLoading = ref(false)
const isSaving = ref(false)
const isChangingPassword = ref(false)

// Данные для смены пароля
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref('')

// Сообщения сервера
const serverMessage = ref('')
const serverMessageType = ref('')

// Форматирование пола
const formatGender = (gender) => {
  if (!gender) return ''
  if (gender === 'female' || gender === 'Женщина') return 'женщина'
  if (gender === 'male' || gender === 'Мужчина') return 'мужчина'
  return gender
}

// Форматирование даты рождения
const formatBirthdate = (birthdate) => {
  if (!birthdate) return ''
  
  try {
    // Пробуем разные форматы даты
    const date = new Date(birthdate)
    if (isNaN(date.getTime())) return birthdate
    
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`
  } catch {
    return birthdate
  }
}

// Загрузка данных пользователя с сервера
const loadUserData = async () => {
  console.log('🔄 Загрузка данных профиля с сервера...')
  
  isLoading.value = true
  serverMessage.value = ''
  
  try {
    // Согласно API: GET /auth/me - получение текущего пользователя
    // Требует токен авторизации в заголовке Authorization: Bearer <token> или в cookies
    const token = localStorage.getItem('access_token')
    
    if (!token) {
      throw new Error('Требуется авторизация')
    }
    
    const response = await fetch('http://localhost:5000/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Требуется повторная авторизация')
      }
      throw new Error(`Ошибка загрузки профиля: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ Данные профиля получены:', data)
    
    // Согласно документации, сервер возвращает данные пользователя
    // Заполняем данные пользователя
    if (data.user) {
      userData.value = {
        login: data.user.login || data.user.username || '',
        email: data.user.email || '',
        gender: data.user.gender || '',
        birthdate: data.user.birthdate || data.user.birth_date || ''
      }
    } else {
      // Если структура другая, пробуем найти данные в корне ответа
      userData.value = {
        login: data.login || data.username || '',
        email: data.email || '',
        gender: data.gender || '',
        birthdate: data.birthdate || data.birth_date || ''
      }
    }
    
  } catch (error) {
    console.error('❌ Ошибка загрузки профиля:', error)
    serverMessage.value = error.message || 'Не удалось загрузить профиль'
    serverMessageType.value = 'error'
  } finally {
    isLoading.value = false
  }
}

// Сохранение профиля на сервере - НЕ ДОСТУПНО, так как API не предоставляет эндпоинт для обновления профиля
const saveProfile = async () => {
  serverMessage.value = 'Функция обновления профиля временно недоступна'
  serverMessageType.value = 'error'
  
  setTimeout(() => {
    serverMessage.value = ''
  }, 3000)
}

// Смена пароля - НЕ ДОСТУПНО, так как API не предоставляет эндпоинт для смены пароля
const changePassword = async () => {
  passwordError.value = 'Функция смены пароля временно недоступна'
}

// Модальные окна
const closeLogoutModal = () => {
  showLogoutModal.value = false
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  passwordError.value = ''
}

// Подтверждение выхода (через сервер)
const confirmLogout = async () => {
  try {
    // Согласно API: POST /auth/logout - выход
    // Требует токен авторизации
    const token = localStorage.getItem('access_token')
    
    if (token) {
      try {
        await fetch('http://localhost:5000/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      } catch (error) {
        console.warn('Ошибка при logout на сервере:', error)
      }
    }
    
    // Очищаем локальное хранилище
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('username')
    localStorage.removeItem('is_logged_in')
    
    closeLogoutModal()
    
    // Перенаправляем на страницу входа
    router.push('/')
    
  } catch (error) {
    console.error('❌ Ошибка при выходе:', error)
    serverMessage.value = 'Ошибка при выходе из аккаунта'
    serverMessageType.value = 'error'
  }
}

// Переход на главную
const goToHome = () => {
  router.push('/home')
}

// Хуки жизненного цикла
onMounted(() => {
  loadUserData()
})
</script>

<style scoped>
@import '@/styles/Profile.css';

/* Дополнительные стили для отображения данных */
.gender-display,
.birthdate-display {
  padding: 10px;
  background-color: #f8f4f9;
  border: 1px solid #e5d8e9;
  border-radius: 5px;
  color: #333;
  font-size: 14px;
  min-height: 40px;
  display: flex;
  align-items: center;
}

/* Скрываем неиспользуемые элементы */
.avatar-section,
.change-password-btn,
.save-btn {
  display: none !important;
}
</style>