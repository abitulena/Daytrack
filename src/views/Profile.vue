<template>
  <div class="profile-container">
    <!-- Фоновое изображение -->
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

    <!-- Основной контент -->
    <div class="profile-content">
      <div class="profile-window">
        <div class="profile-title">профиль</div>
        
        <!-- Аватар -->
        <div class="avatar-section">
          <div class="avatar-preview" @click="triggerFileInput">
            <img v-if="avatarPreview" :src="avatarPreview" alt="Avatar" class="avatar-image-large" />
            <div v-else class="avatar-placeholder">
              <div class="plus-icon">+</div>
            </div>
            <div class="avatar-overlay">
              <div class="change-text">изменить фото</div>
            </div>
          </div>
        </div>
        
        <!-- Информация пользователя -->
        <div class="user-info">
          <div class="form-group">
            <div class="label login-label">логин</div>
            <input 
              v-model="userName" 
              type="text" 
              class="input-field"
              placeholder="Введите ваш логин"
              maxlength="20"
            />
          </div>

          <div class="form-group">
            <div class="label email-label">эл. почта</div>
            <input 
              v-model="userEmail" 
              type="email" 
              class="input-field"
              placeholder="example@mail.com"
              readonly
            />
          </div>

          <div class="form-group">
            <div class="label gender-label">пол</div>
            <input 
              v-model="userGender" 
              type="text" 
              class="input-field"
              readonly
            />
          </div>

          <div class="form-group">
            <div class="label birthdate-label">дата рождения</div>
            <input 
              v-model="userBirthdate" 
              type="text" 
              class="input-field"
              readonly
            />
          </div>
        </div>
        
        <!-- Кнопки действий -->
        <div class="action-buttons">
          <button class="save-btn" @click="saveProfile">
            сохранить
          </button>
          <button class="home-btn" @click="goToHome">
            на главную
          </button>
          <button class="logout-btn" @click="logout">
            выйти из аккаунта
          </button>
        </div>
      </div>
    </div>

    <!-- Скрытый input для выбора файла -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleAvatarSelect"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const fileInput = ref(null)

// Данные пользователя
const userName = ref('')
const userEmail = ref('')
const userGender = ref('')
const userBirthdate = ref('')
const avatarPreview = ref('')
const selectedFile = ref(null)

// Загрузка данных пользователя
const loadUserData = () => {
  const savedUserName = localStorage.getItem('daytrack_username')
  const savedAvatar = localStorage.getItem('daytrack_avatar')
  const savedUserData = localStorage.getItem('daytrack_user')
  
  if (savedUserName) {
    userName.value = savedUserName
  }
  
  if (savedAvatar) {
    avatarPreview.value = savedAvatar
  }

  // Загружаем дополнительные данные пользователя
  if (savedUserData) {
    try {
      const userData = JSON.parse(savedUserData)
      userEmail.value = userData.email || ''
      
      // Преобразуем пол в читаемый формат
      if (userData.gender === 'female') {
        userGender.value = 'женщина'
      } else if (userData.gender === 'male') {
        userGender.value = 'мужчина'
      } else {
        userGender.value = userData.gender || ''
      }
      
      // Форматируем дату рождения
      if (userData.birthdate) {
        userBirthdate.value = userData.birthdate
      }
    } catch (error) {
      console.error('Ошибка загрузки данных пользователя:', error)
    }
  }
}

// Сжатие изображения
const compressImage = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Изменяем размер если нужно
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Конвертируем в base64 с качеством
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
        
        // Конвертируем base64 обратно в Blob
        const byteString = atob(compressedBase64.split(',')[1])
        const mimeString = compressedBase64.split(',')[0].split(':')[1].split(';')[0]
        const ab = new ArrayBuffer(byteString.length)
        const ia = new Uint8Array(ab)
        
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i)
        }
        
        const compressedBlob = new Blob([ab], { type: mimeString })
        
        console.log(`📊 Сжатие: ${(file.size / (1024 * 1024)).toFixed(2)}MB -> ${(compressedBlob.size / (1024 * 1024)).toFixed(2)}MB`)
        
        resolve(compressedBlob)
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Открытие выбора файла
const triggerFileInput = () => {
  fileInput.value.click()
}

// Обработка выбора аватарки
const handleAvatarSelect = async (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return
  
  const file = files[0]
  
  // Проверяем тип файла
  if (!file.type.startsWith('image/')) {
    alert('Пожалуйста, выберите изображение')
    return
  }
  
  // Увеличиваем максимальный размер до 10MB
  if (file.size > 10 * 1024 * 1024) {
    alert('Файл слишком большой. Максимальный размер: 10MB')
    return
  }
  
  try {
    // Сжимаем изображение если оно больше 2MB
    let processedFile = file
    if (file.size > 2 * 1024 * 1024) {
      console.log('🔄 Сжатие изображения...')
      processedFile = await compressImage(file)
    }
    
    const reader = new FileReader()
    
    reader.onload = (e) => {
      avatarPreview.value = e.target.result
      selectedFile.value = processedFile
    }
    
    reader.onerror = () => {
      alert('Ошибка загрузки файла')
    }
    
    reader.readAsDataURL(processedFile)
    
  } catch (error) {
    console.error('Ошибка обработки изображения:', error)
    alert('Ошибка обработки изображения. Попробуйте другой файл.')
  }
}

// Сохранение профиля
const saveProfile = () => {
  if (!userName.value.trim()) {
    alert('Пожалуйста, введите логин')
    return
  }
  
  // Сохраняем логин
  localStorage.setItem('daytrack_username', userName.value.trim())
  
  // Сохраняем аватар если он был выбран
  if (avatarPreview.value) {
    localStorage.setItem('daytrack_avatar', avatarPreview.value)
  }
  
  // Триггерим событие для обновления шапки
  window.dispatchEvent(new Event('storage'))
  
  alert('Профиль сохранен!')
  router.back()
}

// Выход из аккаунта
const logout = () => {
  if (confirm('Вы уверены, что хотите выйти из аккаунта?')) {
    // Очищаем все данные пользователя
    localStorage.removeItem('daytrack_username')
    localStorage.removeItem('daytrack_avatar')
    localStorage.removeItem('daytrack_user')
    localStorage.removeItem('daytrack_mood_data')
    localStorage.removeItem('daytrack_sleep_data')
    localStorage.removeItem('daytrack_notes_data')
    localStorage.removeItem('daytrack_event_data')
    localStorage.removeItem('daytrack_achievements_data')
    localStorage.removeItem('daytrack_custom_hashtags')
    localStorage.removeItem('daytrack_logged_in')
    
    // Перенаправляем на страницу входа (корневой путь)
    router.push('/')
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
.profile-container {
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

.profile-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 10px;
}

.profile-window {
  width: 420px;
  height: auto;
  min-height: 480px; /* Уменьшена высота */
  background: rgba(237, 221, 236, 0.9);
  border-radius: 30px;
  border: 2px solid rgba(237, 221, 236, 0.95);
  padding: 25px 30px 20px 30px; /* Уменьшены отступы */
  display: flex;
  flex-direction: column;
  box-shadow: 0 15px 30px rgba(151, 112, 169, 0.2);
  position: relative;
  z-index: 1;
}

.profile-title {
  color: #3A2D34;
  font-size: 2rem;
  font-family: 'KyivType Sans', Arial, sans-serif;
  font-weight: 840;
  margin-bottom: 20px; /* Уменьшен отступ */
  text-align: center;
}

/* Стили для аватара */
.avatar-section {
  margin-bottom: 20px; /* Уменьшен отступ */
  display: flex;
  justify-content: center;
}

.avatar-preview {
  width: 100px; /* Уменьшен размер аватара */
  height: 100px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  border: 3px solid #B998C8;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.avatar-preview:hover {
  transform: scale(1.05);
  border-color: #9770A9;
}

.avatar-preview:hover .avatar-overlay {
  opacity: 1;
}

.avatar-image-large {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9770A9;
  font-size: 30px; /* Уменьшен размер плюса */
}

.plus-icon {
  font-size: 35px;
  font-weight: 300;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(63, 42, 82, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 50%;
}

.change-text {
  color: white;
  font-size: 11px; /* Уменьшен размер текста */
  font-family: 'KyivType Sans';
  font-weight: 840;
  text-align: center;
}

/* Стили формы */
.user-info {
  width: 100%;
  margin-bottom: 20px; /* Уменьшен отступ */
}

.form-group {
  position: relative;
  margin-bottom: 15px; /* Уменьшен отступ */
  width: 100%;
}

.label {
  color: #9770A9;
  font-size: 0.9rem; /* Уменьшен размер шрифта */
  font-family: 'KyivType Sans', Arial, sans-serif;
  font-weight: 840;
  margin-bottom: 6px; /* Уменьшен отступ */
  display: block;
}

.input-field {
  width: 100%;
  height: 35px; /* Уменьшена высота */
  background: transparent !important;
  border: none;
  border-bottom: 2px solid rgba(237, 221, 236, 0.9);
  color: #9770A9;
  font-size: 0.9rem; /* Уменьшен размер шрифта */
  font-family: 'KyivType Sans', Arial, sans-serif;
  padding: 6px 0; /* Уменьшены отступы */
  outline: none;
  transition: border-color 0.3s ease;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  caret-color: #9770A9;
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
  font-size: 0.9rem;
}

.input-field:focus {
  border-bottom-color: #B998C8;
  background: transparent !important;
  outline: none;
  box-shadow: none;
}

.input-field::placeholder {
  color: rgba(151, 112, 169, 0.6);
  font-size: 0.85rem; /* Уменьшен размер шрифта */
  font-family: 'KyivType Sans', Arial, sans-serif;
}

.input-field:read-only {
  color: rgba(151, 112, 169, 0.7);
  cursor: not-allowed;
}

.input-field:focus-visible {
  outline: none;
}

.input-field:active {
  background: transparent !important;
}

/* Кнопки действий */
.action-buttons {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 10px;
  gap: 10px; /* Отступ между кнопками */
}

.save-btn {
  width: 100%;
  height: 45px; /* Уменьшена высота */
  background: #CFB9F2;
  border-radius: 25px; /* Уменьшен радиус */
  border: 2px solid rgba(237, 221, 236, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #3A2D34;
  font-size: 1rem; /* Уменьшен размер шрифта */
  font-family: 'KyivType Sans', Arial, sans-serif;
  font-weight: 840;
}

.save-btn:hover {
  background: #B998C8;
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(151, 112, 169, 0.2);
}

.home-btn {
  width: 100%;
  height: 45px;
  background: #B998C8;
  border-radius: 25px;
  border: 2px solid rgba(237, 221, 236, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  font-size: 1rem;
  font-family: 'KyivType Sans', Arial, sans-serif;
  font-weight: 840;
}

.home-btn:hover {
  background: #A589B3;
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(151, 112, 169, 0.2);
}

.logout-btn {
  width: 100%;
  height: 45px;
  background: #e74c3c;
  border-radius: 25px;
  border: 2px solid rgba(237, 221, 236, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  font-size: 1rem;
  font-family: 'KyivType Sans', Arial, sans-serif;
  font-weight: 840;
}

.logout-btn:hover {
  background: #c0392b;
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(220, 53, 69, 0.2);
}
</style>