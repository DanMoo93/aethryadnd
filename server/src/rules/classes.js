// SRD 5.1 classes. Each class has: hit die, saving throw proficiencies,
// armor/weapon proficiencies, skill choices, starting equipment options,
// a spellcasting profile (or null), and a level-gated feature table.
// Subclasses are nested with their own level-gated features.
//
// `spellcasting`: null for non-casters. Otherwise:
//   { ability, type: 'full'|'half'|'third'|'pact', knownOrPrepared: 'known'|'prepared',
//     cantripsKnown: [levelArray], spellsKnown: [levelArray] (for 'known' casters) }
// Spell slot tables are derived in spellSlots.js rather than duplicated per class.

export const CLASSES = [
  {
    key: 'barbarian',
    name: 'Barbarian',
    hitDie: 12,
    savingThrows: ['strength', 'constitution'],
    armorProficiencies: ['Light armor', 'Medium armor', 'Shields'],
    weaponProficiencies: ['Simple weapons', 'Martial weapons'],
    toolProficiencies: [],
    skillChoices: { count: 2, options: ['animalHandling', 'athletics', 'intimidation', 'nature', 'perception', 'survival'] },
    startingEquipment: {
      choices: [
        { options: [{ items: ['Greataxe'] }, { items: ['Any martial melee weapon'] }] },
        { options: [{ items: ['Two handaxes'] }, { items: ['Any simple weapon'] }] },
      ],
      fixed: ['Explorer\u2019s pack', '4 javelins'],
    },
    spellcasting: null,
    features: [
      { level: 1, name: 'Rage', description: 'In battle, you fight with primal ferocity. As a bonus action you can enter a rage that gives you advantage on Strength checks/saves, bonus melee damage, and resistance to bludgeoning/piercing/slashing damage.' },
      { level: 1, name: 'Unarmored Defense', description: 'While not wearing armor, your AC equals 10 + Dexterity modifier + Constitution modifier.' },
      { level: 2, name: 'Reckless Attack', description: 'You can attack recklessly, gaining advantage on melee Strength attack rolls this turn, but attacks against you have advantage until your next turn.' },
      { level: 2, name: 'Danger Sense', description: 'You have advantage on Dexterity saving throws against effects you can see, such as traps and spells, as long as you aren\u2019t blinded, deafened, or incapacitated.' },
      { level: 3, name: 'Primal Path', description: 'Choose a subclass (Primal Path) that shapes the nature of your rage.', isSubclassChoice: true },
      { level: 5, name: 'Extra Attack', description: 'You can attack twice, instead of once, whenever you take the Attack action on your turn.' },
      { level: 5, name: 'Fast Movement', description: 'Your speed increases by 10 feet while you aren\u2019t wearing heavy armor.' },
      { level: 7, name: 'Feral Instinct', description: 'You have advantage on initiative rolls, and can act normally even if surprised, as long as you aren\u2019t incapacitated, provided you enter your rage first.' },
      { level: 9, name: 'Brutal Critical', description: 'You can roll one additional weapon damage die when determining the extra damage for a critical hit with a melee attack.' },
      { level: 11, name: 'Relentless Rage', description: 'If you drop to 0 hit points while raging and don\u2019t die outright, you can make a DC 10 Constitution save to drop to 1 HP instead.' },
      { level: 15, name: 'Persistent Rage', description: 'Your rage is so fierce that it only ends early if you fall unconscious or choose to end it.' },
      { level: 18, name: 'Indomitable Might', description: 'If your total for a Strength check is less than your Strength score, you can use that score in place of the total.' },
      { level: 20, name: 'Primal Champion', description: 'Your Strength and Constitution scores increase by 4, to a maximum of 24.' },
    ],
    subclasses: [
      {
        key: 'berserker',
        name: 'Path of the Berserker',
        features: [
          { level: 3, name: 'Frenzy', description: 'You can go into a frenzy when you rage, making a single melee weapon attack as a bonus action on each of your turns, at the cost of exhaustion when the rage ends.' },
          { level: 6, name: 'Mindless Rage', description: 'You can\u2019t be charmed or frightened while raging. If charmed or frightened when you enter your rage, the effect is suspended.' },
          { level: 10, name: 'Intimidating Presence', description: 'You can use your action to frighten someone with your menacing presence.' },
          { level: 14, name: 'Retaliation', description: 'When you take damage from a creature within 5 feet, you can use your reaction to make a melee weapon attack against that creature.' },
        ],
      },
    ],
  },
  {
    key: 'bard',
    name: 'Bard',
    hitDie: 8,
    savingThrows: ['dexterity', 'charisma'],
    armorProficiencies: ['Light armor'],
    weaponProficiencies: ['Simple weapons', 'Hand crossbows', 'Longswords', 'Rapiers', 'Shortswords'],
    toolProficiencies: ['Three musical instruments of your choice'],
    skillChoices: { count: 3, options: ['acrobatics', 'animalHandling', 'arcana', 'athletics', 'deception', 'history', 'insight', 'intimidation', 'investigation', 'medicine', 'nature', 'perception', 'performance', 'persuasion', 'religion', 'sleightOfHand', 'stealth', 'survival'] },
    startingEquipment: {
      choices: [
        { options: [{ items: ['Rapier'] }, { items: ['Longsword'] }, { items: ['Any simple weapon'] }] },
        { options: [{ items: ['Diplomat\u2019s pack'] }, { items: ['Entertainer\u2019s pack'] }] },
        { options: [{ items: ['Lute'] }, { items: ['Any other musical instrument'] }] },
      ],
      fixed: ['Leather armor', 'A dagger'],
    },
    spellcasting: { ability: 'charisma', type: 'full', knownOrPrepared: 'known', focus: 'musical instrument' },
    features: [
      { level: 1, name: 'Spellcasting', description: 'You have learned to untangle and reshape the fabric of reality in harmony with your wishes and music.' },
      { level: 1, name: 'Bardic Inspiration', description: 'You can inspire others through stirring words or music, giving an ally a Bardic Inspiration die (d6) to add to one ability check, attack roll, or saving throw.' },
      { level: 2, name: 'Jack of All Trades', description: 'You can add half your proficiency bonus, rounded down, to any ability check that doesn\u2019t already include your proficiency bonus.' },
      { level: 2, name: 'Song of Rest', description: 'You can use soothing music or oration to help revitalize wounded allies during a short rest, granting extra hit points recovered.' },
      { level: 3, name: 'Bard College', description: 'Choose a subclass (Bard College) that grants you special features.', isSubclassChoice: true },
      { level: 3, name: 'Expertise', description: 'Choose two of your skill proficiencies. Your proficiency bonus is doubled for any ability check you make using either of the chosen proficiencies.' },
      { level: 5, name: 'Font of Inspiration', description: 'You regain all your expended uses of Bardic Inspiration when you finish a short or long rest.' },
      { level: 6, name: 'Countercharm', description: 'You can use musical notes or words of power to disrupt mind-influencing effects, giving nearby allies advantage on saves against being frightened or charmed.' },
      { level: 10, name: 'Magical Secrets', description: 'You learn two spells of your choice from any class, ignoring the normal restriction that you can learn only bard spells.' },
      { level: 20, name: 'Superior Inspiration', description: 'When you roll initiative and have no uses of Bardic Inspiration left, you regain one use.' },
    ],
    subclasses: [
      {
        key: 'college-of-lore',
        name: 'College of Lore',
        features: [
          { level: 3, name: 'Bonus Proficiencies', description: 'You gain proficiency with three skills of your choice.' },
          { level: 3, name: 'Cutting Words', description: 'You can use your reaction to expend a Bardic Inspiration die to subtract it from an enemy\u2019s attack, ability check, or damage roll.' },
          { level: 6, name: 'Additional Magical Secrets', description: 'You learn two spells of your choice from any class. They count as bard spells for you.' },
          { level: 14, name: 'Peerless Skill', description: 'When you make an ability check, you can expend one use of Bardic Inspiration and add the die to your check.' },
        ],
      },
      {
        key: 'college-of-valor',
        name: 'College of Valor',
        features: [
          { level: 3, name: 'Bonus Proficiencies', description: 'You gain proficiency with medium armor, shields, and martial weapons.' },
          { level: 3, name: 'Combat Inspiration', description: 'You can use Bardic Inspiration to bolster allies in combat, improving attacks or AC.' },
          { level: 6, name: 'Extra Attack', description: 'You can attack twice when you take the Attack action.' },
          { level: 14, name: 'Battle Magic', description: 'You can cast a spell and make a weapon attack in quick succession.' },
        ],
      },
    ],
  },
  {
    key: 'cleric',
    name: 'Cleric',
    hitDie: 8,
    savingThrows: ['wisdom', 'charisma'],
    armorProficiencies: ['Light armor', 'Medium armor', 'Shields'],
    weaponProficiencies: ['Simple weapons'],
    toolProficiencies: [],
    skillChoices: { count: 2, options: ['history', 'insight', 'medicine', 'persuasion', 'religion'] },
    startingEquipment: {
      choices: [
        { options: [{ items: ['Mace'] }, { items: ['Warhammer (if proficient)'] }] },
        { options: [{ items: ['Scale mail'] }, { items: ['Leather armor'] }, { items: ['Chain mail (if proficient)'] }] },
        { options: [{ items: ['A light crossbow and 20 bolts'] }, { items: ['Any simple weapon'] }] },
        { options: [{ items: ['Priest\u2019s pack'] }, { items: ['Explorer\u2019s pack'] }] },
      ],
      fixed: ['A shield', 'A holy symbol'],
    },
    spellcasting: { ability: 'wisdom', type: 'full', knownOrPrepared: 'prepared', focus: 'holy symbol' },
    features: [
      { level: 1, name: 'Spellcasting', description: 'As a conduit for divine power, you can cast cleric spells.' },
      { level: 1, name: 'Divine Domain', description: 'Choose a domain related to your deity, granting domain spells and special features.', isSubclassChoice: true },
      { level: 2, name: 'Channel Divinity', description: 'You gain the ability to channel divine energy directly from your deity, fueling magical effects. Includes Turn Undead.' },
      { level: 5, name: 'Destroy Undead', description: 'When an undead fails its save against your Turn Undead, it is instantly destroyed if its challenge rating is at or below a threshold that increases with level.' },
      { level: 10, name: 'Divine Intervention', description: 'You can call on your deity to intervene on your behalf when your need is great.' },
    ],
    subclasses: [
      {
        key: 'life-domain',
        name: 'Life Domain',
        features: [
          { level: 1, name: 'Bonus Proficiency', description: 'You gain proficiency with heavy armor.' },
          { level: 1, name: 'Disciple of Life', description: 'Whenever you use a spell of 1st level or higher to restore hit points to a creature, that creature regains additional hit points.' },
          { level: 2, name: 'Channel Divinity: Preserve Life', description: 'You can use Channel Divinity to heal the badly wounded, restoring a pool of hit points divided among creatures of your choice.' },
          { level: 6, name: 'Blessed Healer', description: 'The healing spells you cast on others also heal you.' },
          { level: 8, name: 'Divine Strike', description: 'Once per turn you can deal an extra 1d8 radiant damage to a target you hit with a weapon attack.' },
          { level: 17, name: 'Supreme Healing', description: 'When you would normally roll dice to restore hit points with a spell, you instead use the highest possible result for each die.' },
        ],
      },
      {
        key: 'war-domain',
        name: 'War Domain',
        features: [
          { level: 1, name: 'Bonus Proficiency', description: 'You gain proficiency with martial weapons.' },
          { level: 2, name: 'War Priest', description: 'You can channel divine fury to make additional weapon attacks as a reaction.' },
          { level: 6, name: 'Divine Strike', description: 'You can deal extra damage once per turn with a weapon attack.' },
          { level: 17, name: 'Avatar of Battle', description: 'You embody the fury of war, gaining advantages in combat.' },
        ],
      },
      {
        key: 'trickery-domain',
        name: 'Trickery Domain',
        features: [
          { level: 1, name: 'Blessing of the Trickster', description: 'You can grant advantage on Stealth checks to a willing creature.' },
          { level: 2, name: 'Channel Divinity: Invoke Duplicity', description: 'You can create an illusory duplicate to distract enemies.' },
          { level: 6, name: 'Channel Divinity: Cloak of Shadows', description: 'You can use your channel divinity to blend into shadows.' },
          { level: 17, name: 'Improved Duplicity', description: 'Your duplicity becomes more convincing and durable.' },
        ],
      },
      {
        key: 'light-domain',
        name: 'Light Domain',
        features: [
          { level: 1, name: 'Bonus Cantrip', description: 'You learn a cantrip that produces light or radiant effects.' },
          { level: 2, name: 'Channel Divinity: Radiance of the Dawn', description: 'You can dispel magical darkness and damage enemies with radiant energy.' },
          { level: 6, name: 'Improved Radiance', description: 'Your radiance inflames foes, weakening their resistance.' },
          { level: 17, name: 'Corona of Light', description: 'You create a powerful aura that harms hostile creatures.' },
        ],
      },
    ],
  },
  {
    key: 'druid',
    name: 'Druid',
    hitDie: 8,
    savingThrows: ['intelligence', 'wisdom'],
    armorProficiencies: ['Light armor', 'Medium armor (nonmetal)', 'Shields (nonmetal)'],
    weaponProficiencies: ['Clubs', 'Daggers', 'Darts', 'Javelins', 'Maces', 'Quarterstaffs', 'Scimitars', 'Sickles', 'Slings', 'Spears'],
    toolProficiencies: ['Herbalism kit'],
    skillChoices: { count: 2, options: ['arcana', 'animalHandling', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'] },
    startingEquipment: {
      choices: [
        { options: [{ items: ['Wooden shield'] }, { items: ['Any simple weapon'] }] },
        { options: [{ items: ['Scimitar'] }, { items: ['Any simple melee weapon'] }] },
      ],
      fixed: ['Leather armor', 'An explorer\u2019s pack', 'A druidic focus'],
    },
    spellcasting: { ability: 'wisdom', type: 'full', knownOrPrepared: 'prepared', focus: 'druidic focus' },
    features: [
      { level: 1, name: 'Druidic', description: 'You know Druidic, the secret language of druids, and can leave hidden messages that other druids automatically spot.' },
      { level: 1, name: 'Spellcasting', description: 'Drawing on the divine essence of nature itself, you can cast spells to shape that essence to your will.' },
      { level: 2, name: 'Wild Shape', description: 'You can use your action to magically assume the shape of a beast that you have seen before.' },
      { level: 2, name: 'Druid Circle', description: 'Choose a circle of druids that grants you features at certain levels.', isSubclassChoice: true },
      { level: 18, name: 'Timeless Body', description: 'For every 10 years that pass, your body ages only 1 year.' },
      { level: 20, name: 'Archdruid', description: 'You can use Wild Shape an unlimited number of times.' },
    ],
    subclasses: [
      {
        key: 'circle-of-the-land',
        name: 'Circle of the Land',
        features: [
          { level: 2, name: 'Bonus Cantrip', description: 'You learn one additional druid cantrip of your choice.' },
          { level: 2, name: 'Natural Recovery', description: 'You can recover some of your magical energy by spending time in meditation, regaining spell slots during a short rest.' },
          { level: 3, name: 'Circle Spells', description: 'Your mystical connection to the land infuses you with the ability to cast certain spells tied to the type of land you chose.' },
          { level: 6, name: 'Land\u2019s Stride', description: 'Moving through nonmagical difficult terrain costs you no extra movement, and you have advantage on saves against plants that impede movement.' },
          { level: 10, name: 'Nature\u2019s Ward', description: 'You can\u2019t be charmed or frightened by elementals or fey, and you are immune to poison damage and being poisoned.' },
          { level: 14, name: 'Nature\u2019s Sanctuary', description: 'Creatures of the natural world sense your connection to nature and become reluctant to attack you.' },
        ],
      },
    ],
  },
  {
    key: 'fighter',
    name: 'Fighter',
    hitDie: 10,
    savingThrows: ['strength', 'constitution'],
    armorProficiencies: ['Light armor', 'Medium armor', 'Heavy armor', 'Shields'],
    weaponProficiencies: ['Simple weapons', 'Martial weapons'],
    toolProficiencies: [],
    skillChoices: { count: 2, options: ['acrobatics', 'animalHandling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'] },
    startingEquipment: {
      choices: [
        { options: [{ items: ['Chain mail'] }, { items: ['Leather armor, a longbow, and 20 arrows'] }] },
        { options: [{ items: ['A martial weapon and a shield'] }, { items: ['Two martial weapons'] }] },
        { options: [{ items: ['A light crossbow and 20 bolts'] }, { items: ['Two handaxes'] }] },
        { options: [{ items: ['A dungeoneer\u2019s pack'] }, { items: ['An explorer\u2019s pack'] }] },
      ],
      fixed: [],
    },
    spellcasting: null,
    features: [
      { level: 1, name: 'Fighting Style', description: 'You adopt a particular style of fighting as your specialty, such as Archery, Defense, Dueling, or Great Weapon Fighting.' },
      { level: 1, name: 'Second Wind', description: 'You have a limited well of stamina you can draw on to protect yourself from harm, regaining hit points as a bonus action.' },
      { level: 2, name: 'Action Surge', description: 'You can push yourself beyond your normal limits, taking one additional action on your turn.' },
      { level: 3, name: 'Martial Archetype', description: 'Choose an archetype that you strive to emulate in your combat styles and techniques.', isSubclassChoice: true },
      { level: 5, name: 'Extra Attack', description: 'You can attack twice, instead of once, whenever you take the Attack action on your turn.' },
      { level: 9, name: 'Indomitable', description: 'You can reroll a saving throw that you fail. If you do so, you must use the new roll.' },
      { level: 11, name: 'Extra Attack (2)', description: 'You can attack three times, instead of once, whenever you take the Attack action on your turn.' },
      { level: 20, name: 'Extra Attack (3)', description: 'You can attack four times, instead of once, whenever you take the Attack action on your turn.' },
    ],
    subclasses: [
      {
        key: 'champion',
        name: 'Champion',
        features: [
          { level: 3, name: 'Improved Critical', description: 'Your weapon attacks score a critical hit on a roll of 19 or 20.' },
          { level: 7, name: 'Remarkable Athlete', description: 'You can add half your proficiency bonus to any Strength, Dexterity, or Constitution check that doesn\u2019t already use your proficiency bonus.' },
          { level: 10, name: 'Additional Fighting Style', description: 'You can choose a second option from the Fighting Style feature.' },
          { level: 15, name: 'Superior Critical', description: 'Your weapon attacks score a critical hit on a roll of 18\u201320.' },
          { level: 18, name: 'Survivor', description: 'At the start of each turn you regain hit points if you have no more than half your hit point maximum left and aren\u2019t at 0.' },
        ],
      },
      {
        key: 'battle-master',
        name: 'Battle Master',
        features: [
          { level: 3, name: 'Combat Superiority', description: 'You learn maneuvers that allow you to parry, trip, or disarm foes by expending superiority dice.' },
          { level: 7, name: 'Student of War', description: 'You gain proficiency with a type of artisan\'s tools and can apply tactical knowledge to combat.' },
          { level: 10, name: 'Improved Combat Superiority', description: 'Your superiority dice improve and you learn more maneuver options.' },
          { level: 15, name: 'Relentless', description: 'You regain some superiority dice when you roll initiative.' },
        ],
      },
      {
        key: 'eldritch-knight',
        name: 'Eldritch Knight',
        features: [
          { level: 3, name: 'Spellcasting', description: 'You learn a small selection of wizard spells and can bond a weapon for magical effects.' },
          { level: 7, name: 'War Magic', description: 'You can weave spells and weapon attacks together with improved efficiency.' },
          { level: 10, name: 'Improved War Magic', description: 'Your blending of magic and martial skill becomes more potent.' },
          { level: 15, name: 'Arcane Charge', description: 'You can teleport short distances as part of your martial prowess.' },
        ],
      },
    ],
  },
];

import { CLASSES_PART_2 } from './classesPart2.js';
CLASSES.push(...CLASSES_PART_2);

export function getClass(key) {
  return CLASSES.find((c) => c.key === key) || null;
}

export function getSubclass(classKey, subclassKey) {
  const cls = getClass(classKey);
  if (!cls) return null;
  return cls.subclasses.find((s) => s.key === subclassKey) || null;
}

// Returns all features (class + subclass) available at or before `level`,
// sorted by level then class-before-subclass for readability.
export function featuresUpToLevel(classKey, subclassKey, level) {
  const cls = getClass(classKey);
  if (!cls) return [];
  const classFeatures = cls.features
    .filter((f) => f.level <= level)
    .map((f) => ({ ...f, source: cls.name }));
  let subclassFeatures = [];
  if (subclassKey) {
    const sub = getSubclass(classKey, subclassKey);
    if (sub) {
      subclassFeatures = sub.features
        .filter((f) => f.level <= level)
        .map((f) => ({ ...f, source: sub.name }));
    }
  }
  return [...classFeatures, ...subclassFeatures].sort((a, b) => a.level - b.level);
}
