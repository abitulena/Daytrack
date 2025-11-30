<template>
  <div class="home-container">
    <!-- Фоновое изображение -->
    <div class="background-image"></div>
    
    <!-- Шапка страницы -->
    <Header />
    
    <!-- Основной контент -->
    <div class="main-content">
      <!-- Левая колонка -->
      <div class="left-column">
        <!-- Блок настроения -->
        <div class="mood-section">
          <div class="section-background"></div>
          <img src="@/assets/mood.png" alt="Mood" class="mood-image" />
          <div class="section-content">
            <div class="section-title">настроение</div>
            <div class="emojis-container">
              <div 
                v-for="mood in moods" 
                :key="mood.id"
                class="emoji-item"
                :class="{ 'selected': selectedMood === mood.id }"
                @click="selectMood(mood.id)"
                @mouseenter="showTooltip($event, mood.name)"
                @mouseleave="hideTooltip"
              >
                <img :src="mood.image" :alt="mood.name" class="emoji-img" />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Блок сна -->
        <div class="sleep-section">
          <div class="section-background"></div>
          <img src="@/assets/dream.png" alt="Dream" class="dream-image" />
          <div class="section-content">
            <div class="section-title">сон</div>
            <div class="emojis-container">
              <div 
                v-for="sleep in sleepQuality" 
                :key="sleep.id"
                class="emoji-item"
                :class="{ 'selected': selectedSleep === sleep.id }"
                @click="selectSleep(sleep.id)"
                @mouseenter="showTooltip($event, sleep.name)"
                @mouseleave="hideTooltip"
              >
                <img :src="sleep.image" :alt="sleep.name" class="emoji-img" />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Календарь -->
        <div class="calendar-section">
          <div class="section-background"></div>
          <div class="section-content">
            <div class="calendar-header">
              <button class="calendar-nav" @click="prevMonth">&lt;</button>
              <div class="calendar-title">{{ currentMonth.toLowerCase() }} {{ currentYear }}</div>
              <button class="calendar-nav" @click="nextMonth">&gt;</button>
            </div>
            
            <!-- Дни недели -->
            <div class="week-days">
              <div class="week-day" v-for="day in weekDays" :key="day">
                {{ day }}
              </div>
            </div>
            
            <!-- Сетка календаря -->
            <div class="calendar-grid">
              <div 
                v-for="day in calendarDays" 
                :key="day.id"
                class="calendar-day"
                :class="{
                  'other-month': !day.isCurrentMonth,
                  'today': day.isToday,
                  'selected': day.isSelected,
                  'has-mood': hasMoodData(day.date),
                  'has-sleep': hasSleepData(day.date),
                  'has-notes': hasNotesData(day.date),
                  'has-event': hasEventData(day.date)
                }"
                @click="selectDate(day)"
                @dblclick="openEventModal(day)"
              >
                {{ day.number }}
                <div class="day-indicators">
                  <div v-if="hasMoodData(day.date)" class="mood-indicator"></div>
                  <div v-if="hasSleepData(day.date)" class="sleep-indicator"></div>
                  <div v-if="hasNotesData(day.date)" class="notes-indicator"></div>
                  <div v-if="hasEventData(day.date)" class="event-indicator"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Центральная колонка -->
      <div class="center-column">
        <!-- Блок записей -->
        <div class="notes-section" @click="goToNotes">
          <div class="section-background"></div>
          <div class="section-content">
            <div class="section-title">записи</div>
            <div class="notes-content">
              <div class="notes-text-with-lines">
                <div 
                  v-for="(line, index) in displayLines" 
                  :key="index"
                  class="text-line-container"
                >
                  <div class="text-line">{{ line }}</div>
                  <div class="line-under-text"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Правая колонка -->
      <div class="right-column">
        <!-- Блок галереи -->
        <div class="gallery-section" @click="goToGallery">
          <div class="section-background"></div>
          <div class="section-content">
            <div class="section-title">галерея</div>
            <div class="gallery-image-container">
              <img 
                :src="currentGalleryImage" 
                alt="Gallery" 
                class="gallery-image" 
                @error="handleImageError"
              />
            </div>
          </div>
        </div>

        <!-- Блок достижений -->
        <div class="achievements-section">
          <div class="section-background"></div>
          <div class="section-content">
            <div class="section-title">достижения</div>
            <div class="achievements-content">
              <div class="stats-info">
                <div class="streak-count">Текущая серия: {{ currentStreak }} дней</div>
                <div class="max-streak">Максимальная серия: {{ maxStreak }} дней</div>
              </div>
              <div class="achievements-grid">
                <div 
                  v-for="achievement in achievements" 
                  :key="achievement.id"
                  class="achievement-item"
                  :class="{ 'unlocked': achievement.unlocked }"
                  @mouseenter="showTooltip($event, achievement.description)"
                  @mouseleave="hideTooltip"
                >
                  <img 
                    :src="achievement.unlocked ? achievement.image : achievement.lockedImage" 
                    :alt="achievement.name" 
                    class="achievement-img"
                  />
                  <div class="achievement-name">{{ achievement.name }}</div>
                  <div class="achievement-progress" v-if="!achievement.unlocked && achievement.progress">
                    {{ achievement.progress.current }}/{{ achievement.progress.total }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Уведомление о достижении -->
    <div v-if="achievementNotificationVisible" class="achievement-notification">
      <div class="achievement-notification-content">
        <div class="achievement-notification-title">🎉 Поздравляем!</div>
        <div class="achievement-notification-text">Вы получили достижение: "{{ newAchievement.name }}"</div>
      </div>
    </div>

    <!-- Модальное окно событий -->
    <div v-if="eventModalVisible" class="event-modal-overlay" @click="closeEventModal">
      <div class="event-modal" @click.stop>
        <div class="event-modal-header">
          <div class="event-modal-title">событие</div>
          <button class="event-modal-close" @click="closeEventModal">×</button>
        </div>
        <div class="event-modal-date">
          {{ eventModalDate ? formatEventDate(eventModalDate) : '' }}
        </div>
        <textarea 
          v-model="eventModalText"
          class="event-modal-textarea"
          placeholder="Опишите ваше событие..."
          maxlength="200"
        ></textarea>
        <div class="event-modal-chars">{{ eventModalText.length }}/200</div>
        <div class="event-modal-actions">
          <button v-if="hasEventData(eventModalDate)" class="event-delete-btn" @click="deleteEvent">
            удалить
          </button>
          <button class="event-save-btn" @click="saveEvent">
            {{ hasEventData(eventModalDate) ? 'сохранить' : 'добавить' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Подсказки -->
    <div 
      v-if="tooltipVisible" 
      class="tooltip" 
      :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
    >
      {{ tooltipText }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'

// Импорты изображений
import Грустный from '@/assets/Грустный.png'
import Нейтральный from '@/assets/Нейтральный.png'
import Спокойный from '@/assets/Спокойный.png'
import Радостный from '@/assets/Радостный.png'
import Счастлив from '@/assets/Счастлив.png'
import ОтличноПоспал from '@/assets/Отлично поспал.png'
import ХорошоПоспал from '@/assets/Хорошо поспал.png'
import Нормально from '@/assets/Нормально.png'
import ПлохоСпал from '@/assets/Плохо спал.png'
import Бессоница from '@/assets/Бессоница.png'
import GalleryDefault from '@/assets/gallery.jpg'

// Импорты изображений достижений
import Achievement5Days from '@/assets/Серия из 5 записей.png'
import Achievement15Days from '@/assets/Серия из 15 записей.png'
import Achievement30Days from '@/assets/Серия из 30 записей.png'
import AchievementFirstEntry from '@/assets/Первая запись.png'
import AchievementLocked from '@/assets/блок.png'

const router = useRouter()

// Реактивные данные
const currentDate = ref(new Date())
const selectedDate = ref(new Date())
const selectedMood = ref(null)
const selectedSleep = ref(null)
const tooltipVisible = ref(false)
const tooltipText = ref('')
const tooltipX = ref(0)
const tooltipY = ref(0)
const eventModalVisible = ref(false)
const eventModalDate = ref(null)
const eventModalText = ref('')
const randomGalleryIndex = ref(0)
const achievementNotificationVisible = ref(false)
const newAchievement = ref({})
const currentStreak = ref(0)
const maxStreak = ref(0)

// Данные из localStorage
const moodData = ref({})
const sleepData = ref({})
const notesData = ref({})
const eventData = ref({})
const galleryData = ref([])
const achievementsData = ref({})

// Достижения
const achievements = ref([
  {
    id: 1,
    name: 'Первая запись',
    description: 'Создайте первую запись в дневнике',
    image: AchievementFirstEntry,
    lockedImage: AchievementLocked,
    unlocked: false,
    condition: 1,
    type: 'total_entries',
    progress: { current: 0, total: 1 }
  },
  {
    id: 2,
    name: 'Серия из 5 дней',
    description: 'Ведите дневник 5 дней подряд',
    image: Achievement5Days,
    lockedImage: AchievementLocked,
    unlocked: false,
    condition: 5,
    type: 'streak',
    progress: { current: 0, total: 5 }
  },
  {
    id: 3,
    name: 'Серия из 15 дней',
    description: 'Ведите дневник 15 дней подряд',
    image: Achievement15Days,
    lockedImage: AchievementLocked,
    unlocked: false,
    condition: 15,
    type: 'streak',
    progress: { current: 0, total: 15 }
  },
  {
    id: 4,
    name: 'Серия из 30 дней',
    description: 'Ведите дневник 30 дней подряд',
    image: Achievement30Days,
    lockedImage: AchievementLocked,
    unlocked: false,
    condition: 30,
    type: 'streak',
    progress: { current: 0, total: 30 }
  }
])

// IndexedDB константы
const DB_NAME = 'GalleryDB'
const DB_VERSION = 1
const STORE_NAME = 'images'

// Константы
const weekDays = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']
const moods = [
  { id: 1, name: 'Грустный', image: Грустный },
  { id: 2, name: 'Нейтральный', image: Нейтральный },
  { id: 3, name: 'Спокойный', image: Спокойный },
  { id: 4, name: 'Радостный', image: Радостный },
  { id: 5, name: 'Счастлив', image: Счастлив }
]

const sleepQuality = [
  { id: 1, name: 'Отлично поспал', image: ОтличноПоспал },
  { id: 2, name: 'Хорошо поспал', image: ХорошоПоспал },
  { id: 3, name: 'Нормальный сон', image: Нормально },
  { id: 4, name: 'Плохо спал', image: ПлохоСпал },
  { id: 5, name: 'Бессоница', image: Бессоница }
]

// Инициализация IndexedDB
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }
  })
}

// Загрузка всех изображений из IndexedDB
const loadGalleryImagesFromDB = async () => {
  try {
    const db = await initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()
      
      request.onsuccess = () => {
        const images = request.result.map(item => ({
          id: item.id,
          url: URL.createObjectURL(item.file),
          name: `photo_${item.id}`,
          size: item.file.size,
          uploadedAt: new Date(item.timestamp).toISOString()
        }))
        resolve(images)
      }
      
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Ошибка загрузки галереи из IndexedDB:', error)
    return []
  }
}

// Генерация случайного индекса
const generateRandomIndex = (max) => {
  return Math.floor(Math.random() * max)
}

// Расчет количества записей
const calculateTotalEntries = () => {
  const allEntries = new Set()
  
  Object.keys(moodData.value).forEach(date => allEntries.add(date))
  Object.keys(sleepData.value).forEach(date => allEntries.add(date))
  Object.keys(notesData.value).forEach(date => allEntries.add(date))
  Object.keys(eventData.value).forEach(date => allEntries.add(date))
  
  return allEntries.size
}

// Расчет текущей серии записей
const calculateStreak = () => {
  const allDates = getAllRecordDates()
  if (allDates.length === 0) {
    currentStreak.value = 0
    return
  }

  const sortedDates = allDates.sort((a, b) => new Date(b) - new Date(a))
  
  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < sortedDates.length; i++) {
    const recordDate = new Date(sortedDates[i])
    recordDate.setHours(0, 0, 0, 0)
    
    const diffTime = Math.abs(currentDate - recordDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      continue
    } else if (diffDays === 1) {
      streak++
      currentDate = recordDate
    } else {
      break
    }
  }
  
  const today = new Date().toDateString()
  if (allDates.includes(today)) {
    streak++
  }
  
  currentStreak.value = streak
}

// Получение всех дат с записями
const getAllRecordDates = () => {
  const dates = new Set()
  
  Object.keys(moodData.value).forEach(date => dates.add(date))
  Object.keys(sleepData.value).forEach(date => dates.add(date))
  Object.keys(notesData.value).forEach(date => dates.add(date))
  Object.keys(eventData.value).forEach(date => dates.add(date))
  
  return Array.from(dates)
}

// Расчет максимальной серии
const calculateMaxStreak = () => {
  const allDates = getAllRecordDates()
  if (allDates.length === 0) {
    maxStreak.value = 0
    return
  }

  const sortedDates = allDates.sort((a, b) => new Date(a) - new Date(b))
  
  let maxStreakCount = 1
  let currentStreakCount = 1
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1])
    const currentDate = new Date(sortedDates[i])
    
    const diffTime = Math.abs(currentDate - prevDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      currentStreakCount++
      maxStreakCount = Math.max(maxStreakCount, currentStreakCount)
    } else {
      currentStreakCount = 1
    }
  }
  
  maxStreak.value = maxStreakCount
}

// Обновление прогресса достижений
const updateAchievementsProgress = () => {
  const totalEntries = calculateTotalEntries()
  
  achievements.value.forEach(achievement => {
    if (achievement.unlocked) {
      achievement.progress.current = achievement.progress.total
    } else {
      if (achievement.type === 'total_entries') {
        achievement.progress.current = Math.min(totalEntries, achievement.progress.total)
      } else if (achievement.type === 'streak') {
        achievement.progress.current = Math.min(currentStreak.value, achievement.progress.total)
      }
    }
  })
}

// Проверка и разблокировка достижений
const checkAchievements = () => {
  const unlockedAchievements = achievementsData.value.unlocked || []
  let newAchievementUnlocked = false
  
  const totalEntries = calculateTotalEntries()
  
  achievements.value.forEach(achievement => {
    if (unlockedAchievements.includes(achievement.id)) {
      achievement.unlocked = true
      return
    }
    
    let shouldUnlock = false
    
    if (achievement.type === 'total_entries') {
      shouldUnlock = totalEntries >= achievement.condition
    } else if (achievement.type === 'streak') {
      shouldUnlock = currentStreak.value >= achievement.condition
    }
    
    if (shouldUnlock && !achievement.unlocked) {
      achievement.unlocked = true
      unlockedAchievements.push(achievement.id)
      if (!newAchievementUnlocked) {
        newAchievement.value = achievement
        showAchievementNotification()
        newAchievementUnlocked = true
      }
    }
  })
  
  achievementsData.value.unlocked = unlockedAchievements
  localStorage.setItem('daytrack_achievements_data', JSON.stringify(achievementsData.value))
  
  updateAchievementsProgress()
}

// Показ уведомления о достижении
const showAchievementNotification = () => {
  achievementNotificationVisible.value = true
  setTimeout(() => {
    achievementNotificationVisible.value = false
  }, 3000)
}

// Вычисляемые свойства
const currentYear = computed(() => currentDate.value.getFullYear())

const currentMonth = computed(() => {
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ]
  return months[currentDate.value.getMonth()]
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const today = new Date()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
  const daysInMonth = lastDay.getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  
  const days = []
  let id = 1
  
  // Дни предыдущего месяца
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNumber = daysInPrevMonth - i
    const date = new Date(year, month - 1, dayNumber)
    days.push({
      id: id++,
      number: dayNumber,
      date: date,
      isCurrentMonth: false,
      isToday: isSameDay(today, date),
      isSelected: isSameDay(selectedDate.value, date)
    })
  }
  
  // Дни текущего месяца
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i)
    days.push({
      id: id++,
      number: i,
      date: date,
      isCurrentMonth: true,
      isToday: isSameDay(today, date),
      isSelected: isSameDay(selectedDate.value, date)
    })
  }
  
  // Дни следующего месяца
  const totalCells = 42
  const remainingDays = totalCells - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i)
    days.push({
      id: id++,
      number: i,
      date: date,
      isCurrentMonth: false,
      isToday: isSameDay(today, date),
      isSelected: isSameDay(selectedDate.value, date)
    })
  }
  
  return days
})

const selectedDateNotes = computed(() => {
  const dateKey = selectedDate.value.toDateString()
  return notesData.value[dateKey]?.text || ''
})

const displayLines = computed(() => {
  if (!selectedDateNotes.value) {
    return Array(11).fill('')
  }
  
  const text = selectedDateNotes.value
  const lines = []
  const words = text.split(' ')
  let currentLine = ''
  const maxLineLength = 30
  const maxLines = 11
  
  for (const word of words) {
    if ((currentLine + ' ' + word).length <= maxLineLength) {
      currentLine = currentLine ? currentLine + ' ' + word : word
    } else {
      if (currentLine) {
        lines.push(currentLine)
        currentLine = word
      }
      if (lines.length >= maxLines) break
    }
  }
  
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine)
  }
  
  while (lines.length < maxLines) {
    lines.push('')
  }
  
  return lines.slice(0, maxLines)
})

const currentGalleryImage = computed(() => {
  if (!galleryData.value || !Array.isArray(galleryData.value) || galleryData.value.length === 0) {
    return GalleryDefault
  }
  
  const validImages = galleryData.value.filter(img => 
    img && 
    img.url && 
    typeof img.url === 'string' && 
    img.url.startsWith('blob:')
  )
  
  if (validImages.length === 0) {
    return GalleryDefault
  }
  
  const selectedImage = validImages[randomGalleryIndex.value]?.url
  return selectedImage || GalleryDefault
})

// Методы
const loadStoredData = async () => {
  try {
    const storedMoodData = localStorage.getItem('daytrack_mood_data')
    const storedSleepData = localStorage.getItem('daytrack_sleep_data')
    const storedNotesData = localStorage.getItem('daytrack_notes_data')
    const storedEventData = localStorage.getItem('daytrack_event_data')
    const storedAchievementsData = localStorage.getItem('daytrack_achievements_data')

    if (storedMoodData) moodData.value = JSON.parse(storedMoodData)
    if (storedSleepData) sleepData.value = JSON.parse(storedSleepData)
    if (storedNotesData) notesData.value = JSON.parse(storedNotesData)
    if (storedEventData) eventData.value = JSON.parse(storedEventData)

    if (storedAchievementsData) {
      achievementsData.value = JSON.parse(storedAchievementsData)
      const unlockedIds = achievementsData.value.unlocked || []
      achievements.value.forEach(achievement => {
        achievement.unlocked = unlockedIds.includes(achievement.id)
      })
    } else {
      achievementsData.value = { unlocked: [] }
    }

    const images = await loadGalleryImagesFromDB()
    galleryData.value = images
    
    if (images.length > 0) {
      const validImages = images.filter(img => 
        img && img.url && typeof img.url === 'string' && img.url.startsWith('blob:')
      )
      if (validImages.length > 0) {
        randomGalleryIndex.value = generateRandomIndex(validImages.length)
      }
    }
    
    calculateStreak()
    calculateMaxStreak()
    updateAchievementsProgress()
    checkAchievements()
    
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
  }
}

const loadSelectedDateData = () => {
  const dateKey = selectedDate.value.toDateString()
  selectedMood.value = moodData.value[dateKey] || null
  selectedSleep.value = sleepData.value[dateKey] || null
}

const saveMoodData = () => {
  const dateKey = selectedDate.value.toDateString()
  if (selectedMood.value) {
    moodData.value[dateKey] = selectedMood.value
  } else {
    delete moodData.value[dateKey]
  }
  localStorage.setItem('daytrack_mood_data', JSON.stringify(moodData.value))
  
  calculateStreak()
  calculateMaxStreak()
  checkAchievements()
}

const saveSleepData = () => {
  const dateKey = selectedDate.value.toDateString()
  if (selectedSleep.value) {
    sleepData.value[dateKey] = selectedSleep.value
  } else {
    delete sleepData.value[dateKey]
  }
  localStorage.setItem('daytrack_sleep_data', JSON.stringify(sleepData.value))
  
  calculateStreak()
  calculateMaxStreak()
  checkAchievements()
}

const selectMood = (moodId) => {
  selectedMood.value = selectedMood.value === moodId ? null : moodId
  saveMoodData()
}

const selectSleep = (sleepId) => {
  selectedSleep.value = selectedSleep.value === sleepId ? null : sleepId
  saveSleepData()
}

const selectDate = (day) => {
  selectedDate.value = day.date
}

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const goToNotes = () => {
  localStorage.setItem('daytrack_selected_date', selectedDate.value.toISOString())
  localStorage.setItem('daytrack_notes_update', Date.now().toString())
  router.push('/notes')
}

const goToGallery = () => {
  router.push('/gallery')
}

const showTooltip = (event, text) => {
  tooltipText.value = text
  tooltipVisible.value = true
  const rect = event.target.getBoundingClientRect()
  tooltipX.value = rect.left + rect.width / 2
  tooltipY.value = rect.bottom + 15
}

const hideTooltip = () => {
  tooltipVisible.value = false
}

const hasMoodData = (date) => {
  return moodData.value[date.toDateString()] !== undefined
}

const hasSleepData = (date) => {
  return sleepData.value[date.toDateString()] !== undefined
}

const hasNotesData = (date) => {
  return notesData.value[date.toDateString()] !== undefined
}

const hasEventData = (date) => {
  return eventData.value[date.toDateString()] !== undefined
}

const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear()
}

// Методы для событий
const openEventModal = (day) => {
  eventModalDate.value = day.date
  eventModalText.value = eventData.value[day.date.toDateString()]?.text || ''
  eventModalVisible.value = true
}

const closeEventModal = () => {
  eventModalVisible.value = false
  eventModalDate.value = null
  eventModalText.value = ''
}

const saveEvent = () => {
  if (!eventModalDate.value) return
  
  const dateKey = eventModalDate.value.toDateString()
  
  if (eventModalText.value.trim()) {
    eventData.value[dateKey] = {
      text: eventModalText.value.trim(),
      savedAt: new Date().toISOString()
    }
  } else {
    delete eventData.value[dateKey]
  }
  
  localStorage.setItem('daytrack_event_data', JSON.stringify(eventData.value))
  
  calculateStreak()
  calculateMaxStreak()
  checkAchievements()
  
  closeEventModal()
}

const deleteEvent = () => {
  if (!eventModalDate.value) return
  
  const dateKey = eventModalDate.value.toDateString()
  delete eventData.value[dateKey]
  localStorage.setItem('daytrack_event_data', JSON.stringify(eventData.value))
  
  calculateStreak()
  calculateMaxStreak()
  
  closeEventModal()
}

const formatEventDate = (date) => {
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

const handleImageError = (event) => {
  event.target.src = GalleryDefault
}

// Обновление галереи при возвращении с страницы галереи
const updateGalleryData = async () => {
  const images = await loadGalleryImagesFromDB()
  galleryData.value = images
  
  if (images.length > 0) {
    const validImages = images.filter(img => 
      img && img.url && typeof img.url === 'string' && img.url.startsWith('blob:')
    )
    if (validImages.length > 0) {
      randomGalleryIndex.value = generateRandomIndex(validImages.length)
    }
  }
}

// Обработчики событий для обновления данных
const handleDateSelected = () => {
  const storedDate = localStorage.getItem('daytrack_selected_date')
  if (storedDate) {
    selectedDate.value = new Date(storedDate)
    loadSelectedDateData()
  }
}

const handleForceUpdate = () => {
  loadStoredData()
  loadSelectedDateData()
}

// Обработчик для событий из компонента записей
const handleNoteSaved = () => {
  const storedNotesData = localStorage.getItem('daytrack_notes_data')
  if (storedNotesData) {
    notesData.value = JSON.parse(storedNotesData)
  }
  
  calculateStreak()
  calculateMaxStreak()
  checkAchievements()
}

// Очистка
const cleanupEventListeners = () => {
  window.removeEventListener('daytrack_date_selected', handleDateSelected)
  window.removeEventListener('daytrack_force_update', handleForceUpdate)
  window.removeEventListener('daytrack_note_saved', handleNoteSaved)
  window.removeEventListener('focus', updateGalleryData)
  window.removeEventListener('storage', handleStorageUpdate)
}

const cleanupBlobUrls = () => {
  if (galleryData.value && Array.isArray(galleryData.value)) {
    galleryData.value.forEach(item => {
      if (item.url && item.url.startsWith('blob:')) {
        URL.revokeObjectURL(item.url)
      }
    })
  }
}

const handleStorageUpdate = async (event) => {
  if (event.key === 'daytrack_gallery_data') {
    await updateGalleryData()
  }
}

// Хуки жизненного цикла
onMounted(() => {
  loadStoredData()
  loadSelectedDateData()
  
  window.addEventListener('focus', updateGalleryData)
  window.addEventListener('daytrack_date_selected', handleDateSelected)
  window.addEventListener('daytrack_force_update', handleForceUpdate)
  window.addEventListener('daytrack_note_saved', handleNoteSaved)
  window.addEventListener('storage', handleStorageUpdate)
})

onUnmounted(() => {
  cleanupEventListeners()
  cleanupBlobUrls()
})

// Наблюдатели
watch(selectedDate, () => {
  loadSelectedDateData()
})
</script>

<style scoped>
.home-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  background: #BEAEDB;
  overflow: hidden;
  min-width: 1200px;
  min-height: 800px;
}

.background-image {
  width: 100%;
  height: 40vh;
  position: absolute;
  top: 0;
  left: 0;
  background-image: url('@/assets/lavanderall.png');
  background-size: cover;
  background-position: center;
  z-index: 1;
}

.main-content {
  position: absolute;
  top: 80px;
  left: 15px;
  right: 15px;
  bottom: 100px;
  display: grid;
  grid-template-columns: 1fr 250px 1fr;
  gap: 15px;
  z-index: 5;
}

/* Общие стили для секций */
.section-background {
  width: 100%;
  height: 100%;
  background: rgba(237, 221, 236, 0.66);
  border-radius: 18px;
  border: 1px #BEAEDB solid;
  position: absolute;
  top: 0;
  left: 0;
}

.section-content {
  position: relative;
  z-index: 3;
  padding: 10px 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.section-title {
  color: #3F2A52;
  font-size: 20px;
  font-family: 'KyivType Sans';
  font-weight: 840;
  text-align: center;
  margin-top: -8px;
  margin-bottom: 0;
}

/* Левая колонка */
.left-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mood-section,
.sleep-section,
.calendar-section {
  position: relative;
  border-radius: 18px;
  overflow: visible;
}

.mood-section,
.sleep-section {
  height: 100px;
}

.calendar-section {
  height: 400px;
}

/* Центральная колонка */
.center-column {
  display: flex;
  flex-direction: column;
}

.notes-section {
  position: relative;
  height: 100%;
  border-radius: 18px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.notes-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(151, 112, 169, 0.2);
}

/* Правая колонка */
.right-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.gallery-section,
.achievements-section {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
}

.gallery-section {
  height: 300px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.gallery-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(151, 112, 169, 0.2);
}

.achievements-section {
  height: calc(100% - 312px);
  margin-top: auto;
}

.achievements-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin: 10px 0;
}

.stats-info {
  margin-bottom: 15px;
  text-align: center;
}

.streak-count,
.max-streak {
  color: #6D5D7A;
  font-size: 14px;
  font-family: 'KyivType Sans';
  font-weight: 840;
  margin-bottom: 5px;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  flex: 1;
}

.achievement-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.achievement-item:hover {
  background: rgba(190, 174, 219, 0.3);
}

.achievement-item.unlocked {
  background: rgba(185, 152, 200, 0.2);
}

.achievement-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  margin-bottom: 3px;
}

.achievement-name {
  color: #6D5D7A;
  font-size: 10px;
  font-family: 'KyivType Sans';
  font-weight: 840;
  text-align: center;
  margin-bottom: 2px;
}

.achievement-progress {
  color: #9770A9;
  font-size: 8px;
  font-family: 'KyivType Sans';
  font-weight: 840;
}

/* Стили для картинок */
.mood-image {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 90px;
  height: 90px;
  object-fit: contain;
  z-index: 2;
  opacity: 0.8;
}

.dream-image {
  position: absolute;
  left: 1px;
  top: 0;
  width: 120px;
  height: 100%;
  object-fit: cover;
  z-index: 1;
  opacity: 0.7;
  border-radius: 0 18px 18px 0;
}

/* Стили для эмодзи */
.emojis-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  flex: 1;
  margin: 0 10px;
  z-index: 4;
  position: relative;
  margin-top: 2px;
}

.emoji-item {
  width: 60px;
  height: 60px;
  cursor: pointer;
  padding: 5px;
  border-radius: 10px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: transparent;
  overflow: visible;
  margin: 5px;
}

.emoji-item:hover {
  transform: scale(1.5);
  background: rgba(190, 174, 219, 0.4);
  z-index: 1000;
  border-color: white;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
}

.emoji-item.selected {
  border-color: white;
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.7);
  transform: scale(1.2);
}

.emoji-img {
  width: 60px;
  height: 60px;
  object-fit: contain;
  overflow: visible;
}

/* Подсказка */
.tooltip {
  position: fixed;
  background: rgba(63, 42, 82, 0.95);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-family: 'KyivType Sans';
  z-index: 1001;
  white-space: nowrap;
  pointer-events: none;
  transform: translateX(-50%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Календарь */
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.calendar-nav {
  background: #B998C8;
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  color: white;
  cursor: pointer;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-title {
  color: #3F2A52;
  font-size: 20px;
  font-family: 'KyivType Sans';
  font-weight: 840;
  text-align: center;
  text-transform: lowercase;
}

.week-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  margin-bottom: 10px;
}

.week-day {
  color: #3F2A52;
  font-size: 18px;
  font-family: 'KyivType Sans';
  font-weight: 840;
  text-align: center;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(6, 1fr);
  gap: 5px;
  height: calc(100% - 60px);
  align-items: center;
  justify-items: center;
}

.calendar-day {
  color: #3A2D34;
  font-size: 14px;
  font-family: 'KyivType Sans';
  font-weight: 840;
  text-align: center;
  padding: 5px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  width: 30px;
  height: 30px;
  min-width: 30px;
  min-height: 30px;
  margin: 0;
  box-sizing: border-box;
}

.calendar-day:hover {
  background-color: rgba(190, 174, 219, 0.3);
}

.calendar-day.other-month {
  color: #C7A7D6;
}

.calendar-day.today {
  background: #3F2A52;
  color: white;
}

.calendar-day.selected {
  background: #925faa;
  color: white;
}

/* Индикаторы данных в календаре */
.day-indicators {
  position: absolute;
  bottom: 2px;
  right: 2px;
  display: flex;
  gap: 2px;
}

.mood-indicator,
.sleep-indicator,
.notes-indicator,
.event-indicator {
  width: 4px;
  height: 4px;
  border-radius: 50%;
}

.mood-indicator {
  background: #FF6B6B;
}

.sleep-indicator {
  background: #4ECDC4;
}

.notes-indicator {
  background: #0e9a28;
}

.event-indicator {
  background: #593692;
}

/* Записи */
.notes-content {
  flex: 1;
  margin: 10px 0;
}

.notes-text-with-lines {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.text-line-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  flex: 1;
}

.text-line {
  color: #6D5D7A;
  font-size: 16px;
  font-family: 'KyivType Sans';
  font-weight: 840;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 3px;
}

.line-under-text {
  height: 2px;
  background: #C7A7D6;
  border-radius: 1px;
  opacity: 0.6;
  width: 100%;
}

/* Галерея */
.gallery-image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 4px 0;
  overflow: hidden;
  border-radius: 8px;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.gallery-section:hover .gallery-image {
  transform: scale(1.05);
  border-radius: 8px;
}

/* Уведомление о достижении */
.achievement-notification {
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(237, 221, 236, 0.95);
  border: 2px solid #BEAEDB;
  border-radius: 18px;
  padding: 20px;
  z-index: 1000;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  animation: slideDown 0.5s ease-out;
}

.achievement-notification-content {
  text-align: center;
}

.achievement-notification-title {
  color: #3F2A52;
  font-size: 18px;
  font-family: 'KyivType Sans';
  font-weight: 840;
  margin-bottom: 8px;
}

.achievement-notification-text {
  color: #6D5D7A;
  font-size: 14px;
  font-family: 'KyivType Sans';
  line-height: 1.4;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* Модальное окно событий */
.event-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.event-modal {
  background: rgba(237, 221, 236, 0.95);
  border-radius: 18px;
  padding: 20px;
  width: 400px;
  max-width: 90vw;
  border: 2px solid #BEAEDB;
}

.event-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.event-modal-title {
  color: #3F2A52;
  font-size: 20px;
  font-family: 'KyivType Sans';
  font-weight: 840;
}

.event-modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #9770A9;
  cursor: pointer;
}

.event-modal-date {
  color: #6D5D7A;
  font-size: 16px;
  font-family: 'KyivType Sans';
  font-weight: 840;
  margin-bottom: 15px;
  text-align: center;
}

.event-modal-textarea {
  width: 100%;
  height: 120px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid #C7A7D6;
  border-radius: 8px;
  padding: 12px;
  color: #6D5D7A;
  font-size: 14px;
  font-family: 'KyivType Sans';
  resize: none;
  outline: none;
}

.event-modal-chars {
  color: #9770A9;
  font-size: 12px;
  font-family: 'KyivType Sans';
  text-align: right;
  margin-top: 5px;
}

.event-modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  gap: 10px;
}

.event-delete-btn {
  background: #e74c3c;
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-family: 'KyivType Sans';
  font-weight: 840;
  padding: 10px 20px;
  cursor: pointer;
  flex: 1;
}

.event-save-btn {
  background: #B998C8;
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-family: 'KyivType Sans';
  font-weight: 840;
  padding: 10px 20px;
  cursor: pointer;
  flex: 2;
}

/* Адаптивность */
@media (min-width: 1400px) {
  .main-content {
    left: 20px;
    right: 20px;
  }
}

@media (min-width: 1600px) {
  .main-content {
    left: 25px;
    right: 25px;
  }
}

@media (min-width: 1920px) {
  .main-content {
    left: 30px;
    right: 30px;
  }
}
</style>