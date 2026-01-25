<template>
  <header class="header">
    <div class="top-bar">
      <div class="left-section">
        <div class="avatar" @click="goToProfile">
          <img v-if="userAvatar" :src="userAvatar" alt="Avatar" class="avatar-image" />
          <div v-else class="avatar-placeholder">
            {{ userName.charAt(0).toUpperCase() }}
          </div>
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
                  <div class="category-title">Часто используемые:</div>
                  <div class="hashtag-items">
                    <div 
                      v-for="hashtag in popularHashtags" 
                      :key="'popular-' + hashtag.tag_name"
                      class="hashtag-item"
                      @click="selectHashtag(hashtag.tag_name)"
                    >
                      #{{ hashtag.tag_name }}
                    </div>
                  </div>
                </div>
                
                <!-- Все хештеги -->
                <div class="hashtag-category" v-if="allHashtags.length > 0">
                  <div class="category-title">Все хештеги:</div>
                  <div class="hashtag-items">
                    <div 
                      v-for="hashtag in allHashtags" 
                      :key="'all-' + hashtag.tag_name"
                      class="hashtag-item"
                      @click="selectHashtag(hashtag.tag_name)"
                    >
                      #{{ hashtag.tag_name }}
                    </div>
                  </div>
                </div>
                
                <!-- Нет хештегов -->
                <div v-if="popularHashtags.length === 0 && allHashtags.length === 0" class="no-hashtags">
                  <div class="no-hashtags-icon">🏷️</div>
                  <div class="no-hashtags-text">Хештегов не найдено</div>
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
                <span class="results-count">({{ searchResults.length }})</span>
              </div>
              
              <div class="results-list" v-if="searchResults.length > 0">
                <div 
                  v-for="result in searchResults" 
                  :key="result.id"
                  class="result-item"
                  @click="goToDate(result.entry_date || result.created_at)"
                >
                  <div class="result-date">{{ formatResultDate(result.entry_date || result.created_at) }}</div>
                  <div class="result-details">
                    <span v-if="currentSearchType === 'mood' && result.emotion">
                      <span class="result-icon">{{ getMoodEmoji(result.emotion.id) }}</span>
                      {{ result.emotion.name }}
                    </span>
                    <span v-if="currentSearchType === 'sleep' && result.sleep_quality">
                      <span class="result-icon">{{ getSleepEmoji(result.sleep_quality.id) }}</span>
                      {{ result.sleep_quality.name }}
                    </span>
                    <span v-if="currentSearchType === 'hashtag'">
                      <span class="result-icon">🏷️</span>
                      #{{ selectedHashtag }}
                      <span v-if="result.content" class="text-preview">
                        - {{ getPreviewText(result.content) }}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              
              <div v-else class="no-results">
                <div class="no-results-icon">🔍</div>
                <div class="no-results-text">Записей не найдено</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Реактивные данные
const userName = ref('Пользователь')
const userAvatar = ref(null)
const showSearchDropdown = ref(false)
const showMoodList = ref(false)
const showSleepList = ref(false)
const showHashtagList = ref(false)
const activeSearch = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const currentSearchType = ref('')
const selectedHashtag = ref('')
const moodOptions = ref([])
const sleepOptions = ref([])
const popularHashtags = ref([])
const allHashtags = ref([])

// Загрузка данных пользователя
const loadUserData = async () => {
  try {
    const token = localStorage.getItem('access_token')
    
    if (!token) {
      userName.value = 'Гость'
      return
    }
    
    // Согласно API: GET /auth/me - получение текущего пользователя
    const response = await fetch('http://localhost:5000/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      
      if (data.user) {
        userName.value = data.user.username || data.user.login || 'Пользователь'
        
        // Сохраняем информацию о пользователе
        localStorage.setItem('username', userName.value)
        localStorage.setItem('user_id', data.user.id || data.user.userId || data.user.user_id)
      }
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки данных пользователя:', error)
    userName.value = localStorage.getItem('username') || 'Пользователь'
  }
}

// Загрузка данных для поиска
const loadSearchData = async () => {
  try {
    const token = localStorage.getItem('access_token')
    
    if (!token) return
    
    // Загрузка эмоций
    await loadEmotions(token)
    
    // Загрузка качеств сна
    await loadSleepQualities(token)
    
    // Загрузка данных для фильтров (хештеги)
    await loadFilterData(token)
    
  } catch (error) {
    console.error('❌ Ошибка загрузки данных для поиска:', error)
  }
}

// Загрузка эмоций
const loadEmotions = async (token) => {
  try {
    // Согласно API: GET /api/data/emotions - получить список эмоций
    const response = await fetch('http://localhost:5000/api/data/emotions', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.emotions) {
        // Преобразуем данные эмоций для отображения
        moodOptions.value = data.emotions.map(emotion => ({
          id: emotion.id,
          name: emotion.name,
          emoji: getEmotionEmoji(emotion.name)
        }))
      }
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки эмоций:', error)
  }
}

// Загрузка качеств сна
const loadSleepQualities = async (token) => {
  try {
    // Согласно API: GET /api/data/sleep-qualities - получить список качеств сна
    const response = await fetch('http://localhost:5000/api/data/sleep-qualities', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.sleep_qualities) {
        // Преобразуем данные качеств сна для отображения
        sleepOptions.value = data.sleep_qualities.map(sleep => ({
          id: sleep.id,
          name: sleep.name,
          emoji: getSleepQualityEmoji(sleep.name)
        }))
      }
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки качеств сна:', error)
  }
}

// Загрузка данных для фильтров (хештеги)
const loadFilterData = async (token) => {
  try {
    // Согласно API: GET /api/search/filters - получить данные для фильтров поиска
    const response = await fetch('http://localhost:5000/api/search/filters', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.data) {
        // Популярные хештеги (топ-10)
        if (data.data.all_hashtag) {
          popularHashtags.value = data.data.all_hashtag.slice(0, 10)
          allHashtags.value = data.data.all_hashtag
        }
      }
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки данных фильтров:', error)
  }
}

// Получение эмодзи для эмоции
const getEmotionEmoji = (emotionName) => {
  if (!emotionName) return '😐'
  
  const lowerName = emotionName.toLowerCase()
  
  if (lowerName.includes('груст')) return '😢'
  if (lowerName.includes('нейтраль')) return '😐'
  if (lowerName.includes('спокой')) return '😌'
  if (lowerName.includes('радост')) return '😊'
  if (lowerName.includes('счастлив')) return '😄'
  
  return '😐'
}

// Получение эмодзи для качества сна
const getSleepQualityEmoji = (sleepName) => {
  if (!sleepName) return '😴'
  
  const lowerName = sleepName.toLowerCase()
  
  if (lowerName.includes('отличн')) return '😴✨'
  if (lowerName.includes('хорош')) return '😴👍'
  if (lowerName.includes('нормаль')) return '😴'
  if (lowerName.includes('плох')) return '😴👎'
  if (lowerName.includes('бессон')) return '😵'
  
  return '😴'
}

// Методы
const goToProfile = () => {
  router.push('/profile')
}

const toggleSearch = () => {
  showSearchDropdown.value = !showSearchDropdown.value
  if (showSearchDropdown.value) {
    loadSearchData()
  } else {
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
  selectedHashtag.value = ''
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

const selectMood = async (mood) => {
  searchQuery.value = mood.name
  currentSearchType.value = 'mood'
  selectedHashtag.value = ''
  activeSearch.value = true
  await performSearch('mood', mood.id)
}

const selectSleep = async (sleep) => {
  searchQuery.value = sleep.name
  currentSearchType.value = 'sleep'
  selectedHashtag.value = ''
  activeSearch.value = true
  await performSearch('sleep', sleep.id)
}

const selectHashtag = async (hashtag) => {
  searchQuery.value = `#${hashtag}`
  currentSearchType.value = 'hashtag'
  selectedHashtag.value = hashtag
  activeSearch.value = true
  await performSearch('hashtag', hashtag)
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

const getMoodEmoji = (moodId) => {
  const mood = moodOptions.value.find(m => m.id === moodId)
  return mood ? mood.emoji : '❓'
}

const getSleepEmoji = (sleepId) => {
  const sleep = sleepOptions.value.find(s => s.id === sleepId)
  return sleep ? sleep.emoji : '❓'
}

// Выполнение поиска через API
const performSearch = async (type, value) => {
  try {
    const token = localStorage.getItem('access_token')
    
    if (!token) {
      throw new Error('Требуется авторизация')
    }
    
    let url = 'http://localhost:5000/api/search/entries?'
    let params = []
    
    // Согласно API: GET /api/search/entries - поиск записей дневника с фильтрацией
    switch(type) {
      case 'mood':
        params.push(`emotion=${value}`)
        break
      case 'sleep':
        params.push(`sleep=${value}`)
        break
      case 'hashtag':
        params.push(`hashtag=${value}`)
        break
    }
    
    url += params.join('&')
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Ошибка поиска: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.success && data.entries) {
      searchResults.value = data.entries
    } else {
      searchResults.value = []
    }
    
  } catch (error) {
    console.error('❌ Ошибка выполнения поиска:', error)
    searchResults.value = []
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  activeSearch.value = false
  currentSearchType.value = ''
  selectedHashtag.value = ''
}

const goToDate = (dateString) => {
  // Сохраняем выбранную дату
  localStorage.setItem('selected_entry_date', dateString)
  
  // Переходим на главную страницу
  router.push('/home')
  
  // Закрываем меню поиска
  showSearchDropdown.value = false
  
  // Даем время для перехода
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('daytrack_date_selected', {
      detail: { date: dateString }
    }))
  }, 100)
}

const formatResultDate = (dateString) => {
  if (!dateString) return 'Дата не указана'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch {
    return dateString
  }
}

// Создание превью текста
const getPreviewText = (text) => {
  if (!text || text.trim() === '') return ''
  
  const cleanText = text.trim()
  
  // Берем первые 50 символов
  let preview = cleanText.substring(0, 50)
  
  // Если текст длиннее, добавляем многоточие
  if (cleanText.length > 50) {
    preview += '...'
  }
  
  return preview
}

// Закрываем меню при клике вне его
const handleClickOutside = (event) => {
  const searchContainer = document.querySelector('.search-container')
  if (searchContainer && !searchContainer.contains(event.target)) {
    closeSearch()
  }
}

// Инициализация
onMounted(() => {
  loadUserData()
  
  // Слушаем события обновления профиля
  window.addEventListener('storage', (event) => {
    if (event.key === 'username') {
      userName.value = event.newValue || 'Пользователь'
    }
  })

  // Добавляем обработчик клика вне dropdown
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Добавляем стили для отсутствия хештегов */
.no-hashtags {
  text-align: center;
  padding: 20px;
  color: #888;
}

.no-hashtags-icon {
  font-size: 24px;
  margin-bottom: 8px;
  opacity: 0.5;
}

.no-hashtags-text {
  font-size: 14px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Добавляем счетчик результатов */
.results-count {
  margin-left: 8px;
  font-size: 12px;
  color: #666;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 10px;
}

/* Добавляем превью текста */
.text-preview {
  font-style: italic;
  color: #666;
  margin-left: 5px;
  font-size: 12px;
}

/* Остальные стили остаются без изменений */
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
  font-weight: bold;
  color: #3A2D34;
  font-size: 14px;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #9770A9;
  color: white;
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