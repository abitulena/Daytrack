<template>
  <div class="home-container">
    <!-- Фоновое изображение -->
    <div class="background-image"></div>
    
    <!-- Шапка страницы -->
    <Header />
    
    <!-- Компонент уведомлений -->
    <notifications position="top right" width="400" :max="3" :duration="8000" />
    
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
              >
                <img :src="mood.image" :alt="mood.name" class="emoji-img" />
                <div class="emoji-tooltip">{{ mood.name }}</div>
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
              >
                <img :src="sleep.image" :alt="sleep.name" class="emoji-img" />
                <div class="emoji-tooltip">{{ sleep.name }}</div>
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
                  'disabled': isFutureDate(day.date)
                }"
                @click="selectDate(day)"
              >
                {{ day.number }}
                <!-- Индикаторы данных -->
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
                <template v-if="displayLines.length > 0">
                  <div 
                    v-for="(line, index) in displayLines" 
                    :key="index"
                    class="text-line-container"
                  >
                    <div class="text-line">{{ line }}</div>
                    <div class="line-under-text"></div>
                  </div>
                </template>
                <template v-else>
                  <div class="empty-notes-message">
                    Нажмите, чтобы добавить запись
                  </div>
                </template>
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
                :key="galleryImageKey" 
                :src="currentGalleryImage" 
                alt="Gallery" 
                class="gallery-image" 
                @error="handleImageError"
              />
              <div v-if="!galleryImagesData.length" class="empty-gallery-message">
                Нет изображений
              </div>
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
                  @mouseover="currentAchievementId = achievement.id"
                  @mouseleave="currentAchievementId = null"
                >
                  <img 
                    :src="achievement.unlocked ? achievement.image : achievement.lockedImage" 
                    :alt="achievement.shortName" 
                    class="achievement-img"
                  />
                  <div class="achievement-name">{{ achievement.shortName }}</div>
                  <div class="achievement-progress" v-if="!achievement.unlocked && achievement.progress">
                    {{ achievement.progress.current }}/{{ achievement.progress.total }}
                  </div>
                  <!-- Подсказка достижения -->
                  <div 
                    class="achievement-tooltip"
                    :class="{ 'visible': currentAchievementId === achievement.id }"
                  >
                    <div class="tooltip-title">{{ achievement.name }}</div>
                    <div class="tooltip-description">{{ achievement.description }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import { notify } from "@kyvg/vue3-notification"

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
const currentStreak = ref(0)
const maxStreak = ref(0)
const galleryImageKey = ref(0)
const randomGalleryImageIndex = ref(-1)
const currentAchievementId = ref(null)

// Данные из localStorage
const moodData = ref({})
const sleepData = ref({})
const notesData = ref({})
const eventData = ref({})
const achievementsData = ref({})
const galleryImagesData = ref([])

// Константы
const weekDays = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']
const moods = [
  { id: 1, name: 'Грустный', shortName: 'грустный', image: Грустный },
  { id: 2, name: 'Нейтральный', shortName: 'нейтральный', image: Нейтральный },
  { id: 3, name: 'Спокойный', shortName: 'спокойный', image: Спокойный },
  { id: 4, name: 'Радостный', shortName: 'радостный', image: Радостный },
  { id: 5, name: 'Счастлив', shortName: 'счастлив', image: Счастлив }
]

const sleepQuality = [
  { id: 1, name: 'Отлично поспал', shortName: 'отлично', image: ОтличноПоспал },
  { id: 2, name: 'Хорошо поспал', shortName: 'хорошо', image: ХорошоПоспал },
  { id: 3, name: 'Нормальный сон', shortName: 'нормально', image: Нормально },
  { id: 4, name: 'Плохо спал', shortName: 'плохо', image: ПлохоСпал },
  { id: 5, name: 'Бессоница', shortName: 'бессоница', image: Бессоница }
]

// Достижения
const achievements = ref([
  {
    id: 1,
    name: 'Первая запись',
    shortName: 'Первая запись',
    description: 'Создайте первую запись в дневнике',
    image: AchievementFirstEntry,
    lockedImage: AchievementLocked,
    unlocked: false,
    condition: 1,
    type: 'notes_entry',
    progress: { current: 0, total: 1 }
  },
  {
    id: 2,
    name: 'Серия из 5 дней',
    shortName: '5 дней',
    description: 'Ведите дневник 5 дней подряд',
    image: Achievement5Days,
    lockedImage: AchievementLocked,
    unlocked: false,
    condition: 5,
    type: 'notes_streak',
    progress: { current: 0, total: 5 }
  },
  {
    id: 3,
    name: 'Серия из 15 дней',
    shortName: '15 дней',
    description: 'Ведите дневник 15 дней подряд',
    image: Achievement15Days,
    lockedImage: AchievementLocked,
    unlocked: false,
    condition: 15,
    type: 'notes_streak',
    progress: { current: 0, total: 15 }
  },
  {
    id: 4,
    name: 'Серия из 30 дней',
    shortName: '30 дней',
    description: 'Ведите дневник 30 дней подряд',
    image: Achievement30Days,
    lockedImage: AchievementLocked,
    unlocked: false,
    condition: 30,
    type: 'notes_streak',
    progress: { current: 0, total: 30 }
  }
])

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

// Получаем запись для выбранной даты
const selectedDateNotes = computed(() => {
  const dateKey = selectedDate.value.toDateString()
  return notesData.value[dateKey]?.text || ''
})

// Отображаем строки записи в плашке
const displayLines = computed(() => {
  const text = selectedDateNotes.value
  
  if (!text || text.trim() === '') {
    return []
  }
  
  const lines = []
  let currentLine = ''
  const maxLineLength = 35
  const maxLines = 11
  
  // Разбиваем текст на строки по символам новой строки
  const paragraphs = text.split('\n')
  
  for (const paragraph of paragraphs) {
    if (paragraph.trim() === '') continue
    
    const words = paragraph.split(' ')
    
    for (const word of words) {
      if ((currentLine + (currentLine ? ' ' : '') + word).length <= maxLineLength) {
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
      currentLine = ''
    }
    
    if (lines.length >= maxLines) break
  }
  
  // Добавляем последнюю строку если есть
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine)
  }
  
  // Если строк меньше 11, заполняем пустыми
  while (lines.length < maxLines && lines.length < 11) {
    lines.push('')
  }
  
  return lines.slice(0, maxLines)
})

// Получение изображения галереи
const currentGalleryImage = computed(() => {
  if (!galleryImagesData.value || galleryImagesData.value.length === 0) {
    return GalleryDefault
  }
  
  if (randomGalleryImageIndex.value === -1 || 
      randomGalleryImageIndex.value >= galleryImagesData.value.length) {
    randomGalleryImageIndex.value = Math.floor(Math.random() * galleryImagesData.value.length)
  }
  
  const imageInfo = galleryImagesData.value[randomGalleryImageIndex.value]
  
  if (!imageInfo || !imageInfo.url) {
    return GalleryDefault
  }
  
  return imageInfo.url || GalleryDefault
})

// Получение ключа для данных пользователя
const getUserKey = (baseKey) => {
  const userId = localStorage.getItem('daytrack_user_id')
  return userId ? `${baseKey}_${userId}` : baseKey
}

// Загрузка данных галереи
const loadGalleryData = () => {
  try {
    loadGalleryFromIndexedDB()
  } catch (error) {
    console.error('❌ Ошибка загрузки галереи:', error)
    galleryImagesData.value = []
    randomGalleryImageIndex.value = -1
  }
}

// Загрузка галереи из IndexedDB
const loadGalleryFromIndexedDB = async () => {
  try {
    const userId = localStorage.getItem('daytrack_user_id')
    const dbName = userId ? `GalleryDB_v2_${userId}` : 'GalleryDB_v2_default'
    
    const request = indexedDB.open(dbName, 2)
    
    request.onsuccess = (event) => {
      const db = event.target.result
      
      if (!db.objectStoreNames.contains('gallery_images')) {
        galleryImagesData.value = []
        randomGalleryImageIndex.value = -1
        return
      }
      
      const transaction = db.transaction(['gallery_images'], 'readonly')
      const store = transaction.objectStore('gallery_images')
      const allRequest = store.getAll()
      
      allRequest.onsuccess = () => {
        const allImages = allRequest.result || []
        
        if (allImages.length > 0) {
          const userImages = allImages.filter(img => img.userId === userId)
          
          if (userImages.length > 0) {
            const sortedImages = userImages.sort((a, b) => b.timestamp - a.timestamp)
            
            galleryImagesData.value = sortedImages.map(img => ({
              id: img.id,
              url: img.data,
              name: img.name,
              uploadedAt: img.uploadedAt,
              cellIndex: img.cellIndex
            }))
            
            randomGalleryImageIndex.value = Math.floor(Math.random() * galleryImagesData.value.length)
          } else {
            galleryImagesData.value = []
            randomGalleryImageIndex.value = -1
          }
        } else {
          galleryImagesData.value = []
          randomGalleryImageIndex.value = -1
        }
        
        galleryImageKey.value = Date.now()
      }
      
      allRequest.onerror = (error) => {
        console.error('❌ Ошибка загрузки из IndexedDB:', error)
        galleryImagesData.value = []
        randomGalleryImageIndex.value = -1
      }
    }
    
    request.onerror = (error) => {
      console.error('❌ Ошибка открытия IndexedDB:', error)
      galleryImagesData.value = []
      randomGalleryImageIndex.value = -1
    }
    
  } catch (error) {
    console.error('❌ Ошибка в loadGalleryFromIndexedDB:', error)
    galleryImagesData.value = []
    randomGalleryImageIndex.value = -1
  }
}

// Основные методы
const loadAllData = () => {
  console.log('🔄 Загрузка всех данных')
  
  try {
    // Настроение
    const moodKey = getUserKey('daytrack_mood_data')
    const storedMoodData = localStorage.getItem(moodKey)
    moodData.value = storedMoodData ? JSON.parse(storedMoodData) : {}
    
    // Сон
    const sleepKey = getUserKey('daytrack_sleep_data')
    const storedSleepData = localStorage.getItem(sleepKey)
    sleepData.value = storedSleepData ? JSON.parse(storedSleepData) : {}
    
    // Записи
    const notesKey = getUserKey('daytrack_notes_data')
    const storedNotesData = localStorage.getItem(notesKey)
    if (storedNotesData) {
      notesData.value = JSON.parse(storedNotesData)
    } else {
      notesData.value = {}
    }
    
    // События
    const eventKey = getUserKey('daytrack_event_data')
    const storedEventData = localStorage.getItem(eventKey)
    eventData.value = storedEventData ? JSON.parse(storedEventData) : {}
    
    // Достижения
    const achievementsKey = getUserKey('daytrack_achievements_data')
    const storedAchievementsData = localStorage.getItem(achievementsKey)
    if (storedAchievementsData) {
      achievementsData.value = JSON.parse(storedAchievementsData)
      const unlockedIds = achievementsData.value.unlocked || []
      
      achievements.value.forEach(achievement => {
        achievement.unlocked = unlockedIds.includes(achievement.id)
      })
    } else {
      achievementsData.value = { unlocked: [], lastCheck: null }
    }
    
    // Загружаем галерею
    loadGalleryData()
    
    // Обновляем данные для выбранной даты
    loadSelectedDateData()
    
    // Рассчитываем статистику
    calculateStreak()
    calculateMaxStreak()
    updateAchievementsProgress()
    
    // Проверяем достижения
    checkAchievements()
    
    // Проверяем напоминание
    setTimeout(checkReminder, 1000)
    
  } catch (error) {
    console.error('❌ Ошибка загрузки данных:', error)
  }
}

const checkReminder = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayKey = today.toDateString()
  
  const reminderShownKey = getUserKey('daytrack_reminder_shown')
  const reminderShownDate = localStorage.getItem(reminderShownKey)
  
  const hasTodayNote = hasNotesData(today)
  
  if (!hasTodayNote && reminderShownDate !== todayKey) {
    showReminderNotification()
    localStorage.setItem(reminderShownKey, todayKey)
  }
}

const loadSelectedDateData = () => {
  const dateKey = selectedDate.value.toDateString()
  selectedMood.value = moodData.value[dateKey] || null
  selectedSleep.value = sleepData.value[dateKey] || null
}

const selectMood = (moodId) => {
  if (isFutureDate(selectedDate.value)) {
    return
  }
  
  selectedMood.value = selectedMood.value === moodId ? null : moodId
  saveMoodData()
}

const selectSleep = (sleepId) => {
  if (isFutureDate(selectedDate.value)) {
    return
  }
  
  selectedSleep.value = selectedSleep.value === sleepId ? null : sleepId
  saveSleepData()
}

const saveMoodData = () => {
  const dateKey = selectedDate.value.toDateString()
  if (selectedMood.value) {
    moodData.value[dateKey] = selectedMood.value
  } else {
    delete moodData.value[dateKey]
  }
  
  const moodKey = getUserKey('daytrack_mood_data')
  localStorage.setItem(moodKey, JSON.stringify(moodData.value))
}

const saveSleepData = () => {
  const dateKey = selectedDate.value.toDateString()
  if (selectedSleep.value) {
    sleepData.value[dateKey] = selectedSleep.value
  } else {
    delete sleepData.value[dateKey]
  }
  
  const sleepKey = getUserKey('daytrack_sleep_data')
  localStorage.setItem(sleepKey, JSON.stringify(sleepData.value))
}

const selectDate = (day) => {
  selectedDate.value = day.date
  loadSelectedDateData()
}

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const goToNotes = () => {
  const dateIso = selectedDate.value.toISOString()
  localStorage.setItem('daytrack_selected_date', dateIso)
  
  router.push('/notes')
    .catch(() => {
      window.location.href = '/notes'
    })
}

const goToGallery = () => {
  router.push('/gallery')
    .catch(() => {
      window.location.href = '/gallery'
    })
}

const hasMoodData = (date) => {
  return moodData.value[date.toDateString()] !== undefined
}

const hasSleepData = (date) => {
  return sleepData.value[date.toDateString()] !== undefined
}

const hasNotesData = (date) => {
  const note = notesData.value[date.toDateString()]
  return note && note.text && note.text.trim() !== ''
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

const isFutureDate = (date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const checkDate = new Date(date)
  checkDate.setHours(0, 0, 0, 0)
  return checkDate > today
}

// ПРОСТОЙ расчет текущей серии
const calculateStreak = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Если нет записи на сегодня - серия = 0
  if (!hasNotesData(today)) {
    currentStreak.value = 0
    return
  }
  
  // Начинаем с сегодняшнего дня
  let streak = 1
  let currentDateToCheck = new Date(today)
  
  // Идем назад по дням
  for (let i = 1; i < 365; i++) {
    currentDateToCheck.setDate(today.getDate() - i)
    currentDateToCheck.setHours(0, 0, 0, 0)
    
    // Если есть запись на этот день - увеличиваем серию
    if (hasNotesData(currentDateToCheck)) {
      streak++
    } else {
      // Нет записи - серия прерывается
      break
    }
  }
  
  currentStreak.value = streak
}

// ПРОСТОЙ расчет максимальной серии
const calculateMaxStreak = () => {
  // Получаем все даты с записями
  const noteDates = Object.keys(notesData.value)
    .filter(dateKey => {
      const note = notesData.value[dateKey]
      return note && note.text && note.text.trim() !== ''
    })
    .map(dateStr => {
      const date = new Date(dateStr)
      date.setHours(0, 0, 0, 0)
      return date
    })
    .sort((a, b) => a - b) // Сортировка по возрастанию
  
  if (noteDates.length === 0) {
    maxStreak.value = 0
    return
  }
  
  let maxStreakCount = 1
  let currentStreakCount = 1
  let prevDate = noteDates[0]
  
  for (let i = 1; i < noteDates.length; i++) {
    const currentDate = noteDates[i]
    
    // Разница в днях
    const diffTime = currentDate - prevDate
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      // Последовательные дни
      currentStreakCount++
      maxStreakCount = Math.max(maxStreakCount, currentStreakCount)
    } else if (diffDays > 1) {
      // Пропущены дни
      currentStreakCount = 1
    }
    
    prevDate = currentDate
  }
  
  maxStreak.value = maxStreakCount
}

const updateAchievementsProgress = () => {
  const validEntries = Object.keys(notesData.value).filter(dateKey => {
    const note = notesData.value[dateKey]
    return note && note.text && note.text.trim() !== ''
  })
  
  const totalValidEntries = validEntries.length
  
  achievements.value.forEach(achievement => {
    if (achievement.unlocked) {
      achievement.progress.current = achievement.progress.total
    } else {
      if (achievement.type === 'notes_entry') {
        achievement.progress.current = Math.min(totalValidEntries, achievement.progress.total)
      } else if (achievement.type === 'notes_streak') {
        achievement.progress.current = Math.min(currentStreak.value, achievement.progress.total)
      }
    }
  })
}

const checkAchievements = () => {
  const unlockedAchievements = achievementsData.value.unlocked || []
  let newAchievements = []
  
  const validEntries = Object.keys(notesData.value).filter(dateKey => {
    const note = notesData.value[dateKey]
    return note && note.text && note.text.trim() !== ''
  })
  
  const totalValidEntries = validEntries.length
  
  achievements.value.forEach(achievement => {
    if (unlockedAchievements.includes(achievement.id)) {
      achievement.unlocked = true
      return
    }
    
    let shouldUnlock = false
    
    if (achievement.type === 'notes_entry') {
      shouldUnlock = totalValidEntries >= achievement.condition
    } else if (achievement.type === 'notes_streak') {
      shouldUnlock = currentStreak.value >= achievement.condition
    }
    
    if (shouldUnlock && !achievement.unlocked) {
      achievement.unlocked = true
      unlockedAchievements.push(achievement.id)
      newAchievements.push(achievement)
    }
  })
  
  if (newAchievements.length > 0) {
    newAchievements.forEach((achievement, index) => {
      setTimeout(() => {
        showAchievementNotification(achievement)
      }, index * 1500)
    })
  }
  
  achievementsData.value.unlocked = unlockedAchievements
  
  const achievementsKey = getUserKey('daytrack_achievements_data')
  localStorage.setItem(achievementsKey, JSON.stringify(achievementsData.value))
  
  updateAchievementsProgress()
}

const showAchievementNotification = (achievement) => {
  notify({
    title: '🏆 Новое достижение!',
    text: `Вы получили: "${achievement.name}"`,
    type: 'success',
    duration: 8000,
    speed: 1000
  })
}

// Функция показа напоминания
const showReminderNotification = () => {
  notify({
    title: '✍️ Напоминание',
    text: 'Не забудьте сделать запись в дневнике на сегодня!',
    type: 'info',
    duration: 10000,
    speed: 1000
  })
}

const handleImageError = (event) => {
  event.target.src = GalleryDefault
  galleryImageKey.value = Date.now()
}

// Проверка обновлений записей
const checkNotesUpdates = () => {
  const notesKey = getUserKey('daytrack_notes_data')
  const storedData = localStorage.getItem(notesKey)
  
  if (!storedData) return
  
  try {
    const parsedData = JSON.parse(storedData)
    const currentDataStr = JSON.stringify(notesData.value)
    const storedDataStr = JSON.stringify(parsedData)
    
    if (currentDataStr !== storedDataStr) {
      notesData.value = parsedData
      loadSelectedDateData()
      calculateStreak()
      calculateMaxStreak()
      updateAchievementsProgress()
      checkAchievements()
    }
  } catch (error) {
    console.error('❌ Ошибка при проверке обновлений:', error)
  }
}

// Обновление изображения галереи
const refreshGalleryImage = () => {
  if (galleryImagesData.value.length > 0) {
    randomGalleryImageIndex.value = Math.floor(Math.random() * galleryImagesData.value.length)
    galleryImageKey.value = Date.now()
  }
}

// Хуки жизненного цикла
onMounted(() => {
  const isLoggedIn = localStorage.getItem('daytrack_logged_in') === 'true'
  if (!isLoggedIn) {
    router.push('/')
    return
  }
  
  loadAllData()
  
  // Автоматическое обновление
  const updateInterval = setInterval(() => {
    checkNotesUpdates()
  }, 2000)
  
  // Слушаем события storage
  const handleStorageChange = (event) => {
    if (event.key && (
      event.key === getUserKey('daytrack_notes_data') ||
      event.key.includes('daytrack_notes_data')
    )) {
      setTimeout(() => {
        checkNotesUpdates()
      }, 100)
    }
    
    if (event.key && (
      event.key === getUserKey('daytrack_gallery_updated') ||
      event.key.includes('daytrack_gallery_updated')
    )) {
      setTimeout(() => {
        loadGalleryData()
        refreshGalleryImage()
      }, 100)
    }
  }
  
  window.addEventListener('storage', handleStorageChange)
  
  // Отслеживаем сообщения
  window.addEventListener('message', (event) => {
    if (event.data === 'notes_updated') {
      setTimeout(() => {
        checkNotesUpdates()
      }, 100)
    }
    
    if (event.data === 'gallery_updated') {
      setTimeout(() => {
        loadGalleryData()
        refreshGalleryImage()
      }, 100)
    }
  })
  
  // Обновляем изображение галереи
  nextTick(() => {
    refreshGalleryImage()
  })
  
  // Очистка
  onUnmounted(() => {
    clearInterval(updateInterval)
    window.removeEventListener('storage', handleStorageChange)
  })
})

// Наблюдатели
watch(selectedDate, () => {
  loadSelectedDateData()
})

watch(() => notesData.value, () => {
  calculateStreak()
  calculateMaxStreak()
  updateAchievementsProgress()
}, { deep: true })
</script>

<style scoped>
@import '@/components/Home.css';
</style>