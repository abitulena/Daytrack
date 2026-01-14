<template>
  <header class="header">
    <div class="top-bar">
      <div class="left-section">
        <div class="avatar" @click="goToProfile">
          <img v-if="userAvatar" :src="userAvatar" alt="Avatar" class="avatar-image" />
        </div>
        <div class="login-text" @click="goToProfile">{{ userName }}</div>
      </div>
      
      <div class="center-section">
        <div class="daytrack-logo">DAYTRACK</div>
      </div>
      
      <div class="right-section">
        <div class="search-container">
          <!-- Кнопка поиска -->
          <button class="search-btn" @click="toggleSearch">
            поиск
          </button>
          
          <!-- Основное меню поиска -->
          <div v-if="showSearchDropdown" class="search-menu">
            <div class="menu-header">
              <div class="menu-title">Поиск по:</div>
              <button class="close-btn" @click="closeSearch">×</button>
            </div>
            
            <div class="menu-options">
              <!-- Кнопка настроений -->
              <button 
                class="menu-option mood-option" 
                @click="toggleMoodList"
                :class="{ 'active': showMoodList }"
              >
                <div class="option-icon">😊</div>
                <div class="option-text">Настроение</div>
                <div class="option-arrow">{{ showMoodList ? '▲' : '▼' }}</div>
              </button>
              
              <!-- Список настроений -->
              <div v-if="showMoodList" class="option-list mood-list">
                <div 
                  v-for="mood in moodOptions" 
                  :key="mood.id"
                  class="list-item"
                  @click="selectMood(mood)"
                >
                  <div class="item-icon">{{ mood.emoji }}</div>
                  <div class="item-text">{{ mood.name }}</div>
                </div>
              </div>
              
              <!-- Кнопка сна -->
              <button 
                class="menu-option sleep-option" 
                @click="toggleSleepList"
                :class="{ 'active': showSleepList }"
              >
                <div class="option-icon">😴</div>
                <div class="option-text">Сон</div>
                <div class="option-arrow">{{ showSleepList ? '▲' : '▼' }}</div>
              </button>
              
              <!-- Список сна -->
              <div v-if="showSleepList" class="option-list sleep-list">
                <div 
                  v-for="sleep in sleepOptions" 
                  :key="sleep.id"
                  class="list-item"
                  @click="selectSleep(sleep)"
                >
                  <div class="item-icon">{{ sleep.emoji }}</div>
                  <div class="item-text">{{ sleep.name }}</div>
                </div>
              </div>
              
              <!-- Кнопка хештегов -->
              <button 
                class="menu-option hashtag-option" 
                @click="toggleHashtagList"
                :class="{ 'active': showHashtagList }"
              >
                <div class="option-icon">🏷️</div>
                <div class="option-text">Хештеги</div>
                <div class="option-arrow">{{ showHashtagList ? '▲' : '▼' }}</div>
              </button>
              
              <!-- Список хештегов -->
              <div v-if="showHashtagList" class="option-list hashtag-list">
                <!-- Популярные хештеги -->
                <div class="hashtag-category" v-if="popularHashtags.length > 0">
                  <div class="category-title">Популярные:</div>
                  <div class="hashtag-items">
                    <div 
                      v-for="hashtag in popularHashtags" 
                      :key="'popular-' + hashtag.name"
                      class="hashtag-item"
                      @click="selectHashtag(hashtag.name)"
                    >
                      #{{ hashtag.name }}
                      <span class="hashtag-count">{{ hashtag.count }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Все хештеги -->
                <div class="hashtag-category" v-if="allHashtags.length > 0">
                  <div class="category-title">Все хештеги:</div>
                  <div class="hashtag-items">
                    <div 
                      v-for="hashtag in allHashtags" 
                      :key="'all-' + hashtag"
                      class="hashtag-item"
                      @click="selectHashtag(hashtag)"
                    >
                      #{{ hashtag }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Активный поиск и результаты -->
            <div v-if="activeSearch" class="search-results-section">
              <div class="search-header">
                <div class="search-type">
                  <span class="type-icon">{{ getSearchTypeIcon() }}</span>
                  {{ getSearchTypeText() }}
                </div>
                <button class="clear-search-btn" @click="clearSearch">
                  Очистить
                </button>
              </div>
              
              <div class="search-query">
                Поиск: <strong>"{{ searchQuery }}"</strong>
              </div>
              
              <div class="results-list">
                <div 
                  v-for="result in searchResults" 
                  :key="result.key"
                  class="result-item"
                  @click="goToDate(result.date)"
                >
                  <div class="result-date">{{ formatResultDate(result.date) }}</div>
                  <div class="result-details">
                    <span v-if="result.type === 'mood'">
                      <span class="result-icon">{{ getMoodEmoji(result.value) }}</span>
                      {{ getMoodName(result.value) }}
                    </span>
                    <span v-if="result.type === 'sleep'">
                      <span class="result-icon">{{ getSleepEmoji(result.value) }}</span>
                      {{ getSleepName(result.value) }}
                    </span>
                    <span v-if="result.type === 'hashtag'">
                      <span class="result-icon">🏷️</span>
                      #{{ result.value }}
                    </span>
                  </div>
                </div>
                
                <!-- Нет результатов -->
                <div v-if="searchResults.length === 0" class="no-results">
                  <div class="no-results-icon">🔍</div>
                  <div class="no-results-text">Записей не найдено</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Реактивные данные
const userName = ref('Логин')
const userAvatar = ref(null)
const showSearchDropdown = ref(false)
const showMoodList = ref(false)
const showSleepList = ref(false)
const showHashtagList = ref(false)
const activeSearch = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const currentSearchType = ref('')

// Структуры данных (должны соответствовать Home.vue)
const moodOptions = [
  { 
    id: 1, 
    name: 'Грустный', 
    shortName: 'грустный', 
    emoji: '😢'
  },
  { 
    id: 2, 
    name: 'Нейтральный', 
    shortName: 'нейтральный', 
    emoji: '😐'
  },
  { 
    id: 3, 
    name: 'Спокойный', 
    shortName: 'спокойный', 
    emoji: '😌'
  },
  { 
    id: 4, 
    name: 'Радостный', 
    shortName: 'радостный', 
    emoji: '😊'
  },
  { 
    id: 5, 
    name: 'Счастлив', 
    shortName: 'счастлив', 
    emoji: '😄'
  }
]

const sleepOptions = [
  { 
    id: 1, 
    name: 'Отлично поспал', 
    shortName: 'отлично', 
    emoji: '😴✨'
  },
  { 
    id: 2, 
    name: 'Хорошо поспал', 
    shortName: 'хорошо', 
    emoji: '😴👍'
  },
  { 
    id: 3, 
    name: 'Нормальный сон', 
    shortName: 'нормально', 
    emoji: '😴'
  },
  { 
    id: 4, 
    name: 'Плохо спал', 
    shortName: 'плохо', 
    emoji: '😴👎'
  },
  { 
    id: 5, 
    name: 'Бессоница', 
    shortName: 'бессоница', 
    emoji: '😵'
  }
]

// Получение данных из localStorage (те же ключи что в Home.vue)
const getUserKey = (baseKey) => {
  const userId = localStorage.getItem('daytrack_user_id')
  return userId ? `${baseKey}_${userId}` : baseKey
}

// Вычисляемые свойства
const popularHashtags = computed(() => {
  const notesKey = getUserKey('daytrack_notes_data')
  const notesData = JSON.parse(localStorage.getItem(notesKey) || '{}')
  const hashtagCount = {}
  
  Object.values(notesData).forEach(noteData => {
    if (noteData && noteData.text) {
      const hashtags = noteData.text.match(/#(\w+)/g) || []
      hashtags.forEach(hashtag => {
        const cleanHashtag = hashtag.replace('#', '').toLowerCase()
        hashtagCount[cleanHashtag] = (hashtagCount[cleanHashtag] || 0) + 1
      })
    }
  })
  
  return Object.entries(hashtagCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
})

const allHashtags = computed(() => {
  const notesKey = getUserKey('daytrack_notes_data')
  const notesData = JSON.parse(localStorage.getItem(notesKey) || '{}')
  
  // Загружаем кастомные хештеги
  const customHashtagsKey = 'daytrack_custom_hashtags'
  const userId = localStorage.getItem('daytrack_user_id')
  const hashtagsKey = userId ? `${customHashtagsKey}_${userId}` : customHashtagsKey
  const customHashtags = JSON.parse(localStorage.getItem(hashtagsKey) || '[]')
  
  const hashtagSet = new Set([
    'любовь', 'работа', 'отдых', 'здоровье', 'друзья', 'семья', 
    'учеба', 'хобби', 'путешествие', 'мечты',
    ...customHashtags
  ])
  
  // Добавляем хештеги из записей
  Object.values(notesData).forEach(noteData => {
    if (noteData && noteData.text) {
      const hashtags = noteData.text.match(/#(\w+)/g) || []
      hashtags.forEach(hashtag => {
        const cleanHashtag = hashtag.replace('#', '').toLowerCase()
        hashtagSet.add(cleanHashtag)
      })
    }
  })
  
  return Array.from(hashtagSet).sort()
})

// Методы
const loadUserData = () => {
  const savedUserName = localStorage.getItem('daytrack_username')
  const savedAvatar = localStorage.getItem('daytrack_avatar')
  
  if (savedUserName) {
    userName.value = savedUserName
  }
  
  if (savedAvatar) {
    userAvatar.value = savedAvatar
  }
}

const goToProfile = () => {
  router.push('/profile')
}

const toggleSearch = () => {
  showSearchDropdown.value = !showSearchDropdown.value
  if (!showSearchDropdown.value) {
    resetSearch()
  }
}

const closeSearch = () => {
  showSearchDropdown.value = false
  resetSearch()
}

const resetSearch = () => {
  showMoodList.value = false
  showSleepList.value = false
  showHashtagList.value = false
  activeSearch.value = false
  searchQuery.value = ''
  searchResults.value = []
  currentSearchType.value = ''
}

const toggleMoodList = () => {
  showMoodList.value = !showMoodList.value
  if (showMoodList.value) {
    showSleepList.value = false
    showHashtagList.value = false
  }
}

const toggleSleepList = () => {
  showSleepList.value = !showSleepList.value
  if (showSleepList.value) {
    showMoodList.value = false
    showHashtagList.value = false
  }
}

const toggleHashtagList = () => {
  showHashtagList.value = !showHashtagList.value
  if (showHashtagList.value) {
    showMoodList.value = false
    showSleepList.value = false
  }
}

const selectMood = (mood) => {
  searchQuery.value = mood.name
  currentSearchType.value = 'mood'
  activeSearch.value = true
  performSearch('mood', mood.id)
}

const selectSleep = (sleep) => {
  searchQuery.value = sleep.name
  currentSearchType.value = 'sleep'
  activeSearch.value = true
  performSearch('sleep', sleep.id)
}

const selectHashtag = (hashtag) => {
  searchQuery.value = `#${hashtag}`
  currentSearchType.value = 'hashtag'
  activeSearch.value = true
  performSearch('hashtag', hashtag)
}

const getSearchTypeIcon = () => {
  switch(currentSearchType.value) {
    case 'mood': return '😊'
    case 'sleep': return '😴'
    case 'hashtag': return '🏷️'
    default: return '🔍'
  }
}

const getSearchTypeText = () => {
  switch(currentSearchType.value) {
    case 'mood': return 'Настроение'
    case 'sleep': return 'Сон'
    case 'hashtag': return 'Хештег'
    default: return 'Поиск'
  }
}

const getMoodName = (moodId) => {
  const mood = moodOptions.find(m => m.id === moodId)
  return mood ? mood.name : 'Неизвестно'
}

const getMoodEmoji = (moodId) => {
  const mood = moodOptions.find(m => m.id === moodId)
  return mood ? mood.emoji : '❓'
}

const getSleepName = (sleepId) => {
  const sleep = sleepOptions.find(s => s.id === sleepId)
  return sleep ? sleep.name : 'Неизвестно'
}

const getSleepEmoji = (sleepId) => {
  const sleep = sleepOptions.find(s => s.id === sleepId)
  return sleep ? sleep.emoji : '❓'
}

// ГЛАВНАЯ ФУНКЦИЯ: поиск данных из календаря и записей
const performSearch = (type, value) => {
  const results = []
  
  // Получаем данные из localStorage (те же самые что в Home.vue)
  const moodKey = getUserKey('daytrack_mood_data')
  const sleepKey = getUserKey('daytrack_sleep_data')
  const notesKey = getUserKey('daytrack_notes_data')
  
  const moodData = JSON.parse(localStorage.getItem(moodKey) || '{}')
  const sleepData = JSON.parse(localStorage.getItem(sleepKey) || '{}')
  const notesData = JSON.parse(localStorage.getItem(notesKey) || '{}')
  
  if (type === 'mood') {
    // Ищем дни с выбранным настроением
    Object.entries(moodData).forEach(([dateString, moodId]) => {
      if (moodId === value) {
        results.push({
          key: `mood_${dateString}_${moodId}`,
          date: new Date(dateString),
          type: 'mood',
          value: moodId
        })
      }
    })
  }
  
  if (type === 'sleep') {
    // Ищем дни с выбранным качеством сна
    Object.entries(sleepData).forEach(([dateString, sleepId]) => {
      if (sleepId === value) {
        results.push({
          key: `sleep_${dateString}_${sleepId}`,
          date: new Date(dateString),
          type: 'sleep',
          value: sleepId
        })
      }
    })
  }
  
  if (type === 'hashtag') {
    // Ищем дни с указанным хештегом в записях
    Object.entries(notesData).forEach(([dateString, noteData]) => {
      if (noteData && noteData.text) {
        const text = noteData.text.toLowerCase()
        const hashtagPattern = new RegExp(`#${value.toLowerCase()}\\b`)
        
        if (hashtagPattern.test(text)) {
          // Также проверяем наличие других данных для этой даты
          results.push({
            key: `hashtag_${dateString}_${value}`,
            date: new Date(dateString),
            type: 'hashtag',
            value: value
          })
        }
      }
    })
  }
  
  // Добавляем информацию о других данных для найденных дат
  results.forEach(result => {
    const dateString = result.date.toDateString()
    result.hasMood = moodData[dateString] !== undefined
    result.hasSleep = sleepData[dateString] !== undefined
    result.hasNotes = notesData[dateString] !== undefined
  })
  
  // Сортируем по дате (новые сначала)
  searchResults.value = results.sort((a, b) => b.date - a.date)
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  activeSearch.value = false
  currentSearchType.value = ''
}

const goToDate = (date) => {
  // Сохраняем выбранную дату в localStorage (так же как в Home.vue)
  localStorage.setItem('daytrack_selected_date', date.toISOString())
  
  // Отправляем событие для обновления календаря на главной странице
  const updateEvent = new CustomEvent('daytrack_date_selected', {
    detail: { date: date.toISOString() }
  })
  window.dispatchEvent(updateEvent)
  
  // Переходим на главную страницу
  router.push('/home')
  
  // Закрываем меню поиска
  showSearchDropdown.value = false
  
  // Даем время для перехода и обновляем календарь
  setTimeout(() => {
    window.dispatchEvent(new Event('daytrack_search_result_selected'))
    
    // Также отправляем сообщение, чтобы Home.vue обновил выбранную дату
    window.postMessage({
      type: 'daytrack_search_select_date',
      date: date.toISOString()
    }, '*')
  }, 100)
}

const formatResultDate = (date) => {
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Закрываем меню при клике вне его
const handleClickOutside = (event) => {
  const searchContainer = document.querySelector('.search-container')
  if (searchContainer && !searchContainer.contains(event.target)) {
    closeSearch()
  }
}

onMounted(() => {
  loadUserData()
  
  window.addEventListener('storage', (event) => {
    if (event.key === 'daytrack_avatar' || event.key === 'daytrack_username') {
      loadUserData()
    }
    
    // Обновляем данные при изменении записей, настроений или сна
    if (event.key && (
      event.key.includes('daytrack_notes_data') ||
      event.key.includes('daytrack_mood_data') ||
      event.key.includes('daytrack_sleep_data')
    )) {
      // Если поиск активен, обновляем результаты
      if (activeSearch.value && currentSearchType.value) {
        setTimeout(() => {
          // Повторяем текущий поиск с обновленными данными
          if (currentSearchType.value === 'mood') {
            const mood = moodOptions.find(m => 
              m.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
              m.shortName.toLowerCase().includes(searchQuery.value.toLowerCase())
            )
            if (mood) performSearch('mood', mood.id)
          } else if (currentSearchType.value === 'sleep') {
            const sleep = sleepOptions.find(s => 
              s.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
              s.shortName.toLowerCase().includes(searchQuery.value.toLowerCase())
            )
            if (sleep) performSearch('sleep', sleep.id)
          } else if (currentSearchType.value === 'hashtag') {
            const cleanHashtag = searchQuery.value.replace('#', '')
            performSearch('hashtag', cleanHashtag)
          }
        }, 100)
      }
    }
  })

  // Добавляем обработчик клика вне dropdown
  document.addEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Стили оставляем точно такими же как в предыдущем коде, они хорошие! */

.header {
  position: relative;
  z-index: 1000;
}

.top-bar {
  width: 100%;
  height: 40px;
  background: rgba(143.92, 124.43, 179.24, 0.66);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  z-index: 1001;
}

.avatar {
  width: 30px;
  height: 30px;
  background: #D9D9D9;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.login-text {
  color: #3A2D34;
  font-size: 18px;
  font-family: 'KyivType Sans';
  font-weight: 840;
  display: flex;
  align-items: center;
  height: 100%;
  transition: color 0.3s ease;
}

.left-section:hover .login-text {
  color: #5a4a5a;
}

.center-section {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}

.daytrack-logo {
  color: white;
  font-size: 26px;
  font-family: 'KyivType Sans';
  font-weight: 840;
  text-shadow: 0px 2px 2px rgba(151, 112, 169, 1.00);
}

.right-section {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 150px;
  z-index: 1001;
}

/* Кнопка поиска */
.search-container {
  position: relative;
  width: 120px;
}

.search-btn {
  width: 100%;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #BEAEDB;
  border-radius: 15px;
  padding: 6px 12px;
  color: #3F2A52;
  font-size: 14px;
  font-family: 'KyivType Sans';
  font-weight: 840;
  outline: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.search-btn:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: #9770A9;
  box-shadow: 0 0 8px rgba(151, 112, 169, 0.3);
}

/* Меню поиска */
.search-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 380px;
  background: rgba(237, 221, 236, 0.98);
  border: 1px solid #BEAEDB;
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(12px);
  z-index: 9999;
  max-height: 700px;
  overflow: hidden;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid rgba(190, 174, 219, 0.4);
  background: rgba(255, 255, 255, 0.7);
}

.menu-title {
  color: #3F2A52;
  font-size: 16px;
  font-family: 'KyivType Sans';
  font-weight: 840;
}

.close-btn {
  width: 24px;
  height: 24px;
  background: rgba(185, 152, 200, 0.3);
  border: 1px solid #BEAEDB;
  border-radius: 50%;
  color: #3F2A52;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(185, 152, 200, 0.5);
  transform: rotate(90deg);
}

/* Основные опции меню */
.menu-options {
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.menu-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(190, 174, 219, 0.4);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  width: 100%;
}

.menu-option:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.menu-option.active {
  background: rgba(185, 152, 200, 0.3);
  border-color: #B998C8;
}

.option-icon {
  font-size: 20px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 5px;
}

.mood-option .option-icon {
  background: rgba(255, 215, 0, 0.2);
  color: #B8860B;
}

.sleep-option .option-icon {
  background: rgba(173, 216, 230, 0.2);
  color: #4682B4;
}

.hashtag-option .option-icon {
  background: rgba(144, 238, 144, 0.2);
  color: #228B22;
}

.option-text {
  flex: 1;
  color: #3F2A52;
  font-size: 15px;
  font-family: 'KyivType Sans';
  font-weight: 840;
}

.option-arrow {
  color: #9770A9;
  font-size: 12px;
  font-weight: bold;
}

/* Списки опций */
.option-list {
  margin: 0 0 5px 0;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(190, 174, 219, 0.3);
  border-radius: 10px;
  overflow: hidden;
  animation: slideIn 0.2s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(190, 174, 219, 0.2);
}

.list-item:last-child {
  border-bottom: none;
}

.list-item:hover {
  background: rgba(185, 152, 200, 0.15);
}

.item-icon {
  font-size: 18px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-text {
  flex: 1;
  color: #3F2A52;
  font-size: 14px;
  font-family: 'KyivType Sans';
  font-weight: 840;
}

/* Стили для списка хештегов */
.hashtag-list {
  max-height: 250px;
  overflow-y: auto;
}

.hashtag-category {
  padding: 10px 0;
}

.hashtag-category:not(:last-child) {
  border-bottom: 1px solid rgba(190, 174, 219, 0.3);
}

.category-title {
  color: #6D5D7A;
  font-size: 12px;
  font-family: 'KyivType Sans';
  font-weight: 840;
  margin-bottom: 8px;
  padding: 0 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.hashtag-items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 16px;
}

.hashtag-item {
  background: rgba(144, 238, 144, 0.15);
  border: 1px solid rgba(144, 238, 144, 0.3);
  border-radius: 8px;
  padding: 6px 10px;
  color: #228B22;
  font-size: 12px;
  font-family: 'KyivType Sans';
  font-weight: 840;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.hashtag-item:hover {
  background: rgba(144, 238, 144, 0.25);
  transform: translateY(-1px);
}

.hashtag-count {
  font-size: 10px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 4px;
  padding: 1px 4px;
  color: #6D5D7A;
}

/* Результаты поиска */
.search-results-section {
  border-top: 1px solid rgba(190, 174, 219, 0.4);
  padding: 15px;
  background: rgba(255, 255, 255, 0.8);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.search-type {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #3F2A52;
  font-size: 14px;
  font-family: 'KyivType Sans';
  font-weight: 840;
}

.type-icon {
  font-size: 18px;
}

.clear-search-btn {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #BEAEDB;
  border-radius: 8px;
  padding: 6px 12px;
  color: #9770A9;
  font-size: 12px;
  font-family: 'KyivType Sans';
  font-weight: 840;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-search-btn:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: #9770A9;
}

.search-query {
  color: #6D5D7A;
  font-size: 13px;
  font-family: 'KyivType Sans';
  font-weight: 840;
  margin-bottom: 15px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  border: 1px solid rgba(190, 174, 219, 0.3);
}

.results-list {
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid rgba(190, 174, 219, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
}

.result-item {
  padding: 12px 15px;
  border-bottom: 1px solid rgba(190, 174, 219, 0.2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover {
  background: rgba(185, 152, 200, 0.15);
  padding-left: 18px;
}

.result-date {
  color: #3F2A52;
  font-size: 13px;
  font-family: 'KyivType Sans';
  font-weight: 840;
  margin-bottom: 4px;
}

.result-details {
  color: #6D5D7A;
  font-size: 13px;
  font-family: 'KyivType Sans';
  font-weight: 840;
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-icon {
  font-size: 16px;
}

.no-results {
  text-align: center;
  padding: 30px 20px;
  color: #9770A9;
}

.no-results-icon {
  font-size: 32px;
  margin-bottom: 10px;
  opacity: 0.7;
}

.no-results-text {
  font-size: 14px;
  font-family: 'KyivType Sans';
  font-weight: 840;
}

/* Стили для скроллбара */
.option-list::-webkit-scrollbar,
.results-list::-webkit-scrollbar {
  width: 6px;
}

.option-list::-webkit-scrollbar-track,
.results-list::-webkit-scrollbar-track {
  background: rgba(237, 221, 236, 0.5);
  border-radius: 3px;
}

.option-list::-webkit-scrollbar-thumb,
.results-list::-webkit-scrollbar-thumb {
  background: #B998C8;
  border-radius: 3px;
}

.option-list::-webkit-scrollbar-thumb:hover,
.results-list::-webkit-scrollbar-thumb:hover {
  background: #A589B3;
}

/* Адаптивность */
@media (max-width: 768px) {
  .search-menu {
    width: 320px;
    right: -20px;
  }
  
  .menu-options {
    padding: 12px;
  }
  
  .menu-option {
    padding: 12px 14px;
  }
  
  .option-text {
    font-size: 14px;
  }
}
</style>