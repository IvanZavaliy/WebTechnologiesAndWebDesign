 /* ================= ДАНІ ТА СТАН (STATE MANAGEMENT) ================= */
        const AppState = {
            environment: 'Production',
            activeTab: 'services',
            openModalId: null,
            isDropdownOpen: false,
            openAccordionIndexes: [],
            error: null
        };

        /* ================= ЛОГІКА ОБРОБКИ ПОДІЙ (CONTROLLER) ================= */
        
        // 1. Модуль Dropdown
        const DropdownModule = {
            init() {
                const dropdown = document.getElementById('envDropdown');
                const toggle = dropdown.querySelector('[data-dropdown-toggle]');
                const items = dropdown.querySelectorAll('.dropdown-item');

                toggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    AppState.isDropdownOpen = !AppState.isDropdownOpen;
                    this.render();
                });

                items.forEach(item => {
                    item.addEventListener('click', (e) => {
                        AppState.environment = e.target.dataset.value;
                        AppState.isDropdownOpen = false;
                        toggle.textContent = `Середовище: ${AppState.environment} ▼`;
                        this.render();
                    });
                });

                // Закриття при кліку поза меню
                document.addEventListener('click', (e) => {
                    if (AppState.isDropdownOpen && !dropdown.contains(e.target)) {
                        AppState.isDropdownOpen = false;
                        this.render();
                    }
                });
            },
            render() {
                const dropdown = document.getElementById('envDropdown');
                if (AppState.isDropdownOpen) {
                    dropdown.classList.add('is-open');
                } else {
                    dropdown.classList.remove('is-open');
                }
            }
        };

        // 2. Модуль Вкладок (Tabs)
        const TabsModule = {
            init() {
                const tabBtns = document.querySelectorAll('.tab-btn');
                const errorMsg = document.getElementById('tabError');

                tabBtns.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const target = e.target.dataset.tabTarget;
                        
                        // Базова обробка помилок: перевірка на disabled
                        if (e.target.hasAttribute('disabled')) {
                            AppState.error = 'Доступ заборонено. Недостатньо прав.';
                            e.target.classList.add('has-error');
                            setTimeout(() => e.target.classList.remove('has-error'), 400); // Зняття класу після анімації
                            this.renderError(errorMsg);
                            return;
                        }

                        AppState.error = null;
                        AppState.activeTab = target;
                        this.renderError(errorMsg);
                        this.render(tabBtns);
                    });
                });
            },
            render(btns) {
                // Оновлення кнопок
                btns.forEach(btn => {
                    btn.classList.toggle('is-active', btn.dataset.tabTarget === AppState.activeTab);
                });
                // Оновлення контенту
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.toggle('is-active', content.id === AppState.activeTab);
                });
            },
            renderError(errorEl) {
                if (AppState.error) {
                    errorEl.textContent = AppState.error;
                    errorEl.classList.add('is-active');
                } else {
                    errorEl.classList.remove('is-active');
                }
            }
        };

        // 3. Модуль Акордеона (Accordion)
        const AccordionModule = {
            init() {
                const items = document.querySelectorAll('.accordion-item');
                items.forEach((item, index) => {
                    const header = item.querySelector('.accordion-header');
                    header.addEventListener('click', () => {
                        const isOpen = AppState.openAccordionIndexes.includes(index);
                        
                        // Логіка: дозволяємо відкрити кілька або закриваємо поточний
                        if (isOpen) {
                            AppState.openAccordionIndexes = AppState.openAccordionIndexes.filter(i => i !== index);
                        } else {
                            AppState.openAccordionIndexes.push(index);
                        }
                        this.render(items);
                    });
                });
            },
            render(items) {
                items.forEach((item, index) => {
                    item.classList.toggle('is-open', AppState.openAccordionIndexes.includes(index));
                });
            }
        };

        // 4. Модуль Модального вікна (Modal)
        const ModalModule = {
            init() {
                const openBtns = document.querySelectorAll('[data-modal-target]');
                const closeBtns = document.querySelectorAll('[data-modal-close]');
                
                openBtns.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        AppState.openModalId = e.target.dataset.modalTarget;
                        this.render();
                    });
                });

                closeBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        AppState.openModalId = null;
                        this.render();
                    });
                });

                // Закриття кліком поза вікном (на overlay)
                document.querySelectorAll('.modal-overlay').forEach(overlay => {
                    overlay.addEventListener('click', (e) => {
                        if (e.target === overlay) {
                            AppState.openModalId = null;
                            this.render();
                        }
                    });
                });

                // Закриття через клавішу Escape
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && AppState.openModalId) {
                        AppState.openModalId = null;
                        this.render();
                    }
                });
            },
            render() {
                document.querySelectorAll('.modal-overlay').forEach(modal => {
                    modal.classList.toggle('is-open', modal.id === AppState.openModalId);
                });
                // Блокування скролу body при відкритому модальному вікні
                document.body.style.overflow = AppState.openModalId ? 'hidden' : '';
            }
        };

        // 5. Модуль Tooltip
        const TooltipModule = {
            init() {
                const targets = document.querySelectorAll('[data-tooltip]');
                const container = document.getElementById('tooltipContainer');
                
                // Створюємо єдиний елемент тултипу в DOM
                const tooltipEl = document.createElement('div');
                tooltipEl.className = 'tooltip';
                container.appendChild(tooltipEl);

                targets.forEach(target => {
                    target.addEventListener('mouseenter', (e) => {
                        const text = e.target.dataset.tooltip;
                        if (!text) return; // Обробка відсутності даних

                        tooltipEl.textContent = text;
                        tooltipEl.classList.add('is-active');
                        
                        // Позиціонування
                        const rect = e.target.getBoundingClientRect();
                        tooltipEl.style.left = `${rect.left + (rect.width / 2) - (tooltipEl.offsetWidth / 2)}px`;
                        tooltipEl.style.top = `${rect.top - tooltipEl.offsetHeight - 8}px`; // 8px відступ
                    });

                    target.addEventListener('mouseleave', () => {
                        tooltipEl.classList.remove('is-active');
                    });
                });
            }
        };

        // Ініціалізація застосунку
        document.addEventListener('DOMContentLoaded', () => {
            DropdownModule.init();
            TabsModule.init();
            AccordionModule.init();
            ModalModule.init();
            TooltipModule.init();
        });