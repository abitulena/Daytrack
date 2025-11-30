<template>
  <div class="gallery-container">
    <!-- Фоновое изображение -->
    <div class="background-image"></div>
    
    <!-- Шапка страницы -->
    <Header />
    
    <!-- Основной контент -->
    <div class="gallery-content">
      <!-- Сетка фотографий с прокруткой -->
      <div class="gallery-scroll-container">
        <div class="gallery-grid">
          <div 
            v-for="(cell, index) in galleryCells" 
            :key="cell.id"
            class="gallery-cell"
            :class="{ 'has-image': cell.image, 'loading': cell.loading }"
            @click="cell.image ? openFullscreen(cell.image) : openFilePicker(index)"
          >
            <!-- Загрузка -->
            <div v-if="cell.loading" class="loading-spinner">
              <div class="spinner"></div>
              <div class="loading-text">Загрузка...</div>
            </div>
            
            <!-- Ячейка с изображением -->
            <img 
              v-else-if="cell.image && cell.image.url" 
              :src="cell.image.url" 
              :alt="`Gallery image ${index + 1}`"
              class="cell-image"
              @load="onImageLoad(index)"
              @error="onImageError(index)"
            />
            
            <!-- Ошибка загрузки -->
            <div v-else-if="cell.image && !cell.image.url" class="error-cell">
              <div class="error-icon">⚠️</div>
              <div class="error-text">Ошибка загрузки</div>
            </div>
            
            <!-- Пустая ячейка с плюсом -->
            <div v-else class="empty-cell">
              <div class="plus-circle">
                <div class="plus-vertical"></div>
                <div class="plus-horizontal"></div>
              </div>
            </div>
            
            <!-- Кнопка удаления для заполненных ячеек -->
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

    <!-- Модальное окно полноразмерного просмотра -->
    <div 
      v-if="fullscreenVisible" 
      class="fullscreen-overlay" 
      @click="closeFullscreen"
    >
      <div class="fullscreen-content" @click.stop>
        <button class="fullscreen-close" @click="closeFullscreen">×</button>
        <img 
          :src="fullscreenImage.url" 
          alt="Fullscreen" 
          class="fullscreen-image"
        />
        <button 
          class="fullscreen-delete" 
          @click="deleteFullscreenImage"
        >
          удалить фото
        </button>
      </div>
    </div>

    <!-- Скрытый input для выбора файлов -->
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

const router = useRouter()

// Данные галереи
const galleryCells = ref([])
const fileInput = ref(null)
const currentFileIndex = ref(null)
const fullscreenVisible = ref(false)
const fullscreenImage = ref(null)

// IndexedDB
const DB_NAME = 'GalleryDB'
const DB_VERSION = 1
const STORE_NAME = 'images'

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
          console.log('📥 Изображение загружено из IndexedDB:', id)
          // Создаем URL для изображения
          const url = URL.createObjectURL(request.result.file)
          resolve(url)
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

// Создание начальной структуры галереи
const createInitialGallery = () => {
  console.log('🔄 Создание начальной структуры галереи...')
  return Array(20).fill().map((_, index) => ({
    id: `cell_${index}`,
    image: null,
    loading: false
  }))
}

// Загрузка данных галереи при монтировании
onMounted(() => {
  console.log('🖼️ Компонент галереи загружен')
  loadGalleryData()
})

// Наблюдатель за изменениями в galleryCells для автоматического сохранения
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
    const storedGalleryData = localStorage.getItem('daytrack_gallery_data')
    
    // Создаем начальную структуру
    const initialCells = createInitialGallery()
    
    if (storedGalleryData) {
      const savedImages = JSON.parse(storedGalleryData)
      console.log('✅ Метаданные найдены в localStorage:', savedImages.length, 'фото')
      
      // Загружаем изображения из IndexedDB
      const loadPromises = savedImages.map(async (imageData, index) => {
        if (index < initialCells.length && imageData && imageData.id) {
          try {
            initialCells[index].loading = true
            const imageUrl = await getImageFromDB(imageData.id)
            
            if (imageUrl) {
              initialCells[index].image = {
                id: imageData.id,
                url: imageUrl,
                name: imageData.name || `photo_${index + 1}`,
                size: imageData.size || 0,
                uploadedAt: imageData.uploadedAt || new Date().toISOString()
              }
            } else {
              // Если изображение не найдено в IndexedDB, очищаем ячейку
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
      
      // Ждем завершения всех загрузок
      await Promise.all(loadPromises)
      console.log('🎉 Все изображения загружены')
      
    } else {
      console.log('ℹ️ В localStorage нет данных, создаем новую галерею')
    }
    
    galleryCells.value = initialCells
    console.log('✅ Галерея инициализирована')
    
  } catch (error) {
    console.error('❌ Критическая ошибка загрузки галереи:', error)
    galleryCells.value = createInitialGallery()
  }
}

// Автоматическое сохранение данных в localStorage
const autoSaveGalleryData = async () => {
  try {
    // Фильтруем только ячейки с изображениями
    const imagesToSave = galleryCells.value
      .filter(cell => cell.image && cell.image.id)
      .map(cell => ({
        id: cell.image.id,
        name: cell.image.name,
        size: cell.image.size,
        uploadedAt: cell.image.uploadedAt
      }))

    console.log('💾 Сохранение метаданных галереи:', {
      totalCells: galleryCells.value.length,
      filledCells: imagesToSave.length
    })

    // Сохраняем только метаданные в localStorage
    localStorage.setItem('daytrack_gallery_data', JSON.stringify(imagesToSave))
    console.log('✅ Метаданные сохранены в localStorage')
    
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
    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение')
      event.target.value = ''
      return
    }
    
    const index = currentFileIndex.value
    const imageId = `img_${Date.now()}_${index}`
    
    try {
      // Показываем загрузку
      galleryCells.value[index].loading = true
      
      // Создаем URL для предпросмотра сразу
      const imageUrl = URL.createObjectURL(file)
      
      // Сохраняем данные в ячейку
      galleryCells.value[index].image = {
        id: imageId,
        url: imageUrl,
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString()
      }
      
      // Асинхронно сохраняем файл в IndexedDB (без ожидания)
      saveImageToDB(imageId, file)
        .then(() => {
          console.log('✅ Файл сохранен в IndexedDB')
        })
        .catch(error => {
          console.error('❌ Ошибка сохранения в IndexedDB:', error)
          // Но изображение все равно показываем, т.к. у нас есть blob URL
        })
        .finally(() => {
          // Снимаем индикатор загрузки
          galleryCells.value[index].loading = false
        })
      
      console.log('📸 Фото загружено в ячейку', index + 1)
      
    } catch (error) {
      console.error('❌ Ошибка загрузки файла:', error)
      alert('Ошибка загрузки файла. Попробуйте другой файл.')
      galleryCells.value[index].loading = false
      galleryCells.value[index].image = null
    } finally {
      // Сбрасываем input
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
  // Можно показать сообщение об ошибке
}

// Удаление изображения
const deleteImage = async (index) => {
  if (confirm('Удалить это фото?')) {
    console.log('🗑️ Удаление фото из ячейки', index + 1)
    
    const imageId = galleryCells.value[index].image?.id
    if (imageId) {
      // Освобождаем URL
      if (galleryCells.value[index].image?.url) {
        URL.revokeObjectURL(galleryCells.value[index].image.url)
      }
      
      // Удаляем из IndexedDB (асинхронно, без ожидания)
      deleteImageFromDB(imageId)
    }
    
    galleryCells.value[index].image = null
    galleryCells.value[index].loading = false
    console.log('✅ Фото удалено')
  }
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
    deleteImage(index)
    closeFullscreen()
  }
}

// Функция для отладки
const debugGallery = async () => {
  console.log('🔍 DEBUG Текущее состояние галереи:')
  console.log('Всего ячеек:', galleryCells.value.length)
  
  const filledCells = galleryCells.value.filter(cell => cell.image && cell.image.url).length
  const loadingCells = galleryCells.value.filter(cell => cell.loading).length
  console.log('Заполненных ячеек:', filledCells)
  console.log('Загружающихся ячеек:', loadingCells)
  
  try {
    const db = await initDB()
    const count = await new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.count()
      request.onsuccess = () => resolve(request.result)
    })
    console.log('📦 IndexedDB: сохранено', count, 'изображений')
  } catch (error) {
    console.log('📦 IndexedDB: недоступен')
  }
}

// Вызовем отладку при загрузке
onMounted(() => {
  setTimeout(() => {
    debugGallery()
  }, 3000)
})
</script>

<style scoped>
/* Существующие стили остаются без изменений */

/* Добавляем стили для загрузки и ошибок */
.gallery-cell.loading {
  background: rgba(58, 45, 52, 0.15);
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  gap: 10px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-family: 'KyivType Sans';
}

.error-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  gap: 8px;
  color: rgba(255, 255, 255, 0.8);
}

.error-icon {
  font-size: 24px;
}

.error-text {
  font-size: 14px;
  font-family: 'KyivType Sans';
  text-align: center;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Остальные стили без изменений */
.gallery-container {
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
  height: 768px;
  position: absolute;
  top: 0;
  left: 0;
  background-image: url('@/assets/lavanderall.png');
  background-size: cover;
  background-position: center;
  z-index: 1;
}

.gallery-content {
  position: absolute;
  top: 80px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
}

.gallery-scroll-container {
  width: 100%;
  flex: 1;
  overflow-y: auto;
  padding: 20px 40px 40px 40px;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 600px;
}

.gallery-cell {
  position: relative;
  aspect-ratio: 1 / 1;
  background: rgba(58, 45, 52, 0.30);
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.gallery-cell.has-image {
  background: transparent;
}

.gallery-cell:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(151, 112, 169, 0.4);
}

.empty-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.plus-circle {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.40);
  border-radius: 9999px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.gallery-cell:hover .plus-circle {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.60);
}

.plus-vertical {
  width: 4px;
  height: 35px;
  background: white;
  position: absolute;
  border-radius: 2px;
}

.plus-horizontal {
  width: 35px;
  height: 4px;
  background: white;
  position: absolute;
  border-radius: 2px;
}

.cell-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 30px;
  transition: transform 0.3s ease;
}

.gallery-cell:hover .cell-image {
  transform: scale(1.05);
  border-radius: 30px;
}

.delete-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(231, 76, 60, 0.9);
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.gallery-cell:hover .delete-button {
  opacity: 1;
}

.delete-button:hover {
  background: #c0392b;
  transform: scale(1.1);
}

/* Модальное окно полноразмерного просмотра */
.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.fullscreen-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.fullscreen-close {
  position: absolute;
  top: -50px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 40px;
  cursor: pointer;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fullscreen-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
}

.fullscreen-delete {
  margin-top: 25px;
  background: #e74c3c;
  border: none;
  border-radius: 15px;
  color: white;
  font-size: 18px;
  font-family: 'KyivType Sans';
  font-weight: 840;
  padding: 12px 25px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.fullscreen-delete:hover {
  background: #c0392b;
}

/* Стили для скролла */
.gallery-scroll-container::-webkit-scrollbar {
  width: 8px;
}

.gallery-scroll-container::-webkit-scrollbar-track {
  background: rgba(237, 221, 236, 0.3);
  border-radius: 4px;
}

.gallery-scroll-container::-webkit-scrollbar-thumb {
  background: #B998C8;
  border-radius: 4px;
}

.gallery-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #9770A9;
}

/* Адаптивность */
@media (min-width: 1920px) {
  .gallery-grid {
    gap: 40px;
  }
}

@media (max-width: 1919px) {
  .gallery-grid {
    gap: 35px;
  }
}

@media (max-width: 1599px) {
  .gallery-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 30px;
  }
}

@media (max-width: 1279px) {
  .gallery-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 25px;
  }
}

@media (max-width: 959px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}
</style>