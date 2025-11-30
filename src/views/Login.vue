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

<script>
export default {
  name: 'Login',
  data() {
    return {
      loginData: {
        email: '',
        password: ''
      },
      errors: {
        email: '',
        password: ''
      },
      showPassword: false,
      isFormValid: false
    }
  },
  methods: {
    validateForm() {
      // Валидация email
      if (!this.loginData.email.trim()) {
        this.errors.email = 'Email обязателен';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.loginData.email)) {
          this.errors.email = 'Введите корректный email адрес';
        } else {
          this.errors.email = '';
        }
      }
      
      // Валидация пароля
      if (!this.loginData.password) {
        this.errors.password = 'Пароль обязателен';
      } else {
        this.errors.password = '';
      }
      
      // Проверка валидности формы
      const hasErrors = Object.values(this.errors).some(error => error !== '');
      const allFieldsFilled = Object.values(this.loginData).every(field => field !== '');
      
      this.isFormValid = allFieldsFilled && !hasErrors;
    },
    
    handleLogin() {
      this.validateForm();
      
      if (!this.isFormValid) {
        alert('Пожалуйста, заполните все поля корректно!');
        return;
      }
      
      // Проверяем существование пользователя
      const userData = localStorage.getItem('daytrack_user');
      if (userData) {
        const user = JSON.parse(userData);
        
        // Простая проверка email и пароля
        if (user.email === this.loginData.email && user.password === this.loginData.password) {
          // Сохраняем информацию о входе и логин пользователя
          localStorage.setItem('daytrack_logged_in', 'true');
          localStorage.setItem('daytrack_username', user.login); // Сохраняем логин
          this.goToHome();
        } else {
          alert('Неверный email или пароль!');
        }
      } else {
        alert('Аккаунт не найден. Пожалуйста, зарегистрируйтесь.');
      }
    },
    
    goToHome() {
      this.$router.push('/home');
    },
    
    goToRegistration() {
      this.$router.push('/registration');
    }
  }
}
</script>

<style scoped>
.login-container {
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
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
  margin-top: -50px;
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

.login-window {
  width: 420px;
  height: auto;
  min-height: 420px;
  background: rgba(237, 221, 236, 0.9);
  border-radius: 30px;
  border: 2px solid rgba(237, 221, 236, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 30px 25px 30px;
  position: relative;
  z-index: 1;
  box-shadow: 0 15px 30px rgba(151, 112, 169, 0.2);
  margin-top: 10px;
}

.login-title {
  color: #3A2D34;
  font-size: 2rem;
  font-family: 'KyivType Sans', Arial, sans-serif;
  font-weight: 840;
  margin-bottom: 30px;
}

.form-group {
  width: 100%;
  margin-bottom: 20px;
  position: relative;
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
}

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

.input-field:focus {
  border-bottom-color: #B998C8;
  background: transparent !important;
}

.input-field::placeholder {
  color: rgba(151, 112, 169, 0.6);
  font-size: 0.9rem;
  font-family: 'KyivType Sans', Arial, sans-serif;
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

.action-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
  width: 100%;
}

.login-btn {
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

.login-btn:hover:not(.disabled) {
  background: #B998C8;
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(151, 112, 169, 0.2);
}

.login-btn.disabled {
  background: #E0D0E9;
  cursor: not-allowed;
  opacity: 0.7;
}

.login-btn.disabled:hover {
  transform: none;
  box-shadow: none;
}

.login-btn-text {
  color: #3A2D34;
  font-size: 1.1rem;
  font-family: 'KyivType Sans', Arial, sans-serif;
  font-weight: 840;
  text-align: center;
}

.register-link {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.register-link:hover {
  transform: translateY(-1px);
}

.no-account {
  color: #9770A9;
  font-size: 0.9rem;
  font-family: 'KyivType Sans', Arial, sans-serif;
}

.register-text {
  color: #3A2D34;
  font-size: 0.9rem;
  font-family: 'KyivType Sans', Arial, sans-serif;
  font-weight: 840;
  text-decoration: underline;
}

.error-message {
  color: #e74c3c;
  font-size: 0.8rem;
  font-family: 'KyivType Sans', Arial, sans-serif;
  margin-top: 5px;
  font-weight: 600;
  position: absolute;
  bottom: -20px;
  left: 0;
}
</style>