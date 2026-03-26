/* js/UIController.js */
class UIController {
    constructor(inventory, crafting) {
        this.inv = inventory;
        this.crafting = crafting;
        this.selectedUid = null;
        this.draggedItemInfo = null;
        this.cellSize = 45;
        this.cellGap = 2;
        this.itemsLayer = document.getElementById('itemsLayer');
        this.onDragMove = this.onDragMove.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.initEvents();
        this.renderCatalog();
        this.renderInventory();
    }

    initEvents() {
        document.getElementById('btnSort').addEventListener('click', () => {
            this.inv.autoSort();
            this.renderInventory();
        });
        document.getElementById('btnClear').addEventListener('click', () => {
            this.inv.items = [];
            this.inv.rebuildGrid();
            this.selectItem(null);
            this.renderInventory();
        });
        document.getElementById('searchInput').addEventListener('input', () => this.renderCatalog());
        document.getElementById('categoryFilter').addEventListener('change', () => this.renderCatalog());

        const bg = document.getElementById('gridBg');
        bg.innerHTML = '';
        for (let i = 0; i < this.inv.cols * this.inv.rows; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            bg.appendChild(cell);
        }
    }

    renderCatalog() {
        const list = document.getElementById('catalogList');
        const filterCat = document.getElementById('categoryFilter').value;
        const search = document.getElementById('searchInput').value.toLowerCase();
        list.innerHTML = '';

        Object.values(ITEM_DB).forEach(gameItem => {
            if (filterCat !== 'all' && gameItem.cat !== filterCat) return;
            if (search && !gameItem.name.toLowerCase().includes(search)) return;

            const card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = `
                <div class="item-header">
                    <img src="${gameItem.img}" alt="${gameItem.name}" class="catalog-img" onerror="this.src=''; this.alt='No Image';">
                    <div class="item-info">
                        <div class="item-title">${gameItem.name}</div>
                        <div class="item-meta">${gameItem.w}x${gameItem.h} | Стек: ${gameItem.maxStack}</div>
                    </div>
                </div>
                <div class="item-actions">
                    <input type="number" id="qty-${gameItem.id}" value="1" min="1" max="99">
                    <button onclick="ui.handleAddClick('${gameItem.id}')">Додати</button>
                </div>
            `;
            list.appendChild(card);
        });
    }

    handleAddClick(itemId) {
        const qty = document.getElementById(`qty-${itemId}`).value;
        this.inv.addItem(ITEM_DB[itemId], qty);
        this.renderInventory();
    }

    renderInventory() {
        this.itemsLayer.innerHTML = '';
        let cellsUsed = 0;
        this.inv.items.forEach(placed => {
            cellsUsed += (placed.item.w * placed.item.h);
            const div = document.createElement('div');
            div.className = 'inv-item';
            if (this.selectedUid === placed.uid) div.classList.add('selected');

            const left = placed.x * (this.cellSize + this.cellGap);
            const top = placed.y * (this.cellSize + this.cellGap);
            const width = placed.item.w * this.cellSize + (placed.item.w - 1) * this.cellGap;
            const height = placed.item.h * this.cellSize + (placed.item.h - 1) * this.cellGap;

            div.style.left = `${left}px`;
            div.style.top = `${top}px`;
            div.style.width = `${width}px`;
            div.style.height = `${height}px`;
            div.innerHTML = `
                <img src="${placed.item.img}" class="inv-item-img" draggable="false" onerror="this.style.display='none'">
                ${placed.qty > 1 ? `<div class="inv-item-qty">${placed.qty}</div>` : ''}
            `;
            div.onmousedown = (e) => this.startDrag(e, div, placed);
            this.itemsLayer.appendChild(div);
        });
        document.getElementById('statCells').textContent = `${cellsUsed} / ${this.inv.cols * this.inv.rows}`;
        document.getElementById('statItems').textContent = this.inv.items.length;
    }

    selectItem(uid) {
        this.selectedUid = uid;
        document.querySelectorAll('.inv-item').forEach(el => el.classList.remove('selected'));
        const infoBox = document.getElementById('selectedInfo');
        const craftPanel = document.getElementById('craftPanel');

        if (!uid) {
            infoBox.innerHTML = '<div>Нічого не вибрано. Клікніть по предмету.</div>';
            craftPanel.style.display = 'none';
            return;
        }

        const placedItem = this.inv.items.find(i => i.uid === uid);
        const dbItem = placedItem.item;

        infoBox.innerHTML = `
            <div>
                <strong style="font-size: 18px; color: #fff;">${dbItem.name}</strong><br>
                <span style="color:#888; font-size:13px">Кількість: ${placedItem.qty} | Категорія: ${dbItem.cat}</span>
            </div>
            <div style="display:flex; gap:8px;">
                ${placedItem.qty > 1 ? `<button class="btn-secondary" onclick="ui.handleRemove('${uid}', 1)">Викинути 1шт</button>` : ''}
                <button class="btn-secondary" onclick="ui.handleRemove('${uid}', 'all')">Видалити</button>
            </div>
        `;

        const crafts = this.crafting.getAvailableCrafts(placedItem);
        if (crafts.length > 0) {
            craftPanel.style.display = 'block';
            const btnContainer = document.getElementById('craftButtons');
            btnContainer.innerHTML = '';
            crafts.forEach(c => {
                const btn = document.createElement('button');
                btn.textContent = c.name;
                btn.onclick = () => {
                    this.crafting.combine(placedItem.uid, c.partnerUid, c.recipe.result);
                    this.selectItem(null);
                    this.renderInventory();
                };
                btnContainer.appendChild(btn);
            });
        } else {
            craftPanel.style.display = 'none';
        }
    }

    handleRemove(uid, amount) {
        this.inv.removeItem(uid, amount);
        if (this.selectedUid === uid) this.selectItem(amount === 'all' ? null : uid);
        this.renderInventory();
    }

    startDrag(e, itemDiv, placedItem) {
        if (e.button !== 0) return;
        e.preventDefault();
        this.selectItem(placedItem.uid);
        const rect = itemDiv.getBoundingClientRect();
        this.draggedItemInfo = {
            div: itemDiv,
            placedItem: placedItem,
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top,
            origX: placedItem.x,
            origY: placedItem.y
        };
        itemDiv.style.zIndex = 1000;
        for (let r = 0; r < placedItem.item.h; r++) {
            for (let c = 0; c < placedItem.item.w; c++) {
                this.inv.grid[placedItem.y + r][placedItem.x + c] = null;
            }
        }
        document.addEventListener('mousemove', this.onDragMove);
        document.addEventListener('mouseup', this.onDragEnd);
    }

    onDragMove(e) {
        if (!this.draggedItemInfo) return;
        const layerRect = this.itemsLayer.getBoundingClientRect();
        let newLeft = e.clientX - layerRect.left - this.draggedItemInfo.offsetX;
        let newTop = e.clientY - layerRect.top - this.draggedItemInfo.offsetY;
        this.draggedItemInfo.div.style.left = `${newLeft}px`;
        this.draggedItemInfo.div.style.top = `${newTop}px`;
        const snapX = Math.round(newLeft / (this.cellSize + this.cellGap));
        const snapY = Math.round(newTop / (this.cellSize + this.cellGap));

        if (this.inv.canFit(this.draggedItemInfo.placedItem.item, snapX, snapY, this.draggedItemInfo.placedItem.uid)) {
            this.draggedItemInfo.div.style.borderColor = '#00C851';
        } else {
            this.draggedItemInfo.div.style.borderColor = '#ff4444';
        }
    }

    onDragEnd(e) {
        if (!this.draggedItemInfo) return;
        const layerRect = this.itemsLayer.getBoundingClientRect();
        let newLeft = e.clientX - layerRect.left - this.draggedItemInfo.offsetX;
        let newTop = e.clientY - layerRect.top - this.draggedItemInfo.offsetY;
        const snapX = Math.round(newLeft / (this.cellSize + this.cellGap));
        const snapY = Math.round(newTop / (this.cellSize + this.cellGap));

        if (this.inv.canFit(this.draggedItemInfo.placedItem.item, snapX, snapY, this.draggedItemInfo.placedItem.uid)) {
            this.draggedItemInfo.placedItem.x = snapX;
            this.draggedItemInfo.placedItem.y = snapY;
        } else {
            this.draggedItemInfo.placedItem.x = this.draggedItemInfo.origX;
            this.draggedItemInfo.placedItem.y = this.draggedItemInfo.origY;
        }
        document.removeEventListener('mousemove', this.onDragMove);
        document.removeEventListener('mouseup', this.onDragEnd);
        this.draggedItemInfo = null;
        this.inv.rebuildGrid();
        this.renderInventory();
    }
}
