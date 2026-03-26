/* js/models.js */
class GameItem {
    constructor(id, name, cat, w, h, maxStack, img) {
        this.id = id;
        this.name = name;
        this.cat = cat;
        this.w = w;
        this.h = h;
        this.maxStack = maxStack;
        this.img = img;
    }
}

class PlacedItem {
    constructor(gameItem, qty, x, y) {
        this.uid = Math.random().toString(36).substr(2, 9);
        this.item = gameItem; 
        this.qty = qty;
        this.x = x;
        this.y = y;
    }
}

class Recipe {
    constructor(id, ing1, ing2, result) {
        this.id = id;
        this.ing1 = ing1;
        this.ing2 = ing2;
        this.result = result;
    }
}
