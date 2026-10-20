// ============================================================
// QUICK ADD
// Нажимаешь на питомца -> появляется строка, куда можно написать
// (или сказать голосом) обычную фразу, например:
//
//      "купил кофе за 5 евро"
//      "получил зарплату 1500"
//      "вчера такси 12 евро"
//
// Программа сама находит сумму, тип (доход/расход), категорию,
// название и дату и сохраняет транзакцию.
//
// Никаких ключей и платных API: текст разбирается простыми правилами
// прямо здесь, а голос распознаёт сам браузер (Web Speech API).
//
// Этот файл НИЧЕГО не меняет в index.js / pet.js. Он только
// пользуется их готовыми функциями: apiFetch, showNotification,
// loadDashboard, formatMoney, formatCategory и т.д.
// ============================================================


// ========================================
// НАСТРОЙКИ (можно менять)
// ========================================

// На каком языке ты говоришь в микрофон: "ru-RU", "en-US", "et-EE" ...
const QUICK_VOICE_LANG = "ru-RU";

// true  = после того как договорил, транзакция сохраняется сразу
// false = текст только появится в строке, а отправлять нужно кнопкой
const QUICK_AUTO_SEND_VOICE = true;


// ========================================
// СЛОВАРИ (сюда легко добавлять свои слова)
// ========================================

// Если в фразе есть одно из этих слов -> это ДОХОД.
// Если нет -> считаем, что это РАСХОД.
// Слова записаны как "начало слова": "зарплат" подходит к "зарплата", "зарплату".
const QUICK_INCOME_WORDS = [
    "получил", "получила", "заработал", "заработала", "зарплат", "аванс",
    "премия", "премию", "бонус", "пришл", "вернул", "подарили", "продал",
    "продала", "доход",
    "earned", "received", "salary", "sold", "income", "refund", "bonus", "payday"
];

// Слова для каждой категории. Проверяются по порядку сверху вниз,
// побеждает первая категория, в которой нашлось слово.
const QUICK_CATEGORY_WORDS = {
    HEALTH: [
        "аптек", "лекарств", "таблетк", "витамин", "врач", "доктор", "больниц",
        "поликлиник", "стоматолог", "зуб", "массаж", "спортзал", "фитнес", "терапевт",
        "pharmacy", "doctor", "medicine", "pills", "dentist", "hospital", "vitamins", "gym"
    ],
    TRANSPORT: [
        "такси", "автобус", "трамвай", "метро", "маршрутк", "бензин", "заправк",
        "топлив", "парковк", "проезд", "поезд", "самолет", "самолёт", "авиабилет",
        "электричк", "самокат", "uber", "bolt", "taxi", "bus", "train", "fuel",
        "petrol", "gas", "parking", "flight", "metro"
    ],
    FOOD: [
        "кофе", "чай", "еда", "еды", "обед", "ужин", "завтрак", "перекус", "пицц",
        "бургер", "суши", "шаурм", "кафе", "ресторан", "столов", "продукт",
        "супермаркет", "молок", "хлеб", "вода", "воды", "сок", "пив", "вино",
        "мороженое", "шоколад", "фрукт", "овощ", "мяс", "сыр",
        "coffee", "tea", "food", "lunch", "dinner", "breakfast", "pizza", "burger",
        "restaurant", "cafe", "grocer", "supermarket", "snack", "beer", "wine", "kohv"
    ],
    ENTERTAINMENT: [
        "кино", "фильм", "игр", "steam", "netflix", "spotify", "youtube", "подписк",
        "концерт", "театр", "клуб", "боулинг", "музей", "вечеринк",
        "movie", "cinema", "game", "concert", "theatre", "theater", "party",
        "subscription", "museum"
    ],
    SHOPPING: [
        "одежд", "куртк", "футболк", "джинс", "кроссовк", "обув", "ботинк", "плать",
        "рубашк", "шапк", "сумк", "телефон", "ноутбук", "наушник", "подарок",
        "подарк", "покупк", "косметик", "духи",
        "clothes", "jacket", "shirt", "shoes", "sneakers", "jeans", "phone",
        "laptop", "headphones", "gift", "amazon", "shopping"
    ],
    WORK: [
        "зарплат", "аванс", "премия", "премию", "бонус", "фриланс", "заказчик",
        "проект", "клиент", "офис",
        "work", "salary", "freelance", "client", "project", "invoice", "bonus", "office"
    ]
};

// Слова-"шум": они не попадут в название транзакции.
// "купил я кофе за 5 евро" -> останется только "кофе".
const QUICK_FILLER_WORDS = [
    "я", "мне", "купил", "купила", "купили", "потратил", "потратила", "потратили",
    "заплатил", "заплатила", "оплатил", "оплатила", "отдал", "отдала", "заказал", "заказала",
    "за", "на", "в", "сегодня", "вчера", "позавчера",
    "получил", "получила", "заработал", "заработала",
    "i", "bought", "spent", "paid", "got", "received", "earned",
    "for", "on", "a", "an", "the", "my", "today", "yesterday"
];

const QUICK_YESTERDAY_WORDS = ["вчера", "yesterday", "eile"];
const QUICK_DAY_BEFORE_WORDS = ["позавчера"];


// ========================================
// РАЗБОР ТЕКСТА (главная идея)
// ========================================

// Превращает фразу в готовую транзакцию.
// Возвращает объект { title, amount, type, category, date }
// или null, если в фразе не нашлось суммы.
function parseTransactionText(text) {

    const found = findAmount(text);

    if (!found) {
        return null;
    }

    const words = wordsOf(text);
    const type = detectType(words);
    const category = detectCategory(words);

    return {
        title: makeTitle(text, found.matchedText, category, type),
        amount: found.amount,
        type: type,
        category: category,
        date: detectDate(words)
    };
}

// "Купил КОФЕ, за 5 евро" -> ["купил", "кофе", "за", "5", "евро"]
function wordsOf(text) {
    return text
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter(Boolean);
}

// Есть ли среди слов хоть одно, которое начинается с чего-то из списка
function hasAnyWord(words, startsList) {
    return words.some(word => startsList.some(start => word.startsWith(start)));
}


// ----- 1. СУММА -----

// Знаки и слова валют: €  $  ₽  eur  euros  евро  usd  dollars  руб ...
const QUICK_CURRENCY = "(?:€|\\$|₽|eur\\p{L}*|евро|usd|dollar\\p{L}*|долл\\p{L}*|руб\\p{L}*)";
const QUICK_NUMBER = "(\\d+(?:[.,]\\d{1,2})?)";

function findAmount(text) {

    // Ищем по очереди, от самого надёжного способа к самому простому
    const patterns = [
        new RegExp(`${QUICK_NUMBER}\\s*${QUICK_CURRENCY}`, "iu"),   // "5 евро", "5€"
        new RegExp(`${QUICK_CURRENCY}\\s*${QUICK_NUMBER}`, "iu"),   // "€5", "eur 5"
        new RegExp(QUICK_NUMBER)                                    // просто число
    ];

    for (const pattern of patterns) {

        const match = text.match(pattern);

        if (match) {
            const amount = Number(match[1].replace(",", "."));

            if (amount > 0) {
                return { amount: amount, matchedText: match[0] };
            }
        }
    }

    return null;
}


// ----- 2. ТИП: доход или расход -----

function detectType(words) {
    return hasAnyWord(words, QUICK_INCOME_WORDS) ? "INCOME" : "EXPENSE";
}


// ----- 3. КАТЕГОРИЯ -----

function detectCategory(words) {

    for (const category in QUICK_CATEGORY_WORDS) {
        if (hasAnyWord(words, QUICK_CATEGORY_WORDS[category])) {
            return category;
        }
    }

    return "OTHER";
}


// ----- 4. ДАТА -----

function detectDate(words) {

    let daysAgo = 0;

    if (hasAnyWord(words, QUICK_DAY_BEFORE_WORDS)) {
        daysAgo = 2;
    } else if (hasAnyWord(words, QUICK_YESTERDAY_WORDS)) {
        daysAgo = 1;
    }

    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    return toIsoDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}


// ----- 5. НАЗВАНИЕ -----

// Берём фразу, вырезаем сумму и слова-шум. То, что осталось, и есть название.
function makeTitle(text, amountText, category, type) {

    const withoutAmount = text.replace(amountText, " ");

    const title = wordsOf(withoutAmount)
        .filter(word => !QUICK_FILLER_WORDS.includes(word))
        .join(" ");

    if (!title) {
        // от фразы ничего не осталось ("потратил 5 евро") -> берём название категории
        return type === "INCOME" ? "Income" : formatCategory(category);
    }

    return title.charAt(0).toUpperCase() + title.slice(1);
}


// ========================================
// СОХРАНЕНИЕ (так же, как делает обычная форма)
// ========================================

async function saveQuickTransaction(tx) {

    try {

        const response = await apiFetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tx)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            showNotification(error.error || "Failed to add transaction.", "error");
            return false;
        }

        const sign = tx.type === "INCOME" ? "+" : "−";

        showNotification(
            `Added: ${tx.title} · ${sign}${formatMoney(tx.amount)} · ${formatCategory(tx.category)}`,
            "success"
        );

        // если дата в другом месяце (например "вчера" 1-го числа), переключаем месяц
        const [year, month] = tx.date.split("-").map(Number);

        if (year !== state.year || month !== state.month) {
            state.year = year;
            state.month = month;
            updateMonthLabel();
        }

        await loadDashboard();

        return true;

    } catch (error) {

        console.error(error);
        showNotification("Server error. Please try again.", "error");

        return false;
    }
}


// ========================================
// СТРОКА ВВОДА (кнопки "отправить" и "микрофон")
// ========================================

let quickInput = null;
let quickSending = false;

// Создаём строку и кладём её внутрь питомца.
// Сам pet.js мы не трогаем: строка просто появляется и исчезает
// вместе с его панелью (см. следим за панелью ниже).
function createQuickBar() {

    const bar = document.createElement("div");
    bar.id = "quickAdd";
    bar.className = "quick-add";
    bar.hidden = true;

    bar.innerHTML = `
        <input id="quickAddInput" type="text" autocomplete="off"
               placeholder="Bought coffee for 5 euro">
        <button id="quickAddMic" type="button" class="quick-btn"
                aria-label="Speak" title="Speak">
            <i data-lucide="mic"></i>
        </button>
        <button id="quickAddSend" type="button" class="quick-btn quick-btn-send"
                aria-label="Add" title="Add">
            <i data-lucide="send"></i>
        </button>`;

    $("pet").appendChild(bar);
    icons();

    quickInput = $("quickAddInput");

    $("quickAddSend").addEventListener("click", sendQuickText);
    $("quickAddMic").addEventListener("click", toggleListening);

    quickInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            sendQuickText();
        }
    });

    followPetPanel(bar);
}

// Строка показывается ровно тогда, когда открыта панель питомца,
// и стоит с той же стороны (сверху/снизу, слева/справа).
function followPetPanel(bar) {

    const panel = $("petPanel");

    const sync = () => {
        bar.hidden = panel.hidden;
        bar.classList.toggle("below", panel.classList.contains("below"));
        bar.classList.toggle("to-right", panel.classList.contains("to-right"));

        if (panel.hidden) {
            stopListening();
        }
    };

    new MutationObserver(sync).observe(panel, {
        attributes: true,
        attributeFilter: ["hidden", "class"]
    });

    sync();
}

// Нажали "отправить" (или Enter)
async function sendQuickText() {

    const text = quickInput.value.trim();

    if (!text || quickSending) {
        return;
    }

    const tx = parseTransactionText(text);

    if (!tx) {
        showNotification(
            "Couldn't find an amount. Try: \"bought coffee for 5 euro\".",
            "warning"
        );
        return;
    }

    quickSending = true;

    const saved = await saveQuickTransaction(tx);

    quickSending = false;

    if (saved) {
        quickInput.value = "";
    }
}


// ========================================
// ГОЛОС (встроенное распознавание речи браузера)
// ========================================

// Работает в Chrome, Edge, Safari. В Firefox этого нет.
// Работает на localhost и на https.
const QuickSpeech = window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;
let heardSomething = false;

function toggleListening() {

    if (recognition) {
        recognition.stop();   // заканчиваем слушать (результат всё равно придёт)
        return;
    }

    startListening();
}

function startListening() {

    if (!QuickSpeech) {
        showNotification(
            "Voice input isn't supported in this browser. Try Chrome, Edge or Safari.",
            "warning"
        );
        return;
    }

    heardSomething = false;

    recognition = new QuickSpeech();
    recognition.lang = QUICK_VOICE_LANG;
    recognition.interimResults = true;   // текст появляется пока ты говоришь
    recognition.continuous = false;      // одна фраза за раз

    recognition.onstart = () => {
        $("quickAddMic").classList.add("listening");
    };

    recognition.onresult = (event) => {

        let spoken = "";

        for (const result of event.results) {
            spoken += result[0].transcript;
        }

        quickInput.value = spoken;
        heardSomething = true;
    };

    recognition.onerror = (event) => {
        showNotification(voiceErrorMessage(event.error), "warning");
    };

    recognition.onend = () => {

        recognition = null;
        $("quickAddMic").classList.remove("listening");

        if (heardSomething && QUICK_AUTO_SEND_VOICE) {
            sendQuickText();
        }
    };

    recognition.start();
}

// Закрыли панель питомца -> перестаём слушать и ничего не отправляем
function stopListening() {

    if (recognition) {
        heardSomething = false;
        recognition.abort();
    }
}

function voiceErrorMessage(code) {

    if (code === "not-allowed" || code === "service-not-allowed") {
        return "Microphone is blocked. Allow it in the browser address bar.";
    }

    if (code === "no-speech") {
        return "I didn't hear anything. Try again.";
    }

    if (code === "audio-capture") {
        return "No microphone found.";
    }

    if (code === "network") {
        return "Voice recognition needs an internet connection.";
    }

    return "Voice input failed. Please try again.";
}


// ========================================
// ЗАПУСК
// ========================================

document.addEventListener("DOMContentLoaded", createQuickBar);