// Стан застосунку
const appState = {
    status: 'initial', // 'initial', 'running', 'paused', 'error'
    selectedObject: null,
    objectsCount: 0,
    errorMessage: '',
    historyGraph: [] // масив для збереження значень вибраного сенсора
};

// Константи
const MAX_OBJECTS = 10;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GRAPH_HEIGHT = 150;

let canvas, ctx;
let objects = [];
let animationFrameId = null;

// Клас для об'єктів сенсорів
class SensorObject {
    constructor(id, type, x, y) {
        this.id = id;
        this.type = type; // 'temperature' | 'humidity'
        this.x = x;
        this.y = y;
        this.radius = type === 'temperature' ? 22 : 24;
        this.color = type === 'temperature' ? '#f97316' : '#06b6d4';
        
        // Початкова швидкість від -3 до 3
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
        
        this.isActive = true;
        this.currentValue = 0;
        this.time = Math.random() * 100;
        this.flash = 0;
    }

    update() {
        if (!this.isActive) return;

        // Зміна координат
        this.x += this.vx;
        this.y += this.vy;

        // Відбиття від стінок (з врахуванням радіусу)
        let bounced = false;
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -1;
            bounced = true;
        } else if (this.x + this.radius > CANVAS_WIDTH) {
            this.x = CANVAS_WIDTH - this.radius;
            this.vx *= -1;
            bounced = true;
        }

        // Обмеження знизу графіком
        let maxY = CANVAS_HEIGHT - GRAPH_HEIGHT;
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy *= -1;
            bounced = true;
        } else if (this.y + this.radius > maxY) {
            this.y = maxY - this.radius;
            this.vy *= -1;
            bounced = true;
        }

        if (bounced) this.onBounce();

        // Імітація зміни даних сенсора
        this.time += 0.05;
        if (this.type === 'temperature') {
            // Температура: 10 - 30 °C
            this.currentValue = 20 + Math.sin(this.time) * 10 + (Math.random() - 0.5) * 2;
        } else {
            // Вологість: 30 - 80 %
            this.currentValue = 55 + Math.cos(this.time) * 25 + (Math.random() - 0.5) * 2;
        }
    }

    onBounce() {
        this.flash = 15;
    }

    draw(ctx, isSelected) {
        ctx.save();
        ctx.beginPath();
        
        let drawColor = this.isActive ? this.color : '#475569'; // Сірий, якщо неактивний

        // Ефект світіння при зіткненні
        if (this.flash > 0 && this.isActive) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = drawColor;
            this.flash--;
        }

        if (this.type === 'temperature') {
            // Температура - коло
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = drawColor;
            ctx.fill();
        } else {
            // Вологість - квадрат
            ctx.rect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
            ctx.fillStyle = drawColor;
            ctx.fill();
            ctx.lineJoin = 'round'; // закруглені кути для квадрата (якщо малювати через stroke, але ми fill, тому просто стиль)
        }
        
        // Виділення вибраного об'єкта
        if (isSelected) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();
            
            ctx.beginPath();
            if (this.type === 'temperature') {
                ctx.arc(this.x, this.y, this.radius + 6, 0, Math.PI * 2);
            } else {
                ctx.rect(this.x - this.radius - 6, this.y - this.radius - 6, this.radius * 2 + 12, this.radius * 2 + 12);
            }
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Відображення поточного значення
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 13px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let unit = this.type === 'temperature' ? '°C' : '%';
        let displayVal = this.isActive ? Math.round(this.currentValue) : '-';
        ctx.fillText(displayVal + unit, this.x, this.y);

        ctx.restore();
    }

    hitTest(mx, my) {
        // Перевірка попадання курсора в об'єкт
        if (this.type === 'temperature') {
            const dx = this.x - mx;
            const dy = this.y - my;
            return dx * dx + dy * dy <= this.radius * this.radius;
        } else {
            return mx >= this.x - this.radius && mx <= this.x + this.radius &&
                   my >= this.y - this.radius && my <= this.y + this.radius;
        }
    }
}

function init() {
    canvas = document.getElementById('main-canvas');
    ctx = canvas.getContext('2d');
    
    // Прив'язка подій до кнопок
    document.getElementById('btn-start').addEventListener('click', startAnimation);
    document.getElementById('btn-pause').addEventListener('click', pauseAnimation);
    document.getElementById('btn-add-temp').addEventListener('click', () => addObject('temperature'));
    document.getElementById('btn-add-hum').addEventListener('click', () => addObject('humidity'));
    document.getElementById('btn-delete').addEventListener('click', deleteSelectedObject);
    document.getElementById('btn-toggle-active').addEventListener('click', toggleObjectActive);
    
    // Події Canvas
    canvas.addEventListener('mousedown', handleCanvasClick);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    
    // Події зміни параметрів (швидкість)
    document.getElementById('prop-vx').addEventListener('input', handleVelocityChange);
    document.getElementById('prop-vy').addEventListener('input', handleVelocityChange);
    
    updateUI();
    drawScene();
}

function updateUI() {
    // Оновлення індикатора статусу
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    statusDot.className = 'dot ' + appState.status;
    
    switch(appState.status) {
        case 'initial': statusText.textContent = 'Очікування дій'; break;
        case 'running': statusText.textContent = 'Анімація активна'; break;
        case 'paused': statusText.textContent = 'На паузі'; break;
        case 'error': statusText.textContent = 'Помилка!'; break;
    }
    
    const btnStart = document.getElementById('btn-start');
    const btnPause = document.getElementById('btn-pause');
    
    if (appState.status === 'running') {
        btnStart.disabled = true;
        btnPause.disabled = false;
    } else {
        btnStart.disabled = false;
        btnPause.disabled = true;
    }
    
    document.getElementById('obj-count').textContent = appState.objectsCount;
    
    // Оновлення блоку помилок
    const errorBox = document.getElementById('error-box');
    if (appState.errorMessage) {
        errorBox.textContent = appState.errorMessage;
        errorBox.style.display = 'block';
        setTimeout(() => {
            if (appState.errorMessage) {
                appState.errorMessage = '';
                updateUI();
            }
        }, 4000);
    } else {
        errorBox.style.display = 'none';
    }
    
    // Оновлення панелі властивостей
    const propPanel = document.getElementById('properties-panel');
    if (appState.selectedObject) {
        propPanel.style.display = 'block';
        const obj = appState.selectedObject;
        
        const typeBadge = document.getElementById('prop-type');
        typeBadge.textContent = obj.type === 'temperature' ? 'Температура' : 'Вологість';
        typeBadge.style.color = obj.type === 'temperature' ? '#f97316' : '#06b6d4';
        
        document.getElementById('prop-vx').value = obj.vx;
        document.getElementById('val-vx').textContent = obj.vx.toFixed(1);
        
        document.getElementById('prop-vy').value = obj.vy;
        document.getElementById('val-vy').textContent = obj.vy.toFixed(1);
        
        const toggleBtn = document.getElementById('btn-toggle-active');
        if (obj.isActive) {
            toggleBtn.textContent = 'Вимкнути сенсор';
            toggleBtn.className = 'btn outline small-btn';
        } else {
            toggleBtn.textContent = 'Увімкнути сенсор';
            toggleBtn.className = 'btn primary small-btn';
        }
    } else {
        propPanel.style.display = 'none';
    }
}

function showError(msg) {
    appState.errorMessage = msg;
    // Якщо помилка сталася під час анімації, не змінюємо загальний статус на error повністю,
    // але для наочності можемо тимчасово.
    const prevStatus = appState.status;
    appState.status = 'error';
    updateUI();
    
    setTimeout(() => {
        if (appState.status === 'error') {
            appState.status = prevStatus;
            updateUI();
        }
    }, 4000);
}

function startAnimation() {
    if (appState.status === 'running') {
        return;
    }
    appState.status = 'running';
    appState.errorMessage = '';
    updateUI();
    loop();
}

function pauseAnimation() {
    if (appState.status !== 'running') {
        return;
    }
    appState.status = 'paused';
    updateUI();
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
}

function addObject(type) {
    if (objects.length >= MAX_OBJECTS) {
        showError(`Досягнуто ліміт об'єктів (${MAX_OBJECTS}). Видаліть існуючі.`);
        return;
    }
    
    const x = Math.random() * (CANVAS_WIDTH - 100) + 50;
    const y = Math.random() * (CANVAS_HEIGHT - GRAPH_HEIGHT - 100) + 50;
    
    const obj = new SensorObject(Date.now() + Math.random(), type, x, y);
    objects.push(obj);
    
    appState.objectsCount = objects.length;
    appState.errorMessage = '';
    
    if (appState.status === 'initial' || appState.status === 'paused') {
        drawScene();
    }
    
    updateUI();
}

function deleteSelectedObject() {
    if (!appState.selectedObject) {
        showError('Виберіть об\'єкт для видалення.');
        return;
    }
    
    objects = objects.filter(o => o.id !== appState.selectedObject.id);
    appState.selectedObject = null;
    appState.historyGraph = []; 
    appState.objectsCount = objects.length;
    updateUI();
    
    if (appState.status !== 'running') {
        drawScene();
    }
}

function toggleObjectActive() {
    if (!appState.selectedObject) return;
    appState.selectedObject.isActive = !appState.selectedObject.isActive;
    updateUI();
    
    if (appState.status !== 'running') {
        drawScene();
    }
}

function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    let clickedObject = null;
    
    // Перевірка з кінця масиву, щоб вибрати верхній об'єкт
    for (let i = objects.length - 1; i >= 0; i--) {
        if (objects[i].hitTest(mx, my)) {
            clickedObject = objects[i];
            break;
        }
    }
    
    appState.selectedObject = clickedObject;
    if (clickedObject) {
        appState.historyGraph = []; // Скидання графіка для нового об'єкта
    }
    
    updateUI();
    
    if (appState.status !== 'running') {
        drawScene();
    }
}

function handleCanvasMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    let isHovering = false;
    for (let obj of objects) {
        if (obj.hitTest(mx, my)) {
            isHovering = true;
            break;
        }
    }
    
    canvas.style.cursor = isHovering ? 'pointer' : 'crosshair';
}

function handleVelocityChange(e) {
    if (!appState.selectedObject) {
        showError('Немає вибраного об\'єкта для зміни параметрів.');
        return;
    }
    
    const vx = parseFloat(document.getElementById('prop-vx').value);
    const vy = parseFloat(document.getElementById('prop-vy').value);
    
    appState.selectedObject.vx = vx;
    appState.selectedObject.vy = vy;
    
    document.getElementById('val-vx').textContent = vx.toFixed(1);
    document.getElementById('val-vy').textContent = vy.toFixed(1);
    
    if (appState.status !== 'running') {
        drawScene();
    }
}

function loop() {
    if (appState.status !== 'running') return;
    
    updateScene();
    drawScene();
    
    animationFrameId = requestAnimationFrame(loop);
}

function updateScene() {
    for (let obj of objects) {
        obj.update();
    }
    
    // Оновлення графіка для вибраного об'єкта
    if (appState.selectedObject && appState.selectedObject.isActive) {
        appState.historyGraph.push(appState.selectedObject.currentValue);
        if (appState.historyGraph.length > CANVAS_WIDTH) {
            appState.historyGraph.shift();
        }
    }
}

function drawScene() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    drawGrid();
    
    // Малювання об'єктів
    for (let obj of objects) {
        const isSelected = appState.selectedObject && appState.selectedObject.id === obj.id;
        obj.draw(ctx, isSelected);
    }
    
    drawGraph();
}

function drawGrid() {
    ctx.save();
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 1;
    const areaHeight = CANVAS_HEIGHT - GRAPH_HEIGHT;
    
    for (let x = 0; x <= CANVAS_WIDTH; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, areaHeight);
        ctx.stroke();
    }
    for (let y = 0; y <= areaHeight; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
    }
    ctx.restore();
}

function drawGraph() {
    const graphY = CANVAS_HEIGHT - GRAPH_HEIGHT;
    
    // Фон панелі графіка
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, graphY, CANVAS_WIDTH, GRAPH_HEIGHT);
    
    // Верхня лінія-розділювач
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, graphY);
    ctx.lineTo(CANVAS_WIDTH, graphY);
    ctx.stroke();
    
    if (!appState.selectedObject) {
        ctx.fillStyle = '#64748b';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Виберіть об\'єкт для перегляду даних у реальному часі', CANVAS_WIDTH / 2, graphY + GRAPH_HEIGHT / 2);
        return;
    }
    
    if (appState.historyGraph.length === 0) {
        return;
    }
    
    ctx.save();
    const color = appState.selectedObject.color;
    
    // Заповнення під графіком (градієнт)
    const gradient = ctx.createLinearGradient(0, graphY, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, appState.selectedObject.type === 'temperature' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(6, 182, 212, 0.2)');
    gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
    
    const data = appState.historyGraph;
    let minVal = Math.min(...data);
    let maxVal = Math.max(...data);
    const padding = (maxVal - minVal) * 0.2 || 10;
    minVal -= padding;
    maxVal += padding;
    
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT);
    
    for (let i = 0; i < data.length; i++) {
        const val = data[i];
        const x = i;
        const normalized = (val - minVal) / (maxVal - minVal);
        const y = graphY + GRAPH_HEIGHT - normalized * GRAPH_HEIGHT;
        ctx.lineTo(x, y);
    }
    
    ctx.lineTo(data.length - 1, CANVAS_HEIGHT);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Лінія графіка
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 5;
    ctx.shadowColor = color;
    
    for (let i = 0; i < data.length; i++) {
        const val = data[i];
        const x = i;
        const normalized = (val - minVal) / (maxVal - minVal);
        const y = graphY + GRAPH_HEIGHT - normalized * GRAPH_HEIGHT;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // Текст поточного значення
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 14px Inter';
    ctx.textAlign = 'left';
    ctx.shadowBlur = 0;
    let unit = appState.selectedObject.type === 'temperature' ? '°C' : '%';
    ctx.fillText(
        `Останнє значення: ${Math.round(data[data.length - 1])}${unit}`, 
        20, 
        graphY + 25
    );
    
    ctx.restore();
}

// Ініціалізація при завантаженні
document.addEventListener('DOMContentLoaded', init);
