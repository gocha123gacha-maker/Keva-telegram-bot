// ============================================
// КЕВА AI - ОТПРАВКА ФОТОГРАФИЙ (АВТОПОИСК ФАЙЛА)
// ============================================

// Команды и имена файлов (БЕЗ расширения)
const photoCommands = {
    // КЕВА
    "скинь фото кевы": "кева",
    "покажи кеву": "кева",
    "фото кевы": "кева",
    
    // ПРИРОДА
    "скинь фото природы": "природа",
    "покажи природу": "природа",
    "фото природы": "природа",
    
    // МАЙН (1-7)
    "майн 1": "майн 1",
    "майн 2": "майн 2",
    "майн 3": "майн 3",
    "майн 4": "майн 4",
    "майн 5": "майн 5",
    "майн 6": "майн 6",
    "майн 7": "майн 7",
    
    // 99 НОЧЕЙ (1-10)
    "99 ночей 1": "99 ночей 1",
    "99 ночей 2": "99 ночей 2",
    "99 ночей 3": "99 ночей 3",
    "99 ночей 4": "99 ночей 4",
    "99 ночей 5": "99 ночей 5",
    "99 ночей 6": "99 ночей 6",
    "99 ночей 7": "99 ночей 7",
    "99 ночей 8": "99 ночей 8",
    "99 ночей 9": "99 ночей 9",
    "99 ночей 10": "99 ночей 10",
    
    // КОТИКИ
    "смешной кошак": "смешной кошак",
    "кошка в шапке": "кошка в шапке",
    "котики на диване": "котятки",
    "котятки": "котятки",
    "чебукошка": "чебукошка",
    "два кота": "два кота",
    "кототка": "шутка кота",
    "котик": "кот",
    "кот": "кот"
};

// Все возможные расширения
const supportedFormats = ['png', 'jpg', 'jpeg', 'webp', 'PNG', 'JPG', 'JPEG', 'WEBP'];

// Кэш для найденных файлов (чтобы не искать каждый раз)
const foundFilesCache = {};

// Функция реальной проверки существования файла
function fileExists(url, callback) {
    const img = new Image();
    img.onload = function() { callback(true); };
    img.onerror = function() { callback(false); };
    img.src = url;
}

// Функция поиска фото (асинхронно пробует все расширения)
function findPhotoFile(photoNameWithoutExt, callback) {
    // Если уже нашли в кэше
    if (foundFilesCache[photoNameWithoutExt]) {
        callback(foundFilesCache[photoNameWithoutExt]);
        return;
    }
    
    let currentIndex = 0;
    
    function tryNextFormat() {
        if (currentIndex >= supportedFormats.length) {
            // Все форматы попробовали, не нашли
            callback(null);
            return;
        }
        
        const format = supportedFormats[currentIndex];
        const testPath = `photo/${photoNameWithoutExt}.${format}`;
        currentIndex++;
        
        console.log(`🔍 Пробую: ${testPath}`);
        
        const img = new Image();
        img.onload = function() {
            // Нашли!
            console.log(`✅ Найдено: ${testPath}`);
            foundFilesCache[photoNameWithoutExt] = testPath;
            callback(testPath);
        };
        img.onerror = function() {
            // Не нашли, пробуем следующий формат
            tryNextFormat();
        };
        img.src = testPath;
    }
    
    tryNextFormat();
}

// Функция отправки фото
function sendPhoto(photoNameWithoutExt, commandName) {
    if (!window.keva) {
        console.log('❌ Кева не найден');
        return false;
    }
    
    console.log(`📸 Ищем фото для "${commandName}" → имя: ${photoNameWithoutExt}`);
    
    findPhotoFile(photoNameWithoutExt, function(photoPath) {
        if (!photoPath) {
            console.log(`❌ Фото не найдено: ${photoNameWithoutExt}`);
            window.keva.addBotMessage(`😕 Не нашёл фото "${commandName}", братан!\n\n📁 Проверь, что файл лежит в папке /photo/\n📸 Имя файла должно быть: ${photoNameWithoutExt}.png или .jpg или .jpeg или .webp`);
            return;
        }
        
        console.log(`📸 Отправляю фото: ${photoPath}`);
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        messageDiv.innerHTML = `
            <div class="message-content">
                📸 <strong>Вот фото по твоему запросу:</strong><br><br>
                <img src="${photoPath}" alt="${commandName}" style="max-width: 100%; border-radius: 16px; margin-top: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); cursor: pointer;" onclick="window.open('${photoPath}', '_blank')">
                <br><br>
                <span style="font-size: 0.8rem; color: #8b5cf6;">💡 Нажми на фото, чтобы открыть в полный размер</span>
            </div>
        `;
        
        window.keva.chatContainer.appendChild(messageDiv);
        window.keva.scrollToBottom();
    });
    
    return true;
}

// Функция проверки запроса на фото
function checkForPhoto(question) {
    const lowerQuestion = question.toLowerCase().trim();
    
    for (let [command, photoName] of Object.entries(photoCommands)) {
        if (lowerQuestion.includes(command.toLowerCase())) {
            console.log(`✅ Найдена команда: "${command}" → ищем файл: ${photoName}`);
            return { photoName, commandName: command };
        }
    }
    return null;
}

// Подключаем к Кеве
function initPhotoModule() {
    let attempts = 0;
    const interval = setInterval(function() {
        attempts++;
        
        if (window.keva) {
            clearInterval(interval);
            console.log('✅ Фото-модуль подключен!');
            console.log('📸 Доступные команды: майн 1-7, 99 ночей 1-10, смешной кошак, кошка в шапке, котятки, чебукошка, два кота, шутка кота');
            console.log('📸 Поддерживаемые форматы: png, jpg, jpeg, webp');
            
            const originalGetResponse = window.keva.getAIResponse;
            
            window.keva.getAIResponse = function(question) {
                const photoData = checkForPhoto(question);
                
                if (photoData) {
                    sendPhoto(photoData.photoName, photoData.commandName);
                    return "🔍 Ищу фото, братан! 📸";
                }
                
                return originalGetResponse.call(this, question);
            };
            
            console.log('✅ Кева теперь умеет отправлять фото!');
            
        } else if (attempts > 30) {
            clearInterval(interval);
            console.log('❌ Кева не найден');
        }
    }, 200);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('📸 Загружаем фото-модуль...');
    initPhotoModule();
});