// === Симулятор Бази Даних ===
const DB_SIMULATOR = {
  activeConnections: 0,
  peakConnections: 0,

  resetStats() {
    this.activeConnections = 0;
    this.peakConnections = 0;
  },

  async query(operationType) {
    this.activeConnections++;
    if (this.activeConnections > this.peakConnections) {
      this.peakConnections = this.activeConnections;
    }

    // Імітація перевантаження: Що більше активних запитів, то довше вони виконуються і частіше падають
    const loadPenalty = this.activeConnections * 1.2;
    const baseDelay = 30 + Math.random() * 50;
    const totalDelay = baseDelay + loadPenalty;

    // Ймовірність помилки зростає при високому навантаженні
    const errorProbability = Math.min(0.85, 0.02 + (this.activeConnections / 5000));

    await new Promise(resolve => setTimeout(resolve, totalDelay));

    const isError = Math.random() < errorProbability;
    this.activeConnections--;

    if (isError) {
      const errors = ['DB_TIMEOUT', 'DB_DEADLOCK', 'DB_CONN_LOST'];
      const errType = errors[Math.floor(Math.random() * errors.length)];
      throw new Error(errType);
    }

    return { type: operationType, delay: totalDelay };
  }
};

// === Логіка Інтерфейсу та Управління Тестами ===
const UI = {
  numOps: document.getElementById('numOps'),
  mode: document.getElementById('mode'),
  limit: document.getElementById('limit'),
  btnRun: document.getElementById('btnRun'),
  btnStop: document.getElementById('btnStop'),
  progressBar: document.getElementById('progressBar'),
  progressText: document.getElementById('progressText'),
  valStatus: document.getElementById('valStatus'),
  valTime: document.getElementById('valTime'),
  valCounts: document.getElementById('valCounts'),
  valAvg: document.getElementById('valAvg'),
  valPeak: document.getElementById('valPeak')
};

let isAborted = false;

// Генерація масиву запитів
function generateTasks(n) {
  const types = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
  return Array.from({ length: n }, () => {
    const t = types[Math.floor(Math.random() * types.length)];
    // Повертаємо функцію, яка ЗАПУСКАЄ проміс
    return () => DB_SIMULATOR.query(t);
  });
}

// Оновлення прогресу в UI
function updateProgress(completed, total) {
  const percent = total === 0 ? 0 : (completed / total) * 100;
  UI.progressBar.style.width = `${percent}%`;
  UI.progressText.textContent = `${completed} / ${total}`;
}

// Зміна статусу в UI
function setStatus(statusText, className) {
  UI.valStatus.textContent = statusText;
  UI.valStatus.className = `badge ${className}`;
}

// === Стратегії виконання ===

// 1. Повний паралелізм (Promise.all)
async function runAll(tasks, onProgress) {
  let completed = 0;
  // Запускаємо всі задачі одночасно, але додаємо обробник для відстеження прогресу
  const promises = tasks.map(taskFn => {
    if (isAborted) return Promise.reject(new Error('ABORTED'));
    return taskFn()
            .then(res => { completed++; onProgress(completed); return res; })
            .catch(err => { completed++; onProgress(completed); throw err; });
  });

  // Використовуємо allSettled, щоб одна помилка не зупиняла очікування інших
  const results = await Promise.allSettled(promises);
  return results;
}

// 2. Контрольована конкурентність (Limit)
async function runLimit(tasks, limit, onProgress) {
  const results = [];
  const executing = new Set();
  let completed = 0;

  for (const taskFn of tasks) {
    if (isAborted) break;

    // Якщо досягли ліміту, чекаємо, поки хоча б один проміс завершиться
    if (executing.size >= limit) {
      await Promise.race(executing);
    }

    const p = taskFn()
            .then(res => ({ status: 'fulfilled', value: res }))
            .catch(err => ({ status: 'rejected', reason: err }))
            .finally(() => {
              executing.delete(p);
              completed++;
              onProgress(completed);
            });

    executing.add(p);
    results.push(p); // Зберігаємо проміс для результатів
  }

  // Чекаємо завершення останніх задач
  return Promise.all(results);
}

// 3. Послідовне виконання
async function runSequential(tasks, onProgress) {
  const results = [];
  let completed = 0;

  for (const taskFn of tasks) {
    if (isAborted) break;
    try {
      const res = await taskFn();
      results.push({ status: 'fulfilled', value: res });
    } catch (err) {
      results.push({ status: 'rejected', reason: err });
    }
    completed++;
    onProgress(completed);
  }
  return results;
}


// === Головний цикл запуску ===
UI.btnRun.addEventListener('click', async () => {
  isAborted = false;
  DB_SIMULATOR.resetStats();

  const n = parseInt(UI.numOps.value, 10);
  const mode = UI.mode.value;
  const limit = parseInt(UI.limit.value, 10);

  // UI Reset
  UI.btnRun.disabled = true;
  UI.btnStop.disabled = false;
  updateProgress(0, n);
  setStatus('running...', 'running');
  UI.valTime.textContent = '- ms';
  UI.valCounts.textContent = '- / -';
  UI.valAvg.textContent = '-';
  UI.valPeak.textContent = '-';

  console.clear();
  console.log(`[RUN] mode=${mode}, n=${n}, limit=${mode === 'limit' ? limit : 'N/A'}`);
  console.log(`[DB] connected`);

  const tasks = generateTasks(n);
  const startTime = performance.now();

  let results = [];

  try {
    if (mode === 'all') {
      results = await runAll(tasks, (c) => updateProgress(c, n));
    } else if (mode === 'limit') {
      results = await runLimit(tasks, limit, (c) => updateProgress(c, n));
    } else if (mode === 'seq') {
      results = await runSequential(tasks, (c) => updateProgress(c, n));
    }
  } catch (e) {
    console.error("Critical simulation error", e);
  }

  const endTime = performance.now();
  const elapsedMs = Math.round(endTime - startTime);

  // Обробка результатів
  let successCount = 0;
  let errorCount = 0;
  let totalSuccessTime = 0;
  const errorTypes = {};

  results.forEach(r => {
    if (r.status === 'fulfilled') {
      successCount++;
      totalSuccessTime += r.value.delay;
    } else {
      errorCount++;
      const errName = r.reason.message || 'UNKNOWN';
      if (errName !== 'ABORTED') {
        errorTypes[errName] = (errorTypes[errName] || 0) + 1;
      }
    }
  });

  const avgTime = successCount > 0 ? Math.round(totalSuccessTime / successCount) : 0;

  // UI Update Final
  UI.btnRun.disabled = false;
  UI.btnStop.disabled = true;
  setStatus(isAborted ? 'stopped' : 'done', isAborted ? 'stopped' : 'done');
  UI.valTime.textContent = `${elapsedMs} ms`;
  UI.valCounts.textContent = `${successCount} / ${errorCount}`;
  UI.valAvg.textContent = `${avgTime} ms`;
  UI.valPeak.textContent = DB_SIMULATOR.peakConnections;

  // Console Output (Схоже на скріншот)
  console.log('--- SUMMARY ---');
  console.log({
    mode,
    n,
    limit: mode === 'limit' ? limit : undefined,
    elapsedMs,
    ok: successCount,
    fail: errorCount,
    avgOpMs: avgTime,
    peakActive: DB_SIMULATOR.peakConnections
  });

  if (Object.keys(errorTypes).length > 0) {
    console.log('--- ERRORS (count) ---');
    const errTable = Object.entries(errorTypes).map(([err, count]) => ({ err, count }));
    console.table(errTable);
  }

  if (mode === 'all') {
    console.log('%cTip: Compare "all" vs "limit". In this simulation, too much parallelism increases delay+errors.', 'color: #888; font-style: italic;');
  }
});

UI.btnStop.addEventListener('click', () => {
  isAborted = true;
  UI.btnStop.disabled = true;
});
