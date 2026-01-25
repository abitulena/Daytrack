<template>
  <div class="home-container">
    <div class="background-image"></div>
    
    <Header />
    
    <notifications position="top right" width="400" :max="3" :duration="8000" />
    
    <div class="main-content">
      <div class="left-column">
        <div class="mood-section">
          <div class="section-background"></div>
          <img src="@/assets/mood.png" alt="Mood" class="mood-image" />
          <div class="section-content">
            <div class="section-title">настроение</div>
            <div class="emojis-container">
              <div 
                v-for="mood in moodsData" 
                :key="mood.id"
                class="emoji-item"
                :class="{ 'selected': selectedMood === mood.id }"
                @click="selectMood(mood.id)"
                :title="mood.name"
              >
                <img :src="getEmotionImage(mood)" :alt="mood.name" class="emoji-img" />
              </div>
            </div>
          </div>
        </div>
        
        <div class="sleep-section">
          <div class="section-background"></div>
          <img src="@/assets/dream.png" alt="Dream" class="dream-image" />
          <div class="section-content">
            <div class="section-title">сон</div>
            <div class="emojis-container">
              <div 
                v-for="sleep in sleepQualityData" 
                :key="sleep.id"
                class="emoji-item"
                :class="{ 'selected': selectedSleep === sleep.id }"
                @click="selectSleep(sleep.id)"
                :title="sleep.name"
              >
                <img :src="getSleepQualityImage(sleep)" :alt="sleep.name" class="emoji-img" />
              </div>
            </div>
          </div>
        </div>
          
        <div class="calendar-section">
          <div class="section-background"></div>
          <div class="section-content">
            <div class="calendar-header">
              <button class="calendar-nav" @click="prevMonth">&lt;</button>
              <div class="calendar-title">{{ currentMonth.toLowerCase() }} {{ currentYear }}</div>
              <button class="calendar-nav" @click="nextMonth">&gt;</button>
            </div>
            
            <div class="week-days">
              <div class="week-day" v-for="day in weekDays" :key="day">
                {{ day }}
              </div>
            </div>
            
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
                <div class="day-indicators">
                  <div v-if="hasMoodData(day.date)" class="mood-indicator"></div>
                  <div v-if="hasSleepData(day.date)" class="sleep-indicator"></div>
                  <div v-if="hasNotesData(day.date)" class="notes-indicator"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="center-column">
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
      
      <div class="right-column">
        <div class="gallery-section" @click="goToGallery">
          <div class="section-background"></div>
          <div class="section-content">
            <div class="section-title">галерея</div>
            <div class="gallery-image-container">
              <div class="gallery-image-wrapper">
                <img 
                  :src="currentGalleryImage" 
                  alt="Gallery" 
                  class="gallery-image" 
                  @error="handleImageError"
                />
                <div class="gallery-image-info" v-if="galleryImageInfo">
                  <span class="image-counter">
                    {{ currentImageIndex + 1 }}/{{ galleryImagesData.length }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="achievements-section">
          <div class="section-background"></div>
          <div class="section-content">
            <div class="section-title">достижения</div>
            <div class="achievements-content">
              <div class="stats-info">
                <div class="streak-count">Получено: {{ totalUnlocked }}/{{ totalAvailable }}</div>
                <div v-if="currentStreak > 0" class="streak-count">Текущая серия: {{ currentStreak }} дней</div>
              </div>
              <div class="achievements-grid">
                <div 
                  v-for="achievement in achievementsData" 
                  :key="achievement.id"
                  class="achievement-item"
                  :class="{ 'unlocked': achievement.unlocked }"
                  @mouseover="currentAchievementId = achievement.id"
                  @mouseleave="currentAchievementId = null"
                >
                  <div v-if="achievement.unlocked && achievement.image_file" class="achievement-image">
                    <img 
                      :src="getAchievementImage(achievement)" 
                      :alt="achievement.name" 
                      class="achievement-img"
                    />
                  </div>
                  <div v-else class="achievement-locked">
                    🔒
                  </div>
                  <div class="achievement-name">{{ achievement.name }}</div>
                  <div 
                    class="achievement-tooltip"
                    :class="{ 'visible': currentAchievementId === achievement.id }"
                  >
                    <div class="tooltip-title">{{ achievement.name }}</div>
                    <div class="tooltip-description">{{ achievement.condition_type }}</div>
                    <div v-if="achievement.unlocked_at" class="tooltip-date">
                      Получено: {{ formatDate(achievement.unlocked_at) }}
                    </div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import { notify } from "@kyvg/vue3-notification"

// Импорты изображений по умолчанию для эмоций и сна
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

const router = useRouter()

// Реактивные данные
const currentDate = ref(new Date())
const selectedDate = ref(new Date())
const selectedMood = ref(null)
const selectedSleep = ref(null)
const currentStreak = ref(0)
const currentAchievementId = ref(null)

// Данные с сервера
const moodsData = ref([])
const sleepQualityData = ref([])
const achievementsData = ref([])
const diaryEntries = ref([])
const galleryImagesData = ref([])
const currentImageIndex = ref(0)

// Константы
const weekDays = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

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
  const dateStr = selectedDate.value.toISOString().split('T')[0]
  const entry = diaryEntries.value.find(e => {
    const entryDate = new Date(e.entry_date || e.created_at).toISOString().split('T')[0]
    return entryDate === dateStr
  })
  return entry ? entry.content : ''
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
  
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine)
  }
  
  while (lines.length < maxLines && lines.length < 11) {
    lines.push('')
  }
  
  return lines.slice(0, maxLines)
})

// Получение текущего изображения галереи
const currentGalleryImage = computed(() => {
  if (!galleryImagesData.value || galleryImagesData.value.length === 0) {
    return GalleryDefault
  }
  
  const currentImage = galleryImagesData.value[currentImageIndex.value]
  return currentImage ? currentImage.url : GalleryDefault
})

// Информация о текущем изображении
const galleryImageInfo = computed(() => {
  if (!galleryImagesData.value || galleryImagesData.value.length === 0) {
    return null
  }
  
  return galleryImagesData.value[currentImageIndex.value] || null
})

// Статистика достижений
const totalUnlocked = computed(() => {
  return achievementsData.value.filter(a => a.unlocked).length
})

const totalAvailable = computed(() => {
  return achievementsData.value.length
})

// Загрузка данных с сервера
const loadAllData = async () => {
  try {
    const token = localStorage.getItem('access_token')
    
    if (!token) {
      throw new Error('Требуется авторизация')
    }
    
    // Загружаем эмоции
    await loadEmotions(token)
    
    // Загружаем качества сна
    await loadSleepQualities(token)
    
    // Загружаем достижения
    await loadAchievements(token)
    
    // Загружаем записи дневника
    await loadDiaryEntries(token)
    
    // Загружаем фото (галерея)
    await loadPhotos(token)
    
    // Загружаем напоминания
    await loadReminders(token)
    
    // Обновляем данные для выбранной даты
    loadSelectedDateData()
    
    // Рассчитываем статистику
    calculateStreak()
    
  } catch (error) {
    console.error('❌ Ошибка загрузки данных:', error)
  }
}

// Загрузка эмоций с сервера
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
        moodsData.value = data.emotions
      }
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки эмоций:', error)
  }
}

// Загрузка качеств сна с сервера
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
        sleepQualityData.value = data.sleep_qualities
      }
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки качеств сна:', error)
  }
}

// Загрузка достижений с сервера
const loadAchievements = async (token) => {
  try {
    // Согласно API: GET /api/achievements - получить все достижения пользователя
    const response = await fetch('http://localhost:5000/api/achievements', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.achievements) {
        achievementsData.value = data.achievements
      }
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки достижений:', error)
  }
}

// Загрузка записей дневника с сервера
const loadDiaryEntries = async (token) => {
  try {
    // Согласно API: GET /api/diary/entries - получить все записи пользователя
    const response = await fetch('http://localhost:5000/api/diary/entries', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.entries) {
        diaryEntries.value = data.entries
      }
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки записей:', error)
  }
}

// Загрузка фото для галереи
const loadPhotos = async (token) => {
  try {
    // Сначала получаем все записи, у которых есть фото
    // Нужно будет адаптировать под конкретный API для получения фото
    // Временно используем localStorage для хранения превью
    
    // Проверяем, есть ли фото в localStorage
    const savedPhotos = localStorage.getItem('gallery_photos')
    if (savedPhotos) {
      try {
        galleryImagesData.value = JSON.parse(savedPhotos)
      } catch {
        galleryImagesData.value = []
      }
    }
    
  } catch (error) {
    console.error('❌ Ошибка загрузки фото:', error)
  }
}

// Загрузка напоминаний
const loadReminders = async (token) => {
  try {
    // Согласно API: GET /api/notifications/reminders - получить напоминания пользователя
    const response = await fetch('http://localhost:5000/api/notifications/reminders', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.reminders && data.reminders.length > 0) {
        // Показываем напоминания
        setTimeout(() => {
          showReminderNotification()
        }, 1000)
      }
    }
  } catch (error) {
    console.warn('⚠️ Ошибка загрузки напоминаний:', error)
  }
}

// Получение изображения для эмоции
const getEmotionImage = (emotion) => {
  // Если в данных с сервера есть image_file, используем его
  if (emotion.image_file) {
    return `http://localhost:5000/uploads/${emotion.image_file}`
  }
  
  // Иначе используем локальные изображения по имени
  switch(emotion.name.toLowerCase()) {
    case 'грустный': return Грустный
    case 'нейтральный': return Нейтральный
    case 'спокойный': return Спокойный
    case 'радостный': return Радостный
    case 'счастлив': return Счастлив
    default: return Нейтральный
  }
}

// Получение изображения для качества сна
const getSleepQualityImage = (sleep) => {
  // Если в данных с сервера есть image_file, используем его
  if (sleep.image_file) {
    return `http://localhost:5000/uploads/${sleep.image_file}`
  }
  
  // Иначе используем локальные изображения по имени
  switch(sleep.name.toLowerCase()) {
    case 'отлично поспал': return ОтличноПоспал
    case 'хорошо поспал': return ХорошоПоспал
    case 'нормальный сон': return Нормально
    case 'плохо спал': return ПлохоСпал
    case 'бессонница': return Бессоница
    default: return Нормально
  }
}

// Получение изображения для достижения
const getAchievementImage = (achievement) => {
  if (achievement.image_file) {
    return `http://localhost:5000/uploads/${achievement.image_file}`
  }
  return ''
}

// Форматирование даты
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU')
}

// Основные методы
const loadSelectedDateData = () => {
  const dateStr = selectedDate.value.toISOString().split('T')[0]
  
  // Находим запись для выбранной даты
  const entry = diaryEntries.value.find(e => {
    const entryDate = new Date(e.entry_date || e.created_at).toISOString().split('T')[0]
    return entryDate === dateStr
  })
  
  if (entry) {
    selectedMood.value = entry.emotion_id || null
    selectedSleep.value = entry.sleep_quality_id || null
  } else {
    selectedMood.value = null
    selectedSleep.value = null
  }
}

const selectMood = async (moodId) => {
  if (isFutureDate(selectedDate.value)) {
    return
  }
  
  try {
    const token = localStorage.getItem('access_token')
    const dateStr = selectedDate.value.toISOString().split('T')[0]
    
    // Проверяем, есть ли уже запись на эту дату
    const existingEntry = diaryEntries.value.find(e => {
      const entryDate = new Date(e.entry_date || e.created_at).toISOString().split('T')[0]
      return entryDate === dateStr
    })
    
    if (existingEntry) {
      // Обновляем существующую запись
      selectedMood.value = moodId
      
      // Согласно API: PUT /api/diary/entries/:id - обновить запись
      const response = await fetch(`http://localhost:5000/api/diary/entries/${existingEntry.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          emotion_id: moodId,
          sleep_quality_id: existingEntry.sleep_quality_id || null,
          content: existingEntry.content || ''
        })
      })
      
      if (response.ok) {
        // Обновляем данные локально
        const data = await response.json()
        if (data.success) {
          await loadDiaryEntries(token)
        }
      }
    } else {
      // Создаем новую запись с настроением
      selectedMood.value = moodId
      
      // Согласно API: POST /api/diary/entries - создать запись
      const response = await fetch('http://localhost:5000/api/diary/entries', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          entry_date: dateStr,
          emotion_id: moodId,
          sleep_quality_id: null,
          content: ''
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          await loadDiaryEntries(token)
          
          // Проверяем достижения
          await checkAchievements()
        }
      }
    }
  } catch (error) {
    console.error('❌ Ошибка сохранения настроения:', error)
  }
}

const selectSleep = async (sleepId) => {
  if (isFutureDate(selectedDate.value)) {
    return
  }
  
  try {
    const token = localStorage.getItem('access_token')
    const dateStr = selectedDate.value.toISOString().split('T')[0]
    
    // Проверяем, есть ли уже запись на эту дату
    const existingEntry = diaryEntries.value.find(e => {
      const entryDate = new Date(e.entry_date || e.created_at).toISOString().split('T')[0]
      return entryDate === dateStr
    })
    
    if (existingEntry) {
      // Обновляем существующую запись
      selectedSleep.value = sleepId
      
      // Согласно API: PUT /api/diary/entries/:id - обновить запись
      const response = await fetch(`http://localhost:5000/api/diary/entries/${existingEntry.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          emotion_id: existingEntry.emotion_id || null,
          sleep_quality_id: sleepId,
          content: existingEntry.content || ''
        })
      })
      
      if (response.ok) {
        // Обновляем данные локально
        const data = await response.json()
        if (data.success) {
          await loadDiaryEntries(token)
        }
      }
    } else {
      // Создаем новую запись с качеством сна
      selectedSleep.value = sleepId
      
      // Согласно API: POST /api/diary/entries - создать запись
      const response = await fetch('http://localhost:5000/api/diary/entries', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          entry_date: dateStr,
          emotion_id: null,
          sleep_quality_id: sleepId,
          content: ''
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          await loadDiaryEntries(token)
          
          // Проверяем достижения
          await checkAchievements()
        }
      }
    }
  } catch (error) {
    console.error('❌ Ошибка сохранения качества сна:', error)
  }
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
  // Сохраняем выбранную дату для страницы notes
  const dateIso = selectedDate.value.toISOString()
  localStorage.setItem('selected_entry_date', dateIso)
  
  router.push('/notes')
}

const goToGallery = () => {
  router.push('/gallery')
}

const hasMoodData = (date) => {
  const dateStr = date.toISOString().split('T')[0]
  return diaryEntries.value.some(e => {
    const entryDate = new Date(e.entry_date || e.created_at).toISOString().split('T')[0]
    return entryDate === dateStr && e.emotion_id
  })
}

const hasSleepData = (date) => {
  const dateStr = date.toISOString().split('T')[0]
  return diaryEntries.value.some(e => {
    const entryDate = new Date(e.entry_date || e.created_at).toISOString().split('T')[0]
    return entryDate === dateStr && e.sleep_quality_id
  })
}

const hasNotesData = (date) => {
  const dateStr = date.toISOString().split('T')[0]
  return diaryEntries.value.some(e => {
    const entryDate = new Date(e.entry_date || e.created_at).toISOString().split('T')[0]
    return entryDate === dateStr && e.content && e.content.trim() !== ''
  })
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

const calculateStreak = () => {
  // Рассчитываем серию записей
  const entriesWithContent = diaryEntries.value.filter(e => 
    e.content && e.content.trim() !== ''
  ).map(e => {
    const date = new Date(e.entry_date || e.created_at)
    date.setHours(0, 0, 0, 0)
    return date.getTime()
  }).sort((a, b) => a - b)
  
  if (entriesWithContent.length === 0) {
    currentStreak.value = 0
    return
  }
  
  // Находим самую последнюю дату с записью
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Проверяем, есть ли запись на сегодня
  const hasToday = entriesWithContent.includes(today.getTime())
  
  let streak = hasToday ? 1 : 0
  let currentDate = hasToday ? today : new Date(entriesWithContent[entriesWithContent.length - 1])
  
  if (!hasToday) {
    // Начинаем с последней записи
    for (let i = entriesWithContent.length - 2; i >= 0; i--) {
      const prevDate = new Date(entriesWithContent[i])
      prevDate.setHours(0, 0, 0, 0)
      
      const diffTime = currentDate - prevDate
      const diffDays = diffTime / (1000 * 60 * 60 * 24)
      
      if (diffDays === 1) {
        streak++
        currentDate = prevDate
      } else {
        break
      }
    }
  } else {
    // Продолжаем искать предыдущие записи
    currentDate = new Date(today)
    for (let i = entriesWithContent.length - 2; i >= 0; i--) {
      const prevDate = new Date(entriesWithContent[i])
      prevDate.setHours(0, 0, 0, 0)
      
      currentDate.setDate(currentDate.getDate() - 1)
      
      if (prevDate.getTime() === currentDate.getTime()) {
        streak++
      } else {
        break
      }
    }
  }
  
  currentStreak.value = streak
}

const checkAchievements = async () => {
  // Достижения загружаются с сервера, поэтому просто обновляем список
  const token = localStorage.getItem('access_token')
  if (token) {
    await loadAchievements(token)
  }
}

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
  // При ошибке загрузки показываем дефолтное изображение
  event.target.src = GalleryDefault
}

// Хуки жизненного цикла
onMounted(() => {
  const isLoggedIn = localStorage.getItem('is_logged_in') === 'true'
  if (!isLoggedIn) {
    router.push('/')
    return
  }
  
  loadAllData()
})

</script>

<style scoped>
@import '@/styles/Home.css';

/* Стили для достижений */
.achievement-locked {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #ccc;
}

.achievement-image {
  width: 40px;
  height: 40px;
}

.achievement-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.achievement-name {
  font-size: 10px;
  text-align: center;
  margin-top: 4px;
  line-height: 1.2;
}

.achievement-item.unlocked .achievement-name {
  color: #333;
}

.achievement-item:not(.unlocked) .achievement-name {
  color: #999;
}

.stats-info {
  padding: 8px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  margin-bottom: 10px;
}

.streak-count {
  font-size: 12px;
  color: #333;
  margin-bottom: 4px;
}

.streak-count:last-child {
  margin-bottom: 0;
}
</style>