import { CANTRIPS } from './cantrips.js';
import { LEVEL_1_SPELLS } from './level1.js';
import { LEVEL_2_SPELLS } from './level2.js';
import { LEVEL_3_SPELLS } from './level3.js';
import { LEVEL_4_SPELLS } from './level4.js';
import { LEVEL_5_SPELLS, LEVEL_6_SPELLS, LEVEL_7_SPELLS, LEVEL_8_SPELLS, LEVEL_9_SPELLS } from './level5to9.js';

export const ALL_SPELLS = [
  ...CANTRIPS,
  ...LEVEL_1_SPELLS,
  ...LEVEL_2_SPELLS,
  ...LEVEL_3_SPELLS,
  ...LEVEL_4_SPELLS,
  ...LEVEL_5_SPELLS,
  ...LEVEL_6_SPELLS,
  ...LEVEL_7_SPELLS,
  ...LEVEL_8_SPELLS,
  ...LEVEL_9_SPELLS,
];

export function getSpell(key) {
  return ALL_SPELLS.find((s) => s.key === key) || null;
}

export function getSpellsForClass(classKey) {
  return ALL_SPELLS.filter((s) => s.classes.includes(classKey));
}

export function getSpellsForClassAndLevel(classKey, spellLevel) {
  return ALL_SPELLS.filter((s) => s.classes.includes(classKey) && s.level === spellLevel);
}

export function getCantripsForClass(classKey) {
  return getSpellsForClassAndLevel(classKey, 0);
}
