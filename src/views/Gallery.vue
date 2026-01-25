<template>
  <div class="gallery-container">
    <div class="background-image"></div>
    
    <Header />
    
    <button class="home-button" @click="goToHome">
      ← На главную
    </button>
    
    <div class="gallery-content">
      <div class="gallery-scroll-container">
        <div class="gallery-grid">
          <!-- Показываем статус загрузки -->
          <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner-large"></div>
            <div class="loading-text">Загрузка галереи...</div>
          </div>
          
          <!-- Если галерея пуста -->
          <div v-else-if="galleryCells.length === 0" class="empty-gallery">
            <div class="empty-icon">📷</div>
            <div class="empty-text">Галерея пуста</div>
            <div class="empty-subtext">Загрузите фото к вашим записям</div>
          </div>
          
          <!-- Отображение галереи -->
          <div 
            v-for="(cell, index) in galleryCells" 
            :key="cell.id"
            class="gallery-cell"
            :class="{ 'has-image': cell.imageUrl, 'loading': cell.loading }"
            @click="cell.imageUrl ? openFullscreen(index) : null"
          >
            <div v-if="cell.loading" class="loading-spinner">
              <div class="spinner"></div>
              <div class="loading-text">Загрузка...</div>
            </div>
            
            <div v-else-if="cell.imageUrl" class="gallery-image-container">
              <img 
                :src="cell.imageUrl" 
                :alt="`Gallery image ${index + 1}`"
                class="gallery-image"
                @load="onImageLoad(index)"
                @error="handleImageError(index)"
              />
            </div>
            
            <div v-else class="empty-cell">
              <div class="plus-circle">
                <div class="plus-vertical"></div>
                <div class="plus-horizontal"></div>
              </div>
              <div class="empty-cell-text">
                Записи с фото появятся здесь
              </div>
            </div>
            
            <!-- Информация о записи -->
            <div v-if="cell.entryInfo && cell.imageUrl" class="entry-info">
              <div class="entry-date">
                {{ formatDate(cell.entryInfo.entry_date) }}
              </div>
              <div v-if="cell.entryInfo.preview" class="entry-preview">
                {{ cell.entryInfo.preview }}
              </div>
            </div>
            
            <button 
              v-if="cell.imageUrl && !cell.loading" 
              class="delete-button"
              @click.stop="deleteImage(cell.id)"
              :disabled="isDeleting"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Полноэкранный просмотр -->
    <div 
      v-if="fullscreenVisible" 
      class="fullscreen-overlay" 
      @click="closeFullscreen"
    >
      <div class="fullscreen-content" @click.stop>
        <div class="fullscreen-header">
          <div class="fullscreen-title">Просмотр фото</div>
          <button class="fullscreen-close" @click="closeFullscreen">
            ×
          </button>
        </div>
        
        <div class="fullscreen-image-container">
          <img 
            :src="fullscreenImageUrl" 
            alt="Fullscreen" 
            class="fullscreen-image"
          />
        </div>
        
        <div v-if="currentFullscreenEntry" class="fullscreen-info">
          <div class="fullscreen-date">
            Дата записи: {{ formatDate(currentFullscreenEntry.entry_date) }}
          </div>
          <div v-if="currentFullscreenEntry.preview" class="fullscreen-preview">
            {{ currentFullscreenEntry.preview }}
          </div>
        </div>
        
        <div class="fullscreen-actions">
          <button 
            class="fullscreen-delete" 
            @click="deleteFullscreenImage"
            :disabled="isDeleting"
          >
            удалить фото
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно загрузки фото (не используется в этой версии) -->
    <!-- <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleFileSelect"
    /> -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'

const router = useRouter()

const galleryCells = ref([])
const isLoading = ref(true)
const isDeleting = ref(false)
const fullscreenVisible = ref(false)
const fullscreenImageUrl = ref('')
const currentFullscreenEntry = ref(null)
const currentPhotoId = ref(null)

// Загрузка данных с сервера
const loadGalleryData = async () => {
  isLoading.value = true
  galleryCells.value = []
  
  try {
    const token = localStorage.getItem('access_token')
    
    if (!token) {
      throw new Error('Требуется авторизация')
    }
    
    // Шаг 1: Получаем все записи с фото
    await loadPhotosWithEntries(token)
    
  } catch (error) {
    console.error('❌ Ошибка загрузки галереи:', error)
  } finally {
    isLoading.value = false
  }
}

// Загрузка фото с информацией о записях
const loadPhotosWithEntries = async (token) => {
  try {
    // Сначала получаем все записи пользователя
    // Согласно API: GET /api/diary/entries - получить все записи пользователя
    const entriesResponse = await fetch('http://localhost:5000/api/diary/entries', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!entriesResponse.ok) {
      throw new Error(`Ошибка загрузки записей: ${entriesResponse.status}`)
    }
    
    const entriesData = await entriesResponse.json()
    
    if (!entriesData.success || !entriesData.entries) {
      return
    }
    
    const entriesWithPhotos = []
    
    // Для каждой записи проверяем наличие фото
    for (const entry of entriesData.entries) {
      if (!entry.id) continue
      
      try {
        // Согласно API: GET /api/photos/entries/:entryId/photos - получить фото записи
        const photosResponse = await fetch(`http://localhost:5000/api/photos/entries/${entry.id}/photos`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (photosResponse.ok) {
          const photosData = await photosResponse.json()
          
          if (photosData.success && photosData.photos && photosData.photos.length > 0) {
            // Добавляем каждое фото в галерею
            for (const photo of photosData.photos) {
              entriesWithPhotos.push({
                id: photo.id,
                entryId: entry.id,
                photoData: photo,
                entryInfo: {
                  id: entry.id,
                  entry_date: entry.entry_date || entry.created_at,
                  preview: entry.content ? getPreviewText(entry.content) : '',
                  emotion: entry.emotion_id,
                  sleep: entry.sleep_quality_id
                }
              })
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️ Ошибка загрузки фото для записи ${entry.id}:`, error)
      }
    }
    
    // Сортируем по дате (новые сначала)
    entriesWithPhotos.sort((a, b) => {
      const dateA = new Date(a.entryInfo.entry_date)
      const dateB = new Date(b.entryInfo.entry_date)
      return dateB - dateA
    })
    
    // Создаем ячейки галереи
    galleryCells.value = entriesWithPhotos.map((item, index) => {
      let imageUrl = ''
      
      // Пытаемся получить URL фото
      if (item.photoData.filename) {
        // Согласно API: GET /uploads/:filename - получить загруженные файлы (фото)
        imageUrl = `http://localhost:5000/uploads/${item.photoData.filename}`
      } else if (item.photoData.image_url) {
        imageUrl = item.photoData.image_url
      } else if (item.photoData.base64_data) {
        imageUrl = item.photoData.base64_data
      }
      
      return {
        id: item.id,
        photoId: item.id,
        entryId: item.entryId,
        imageUrl: imageUrl,
        loading: false,
        entryInfo: item.entryInfo
      }
    })
    
    console.log(`✅ Загружено ${galleryCells.value.length} фото в галерею`)
    
  } catch (error) {
    console.error('❌ Ошибка загрузки фото с записями:', error)
    throw error
  }
}

// Форматирование даты
const formatDate = (dateString) => {
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

// Навигация на главную
const goToHome = () => {
  router.push('/home')
}

// Обработка загрузки изображения
const onImageLoad = (index) => {
  console.log('Изображение загружено для ячейки', index)
}

// Обработка ошибки загрузки изображения
const handleImageError = (index) => {
  console.error('Ошибка загрузки изображения для ячейки', index)
  
  if (index < galleryCells.value.length) {
    galleryCells.value[index].imageUrl = ''
    galleryCells.value[index].loading = false
  }
}

// Удаление изображения
const deleteImage = async (photoId) => {
  if (!photoId) {
    alert('Не удалось определить фото для удаления')
    return
  }
  
  if (!confirm('Вы уверены, что хотите удалить это фото?')) {
    return
  }
  
  isDeleting.value = true
  
  try {
    const token = localStorage.getItem('access_token')
    
    if (!token) {
      throw new Error('Требуется авторизация')
    }
    
    // Согласно API: DELETE /api/photos/:photoId - удалить фото
    const response = await fetch(`http://localhost:5000/api/photos/${photoId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Ошибка удаления фото: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.success) {
      // Удаляем из массива
      const index = galleryCells.value.findIndex(cell => cell.id === photoId)
      if (index !== -1) {
        galleryCells.value.splice(index, 1)
      }
      
      // Закрываем полноэкранный просмотр если открыт
      if (fullscreenVisible.value && currentPhotoId.value === photoId) {
        closeFullscreen()
      }
      
      console.log('✅ Фото успешно удалено')
    } else {
      throw new Error(data.message || 'Не удалось удалить фото')
    }
    
  } catch (error) {
    console.error('❌ Ошибка удаления фото:', error)
    alert(error.message || 'Не удалось удалить фото')
  } finally {
    isDeleting.value = false
  }
}

// Открытие полноразмерного просмотра
const openFullscreen = (index) => {
  const cell = galleryCells.value[index]
  if (cell && cell.imageUrl) {
    fullscreenImageUrl.value = cell.imageUrl
    currentFullscreenEntry.value = cell.entryInfo
    currentPhotoId.value = cell.id
    fullscreenVisible.value = true
  }
}

// Закрытие полноразмерного просмотра
const closeFullscreen = () => {
  fullscreenVisible.value = false
  fullscreenImageUrl.value = ''
  currentFullscreenEntry.value = null
  currentPhotoId.value = null
}

// Удаление изображения из полноразмерного просмотра
const deleteFullscreenImage = async () => {
  if (currentPhotoId.value) {
    await deleteImage(currentPhotoId.value)
  }
}

// Инициализация
onMounted(() => {
  // Проверяем авторизацию
  const isLoggedIn = localStorage.getItem('is_logged_in') === 'true'
  if (!isLoggedIn) {
    router.push('/')
    return
  }
  
  loadGalleryData()
})
</script>

<style scoped>
@import '@/styles/Gallery.css';

/* Дополнительные стили */
.loading-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.loading-spinner-large {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #9770A9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-gallery {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-text {
  font-size: 24px;
  color: #666;
  margin-bottom: 10px;
  font-weight: 500;
}

.empty-subtext {
  font-size: 16px;
  color: #888;
  max-width: 300px;
}

.empty-cell-text {
  font-size: 12px;
  color: #888;
  text-align: center;
  margin-top: 8px;
  padding: 0 5px;
  line-height: 1.2;
}

.entry-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  color: white;
  padding: 10px;
  font-size: 11px;
  opacity: 0;
  transition: opacity 0.3s;
}

.gallery-cell:hover .entry-info {
  opacity: 1;
}

.entry-date {
  font-weight: 600;
  margin-bottom: 4px;
}

.entry-preview {
  opacity: 0.9;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fullscreen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.fullscreen-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.fullscreen-close {
  background: none;
  border: none;
  font-size: 32px;
  color: #666;
  cursor: pointer;
  padding: 5px;
  line-height: 1;
}

.fullscreen-close:hover {
  color: #333;
}

.fullscreen-info {
  margin-top: 20px;
  padding: 15px;
  background-color: rgba(0,0,0,0.05);
  border-radius: 8px;
}

.fullscreen-date {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.fullscreen-preview {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.fullscreen-actions {
  margin-top: 20px;
  text-align: center;
}

.fullscreen-delete {
  padding: 10px 20px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.fullscreen-delete:hover:not(:disabled) {
  background-color: #c0392b;
}

.fullscreen-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>