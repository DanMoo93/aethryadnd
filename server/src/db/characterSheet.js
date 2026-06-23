// D&D 5e character sheet shape + derived-stat helpers.
// This is the canonical schema. Both client and server should treat this
// as the source of truth for what a "character sheet" contains.

export const ABILITIES = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];

export const SKILLS = [
  { key: 'acrobatics', ability: 'dexterity' },
  { key: 'animalHandling', ability: 'wisdom' },
  { key: 'arcana', ability: 'intelligence' },
  { key: 'athletics', ability: 'strength' },
  { key: 'deception', ability: 'charisma' },
  { key: 'history', ability: 'intelligence' },
  { key: 'insight', ability: 'wisdom' },
  { key: 'intimidation', ability: 'charisma' },
  { key: 'investigation', ability: 'intelligence' },
  { key: 'medicine', ability: 'wisdom' },
  { key: 'nature', ability: 'intelligence' },
  { key: 'perception', ability: 'wisdom' },
  { key: 'performance', ability: 'charisma' },
  { key: 'persuasion', ability: 'charisma' },
  { key: 'religion', ability: 'intelligence' },
  { key: 'sleightOfHand', ability: 'dexterity' },
  { key: 'stealth', ability: 'dexterity' },
  { key: 'survival', ability: 'wisdom' },
];

export function defaultSheet() {
  return {
    class: '',
    classKey: '',          // rules lookup key, e.g. 'wizard'
    subclass: '',
    subclassKey: '',
    level: 1,
    race: '',
    raceKey: '',
    subraceKey: '',
    background: '',
    backgroundKey: '',
    alignment: '',
    abilities: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    abilityScoreMethod: 'standard-array', // 'standard-array' | 'point-buy' | 'roll'
    proficientSkills: [],      // array of skill keys
    proficiencyBonus: 2,        // derived from level, but stored for override flexibility
    savingThrowProficiencies: [], // ability keys, derived from class
    hp: { current: 10, max: 10, temp: 0 },
    armorClass: 10,
    speed: 30,
    inventory: [],               // [{ id, name, quantity, weight, notes }]
    weapons: [],                 // [{ key, name }] selected from the equipment catalog
    armorWorn: null,             // { key, name } selected armor, or null
    shield: false,
    spellcasting: null,          // { ability, type, knownOrPrepared } from the class profile, or null
    cantripsKnown: [],            // array of spell keys
    spellsKnown: [],               // array of spell keys (known casters) or prepared list (prepared casters)
    feats: [],                     // array of feat keys
    features: [],                // [{ id, name, description, source, level }]
    notes: '',
  };
}

export function abilityModifier(score) {
  return Math.floor((score - 10) / 2);
}

export function proficiencyBonusForLevel(level) {
  return Math.ceil(level / 4) + 1;
}

export function skillBonus(sheet, skillKey) {
  const skill = SKILLS.find((s) => s.key === skillKey);
  if (!skill) return 0;
  const mod = abilityModifier(sheet.abilities[skill.ability]);
  const isProficient = sheet.proficientSkills.includes(skillKey);
  return mod + (isProficient ? sheet.proficiencyBonus : 0);
}

export function passivePerception(sheet) {
  return 10 + skillBonus(sheet, 'perception');
}
