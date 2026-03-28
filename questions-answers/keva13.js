// ============================================
// КЕВА AI - БАЗА 5000+ ВОПРОСОВ - ЧАСТЬ 11 (Динамика и Завершение)
// ============================================

// ДИНАМИЧЕСКИЕ ОТВЕТЫ (Дата, Время, Праздники)
function getDynamicAnswer5000(question) {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes("какое сегодня число") || lowerQuestion.includes("сегодня число") || lowerQuestion.includes("какой день")) {
        const now = new Date();
        return "Сегодня " + now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) + "! 📅";
    }
    if (lowerQuestion.includes("какой сегодня день недели") || lowerQuestion.includes("день недели")) {
        const now = new Date();
        return "Сегодня " + now.toLocaleDateString('ru-RU', { weekday: 'long' }) + "! 🗓️";
    }
    if (lowerQuestion.includes("сколько времени") || lowerQuestion.includes("который час") || lowerQuestion.includes("время сейчас")) {
        const now = new Date();
        return "Сейчас " + now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) + "! ⏰";
    }
    if (lowerQuestion.includes("какой сегодня праздник") || lowerQuestion.includes("сегодня праздник")) {
        const now = new Date();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        
        // Простые праздники
        if (month === 1 && day === 1) return "Сегодня Новый год! 🎄🎉";
        if (month === 2 && day === 23) return "Сегодня День защитника Отечества! 💪";
        if (month === 3 && day === 8) return "Сегодня Международный женский день! 🌸";
        if (month === 5 && day === 1) return "Сегодня Праздник весны и труда! 🌷";
        if (month === 5 && day === 9) return "Сегодня День Победы! 🕊️";
        if (month === 6 && day === 12) return "Сегодня День России! 🇷🇺";
        if (month === 11 && day === 4) return "Сегодня День народного единства! 🤝";
        return "Каждый день — праздник, братан! А конкретно сегодня — отличный день, чтобы спросить у меня что-нибудь интересное! 🎉";
    }
    return null;
}

// Функция поиска ответа в базе 5000
function findAnswer5000(question) {
    const lowerQuestion = question.toLowerCase();
    for (let item of kevaAllResponses) {
        for (let keyword of item.keywords) {
            if (lowerQuestion.includes(keyword)) {
                return item.answer;
            }
        }
    }
    return null;
}

// Функция решения математических примеров
function solveMath5000(expression) {
    let expr = expression.replace(/\s/g, '');
    const mathRegex = /^[\d\s\+\-\*\/\(\)\.%]+$/;
    if (!mathRegex.test(expr)) return null;
    expr = expr.replace(/×/g, '*').replace(/÷/g, '/');
    try {
        const result = new Function('return ' + expr)();
        if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
            const rounded = Math.round(result * 1000000) / 1000000;
            return `📐 **${expression}** = **${rounded}**`;
        }
    } catch(e) {
        return null;
    }
    return null;
}

// Подключаем к Кеве
function initResponses5000Module() {
    let attempts = 0;
    const interval = setInterval(function() {
        attempts++;
        if (window.keva) {
            clearInterval(interval);
            console.log('✅ Модуль 5000+ ответов загружен!');
            console.log('📋 Всего загружено: ' + kevaAllResponses.length + ' шаблонов ответов!');
            console.log('🎉 Кева теперь знает ответы на ' + (kevaAllResponses.length * 3) + '+ вопросов!');
            
            const original = window.keva.getAIResponse;
            
            window.keva.getAIResponse = function(question) {
                // Сначала проверяем математику
                const mathResult = solveMath5000(question);
                if (mathResult) return mathResult;
                
                // Потом динамические ответы (дата, время)
                const dynamicAnswer = getDynamicAnswer5000(question);
                if (dynamicAnswer) return dynamicAnswer;
                
                // Потом проверяем статические ответы из базы
                const answer = findAnswer5000(question);
                if (answer) return answer;
                
                return original.call(this, question);
            };
            
            console.log('✅ Кева готов отвечать на любые вопросы!');
            console.log('🔥 Доступные категории: Приветствия, Цвета, Еда, Музыка, Кино, Спорт, Здоровье, Семья, Друзья, Любовь, Психология, Саморазвитие, Карьера, Финансы, Путешествия, Технологии, Игры, Хобби, Кулинария, Шутки, Стихи и многое другое!');
            
        } else if (attempts > 30) {
            clearInterval(interval);
            console.log('❌ Кева не найден!');
        }
    }, 200);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Загружаем модуль 5000+ ответов...');
    initResponses5000Module();
});

console.log('🎉 Финальная статистика: Всего загружено ' + kevaAllResponses.length + ' шаблонов ответов!');
console.log('🔥 КЕВА ГОТОВ ОТВЕЧАТЬ НА ЛЮБЫЕ ВОПРОСЫ!');