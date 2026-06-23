import { CLASSES } from './classes.js';
import { RACES, getRace, getSubrace } from './races.js';
import { BACKGROUNDS, getBackground } from './backgrounds.js';
import { FEATS, getFeat } from './feats.js';
import { WEAPONS, ARMOR, ADVENTURING_GEAR, EQUIPMENT_PACKS, getWeapon, getArmor, getGear, getPack } from './equipment.js';
import { getSpellSlots, getCantripsKnown, getSpellsKnown, getPreparedSpellCount } from './spellSlots.js';
import { ALL_SPELLS, getSpell, getSpellsForClass, getSpellsForClassAndLevel, getCantripsForClass } from './spells/index.js';
import { getLevelUpPreview, buildLevelUpPatch } from './levelUp.js';

export { RACES, getRace, getSubrace };
export { BACKGROUNDS, getBackground };
export { FEATS, getFeat };
export { WEAPONS, ARMOR, ADVENTURING_GEAR, EQUIPMENT_PACKS, getWeapon, getArmor, getGear, getPack };
export { CLASSES as _CLASSES, getClass, getSubclass, featuresUpToLevel } from './classes.js';
export { getSpellSlots, getCantripsKnown, getSpellsKnown, getPreparedSpellCount };
export { ALL_SPELLS, getSpell, getSpellsForClass, getSpellsForClassAndLevel, getCantripsForClass };
export { getLevelUpPreview, buildLevelUpPatch };

export const SKILLS = [
  { key: 'acrobatics', name: 'Acrobatics', ability: 'dexterity' },
  { key: 'animalHandling', name: 'Animal Handling', ability: 'wisdom' },
  { key: 'arcana', name: 'Arcana', ability: 'intelligence' },
  { key: 'athletics', name: 'Athletics', ability: 'strength' },
  { key: 'deception', name: 'Deception', ability: 'charisma' },
  { key: 'history', name: 'History', ability: 'intelligence' },
  { key: 'insight', name: 'Insight', ability: 'wisdom' },
  { key: 'intimidation', name: 'Intimidation', ability: 'charisma' },
  { key: 'investigation', name: 'Investigation', ability: 'intelligence' },
  { key: 'medicine', name: 'Medicine', ability: 'wisdom' },
  { key: 'nature', name: 'Nature', ability: 'intelligence' },
  { key: 'perception', name: 'Perception', ability: 'wisdom' },
  { key: 'performance', name: 'Performance', ability: 'charisma' },
  { key: 'persuasion', name: 'Persuasion', ability: 'charisma' },
  { key: 'religion', name: 'Religion', ability: 'intelligence' },
  { key: 'sleightOfHand', name: 'Sleight of Hand', ability: 'dexterity' },
  { key: 'stealth', name: 'Stealth', ability: 'dexterity' },
  { key: 'survival', name: 'Survival', ability: 'wisdom' },
];

export const ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil',
];

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

export const POINT_BUY_COST = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
};
export const POINT_BUY_TOTAL_POINTS = 27;

// Build an edition-aware bundle. Currently only '5e' supported; this
// centralizes edition metadata and allows future edition modules to be
// plugged in under server/src/rules/{edition}.
import { extendWithTasha } from './5e_tasha.js';
import { extendWithFaerun } from './5e_faerun.js';

export function getRulesBundle(edition = '5e') {
  // Map classes to annotate with edition/source metadata. Individual class
  // entries may include a `source` field; default to 'SRD' for now.
  const classes = (CLASSES || []).map((c) => ({ ...c, edition, source: c.source || 'SRD' }));

  let bundle = {
    edition,
    classes,
    races: RACES,
    backgrounds: BACKGROUNDS,
    feats: FEATS,
    skills: SKILLS,
    alignments: ALIGNMENTS,
    weapons: WEAPONS,
    armor: ARMOR,
    adventuringGear: ADVENTURING_GEAR,
    equipmentPacks: EQUIPMENT_PACKS,
    allSpells: ALL_SPELLS,
    standardArray: STANDARD_ARRAY,
    pointBuyCost: POINT_BUY_COST,
    pointBuyTotalPoints: POINT_BUY_TOTAL_POINTS,
  };

  // Support edition modifiers, e.g. '5e+tasha' to include Tasha additions.
  const parts = (edition || '').split('+').map((p) => p.trim().toLowerCase());
  if (parts.includes('tasha')) bundle = extendWithTasha(bundle);
  if (parts.includes('faerun')) bundle = extendWithFaerun(bundle);

  return bundle;
}
