<template>
  <div class="login-container">
    <!-- Фоновая картинка -->
    <img 
      src="@/assets/lavanderall.png" 
      alt="Background" 
      class="background-image"
    >
    
    <!-- Welcome Text -->
    <div class="welcome-text">
      <span class="welcome-part">Добро пожаловать в </span>
      <span class="app-name">DAYTRACK!</span>
    </div>

    <!-- Окно входа -->
    <div class="login-window">
      <div class="login-title">вход</div>
      
      <!-- Поле email -->
      <div class="form-group">
        <div class="label email-label">эл. почта</div>
        <input 
          v-model="loginData.email" 
          type="email" 
          class="input-field"
          placeholder="example@mail.com"
          @input="validateForm"
          @keypress.enter="handleLogin"
        >
        <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
      </div>
      
      <!-- Поле пароля -->
      <div class="form-group">
        <div class="label password-label">пароль</div>
        <div class="password-field-wrapper">
          <input 
            v-model="loginData.password" 
            :type="showPassword ? 'text' : 'password'" 
            class="input-field"
            placeholder="Введите пароль"
            @input="validateForm"
            @keypress.enter="handleLogin"
          >
          <span class="password-toggle" @click="showPassword = !showPassword">
            {{ showPassword ? '👁️' : '👁️‍🗨️' }}
          </span>
        </div>
        <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
      </div>
      
      <!-- Сообщение об ошибке сервера -->
      <div v-if="serverError" class="server-error-message">
        {{ serverError }}
      </div>
      
      <!-- Кнопка входа -->
      <div class="action-buttons">
        <div 
          class="login-btn" 
          :class="{ 'disabled': !isFormValid || isLoading }"
          @click="handleLogin"
        >
          <div class="login-btn-text">
            {{ isLoading ? 'Вход...' : (isFormValid ? 'войти' : 'заполните все поля') }}
            <span v-if="isLoading" class="spinner"></span>
          </div>
        </div>
        
        <!-- Ссылка на регистрацию -->
        <div class="register-link">
          <span class="no-account">нет аккаунта? </span>
          <span class="register-text" @click="goToRegistration">зарегистрироваться</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Реактивные данные
const loginData = ref({
  email: '',
  password: ''
})

const errors = ref({
  email: '',
  password: ''
})

const showPassword = ref(false)
const isFormValid = ref(false)
const isLoading = ref(false)
const serverError = ref('')

// Вычисляемые свойства
const validateForm = () => {
  serverError.value = ''
  
  // Валидация email
  if (!loginData.value.email.trim()) {
    errors.value.email = 'Email обязателен'
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(loginData.value.email)) {
      errors.value.email = 'Введите корректный email адрес'
    } else {
      errors.value.email = ''
    }
  }
  
  // Валидация пароля
  if (!loginData.value.password) {
    errors.value.password = 'Пароль обязателен'
  } else {
    errors.value.password = ''
  }
  
  // Проверка валидности формы
  const hasErrors = Object.values(errors.value).some(error => error !== '')
  const allFieldsFilled = Object.values(loginData.value).every(field => field !== '')
  
  isFormValid.value = allFieldsFilled && !hasErrors
}

const handleLogin = async () => {
  validateForm()
  
  if (!isFormValid.value) {
    return
  }
  
  isLoading.value = true
  serverError.value = ''
  
  try {
    // Согласно API: POST /auth/log-in - вход
    const response = await fetch('http://localhost:5000/auth/log-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: loginData.value.email,
        password: loginData.value.password
      })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      const errorMsg = data.message || data.error || `Ошибка входа: ${response.status}`
      throw new Error(errorMsg)
    }
    
    // Сохраняем токены согласно API
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token)
    } else if (data.token) {
      localStorage.setItem('access_token', data.token)
    }
    
    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token)
    }
    
    // Сохраняем информацию о пользователе
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('user_id', data.user.id || data.user.userId || data.user.user_id)
      localStorage.setItem('username', data.user.username || data.user.login || '')
    } else {
      // Если сервер не возвращает user, сохраняем базовую информацию
      localStorage.setItem('user', JSON.stringify({
        email: loginData.value.email
      }))
    }
    
    localStorage.setItem('is_logged_in', 'true')
    
    console.log('✅ Успешный вход')
    
    // Переходим на главную
    goToHome()
    
  } catch (error) {
    console.error('❌ Ошибка при входе:', error)
    
    // Обработка конкретных ошибок сервера
    if (error.message.includes('email') || error.message.includes('Email') || 
        error.message.includes('Неверные') || error.message.includes('не найден')) {
      serverError.value = 'Неверный email или пароль'
      errors.value.email = ' '
      errors.value.password = ' '
    } else if (error.message.includes('password') || error.message.includes('пароль')) {
      serverError.value = 'Неверный пароль'
      errors.value.password = ' '
    } else {
      serverError.value = error.message || 'Произошла ошибка при входе. Попробуйте еще раз.'
    }
  } finally {
    isLoading.value = false
  }
}

const goToHome = () => {
  router.push('/home')
}

const goToRegistration = () => {
  router.push('/registration')
}
</script>

<style scoped>
@import '@/styles/Login.css';

/* Стили для индикатора загрузки */
.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-left: 8px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.server-error-message {
  color: #e74c3c;
  font-size: 14px;
  margin-top: 10px;
  padding: 8px;
  background-color: rgba(231, 76, 60, 0.1);
  border-radius: 4px;
  border-left: 3px solid #e74c3c;
}

.login-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>