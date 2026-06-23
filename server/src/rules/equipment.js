// SRD 5.1 equipment catalog: weapons, armor, adventuring gear, and packs.

export const WEAPONS = [
  // Simple Melee
  { key: 'club', name: 'Club', category: 'simple-melee', cost: '1 sp', damage: '1d4', damageType: 'bludgeoning', weight: 2, properties: ['Light'] },
  { key: 'dagger', name: 'Dagger', category: 'simple-melee', cost: '2 gp', damage: '1d4', damageType: 'piercing', weight: 1, properties: ['Finesse', 'Light', 'Thrown (range 20/60)'] },
  { key: 'greatclub', name: 'Greatclub', category: 'simple-melee', cost: '2 sp', damage: '1d8', damageType: 'bludgeoning', weight: 10, properties: ['Two-handed'] },
  { key: 'handaxe', name: 'Handaxe', category: 'simple-melee', cost: '5 gp', damage: '1d6', damageType: 'slashing', weight: 2, properties: ['Light', 'Thrown (range 20/60)'] },
  { key: 'javelin', name: 'Javelin', category: 'simple-melee', cost: '5 sp', damage: '1d6', damageType: 'piercing', weight: 2, properties: ['Thrown (range 30/120)'] },
  { key: 'light-hammer', name: 'Light Hammer', category: 'simple-melee', cost: '2 gp', damage: '1d4', damageType: 'bludgeoning', weight: 2, properties: ['Light', 'Thrown (range 20/60)'] },
  { key: 'mace', name: 'Mace', category: 'simple-melee', cost: '5 gp', damage: '1d6', damageType: 'bludgeoning', weight: 4, properties: [] },
  { key: 'quarterstaff', name: 'Quarterstaff', category: 'simple-melee', cost: '2 sp', damage: '1d6', damageType: 'bludgeoning', weight: 4, properties: ['Versatile (1d8)'] },
  { key: 'sickle', name: 'Sickle', category: 'simple-melee', cost: '1 gp', damage: '1d4', damageType: 'slashing', weight: 2, properties: ['Light'] },
  { key: 'spear', name: 'Spear', category: 'simple-melee', cost: '1 gp', damage: '1d6', damageType: 'piercing', weight: 3, properties: ['Thrown (range 20/60)', 'Versatile (1d8)'] },
  // Simple Ranged
  { key: 'light-crossbow', name: 'Light Crossbow', category: 'simple-ranged', cost: '25 gp', damage: '1d8', damageType: 'piercing', weight: 5, properties: ['Ammunition (range 80/320)', 'Loading', 'Two-handed'] },
  { key: 'dart', name: 'Dart', category: 'simple-ranged', cost: '5 cp', damage: '1d4', damageType: 'piercing', weight: 0.25, properties: ['Finesse', 'Thrown (range 20/60)'] },
  { key: 'shortbow', name: 'Shortbow', category: 'simple-ranged', cost: '25 gp', damage: '1d6', damageType: 'piercing', weight: 2, properties: ['Ammunition (range 80/320)', 'Two-handed'] },
  { key: 'sling', name: 'Sling', category: 'simple-ranged', cost: '1 sp', damage: '1d4', damageType: 'bludgeoning', weight: 0, properties: ['Ammunition (range 30/120)'] },
  // Martial Melee
  { key: 'battleaxe', name: 'Battleaxe', category: 'martial-melee', cost: '10 gp', damage: '1d8', damageType: 'slashing', weight: 4, properties: ['Versatile (1d10)'] },
  { key: 'flail', name: 'Flail', category: 'martial-melee', cost: '10 gp', damage: '1d8', damageType: 'bludgeoning', weight: 2, properties: [] },
  { key: 'glaive', name: 'Glaive', category: 'martial-melee', cost: '20 gp', damage: '1d10', damageType: 'slashing', weight: 6, properties: ['Heavy', 'Reach', 'Two-handed'] },
  { key: 'greataxe', name: 'Greataxe', category: 'martial-melee', cost: '30 gp', damage: '1d12', damageType: 'slashing', weight: 7, properties: ['Heavy', 'Two-handed'] },
  { key: 'greatsword', name: 'Greatsword', category: 'martial-melee', cost: '50 gp', damage: '2d6', damageType: 'slashing', weight: 6, properties: ['Heavy', 'Two-handed'] },
  { key: 'halberd', name: 'Halberd', category: 'martial-melee', cost: '20 gp', damage: '1d10', damageType: 'slashing', weight: 6, properties: ['Heavy', 'Reach', 'Two-handed'] },
  { key: 'lance', name: 'Lance', category: 'martial-melee', cost: '10 gp', damage: '1d12', damageType: 'piercing', weight: 6, properties: ['Reach', 'Special'] },
  { key: 'longsword', name: 'Longsword', category: 'martial-melee', cost: '15 gp', damage: '1d8', damageType: 'slashing', weight: 3, properties: ['Versatile (1d10)'] },
  { key: 'maul', name: 'Maul', category: 'martial-melee', cost: '10 gp', damage: '2d6', damageType: 'bludgeoning', weight: 10, properties: ['Heavy', 'Two-handed'] },
  { key: 'morningstar', name: 'Morningstar', category: 'martial-melee', cost: '15 gp', damage: '1d8', damageType: 'piercing', weight: 4, properties: [] },
  { key: 'pike', name: 'Pike', category: 'martial-melee', cost: '5 gp', damage: '1d10', damageType: 'piercing', weight: 18, properties: ['Heavy', 'Reach', 'Two-handed'] },
  { key: 'rapier', name: 'Rapier', category: 'martial-melee', cost: '25 gp', damage: '1d8', damageType: 'piercing', weight: 2, properties: ['Finesse'] },
  { key: 'scimitar', name: 'Scimitar', category: 'martial-melee', cost: '25 gp', damage: '1d6', damageType: 'slashing', weight: 3, properties: ['Finesse', 'Light'] },
  { key: 'shortsword', name: 'Shortsword', category: 'martial-melee', cost: '10 gp', damage: '1d6', damageType: 'piercing', weight: 2, properties: ['Finesse', 'Light'] },
  { key: 'trident', name: 'Trident', category: 'martial-melee', cost: '5 gp', damage: '1d6', damageType: 'piercing', weight: 4, properties: ['Thrown (range 20/60)', 'Versatile (1d8)'] },
  { key: 'war-pick', name: 'War Pick', category: 'martial-melee', cost: '5 gp', damage: '1d8', damageType: 'piercing', weight: 2, properties: [] },
  { key: 'warhammer', name: 'Warhammer', category: 'martial-melee', cost: '15 gp', damage: '1d8', damageType: 'bludgeoning', weight: 2, properties: ['Versatile (1d10)'] },
  { key: 'whip', name: 'Whip', category: 'martial-melee', cost: '2 gp', damage: '1d4', damageType: 'slashing', weight: 3, properties: ['Finesse', 'Reach'] },
  // Martial Ranged
  { key: 'blowgun', name: 'Blowgun', category: 'martial-ranged', cost: '10 gp', damage: '1', damageType: 'piercing', weight: 1, properties: ['Ammunition (range 25/100)', 'Loading'] },
  { key: 'hand-crossbow', name: 'Hand Crossbow', category: 'martial-ranged', cost: '75 gp', damage: '1d6', damageType: 'piercing', weight: 3, properties: ['Ammunition (range 30/120)', 'Light', 'Loading'] },
  { key: 'heavy-crossbow', name: 'Heavy Crossbow', category: 'martial-ranged', cost: '50 gp', damage: '1d10', damageType: 'piercing', weight: 18, properties: ['Ammunition (range 100/400)', 'Heavy', 'Loading', 'Two-handed'] },
  { key: 'longbow', name: 'Longbow', category: 'martial-ranged', cost: '50 gp', damage: '1d8', damageType: 'piercing', weight: 2, properties: ['Ammunition (range 150/600)', 'Heavy', 'Two-handed'] },
];

export const ARMOR = [
  // Light
  { key: 'padded', name: 'Padded', category: 'light', cost: '5 gp', baseAC: 11, dexBonus: 'full', stealthDisadvantage: true, weight: 8 },
  { key: 'leather', name: 'Leather', category: 'light', cost: '10 gp', baseAC: 11, dexBonus: 'full', stealthDisadvantage: false, weight: 10 },
  { key: 'studded-leather', name: 'Studded Leather', category: 'light', cost: '45 gp', baseAC: 12, dexBonus: 'full', stealthDisadvantage: false, weight: 13 },
  // Medium
  { key: 'hide', name: 'Hide', category: 'medium', cost: '10 gp', baseAC: 12, dexBonus: 'max2', stealthDisadvantage: false, weight: 12 },
  { key: 'chain-shirt', name: 'Chain Shirt', category: 'medium', cost: '50 gp', baseAC: 13, dexBonus: 'max2', stealthDisadvantage: false, weight: 20 },
  { key: 'scale-mail', name: 'Scale Mail', category: 'medium', cost: '50 gp', baseAC: 14, dexBonus: 'max2', stealthDisadvantage: true, weight: 45 },
  { key: 'breastplate', name: 'Breastplate', category: 'medium', cost: '400 gp', baseAC: 14, dexBonus: 'max2', stealthDisadvantage: false, weight: 20 },
  { key: 'half-plate', name: 'Half Plate', category: 'medium', cost: '750 gp', baseAC: 15, dexBonus: 'max2', stealthDisadvantage: true, weight: 40 },
  // Heavy
  { key: 'ring-mail', name: 'Ring Mail', category: 'heavy', cost: '30 gp', baseAC: 14, dexBonus: 'none', stealthDisadvantage: true, weight: 40 },
  { key: 'chain-mail', name: 'Chain Mail', category: 'heavy', cost: '75 gp', baseAC: 16, dexBonus: 'none', stealthDisadvantage: true, weight: 55, strengthRequirement: 13 },
  { key: 'splint', name: 'Splint', category: 'heavy', cost: '200 gp', baseAC: 17, dexBonus: 'none', stealthDisadvantage: true, weight: 60, strengthRequirement: 15 },
  { key: 'plate', name: 'Plate', category: 'heavy', cost: '1500 gp', baseAC: 18, dexBonus: 'none', stealthDisadvantage: true, weight: 65, strengthRequirement: 15 },
  // Shield
  { key: 'shield', name: 'Shield', category: 'shield', cost: '10 gp', acBonus: 2, weight: 6 },
];

export const ADVENTURING_GEAR = [
  { key: 'backpack', name: 'Backpack', cost: '2 gp', weight: 5 },
  { key: 'bedroll', name: 'Bedroll', cost: '1 gp', weight: 7 },
  { key: 'crowbar', name: 'Crowbar', cost: '2 gp', weight: 5 },
  { key: 'hammer', name: 'Hammer', cost: '1 gp', weight: 3 },
  { key: 'healers-kit', name: "Healer's Kit", cost: '5 gp', weight: 3 },
  { key: 'hempen-rope-50ft', name: 'Hempen Rope (50 ft)', cost: '1 gp', weight: 10 },
  { key: 'lantern-hooded', name: 'Lantern, Hooded', cost: '5 gp', weight: 2 },
  { key: 'manacles', name: 'Manacles', cost: '2 gp', weight: 6 },
  { key: 'mess-kit', name: 'Mess Kit', cost: '2 sp', weight: 1 },
  { key: 'oil-flask', name: 'Oil (flask)', cost: '1 sp', weight: 1 },
  { key: 'piton', name: 'Piton', cost: '5 cp', weight: 0.25 },
  { key: 'potion-of-healing', name: 'Potion of Healing', cost: '50 gp', weight: 0.5 },
  { key: 'rations-1-day', name: 'Rations (1 day)', cost: '5 sp', weight: 2 },
  { key: 'tinderbox', name: 'Tinderbox', cost: '5 sp', weight: 1 },
  { key: 'torch', name: 'Torch', cost: '1 cp', weight: 1 },
  { key: 'waterskin', name: 'Waterskin', cost: '2 sp', weight: 5 },
  { key: 'spellbook', name: 'Spellbook', cost: '50 gp', weight: 3 },
  { key: 'component-pouch', name: 'Component Pouch', cost: '25 gp', weight: 2 },
  { key: 'arcane-focus-orb', name: 'Arcane Focus (Orb)', cost: '20 gp', weight: 3 },
  { key: 'holy-symbol-amulet', name: 'Holy Symbol (Amulet)', cost: '5 gp', weight: 1 },
  { key: 'druidic-focus-sprig-mistletoe', name: 'Druidic Focus (Sprig of Mistletoe)', cost: '1 gp', weight: 0 },
  { key: 'thieves-tools', name: "Thieves' Tools", cost: '25 gp', weight: 1 },
  { key: 'shield-of-faith-scroll', name: 'Scroll Case', cost: '1 gp', weight: 1 },
];

export const EQUIPMENT_PACKS = [
  {
    key: 'burglars-pack',
    name: "Burglar's Pack",
    cost: '16 gp',
    contents: ['Backpack', "Bag of 1,000 ball bearings", '10 feet of string', 'A bell', '5 candles', 'A crowbar', 'A hammer', '10 pitons', 'A hooded lantern', '2 flasks of oil', '5 days rations', 'A tinderbox', 'A waterskin', '50 feet of hempen rope'],
  },
  {
    key: 'diplomats-pack',
    name: "Diplomat's Pack",
    cost: '39 gp',
    contents: ['A chest', '2 cases for maps and scrolls', 'A set of fine clothes', 'A bottle of ink', 'An ink pen', 'A lamp', '2 flasks of oil', '5 sheets of paper', 'A vial of perfume', 'Sealing wax', 'Soap'],
  },
  {
    key: 'dungeoneers-pack',
    name: "Dungeoneer's Pack",
    cost: '12 gp',
    contents: ['Backpack', 'A crowbar', 'A hammer', '10 pitons', '10 torches', 'A tinderbox', '10 days rations', 'A waterskin', '50 feet of hempen rope'],
  },
  {
    key: 'entertainers-pack',
    name: "Entertainer's Pack",
    cost: '40 gp',
    contents: ['Backpack', 'A bedroll', '2 costumes', '5 candles', '5 days rations', 'A waterskin', 'A disguise kit'],
  },
  {
    key: 'explorers-pack',
    name: "Explorer's Pack",
    cost: '10 gp',
    contents: ['Backpack', 'A bedroll', 'A mess kit', 'A tinderbox', '10 torches', '10 days rations', 'A waterskin', '50 feet of hempen rope'],
  },
  {
    key: 'priests-pack',
    name: "Priest's Pack",
    cost: '19 gp',
    contents: ['Backpack', 'A blanket', '10 candles', 'A tinderbox', 'An alms box', '2 blocks of incense', 'A censer', 'Vestments', '2 days rations', 'A waterskin'],
  },
  {
    key: 'scholars-pack',
    name: "Scholar's Pack",
    cost: '40 gp',
    contents: ['Backpack', 'A book of lore', 'A bottle of ink', 'An ink pen', '10 sheets of parchment', 'A little bag of sand', 'A small knife'],
  },
];

export function getWeapon(key) {
  return WEAPONS.find((w) => w.key === key) || null;
}
export function getArmor(key) {
  return ARMOR.find((a) => a.key === key) || null;
}
export function getGear(key) {
  return ADVENTURING_GEAR.find((g) => g.key === key) || null;
}
export function getPack(key) {
  return EQUIPMENT_PACKS.find((p) => p.key === key) || null;
}
