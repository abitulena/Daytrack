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
          <div 
            v-for="(cell, index) in galleryCells" 
            :key="cell.id"
            class="gallery-cell"
            :class="{ 'has-image': cell.imageUrl, 'loading': cell.loading }"
            @click="cell.imageUrl ? openFullscreen(index) : openFilePicker(index)"
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
            </div>
            
            <button 
              v-if="cell.imageUrl && !cell.loading" 
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
            :src="fullscreenImageUrl" 
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'

const router = useRouter()

const galleryCells = ref([])
const fileInput = ref(null)
const currentFileIndex = ref(null)
const fullscreenVisible = ref(false)
const fullscreenIndex = ref(null)
const fullscreenImageUrl = ref('')

// IndexedDB конфигурация
const DB_VERSION = 1
const STORE_NAME = 'gallery_images'

// Получение ID текущего пользователя
const getCurrentUserId = () => {
  return localStorage.getItem('daytrack_user_id') || 'default_user'
}

// Получение имени БД для текущего пользователя
const getDBName = () => {
  const userId = getCurrentUserId()
  return `GalleryDB_${userId}`
}

// Инициализация IndexedDB
const initDB = () => {
  return new Promise((resolve, reject) => {
    const dbName = getDBName()
    const request = indexedDB.open(dbName, DB_VERSION)
    
    request.onerror = () => {
      console.error('Ошибка открытия БД:', request.error)
      reject(request.error)
    }
    
    request.onsuccess = () => {
      console.log('БД инициализирована:', dbName)
      resolve(request.result)
    }
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('userId', 'userId', { unique: false })
        store.createIndex('cellIndex', 'cellIndex', { unique: true })
        console.log('Создано хранилище:', STORE_NAME)
      }
    }
  })
}

// Создание начальной структуры галереи
const createInitialGallery = () => {
  return Array(20).fill().map((_, index) => ({
    id: `cell_${index}`,
    cellIndex: index,
    imageUrl: null,
    loading: false
  }))
}

// Навигация на главную
const goToHome = () => {
  router.push('/home')
}

// Сохранение изображения как base64 в IndexedDB
const saveImageToDB = async (index, file) => {
  try {
    // Сначала сжимаем изображение если нужно
    const processedFile = await compressImage(file)
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (event) => {
        try {
          const base64Data = event.target.result
          const db = await initDB()
          
          const imageData = {
            id: `img_${getCurrentUserId()}_${Date.now()}_${index}`,
            cellIndex: index,
            userId: getCurrentUserId(),
            name: file.name,
            type: file.type,
            size: processedFile.size,
            data: base64Data,
            timestamp: Date.now(),
            uploadedAt: new Date().toISOString()
          }
          
          const transaction = db.transaction([STORE_NAME], 'readwrite')
          const store = transaction.objectStore(STORE_NAME)
          
          // Удаляем старую запись для этой ячейки если есть
          const indexObj = store.index('cellIndex')
          const getRequest = indexObj.getKey(index)
          
          getRequest.onsuccess = () => {
            if (getRequest.result) {
              store.delete(getRequest.result)
            }
            
            // Сохраняем новую запись
            const putRequest = store.put(imageData)
            
            putRequest.onsuccess = () => {
              console.log('Изображение сохранено для ячейки', index)
              resolve({
                id: imageData.id,
                url: base64Data,
                name: file.name,
                size: processedFile.size,
                uploadedAt: imageData.uploadedAt
              })
            }
            
            putRequest.onerror = () => {
              console.error('Ошибка сохранения:', putRequest.error)
              reject(putRequest.error)
            }
          }
          
          getRequest.onerror = () => {
            console.error('Ошибка поиска:', getRequest.error)
            reject(getRequest.error)
          }
        } catch (error) {
          console.error('Ошибка в обработке:', error)
          reject(error)
        }
      }
      
      reader.onerror = () => {
        console.error('Ошибка чтения файла:', reader.error)
        reject(reader.error)
      }
      
      reader.readAsDataURL(processedFile)
    })
  } catch (error) {
    console.error('Ошибка сохранения в IndexedDB:', error)
    throw error
  }
}

// Сжатие изображения
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    if (file.size <= 1 * 1024 * 1024) { // Если меньше 1MB, не сжимаем
      resolve(file)
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        // Максимальный размер 1200px по большей стороне
        const maxSize = 1200
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        } else if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        
        // Качество 0.7 для баланса качества/размера
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            resolve(file)
          }
        }, 'image/jpeg', 0.7)
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Загрузка изображения из IndexedDB
const loadImageFromDB = async (index) => {
  try {
    const db = await initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const indexObj = store.index('cellIndex')
      const request = indexObj.get(index)
      
      request.onsuccess = () => {
        if (request.result) {
          const imageData = request.result
          console.log('Найдено изображение для ячейки', index)
          resolve({
            id: imageData.id,
            url: imageData.data,
            name: imageData.name,
            size: imageData.size,
            uploadedAt: imageData.uploadedAt
          })
        } else {
          console.log('Нет изображения для ячейки', index)
          resolve(null)
        }
      }
      
      request.onerror = () => {
        console.error('Ошибка загрузки:', request.error)
        reject(request.error)
      }
    })
  } catch (error) {
    console.error('Ошибка загрузки из IndexedDB:', error)
    return null
  }
}

// Удаление изображения из IndexedDB
const deleteImageFromDB = async (index) => {
  try {
    const db = await initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const indexObj = store.index('cellIndex')
      const request = indexObj.getKey(index)
      
      request.onsuccess = () => {
        if (request.result) {
          const deleteRequest = store.delete(request.result)
          
          deleteRequest.onsuccess = () => {
            console.log('Изображение удалено для ячейки', index)
            resolve()
          }
          
          deleteRequest.onerror = () => {
            console.error('Ошибка удаления:', deleteRequest.error)
            reject(deleteRequest.error)
          }
        } else {
          resolve()
        }
      }
      
      request.onerror = () => {
        console.error('Ошибка поиска для удаления:', request.error)
        reject(request.error)
      }
    })
  } catch (error) {
    console.error('Ошибка удаления из IndexedDB:', error)
    throw error
  }
}

// Сохранение метаданных галереи (для главной страницы)
const saveGalleryMetadata = () => {
  try {
    const metadataKey = `daytrack_gallery_metadata_${getCurrentUserId()}`
    
    // Собираем метаданные всех изображений
    const metadata = galleryCells.value
      .filter(cell => cell.imageUrl)
      .map(cell => ({
        id: cell.imageData?.id || '',
        name: cell.imageData?.name || 'photo',
        uploadedAt: cell.imageData?.uploadedAt || new Date().toISOString(),
        cellIndex: cell.cellIndex
      }))
    
    localStorage.setItem(metadataKey, JSON.stringify(metadata))
    console.log('Метаданные сохранены:', metadata.length, 'изображений')
    
    // Сообщаем главной странице об обновлении
    localStorage.setItem('daytrack_gallery_updated', Date.now().toString())
    
  } catch (error) {
    console.error('Ошибка сохранения метаданных:', error)
  }
}

// Загрузка данных галереи при монтировании
onMounted(async () => {
  console.log('Компонент галереи загружен')
  
  const isLoggedIn = localStorage.getItem('daytrack_logged_in') === 'true'
  if (!isLoggedIn) {
    router.push('/')
    return
  }
  
  console.log('Пользователь авторизован')
  await loadGalleryData()
})

// Загрузка всех данных галереи
const loadGalleryData = async () => {
  console.log('Загрузка данных галереи...')
  
  try {
    const initialCells = createInitialGallery()
    
    for (let i = 0; i < initialCells.length; i++) {
      try {
        initialCells[i].loading = true
        console.log('Загрузка изображения для ячейки', i)
        
        const imageData = await loadImageFromDB(i)
        
        if (imageData) {
          initialCells[i].imageUrl = imageData.url
          initialCells[i].imageData = imageData
          console.log('Изображение', i, 'загружено успешно')
        } else {
          console.log('Нет изображения для ячейки', i)
        }
      } catch (error) {
        console.error('Ошибка загрузки изображения', i, ':', error)
      } finally {
        initialCells[i].loading = false
      }
    }
    
    galleryCells.value = initialCells
    const loadedCount = initialCells.filter(cell => cell.imageUrl).length
    console.log('Галерея загружена:', loadedCount, 'фото')
    
    // Сохраняем метаданные для главной страницы
    saveGalleryMetadata()
    
  } catch (error) {
    console.error('Критическая ошибка загрузки галереи:', error)
    galleryCells.value = createInitialGallery()
  }
}

// Открытие выбора файла
const openFilePicker = (index) => {
  console.log('Открытие выбора файла для ячейки:', index)
  currentFileIndex.value = index
  fileInput.value.click()
}

// Обработка выбора файла
const handleFileSelect = async (event) => {
  const files = event.target.files
  if (!files || files.length === 0) {
    console.log('Файлы не выбраны')
    return
  }
  
  const file = files[0]
  console.log('Выбран файл:', file.name, 'размер:', (file.size / (1024 * 1024)).toFixed(2), 'MB')
  
  if (file && currentFileIndex.value !== null) {
    if (!file.type.startsWith('image/')) {
      console.log('Это не изображение')
      event.target.value = ''
      return
    }
    
    if (file.size > 20 * 1024 * 1024) {
      console.log('Файл слишком большой (макс. 20MB)')
      event.target.value = ''
      return
    }
    
    const index = currentFileIndex.value
    
    try {
      galleryCells.value[index].loading = true
      
      const imageData = await saveImageToDB(index, file)
      
      galleryCells.value[index].imageUrl = imageData.url
      galleryCells.value[index].imageData = imageData
      galleryCells.value[index].loading = false
      
      console.log('Фото загружено в ячейку', index)
      
      // Сохраняем метаданные для главной страницы
      saveGalleryMetadata()
      
    } catch (error) {
      console.error('Ошибка загрузки файла:', error)
      galleryCells.value[index].loading = false
      alert('Не удалось загрузить фото. Попробуйте другое изображение.')
    } finally {
      event.target.value = ''
      currentFileIndex.value = null
    }
  }
}

// Обработка загрузки изображения
const onImageLoad = (index) => {
  console.log('Изображение загружено в ячейке', index)
}

// Обработка ошибки загрузки изображения
const handleImageError = async (index) => {
  console.error('Ошибка загрузки изображения в ячейке', index)
  
  try {
    galleryCells.value[index].loading = true
    
    const imageData = await loadImageFromDB(index)
    
    if (imageData) {
      galleryCells.value[index].imageUrl = imageData.url
      galleryCells.value[index].imageData = imageData
    } else {
      galleryCells.value[index].imageUrl = null
      galleryCells.value[index].imageData = null
      await deleteImageFromDB(index)
    }
  } catch (error) {
    console.error('Ошибка восстановления изображения:', error)
    galleryCells.value[index].imageUrl = null
    galleryCells.value[index].imageData = null
  } finally {
    galleryCells.value[index].loading = false
    
    // Обновляем метаданные
    saveGalleryMetadata()
  }
}

// Удаление изображения
const deleteImage = async (index) => {
  console.log('Удаление фото из ячейки', index)
  
  if (!confirm('Удалить это фото?')) {
    return
  }
  
  try {
    await deleteImageFromDB(index)
    
    galleryCells.value[index].imageUrl = null
    galleryCells.value[index].imageData = null
    
    console.log('Фото удалено')
    
    // Обновляем метаданные для главной страницы
    saveGalleryMetadata()
    
  } catch (error) {
    console.error('Ошибка удаления фото:', error)
    alert('Не удалось удалить фото')
  }
}

// Открытие полноразмерного просмотра
const openFullscreen = (index) => {
  console.log('Открытие полноэкранного просмотра для ячейки', index)
  
  const cell = galleryCells.value[index]
  if (cell && cell.imageUrl) {
    fullscreenIndex.value = index
    fullscreenImageUrl.value = cell.imageUrl
    fullscreenVisible.value = true
  }
}

// Закрытие полноразмерного просмотра
const closeFullscreen = () => {
  console.log('Закрытие полноэкранного просмотра')
  fullscreenVisible.value = false
  fullscreenIndex.value = null
  fullscreenImageUrl.value = ''
}

// Удаление изображения из полноразмерного просмотра
const deleteFullscreenImage = async () => {
  if (fullscreenIndex.value !== null) {
    console.log('Удаление фото из полноэкранного режима, ячейка:', fullscreenIndex.value)
    await deleteImage(fullscreenIndex.value)
    closeFullscreen()
  }
}
</script>

<style scoped>
@import '@/components/Gallery.css';
</style>