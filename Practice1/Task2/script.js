// Початкові дані для процесу
const INITIAL_INPUT = "   hello world   ";

// Отримання елементів DOM
const btnPromise = document.getElementById('btnPromise');
const btnAsync = document.getElementById('btnAsync');
const btnReset = document.getElementById('btnReset');
const finalResultEl = document.getElementById('finalResult');
const errorProbInput = document.getElementById('errorProb');

// --- Допоміжні функції для UI ---

// Скидання інтерфейсу до початкового стану
function resetUI() {
    console.clear();
    console.log("[reset] UI reset");

    for (let i = 1; i <= 4; i++) {
        const badge = document.getElementById(`badge${i}`);
        const res = document.getElementById(`res${i}`);

        badge.className = 'badge waiting';
        badge.textContent = 'waiting';
        res.textContent = '-';
    }
    finalResultEl.textContent = '-';

    // Блокуємо кнопки під час виконання
    btnPromise.disabled = true;
    btnAsync.disabled = true;
}

// Розблокування кнопок після завершення
function enableButtons() {
    btnPromise.disabled = false;
    btnAsync.disabled = false;
}

// Оновлення конкретного кроку в DOM
function updateStepUI(stepIndex, status, resultText = null) {
    const badge = document.getElementById(`badge${stepIndex}`);
    badge.className = `badge ${status}`;
    badge.textContent = status;

    if (resultText !== null) {
        document.getElementById(`res${stepIndex}`).textContent = resultText;
    }
}

// --- Основна функція для генерації асинхронних кроків ---
// Повертає Promise, який або резолвиться з результатом, або відхиляється (reject)
function executeStep(stepIndex, stepName, inputData, processingCallback, delayMs) {
    return new Promise((resolve, reject) => {
        // Оновлюємо UI на стан 'running'
        updateStepUI(stepIndex, 'running', '...');
        console.log(`[step ${stepIndex}] START: ${stepName}, input= ${inputData}`);

        setTimeout(() => {
            const probability = parseFloat(errorProbInput.value);
            const isError = Math.random() < probability;

            if (isError) {
                console.log(`[step ${stepIndex}] ERROR`);
                updateStepUI(stepIndex, 'error', '-');
                reject(new Error(`Помилка на кроці ${stepIndex}`));
            } else {
                const result = processingCallback(inputData);
                console.log(`[step ${stepIndex}] DONE: output= ${result}`);
                updateStepUI(stepIndex, 'done', result);
                resolve(result);
            }
        }, delayMs);
    });
}

// --- Варіант 1: Запуск через Promise chaining (.then .catch) ---
function runWithPromises() {
    resetUI();
    console.log("[mode] Promise chaining");

    executeStep(1, "Крок 1: Нормалізація", INITIAL_INPUT, (str) => str.trim(), 1000)
        .then(res1 => {
            return executeStep(2, "Крок 2: Перетворення", res1, (str) => str.toUpperCase(), 1200);
        })
        .then(res2 => {
            return executeStep(3, "Крок 3: Додавання суфікса", res2, (str) => str + " - DONE", 800);
        })
        .then(res3 => {
            return executeStep(4, "Крок 4: Підрахунок символів", res3, (str) => str.length, 1500);
        })
        .then(finalValue => {
            finalResultEl.textContent = finalValue;
            console.log("[pipeline] SUCCESS: ", finalValue);
        })
        .catch(error => {
            finalResultEl.textContent = 'ERROR';
            console.error(`❌ [pipeline] FAILED: ${error.message}`);
        })
        .finally(() => {
            console.log("[pipeline] FINALLY");
            enableButtons();
        });
}

// --- Варіант 2: Запуск через async / await (try / catch) ---
async function runWithAsyncAwait() {
    resetUI();
    console.log("[mode] async/await");

    try {
        const res1 = await executeStep(1, "Крок 1: Нормалізація", INITIAL_INPUT, (str) => str.trim(), 1000);
        const res2 = await executeStep(2, "Крок 2: Перетворення", res1, (str) => str.toUpperCase(), 1200);
        const res3 = await executeStep(3, "Крок 3: Додавання суфікса", res2, (str) => str + " - DONE", 800);
        const finalValue = await executeStep(4, "Крок 4: Підрахунок символів", res3, (str) => str.length, 1500);

        finalResultEl.textContent = finalValue;
        console.log("[pipeline] SUCCESS: ", finalValue);

    } catch (error) {
        finalResultEl.textContent = 'ERROR';
        console.error(`❌ [pipeline] FAILED: ${error.message}`);
    } finally {
        console.log("[pipeline] FINALLY");
        enableButtons();
    }
}

// --- Прив'язка подій ---
btnPromise.addEventListener('click', runWithPromises);
btnAsync.addEventListener('click', runWithAsyncAwait);
btnReset.addEventListener('click', () => {
    resetUI();
    enableButtons();
});
