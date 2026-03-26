/* js/Inventory.js */
class SpatialInventory {
    constructor(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.items = [];
        this.grid = [];
        this.clearGrid();
    }

    clearGrid() {
        this.grid = Array(this.rows).fill().map(() => Array(this.cols).fill(null));
    }

    rebuildGrid() {
        this.clearGrid();
        this.items.forEach(placed => {
            for (let r = 0; r < placed.item.h; r++) {
                for (let c = 0; c < placed.item.w; c++) {
                    this.grid[placed.y + r][placed.x + c] = placed.uid;
                }
            }
        });
    }

    canFit(gameItem, x, y, ignoreUid = null) {
        if (x < 0 || y < 0 || x + gameItem.w > this.cols || y + gameItem.h > this.rows) return false;
        for (let r = 0; r < gameItem.h; r++) {
            for (let c = 0; c < gameItem.w; c++) {
                const cell = this.grid[y + r][x + c];
                if (cell !== null && cell !== ignoreUid) return false;
            }
        }
        return true;
    }

    findFreeSpot(w, h) {
        for (let y = 0; y <= this.rows - h; y++) {
            for (let x = 0; x <= this.cols - w; x++) {
                let isFree = true;
                for (let r = 0; r < h; r++) {
                    for (let c = 0; c < w; c++) {
                        if (this.grid[y + r][x + c] !== null) { isFree = false; break; }
                    }
                    if (!isFree) break;
                }
                if (isFree) return { x, y };
            }
        }
        return null;
    }

    addItem(gameItem, qtyToAdd) {
        let remaining = parseInt(qtyToAdd);
        if (gameItem.maxStack > 1) {
            const existingStacks = this.items.filter(i => i.item.id === gameItem.id && i.qty < gameItem.maxStack);
            for (let stack of existingStacks) {
                const spaceLeft = gameItem.maxStack - stack.qty;
                if (remaining <= spaceLeft) {
                    stack.qty += remaining;
                    remaining = 0;
                    break;
                } else {
                    stack.qty = gameItem.maxStack;
                    remaining -= spaceLeft;
                }
            }
        }
        while (remaining > 0) {
            const qtyForNewStack = Math.min(remaining, gameItem.maxStack);
            const spot = this.findFreeSpot(gameItem.w, gameItem.h);
            if (!spot) {
                alert(`Недостатньо місця для ${gameItem.name}!`);
                break;
            }
            const newItem = new PlacedItem(gameItem, qtyForNewStack, spot.x, spot.y);
            this.items.push(newItem);
            this.rebuildGrid();
            remaining -= qtyForNewStack;
        }
    }

    removeItem(uid, amount = 'all') {
        const idx = this.items.findIndex(i => i.uid === uid);
        if (idx === -1) return;
        if (amount === 'all' || this.items[idx].qty <= amount) {
            this.items.splice(idx, 1);
        } else {
            this.items[idx].qty -= amount;
        }
        this.rebuildGrid();
    }

    autoSort() {
        const sorted = [...this.items].sort((a, b) => (b.item.w * b.item.h) - (a.item.w * a.item.h));
        this.items = [];
        this.clearGrid();
        sorted.forEach(placed => {
            const spot = this.findFreeSpot(placed.item.w, placed.item.h);
            if (spot) {
                placed.x = spot.x;
                placed.y = spot.y;
                this.items.push(placed);
                this.rebuildGrid();
            }
        });
    }
}
