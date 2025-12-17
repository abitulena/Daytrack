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
          <input
            v-model="searchQuery"
            type="text"
            placeholder="поиск..."
            class="search-input"
            @focus="showSearchDropdown = true"
            @input="handleSearch"
          />
          <div v-if="showSearchDropdown" class="search-dropdown">
            <div class="search-filters">
              <div 
                v-for="filter in searchFilters" 
                :key="filter.id"
                class="filter-item"
                :class="{ 'active': activeFilter === filter.id }"
                @click="setActiveFilter(filter.id)"
              >
                {{ filter.name }}
              </div>
            </div>
            <div class="search-results">
              <!-- Результаты поиска -->
              <div 
                v-if="searchQuery"
                v-for="result in searchResults" 
                :key="result.key"
                class="search-result-item"
                @click="goToDate(result.date)"
              >
                <div class="result-date">{{ formatResultDate(result.date) }}</div>
                <div class="result-content">
                  <span v-if="result.type === 'mood'">Настроение: {{ getMoodName(result.value) }}</span>
                  <span v-if="result.type === 'sleep'">Сон: {{ getSleepName(result.value) }}</span>
                  <span v-if="result.type === 'hashtag'">Хештег: #{{ result.value }}</span>
                  <span v-if="result.type === 'note_hashtag'">Запись с хештегом: #{{ result.value }}</span>
                </div>
              </div>
              
              <!-- Сообщение "Ничего не найдено" -->
              <div v-if="searchQuery && searchResults.length === 0" class="no-results">
                Ничего не найдено
              </div>
              
              <!-- Подсказки при пустом поиске -->
              <div v-if="!searchQuery" class="search-placeholder">
                <div class="placeholder-title">Поиск по:</div>
                <div class="placeholder-items">
                  <div class="placeholder-item">• Настроению (грустный, радостный, спокойный...)</div>
                  <div class="placeholder-item">• Качеству сна (отлично поспал, бессоница, плохо спал...)</div>
                  <div class="placeholder-item">• Хештегам (#любовь, #работа, #отдых...)</div>
                </div>
                
                <!-- Популярные хештеги -->
                <div class="popular-hashtags" v-if="popularHashtags.length > 0">
                  <div class="hashtags-title">Популярные хештеги:</div>
                  <div class="hashtags-list">
                    <div 
                      v-for="hashtag in popularHashtags" 
                      :key="hashtag.name"
                      class="hashtag-tag"
                      @click="searchByHashtag(hashtag.name)"
                    >
                      #{{ hashtag.name }}
                    </div>
                  </div>
                </div>
                
                <!-- Частые настроения -->
                <div class="popular-moods">
                  <div class="moods-title">Частые настроения:</div>
                  <div class="moods-list">
                    <div 
                      v-for="mood in frequentMoods" 
                      :key="mood.id"
                      class="mood-item"
                      @click="searchByMood(mood.name)"
                    >
                      {{ mood.name }}
                    </div>
                  </div>
                </div>
                
                <!-- Частые состояния сна -->
                <div class="popular-sleep">
                  <div class="sleep-title">Частые состояния сна:</div>
                  <div class="sleep-list">
                    <div 
                      v-for="sleep in frequentSleep" 
                      :key="sleep.id"
                      class="sleep-item"
                      @click="searchBySleep(sleep.name)"
                    >
                      {{ sleep.name }}
                    </div>
                  </div>
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
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const userName = ref('Логин')
const userAvatar = ref(null)
const searchQuery = ref('')
const showSearchDropdown = ref(false)
const activeFilter = ref('all')
const searchResults = ref([])

const searchFilters = [
  { id: 'all', name: 'Все' },
  { id: 'mood', name: 'Настроение' },
  { id: 'sleep', name: 'Сон' },
  { id: 'hashtag', name: 'Хештеги' }
]

const moodNames = {
  1: 'Грустный',
  2: 'Нейтральный',
  3: 'Спокойный',
  4: 'Радостный',
  5: 'Счастлив'
}

const sleepNames = {
  1: 'Отлично поспал',
  2: 'Хорошо поспал',
  3: 'Нормальный сон',
  4: 'Плохо спал',
  5: 'Бессоница'
}

// Частые настроения для быстрого поиска
const frequentMoods = [
  { id: 1, name: 'Грустный' },
  { id: 4, name: 'Радостный' },
  { id: 5, name: 'Счастлив' },
  { id: 3, name: 'Спокойный' }
]

// Частые состояния сна для быстрого поиска
const frequentSleep = [
  { id: 1, name: 'Отлично поспал' },
  { id: 4, name: 'Плохо спал' },
  { id: 5, name: 'Бессоница' },
  { id: 2, name: 'Хорошо поспал' }
]

// Вычисляем популярные хештеги
const popularHashtags = computed(() => {
  const notesData = JSON.parse(localStorage.getItem('daytrack_notes_data') || '{}')
  const hashtagCount = {}
  
  // Собираем все хештеги из записей
  Object.values(notesData).forEach(noteData => {
    if (noteData && noteData.text) {
      const hashtags = noteData.text.match(/#(\w+)/g) || []
      hashtags.forEach(hashtag => {
        const cleanHashtag = hashtag.replace('#', '').toLowerCase()
        hashtagCount[cleanHashtag] = (hashtagCount[cleanHashtag] || 0) + 1
      })
    }
  })
  
  // Сортируем по частоте и берем топ-6
  return Object.entries(hashtagCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
})

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

const setActiveFilter = (filterId) => {
  activeFilter.value = filterId
  if (searchQuery.value) {
    handleSearch()
  }
}

const getMoodName = (moodId) => {
  return moodNames[moodId] || 'Неизвестно'
}

const getSleepName = (sleepId) => {
  return sleepNames[sleepId] || 'Неизвестно'
}

// Быстрый поиск по хештегу
const searchByHashtag = (hashtag) => {
  searchQuery.value = hashtag
  activeFilter.value = 'hashtag'
  handleSearch()
}

// Быстрый поиск по настроению
const searchByMood = (moodName) => {
  searchQuery.value = moodName.toLowerCase()
  activeFilter.value = 'mood'
  handleSearch()
}

// Быстрый поиск по сну
const searchBySleep = (sleepName) => {
  searchQuery.value = sleepName.toLowerCase()
  activeFilter.value = 'sleep'
  handleSearch()
}

const handleSearch = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  const query = searchQuery.value.toLowerCase().trim()
  const results = []

  // Загружаем данные из localStorage
  const moodData = JSON.parse(localStorage.getItem('daytrack_mood_data') || '{}')
  const sleepData = JSON.parse(localStorage.getItem('daytrack_sleep_data') || '{}')
  const notesData = JSON.parse(localStorage.getItem('daytrack_notes_data') || '{}')

  // Поиск по настроениям
  if (activeFilter.value === 'all' || activeFilter.value === 'mood') {
    Object.entries(moodData).forEach(([dateString, moodId]) => {
      const moodName = getMoodName(moodId).toLowerCase()
      if (moodName.includes(query)) {
        results.push({
          key: `mood_${dateString}`,
          date: new Date(dateString),
          type: 'mood',
          value: moodId
        })
      }
    })
  }

  // Поиск по сну
  if (activeFilter.value === 'all' || activeFilter.value === 'sleep') {
    Object.entries(sleepData).forEach(([dateString, sleepId]) => {
      const sleepName = getSleepName(sleepId).toLowerCase()
      if (sleepName.includes(query)) {
        results.push({
          key: `sleep_${dateString}`,
          date: new Date(dateString),
          type: 'sleep',
          value: sleepId
        })
      }
    })
  }

  // Поиск по хештегам в записях
  if (activeFilter.value === 'all' || activeFilter.value === 'hashtag') {
    Object.entries(notesData).forEach(([dateString, noteData]) => {
      if (noteData && noteData.text) {
        const hashtags = noteData.text.match(/#(\w+)/g) || []
        hashtags.forEach(hashtag => {
          const cleanHashtag = hashtag.replace('#', '').toLowerCase()
          if (cleanHashtag.includes(query)) {
            results.push({
              key: `hashtag_${dateString}_${cleanHashtag}`,
              date: new Date(dateString),
              type: 'note_hashtag',
              value: cleanHashtag
            })
          }
        })
      }
    })
  }

  // Сортируем результаты по дате (новые сначала)
  searchResults.value = results.sort((a, b) => b.date - a.date)
}

const goToDate = (date) => {
  // Сохраняем выбранную дату в localStorage
  localStorage.setItem('daytrack_selected_date', date.toISOString())
  
  // Создаем событие для обновления данных на главной странице
  const updateEvent = new Event('daytrack_date_selected')
  window.dispatchEvent(updateEvent)
  
  // Переходим на главную страницу
  router.push('/home')
  
  // Закрываем dropdown и очищаем поиск
  showSearchDropdown.value = false
  searchQuery.value = ''
  
  // Даем время для перехода и затем обновляем данные
  setTimeout(() => {
    window.dispatchEvent(new Event('daytrack_force_update'))
  }, 100)
}

const formatResultDate = (date) => {
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Закрываем dropdown при клике вне его
const handleClickOutside = (event) => {
  const searchContainer = document.querySelector('.search-container')
  if (searchContainer && !searchContainer.contains(event.target)) {
    showSearchDropdown.value = false
  }
}

onMounted(() => {
  loadUserData()
  
  // Слушаем изменения в localStorage для обновления аватара
  window.addEventListener('storage', (event) => {
    if (event.key === 'daytrack_avatar' || event.key === 'daytrack_username') {
      loadUserData()
    }
  })

  // Добавляем обработчик клика вне dropdown
  document.addEventListener('click', handleClickOutside)
})

// Следим за изменениями searchQuery
watch(searchQuery, () => {
  if (searchQuery.value) {
    handleSearch()
  } else {
    searchResults.value = []
  }
})
</script>

<style scoped>
@import '@/components/Header.css';
</style>