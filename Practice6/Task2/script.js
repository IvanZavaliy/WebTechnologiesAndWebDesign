/**
 * 1. СТАН ЗАСТОСУНКУ (State)
 */
const AppState = {
    globalMode: 'initial', // initial, active, pending, completed, error
    selectedNodeId: null,
    isAnimating: false,
    errorMessage: null,
    dragState: {
        isDragging: false,
        elementId: null,
        offsetX: 0,
        offsetY: 0
    },
    // Дані для генерації SVG
    nodes: [
        { id: 'gateway', x: 150, y: 300, status: 'working', label: 'API Gateway', locked: true, desc: 'Вхідна точка запитів (Заблоковано для переміщення)' },
        { id: 'auth', x: 400, y: 150, status: 'working', label: 'Auth Service', locked: false, desc: 'Сервіс авторизації' },
        { id: 'database', x: 650, y: 300, status: 'working', label: 'Main Database', locked: false, desc: 'Основна база даних' },
        { id: 'storage', x: 400, y: 450, status: 'working', label: 'File Storage', locked: false, desc: 'Зберігання файлів' }
    ],
    connections: [
        { from: 'gateway', to: 'auth' },
        { from: 'gateway', to: 'database' },
        { from: 'gateway', to: 'storage' },
        { from: 'auth', to: 'database' }
    ]
};

/**
 * 2. КОНТРОЛЕР DOM ТА SVG (View/Controller)
 */
const UI = {
    svgNS: "http://www.w3.org/2000/svg",
    canvas: document.getElementById('svgCanvas'),
    nodesLayer: document.getElementById('nodesLayer'),
    connectionsLayer: document.getElementById('connectionsLayer'),
    animLayer: document.getElementById('animLayer'),
    toast: document.getElementById('toast'),
    infoPanel: document.getElementById('infoPanel'),

    init() {
        this.renderConnections();
        this.renderNodes();
        this.bindHTMLEvents();
        this.updateUI();
    },

    // --- Робота з SVG ---

    renderNodes() {
        this.nodesLayer.innerHTML = ''; // Очищення перед перемальовуванням
        AppState.nodes.forEach(nodeData => {
            const group = document.createElementNS(this.svgNS, 'g');
            group.setAttribute('class', `node status-${nodeData.status} ${AppState.selectedNodeId === nodeData.id ? 'is-selected' : ''}`);
            group.setAttribute('id', `node-${nodeData.id}`);
            group.setAttribute('transform', `translate(${nodeData.x}, ${nodeData.y})`);
            
            // Збереження посилання на об'єкт даних в елементі
            group.dataset.id = nodeData.id;

            // Кільце для пульсації помилки
            const pulse = document.createElementNS(this.svgNS, 'circle');
            pulse.setAttribute('class', 'pulse-ring');
            pulse.setAttribute('r', '30');
            pulse.setAttribute('fill', 'none');
            pulse.setAttribute('stroke', 'var(--color-error)');

            // Основне коло вузла
            const circle = document.createElementNS(this.svgNS, 'circle');
            circle.setAttribute('class', 'node-bg');
            circle.setAttribute('r', '30');
            circle.setAttribute('stroke', '#cbd5e1');
            circle.setAttribute('stroke-width', '2');

            // Текст-мітка
            const text = document.createElementNS(this.svgNS, 'text');
            text.setAttribute('y', '45');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', 'var(--text-color)');
            text.setAttribute('font-size', '14px');
            text.textContent = nodeData.label;

            // Іконка замка для заблокованих
            if(nodeData.locked) {
                const lock = document.createElementNS(this.svgNS, 'text');
                lock.setAttribute('y', '5');
                lock.setAttribute('text-anchor', 'middle');
                lock.setAttribute('fill', 'rgba(0,0,0,0.3)');
                lock.setAttribute('font-size', '16px');
                lock.textContent = '🔒';
                group.appendChild(lock);
            }

            group.appendChild(pulse);
            group.appendChild(circle);
            group.appendChild(text);

            this.bindSVGNodeEvents(group, nodeData);
            this.nodesLayer.appendChild(group);
        });
    },

    renderConnections() {
        this.connectionsLayer.innerHTML = '';
        AppState.connections.forEach(conn => {
            const nodeFrom = AppState.nodes.find(n => n.id === conn.from);
            const nodeTo = AppState.nodes.find(n => n.id === conn.to);
            
            if (nodeFrom && nodeTo) {
                const line = document.createElementNS(this.svgNS, 'line');
                line.setAttribute('id', `conn-${conn.from}-${conn.to}`);
                line.setAttribute('class', 'connection-line');
                line.setAttribute('x1', nodeFrom.x);
                line.setAttribute('y1', nodeFrom.y);
                line.setAttribute('x2', nodeTo.x);
                line.setAttribute('y2', nodeTo.y);
                this.connectionsLayer.appendChild(line);
            }
        });
    },

    updateConnectionPositions() {
        AppState.connections.forEach(conn => {
            const nodeFrom = AppState.nodes.find(n => n.id === conn.from);
            const nodeTo = AppState.nodes.find(n => n.id === conn.to);
            const line = document.getElementById(`conn-${conn.from}-${conn.to}`);
            
            if (line && nodeFrom && nodeTo) {
                line.setAttribute('x1', nodeFrom.x);
                line.setAttribute('y1', nodeFrom.y);
                line.setAttribute('x2', nodeTo.x);
                line.setAttribute('y2', nodeTo.y);
            }
        });
    },

    // --- Обробка подій SVG ---

    bindSVGNodeEvents(element, nodeData) {
        const tooltip = document.getElementById('tooltip');

        // Наведення (Hover)
        element.addEventListener('mouseover', (e) => {
            if (AppState.dragState.isDragging) return;
            tooltip.textContent = nodeData.desc;
            tooltip.classList.add('is-visible');
        });

        element.addEventListener('mouseout', () => {
            tooltip.classList.remove('is-visible');
        });

        element.addEventListener('mousemove', (e) => {
            if (AppState.dragState.isDragging) return;
            tooltip.style.left = e.pageX + 15 + 'px';
            tooltip.style.top = e.pageY + 15 + 'px';
        });

        // Вибір об'єкта
        element.addEventListener('click', (e) => {
            if (AppState.dragState.isDragging || AppState.isAnimating) return;
            AppState.selectedNodeId = nodeData.id;
            this.updateUI();
        });

        // Pointer Events для перетягування (Drag & Drop)
        element.addEventListener('pointerdown', (e) => {
            if (AppState.isAnimating) return;
            
            if (nodeData.locked) {
                this.showError(`Вузол "${nodeData.label}" заблоковано для переміщення.`);
                return;
            }

            // Конвертація координат екрану в SVG-координати
            const ctm = this.canvas.getScreenCTM();
            const svgX = (e.clientX - ctm.e) / ctm.a;
            const svgY = (e.clientY - ctm.f) / ctm.d;

            AppState.dragState.isDragging = true;
            AppState.dragState.elementId = nodeData.id;
            AppState.dragState.offsetX = svgX - nodeData.x;
            AppState.dragState.offsetY = svgY - nodeData.y;
            
            element.setPointerCapture(e.pointerId);
            tooltip.classList.remove('is-visible');
        });

        element.addEventListener('pointermove', (e) => {
            if (!AppState.dragState.isDragging || AppState.dragState.elementId !== nodeData.id) return;
            e.preventDefault();

            const ctm = this.canvas.getScreenCTM();
            const svgX = (e.clientX - ctm.e) / ctm.a;
            const svgY = (e.clientY - ctm.f) / ctm.d;

            // Обчислення нових координат
            let newX = svgX - AppState.dragState.offsetX;
            let newY = svgY - AppState.dragState.offsetY;

            // ОБМЕЖЕННЯ КООРДИНАТ (Clamping)
            // viewBox має розмір 800x600.
            // Відступи враховують радіус кола (30) та місце для тексту знизу.
            const minX = 40;
            const maxX = 760; // 800 - 40
            const minY = 40;
            const maxY = 540; // 600 - 60 (запас для тексту)

            // Math.max та Math.min гарантують, що значення не вийде за межі
            nodeData.x = Math.max(minX, Math.min(newX, maxX));
            nodeData.y = Math.max(minY, Math.min(newY, maxY));

            // Зміна атрибуту transform 
            element.setAttribute('transform', `translate(${nodeData.x}, ${nodeData.y})`);
            this.updateConnectionPositions();
        });

        element.addEventListener('pointerup', (e) => {
            if (AppState.dragState.isDragging && AppState.dragState.elementId === nodeData.id) {
                AppState.dragState.isDragging = false;
                AppState.dragState.elementId = null;
                element.releasePointerCapture(e.pointerId);
            }
        });
    },

    // --- Обробка подій HTML ---

    bindHTMLEvents() {
        const setStatus = (status) => {
            if (!AppState.selectedNodeId) {
                this.showError("Не вибрано жодного сервісу!");
                return;
            }
            const node = AppState.nodes.find(n => n.id === AppState.selectedNodeId);
            node.status = status;
            
            // Оновлення лише атрибуту класу SVG (демонстрація різниці)
            const nodeEl = document.getElementById(`node-${node.id}`);
            nodeEl.setAttribute('class', `node status-${status} is-selected`);
            
            this.showSuccess(`Статус змінено на ${status}`);
            this.updateUI();
        };

        document.getElementById('btnSetWorking').addEventListener('click', () => setStatus('working'));
        document.getElementById('btnSetWarning').addEventListener('click', () => setStatus('warning'));
        document.getElementById('btnSetError').addEventListener('click', () => setStatus('error'));

        document.getElementById('btnPing').addEventListener('click', () => {
            if (AppState.isAnimating) {
                this.showError("Дочекайтеся завершення поточної дії!");
                return;
            }
            this.runPingAnimation();
        });

        // Зняття виділення при кліку на фон полотна
        this.canvas.addEventListener('click', (e) => {
            if (e.target === this.canvas) {
                AppState.selectedNodeId = null;
                this.updateUI();
            }
        });
    },

    // --- Керована покадрова анімація (requestAnimationFrame) ---
    
    runPingAnimation() {
        AppState.isAnimating = true;
        AppState.globalMode = 'pending';
        document.getElementById('animStatus').textContent = 'Стан: Виконання Ping...';
        document.getElementById('btnPing').disabled = true;

        const pathNodes = ['gateway', 'auth', 'database'];
        let currentIndex = 0;
        
        // Створення елемента пінг-пакету
        const packet = document.createElementNS(this.svgNS, 'circle');
        packet.setAttribute('r', '6');
        packet.setAttribute('fill', 'var(--color-primary)');
        this.animLayer.appendChild(packet);

        // Активуємо лінії через CSS @keyframes
        document.querySelectorAll('.connection-line').forEach(l => l.classList.add('is-active'));

        let startNode = AppState.nodes.find(n => n.id === pathNodes[currentIndex]);
        let endNode = AppState.nodes.find(n => n.id === pathNodes[currentIndex + 1]);
        
        let progress = 0;
        const speed = 0.02;

        const animateFrame = () => {
            progress += speed;

            if (progress >= 1) {
                progress = 0;
                currentIndex++;
                if (currentIndex >= pathNodes.length - 1) {
                    // Анімація завершена
                    this.animLayer.innerHTML = '';
                    document.querySelectorAll('.connection-line').forEach(l => l.classList.remove('is-active'));
                    AppState.isAnimating = false;
                    AppState.globalMode = 'completed';
                    document.getElementById('animStatus').textContent = 'Стан: Завершено';
                    document.getElementById('btnPing').disabled = false;
                    this.showSuccess("Ping-тест успішно завершено");
                    return;
                }
                startNode = AppState.nodes.find(n => n.id === pathNodes[currentIndex]);
                endNode = AppState.nodes.find(n => n.id === pathNodes[currentIndex + 1]);
            }

            // Лінійна інтерполяція (Lerp) між вузлами
            const currentX = startNode.x + (endNode.x - startNode.x) * progress;
            const currentY = startNode.y + (endNode.y - startNode.y) * progress;

            packet.setAttribute('cx', currentX);
            packet.setAttribute('cy', currentY);

            requestAnimationFrame(animateFrame);
        };

        requestAnimationFrame(animateFrame);
    },

    // --- Синхронізація Стану та Інтерфейсу ---

    updateUI() {
        // Оновлення HTML панелі
        if (AppState.selectedNodeId) {
            const node = AppState.nodes.find(n => n.id === AppState.selectedNodeId);
            document.getElementById('serviceName').textContent = node.label;
            document.getElementById('serviceStatus').textContent = node.status;
            this.infoPanel.classList.remove('is-hidden');
            
            // Оновлення SVG класів для виділення
            document.querySelectorAll('.node').forEach(el => {
                if (el.dataset.id === node.id) {
                    el.classList.add('is-selected');
                } else {
                    el.classList.remove('is-selected');
                }
            });
        } else {
            this.infoPanel.classList.add('is-hidden');
            document.querySelectorAll('.node').forEach(el => el.classList.remove('is-selected'));
        }
    },

    showError(msg) {
        this.toast.textContent = msg;
        this.toast.className = 'toast is-active';
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => this.toast.classList.remove('is-active'), 3000);
    },

    showSuccess(msg) {
        this.toast.textContent = msg;
        this.toast.className = 'toast success is-active';
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => this.toast.classList.remove('is-active'), 3000);
    }
};

// Запуск застосунку
document.addEventListener('DOMContentLoaded', () => {
    UI.init();
});