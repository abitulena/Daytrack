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
                @dblclick="handleDayDoubleClick(day)"
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
          @input="handleTextareaInput"
        ></textarea>
        <div class="event-modal-chars">{{ eventModalText.length }}/200</div>
        <div class="event-modal-actions">
          <button v-if="hasEventData(eventModalDate)" class="event-delete-btn" @click="deleteEvent">
            удалить
          </button>
          <button class="event-save-btn" @click="saveEvent" :disabled="!eventModalText.trim()">
            {{ hasEventData(eventModalDate) ? 'сохранить' : 'добавить' }}
          </button>
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
const eventModalVisible = ref(false)
const eventModalDate = ref(null)
const eventModalText = ref('')
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

// Флаг для отслеживания событий
const eventCheckInterval = ref(null)

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
  const note = notesData.value[dateKey]
  console.log('📝 Запись для даты', dateKey, ':', note)
  return note?.text || ''
})

// Отображаем строки записи в плашке
const displayLines = computed(() => {
  const text = selectedDateNotes.value
  
  console.log('📄 Текст для отображения в плашке:', text ? text.substring(0, 50) + '...' : 'пусто')
  
  if (!text || text.trim() === '') {
    console.log('📄 Текст пустой, возвращаем пустые строки')
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
  
  console.log('📄 Сформированные строки:', lines)
  
  // Если строк меньше 11, заполняем пустыми
  while (lines.length < maxLines && lines.length < 11) {
    lines.push('')
  }
  
  return lines.slice(0, maxLines)
})

// Получение случайного изображения галереи
const currentGalleryImage = computed(() => {
  console.log('🖼️ Запрос изображения галереи. Всего изображений:', galleryImagesData.value.length)
  
  if (!galleryImagesData.value || galleryImagesData.value.length === 0) {
    console.log('🖼️ Нет изображений, возвращаем дефолтное')
    return GalleryDefault
  }
  
  // Если индекс еще не установлен или вышел за границы
  if (randomGalleryImageIndex.value === -1 || 
      randomGalleryImageIndex.value >= galleryImagesData.value.length) {
    randomGalleryImageIndex.value = Math.floor(Math.random() * galleryImagesData.value.length)
    console.log('🎲 Выбран новый индекс:', randomGalleryImageIndex.value)
  }
  
  const imageInfo = galleryImagesData.value[randomGalleryImageIndex.value]
  console.log('🖼️ Информация об изображении:', imageInfo)
  
  if (!imageInfo || !imageInfo.id) {
    console.log('🖼️ Некорректная информация об изображении')
    return GalleryDefault
  }
  
  // Пытаемся получить URL из кеша
  const cacheKey = `gallery_image_${imageInfo.id}`
  const cachedUrl = localStorage.getItem(cacheKey)
  
  if (cachedUrl) {
    console.log('🖼️ Найден URL в кеше:', cacheKey)
    try {
      // Проверяем, валиден ли URL
      new URL(cachedUrl)
      return cachedUrl
    } catch (error) {
      console.log('🖼️ Некорректный URL в кеше, удаляем:', error)
      localStorage.removeItem(cacheKey)
    }
  }
  
  console.log('🖼️ URL не найден в кеше, возвращаем дефолтное')
  return GalleryDefault
})

// Получение ключа для данных пользователя
const getUserKey = (baseKey) => {
  const userId = localStorage.getItem('daytrack_user_id')
  const key = userId ? `${baseKey}_${userId}` : baseKey
  console.log('🔑 Ключ для', baseKey, ':', key)
  return key
}

// Основные методы
const loadStoredData = () => {
  console.log('🔄 Загрузка данных из localStorage')
  
  try {
    // Настроение
    const moodKey = getUserKey('daytrack_mood_data')
    const storedMoodData = localStorage.getItem(moodKey)
    if (storedMoodData) {
      moodData.value = JSON.parse(storedMoodData)
      console.log('😊 Данные настроения загружены:', Object.keys(moodData.value).length, 'записей')
    } else {
      moodData.value = {}
      console.log('😊 Данные настроения не найдены')
    }
    
    // Сон
    const sleepKey = getUserKey('daytrack_sleep_data')
    const storedSleepData = localStorage.getItem(sleepKey)
    if (storedSleepData) {
      sleepData.value = JSON.parse(storedSleepData)
      console.log('😴 Данные сна загружены:', Object.keys(sleepData.value).length, 'записей')
    } else {
      sleepData.value = {}
      console.log('😴 Данные сна не найдены')
    }
    
    // Записи - ВАЖНО: проверяем несколько возможных ключей
    const notesKey = getUserKey('daytrack_notes_data')
    console.log('📝 Ищем записи по ключу:', notesKey)
    
    let storedNotesData = localStorage.getItem(notesKey)
    
    // Если не нашли по ключу с пользователем, пробуем без пользователя
    if (!storedNotesData) {
      console.log('📝 Пробуем найти по базовому ключу: daytrack_notes_data')
      storedNotesData = localStorage.getItem('daytrack_notes_data')
    }
    
    if (storedNotesData) {
      try {
        notesData.value = JSON.parse(storedNotesData)
        console.log('✅ Данные записей загружены успешно')
        console.log('📊 Статистика записей:', {
          total: Object.keys(notesData.value).length,
          dates: Object.keys(notesData.value).slice(0, 3),
          sample: Object.entries(notesData.value).slice(0, 3)
        })
      } catch (error) {
        console.error('❌ Ошибка парсинга данных записей:', error)
        notesData.value = {}
      }
    } else {
      console.log('ℹ️ Данные записей не найдены ни по одному ключу')
      notesData.value = {}
    }
    
    // События
    const eventKey = getUserKey('daytrack_event_data')
    const storedEventData = localStorage.getItem(eventKey)
    if (storedEventData) {
      eventData.value = JSON.parse(storedEventData)
      console.log('📅 Данные событий загружены:', Object.keys(eventData.value).length, 'событий')
    } else {
      eventData.value = {}
      console.log('📅 Данные событий не найдены')
    }
    
    // Достижения
    const achievementsKey = getUserKey('daytrack_achievements_data')
    const storedAchievementsData = localStorage.getItem(achievementsKey)
    if (storedAchievementsData) {
      achievementsData.value = JSON.parse(storedAchievementsData)
      const unlockedIds = achievementsData.value.unlocked || []
      achievements.value.forEach(achievement => {
        achievement.unlocked = unlockedIds.includes(achievement.id)
      })
      console.log('🏆 Данные достижений загружены')
    } else {
      achievementsData.value = { unlocked: [], lastCheck: null }
      console.log('🏆 Данные достижений не найдены, созданы новые')
    }
    
    // Загружаем галерею
    loadGalleryData()
    
    // Рассчитываем статистику
    calculateStreak()
    calculateMaxStreak()
    updateAchievementsProgress()
    checkAchievements()
    checkEventNotifications()
    
  } catch (error) {
    console.error('❌ Критическая ошибка загрузки данных:', error)
  }
}

// Загрузка данных галереи
const loadGalleryData = () => {
  try {
    const galleryKey = getUserKey('daytrack_gallery_data')
    console.log('🖼️ Загрузка галереи по ключу:', galleryKey)
    
    const storedGalleryData = localStorage.getItem(galleryKey)
    
    // Если не нашли по ключу с пользователем, пробуем без пользователя
    if (!storedGalleryData) {
      console.log('🖼️ Пробуем найти по базовому ключу: daytrack_gallery_data')
      const basicGalleryData = localStorage.getItem('daytrack_gallery_data')
      if (basicGalleryData) {
        galleryImagesData.value = JSON.parse(basicGalleryData)
        console.log('🖼️ Данные галереи загружены (базовый ключ):', galleryImagesData.value.length, 'изображений')
      } else {
        galleryImagesData.value = []
        console.log('🖼️ Данные галереи не найдены')
      }
    } else {
      galleryImagesData.value = JSON.parse(storedGalleryData)
      console.log('🖼️ Данные галереи загружены:', galleryImagesData.value.length, 'изображений')
    }
    
    // Фильтруем некорректные записи
    galleryImagesData.value = galleryImagesData.value.filter(img => {
      if (!img || !img.id) {
        console.log('🖼️ Удалено некорректное изображение:', img)
        return false
      }
      return true
    })
    
    console.log('🖼️ После фильтрации:', galleryImagesData.value.length, 'изображений')
    
    // Если есть изображения, выбираем случайное
    if (galleryImagesData.value.length > 0) {
      randomGalleryImageIndex.value = Math.floor(Math.random() * galleryImagesData.value.length)
      console.log('🎲 Выбран случайный индекс:', randomGalleryImageIndex.value)
    } else {
      randomGalleryImageIndex.value = -1
      console.log('🎲 Нет изображений для выбора')
    }
    
    // Форсируем обновление изображения
    galleryImageKey.value = Date.now()
    console.log('🖼️ Ключ изображения обновлен:', galleryImageKey.value)
    
  } catch (error) {
    console.error('❌ Ошибка загрузки галереи:', error)
    galleryImagesData.value = []
  }
}

const loadSelectedDateData = () => {
  const dateKey = selectedDate.value.toDateString()
  selectedMood.value = moodData.value[dateKey] || null
  selectedSleep.value = sleepData.value[dateKey] || null
  
  // Отладочная информация
  const note = notesData.value[dateKey]
  const mood = moodData.value[dateKey]
  const sleep = sleepData.value[dateKey]
  const event = eventData.value[dateKey]
  
  console.log('📅 Данные для выбранной даты', dateKey, ':', {
    настроение: mood ? 'есть' : 'нет',
    сон: sleep ? 'есть' : 'нет',
    запись: note ? 'есть (' + (note.text?.length || 0) + ' символов)' : 'нет',
    событие: event ? 'есть' : 'нет'
  })
}

const selectMood = (moodId) => {
  if (isFutureDate(selectedDate.value)) {
    showNotification('warning', 'Настройте только для прошедших или текущего дня', '❗ Внимание')
    return
  }
  
  selectedMood.value = selectedMood.value === moodId ? null : moodId
  saveMoodData()
}

const selectSleep = (sleepId) => {
  if (isFutureDate(selectedDate.value)) {
    showNotification('warning', 'Настройте только для прошедших или текущего дня', '❗ Внимание')
    return
  }
  
  selectedSleep.value = selectedSleep.value === sleepId ? null : sleepId
  saveSleepData()
}

const saveMoodData = () => {
  const dateKey = selectedDate.value.toDateString()
  if (selectedMood.value) {
    moodData.value[dateKey] = selectedMood.value
    
    const moodName = moods.find(m => m.id === selectedMood.value)?.name || 'настроение'
    showNotification('success', `${moodName} сохранено`, '😊 Настроение')
  } else {
    delete moodData.value[dateKey]
    showNotification('warn', 'Настроение удалено', '🗑️ Настроение')
  }
  
  const moodKey = getUserKey('daytrack_mood_data')
  localStorage.setItem(moodKey, JSON.stringify(moodData.value))
  console.log('💾 Настроение сохранено для даты', dateKey)
}

const saveSleepData = () => {
  const dateKey = selectedDate.value.toDateString()
  if (selectedSleep.value) {
    sleepData.value[dateKey] = selectedSleep.value
    
    const sleepName = sleepQuality.find(s => s.id === selectedSleep.value)?.name || 'сон'
    showNotification('success', `${sleepName} сохранен`, '😴 Сон')
  } else {
    delete sleepData.value[dateKey]
    showNotification('warn', 'Данные сна удалены', '🗑️ Сон')
  }
  
  const sleepKey = getUserKey('daytrack_sleep_data')
  localStorage.setItem(sleepKey, JSON.stringify(sleepData.value))
  console.log('💾 Сон сохранен для даты', dateKey)
}

const selectDate = (day) => {
  selectedDate.value = day.date
  console.log('📅 Выбрана дата:', day.date.toDateString())
  loadSelectedDateData()
}

// ФИКС: двойной клик всегда открывает окно событий
const handleDayDoubleClick = (day) => {
  console.log('🎯 Двойной клик на дату:', day.date.toDateString())
  openEventModal(day)
}

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

// ФИКС: Улучшенный переход на страницу записей
const goToNotes = () => {
  console.log('📝 Переход к записям для даты:', selectedDate.value.toDateString())
  
  // Сохраняем выбранную дату в формате ISO
  const dateIso = selectedDate.value.toISOString()
  localStorage.setItem('daytrack_selected_date', dateIso)
  
  // Добавляем метку времени для обновления
  localStorage.setItem('daytrack_notes_update', Date.now().toString())
  
  console.log('💾 Сохранена дата в localStorage:', dateIso)
  
  // Проверяем, что роутер работает
  if (router) {
    router.push('/notes')
      .then(() => {
        console.log('✅ Успешный переход на /notes')
      })
      .catch((error) => {
        console.error('❌ Ошибка при переходе на /notes:', error)
        // Пробуем альтернативный способ
        window.location.href = '/notes'
      })
  } else {
    console.error('❌ Роутер не инициализирован')
    window.location.href = '/notes'
  }
}

const goToGallery = () => {
  console.log('🖼️ Переход в галерею')
  
  if (router) {
    router.push('/gallery')
      .then(() => {
        console.log('✅ Успешный переход на /gallery')
      })
      .catch((error) => {
        console.error('❌ Ошибка при переходе на /gallery:', error)
        window.location.href = '/gallery'
      })
  } else {
    console.error('❌ Роутер не инициализирован')
    window.location.href = '/gallery'
  }
}

// Методы для событий календаря
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

// Методы для событий
const openEventModal = (day) => {
  eventModalDate.value = day.date
  const dateKey = day.date.toDateString()
  const event = eventData.value[dateKey]
  eventModalText.value = event?.text || ''
  eventModalVisible.value = true
  
  console.log('📅 Открыто окно событий для даты', dateKey, 'Текст:', eventModalText.value)
  
  nextTick(() => {
    const textarea = document.querySelector('.event-modal-textarea')
    if (textarea) {
      textarea.focus()
      textarea.setSelectionRange(eventModalText.value.length, eventModalText.value.length)
    }
  })
}

const closeEventModal = () => {
  eventModalVisible.value = false
  eventModalDate.value = null
  eventModalText.value = ''
}

const saveEvent = () => {
  if (!eventModalDate.value || !eventModalText.value.trim()) return
  
  const dateKey = eventModalDate.value.toDateString()
  
  eventData.value[dateKey] = {
    text: eventModalText.value.trim(),
    savedAt: new Date().toISOString(),
    isFutureEvent: isFutureDate(eventModalDate.value),
    notified: false
  }
  
  showNotification('success', `Событие сохранено на ${formatEventDate(eventModalDate.value)}`, '✅ Событие')
  
  const eventKey = getUserKey('daytrack_event_data')
  localStorage.setItem(eventKey, JSON.stringify(eventData.value))
  
  console.log('💾 Событие сохранено для даты', dateKey)
  closeEventModal()
}

const deleteEvent = () => {
  if (!eventModalDate.value) return
  
  const dateKey = eventModalDate.value.toDateString()
  delete eventData.value[dateKey]
  
  showNotification('warn', `Событие удалено для ${formatEventDate(eventModalDate.value)}`, '🗑️ Событие')
  
  const eventKey = getUserKey('daytrack_event_data')
  localStorage.setItem(eventKey, JSON.stringify(eventData.value))
  
  console.log('🗑️ Событие удалено для даты', dateKey)
  closeEventModal()
}

const formatEventDate = (date) => {
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

const handleTextareaInput = (event) => {
  event.target.style.height = 'auto'
  event.target.style.height = Math.min(event.target.scrollHeight, 200) + 'px'
}

// Методы для достижений
const calculateStreak = () => {
  const notesDates = Object.keys(notesData.value)
  console.log('📊 Расчет серии. Всего записей:', notesDates.length)
  
  if (notesDates.length === 0) {
    currentStreak.value = 0
    console.log('📊 Серия: 0 (нет записей)')
    return
  }

  const validEntries = notesDates.filter(dateKey => {
    const note = notesData.value[dateKey]
    return note && note.text && note.text.trim() !== ''
  })

  console.log('📊 Валидных записей:', validEntries.length)

  if (validEntries.length === 0) {
    currentStreak.value = 0
    console.log('📊 Серия: 0 (нет валидных записей)')
    return
  }

  // Сортируем по дате (от новых к старым)
  const sortedDates = validEntries.sort((a, b) => new Date(b) - new Date(a))
  console.log('📊 Отсортированные даты:', sortedDates.slice(0, 5))

  let streak = 1
  let prevDate = new Date(sortedDates[0])
  prevDate.setHours(0, 0, 0, 0)

  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i])
    currentDate.setHours(0, 0, 0, 0)

    const diffTime = prevDate - currentDate
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    console.log(`📊 Сравнение: ${prevDate.toDateString()} - ${currentDate.toDateString()} = ${diffDays} дней`)

    if (diffDays === 1) {
      streak++
      prevDate = currentDate
      console.log(`📊 Серия увеличена до ${streak}`)
    } else if (diffDays > 1) {
      console.log(`📊 Разрыв в серии (${diffDays} дней), остановка`)
      break
    } else {
      console.log(`📊 Та же дата, пропускаем`)
      // Та же дата (дубликат), не увеличиваем счетчик
    }
  }

  currentStreak.value = streak
  console.log(`📊 Итоговая серия: ${currentStreak.value} дней`)
}

const calculateMaxStreak = () => {
  const notesDates = Object.keys(notesData.value)
  
  if (notesDates.length === 0) {
    maxStreak.value = 0
    return
  }

  const validEntries = notesDates.filter(dateKey => {
    const note = notesData.value[dateKey]
    return note && note.text && note.text.trim() !== ''
  })

  if (validEntries.length === 0) {
    maxStreak.value = 0
    return
  }

  // Сортируем по дате (от старых к новым)
  const sortedDates = validEntries.sort((a, b) => new Date(a) - new Date(b))

  let maxStreakCount = 1
  let currentStreakCount = 1
  let prevDate = new Date(sortedDates[0])
  prevDate.setHours(0, 0, 0, 0)

  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i])
    currentDate.setHours(0, 0, 0, 0)

    const diffTime = currentDate - prevDate
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      currentStreakCount++
      maxStreakCount = Math.max(maxStreakCount, currentStreakCount)
    } else if (diffDays > 1) {
      currentStreakCount = 1
    }

    prevDate = currentDate
  }

  maxStreak.value = maxStreakCount
  console.log(`📊 Максимальная серия: ${maxStreak.value} дней`)
}

const updateAchievementsProgress = () => {
  const validEntries = Object.keys(notesData.value).filter(dateKey => {
    const note = notesData.value[dateKey]
    return note && note.text && note.text.trim() !== ''
  })
  
  const totalValidEntries = validEntries.length
  
  console.log('🏆 Обновление прогресса достижений. Записей:', totalValidEntries, 'Серия:', currentStreak.value)
  
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
    
    console.log(`🏆 ${achievement.name}: ${achievement.progress.current}/${achievement.progress.total} (разблокировано: ${achievement.unlocked})`)
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
  
  console.log('🏆 Проверка достижений. Записей:', totalValidEntries, 'Серия:', currentStreak.value)
  
  achievements.value.forEach(achievement => {
    if (unlockedAchievements.includes(achievement.id)) {
      achievement.unlocked = true
      return
    }
    
    let shouldUnlock = false
    
    if (achievement.type === 'notes_entry') {
      shouldUnlock = totalValidEntries >= achievement.condition
      console.log(`🏆 ${achievement.name}: ${totalValidEntries} >= ${achievement.condition} = ${shouldUnlock}`)
    } else if (achievement.type === 'notes_streak') {
      shouldUnlock = currentStreak.value >= achievement.condition
      console.log(`🏆 ${achievement.name}: ${currentStreak.value} >= ${achievement.condition} = ${shouldUnlock}`)
    }
    
    if (shouldUnlock && !achievement.unlocked) {
      achievement.unlocked = true
      unlockedAchievements.push(achievement.id)
      newAchievements.push(achievement)
      console.log(`🏆 Разблокировано достижение: ${achievement.name}`)
    }
  })
  
  if (newAchievements.length > 0) {
    console.log(`🏆 Новых достижений: ${newAchievements.length}`)
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
    speed: 1000,
    data: { 
      icon: '🏆',
      achievementId: achievement.id 
    }
  })
}

// Проверка событий на сегодня
const checkEventNotifications = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayKey = today.toDateString()
  
  const todayEvent = eventData.value[todayKey]
  if (todayEvent && todayEvent.text && !todayEvent.notified) {
    showNotification('info', todayEvent.text, '📅 Событие на сегодня')
    
    eventData.value[todayKey].notified = true
    
    const eventKey = getUserKey('daytrack_event_data')
    localStorage.setItem(eventKey, JSON.stringify(eventData.value))
  }
  
  Object.keys(eventData.value).forEach(dateKey => {
    const event = eventData.value[dateKey]
    const eventDate = new Date(dateKey)
    
    if (event && event.isFutureEvent && !isFutureDate(eventDate)) {
      showNotification('info', event.text, '📅 Событие наступило!')
      eventData.value[dateKey].isFutureEvent = false
      eventData.value[dateKey].notified = true
      
      const eventKey = getUserKey('daytrack_event_data')
      localStorage.setItem(eventKey, JSON.stringify(eventData.value))
    }
  })
}

const showNotification = (type, text, title) => {
  notify({
    title: title,
    text: text,
    type: type,
    duration: 5000,
    speed: 1000
  })
}

const handleImageError = (event) => {
  console.log('❌ Ошибка загрузки изображения галереи:', event.target.src)
  event.target.src = GalleryDefault
  galleryImageKey.value = Date.now()
}

// Обработка обновлений записей
const checkForNotesUpdates = () => {
  const lastUpdate = localStorage.getItem('daytrack_notes_update')
  if (lastUpdate && lastUpdate !== achievementsData.value.lastNotesUpdate) {
    console.log('🔄 Обновление данных записей')
    
    const notesKey = getUserKey('daytrack_notes_data')
    let storedNotesData = localStorage.getItem(notesKey)
    
    if (!storedNotesData) {
      storedNotesData = localStorage.getItem('daytrack_notes_data')
    }
    
    if (storedNotesData) {
      try {
        notesData.value = JSON.parse(storedNotesData)
        console.log('✅ Данные записей обновлены:', Object.keys(notesData.value).length, 'записей')
        
        calculateStreak()
        calculateMaxStreak()
        updateAchievementsProgress()
        checkAchievements()
        
        achievementsData.value.lastNotesUpdate = lastUpdate
        
        const achievementsKey = getUserKey('daytrack_achievements_data')
        localStorage.setItem(achievementsKey, JSON.stringify(achievementsData.value))
      } catch (error) {
        console.error('❌ Ошибка обновления данных записей:', error)
      }
    }
  }
}

// Функция для обновления изображения галереи
const refreshGalleryImage = () => {
  console.log('🔄 Обновление изображения галереи')
  
  if (galleryImagesData.value.length > 0) {
    randomGalleryImageIndex.value = Math.floor(Math.random() * galleryImagesData.value.length)
    galleryImageKey.value = Date.now()
    console.log(`🎲 Новый индекс: ${randomGalleryImageIndex.value}, ключ: ${galleryImageKey.value}`)
  } else {
    console.log('🎲 Нет изображений для обновления')
  }
}

// Хуки жизненного цикла
onMounted(() => {
  console.log('🚀 Компонент Home загружен')
  
  // Проверяем авторизацию
  const isLoggedIn = localStorage.getItem('daytrack_logged_in') === 'true'
  if (!isLoggedIn) {
    console.log('🔒 Пользователь не авторизован, перенаправление на логин')
    router.push('/')
    return
  }
  
  loadStoredData()
  loadSelectedDateData()
  
  // Слушаем изменения в localStorage
  window.addEventListener('storage', (event) => {
    console.log('📡 Событие изменения localStorage:', event.key)
    
    if (event.key && (
      event.key.includes('daytrack_gallery_data') ||
      event.key === getUserKey('daytrack_gallery_data')
    )) {
      console.log('🖼️ Обнаружены изменения в галерее')
      loadGalleryData()
      refreshGalleryImage()
    }
    
    if (event.key && (
      event.key.includes('daytrack_notes_data') ||
      event.key === getUserKey('daytrack_notes_data') ||
      event.key === 'daytrack_notes_update'
    )) {
      console.log('📝 Обнаружены изменения в записях')
      checkForNotesUpdates()
      loadSelectedDateData()
    }
  })
  
  // Запускаем периодическую проверку обновлений
  eventCheckInterval.value = setInterval(() => {
    checkForNotesUpdates()
    checkEventNotifications()
  }, 5000)
  
  // Обновляем изображение галереи при монтировании
  nextTick(() => {
    refreshGalleryImage()
  })
})

onUnmounted(() => {
  if (eventCheckInterval.value) {
    clearInterval(eventCheckInterval.value)
  }
})

// Наблюдатели
watch(selectedDate, () => {
  loadSelectedDateData()
})

watch(galleryImagesData, (newVal) => {
  console.log('👀 Изменены данные галереи:', newVal.length, 'изображений')
  if (newVal.length > 0) {
    refreshGalleryImage()
  }
})

watch(() => notesData.value, (newVal) => {
  console.log('👀 Изменены данные записей:', Object.keys(newVal).length, 'записей')
}, { deep: true })
</script>

<style scoped>
@import '@/components/Home.css';
</style>