/* js/Crafting.js */
class CraftingSystem {
    constructor(inventory, recipes) {
        this.inventory = inventory;
        this.recipes = recipes;
    }

    getAvailableCrafts(placedItem) {
        const possibleCrafts = [];
        const matchingRecipes = this.recipes.filter(r => r.ing1 === placedItem.item.id || r.ing2 === placedItem.item.id);

        matchingRecipes.forEach(recipe => {
            const targetPartnerId = (recipe.ing1 === placedItem.item.id) ? recipe.ing2 : recipe.ing1;
            const partnerInInv = this.inventory.items.find(i => i.item.id === targetPartnerId && i.uid !== placedItem.uid);

            if (!partnerInInv && targetPartnerId === placedItem.item.id && placedItem.qty >= 2) {
                possibleCrafts.push({ recipe: recipe, partnerUid: placedItem.uid, name: `Створити: ${ITEM_DB[recipe.result].name}` });
            } else if (partnerInInv) {
                possibleCrafts.push({ recipe: recipe, partnerUid: partnerInInv.uid, name: `Скомбінувати з: ${partnerInInv.item.name}` });
            }
        });
        return possibleCrafts;
    }

    combine(baseUid, partnerUid, resultItemId) {
        this.inventory.removeItem(baseUid, 1);
        this.inventory.removeItem(partnerUid, 1);
        this.inventory.addItem(ITEM_DB[resultItemId], 1);
    }
}
