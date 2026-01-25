<template>
  <div class="notes-container">
    <!-- Фоновое изображение -->
    <div class="background-image"></div>
    
    <!-- Шапка страницы -->
    <Header />
    
    <!-- Основной контент -->
    <div class="main-content">
      <!-- Левая часть - поле для записей -->
      <div class="notes-field-section">
        <div class="section-background"></div>
        <div class="section-content">
          <div class="date-header">
            <div class="selected-date">{{ formattedSelectedDate }}</div>
            <div class="buttons-container">
              <button class="hashtag-btn" @click="showHashtagList = !showHashtagList">
                добавить хештег
              </button>
              <button class="save-notes-btn" @click="saveNotes">
                сохранить запись
              </button>
              <button class="home-btn" @click="goToHome">
                на главную
              </button>
            </div>
          </div>
          
          <!-- Список хештегов -->
          <div v-if="showHashtagList" class="hashtag-list">
            <div class="hashtag-title">выберите хештег:</div>
            <div class="hashtag-items">
              <!-- Хештеги с сервера -->
              <div 
                v-for="hashtag in serverHashtags" 
                :key="'hashtag-' + hashtag.id"
                class="hashtag-item"
                :class="{ 'custom-hashtag': hashtag.is_custom }"
                @click="addHashtag(hashtag.tag_name)"
              >
                #{{ hashtag.tag_name }}
              </div>
              
              <!-- Поле для добавления нового хештега -->
              <div class="custom-hashtag-input">
                <input 
                  v-model="newCustomHashtag"
                  type="text"
                  placeholder="введите свой хештег..."
                  class="hashtag-input"
                  @keypress.enter="addCustomHashtag"
                  maxlength="20"
                />
                <button class="add-custom-btn" @click="addCustomHashtag">
                  +
                </button>
              </div>
            </div>
          </div>
          
          <div class="textarea-container">
            <textarea 
              v-model="currentNotesText"
              class="notes-textarea"
              placeholder="Начните писать здесь..."
              @input="handleTextInput"
              ref="textarea"
            ></textarea>
            <div class="text-lines-background" :style="linesStyle"></div>
          </div>
        </div>
      </div>
      
      <!-- Правая часть - вопросы -->
      <div class="questions-section">
        <div class="questions-title">не знаешь о чем писать?<br/>можешь ответить на эти вопросы:</div>
        <div class="questions-list">
          <div 
            v-for="(question, index) in currentQuestions" 
            :key="index"
            class="question-item"
          >
            <div class="question-plate">
              <div class="question-text">{{ question }}</div>
            </div>
          </div>
        </div>
        <button class="refresh-btn" @click="refreshQuestions">
          обновить вопросы
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'

const router = useRouter()

// Реактивные данные
const currentNotesText = ref('')
const currentQuestions = ref([])
const selectedDate = ref(new Date())
const scrollPosition = ref(0)
const showHashtagList = ref(false)
const newCustomHashtag = ref('')
const serverHashtags = ref([])
const existingEntry = ref(null)
const isLoading = ref(false)

// Вопросы для вдохновения
const allQuestions = [
  'Что я чувствую прямо сейчас?',
  'За что я благодарен сегодня?',
  'Что вызвало у меня улыбку?',
  'Какой урок я извлек сегодня?',
  'Что бы я хотел изменить в этом дне?',
  'Какое решение я принял сегодня?',
  'С кем я пообщался и какие эмоции испытал?',
  'Что нового я узнал о себе?',
  'Как я позаботился о своем здоровье?',
  'Что вдохновило меня сегодня?',
  'Какие мысли меня беспокоили?',
  'Что я сделал для своих целей?',
  'Какой момент дня был самым ярким?',
  'Что помогло мне справиться со стрессом?',
  'О чем я мечтал сегодня?',
  'Что я хочу запомнить из этого дня?',
  'Как я отдохнул и восстановил силы?',
  'Что заставило меня задуматься?',
  'Какой совет я бы дал себе утром?',
  'Что делает этот день особенным?'
]

// Вычисляемые свойства
const formattedSelectedDate = computed(() => {
  const options = { day: 'numeric', month: 'long', year: 'numeric' }
  return selectedDate.value.toLocaleDateString('ru-RU', options)
})

const linesStyle = computed(() => {
  return {
    'background-position': `0 ${-scrollPosition.value}px`
  }
})

// Загрузка хештегов с сервера
const loadHashtags = async () => {
  try {
    const token = localStorage.getItem('access_token')
    
    if (!token) {
      throw new Error('Требуется авторизация')
    }
    
    // Согласно API: GET /api/hashtags - получить все хэштеги
    const response = await fetch('http://localhost:5000/api/hashtags', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Ошибка загрузки хештегов: ${response.status}`)
    }
    
    const data = await response.json()
    if (data.success && data.hashtag) {
      serverHashtags.value = data.hashtag
    }
    
  } catch (error) {
    console.error('❌ Ошибка загрузки хештегов:', error)
  }
}

// Создание нового хештега на сервере
const addCustomHashtag = async () => {
  if (!newCustomHashtag.value.trim()) return
  
  try {
    const token = localStorage.getItem('access_token')
    
    if (!token) {
      throw new Error('Требуется авторизация')
    }
    
    // Согласно API: POST /api/hashtags - создать хэштег
    const response = await fetch('http://localhost:5000/api/hashtags', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tag_name: newCustomHashtag.value.trim().toLowerCase()
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Ошибка создания хештега')
    }
    
    const data = await response.json()
    if (data.success) {
      // Добавляем новый хештег в список
      serverHashtags.value.push({
        id: data.id || Date.now(),
        tag_name: newCustomHashtag.value.trim().toLowerCase(),
        is_custom: true
      })
      
      addHashtag(newCustomHashtag.value.trim())
      newCustomHashtag.value = ''
    }
    
  } catch (error) {
    console.error('❌ Ошибка создания хештега:', error)
    alert(error.message || 'Не удалось создать хештег')
  }
}

// Загрузка существующей записи для выбранной даты
const loadExistingEntry = async () => {
  try {
    const token = localStorage.getItem('access_token')
    
    if (!token) {
      throw new Error('Требуется авторизация')
    }
    
    // Форматируем дату для поиска
    const dateStr = selectedDate.value.toISOString().split('T')[0]
    
    // Согласно API: GET /api/search/entries - поиск записей
    // Ищем записи по дате (нужно будет адаптировать API для поиска по конкретной дате)
    const response = await fetch(`http://localhost:5000/api/search/entries?date=${dateStr}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.entries && data.entries.length > 0) {
        // Предполагаем, что API возвращает записи за конкретную дату
        existingEntry.value = data.entries[0]
        currentNotesText.value = existingEntry.value.content || existingEntry.value.text || ''
      }
    }
    
  } catch (error) {
    console.error('❌ Ошибка загрузки записи:', error)
  }
}

// Сохранение записи на сервер
const saveNotes = async () => {
  if (!currentNotesText.value.trim()) {
    alert('Запись не может быть пустой')
    return
  }
  
  isLoading.value = true
  
  try {
    const token = localStorage.getItem('access_token')
    
    if (!token) {
      throw new Error('Требуется авторизация')
    }
    
    // Форматируем дату
    const dateStr = selectedDate.value.toISOString().split('T')[0]
    
    // Согласно API: POST /api/diary/entries - создать запись
    // PUT /api/diary/entries/:id - обновить запись
    const method = existingEntry.value ? 'PUT' : 'POST'
    const url = existingEntry.value 
      ? `http://localhost:5000/api/diary/entries/${existingEntry.value.id}`
      : 'http://localhost:5000/api/diary/entries'
    
    const response = await fetch(url, {
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: currentNotesText.value.trim(),
        entry_date: dateStr,
        // Добавляем другие поля если они есть в записи
        emotion_id: null, // можно добавить позже
        sleep_quality_id: null, // можно добавить позже
        hashtags: extractHashtags(currentNotesText.value.trim())
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Ошибка сохранения записи: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Если это новая запись, сохраняем ID для возможного обновления
    if (method === 'POST' && data.id) {
      existingEntry.value = { id: data.id }
    }
    
    console.log('✅ Запись успешно сохранена на сервере')
    alert('Запись сохранена!')
    
    // Автоматически закрываем хештеги если они открыты
    showHashtagList.value = false
    
    // Обработка уведомлений о новой записи
    if (method === 'POST') {
      await handleNewEntryNotification(data.id)
    }
    
  } catch (error) {
    console.error('❌ Ошибка сохранения записи:', error)
    alert(error.message || 'Не удалось сохранить запись')
  } finally {
    isLoading.value = false
  }
}

// Извлечение хештегов из текста
const extractHashtags = (text) => {
  const hashtagRegex = /#(\w+)/g
  const matches = text.match(hashtagRegex)
  if (!matches) return []
  
  return matches.map(tag => tag.substring(1))
}

// Обработка уведомлений о новой записи
const handleNewEntryNotification = async (entryId) => {
  try {
    const token = localStorage.getItem('access_token')
    
    if (!token) return
    
    // Согласно API: POST /api/notifications/new-entry - обработать уведомления о новой записи
    await fetch('http://localhost:5000/api/notifications/new-entry', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        entry_id: entryId
      })
    })
    
  } catch (error) {
    console.warn('⚠️ Ошибка обработки уведомлений:', error)
  }
}

const refreshQuestions = () => {
  const shuffled = [...allQuestions]
    .sort(() => 0.5 - Math.random())
    .slice(0, 4)
  currentQuestions.value = shuffled
}

const handleTextInput = () => {
  const textarea = document.querySelector('.notes-textarea')
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 400) + 'px'
  }
}

const addHashtag = (hashtag) => {
  const hashtagText = ` #${hashtag}`
  
  if (currentNotesText.value.trim() === '') {
    currentNotesText.value = hashtagText.trim()
  } else {
    currentNotesText.value += hashtagText
  }
  
  // Прокручиваем вниз
  setTimeout(() => {
    const textarea = document.querySelector('.notes-textarea')
    if (textarea) {
      textarea.scrollTop = textarea.scrollHeight
      textarea.focus()
    }
  }, 0)
}

const goToHome = () => {
  router.push('/home')
}

const handleScroll = () => {
  const textarea = document.querySelector('.notes-textarea')
  if (textarea) {
    scrollPosition.value = textarea.scrollTop
  }
}

// Хуки жизненного цикла
onMounted(() => {
  loadHashtags()
  loadExistingEntry()
  refreshQuestions()
  
  const textarea = document.querySelector('.notes-textarea')
  if (textarea) {
    textarea.addEventListener('scroll', handleScroll)
    textarea.focus()
  }
})

onUnmounted(() => {
  const textarea = document.querySelector('.notes-textarea')
  if (textarea) {
    textarea.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
@import '@/styles/Notes.css';

/* Стили для кастомных хештегов */
.custom-hashtag {
  background-color: #e8f4f8 !important;
  border-color: #5d9cec !important;
  color: #2c3e50 !important;
}

.hashtag-item {
  transition: all 0.2s ease;
}

.hashtag-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.custom-hashtag-input {
  margin-top: 10px;
  display: flex;
  gap: 8px;
}

.hashtag-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.add-custom-btn {
  padding: 8px 16px;
  background-color: #9770A9;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-custom-btn:hover {
  background-color: #855c96;
}
</style>