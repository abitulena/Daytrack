<template>
  <div class="notes-container">
    <!-- Фоновое изображение -->
    <div class="background-image"></div>
    
    <!-- Шапка страницы -->
    <Header />
    
    <!-- Основной контент -->
    <div class="main-content">
      <!-- Левая часть - поле для записей -->
      <div class="notes-field-section">
        <div class="section-background"></div>
        <div class="section-content">
          <div class="date-header">
            <div class="selected-date">{{ formattedSelectedDate }}</div>
            <div class="buttons-container">
              <button class="hashtag-btn" @click="showHashtagList = !showHashtagList">
                добавить хештег
              </button>
              <button class="save-notes-btn" @click="saveNotes">
                сохранить запись
              </button>
              <!-- Новая кнопка вернуться на главную -->
              <button class="home-btn" @click="goToHome">
                на главную
              </button>
            </div>
          </div>
          
          <!-- Список хештегов -->
          <div v-if="showHashtagList" class="hashtag-list">
            <div class="hashtag-title">выберите хештег:</div>
            <div class="hashtag-items">
              <!-- Дефолтные хештеги (без удаления) -->
              <div 
                v-for="hashtag in defaultHashtags" 
                :key="hashtag"
                class="hashtag-item default-hashtag"
                @click="addHashtag(hashtag)"
              >
                #{{ hashtag }}
              </div>
              
              <!-- Кастомные хештеги (с возможностью удаления) -->
              <div 
                v-for="hashtag in customHashtags" 
                :key="'custom-' + hashtag"
                class="hashtag-item custom-hashtag"
                @click="addHashtag(hashtag)"
                @dblclick="removeCustomHashtag(hashtag)"
                :title="'Двойной клик для удаления #' + hashtag"
              >
                #{{ hashtag }}
                <span class="delete-hint">×</span>
              </div>
              
              <!-- Поле для добавления нового хештега -->
              <div class="custom-hashtag-input">
                <input 
                  v-model="newCustomHashtag"
                  type="text"
                  placeholder="введите свой хештег..."
                  class="hashtag-input"
                  @keypress.enter="addCustomHashtag"
                  maxlength="20"
                />
                <button class="add-custom-btn" @click="addCustomHashtag">
                  +
                </button>
              </div>
            </div>
          </div>
          
          <div class="textarea-container">
            <textarea 
              v-model="currentNotesText"
              class="notes-textarea"
              placeholder="Начните писать здесь..."
              @input="handleTextInput"
              ref="textarea"
            ></textarea>
            <div class="text-lines-background" :style="linesStyle"></div>
          </div>
        </div>
      </div>
      
      <!-- Правая часть - вопросы -->
      <div class="questions-section">
        <div class="questions-title">не знаешь о чем писать?<br/>можешь ответить на эти вопросы:</div>
        <div class="questions-list">
          <div 
            v-for="(question, index) in currentQuestions" 
            :key="index"
            class="question-item"
          >
            <div class="question-plate">
              <div class="question-text">{{ question }}</div>
            </div>
          </div>
        </div>
        <button class="refresh-btn" @click="refreshQuestions">
          обновить вопросы
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Notes',
  data() {
    return {
      currentNotesText: '',
      currentQuestions: [],
      selectedDate: new Date(),
      notesData: {},
      scrollPosition: 0,
      showHashtagList: false,
      newCustomHashtag: '',
      allQuestions: [
        'Что я чувствую прямо сейчас?',
        'За что я благодарен сегодня?',
        'Что вызвало у меня улыбку?',
        'Какой урок я извлек сегодня?',
        'Что бы я хотел изменить в этом дне?',
        'Какое решение я принял сегодня?',
        'С кем я пообщался и какие эмоции испытал?',
        'Что нового я узнал о себе?',
        'Как я позаботился о своем здоровье?',
        'Что вдохновило меня сегодня?',
        'Какие мысли меня беспокоили?',
        'Что я сделал для своих целей?',
        'Какой момент дня был самым ярким?',
        'Что помогло мне справиться со стрессом?',
        'О чем я мечтал сегодня?',
        'Что я хочу запомнить из этого дня?',
        'Как я отдохнул и восстановил силы?',
        'Что заставило меня задуматься?',
        'Какой совет я бы дал себе утром?',
        'Что делает этот день особенным?'
      ],
      defaultHashtags: [
        'любовь',
        'работа',
        'отдых',
        'здоровье',
        'друзья',
        'семья',
        'учеба',
        'хобби',
        'путешествие',
        'мечты'
      ],
      customHashtags: []
    }
  },
  computed: {
    formattedSelectedDate() {
      const options = { day: 'numeric', month: 'long', year: 'numeric' }
      return this.selectedDate.toLocaleDateString('ru-RU', options)
    },
    linesStyle() {
      return {
        'background-position': `0 ${-this.scrollPosition}px`
      }
    },
    availableHashtags() {
      return [...this.defaultHashtags, ...this.customHashtags]
    }
  },
  watch: {
    selectedDate: {
      handler(newDate) {
        this.loadNotesForDate(newDate)
      },
      deep: true
    }
  },
  methods: {
    loadSelectedDate() {
      const storedDate = localStorage.getItem('daytrack_selected_date')
      if (storedDate) {
        this.selectedDate = new Date(storedDate)
      }
    },
    
    loadStoredNotes() {
      const storedNotesData = localStorage.getItem('daytrack_notes_data')
      if (storedNotesData) {
        this.notesData = JSON.parse(storedNotesData)
      }
    },
    
    loadCustomHashtags() {
      const stored = localStorage.getItem('daytrack_custom_hashtags')
      this.customHashtags = stored ? JSON.parse(stored) : []
    },
    
    saveCustomHashtags() {
      localStorage.setItem('daytrack_custom_hashtags', JSON.stringify(this.customHashtags))
    },
    
    loadNotesForDate(date) {
      const dateKey = date.toDateString()
      this.currentNotesText = this.notesData[dateKey]?.text || ''
    },
    
    refreshQuestions() {
      const shuffled = [...this.allQuestions]
        .sort(() => 0.5 - Math.random())
        .slice(0, 4)
      this.currentQuestions = shuffled
    },
    
    handleTextInput() {
      const textarea = this.$refs.textarea
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = Math.min(textarea.scrollHeight, 400) + 'px'
      }
    },
    
    saveNotes() {
      const dateKey = this.selectedDate.toDateString()
      
      if (this.currentNotesText.trim()) {
        this.notesData[dateKey] = {
          text: this.currentNotesText.trim(),
          savedAt: new Date().toISOString()
        }
        alert('Запись успешно сохранена!')
      } else {
        delete this.notesData[dateKey]
        alert('Запись удалена (текст пустой)!')
      }
      
      localStorage.setItem('daytrack_notes_data', JSON.stringify(this.notesData))
    },
    
    addHashtag(hashtag) {
      const hashtagText = ` #${hashtag}`
      
      if (this.currentNotesText.trim() === '') {
        this.currentNotesText = hashtagText.trim()
      } else {
        this.currentNotesText += hashtagText
      }
      
      this.$nextTick(() => {
        const textarea = this.$refs.textarea
        if (textarea) {
          textarea.scrollTop = textarea.scrollHeight
        }
      })
    },
    
    addCustomHashtag() {
      if (this.newCustomHashtag.trim()) {
        const cleanHashtag = this.newCustomHashtag.trim()
          .replace(/#/g, '')
          .replace(/\s+/g, '_')
          .toLowerCase()
        
        if (cleanHashtag) {
          if (!this.customHashtags.includes(cleanHashtag) && 
              !this.defaultHashtags.includes(cleanHashtag)) {
            
            this.customHashtags.push(cleanHashtag)
            this.saveCustomHashtags()
            this.addHashtag(cleanHashtag)
            this.newCustomHashtag = ''
            
            this.$nextTick(() => {
              alert(`Хештег #${cleanHashtag} добавлен! Для удаления сделайте двойной клик по нему.`)
            })
          } else {
            alert('Такой хештег уже существует!')
          }
        }
      }
    },
    
    removeCustomHashtag(hashtag) {
      if (confirm(`Удалить хештег #${hashtag}?`)) {
        this.customHashtags = this.customHashtags.filter(h => h !== hashtag)
        this.saveCustomHashtags()
        this.removeHashtagFromAllNotes(hashtag)
        alert(`Хештег #${hashtag} удален!`)
      }
    },
    
    removeHashtagFromAllNotes(hashtag) {
      const hashtagPattern = new RegExp(`\\s?#${hashtag}\\b`, 'g')
      
      Object.keys(this.notesData).forEach(dateKey => {
        if (this.notesData[dateKey]?.text) {
          this.notesData[dateKey].text = this.notesData[dateKey].text
            .replace(hashtagPattern, '')
            .trim()
        }
      })
      
      if (this.currentNotesText) {
        this.currentNotesText = this.currentNotesText
          .replace(hashtagPattern, '')
          .trim()
      }
      
      localStorage.setItem('daytrack_notes_data', JSON.stringify(this.notesData))
    },
    
    goToHome() {
      this.$router.push('/home')
    },
    
    handleScroll() {
      if (this.$refs.textarea) {
        this.scrollPosition = this.$refs.textarea.scrollTop
      }
    }
  },
  mounted() {
    this.loadSelectedDate()
    this.loadStoredNotes()
    this.loadCustomHashtags()
    this.loadNotesForDate(this.selectedDate)
    this.refreshQuestions()
    
    const textarea = this.$refs.textarea
    if (textarea) {
      textarea.addEventListener('scroll', this.handleScroll)
    }
  },
  beforeUnmount() {
    const textarea = this.$refs.textarea
    if (textarea) {
      textarea.removeEventListener('scroll', this.handleScroll)
    }
  }
}
</script>

<style scoped>
/* Существующие стили остаются без изменений */

/* Добавляем стили для кнопки "на главную" */
.home-btn {
  background: #9C59A7;
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-family: 'KyivType Sans';
  font-weight: 840;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.home-btn:hover {
  background: #8a4d94;
}

/* Обновляем контейнер кнопок для размещения третьей кнопки */
.buttons-container {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap; /* Добавляем перенос на маленьких экранах */
}

/* Остальные стили без изменений */
.hashtag-item {
  background: rgba(185, 152, 200, 0.3);
  border: 1px solid #B998C8;
  border-radius: 8px;
  padding: 8px 12px;
  color: #3F2A52;
  font-size: 14px;
  font-family: 'KyivType Sans';
  font-weight: 840;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
}

.hashtag-item:hover {
  background: rgba(185, 152, 200, 0.5);
  transform: translateY(-2px);
}

.custom-hashtag {
  background: rgba(156, 89, 167, 0.3);
  border: 1px solid #9C59A7;
  border-style: dashed;
}

.custom-hashtag:hover {
  background: rgba(156, 89, 167, 0.5);
}

.delete-hint {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff4757;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.custom-hashtag:hover .delete-hint {
  opacity: 1;
}

.default-hashtag {
  background: rgba(185, 152, 200, 0.3);
  border: 1px solid #B998C8;
}

.hashtag-items {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.custom-hashtag-input {
  grid-column: span 2;
  display: flex;
  gap: 8px;
  margin-top: 5px;
}

.notes-container {
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
  top: 120px;
  left: 15px;
  right: 15px;
  bottom: 80px;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 15px;
  z-index: 5;
}

.notes-field-section {
  position: relative;
  height: 450px;
  border-radius: 18px;
  overflow: hidden;
}

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
  z-index: 2;
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.date-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.selected-date {
  color: #3F2A52;
  font-size: 18px;
  font-family: 'KyivType Sans';
  font-weight: 840;
}

.save-notes-btn, .hashtag-btn {
  background: #B998C8;
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-family: 'KyivType Sans';
  font-weight: 840;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.save-notes-btn:hover, .hashtag-btn:hover {
  background: #A589B3;
}

.hashtag-list {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid #C7A7D6;
}

.hashtag-title {
  color: #3F2A52;
  font-size: 16px;
  font-family: 'KyivType Sans';
  font-weight: 840;
  margin-bottom: 10px;
  text-align: center;
}

.hashtag-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #C7A7D6;
  border-radius: 8px;
  padding: 8px 12px;
  color: #3F2A52;
  font-size: 14px;
  font-family: 'KyivType Sans';
  outline: none;
}

.hashtag-input::placeholder {
  color: rgba(109, 93, 122, 0.5);
}

.add-custom-btn {
  background: #B998C8;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  width: 35px;
  height: 35px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.add-custom-btn:hover {
  background: #A589B3;
}

.textarea-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.notes-textarea {
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: #6D5D7A;
  font-size: 16px;
  font-family: 'KyivType Sans';
  font-weight: 840;
  line-height: 40px;
  resize: none;
  padding: 0 10px;
  position: relative;
  z-index: 2;
}

.notes-textarea::placeholder {
  color: rgba(109, 93, 122, 0.5);
}

.text-lines-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: linear-gradient(to bottom, 
    transparent 39px, 
    #C7A7D6 39px, 
    #C7A7D6 41px, 
    transparent 41px
  );
  background-size: 100% 40px;
  background-position: 0 0;
  pointer-events: none;
  z-index: 1;
  background-repeat: repeat-y;
}

.questions-section {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 450px;
}

.questions-title {
  color: #3F2A52;
  font-size: 20px;
  font-family: 'KyivType Sans';
  font-weight: 840;
  line-height: 1.3;
  margin-bottom: 20px;
  text-align: left;
  padding: 0 15px;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex: 1;
  margin-bottom: 0;
}

.question-item {
  display: flex;
  flex-direction: column;
}

.question-plate {
  background: rgba(237, 221, 236, 0.66);
  border-radius: 12px;
  padding: 15px;
  min-height: 70px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px solid rgba(190, 174, 219, 0.5);
  text-align: center;
}

.question-text {
  color: #876894;
  font-size: 18px;
  font-family: 'KyivType Sans';
  font-weight: 840;
  line-height: 1.3;
}

.refresh-btn {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background: #b998c8;
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-family: 'KyivType Sans';
  font-weight: 840;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: fit-content;
}

.refresh-btn:hover {
  background: #A589B3;
}

.notes-textarea::-webkit-scrollbar {
  width: 6px;
}

.notes-textarea::-webkit-scrollbar-track {
  background: rgba(237, 221, 236, 0.5);
  border-radius: 3px;
}

.notes-textarea::-webkit-scrollbar-thumb {
  background: #B998C8;
  border-radius: 3px;
}

.notes-textarea::-webkit-scrollbar-thumb:hover {
  background: #A589B3;
}
</style>