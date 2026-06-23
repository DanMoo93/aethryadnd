// SRD 5.1 races. Each race lists ability score increases, speed, size,
// languages, and traits. Subraces (where present) override/add to the base.

export const RACES = [
  {
    key: 'human',
    name: 'Human',
    size: 'Medium',
    speed: 30,
    abilityBonuses: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
    languages: ['Common', 'One extra language of your choice'],
    traits: [
      { name: 'Versatile', description: 'Humans gain a +1 bonus to all ability scores.' },
    ],
  },
  {
    key: 'elf',
    name: 'Elf',
    size: 'Medium',
    speed: 30,
    abilityBonuses: { dexterity: 2 },
    languages: ['Common', 'Elvish'],
    traits: [
      { name: 'Darkvision', description: 'You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.' },
      { name: 'Keen Senses', description: 'You have proficiency in the Perception skill.' },
      { name: 'Fey Ancestry', description: 'You have advantage on saving throws against being charmed, and magic can\u2019t put you to sleep.' },
      { name: 'Trance', description: 'You don\u2019t need to sleep. Instead, you meditate deeply for 4 hours a day.' },
    ],
    subraces: [
      {
        key: 'high-elf',
        name: 'High Elf',
        abilityBonuses: { intelligence: 1 },
        traits: [
          { name: 'Cantrip', description: 'You know one cantrip of your choice from the wizard spell list.' },
          { name: 'Extra Language', description: 'You can speak, read, and write one extra language of your choice.' },
        ],
      },
      {
        key: 'wood-elf',
        name: 'Wood Elf',
        abilityBonuses: { wisdom: 1 },
        speedOverride: 35,
        traits: [
          { name: 'Mask of the Wild', description: 'You can attempt to hide even when only lightly obscured by foliage, heavy rain, falling snow, mist, and other natural phenomena.' },
        ],
      },
      {
        key: 'dark-elf-drow',
        name: 'Dark Elf (Drow)',
        abilityBonuses: { charisma: 1 },
        traits: [
          { name: 'Superior Darkvision', description: 'Your darkvision has a radius of 120 feet.' },
          { name: 'Drow Magic', description: 'You know the Dancing Lights cantrip; at 3rd level you can cast Faerie Fire, at 5th level Darkness.' },
          { name: 'Sunlight Sensitivity', description: 'You have disadvantage on attack rolls and Perception checks that rely on sight in direct sunlight.' },
        ],
      },
    ],
  },
  {
    key: 'dwarf',
    name: 'Dwarf',
    size: 'Medium',
    speed: 25,
    abilityBonuses: { constitution: 2 },
    languages: ['Common', 'Dwarvish'],
    traits: [
      { name: 'Darkvision', description: 'You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.' },
      { name: 'Dwarven Resilience', description: 'You have advantage on saving throws against poison, and resistance against poison damage.' },
      { name: 'Dwarven Combat Training', description: 'You have proficiency with battleaxes, handaxes, light hammers, and warhammers.' },
      { name: 'Tool Proficiency', description: 'You gain proficiency with one type of artisan\u2019s tools of your choice.' },
      { name: 'Stonecunning', description: 'You have expertise on History checks related to stonework, and double proficiency bonus on them.' },
    ],
    subraces: [
      {
        key: 'hill-dwarf',
        name: 'Hill Dwarf',
        abilityBonuses: { wisdom: 1 },
        traits: [
          { name: 'Dwarven Toughness', description: 'Your hit point maximum increases by 1, and increases by 1 every time you gain a level.' },
        ],
      },
      {
        key: 'mountain-dwarf',
        name: 'Mountain Dwarf',
        abilityBonuses: { strength: 2 },
        traits: [
          { name: 'Dwarven Armor Training', description: 'You have proficiency with light and medium armor.' },
        ],
      },
    ],
  },
  {
    key: 'halfling',
    name: 'Halfling',
    size: 'Small',
    speed: 25,
    abilityBonuses: { dexterity: 2 },
    languages: ['Common', 'Halfling'],
    traits: [
      { name: 'Lucky', description: 'When you roll a 1 on an attack roll, ability check, or saving throw, you can reroll the die and must use the new roll.' },
      { name: 'Brave', description: 'You have advantage on saving throws against being frightened.' },
      { name: 'Halfling Nimbleness', description: 'You can move through the space of any creature that is of a size larger than yours.' },
    ],
    subraces: [
      {
        key: 'lightfoot',
        name: 'Lightfoot',
        abilityBonuses: { charisma: 1 },
        traits: [
          { name: 'Naturally Stealthy', description: 'You can attempt to hide even when you are only obscured by a creature that is at least one size larger than you.' },
        ],
      },
      {
        key: 'stout',
        name: 'Stout',
        abilityBonuses: { constitution: 1 },
        traits: [
          { name: 'Stout Resilience', description: 'You have advantage on saving throws against poison, and resistance against poison damage.' },
        ],
      },
    ],
  },
  {
    key: 'dragonborn',
    name: 'Dragonborn',
    size: 'Medium',
    speed: 30,
    abilityBonuses: { strength: 2, charisma: 1 },
    languages: ['Common', 'Draconic'],
    traits: [
      { name: 'Draconic Ancestry', description: 'Choose a dragon type. This determines the damage type and shape of your breath weapon.' },
      { name: 'Breath Weapon', description: 'You can use your action to exhale destructive energy determined by your draconic ancestry.' },
      { name: 'Damage Resistance', description: 'You have resistance to the damage type associated with your draconic ancestry.' },
    ],
  },
  {
    key: 'gnome',
    name: 'Gnome',
    size: 'Small',
    speed: 25,
    abilityBonuses: { intelligence: 2 },
    languages: ['Common', 'Gnomish'],
    traits: [
      { name: 'Darkvision', description: 'You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.' },
      { name: 'Gnome Cunning', description: 'You have advantage on Intelligence, Wisdom, and Charisma saving throws against magic.' },
    ],
    subraces: [
      {
        key: 'forest-gnome',
        name: 'Forest Gnome',
        abilityBonuses: { dexterity: 1 },
        traits: [
          { name: 'Natural Illusionist', description: 'You know the Minor Illusion cantrip.' },
          { name: 'Speak with Small Beasts', description: 'You can communicate simple ideas with Small or smaller beasts.' },
        ],
      },
      {
        key: 'rock-gnome',
        name: 'Rock Gnome',
        abilityBonuses: { constitution: 1 },
        traits: [
          { name: 'Artificer\u2019s Lore', description: 'You add double your proficiency bonus on History checks related to magic items, alchemical objects, or tech devices.' },
          { name: 'Tinker', description: 'You have proficiency with artisan\u2019s tools (tinker\u2019s tools) and can build small clockwork devices.' },
        ],
      },
    ],
  },
  {
    key: 'half-elf',
    name: 'Half-Elf',
    size: 'Medium',
    speed: 30,
    abilityBonuses: { charisma: 2 },
    abilityBonusChoice: { count: 2, exclude: ['charisma'] }, // +1 to two other scores of choice
    languages: ['Common', 'Elvish', 'One extra language of your choice'],
    traits: [
      { name: 'Darkvision', description: 'You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.' },
      { name: 'Fey Ancestry', description: 'You have advantage on saving throws against being charmed, and magic can\u2019t put you to sleep.' },
      { name: 'Skill Versatility', description: 'You gain proficiency in two skills of your choice.' },
    ],
  },
  {
    key: 'half-orc',
    name: 'Half-Orc',
    size: 'Medium',
    speed: 30,
    abilityBonuses: { strength: 2, constitution: 1 },
    languages: ['Common', 'Orc'],
    traits: [
      { name: 'Darkvision', description: 'You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.' },
      { name: 'Menacing', description: 'You gain proficiency in the Intimidation skill.' },
      { name: 'Relentless Endurance', description: 'When reduced to 0 hit points but not killed outright, you can drop to 1 hit point instead. Once per long rest.' },
      { name: 'Savage Attacks', description: 'When you score a critical hit with a melee weapon attack, you can roll one additional weapon damage die.' },
    ],
  },
  {
    key: 'tiefling',
    name: 'Tiefling',
    size: 'Medium',
    speed: 30,
    abilityBonuses: { intelligence: 1, charisma: 2 },
    languages: ['Common', 'Infernal'],
    traits: [
      { name: 'Darkvision', description: 'You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.' },
      { name: 'Hellish Resistance', description: 'You have resistance to fire damage.' },
      { name: 'Infernal Legacy', description: 'You know the Thaumaturgy cantrip. At 3rd level you can cast Hellish Rebuke, at 5th level Darkness.' },
    ],
  },
];

export function getRace(key) {
  return RACES.find((r) => r.key === key) || null;
}

export function getSubrace(raceKey, subraceKey) {
  const race = getRace(raceKey);
  if (!race?.subraces) return null;
  return race.subraces.find((s) => s.key === subraceKey) || null;
}
