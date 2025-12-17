<template>
  <div class="registration-container">
    <img 
      src="@/assets/lavanderall.png" 
      alt="Background" 
      class="background-image"
    >
    
    <div class="welcome-text">
      <span class="welcome-part">Добро пожаловать в </span>
      <span class="app-name">DAYTRACK!</span>
    </div>

    <!-- Компонент уведомлений -->
    <notifications position="top right" width="400" :max="3" :duration="4000" />

    <div class="registration-window">
      <div class="registration-title">регистрация</div>
      
      <div class="form-group">
        <div class="label login-label">логин</div>
        <input 
          v-model="formData.login" 
          type="text" 
          class="input-field"
          placeholder="Введите ваш логин"
          @input="validateForm"
        >
        <div v-if="errors.login" class="error-message">{{ errors.login }}</div>
      </div>
      
      <div class="form-group">
        <div class="label birthdate-label">дата рождения</div>
        <div class="date-input-wrapper">
          <input 
            v-model="formData.birthdate" 
            type="text" 
            class="input-field date-input"
            placeholder="дд.мм.гггг"
            @focus="showDatepicker = true"
            @input="formatDateInput"
            @blur="validateBirthdate"
          >
          <div class="calendar-icon" @click="toggleDatepicker">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="#9770A9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 2V6" stroke="#9770A9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 2V6" stroke="#9770A9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 10H21" stroke="#9770A9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 14H8.01" stroke="#9770A9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 14H12.01" stroke="#9770A9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 14H16.01" stroke="#9770A9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 18H8.01" stroke="#9770A9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 18H12.01" stroke="#9770A9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 18H16.01" stroke="#9770A9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          
          <div v-if="showDatepicker" class="custom-datepicker">
            <div class="datepicker-header">
              <button type="button" @click="prevYear" :disabled="isMinYear" class="year-nav">&lt;&lt;</button>
              <button type="button" @click="prevMonth" class="month-nav">&lt;</button>
              <span class="current-month" @click="showYearSelector = !showYearSelector">
                {{ currentMonth }} {{ currentYear }}
              </span>
              <button type="button" @click="nextMonth" class="month-nav">&gt;</button>
              <button type="button" @click="nextYear" :disabled="isMaxYear" class="year-nav">&gt;&gt;</button>
            </div>

            <div v-if="showYearSelector" class="year-selector">
              <div class="year-selector-header">
                <button type="button" @click="prevYearRange" class="range-nav">&lt;</button>
                <span class="year-range">{{ yearRangeStart }} - {{ yearRangeEnd }}</span>
                <button type="button" @click="nextYearRange" class="range-nav">&gt;</button>
              </div>
              <div class="year-grid">
                <div 
                  v-for="year in yearRange" 
                  :key="year"
                  class="year-item"
                  :class="{ 'selected': year === currentDate.getFullYear() }"
                  @click="selectYear(year)"
                >
                  {{ year }}
                </div>
              </div>
            </div>

            <div class="datepicker-days" v-else>
              <div class="day-header" v-for="day in ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']" :key="day">
                {{ day }}
              </div>
              <div 
                v-for="day in calendarDays" 
                :key="day.date.getTime()"
                class="day"
                :class="{
                  'other-month': !day.isCurrentMonth,
                  'selected': day.isSelected,
                  'today': day.isToday,
                  'disabled': day.isFuture
                }"
                @click="selectDate(day)"
              >
                {{ day.day }}
              </div>
            </div>
          </div>
        </div>
        <div v-if="errors.birthdate" class="error-message">{{ errors.birthdate }}</div>
      </div>
      
      <div class="form-group">
        <div class="label email-label">эл. почта</div>
        <input 
          v-model="formData.email" 
          type="email" 
          class="input-field"
          placeholder="example@mail.com"
          @input="validateEmail"
          @blur="validateEmail"
        >
        <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
      </div>
      
      <div class="form-group">
        <div class="label password-label">пароль</div>
        <div class="password-field-wrapper">
          <input 
            v-model="formData.password" 
            :type="showPassword ? 'text' : 'password'" 
            class="input-field"
            placeholder="Введите пароль"
            @input="validatePassword"
            @blur="validatePassword"
          >
          <span class="password-toggle" @click="showPassword = !showPassword">
            {{ showPassword ? '👁️' : '👁️‍🗨️' }}
          </span>
        </div>
        <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
        
        <div v-if="formData.password" class="password-strength">
          <div class="strength-bar" :class="passwordStrength"></div>
          <div class="strength-text">{{ passwordStrengthText }}</div>
        </div>
      </div>
      
      <div class="form-group gender-group">
        <div class="label gender-main-label">пол</div>
        <div class="gender-options">
          <div class="gender-option">
            <input 
              v-model="formData.gender" 
              value="female" 
              type="radio" 
              class="radio-input"
              id="female"
              @change="validateForm"
            >
            <label for="female" class="radio-label">
              <div class="radio-btn"></div>
              <span class="label female-label">женщина</span>
            </label>
          </div>
          <div class="gender-option">
            <input 
              v-model="formData.gender" 
              value="male" 
              type="radio" 
              class="radio-input"
              id="male"
              @change="validateForm"
            >
            <label for="male" class="radio-label">
              <div class="radio-btn"></div>
              <span class="label male-label">мужчина</span>
            </label>
          </div>
        </div>
        <div v-if="errors.gender" class="error-message">{{ errors.gender }}</div>
      </div>
      
      <div 
        class="create-account-btn" 
        :class="{ 'disabled': !isFormValid }"
        @click="handleRegistration"
      >
        <div class="create-account-text">
          {{ isFormValid ? 'создать аккаунт' : 'заполните все поля корректно' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { notify } from "@kyvg/vue3-notification"

const router = useRouter()

// Реактивные данные
const formData = ref({
  login: '',
  birthdate: '',
  email: '',
  password: '',
  gender: ''
})

const errors = ref({
  login: '',
  birthdate: '',
  email: '',
  password: '',
  gender: ''
})

const showPassword = ref(false)
const isFormValid = ref(false)
const showDatepicker = ref(false)
const showYearSelector = ref(false)
const currentDate = ref(new Date())
const selectedDate = ref(null)
const yearRangeStart = ref(1900)
const yearRangeEnd = ref(2030)

// Вычисляемые свойства
const currentYear = computed(() => currentDate.value.getFullYear())

const currentMonth = computed(() => {
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ]
  return months[currentDate.value.getMonth()]
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  
  const days = []
  
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i
    const date = new Date(year, month - 1, day)
    days.push({
      day: day,
      date: date,
      isCurrentMonth: false,
      isSelected: isSameDay(selectedDate.value, date),
      isToday: isToday(date),
      isFuture: date > today
    })
  }
  
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    days.push({
      day: i,
      date: date,
      isCurrentMonth: true,
      isSelected: isSameDay(selectedDate.value, date),
      isToday: isToday(date),
      isFuture: date > today
    })
  }
  
  const totalCells = 42
  const nextMonthDays = totalCells - days.length
  for (let i = 1; i <= nextMonthDays; i++) {
    const date = new Date(year, month + 1, i)
    days.push({
      day: i,
      date: date,
      isCurrentMonth: false,
      isSelected: isSameDay(selectedDate.value, date),
      isToday: isToday(date),
      isFuture: date > today
    })
  }
  
  return days
})

const yearRange = computed(() => {
  const years = []
  for (let year = yearRangeStart.value; year <= yearRangeEnd.value; year++) {
    years.push(year)
  }
  return years
})

const isMinYear = computed(() => {
  return currentDate.value.getFullYear() <= 1900
})

const isMaxYear = computed(() => {
  return currentDate.value.getFullYear() >= 2100
})

const passwordStrength = computed(() => {
  if (!formData.value.password) return ''
  
  const password = formData.value.password
  let strength = 0
  
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/\d/.test(password)) strength++
  if (/[a-zA-Z]/.test(password)) strength++
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  
  if (strength <= 2) return 'weak'
  if (strength <= 4) return 'medium'
  return 'strong'
})

const passwordStrengthText = computed(() => {
  switch (passwordStrength.value) {
    case 'weak': return 'Слабый пароль'
    case 'medium': return 'Средний пароль'
    case 'strong': return 'Сильный пароль'
    default: return ''
  }
})

// Методы
const validateForm = () => {
  if (!formData.value.login.trim()) {
    errors.value.login = 'Логин обязателен'
  } else if (formData.value.login.length < 3) {
    errors.value.login = 'Логин должен содержать минимум 3 символа'
  } else {
    errors.value.login = ''
  }

  if (!formData.value.gender) {
    errors.value.gender = 'Выберите пол'
  } else {
    errors.value.gender = ''
  }

  const hasErrors = Object.values(errors.value).some(error => error !== '')
  const allFieldsFilled = Object.values(formData.value).every(field => field !== '')
  
  isFormValid.value = allFieldsFilled && !hasErrors
}

const validatePassword = () => {
  const password = formData.value.password
  
  if (!password) {
    errors.value.password = 'Пароль обязателен'
    validateForm()
    return
  }
  
  if (password.length < 8) {
    errors.value.password = 'Пароль должен содержать минимум 8 символов'
    validateForm()
    return
  }
  
  if (!/\d/.test(password)) {
    errors.value.password = 'Пароль должен содержать минимум одну цифру'
    validateForm()
    return
  }
  
  if (!/[a-zA-Z]/.test(password)) {
    errors.value.password = 'Пароль должен содержать минимум одну букву'
    validateForm()
    return
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.value.password = 'Пароль должен содержать минимум один специальный символ'
    validateForm()
    return
  }
  
  errors.value.password = ''
  validateForm()
}

const validateEmail = () => {
  const email = formData.value.email
  
  if (!email) {
    errors.value.email = 'Email обязателен'
    validateForm()
    return
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    errors.value.email = 'Введите корректный email адрес'
    validateForm()
    return
  }
  
  errors.value.email = ''
  validateForm()
}

const validateBirthdate = () => {
  const birthdate = formData.value.birthdate
  
  if (!birthdate) {
    errors.value.birthdate = 'Дата рождения обязательна'
    validateForm()
    return
  }
  
  const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/
  const match = birthdate.match(dateRegex)
  
  if (!match) {
    errors.value.birthdate = 'Неверный формат даты. Используйте дд.мм.гггг'
    validateForm()
    return
  }
  
  const day = parseInt(match[1])
  const month = parseInt(match[2]) - 1
  const year = parseInt(match[3])
  
  const date = new Date(year, month, day)
  if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
    errors.value.birthdate = 'Неверная дата'
    validateForm()
    return
  }
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (date > today) {
    errors.value.birthdate = 'Дата рождения не может быть в будущем'
    validateForm()
    return
  }
  
  const minDate = new Date()
  minDate.setFullYear(minDate.getFullYear() - 150)
  
  if (date < minDate) {
    errors.value.birthdate = 'Проверьте правильность даты рождения'
    validateForm()
    return
  }
  
  errors.value.birthdate = ''
  validateForm()
}

const handleRegistration = () => {
  validateForm()
  validatePassword()
  validateEmail()
  validateBirthdate()
  
  if (!isFormValid.value) {
    showNotification('error', 'Пожалуйста, исправьте ошибки в форме!', '⚠️ Ошибка')
    return
  }
  
  // Проверяем, не существует ли уже пользователь с таким email
  const existingUser = localStorage.getItem('daytrack_user')
  if (existingUser) {
    const user = JSON.parse(existingUser)
    if (user.email === formData.value.email) {
      showNotification('error', 'Пользователь с таким email уже существует!', '⚠️ Ошибка')
      return
    }
  }
  
  // Генерируем уникальный ID для пользователя
  const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  
  // Сохраняем данные пользователя
  const userData = {
    ...formData.value,
    userId: userId,
    registeredAt: new Date().toISOString()
  }
  
  // Сохраняем пользователя в localStorage
  localStorage.setItem('daytrack_user', JSON.stringify(userData))
  localStorage.setItem('daytrack_user_id', userId)
  localStorage.setItem('daytrack_logged_in', 'true')
  localStorage.setItem('daytrack_username', formData.value.login)
  
  console.log('✅ Создан новый аккаунт с ID:', userId)
  
  // Показываем уведомление об успехе
  showNotification('success', 'Аккаунт успешно создан! Добро пожаловать в DayTrack!', '🎉 Успешно')
  
  // Перенаправляем на главную с задержкой
  setTimeout(() => {
    goToHome()
  }, 1500)
}

const goToHome = () => {
  router.push('/home')
}

const toggleDatepicker = () => {
  showDatepicker.value = !showDatepicker.value
  showYearSelector.value = false
}

const hideDatepicker = () => {
  setTimeout(() => {
    showDatepicker.value = false
    showYearSelector.value = false
  }, 150)
}

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const prevYear = () => {
  if (!isMinYear.value) {
    currentDate.value = new Date(currentDate.value.getFullYear() - 1, currentDate.value.getMonth(), 1)
  }
}

const nextYear = () => {
  if (!isMaxYear.value) {
    currentDate.value = new Date(currentDate.value.getFullYear() + 1, currentDate.value.getMonth(), 1)
  }
}

const prevYearRange = () => {
  const range = yearRangeEnd.value - yearRangeStart.value
  yearRangeStart.value -= range + 1
  yearRangeEnd.value -= range + 1
}

const nextYearRange = () => {
  const range = yearRangeEnd.value - yearRangeStart.value
  yearRangeStart.value += range + 1
  yearRangeEnd.value += range + 1
}

const selectYear = (year) => {
  currentDate.value = new Date(year, currentDate.value.getMonth(), 1)
  showYearSelector.value = false
}

const selectDate = (day) => {
  if (day.isFuture) return
  
  selectedDate.value = day.date
  formData.value.birthdate = formatDate(day.date)
  showDatepicker.value = false
  showYearSelector.value = false
  validateBirthdate()
}

const formatDate = (date) => {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

const formatDateInput = (event) => {
  let value = event.target.value.replace(/[^\d.]/g, '')
  
  if (value.length === 2 && !value.includes('.')) {
    value = value + '.'
  } else if (value.length === 5 && value.split('.')[1]?.length === 2) {
    value = value + '.'
  }
  
  if (value.length > 10) {
    value = value.substring(0, 10)
  }
  
  formData.value.birthdate = value
}

const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear()
}

const isToday = (date) => {
  const today = new Date()
  return isSameDay(date, today)
}

const handleClickOutside = (event) => {
  if (showDatepicker.value && !event.target.closest('.date-input-wrapper')) {
    hideDatepicker()
  }
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

// Хуки жизненного цикла
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
@import '@/components/Registration.css';
</style>