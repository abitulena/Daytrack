<template>
  <div class="registration-container">
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

    <!-- Основное окно регистрации -->
    <div class="registration-window">
      <div class="registration-title">регистрация</div>
      
      <!-- Form Fields -->
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
          
          <!-- Кастомный datepicker -->
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

            <!-- Выбор года -->
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

            <!-- Дни календаря -->
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
        
        <!-- Индикатор сложности пароля -->
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
      
      <!-- Кнопки действий -->
      <div class="action-buttons">
        <div 
          class="create-account-btn" 
          :class="{ 'disabled': !isFormValid }"
          @click="handleRegistration"
        >
          <div class="create-account-text">
            {{ isFormValid ? 'создать аккаунт' : 'заполните все поля корректно' }}
          </div>
        </div>
        
        <div class="login-link" @click="goToLogin">
          <span class="have-account">уже есть аккаунт? </span>
          <span class="login-text">войти</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Registration',
  data() {
    return {
      formData: {
        login: '',
        birthdate: '',
        email: '',
        password: '',
        gender: ''
      },
      errors: {
        login: '',
        birthdate: '',
        email: '',
        password: '',
        gender: ''
      },
      showPassword: false,
      isFormValid: false,
      showDatepicker: false,
      showYearSelector: false,
      currentDate: new Date(),
      selectedDate: null,
      yearRangeStart: 1900,
      yearRangeEnd: 2030
    }
  },
  computed: {
    currentYear() {
      return this.currentDate.getFullYear();
    },
    currentMonth() {
      const months = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
      ];
      return months[this.currentDate.getMonth()];
    },
    calendarDays() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      
      const days = [];
      
      // Дни предыдущего месяца
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const day = prevMonthLastDay - i;
        const date = new Date(year, month - 1, day);
        days.push({
          day: day,
          date: date,
          isCurrentMonth: false,
          isSelected: this.isSameDay(this.selectedDate, date),
          isToday: this.isToday(date),
          isFuture: date > today
        });
      }
      
      // Дни текущего месяца
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(year, month, i);
        days.push({
          day: i,
          date: date,
          isCurrentMonth: true,
          isSelected: this.isSameDay(this.selectedDate, date),
          isToday: this.isToday(date),
          isFuture: date > today
        });
      }
      
      // Дни следующего месяца
      const totalCells = 42;
      const nextMonthDays = totalCells - days.length;
      for (let i = 1; i <= nextMonthDays; i++) {
        const date = new Date(year, month + 1, i);
        days.push({
          day: i,
          date: date,
          isCurrentMonth: false,
          isSelected: this.isSameDay(this.selectedDate, date),
          isToday: this.isToday(date),
          isFuture: date > today
        });
      }
      
      return days;
    },
    yearRange() {
      const years = [];
      for (let year = this.yearRangeStart; year <= this.yearRangeEnd; year++) {
        years.push(year);
      }
      return years;
    },
    isMinYear() {
      return this.currentDate.getFullYear() <= 1900;
    },
    isMaxYear() {
      return this.currentDate.getFullYear() >= 2100;
    },
    passwordStrength() {
      if (!this.formData.password) return '';
      
      const password = this.formData.password;
      let strength = 0;
      
      if (password.length >= 8) strength++;
      if (password.length >= 12) strength++;
      if (/\d/.test(password)) strength++;
      if (/[a-zA-Z]/.test(password)) strength++;
      if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
      if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
      
      if (strength <= 2) return 'weak';
      if (strength <= 4) return 'medium';
      return 'strong';
    },
    passwordStrengthText() {
      switch (this.passwordStrength) {
        case 'weak': return 'Слабый пароль';
        case 'medium': return 'Средний пароль';
        case 'strong': return 'Сильный пароль';
        default: return '';
      }
    }
  },
  methods: {
    validateForm() {
      // Валидация логина
      if (!this.formData.login.trim()) {
        this.errors.login = 'Логин обязателен';
      } else if (this.formData.login.length < 3) {
        this.errors.login = 'Логин должен содержать минимум 3 символа';
      } else {
        this.errors.login = '';
      }

      // Валидация пола
      if (!this.formData.gender) {
        this.errors.gender = 'Выберите пол';
      } else {
        this.errors.gender = '';
      }

      // Проверка валидности формы
      const hasErrors = Object.values(this.errors).some(error => error !== '');
      const allFieldsFilled = Object.values(this.formData).every(field => field !== '');
      
      this.isFormValid = allFieldsFilled && !hasErrors;
    },
    
    validatePassword() {
      const password = this.formData.password;
      
      if (!password) {
        this.errors.password = 'Пароль обязателен';
        this.validateForm();
        return;
      }
      
      if (password.length < 8) {
        this.errors.password = 'Пароль должен содержать минимум 8 символов';
        this.validateForm();
        return;
      }
      
      if (!/\d/.test(password)) {
        this.errors.password = 'Пароль должен содержать минимум одну цифру';
        this.validateForm();
        return;
      }
      
      if (!/[a-zA-Z]/.test(password)) {
        this.errors.password = 'Пароль должен содержать минимум одну букву';
        this.validateForm();
        return;
      }
      
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        this.errors.password = 'Пароль должен содержать минимум один специальный символ';
        this.validateForm();
        return;
      }
      
      this.errors.password = '';
      this.validateForm();
    },
    
    validateEmail() {
      const email = this.formData.email;
      
      if (!email) {
        this.errors.email = 'Email обязателен';
        this.validateForm();
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        this.errors.email = 'Введите корректный email адрес';
        this.validateForm();
        return;
      }
      
      this.errors.email = '';
      this.validateForm();
    },
    
    validateBirthdate() {
      const birthdate = this.formData.birthdate;
      
      if (!birthdate) {
        this.errors.birthdate = 'Дата рождения обязательна';
        this.validateForm();
        return;
      }
      
      const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
      const match = birthdate.match(dateRegex);
      
      if (!match) {
        this.errors.birthdate = 'Неверный формат даты. Используйте дд.мм.гггг';
        this.validateForm();
        return;
      }
      
      const day = parseInt(match[1]);
      const month = parseInt(match[2]) - 1;
      const year = parseInt(match[3]);
      
      const date = new Date(year, month, day);
      if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
        this.errors.birthdate = 'Неверная дата';
        this.validateForm();
        return;
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date > today) {
        this.errors.birthdate = 'Дата рождения не может быть в будущем';
        this.validateForm();
        return;
      }
      
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 150);
      
      if (date < minDate) {
        this.errors.birthdate = 'Проверьте правильность даты рождения';
        this.validateForm();
        return;
      }
      
      this.errors.birthdate = '';
      this.validateForm();
    },
    
    handleRegistration() {
      this.validateForm();
      this.validatePassword();
      this.validateEmail();
      this.validateBirthdate();
      
      if (!this.isFormValid) {
        alert('Пожалуйста, исправьте ошибки в форме!');
        return;
      }
      
      // Проверяем, нет ли уже пользователя с таким email
      const existingUser = localStorage.getItem('daytrack_user');
      if (existingUser) {
        const user = JSON.parse(existingUser);
        if (user.email === this.formData.email) {
          alert('Пользователь с таким email уже существует!');
          return;
        }
      }
      
      console.log('Данные регистрации:', this.formData);
      this.saveUserData();
      this.goToHome();
    },
    
    saveUserData() {
      const userData = {
        ...this.formData,
        registeredAt: new Date().toISOString()
      };
      localStorage.setItem('daytrack_user', JSON.stringify(userData));
      localStorage.setItem('daytrack_logged_in', 'true');
      localStorage.setItem('daytrack_username', this.formData.login); // Сохраняем логин
    },
    
    goToHome() {
      this.$router.push('/home');
    },
    
    goToLogin() {
      this.$router.push('/');
    },
    
    toggleDatepicker() {
      this.showDatepicker = !this.showDatepicker;
      this.showYearSelector = false;
    },
    
    hideDatepicker() {
      setTimeout(() => {
        this.showDatepicker = false;
        this.showYearSelector = false;
      }, 150);
    },
    
    prevMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    },
    
    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    },
    
    prevYear() {
      if (!this.isMinYear) {
        this.currentDate = new Date(this.currentDate.getFullYear() - 1, this.currentDate.getMonth(), 1);
      }
    },
    
    nextYear() {
      if (!this.isMaxYear) {
        this.currentDate = new Date(this.currentDate.getFullYear() + 1, this.currentDate.getMonth(), 1);
      }
    },
    
    prevYearRange() {
      const range = this.yearRangeEnd - this.yearRangeStart;
      this.yearRangeStart -= range + 1;
      this.yearRangeEnd -= range + 1;
    },
    
    nextYearRange() {
      const range = this.yearRangeEnd - this.yearRangeStart;
      this.yearRangeStart += range + 1;
      this.yearRangeEnd += range + 1;
    },
    
    selectYear(year) {
      this.currentDate = new Date(year, this.currentDate.getMonth(), 1);
      this.showYearSelector = false;
    },
    
    selectDate(day) {
      if (day.isFuture) return;
      
      this.selectedDate = day.date;
      this.formData.birthdate = this.formatDate(day.date);
      this.showDatepicker = false;
      this.showYearSelector = false;
      this.validateBirthdate();
    },
    
    formatDate(date) {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    },
    
    formatDateInput(event) {
      let value = event.target.value.replace(/[^\d.]/g, '');
      
      if (value.length === 2 && !value.includes('.')) {
        value = value + '.';
      } else if (value.length === 5 && value.split('.')[1]?.length === 2) {
        value = value + '.';
      }
      
      if (value.length > 10) {
        value = value.substring(0, 10);
      }
      
      this.formData.birthdate = value;
    },
    
    isSameDay(date1, date2) {
      if (!date1 || !date2) return false;
      return date1.getDate() === date2.getDate() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getFullYear() === date2.getFullYear();
    },
    
    isToday(date) {
      const today = new Date();
      return this.isSameDay(date, today);
    },

    handleClickOutside(event) {
      if (this.showDatepicker && !this.$el.contains(event.target)) {
        this.hideDatepicker();
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }
}
</script>

<style scoped>
.registration-container {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background: #BEAEDB;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  opacity: 0.5;
  filter: brightness(1.1) saturate(1.2);
}

.welcome-text {
  text-align: center;
  width: 100%;
  margin-bottom: 5px;
  position: relative;
  z-index: 1;
}

.welcome-part {
  color: #3A2D34;
  font-size: 2.2rem;
  font-family: 'KyivType Sans', Arial, sans-serif;
  font-weight: 840;
  text-shadow: 0px 3px 3px rgba(151, 112, 169, 0.5);
}

.app-name {
  color: white;
  font-size: 2.2rem;
  font-family: 'KyivType Sans', Arial, sans-serif;
  font-weight: 840;
  text-shadow: 0px 3px 3px rgba(151, 112, 169, 0.5);
}

.registration-window {
  width: 420px;
  height: auto;
  min-height: 540px;
  background: rgba(237, 221, 236, 0.9);
  border-radius: 30px;
  border: 2px solid rgba(237, 221, 236, 0.95);
  padding: 30px 30px 25px 30px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 15px 30px rgba(151, 112, 169, 0.2);
  margin-top: 5px;
  position: relative;
  z-index: 1;
}

.registration-title {
  color: #3A2D34;
  font-size: 2rem;
  font-family: 'KyivType Sans', Arial, sans-serif;
  font-weight: 840;
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  position: relative;
  margin-bottom: 18px;
}

.label {
  color: #9770A9;
  font-size: 1rem;
  font-family: 'KyivType Sans', Arial, sans-serif;
  font-weight: 840;
  margin-bottom: 8px;
  display: block;
}

.input-field {
  width: 100%;
  height: 40px;
  background: transparent !important;
  border: none;
  border-bottom: 2px solid rgba(237, 221, 236, 0.9);
  color: #9770A9;
  font-size: 1rem;
  font-family: 'KyivType Sans', Arial, sans-serif;
  padding: 8px 0;
  outline: none;
  transition: border-color 0.3s ease;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  caret-color: #9770A9; /* Цвет курсора */
}

/* Убираем белый фон при автозаполнении */
.input-field:-webkit-autofill,
.input-field:-webkit-autofill:hover,
.input-field:-webkit-autofill:focus,
.input-field:-webkit-autofill:active {
  -webkit-text-fill-color: #9770A9 !important;
  -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
  transition: background-color 5000s ease-in-out 0s;
  background: transparent !important;
  border-bottom: 2px solid rgba(237, 221, 236, 0.9);
  font-family: 'KyivType Sans', Arial, sans-serif;
  font-size: 1rem;
}

/* Убираем стандартные стили браузера */
.input-field:focus {
  border-bottom-color: #B998C8;
  background: transparent !important;
  outline: none;
  box-shadow: none;
}

.input-field::placeholder {
  color: rgba(151, 112, 169, 0.6);
  font-size: 0.9rem;
  font-family: 'KyivType Sans', Arial, sans-serif;
}

/* Убираем стандартные стили для всех состояний */
.input-field:focus-visible {
  outline: none;
}

.input-field:active {
  background: transparent !important;
}

.date-input-wrapper {
  position: relative;
  width: 100%;
}

.date-input {
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  position: relative;
  background: transparent !important;
  color: #9770A9;
  z-index: 2;
  padding-right: 40px;
}

.calendar-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 1.2rem;
  z-index: 3;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  transition: transform 0.2s ease;
  pointer-events: auto;
}

.calendar-icon:hover {
  transform: translateY(-50%) scale(1.1);
}

.calendar-icon svg {
  filter: drop-shadow(0px 2px 2px rgba(151, 112, 169, 0.3));
  transition: filter 0.2s ease;
}

.custom-datepicker {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: rgba(237, 221, 236, 0.95);
  border: 2px solid rgba(237, 221, 236, 0.9);
  border-radius: 15px;
  padding: 15px;
  margin-top: 5px;
  z-index: 1000;
  box-shadow: 0 8px 20px rgba(151, 112, 169, 0.3);
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.datepicker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  gap: 5px;
}

.datepicker-header button {
  background: #B998C8;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.year-nav {
  width: 35px;
  height: 25px;
}

.month-nav {
  width: 30px;
  height: 25px;
}

.datepicker-header button:disabled {
  background: #E0D0E9;
  cursor: not-allowed;
  opacity: 0.5;
}

.datepicker-header button:hover:not(:disabled) {
  background: #9770A9;
}

.current-month {
  color: #3A2D34;
  font-family: 'KyivType Sans', Arial, sans-serif;
  font-weight: 840;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 5px;
  transition: background-color 0.2s ease;
  flex: 1;
  text-align: center;
}

.current-month:hover {
  background: #CFB9F2;
}

.year-selector {
  margin-top: 10px;
}

.year-selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.range-nav {
  background: #B998C8;
  border: none;
  border-radius: 5px;
  width: 30px;
  height: 25px;
  color: white;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.year-range {
  color: #3A2D34;
  font-family: 'KyivType Sans', Arial, sans-serif;
  font-weight: 840;
  font-size: 0.9rem;
}

.year-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
  max-height: 150px;
  overflow-y: auto;
}

.year-item {
  color: #3A2D34;
  font-family: 'KyivType Sans', Arial, sans-serif;
  font-weight: 840;
  font-size: 0.8rem;
  text-align: center;
  padding: 8px 5px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.year-item:hover {
  background: #CFB9F2;
}

.year-item.selected {
  background: #9770A9;
  color: white;
}

.datepicker-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.day-header {
  color: #9770A9;
  font-family: 'KyivType Sans', Arial, sans-serif;
  font-weight: 840;
  font-size: 0.8rem;
  text-align: center;
  padding: 5px;
}

.day {
  color: #3A2D34;
  font-family: 'KyivType Sans', Arial, sans-serif;
  font-weight: 840;
  font-size: 0.8rem;
  text-align: center;
  padding: 8px 5px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.day:hover:not(.disabled) {
  background: #CFB9F2;
}

.day.other-month {
  color: rgba(151, 112, 169, 0.5);
}

.day.selected {
  background: #9770A9;
  color: white;
}

.day.today {
  border: 2px solid #B998C8;
}

.day.disabled {
  color: rgba(151, 112, 169, 0.3);
  cursor: not-allowed;
}

.day.disabled:hover {
  background: transparent;
}

.password-field-wrapper {
  position: relative;
  width: 100%;
}

.password-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 1.2rem;
  user-select: none;
  z-index: 2;
  transition: transform 0.2s ease;
}

.password-toggle:hover {
  transform: translateY(-50%) scale(1.1);
}

.gender-group {
  margin-top: 12px;
}

.gender-main-label {
  font-size: 1rem;
  margin-bottom: 12px;
}

.gender-options {
  display: flex;
  gap: 30px;
  margin-bottom: 6px;
}

.gender-option {
  display: flex;
  align-items: center;
  gap: 10px;
}

.radio-input {
  display: none;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.radio-btn {
  width: 20px;
  height: 20px;
  background: #B998C8;
  border-radius: 50%;
  border: 2px solid rgba(237, 221, 236, 0.9);
  transition: all 0.3s ease;
  position: relative;
}

.radio-input:checked + .radio-label .radio-btn {
  background: #9770A9;
  border-color: #9770A9;
}

.radio-input:checked + .radio-label .radio-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
}

.radio-label:hover .radio-btn {
  transform: scale(1.1);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
}

.create-account-btn {
  width: 100%;
  height: 60px;
  background: #CFB9F2;
  border-radius: 30px;
  border: 2px solid rgba(237, 221, 236, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-account-btn:hover:not(.disabled) {
  background: #B998C8;
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(151, 112, 169, 0.2);
}

.create-account-btn.disabled {
  background: #E0D0E9;
  cursor: not-allowed;
  opacity: 0.7;
}

.create-account-btn.disabled:hover {
  transform: none;
  box-shadow: none;
}

.create-account-text {
  color: #3A2D34;
  font-size: 1.1rem;
  font-family: 'KyivType Sans', Arial, sans-serif;
  font-weight: 840;
  text-align: center;
}

.login-link {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.login-link:hover {
  transform: translateY(-1px);
}

.have-account {
  color: #9770A9;
  font-size: 0.9rem;
  font-family: 'KyivType Sans', Arial, sans-serif;
}

.login-text {
  color: #3A2D34;
  font-size: 0.9rem;
  font-family: 'KyivType Sans', Arial, sans-serif;
  font-weight: 840;
  text-decoration: underline;
}

.error-message {
  color: #ff4757;
  font-size: 0.8rem;
  font-family: 'KyivType Sans', Arial, sans-serif;
  margin-top: 5px;
}

.password-strength {
  margin-top: 8px;
}

.strength-bar {
  height: 4px;
  border-radius: 2px;
  margin-bottom: 4px;
  transition: all 0.3s ease;
}

.strength-bar.weak {
  width: 33%;
  background: #ff4757;
}

.strength-bar.medium {
  width: 66%;
  background: #ffa502;
}

.strength-bar.strong {
  width: 100%;
  background: #2ed573;
}

.strength-text {
  color: #9770A9;
  font-size: 0.8rem;
  font-family: 'KyivType Sans', Arial, sans-serif;
}
</style>