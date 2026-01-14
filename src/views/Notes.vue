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
              <!-- Дефолтные хештеги (без удаления) -->
              <div 
                v-for="hashtag in defaultHashtags" 
                :key="hashtag"
                class="hashtag-item default-hashtag"
                @click="addHashtag(hashtag)"
              >
                #{{ hashtag }}
              </div>
              
              <!-- Кастомные хештеги (с возможностью удаления) -->
              <div 
                v-for="hashtag in customHashtags" 
                :key="'custom-' + hashtag"
                class="hashtag-item custom-hashtag"
                @click="addHashtag(hashtag)"
                @dblclick="removeCustomHashtag(hashtag)"
                :title="'Двойной клик для удаления #' + hashtag"
              >
                #{{ hashtag }}
                <span class="delete-hint">×</span>
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
const notesData = ref({})
const scrollPosition = ref(0)
const showHashtagList = ref(false)
const newCustomHashtag = ref('')

// Данные из localStorage
const customHashtags = ref([])

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

// Дефолтные хештеги
const defaultHashtags = [
  'любовь',
  'работа',
  'отдых',
  'здоровье',
  'друзья',
  'семья',
  'учеба',
  'хобби',
  'путешествие',
  'мечты'
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

// Получение ключа для данных пользователя
const getUserKey = (baseKey) => {
  const userId = localStorage.getItem('daytrack_user_id')
  return userId ? `${baseKey}_${userId}` : baseKey
}

// Основные методы
const loadSelectedDate = () => {
  const storedDate = localStorage.getItem('daytrack_selected_date')
  if (storedDate) {
    selectedDate.value = new Date(storedDate)
  }
}

const loadStoredNotes = () => {
  const notesKey = getUserKey('daytrack_notes_data')
  const storedNotesData = localStorage.getItem(notesKey)
  
  if (storedNotesData) {
    try {
      notesData.value = JSON.parse(storedNotesData)
    } catch (error) {
      console.error('Ошибка загрузки записей:', error)
      notesData.value = {}
    }
  } else {
    notesData.value = {}
  }
}

const loadCustomHashtags = () => {
  const hashtagsKey = getUserKey('daytrack_custom_hashtags')
  const stored = localStorage.getItem(hashtagsKey)
  customHashtags.value = stored ? JSON.parse(stored) : []
}

const saveCustomHashtags = () => {
  const hashtagsKey = getUserKey('daytrack_custom_hashtags')
  localStorage.setItem(hashtagsKey, JSON.stringify(customHashtags.value))
}

const loadNotesForDate = (date) => {
  const dateKey = date.toDateString()
  currentNotesText.value = notesData.value[dateKey]?.text || ''
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

const saveNotes = () => {
  const dateKey = selectedDate.value.toDateString()
  const notesKey = getUserKey('daytrack_notes_data')
  
  if (currentNotesText.value.trim()) {
    // Есть текст - сохраняем запись
    notesData.value[dateKey] = {
      text: currentNotesText.value.trim(),
      savedAt: new Date().toISOString()
    }
  } else {
    // Пустой текст - удаляем запись если она существовала
    delete notesData.value[dateKey]
  }
  
  // Сохраняем в localStorage
  localStorage.setItem(notesKey, JSON.stringify(notesData.value))
  
  // Отправляем событие storage для обновления данных
  window.dispatchEvent(new StorageEvent('storage', {
    key: notesKey,
    newValue: JSON.stringify(notesData.value),
    oldValue: localStorage.getItem(notesKey),
    storageArea: localStorage,
    url: window.location.href
  }))
  
  // Автоматически закрываем хештеги если они открыты
  showHashtagList.value = false
  
  console.log('✅ Запись сохранена для даты:', dateKey)
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

const addCustomHashtag = () => {
  if (newCustomHashtag.value.trim()) {
    const cleanHashtag = newCustomHashtag.value.trim()
      .replace(/#/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase()
    
    if (cleanHashtag) {
      if (!customHashtags.value.includes(cleanHashtag) && 
          !defaultHashtags.includes(cleanHashtag)) {
        
        customHashtags.value.push(cleanHashtag)
        saveCustomHashtags()
        addHashtag(cleanHashtag)
        newCustomHashtag.value = ''
        console.log('✅ Хештег добавлен:', cleanHashtag)
      } else {
        console.log('⚠️ Хештег уже существует:', cleanHashtag)
      }
    }
  }
}

const removeCustomHashtag = (hashtag) => {
  if (confirm(`Удалить хештег #${hashtag}?`)) {
    customHashtags.value = customHashtags.value.filter(h => h !== hashtag)
    saveCustomHashtags()
    removeHashtagFromAllNotes(hashtag)
    console.log('✅ Хештег удален:', hashtag)
  }
}

const removeHashtagFromAllNotes = (hashtag) => {
  const hashtagPattern = new RegExp(`\\s?#${hashtag}\\b`, 'g')
  const notesKey = getUserKey('daytrack_notes_data')
  
  Object.keys(notesData.value).forEach(dateKey => {
    if (notesData.value[dateKey]?.text) {
      notesData.value[dateKey].text = notesData.value[dateKey].text
        .replace(hashtagPattern, '')
        .trim()
    }
  })
  
  if (currentNotesText.value) {
    currentNotesText.value = currentNotesText.value
      .replace(hashtagPattern, '')
      .trim()
  }
  
  localStorage.setItem(notesKey, JSON.stringify(notesData.value))
  
  // Уведомляем об изменении
  window.dispatchEvent(new StorageEvent('storage', {
    key: notesKey,
    newValue: JSON.stringify(notesData.value),
    oldValue: localStorage.getItem(notesKey),
    storageArea: localStorage,
    url: window.location.href
  }))
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
  loadSelectedDate()
  loadStoredNotes()
  loadCustomHashtags()
  loadNotesForDate(selectedDate.value)
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
@import '@/components/Notes.css';
</style>