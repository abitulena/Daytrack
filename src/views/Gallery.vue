<template>
  <div class="gallery-container">
    <div class="background-image"></div>
    
    <Header />
    
    <!-- Компонент уведомлений -->
    <notifications position="top right" width="400" :max="3" :duration="4000" />
    
    <button class="home-button" @click="goToHome">
      ← На главную
    </button>
    
    <div class="gallery-content">
      <div class="gallery-scroll-container">
        <div class="gallery-grid">
          <div 
            v-for="(cell, index) in galleryCells" 
            :key="cell.id"
            class="gallery-cell"
            :class="{ 'has-image': cell.image, 'loading': cell.loading }"
            @click="cell.image ? openFullscreen(cell.image) : openFilePicker(index)"
          >
            <div v-if="cell.loading" class="loading-spinner">
              <div class="spinner"></div>
              <div class="loading-text">Загрузка...</div>
            </div>
            
            <div v-else-if="cell.image && cell.image.url" class="gallery-image-container">
              <img 
                :src="cell.image.url" 
                :alt="`Gallery image ${index + 1}`"
                class="gallery-image"
                @load="onImageLoad(index)"
                @error="onImageError(index)"
              />
            </div>
            
            <div v-else-if="cell.image && !cell.image.url" class="error-cell">
              <div class="error-icon">⚠️</div>
              <div class="error-text">Ошибка загрузки</div>
            </div>
            
            <div v-else class="empty-cell">
              <div class="plus-circle">
                <div class="plus-vertical"></div>
                <div class="plus-horizontal"></div>
              </div>
            </div>
            
            <button 
              v-if="cell.image && !cell.loading && cell.image.url" 
              class="delete-button"
              @click.stop="deleteImage(index)"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>

    <div 
      v-if="fullscreenVisible" 
      class="fullscreen-overlay" 
      @click="closeFullscreen"
    >
      <div class="fullscreen-content" @click.stop>
        <button class="fullscreen-close" @click="closeFullscreen">×</button>
        <div class="gallery-image-container">
          <img 
            :src="fullscreenImage.url" 
            alt="Fullscreen" 
            class="gallery-image"
          />
        </div>
        <button 
          class="fullscreen-delete" 
          @click="deleteFullscreenImage"
        >
          удалить фото
        </button>
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import { notify } from "@kyvg/vue3-notification"

const router = useRouter()

const galleryCells = ref([])
const fileInput = ref(null)
const currentFileIndex = ref(null)
const fullscreenVisible = ref(false)
const fullscreenImage = ref(null)

// IndexedDB конфигурация
const DB_VERSION = 1
const STORE_NAME = 'images'

// Получение ID текущего пользователя
const getCurrentUserId = () => {
  return localStorage.getItem('daytrack_user_id')
}

// Получение имени БД для текущего пользователя
const getDBName = () => {
  const userId = getCurrentUserId()
  if (!userId) {
    console.error('❌ Не найден ID пользователя')
    return 'GalleryDB_default'
  }
  return `GalleryDB_${userId}`
}

// Получение ключа localStorage для галереи текущего пользователя
const getGalleryStorageKey = () => {
  const userId = getCurrentUserId()
  if (!userId) {
    console.error('❌ Не найден ID пользователя')
    return 'daytrack_gallery_data_default'
  }
  return `daytrack_gallery_data_${userId}`
}

// Инициализация IndexedDB
const initDB = () => {
  return new Promise((resolve, reject) => {
    const dbName = getDBName()
    const request = indexedDB.open(dbName, DB_VERSION)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      console.log(`📂 БД инициализирована: ${dbName}`)
      resolve(request.result)
    }
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('userId', 'userId', { unique: false })
        store.createIndex('timestamp', 'timestamp', { unique: false })
        console.log(`🆕 Создано хранилище для пользователя: ${dbName}`)
      }
    }
  })
}

// Создание начальной структуры галереи
const createInitialGallery = () => {
  console.log('🔄 Создание начальной структуры галереи...')
  return Array(20).fill().map((_, index) => ({
    id: `cell_${index}_${Date.now()}`,
    image: null,
    loading: false
  }))
}

// Навигация на главную
const goToHome = () => {
  router.push('/home')
}

// Функция для показа уведомлений
const showNotification = (type, text, title) => {
  notify({
    title: title,
    text: text,
    type: type,
    duration: 4000,
    speed: 1000
  })
}

// Загрузка данных галереи при монтировании
onMounted(() => {
  console.log('🖼️ Компонент галереи загружен')
  
  // Проверяем авторизацию
  const isLoggedIn = localStorage.getItem('daytrack_logged_in') === 'true'
  const userId = getCurrentUserId()
  
  if (!isLoggedIn || !userId) {
    console.warn('⚠️ Пользователь не авторизован, перенаправляем...')
    showNotification('error', 'Пожалуйста, войдите в аккаунт', '⚠️ Ошибка')
    router.push('/')
    return
  }
  
  console.log(`👤 Текущий пользователь: ${userId}`)
  loadGalleryData()
})

// Наблюдатель за изменениями в galleryCells
watch(
  galleryCells,
  () => {
    console.log('🔄 Обнаружены изменения в галерее, сохраняем...')
    autoSaveGalleryData()
  },
  { deep: true }
)

// Загрузка данных из localStorage и IndexedDB
const loadGalleryData = async () => {
  console.log('📥 Загрузка данных галереи...')
  
  try {
    const storageKey = getGalleryStorageKey()
    const storedGalleryData = localStorage.getItem(storageKey)
    
    console.log('📋 Данные из localStorage:', storedGalleryData)
    
    // Создаем начальную структуру
    const initialCells = createInitialGallery()
    
    if (storedGalleryData) {
      try {
        const savedImages = JSON.parse(storedGalleryData)
        console.log('✅ Метаданные найдены в localStorage:', savedImages.length, 'фото')
        
        // Загружаем изображения из IndexedDB
        const loadPromises = savedImages.map(async (imageData, index) => {
          if (index < initialCells.length && imageData && imageData.id) {
            try {
              initialCells[index].loading = true
              console.log(`🔄 Загрузка изображения ${index}: ${imageData.id}`)
              
              const imageUrl = await getImageFromDB(imageData.id)
              
              if (imageUrl) {
                initialCells[index].image = {
                  id: imageData.id,
                  url: imageUrl,
                  name: imageData.name || `photo_${index + 1}`,
                  size: imageData.size || 0,
                  uploadedAt: imageData.uploadedAt || new Date().toISOString()
                }
                console.log(`✅ Изображение ${index} загружено успешно`)
                
                // Кешируем URL в localStorage для быстрого доступа на главной странице
                const cacheKey = `gallery_image_${imageData.id}`
                localStorage.setItem(cacheKey, imageUrl)
              } else {
                console.log(`⚠️ Изображение ${index} не найдено в IndexedDB`)
                initialCells[index].image = null
              }
            } catch (error) {
              console.error(`❌ Ошибка загрузки изображения ${imageData.id}:`, error)
              initialCells[index].image = null
            } finally {
              initialCells[index].loading = false
            }
          }
        })
        
        await Promise.all(loadPromises)
        console.log('🎉 Все изображения загружены')
        
      } catch (parseError) {
        console.error('❌ Ошибка парсинга данных из localStorage:', parseError)
        // Если данные повреждены, сохраняем пустой массив
        localStorage.setItem(storageKey, JSON.stringify([]))
        showNotification('warn', 'Ошибка загрузки галереи. Галерея будет сброшена.', '⚠️ Внимание')
      }
    } else {
      console.log('ℹ️ В localStorage нет данных, создаем новую галерею')
      localStorage.setItem(storageKey, JSON.stringify([]))
    }
    
    galleryCells.value = initialCells
    const loadedCount = initialCells.filter(cell => cell.image).length
    console.log('✅ Галерея инициализирована с', loadedCount, 'фото')
    
    // Убрано уведомление о количестве загруженных фото
    // if (loadedCount > 0) {
    //   showNotification('success', `Загружено ${loadedCount} фото`, '🖼️ Галерея')
    // }
    
  } catch (error) {
    console.error('❌ Критическая ошибка загрузки галереи:', error)
    showNotification('error', 'Ошибка загрузки галереи', '❌ Ошибка')
    galleryCells.value = createInitialGallery()
    const storageKey = getGalleryStorageKey()
    localStorage.setItem(storageKey, JSON.stringify([]))
  }
}

// Получение изображения из IndexedDB
const getImageFromDB = async (id) => {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(id)
      
      request.onsuccess = () => {
        if (request.result) {
          const userId = getCurrentUserId()
          // Проверяем, принадлежит ли изображение текущему пользователю
          if (request.result.userId === userId) {
            console.log('📥 Изображение загружено из IndexedDB:', id)
            const url = URL.createObjectURL(request.result.file)
            resolve(url)
          } else {
            console.warn('⚠️ Изображение принадлежит другому пользователю')
            resolve(null)
          }
        } else {
          resolve(null)
        }
      }
      
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('❌ Ошибка загрузки из IndexedDB:', error)
    return null
  }
}

// Сохранение изображения в IndexedDB
const saveImageToDB = async (id, file) => {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      
      const imageData = {
        id: id,
        file: file,
        userId: getCurrentUserId(),
        timestamp: Date.now()
      }
      
      const request = store.put(imageData)
      
      request.onsuccess = () => {
        console.log('💾 Изображение сохранено в IndexedDB:', id)
        resolve()
      }
      
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('❌ Ошибка сохранения в IndexedDB:', error)
    throw error
  }
}

// Удаление изображения из IndexedDB
const deleteImageFromDB = async (id) => {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(id)
      
      request.onsuccess = () => {
        console.log('🗑️ Изображение удалено из IndexedDB:', id)
        resolve()
      }
      
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('❌ Ошибка удаления из IndexedDB:', error)
  }
}

// Автоматическое сохранение данных в localStorage
const autoSaveGalleryData = async () => {
  try {
    const storageKey = getGalleryStorageKey()
    
    const imagesToSave = galleryCells.value
      .filter(cell => cell.image && cell.image.id)
      .map(cell => ({
        id: cell.image.id,
        name: cell.image.name,
        size: cell.image.size,
        uploadedAt: cell.image.uploadedAt
      }))

    console.log('💾 Сохранение метаданных галереи:', {
      user: getCurrentUserId(),
      totalCells: galleryCells.value.length,
      filledCells: imagesToSave.length
    })

    localStorage.setItem(storageKey, JSON.stringify(imagesToSave))
    console.log('✅ Метаданные сохранены в localStorage')
    
    // Сообщаем главной странице об обновлении галереи
    localStorage.setItem('daytrack_gallery_updated', Date.now().toString())
    
  } catch (error) {
    console.error('❌ Ошибка сохранения галереи:', error)
  }
}

// Открытие выбора файла
const openFilePicker = (index) => {
  console.log('📁 Открытие выбора файла для ячейки:', index + 1)
  currentFileIndex.value = index
  fileInput.value.click()
}

// Обработка выбора файла
const handleFileSelect = async (event) => {
  const files = event.target.files
  if (!files || files.length === 0) {
    console.log('❌ Файлы не выбраны')
    return
  }
  
  const file = files[0]
  console.log('📄 Выбран файл:', file.name, 'размер:', (file.size / (1024 * 1024)).toFixed(2), 'MB')
  
  if (file && currentFileIndex.value !== null) {
    if (!file.type.startsWith('image/')) {
      showNotification('error', 'Пожалуйста, выберите изображение', '⚠️ Ошибка')
      event.target.value = ''
      return
    }
    
    const index = currentFileIndex.value
    const userId = getCurrentUserId()
    const imageId = `img_${userId}_${Date.now()}_${index}`
    
    try {
      galleryCells.value[index].loading = true
      
      const imageUrl = URL.createObjectURL(file)
      
      galleryCells.value[index].image = {
        id: imageId,
        url: imageUrl,
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString()
      }
      
      saveImageToDB(imageId, file)
        .then(() => {
          console.log('✅ Файл сохранен в IndexedDB')
          showNotification('success', 'Фото успешно загружено в галерею!', '✅ Готово')
          
          // Кешируем URL в localStorage для быстрого доступа на главной странице
          const cacheKey = `gallery_image_${imageId}`
          localStorage.setItem(cacheKey, imageUrl)
        })
        .catch(error => {
          console.error('❌ Ошибка сохранения в IndexedDB:', error)
          showNotification('error', 'Ошибка сохранения фото', '❌ Ошибка')
        })
        .finally(() => {
          galleryCells.value[index].loading = false
        })
      
      console.log('📸 Фото загружено в ячейку', index + 1)
      
    } catch (error) {
      console.error('❌ Ошибка загрузки файла:', error)
      showNotification('error', 'Ошибка загрузки файла. Попробуйте другой файл.', '❌ Ошибка')
      galleryCells.value[index].loading = false
      galleryCells.value[index].image = null
    } finally {
      event.target.value = ''
      currentFileIndex.value = null
    }
  }
}

// Обработка загрузки изображения
const onImageLoad = (index) => {
  console.log('✅ Изображение загружено в ячейке', index + 1)
}

// Обработка ошибки загрузки изображения
const onImageError = (index) => {
  console.error('❌ Ошибка загрузки изображения в ячейке', index + 1)
  galleryCells.value[index].loading = false
  showNotification('error', 'Ошибка загрузки изображения', '❌ Ошибка')
}

// Удаление изображения
const deleteImage = async (index) => {
  const notification = notify({
    title: '🗑️ Удаление фото',
    text: 'Удалить это фото? Нажмите на это уведомление для подтверждения.',
    type: 'warn',
    duration: 5000,
    speed: 1000,
    ignoreDuplicates: true
  })
  
  // Добавляем обработчик клика по уведомлению
  setTimeout(() => {
    if (notification && notification.$el) {
      const notificationEl = notification.$el
      
      notificationEl.style.cursor = 'pointer'
      notificationEl.addEventListener('click', () => {
        console.log('🗑️ Удаление фото из ячейки', index + 1)
        
        const imageId = galleryCells.value[index].image?.id
        if (imageId) {
          if (galleryCells.value[index].image?.url) {
            URL.revokeObjectURL(galleryCells.value[index].image.url)
          }
          
          // Удаляем из IndexedDB
          deleteImageFromDB(imageId)
            .catch(error => {
              console.error('❌ Ошибка удаления из IndexedDB:', error)
            })
            
          // Удаляем из кеша
          const cacheKey = `gallery_image_${imageId}`
          localStorage.removeItem(cacheKey)
        }
        
        galleryCells.value[index].image = null
        galleryCells.value[index].loading = false
        
        showNotification('success', 'Фото успешно удалено', '✅ Удалено')
        console.log('✅ Фото удалено')
        
        notification.close()
      })
    }
  }, 100)
}

// Открытие полноразмерного просмотра
const openFullscreen = (image) => {
  console.log('🔍 Открытие полноэкранного просмотра')
  fullscreenImage.value = image
  fullscreenVisible.value = true
}

// Закрытие полноразмерного просмотра
const closeFullscreen = () => {
  console.log('❌ Закрытие полноэкранного просмотра')
  fullscreenVisible.value = false
  fullscreenImage.value = null
}

// Удаление изображения из полноразмерного просмотра
const deleteFullscreenImage = () => {
  const index = galleryCells.value.findIndex(cell => 
    cell.image && cell.image.id === fullscreenImage.value.id
  )
  
  if (index !== -1) {
    console.log('🗑️ Удаление фото из полноэкранного режима, ячейка:', index + 1)
    
    const imageId = galleryCells.value[index].image?.id
    if (imageId) {
      if (galleryCells.value[index].image?.url) {
        URL.revokeObjectURL(galleryCells.value[index].image.url)
      }
      
      // Удаляем из IndexedDB
      deleteImageFromDB(imageId)
        .catch(error => {
          console.error('❌ Ошибка удаления из IndexedDB:', error)
        })
        
      // Удаляем из кеша
      const cacheKey = `gallery_image_${imageId}`
      localStorage.removeItem(cacheKey)
    }
    
    galleryCells.value[index].image = null
    galleryCells.value[index].loading = false
    
    showNotification('success', 'Фото успешно удалено', '✅ Удалено')
    closeFullscreen()
  }
}
</script>

<style scoped>
@import '@/components/Gallery.css';
</style>