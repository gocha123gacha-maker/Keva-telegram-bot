// ============================================
// КЕВА AI - ЯДРО И НАСТРОЙКИ (ЧАСТЬ 1)
// ============================================

class KevaAI {
    constructor() {
        // ========== НАСТРОЙКИ КЕВЫ ==========
        this.name = "Кева AI";           // Имя ИИ
        this.gender = "male";            // male (пацан) / female (девушка)
        this.theme = "dark";             // dark / light (пока только dark)
        this.avatar = "🐱";              // Аватарка (эмодзи)
        
        // Технические настройки
        this.isThinking = false;
        this.searchMode = false;
        this.currentUrl = '';
        this.isRecording = false;
        this.recognition = null;
        
        this.init();
    }

    init() {
        // Получаем элементы DOM
        this.chatContainer = document.getElementById('chatContainer');
        this.userInput = document.getElementById('userInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.statusText = document.getElementById('statusText');
        this.searchToggleBtn = document.getElementById('searchToggleBtn');
        this.voiceBtn = document.getElementById('voiceBtn');
        
        // Аватарка
        const avatarElement = document.querySelector('.avatar-icon');
        if (avatarElement) avatarElement.textContent = this.avatar;
        
        // Имя в заголовке
        const titleElement = document.querySelector('.title-section h1');
        if (titleElement) titleElement.textContent = this.name;
        
        // Элементы модального окна
        this.modal = document.getElementById('webviewModal');
        this.webviewFrame = document.getElementById('webviewFrame');
        this.modalTitle = document.getElementById('modalTitle');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        this.closeModalFooterBtn = document.getElementById('closeModalFooterBtn');
        this.openInBrowserBtn = document.getElementById('openInBrowserBtn');

        // События
        this.sendBtn.addEventListener('click', () => this.handleUserMessage());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserMessage();
            }
        });
        
        this.searchToggleBtn.addEventListener('click', () => this.toggleSearchMode());
        if (this.voiceBtn) {
            this.voiceBtn.addEventListener('click', () => this.toggleVoiceRecording());
        }
        
        // Закрытие модального окна
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.closeModalFooterBtn.addEventListener('click', () => this.closeModal());
        
        // ========== ОТКРЫТИЕ В БРАУЗЕРЕ (ИСПРАВЛЕНО) ==========
        this.openInBrowserBtn.addEventListener('click', () => {
            // Сначала пробуем currentUrl (сохраняем при открытии)
            if (this.currentUrl && this.currentUrl !== 'about:blank') {
                window.open(this.currentUrl, '_blank');
            } 
            // Если нет, берем URL из iframe
            else if (this.webviewFrame && this.webviewFrame.src) {
                const iframeUrl = this.webviewFrame.src;
                if (iframeUrl && iframeUrl !== 'about:blank' && !iframeUrl.includes('about:blank')) {
                    window.open(iframeUrl, '_blank');
                } else {
                    this.addBotMessage("😕 Не могу открыть ссылку, братан! Попробуй ещё раз.");
                }
            } else {
                this.addBotMessage("😕 Не могу открыть ссылку, братан! Попробуй ещё раз.");
            }
        });
        
        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.closeModal();
            }
        });
        
        this.userInput.focus();
        
        // Приветствие
        this.addBotMessage(this.getGreetingMessage());
    }
    
    getGreetingMessage() {
        if (this.gender === 'male') {
            return "Привет, братан! 🤜🤛 Я " + this.name + " — твой бро-помощник.\n\n🔥 **Что я умею:**\n• 🎤 Голосовые сообщения — нажми микрофон и говори\n• 📐 Решать примеры — например: 2+2, 10*5, 100/4\n• 🌐 Искать в интернете — скажи \"найди\"\n• 🖼️ Отправлять фото — скажи \"скинь фото кевы\"\n• 🚀 Открывать сервисы — скажи \"погода\" или \"музыка\"\n\nПопробуй что-нибудь спросить!";
        } else {
            return "Привет! 🌸 Я " + this.name + " — твой виртуальный помощник.\n\n✨ **Что я умею:**\n• 🎤 Голосовые сообщения — нажми микрофон\n• 📐 Решать примеры — например: 2+2\n• 🌐 Искать в интернете — скажи \"найди\"\n• 🖼️ Отправлять фото — скажи \"скинь фото\"\n• 🚀 Открывать сервисы — скажи \"погода\" или \"музыка\"\n\nСпрашивай что угодно!";
        }
    }
    
    // ========== МЕТОДЫ ДЛЯ РАСШИРЕНИЯ ==========
    
    // Голосовая запись
    toggleVoiceRecording() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.addBotMessage("😕 Твой браузер не поддерживает голосовой ввод. Попробуй Chrome или Safari на телефоне!");
            return;
        }
        
        if (this.isRecording) {
            this.stopVoiceRecording();
        } else {
            this.startVoiceRecording();
        }
    }
    
    startVoiceRecording() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'ru-RU';
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;
        
        this.recognition.onstart = () => {
            this.isRecording = true;
            if (this.voiceBtn) this.voiceBtn.classList.add('recording');
            this.updateStatus("🎤 Слушаю... говори");
            this.addBotMessage("🎤 **Слушаю...** Говори!");
            this.scrollToBottom();
        };
        
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.userInput.value = transcript;
            this.updateStatus("🎤 Распознано: " + transcript);
            this.stopVoiceRecording();
            setTimeout(() => {
                this.handleUserMessage();
            }, 300);
        };
        
        this.recognition.onerror = (event) => {
            console.error('Ошибка распознавания:', event.error);
            this.updateStatus("🎤 Ошибка распознавания");
            this.addBotMessage("😕 Не расслышал! Попробуй ещё раз или напиши текстом.");
            this.stopVoiceRecording();
        };
        
        this.recognition.onend = () => {
            this.stopVoiceRecording();
        };
        
        this.recognition.start();
    }
    
    stopVoiceRecording() {
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch(e) {}
            this.recognition = null;
        }
        this.isRecording = false;
        if (this.voiceBtn) this.voiceBtn.classList.remove('recording');
        this.updateStatus("Онлайн • Готов к диалогу");
    }
    
    // Поисковый режим
    toggleSearchMode() {
        this.searchMode = !this.searchMode;
        if (this.searchMode) {
            this.searchToggleBtn.classList.add('active');
            this.userInput.placeholder = "🔍 Введи запрос для поиска в интернете...";
            this.addBotMessage("🌐 Режим поиска включен! Просто напиши, что хочешь найти!");
        } else {
            this.searchToggleBtn.classList.remove('active');
            this.userInput.placeholder = "Спроси меня или попроси найти в интернете...";
            this.addBotMessage("💬 Режим поиска выключен. Чтобы найти в интернете — нажми 🌐 или скажи \"найди\"");
        }
        this.userInput.focus();
    }
    
    // Открытие ссылок в модальном окне
    openInWebview(url, title = 'Просмотр сайта') {
        this.currentUrl = url;  // Сохраняем URL для кнопки "Открыть в браузере"
        if (this.modalTitle) this.modalTitle.textContent = title;
        
        // Просто открываем напрямую в iframe
        this.webviewFrame.src = url;
        
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    closeModal() {
        this.modal.style.display = 'none';
        this.webviewFrame.src = 'about:blank';
        this.currentUrl = '';
        document.body.style.overflow = '';
    }
// ============================================
// КЕВА AI - ЯДРО И НАСТРОЙКИ (ЧАСТЬ 2)
// ============================================

    // ========== UI МЕТОДЫ ==========
    addUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user';
        messageDiv.innerHTML = `<div class="message-content">${this.escapeHtml(text)}</div>`;
        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    addBotMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        
        let formattedText = this.escapeHtml(text);
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedText = formattedText.replace(/(https?:\/\/[^\s]+)/g, (url) => {
            const shortUrl = url.length > 50 ? url.substring(0, 47) + '...' : url;
            return `<a href="#" data-url="${url}" class="modal-link" style="color: #60a5fa; text-decoration: underline; word-break: break-all; display: inline-block; margin: 4px 0; padding: 6px 12px; background: rgba(96, 165, 250, 0.1); border-radius: 12px;">🔗 ${shortUrl}</a>`;
        });
        formattedText = formattedText.replace(/\n/g, '<br>');
        
        messageDiv.innerHTML = `<div class="message-content">${formattedText}</div>`;
        this.chatContainer.appendChild(messageDiv);
        
        // Обработчики для ссылок
        const modalLinks = messageDiv.querySelectorAll('.modal-link');
        modalLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const url = link.getAttribute('data-url');
                if (url) {
                    let title = 'Просмотр сайта';
                    if (url.includes('google.com')) title = 'Google Поиск';
                    else if (url.includes('yandex.ru')) title = 'Яндекс Поиск';
                    else if (url.includes('duckduckgo.com')) title = 'DuckDuckGo Поиск';
                    this.openInWebview(url, title);
                }
            });
        });
        
        this.scrollToBottom();
    }
    
    showTypingIndicator() {
        this.typingDiv = document.createElement('div');
        this.typingDiv.className = 'message bot';
        this.typingDiv.id = 'typingIndicator';
        this.typingDiv.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
        this.chatContainer.appendChild(this.typingDiv);
        this.scrollToBottom();
    }
    
    removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        }, 100);
    }
    
    updateStatus(text) {
        if (this.statusText) this.statusText.textContent = text;
    }
    
    escapeHtml(str) {
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
    
    // ========== МЕТОД ДЛЯ ОТВЕТОВ (ПЕРЕОПРЕДЕЛЯЕТСЯ В МОДУЛЯХ) ==========
    getAIResponse(question) {
        // Этот метод будет переопределен в модулях
        // Базовая реализация
        return this.getDefaultResponse(question);
    }
    
    getDefaultResponse(question) {
        const q = question.toLowerCase().trim();
        
        if (q.match(/привет|здравствуй|хай|hello|hi|ку|даров/i)) {
            return this.gender === 'male' ? 
                "Здарова, братан! 🤜🤛 Чё хотел спросить?" : 
                "Привет! 🌸 Чем могу помочь?";
        }
        
        if (q.match(/как дела|как ты|как жизнь/i)) {
            return this.gender === 'male' ?
                "Да норм, братан! Работаю, помогаю людям. А у тебя как? 👊" :
                "Всё отлично! Спасибо что спрашиваешь 🌸 А у тебя как?";
        }
        
        if (q.match(/время|часы|сколько времени|который час/i)) {
            const now = new Date();
            return `Сейчас ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}. ⏰`;
        }
        
        if (q.match(/дата|какое сегодня число|день недели/i)) {
            const now = new Date();
            return `Сегодня ${now.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}. 📅`;
        }
        
        if (q.length < 4) {
            return "Напиши подробнее, братан! Или нажми микрофон 🎤, чтобы сказать голосом!";
        }
        
        return "Интересный вопрос! 🤔 Если хочешь найти точную информацию — скажи \"найди\" или нажми микрофон 🎤";
    }
    
    // ========== ОСНОВНОЙ МЕТОД ОБРАБОТКИ СООБЩЕНИЙ ==========
    async handleUserMessage() {
        const text = this.userInput.value.trim();
        if (!text || this.isThinking) return;
        
        this.addUserMessage(text);
        this.userInput.value = '';
        this.userInput.style.height = 'auto';
        
        this.showTypingIndicator();
        this.isThinking = true;
        
        // Проверка на математику
        const mathResult = this.solveMath ? this.solveMath(text) : null;
        if (mathResult) {
            this.updateStatus("Решаю пример... 📐");
            setTimeout(() => {
                this.removeTypingIndicator();
                this.addBotMessage(mathResult.formatted);
                this.updateStatus("Онлайн • Готов к диалогу");
                this.isThinking = false;
                this.scrollToBottom();
            }, 300);
            return;
        }
        
        // Проверка на поиск
        const needSearch = this.searchMode || (this.isSearchRequest && this.isSearchRequest(text));
        
        if (needSearch && this.getSearchLinks) {
            this.updateStatus("Готовлю ссылки для поиска... 🌐");
            setTimeout(() => {
                const searchResults = this.getSearchLinks(text);
                this.removeTypingIndicator();
                this.addBotMessage(searchResults);
                this.updateStatus("Онлайн • Готов помочь");
                this.isThinking = false;
                this.scrollToBottom();
            }, 300);
            return;
        }
        
        // Обычный ответ
        this.updateStatus("Думаю... 🧠");
        setTimeout(() => {
            const reply = this.getAIResponse(text);
            this.removeTypingIndicator();
            this.addBotMessage(reply);
            this.updateStatus("Онлайн • Готов к диалогу");
            this.isThinking = false;
            this.scrollToBottom();
        }, 300);
    }
}

// Запускаем Кеву
document.addEventListener('DOMContentLoaded', () => {
    window.keva = new KevaAI();
    
    const textarea = document.getElementById('userInput');
    if (textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 100) + 'px';
        });
    }
});