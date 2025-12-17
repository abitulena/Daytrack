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

    <!-- Компонент уведомлений -->
    <notifications position="top right" width="400" :max="3" :duration="4000" />

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
          >
          <span class="password-toggle" @click="showPassword = !showPassword">
            {{ showPassword ? '👁️' : '👁️‍🗨️' }}
          </span>
        </div>
        <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
      </div>
      
      <!-- Кнопка входа -->
      <div class="action-buttons">
        <div 
          class="login-btn" 
          :class="{ 'disabled': !isFormValid }"
          @click="handleLogin"
        >
          <div class="login-btn-text">
            {{ isFormValid ? 'войти' : 'заполните все поля' }}
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
import { notify } from "@kyvg/vue3-notification"

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

// Вычисляемые свойства
const validateForm = () => {
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

const handleLogin = () => {
  validateForm()
  
  if (!isFormValid.value) {
    showNotification('error', 'Пожалуйста, заполните все поля корректно!', '⚠️ Ошибка')
    return
  }
  
  // Проверяем существование пользователя
  const userData = localStorage.getItem('daytrack_user')
  if (userData) {
    const user = JSON.parse(userData)
    
    // Простая проверка email и пароля
    if (user.email === loginData.value.email && user.password === loginData.value.password) {
      // Сохраняем информацию о входе и логин пользователя
      localStorage.setItem('daytrack_logged_in', 'true')
      localStorage.setItem('daytrack_username', user.login)
      localStorage.setItem('daytrack_user_id', user.userId)
      
      showNotification('success', `Добро пожаловать, ${user.login}!`, '🎉 Успешный вход')
      
      // Задержка перед переходом
      setTimeout(() => {
        goToHome()
      }, 1500)
    } else {
      showNotification('error', 'Неверный email или пароль!', '❌ Ошибка')
    }
  } else {
    showNotification('error', 'Аккаунт не найден. Пожалуйста, зарегистрируйтесь.', '⚠️ Ошибка')
  }
}

const goToHome = () => {
  router.push('/home')
}

const goToRegistration = () => {
  router.push('/registration')
}

// Функция для показа уведомлений
const showNotification = (type, text, title) => {
  notify({
    title: title,
    text: text,
    type: type,
    duration: 4000,
    speed: 1000
  })
}
</script>

<style scoped>
@import '@/components/Login.css';
</style>