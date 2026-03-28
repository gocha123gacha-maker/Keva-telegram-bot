// ============================================
// КЕВА AI - СЕРВИСЫ С ПОИСКОВЫМИ СИСТЕМАМИ
// ============================================

// Список сервисов
const services = [
    // Погода (Gismeteo с поиском по городу)
    {
        keywords: ["погода", "какая погода", "погода сегодня", "прогноз погоды", "температура"],
        url: "https://www.gismeteo.ru/",
        searchUrl: "https://www.gismeteo.ru/search/",
        title: "Погода на Gismeteo",
        emoji: "🌤️",
        needCity: true
    },
    
    // Музыка (DriveMusic)
    {
        keywords: ["музыка", "послушать музыку", "включи музыку", "песни", "плейлист", "треки"],
        url: "https://www.drivemusic.ru/",
        searchUrl: "https://www.drivemusic.ru/search/?q=",
        title: "DriveMusic",
        emoji: "🎵",
        needCity: false
    },
    
    // Видео (Rutube с поиском)
    {
        keywords: ["видео", "посмотреть видео", "видео онлайн", "клипы", "ролики", "ютуб"],
        url: "https://rutube.ru/",
        searchUrl: "https://rutube.ru/search/?query=",
        title: "Rutube - Видео",
        emoji: "🎬",
        needCity: false
    },
    
    // Котики (Pinterest)
    {
        keywords: ["котики", "коты", "фото котиков", "милые котики", "кошки", "котятки"],
        url: "https://www.pinterest.com/",
        searchUrl: "https://www.pinterest.com/search/pins/?q=котики",
        title: "Котики на Pinterest",
        emoji: "🐱",
        needCity: false,
        fixedSearch: "котики"
    },
    
    // Собаки (Pinterest)
    {
        keywords: ["собаки", "собачки", "фото собак", "милые собаки", "щенки"],
        url: "https://www.pinterest.com/",
        searchUrl: "https://www.pinterest.com/search/pins/?q=собаки",
        title: "Собаки на Pinterest",
        emoji: "🐕",
        needCity: false,
        fixedSearch: "собаки"
    },
    
    // Природа (Pinterest)
    {
        keywords: ["природа", "пейзажи", "фото природы", "лес", "горы", "море", "озеро"],
        url: "https://www.pinterest.com/",
        searchUrl: "https://www.pinterest.com/search/pins/?q=природа",
        title: "Природа на Pinterest",
        emoji: "🌿",
        needCity: false,
        fixedSearch: "природа"
    },
    
    // Мемы (Pinterest)
    {
        keywords: ["мемы", "смешное", "приколы", "юмор", "ржака"],
        url: "https://www.pinterest.com/",
        searchUrl: "https://www.pinterest.com/search/pins/?q=мемы",
        title: "Мемы на Pinterest",
        emoji: "😂",
        needCity: false,
        fixedSearch: "мемы"
    },
    
    // Еда (Pinterest)
    {
        keywords: ["еда", "рецепты", "приготовить", "блюда", "кулинария", "вкусно"],
        url: "https://www.pinterest.com/",
        searchUrl: "https://www.pinterest.com/search/pins/?q=рецепты",
        title: "Рецепты на Pinterest",
        emoji: "🍕",
        needCity: false,
        fixedSearch: "рецепты"
    },
    
    // Игры (Pinterest)
    {
        keywords: ["игры", "поиграть", "игровые", "гейминг", "компьютерные игры"],
        url: "https://www.pinterest.com/",
        searchUrl: "https://www.pinterest.com/search/pins/?q=игры",
        title: "Игры на Pinterest",
        emoji: "🎮",
        needCity: false,
        fixedSearch: "игры"
    },
    
    // Новости (Lenta.ru)
    {
        keywords: ["новости", "последние новости", "что нового", "события"],
        url: "https://lenta.ru/",
        searchUrl: "https://lenta.ru/search/?q=",
        title: "Lenta.ru - Новости",
        emoji: "📰",
        needCity: false
    },
    
    // Кино (Кинопоиск)
    {
        keywords: ["кино", "фильмы", "посмотреть фильм", "кинотеатр", "сериалы"],
        url: "https://www.kinopoisk.ru/",
        searchUrl: "https://www.kinopoisk.ru/search/?q=",
        title: "Кинопоиск",
        emoji: "🎬",
        needCity: false
    },
    
    // Аниме (Pinterest)
    {
        keywords: ["аниме", "аниме картинки", "аниме фото", "anime"],
        url: "https://www.pinterest.com/",
        searchUrl: "https://www.pinterest.com/search/pins/?q=аниме",
        title: "Аниме на Pinterest",
        emoji: "🎌",
        needCity: false,
        fixedSearch: "аниме"
    },
    
    // Авто (Pinterest)
    {
        keywords: ["авто", "машины", "автомобили", "тачки"],
        url: "https://www.pinterest.com/",
        searchUrl: "https://www.pinterest.com/search/pins/?q=автомобили",
        title: "Автомобили на Pinterest",
        emoji: "🚗",
        needCity: false,
        fixedSearch: "автомобили"
    }
];

// Функция извлечения города
function extractCity(query) {
    const patterns = [
        /погода\s+в\s+([а-яё\s\-]+)/i,
        /какая погода\s+в\s+([а-яё\s\-]+)/i,
        /погода\s+([а-яё\s\-]+)/i,
        /в\s+([а-яё\s\-]+)\s+погода/i
    ];
    
    for (let pattern of patterns) {
        const match = query.match(pattern);
        if (match && match[1]) {
            let city = match[1].trim();
            city = city.replace(/сегодня|завтра/gi, '').trim();
            if (city.length > 0 && city.length < 50) {
                return city;
            }
        }
    }
    return null;
}

// Функция извлечения поискового запроса
function extractSearchQuery(query, keywords) {
    let searchTerm = query;
    for (let keyword of keywords) {
        searchTerm = searchTerm.replace(new RegExp(keyword, 'gi'), '');
    }
    searchTerm = searchTerm.replace(/пожалуйста/gi, '').trim();
    
    if (searchTerm.length > 0 && searchTerm.length < 100) {
        return searchTerm;
    }
    return null;
}

// Функция поиска сервиса
function findService(query) {
    const lowerQuery = query.toLowerCase();
    
    for (let service of services) {
        for (let keyword of service.keywords) {
            if (lowerQuery.includes(keyword)) {
                return service;
            }
        }
    }
    return null;
}

// Функция получения URL
function getServiceUrl(service, query) {
    // Погода с городом
    if (service.needCity && service.keywords[0] === "погода") {
        const city = extractCity(query);
        if (city) {
            return `${service.searchUrl}${encodeURIComponent(city)}/`;
        }
        return service.url;
    }
    
    // Видео с поиском
    if (service.keywords[0] === "видео" && service.searchUrl) {
        const searchTerm = extractSearchQuery(query, service.keywords);
        if (searchTerm) {
            return `${service.searchUrl}${encodeURIComponent(searchTerm)}`;
        }
        return service.url;
    }
    
    // Музыка с поиском
    if (service.keywords[0] === "музыка" && service.searchUrl) {
        const searchTerm = extractSearchQuery(query, service.keywords);
        if (searchTerm) {
            return `${service.searchUrl}${encodeURIComponent(searchTerm)}`;
        }
        return service.url;
    }
    
    // Новости с поиском
    if (service.keywords[0] === "новости" && service.searchUrl) {
        const searchTerm = extractSearchQuery(query, service.keywords);
        if (searchTerm) {
            return `${service.searchUrl}${encodeURIComponent(searchTerm)}`;
        }
        return service.url;
    }
    
    // Кино с поиском
    if (service.keywords[0] === "кино" && service.searchUrl) {
        const searchTerm = extractSearchQuery(query, service.keywords);
        if (searchTerm) {
            return `${service.searchUrl}${encodeURIComponent(searchTerm)}`;
        }
        return service.url;
    }
    
    // Pinterest с фиксированным поиском
    if (service.fixedSearch) {
        return service.searchUrl;
    }
    
    return service.url;
}

// Функция открытия в модальном окне (с проверкой)
function openInModal(url, title) {
    console.log('📱 Пытаюсь открыть модальное окно:', url);
    
    // Ищем элементы модального окна
    const modal = document.getElementById('webviewModal');
    const iframe = document.getElementById('webviewFrame');
    const modalTitle = document.getElementById('modalTitle');
    
    // Проверяем, существует ли модальное окно
    if (!modal) {
        console.log('❌ Модальное окно не найдено! Проверь index.html');
        window.open(url, '_blank');
        return false;
    }
    
    if (!iframe) {
        console.log('❌ Iframe не найден!');
        window.open(url, '_blank');
        return false;
    }
    
    // Устанавливаем заголовок
    if (modalTitle) {
        modalTitle.textContent = title;
    }
    
    // Загружаем URL в iframe
    iframe.src = url;
    
    // Показываем модальное окно
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    console.log('✅ Модальное окно открыто!');
    return true;
}

// Основная функция обработки запроса
function handleServiceRequest(question) {
    console.log('🔍 Проверяю запрос:', question);
    
    const service = findService(question);
    
    if (service) {
        console.log('✅ Найден сервис:', service.title);
        
        const url = getServiceUrl(service, question);
        let title = `${service.emoji} ${service.title}`;
        
        // Для погоды с городом
        if (service.keywords[0] === "погода") {
            const city = extractCity(question);
            if (city) {
                title = `${service.emoji} Погода в ${city}`;
            }
        }
        
        // Для видео с поиском
        if (service.keywords[0] === "видео") {
            const searchTerm = extractSearchQuery(question, service.keywords);
            if (searchTerm) {
                title = `${service.emoji} Видео - ${searchTerm}`;
            }
        }
        
        // Для музыки с поиском
        if (service.keywords[0] === "музыка") {
            const searchTerm = extractSearchQuery(question, service.keywords);
            if (searchTerm) {
                title = `${service.emoji} Музыка - ${searchTerm}`;
            }
        }
        
        // Открываем в модальном окне
        openInModal(url, title);
        
        // Возвращаем ответ
        if (service.keywords[0] === "погода") {
            const city = extractCity(question);
            if (city) {
                return `🔍 Открываю погоду в ${city}, братан! 🌤️`;
            }
        }
        
        if (service.keywords[0] === "видео") {
            const searchTerm = extractSearchQuery(question, service.keywords);
            if (searchTerm) {
                return `🔍 Ищу видео "${searchTerm}" на Rutube, братан! 🎬`;
            }
            return `🔍 Открываю Rutube, братан! 🎬`;
        }
        
        if (service.keywords[0] === "музыка") {
            const searchTerm = extractSearchQuery(question, service.keywords);
            if (searchTerm) {
                return `🔍 Ищу музыку "${searchTerm}" на DriveMusic, братан! 🎵`;
            }
            return `🔍 Открываю DriveMusic, братан! 🎵`;
        }
        
        return `🔍 Открываю ${service.title}, братан! ${service.emoji}`;
    }
    
    console.log('❌ Сервис не найден');
    return null;
}

// Подключаем к Кеве
function initServicesModule() {
    let attempts = 0;
    
    const interval = setInterval(function() {
        attempts++;
        
        if (window.keva) {
            clearInterval(interval);
            console.log('✅ Сервис-модуль подключен!');
            console.log('📋 Доступные сервисы:', services.map(s => s.keywords[0]).join(', '));
            
            // Сохраняем оригинальную функцию
            const original = window.keva.getAIResponse;
            
            // Переопределяем
            window.keva.getAIResponse = function(question) {
                const serviceResult = handleServiceRequest(question);
                if (serviceResult) {
                    return serviceResult;
                }
                return original.call(this, question);
            };
            
            console.log('✅ Кева теперь открывает сервисы!');
            console.log('🌤️ Пример: "погода в Москве"');
            console.log('🎬 Пример: "видео" или "видео котики"');
            console.log('🎵 Пример: "музыка" или "музыка рок"');
            
        } else if (attempts > 30) {
            clearInterval(interval);
            console.log('❌ Кева не найден!');
        }
    }, 200);
}

// Запускаем
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Загружаем сервис-модуль...');
    initServicesModule();
});