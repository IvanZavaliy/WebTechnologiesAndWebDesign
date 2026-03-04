// Конфігурація
const TOTAL_IMAGES = 12;
const imagePaths = Array.from({ length: TOTAL_IMAGES }, (_, i) => `images/${i + 1}.jpg`);

// Стан додатку
let currentMode = 'naive'; // 'naive' або 'safe'
let currentToken = 0;      // Унікальний ідентифікатор останньої операції hover

// DOM Елементи
const loaderEl = document.getElementById('loader');
const appEl = document.getElementById('app');
const galleryGrid = document.getElementById('galleryGrid');
const previewImage = document.getElementById('previewImage');
const previewPlaceholder = document.getElementById('previewPlaceholder');
const loadingProgress = document.getElementById('loadingProgress');
const modeRadios = document.querySelectorAll('input[name="mode"]');
const modeDescription = document.getElementById('modeDescription');
const hoverInfo = document.getElementById('hoverInfo');
const tokenInfo = document.getElementById('tokenInfo');

// 1. Попереднє завантаження зображень
async function preloadImages() {
    let loadedCount = 0;
    const loadProgressEl = document.getElementById('loading-progress');

    const promises = imagePaths.map(src => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                loadedCount++;
                loadProgressEl.textContent = `${loadedCount}/${TOTAL_IMAGES}`;
                resolve();
            };
            // Resolve навіть при помилці, щоб уникнути повного блокування
            img.onerror = () => {
                loadedCount++;
                loadProgressEl.textContent = `${loadedCount}/${TOTAL_IMAGES}`;
                console.warn(`Не вдалося завантажити: ${src}`);
                resolve();
            };
        });
    });

    await Promise.all(promises);

    // Приховуємо лоадер, показуємо додаток
    loaderEl.style.display = 'none';
    appEl.style.display = 'block';

    initGallery();
}

// 2. Ініціалізація галереї
function initGallery() {
    imagePaths.forEach((src, index) => {
        const imgId = index + 1;
        const imgEl = document.createElement('img');
        imgEl.src = src;
        imgEl.className = 'thumb';
        imgEl.dataset.id = imgId;

        // Подія наведення курсора
        imgEl.addEventListener('mouseenter', () => handleHover(src, imgId));

        galleryGrid.appendChild(imgEl);
    });
}

// Функція симуляції затримки (150ms - 700ms)
function simulateProcessingDelay() {
    const delay = Math.floor(Math.random() * (700 - 150 + 1)) + 150;
    return new Promise(resolve => setTimeout(resolve, delay));
}

// 3. Логіка обробки Hover (Найважливіша частина)
async function handleHover(imageSrc, imageId) {
    // Збільшуємо загальний токен при КОЖНОМУ наведенні
    currentToken++;

    // Захоплюємо токен для ЦІЄЇ конкретної операції (closure)
    const thisOperationToken = currentToken;

    // Оновлюємо інформацію в інтерфейсі одразу при наведенні
    hoverInfo.textContent = imageId;
    tokenInfo.textContent = thisOperationToken;

    // Симулюємо асинхронну підготовку
    await simulateProcessingDelay();

    // Застосування результату залежно від режиму
    if (currentMode === 'naive') {
        // У Naive режимі ігноруємо перевірки актуальності.
        // Результат виводиться одразу як тільки Promise завершився.
        displayPreview(imageSrc);
        console.log(`[Naive] Завершено для Зображення ${imageId}. Токен: ${thisOperationToken}`);
    }
    else if (currentMode === 'safe') {
        // У Safe режимі перевіряємо, чи ця операція все ще є останньою
        if (thisOperationToken === currentToken) {
            displayPreview(imageSrc);
            console.log(`[Safe] УСПІХ: Завершено для Зображення ${imageId}. Токен: ${thisOperationToken}`);
        } else {
            // Результат застарів (користувач вже навів курсор на інше фото)
            console.warn(`[Safe] СКАСОВАНО: Зображення ${imageId} застаріло. Очікувався токен ${thisOperationToken}, але поточний ${currentToken}.`);
        }
    }
}

// Допоміжна функція для відображення
function displayPreview(imageSrc) {
    previewPlaceholder.style.display = 'none';
    previewImage.src = imageSrc;
    previewImage.style.display = 'block';
}

// Обробка перемикання режимів
modeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        currentMode = e.target.value;
        if (currentMode === 'naive') {
            modeDescription.textContent = "У Naive-режимі результати застосовуються в порядку їх завершення (можлива некоректна поведінка).";
        } else {
            modeDescription.textContent = "У Safe-режимі застосовується лише актуальний результат (перевірка за токеном).";
        }
    });
});

// Запуск програми
preloadImages();