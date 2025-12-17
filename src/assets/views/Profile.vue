<template>
  <div class="profile-container">
    <!-- Фоновое изображение -->
    <img 
      src="@/assets/lavanderall.png" 
      alt="Background" 
      class="background-image"
    >
    
    <!-- Компонент уведомлений -->
    <notifications position="top right" width="400" :max="3" :duration="8000" />
    
    <!-- Модальное окно подтверждения выхода -->
    <div v-if="showLogoutModal" class="logout-modal-overlay" @click="closeLogoutModal">
      <div class="logout-modal" @click.stop>
        <div class="logout-modal-header">
          <div class="logout-modal-title">⚠️ Подтверждение выхода</div>
          <button class="logout-modal-close" @click="closeLogoutModal">×</button>
        </div>
        <div class="logout-modal-content">
          <p>Вы уверены, что хотите выйти из аккаунта?</p>
          <p class="logout-warning">Все данные будут сохранены на этом устройстве.</p>
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
          <button class="logout-btn" @click="showLogoutModal = true">
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
import { notify } from "@kyvg/vue3-notification"

const router = useRouter()
const fileInput = ref(null)

// Данные пользователя
const userName = ref('')
const userEmail = ref('')
const userGender = ref('')
const userBirthdate = ref('')
const avatarPreview = ref('')
const selectedFile = ref(null)
const showLogoutModal = ref(false)

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
    showNotification('error', 'Пожалуйста, выберите изображение', '❌ Ошибка')
    return
  }
  
  // Увеличиваем максимальный размер до 10MB
  if (file.size > 10 * 1024 * 1024) {
    showNotification('error', 'Файл слишком большой. Максимальный размер: 10MB', '❌ Ошибка')
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
      showNotification('success', 'Аватар загружен!', '✅ Успешно')
    }
    
    reader.onerror = () => {
      showNotification('error', 'Ошибка загрузки файла', '❌ Ошибка')
    }
    
    reader.readAsDataURL(processedFile)
    
  } catch (error) {
    console.error('Ошибка обработки изображения:', error)
    showNotification('error', 'Ошибка обработки изображения. Попробуйте другой файл.', '❌ Ошибка')
  }
}

// Сохранение профиля
const saveProfile = () => {
  if (!userName.value.trim()) {
    showNotification('warn', 'Пожалуйста, введите логин', '⚠️ Внимание')
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
  
  showNotification('success', 'Профиль успешно сохранен!', '✅ Успешно')
  
  // НЕ переходим на главную, остаемся в профиле
}

// Закрытие модального окна выхода
const closeLogoutModal = () => {
  showLogoutModal.value = false
}

// Подтверждение выхода
const confirmLogout = () => {
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
  
  closeLogoutModal()
  
  // Через 1 секунду перенаправляем на страницу входа
  setTimeout(() => {
    router.push('/')
  }, 1000)
}

// Переход на главную
const goToHome = () => {
  router.push('/home')
}

// Показ обычного уведомления
const showNotification = (type, text, title) => {
  notify({
    title: title,
    text: text,
    type: type,
    duration: 5000,
    speed: 1000
  })
}

// Хуки жизненного цикла
onMounted(() => {
  loadUserData()
})
</script>

<style scoped>
@import '@/components/Profile.css';
</style>