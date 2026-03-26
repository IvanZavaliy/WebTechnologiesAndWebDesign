/* js/db.js */
const ITEM_DB = {
    // === БОЄПРИПАСИ ===
    'ammo_127': new GameItem('ammo_127', '12.7x55mm Ammo', 'ammo', 1, 1, 30, 'RE_Items_Images/12.7x55mm Ammo.png'),
    'ammo_hg': new GameItem('ammo_hg', 'Handgun Ammo', 'ammo', 1, 1, 60, 'RE_Items_Images/Handgun Ammo.png'),
    'ammo_sg': new GameItem('ammo_sg', 'Shotgun Shells', 'ammo', 1, 1, 20, 'RE_Items_Images/Shotgun Shells.png'),
    'ammo_mg': new GameItem('ammo_mg', 'Machine Gun Ammo', 'ammo', 1, 1, 100, 'RE_Items_Images/Machine Gun Ammo.png'),
    'ammo_rf': new GameItem('ammo_rf', 'Rifle Ammo', 'ammo', 1, 1, 30, 'RE_Items_Images/Rifle Ammo.png'),

    // === ЗБРОЯ ===
    'wpn_msbg500': new GameItem('wpn_msbg500', 'MSBG 500', 'weapon', 4, 2, 1, 'RE_Items_Images/MSBG 500.png'),
    'wpn_classic70': new GameItem('wpn_classic70', 'Classic 70', 'weapon', 5, 2, 1, 'RE_Items_Images/Classic 70.png'),
    'wpn_silencer9': new GameItem('wpn_silencer9', 'Silencer 9', 'weapon', 2, 2, 1, 'RE_Items_Images/Silencer 9.png'),
    'wpn_990tac': new GameItem('wpn_990tac', '990-TAC', 'weapon', 4, 2, 1, 'RE_Items_Images/990-TAC.png'),
    'wpn_stirirevo3': new GameItem('wpn_stirirevo3', 'Stiri REVO3 A1', 'weapon', 3, 2, 1, 'RE_Items_Images/Stiri REVO3 A1.png'),
    'wpn_freyas': new GameItem('wpn_freyas', "Freya's", 'weapon', 3, 2, 1, "RE_Items_Images/Freya's.png"),
    'wpn_mortaledge': new GameItem('wpn_mortaledge', 'Mortal Edge', 'weapon', 2, 2, 1, 'RE_Items_Images/Mortal Edge.png'),
    'wpn_marksman1a': new GameItem('wpn_marksman1a', 'Marksman 1A', 'weapon', 5, 2, 1, 'RE_Items_Images/Marksman 1A.png'),
    'wpn_gal': new GameItem('wpn_gal', 'Gal', 'weapon', 3, 2, 1, 'RE_Items_Images/Gal.png'),
    'wpn_w870police': new GameItem('wpn_w870police', 'W870 Police', 'weapon', 4, 2, 1, 'RE_Items_Images/W870 Police.png'),
    'wpn_clattercarbine': new GameItem('wpn_clattercarbine', 'Clatter Carbine', 'weapon', 4, 2, 1, 'RE_Items_Images/Clatter Carbine.png'),
    'wpn_ghostgrudge': new GameItem('wpn_ghostgrudge', 'Ghost Grudge', 'weapon', 2, 2, 1, 'RE_Items_Images/Ghost Grudge.png'),
    'wpn_redemption': new GameItem('wpn_redemption', 'Redemption', 'weapon', 4, 2, 1, 'RE_Items_Images/Redemption.png'),
    'wpn_rpg7': new GameItem('wpn_rpg7', 'RPG-7', 'weapon', 5, 2, 1, 'RE_Items_Images/RPG-7.png'),
    'wpn_matildaimp': new GameItem('wpn_matildaimp', 'Matilda IMP', 'weapon', 2, 2, 1, 'RE_Items_Images/Matilda IMP.png'),
    'knife_hunting': new GameItem('knife_hunting', 'Hunting Knife', 'weapon', 2, 1, 1, 'RE_Items_Images/Hunting Knife.png'),
    'knife_makeshift': new GameItem('knife_makeshift', 'Makeshift Knife', 'weapon', 2, 1, 1, 'RE_Items_Images/Makeshift Knife.png'),
    'knife_rip': new GameItem('knife_rip', 'R.I.P. Knife', 'weapon', 2, 1, 1, 'RE_Items_Images/R.I.P. Knife.png'),

    // === МЕДИЦИНА ===
    'herb_g': new GameItem('herb_g', 'Green Herb', 'heal', 1, 1, 1, 'RE_Items_Images/Green Herb.png'),
    'red_jewel': new GameItem('red_jewel', 'Red Jewel', 'heal', 1, 1, 1, 'RE_Items_Images/Red Jewel.png'),
    'herb_mix_gg': new GameItem('herb_mix_gg', 'Mixed Herb (G+G)', 'heal', 1, 1, 1, 'RE_Items_Images/Mixed Herb (G+G).png'),
    'herb_mix_ggg': new GameItem('herb_mix_ggg', 'Mixed Herb (G+G+G)', 'heal', 1, 1, 1, 'RE_Items_Images/Mixed Herb (G+G+G).png'),
    'steroids': new GameItem('steroids', 'Steroids', 'heal', 1, 1, 1, 'RE_Items_Images/Steroids.png'),
    'med_injector': new GameItem('med_injector', 'Med Injector', 'heal', 1, 1, 1, 'RE_Items_Images/Med Injector.png'),
    'hemolytic_injector': new GameItem('hemolytic_injector', 'Hemolytic Injector', 'heal', 1, 1, 1, 'RE_Items_Images/Hemolytic Injector.png'),
    'stabilizer': new GameItem('stabilizer', 'Stabilizer', 'heal', 1, 1, 1, 'RE_Items_Images/Stabilizer.png'),
    'transfusion_bag': new GameItem('transfusion_bag', 'Transfusion Bag', 'heal', 1, 1, 1, 'RE_Items_Images/Transfusion Bag.png'),

    // === РЕСУРСИ ===
    'gp_small': new GameItem('gp_small', 'Gunpowder (Small)', 'resource', 1, 1, 1, 'RE_Items_Images/Gunpowder (Small).png'),
    'gp_large': new GameItem('gp_large', 'Gunpowder (Large)', 'resource', 1, 1, 1, 'RE_Items_Images/Gunpowder (Large).png'),
    'scrap': new GameItem('scrap', 'Scrap', 'resource', 1, 1, 1, 'RE_Items_Images/Scrap.png'),
    'empty_bottle': new GameItem('empty_bottle', 'Empty Bottle', 'resource', 1, 1, 1, 'RE_Items_Images/Empty Bottle.png'),
    'empty_injector': new GameItem('empty_injector', 'Empty Injector', 'resource', 1, 1, 1, 'RE_Items_Images/Empty Injector.png'),
    'infected_blood': new GameItem('infected_blood', 'Infected Blood', 'resource', 1, 1, 1, 'RE_Items_Images/Infected Blood.png'),

    // === ГРАНАТИ ===
    'grenade_hand': new GameItem('grenade_hand', 'Hand Grenade', 'weapon', 1, 1, 3, 'RE_Items_Images/Hand Grenade.png'),
    'molotov': new GameItem('molotov', 'Molotov Cocktail', 'weapon', 1, 1, 3, 'RE_Items_Images/Molotov Cocktail.png'),

    // === КВЕСТОВІ ТА ІНШЕ ===
    'case_upgrade': new GameItem('case_upgrade', 'Case Upgrade (8x13)', 'quest', 1, 1, 1, 'RE_Items_Images/Case Upgrade (8x13).png'),
    'hip_pouch': new GameItem('hip_pouch', 'Hip Pouch', 'quest', 2, 2, 1, 'RE_Items_Images/Hip Pouch.png'),
    'lock_pick': new GameItem('lock_pick', 'Lock Pick', 'quest', 1, 1, 5, 'RE_Items_Images/Lock Pick.png'),
    'antique_coin': new GameItem('antique_coin', 'Antique Coin', 'quest', 1, 1, 99, 'RE_Items_Images/Antique Coin.png')
    // Можна додати інші квестові предмети за аналогією
};

const RECIPES_DB = [
    new Recipe('craft_gg', 'herb_g', 'herb_g', 'herb_mix_gg'),
    new Recipe('craft_gr', 'herb_g', 'red_jewel', 'herb_mix_gg'),
    new Recipe('craft_ggg', 'herb_mix_gg', 'herb_g', 'herb_mix_ggg'),
    new Recipe('craft_ammo_hg_1', 'gp_small', 'gp_small', 'ammo_hg'),
    new Recipe('craft_ammo_hg_2', 'scrap', 'gp_small', 'ammo_hg'),
    new Recipe('craft_ammo_hg_3', 'scrap', 'infected_blood', 'ammo_hg'),
    new Recipe('craft_ammo_sg_1', 'gp_small', 'gp_large', 'ammo_sg'),
    new Recipe('craft_ammo_sg_2', 'scrap', 'gp_large', 'ammo_sg'),
    new Recipe('craft_ammo_mg', 'gp_large', 'gp_large', 'ammo_mg'),
    new Recipe('craft_ammo_rf', 'scrap', 'scrap', 'ammo_rf'),
    new Recipe('craft_med_injector', 'herb_mix_gg', 'infected_blood', 'med_injector'),
    new Recipe('craft_molotov', 'empty_bottle', 'infected_blood', 'molotov')
];
