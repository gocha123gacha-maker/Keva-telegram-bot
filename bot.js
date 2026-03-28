// ============================================
// КЕВА AI - TELEGRAM БОТ (ИСПОЛЬЗУЕТ ВСЕ ТВОИ ФАЙЛЫ)
// ============================================

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

// ========== НАСТРОЙКИ ==========
const TOKEN = process.env.TELEGRAM_TOKEN || '8713078723:AAHsX3ls0HLyAlAPWje7jZQHz9g3I7kfF6Y';
const bot = new TelegramBot(TOKEN, { polling: true });

console.log('🤖 Кева AI запущен!');
console.log('📁 Текущая папка:', __dirname);

// ========== 1. ПОДКЛЮЧАЕМ ВСЕ ФАЙЛЫ С ВОПРОСАМИ (keva1.js - keva13.js) ==========
const questionsFolder = path.join(__dirname, 'questions-answers');
let allResponses = [];

function loadAllQuestions() {
    if (!fs.existsSync(questionsFolder)) {
        console.log('❌ Папка questions-answers не найдена!');
        return;
    }
    
    const files = fs.readdirSync(questionsFolder).filter(f => f.startsWith('keva') && f.endsWith('.js'));
    console.log(`📁 Найдено файлов с вопросами: ${files.length}`);
    
    for (let file of files) {
        try {
            const filePath = path.join(questionsFolder, file);
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Извлекаем массив kevaResponses или kevaAllResponses
            let responses = [];
            
            // Пробуем найти kevaAllResponses
            const allMatch = content.match(/kevaAllResponses\s*=\s*(\[[\s\S]*?\]);/);
            if (allMatch) {
                try {
                    responses = eval(`(${allMatch[1]})`);
                } catch(e) {}
            }
            
            // Пробуем найти kevaResponses
            const respMatch = content.match(/kevaResponses\s*=\s*(\[[\s\S]*?\]);/);
            if (respMatch && responses.length === 0) {
                try {
                    responses = eval(`(${respMatch[1]})`);
                } catch(e) {}
            }
            
            // Пробуем найти kevaPart
            const partMatch = content.match(/kevaPart\d+\s*=\s*(\[[\s\S]*?\]);/);
            if (partMatch && responses.length === 0) {
                try {
                    responses = eval(`(${partMatch[1]})`);
                } catch(e) {}
            }
            
            if (responses.length > 0) {
                allResponses.push(...responses);
                console.log(`✅ Загружен ${file}: ${responses.length} ответов`);
            } else {
                console.log(`⚠️ В ${file} не найдено ответов`);
            }
        } catch(e) {
            console.log(`❌ Ошибка при загрузке ${file}:`, e.message);
        }
    }
    
    console.log(`📚 ВСЕГО ЗАГРУЖЕНО: ${allResponses.length} ответов!`);
}

loadAllQuestions();

// Функция поиска ответа
function findAnswer(question) {
    const lowerQuestion = question.toLowerCase();
    for (let item of allResponses) {
        if (item.keywords) {
            for (let keyword of item.keywords) {
                if (lowerQuestion.includes(keyword.toLowerCase())) {
                    return item.answer;
                }
            }
        }
    }
    return null;
}

// ========== 2. ПОДКЛЮЧАЕМ ФОТО МОДУЛЬ (photo.js) ==========
const photoFolder = path.join(__dirname, 'photo');
const formats = ['png', 'jpg', 'jpeg', 'webp', 'PNG', 'JPG', 'JPEG', 'WEBP'];

// Загружаем команды из photo.js
let photoCommands = {};
try {
    const photoJsPath = path.join(__dirname, 'photo.js');
    const photoContent = fs.readFileSync(photoJsPath, 'utf8');
    
    // Ищем массив photoCommands
    const match = photoContent.match(/const\s+photoCommands\s*=\s*\{([\s\S]*?)\};/);
    if (match) {
        const commandsStr = match[1];
        const lines = commandsStr.split('\n');
        for (let line of lines) {
            const cmdMatch = line.match(/"([^"]+)":\s*"([^"]+)"/);
            if (cmdMatch) {
                photoCommands[cmdMatch[1]] = cmdMatch[2];
            }
        }
    }
    console.log(`✅ Загружен фото-модуль: ${Object.keys(photoCommands).length} команд`);
} catch(e) {
    console.log('⚠️ Не удалось загрузить photo.js:', e.message);
}

function findPhoto(photoName) {
    for (let format of formats) {
        const filePath = path.join(photoFolder, `${photoName}.${format}`);
        if (fs.existsSync(filePath)) {
            return filePath;
        }
    }
    return null;
}

function handlePhoto(question) {
    const lower = question.toLowerCase();
    for (let [command, fileName] of Object.entries(photoCommands)) {
        if (lower.includes(command.toLowerCase())) {
            const photoPath = findPhoto(fileName);
            if (photoPath) {
                return { found: true, path: photoPath, name: command };
            }
            return { found: false, name: command, fileName: fileName };
        }
    }
    return null;
}

// ========== 3. ПОДКЛЮЧАЕМ СЕРВИСЫ (services.js) ==========
let servicesList = [];
try {
    const servicesPath = path.join(__dirname, 'services.js');
    const servicesContent = fs.readFileSync(servicesPath, 'utf8');
    
    const match = servicesContent.match(/const services = \[([\s\S]*?)\];/);
    if (match) {
        const servicesText = match[1];
        const serviceMatches = servicesText.match(/\{\s*keywords:\s*\[([^\]]+)\],\s*url:\s*"([^"]+)"/g);
        if (serviceMatches) {
            for (let sm of serviceMatches) {
                const kwMatch = sm.match(/keywords:\s*\[([^\]]+)\]/);
                const urlMatch = sm.match(/url:\s*"([^"]+)"/);
                if (kwMatch && urlMatch) {
                    const keywords = kwMatch[1].replace(/['"]/g, '').split(',').map(k => k.trim());
                    servicesList.push({ keywords, url: urlMatch[1] });
                }
            }
        }
    }
    console.log(`✅ Загружен сервис-модуль: ${servicesList.length} сервисов`);
} catch(e) {
    console.log('⚠️ Не удалось загрузить services.js:', e.message);
}

function handleService(question) {
    const lower = question.toLowerCase();
    
    // Погода с городом
    if (lower.includes("погода")) {
        const cityMatch = question.match(/погода\s+в\s+([а-яё\s\-]+)/i);
        if (cityMatch) {
            const city = cityMatch[1].trim();
            return `🌤️ Погода в ${city}: https://www.gismeteo.ru/search/${encodeURIComponent(city)}/`;
        }
        return "🌤️ Погода: https://www.gismeteo.ru/";
    }
    
    // Другие сервисы
    if (lower.includes("музыка")) return "🎵 Слушай музыку: https://www.drivemusic.ru/";
    if (lower.includes("видео")) return "🎬 Смотри видео: https://rutube.ru/";
    if (lower.includes("новости")) return "📰 Новости: https://lenta.ru/";
    if (lower.includes("кино")) return "🎬 Кино: https://www.kinopoisk.ru/";
    if (lower.includes("котики")) return "🐱 Котики: https://yandex.ru/images/search?text=котики";
    if (lower.includes("мемы")) return "😂 Мемы: https://yandex.ru/images/search?text=мемы";
    
    return null;
}

// ========== 4. МАТЕМАТИКА ==========
function solveMath(expression) {
    let expr = expression.replace(/\s/g, '');
    const mathRegex = /^[\d\s\+\-\*\/\(\)\.%]+$/;
    if (!mathRegex.test(expr)) return null;
    expr = expr.replace(/×/g, '*').replace(/÷/g, '/');
    try {
        const result = new Function('return ' + expr)();
        if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
            const rounded = Math.round(result * 1000000) / 1000000;
            return `📐 ${expression} = ${rounded}`;
        }
    } catch(e) {}
    return null;
}

// ========== 5. ПОИСК В ИНТЕРНЕТЕ ==========
function getSearchLinks(query) {
    let searchQuery = query.replace(/найди|поищи|найти/gi, '').trim();
    if (searchQuery.length < 2) {
        return "Напиши, что именно найти, братан! Например: 'найди рецепт пиццы'";
    }
    const encodedQuery = encodeURIComponent(searchQuery);
    return `🔍 Поиск: "${searchQuery}"\n\n🔗 Google: https://www.google.com/search?q=${encodedQuery}\n🔗 Яндекс: https://yandex.ru/search/?text=${encodedQuery}\n🔗 DuckDuckGo: https://duckduckgo.com/?q=${encodedQuery}`;
}

// ========== 6. ЗАПУСК БОТА ==========
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Здарова, братан! 🤜🤛 Я Кева AI — твой бро-помощник!

📌 Что я умею:
• 📝 Отвечать на вопросы (${allResponses.length}+ ответов)
• 📐 Решать примеры: 2+2, 10*5
• 🌐 Искать в интернете: "найди рецепт пиццы"
• 🚀 Открывать сервисы: погода, музыка, видео, кино
• 🖼️ Отправлять фото: смешной кошак, майн 3, 99 ночей 1

Попробуй что-нибудь спросить!`);
});

bot.onText(/.+/, async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const userName = msg.from.first_name;
    
    console.log(`📩 ${userName}: ${text}`);
    
    // 1. Фото
    const photoResult = handlePhoto(text);
    if (photoResult) {
        if (photoResult.found) {
            await bot.sendPhoto(chatId, photoResult.path, { caption: `📸 ${photoResult.name} — держи, братан!` });
            return;
        } else {
            bot.sendMessage(chatId, `😕 Не нашёл фото "${photoResult.name}", братан!\n📁 Имя файла должно быть: ${photoResult.fileName}.png или .jpg`);
            return;
        }
    }
    
    // 2. Математика
    const mathResult = solveMath(text);
    if (mathResult) {
        bot.sendMessage(chatId, mathResult);
        return;
    }
    
    // 3. Поиск в интернете
    if (text.toLowerCase().includes("найди") || text.toLowerCase().includes("поищи")) {
        const searchResult = getSearchLinks(text);
        bot.sendMessage(chatId, searchResult);
        return;
    }
    
    // 4. Сервисы
    const serviceResult = handleService(text);
    if (serviceResult) {
        bot.sendMessage(chatId, serviceResult);
        return;
    }
    
    // 5. Ответ из базы
    const answer = findAnswer(text);
    if (answer) {
        bot.sendMessage(chatId, answer);
        return;
    }
    
    // 6. Стандартный ответ
    bot.sendMessage(chatId, "Интересный вопрос, братан! 🤔 Скажи \"найди\" и я помогу найти в интернете!");
});

console.log('✅ Кева AI готов к работе!');
console.log('📸 Доступно фото-команд:', Object.keys(photoCommands).length);
console.log('🎯 Доступно сервисов:', servicesList.length);