<template>
  <div class="container">
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
            @blur="hideDatepicker"
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
          <div class="custom-datepicker" v-if="showDatepicker">
            <div class="datepicker-header">
              <button type="button" @click="prevMonth">&lt;</button>
              <span class="current-month">{{ currentMonth }} {{ currentYear }}</span>
              <button type="button" @click="nextMonth">&gt;</button>
            </div>
            <div class="datepicker-days">
              <div class="day-header" v-for="day in ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']" :key="day">
                {{ day }}
              </div>
              <div 
                v-for="day in calendarDays" 
                :key="day.date"
                class="day"
                :class="{
                  'other-month': !day.isCurrentMonth,
                  'selected': day.isSelected,
                  'today': day.isToday
                }"
                @click="selectDate(day)"
              >
                {{ day.day }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="form-group">
        <div class="label email-label">эл. почта</div>
        <input 
          v-model="formData.email" 
          type="email" 
          class="input-field"
          placeholder="example@mail.com"
          @input="validateForm"
        >
      </div>
      
      <div class="form-group">
        <div class="label password-label">пароль</div>
        <div class="password-field-wrapper">
          <input 
            v-model="formData.password" 
            :type="showPassword ? 'text' : 'password'" 
            class="input-field"
            placeholder="Введите пароль"
            @input="validateForm"
          >
          <span class="password-toggle" @click="showPassword = !showPassword">
            {{ showPassword ? '👁️' : '👁️‍🗨️' }}
          </span>
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
      </div>
      
      <div 
        class="create-account-btn" 
        :class="{ 'disabled': !isFormValid }"
        @click="handleRegistration"
      >
        <div class="create-account-text">
          {{ isFormValid ? 'создать аккаунт' : 'заполните все поля' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      formData: {
        login: '',
        birthdate: '',
        email: '',
        password: '',
        gender: ''
      },
      showPassword: false,
      isFormValid: false,
      showDatepicker: false,
      currentDate: new Date(),
      selectedDate: null
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
      
      // Первый день месяца
      const firstDay = new Date(year, month, 1);
      // Последний день месяца
      const lastDay = new Date(year, month + 1, 0);
      
      // День недели первого дня (0 - воскресенье, 1 - понедельник и т.д.)
      const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
      
      // Количество дней в предыдущем месяце
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      
      const days = [];
      
      // Дни предыдущего месяца
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const day = prevMonthLastDay - i;
        days.push({
          day: day,
          date: new Date(year, month - 1, day),
          isCurrentMonth: false,
          isSelected: this.isSameDay(this.selectedDate, new Date(year, month - 1, day)),
          isToday: this.isToday(new Date(year, month - 1, day))
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
          isToday: this.isToday(date)
        });
      }
      
      // Дни следующего месяца
      const totalCells = 42; // 6 недель
      const nextMonthDays = totalCells - days.length;
      for (let i = 1; i <= nextMonthDays; i++) {
        days.push({
          day: i,
          date: new Date(year, month + 1, i),
          isCurrentMonth: false,
          isSelected: this.isSameDay(this.selectedDate, new Date(year, month + 1, i)),
          isToday: this.isToday(new Date(year, month + 1, i))
        });
      }
      
      return days;
    }
  },
  methods: {
    validateForm() {
      // Проверяем, что все поля заполнены
      this.isFormValid = 
        this.formData.login.trim() !== '' &&
        this.formData.birthdate !== '' &&
        this.formData.email.trim() !== '' &&
        this.formData.password.trim() !== '' &&
        this.formData.gender !== '';
    },
    
    handleRegistration() {
      if (!this.isFormValid) {
        alert('Пожалуйста, заполните все поля формы!');
        return;
      }
      
      console.log('Данные регистрации:', this.formData);
      alert('Регистрация завершена!');
      
      // Сброс формы после успешной регистрации
      this.formData = {
        login: '',
        birthdate: '',
        email: '',
        password: '',
        gender: ''
      };
      this.selectedDate = null;
      this.isFormValid = false;
    },
    
    toggleDatepicker() {
      this.showDatepicker = !this.showDatepicker;
    },
    
    hideDatepicker() {
      setTimeout(() => {
        this.showDatepicker = false;
      }, 200);
    },
    
    prevMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    },
    
    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    },
    
    selectDate(day) {
      this.selectedDate = day.date;
      const formattedDate = this.formatDate(day.date);
      this.formData.birthdate = formattedDate;
      this.showDatepicker = false;
      this.validateForm();
    },
    
    formatDate(date) {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    },
    
    formatDateInput(event) {
      let value = event.target.value.replace(/[^\d.]/g, '');
      
      // Автоматическое добавление точек
      if (value.length === 2 && !value.includes('.')) {
        value = value + '.';
      } else if (value.length === 5 && value.split('.')[1]?.length === 2) {
        value = value + '.';
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
    }
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Убираем возможность скролла */
html, body {
  overflow: hidden;
  height: 100%;
}

.container {
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

/* Фоновая картинка - сделана ярче */
.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
  opacity: 0.5; /* Увеличили прозрачность с 0.3 до 0.5 */
  filter: brightness(1.1) saturate(1.2); /* Добавили яркость и насыщенность */
}

/* Welcome Text - подняли выше */
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

/* Основное окно регистрации - уменьшили снизу на 1см */
.registration-window {
  width: 420px;
  height: auto;
  min-height: 540px; /* Уменьшили на 40px (~1см) */
  background: rgba(237, 221, 236, 0.9);
  border-radius: 30px;
  border: 2px solid rgba(237, 221, 236, 0.95);
  padding: 30px 30px 25px 30px; /* Уменьшили нижний padding */
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
  margin-bottom: 18px; /* Немного уменьшили отступы между полями */
}

.label {
  color: #9770A9;
  font-size: 1rem;
  font-family: 'KyivType Sans', Arial, sans-serif;
  font-weight: 840;
  margin-bottom: 8px;
  display: block;
}

/* Стили для полей ввода - убрали белый фон */
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
}

/* Убираем белый фон при автозаполнении */
.input-field:-webkit-autofill,
.input-field:-webkit-autofill:hover,
.input-field:-webkit-autofill:focus {
  -webkit-text-fill-color: #9770A9 !important;
  -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
  transition: background-color 5000s ease-in-out 0s;
  background: transparent !important;
}

.input-field:focus {
  border-bottom-color: #B998C8;
  background: transparent !important;
}

.input-field::placeholder {
  color: rgba(151, 112, 169, 0.6);
  font-size: 0.9rem;
  font-family: 'KyivType Sans', Arial, sans-serif;
}

/* Обертка для поля даты */
.date-input-wrapper {
  position: relative;
  width: 100%;
}

/* Исправленное поле даты */
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
}

.calendar-icon:hover {
  transform: translateY(-50%) scale(1.1);
}

.calendar-icon svg {
  filter: drop-shadow(0px 2px 2px rgba(151, 112, 169, 0.3));
}

/* Кастомный datepicker */
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
}

.datepicker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.datepicker-header button {
  background: #B998C8;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.datepicker-header button:hover {
  background: #9770A9;
}

.current-month {
  color: #3A2D34;
  font-family: 'KyivType Sans', Arial, sans-serif;
  font-weight: 840;
  font-size: 0.9rem;
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

.day:hover {
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

/* Обертка для поля пароля */
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
}

/* Стили для радио-кнопок */
.gender-group {
  margin-top: 12px; /* Уменьшили отступ сверху */
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

/* Увеличенная кнопка создать аккаунт */
.create-account-btn {
  width: 100%;
  height: 60px; /* Немного уменьшили высоту кнопки */
  background: #CFB9F2;
  border-radius: 30px;
  border: 2px solid rgba(237, 221, 236, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px; /* Уменьшили отступ сверху */
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
  color: #9770A9;
  font-size: 1.4rem;
  font-family: 'KyivType Sans', Arial, sans-serif;
  font-weight: 840;
  text-align: center;
}

.create-account-btn.disabled .create-account-text {
  color: rgba(151, 112, 169, 0.6);
  font-size: 1.2rem;
}

/* Адаптивность */
@media (max-width: 1366px) {
  .welcome-text {
    margin-bottom: 5px;
  }
  
  .welcome-part,
  .app-name {
    font-size: 2rem;
  }
  
  .registration-window {
    width: 380px;
    min-height: 520px; /* Уменьшили для адаптива */
    padding: 25px 25px 20px 25px;
    margin-top: 5px;
  }
  
  .registration-title {
    font-size: 1.8rem;
  }
  
  .create-account-btn {
    height: 55px;
  }
  
  .create-account-text {
    font-size: 1.3rem;
  }
  
  .create-account-btn.disabled .create-account-text {
    font-size: 1.1rem;
  }
}

@media (max-width: 1024px) {
  .welcome-text {
    margin-bottom: 5px;
  }
  
  .welcome-part,
  .app-name {
    font-size: 1.8rem;
  }
  
  .registration-window {
    width: 350px;
    min-height: 500px; /* Уменьшили для адаптива */
    padding: 20px 20px 15px 20px;
    margin-top: 5px;
  }
  
  .registration-title {
    font-size: 1.6rem;
  }
  
  .label {
    font-size: 0.9rem;
  }
  
  .create-account-btn {
    height: 50px;
  }
  
  .create-account-text {
    font-size: 1.2rem;
  }
  
  .create-account-btn.disabled .create-account-text {
    font-size: 1rem;
  }
}
</style>