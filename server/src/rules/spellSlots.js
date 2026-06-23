// Spell slot tables by caster type and character level. Index 0 = level 1.
// Each row is slots for spell levels [1st, 2nd, 3rd, 4th, 5th, 6th, 7th, 8th, 9th].

const FULL_CASTER_SLOTS = [
  [2, 0, 0, 0, 0, 0, 0, 0, 0],   // 1
  [3, 0, 0, 0, 0, 0, 0, 0, 0],   // 2
  [4, 2, 0, 0, 0, 0, 0, 0, 0],   // 3
  [4, 3, 0, 0, 0, 0, 0, 0, 0],   // 4
  [4, 3, 2, 0, 0, 0, 0, 0, 0],   // 5
  [4, 3, 3, 0, 0, 0, 0, 0, 0],   // 6
  [4, 3, 3, 1, 0, 0, 0, 0, 0],   // 7
  [4, 3, 3, 2, 0, 0, 0, 0, 0],   // 8
  [4, 3, 3, 3, 1, 0, 0, 0, 0],   // 9
  [4, 3, 3, 3, 2, 0, 0, 0, 0],   // 10
  [4, 3, 3, 3, 2, 1, 0, 0, 0],   // 11
  [4, 3, 3, 3, 2, 1, 0, 0, 0],   // 12
  [4, 3, 3, 3, 2, 1, 1, 0, 0],   // 13
  [4, 3, 3, 3, 2, 1, 1, 0, 0],   // 14
  [4, 3, 3, 3, 2, 1, 1, 1, 0],   // 15
  [4, 3, 3, 3, 2, 1, 1, 1, 0],   // 16
  [4, 3, 3, 3, 2, 1, 1, 1, 1],   // 17
  [4, 3, 3, 3, 3, 1, 1, 1, 1],   // 18
  [4, 3, 3, 3, 3, 2, 1, 1, 1],   // 19
  [4, 3, 3, 3, 3, 2, 2, 1, 1],   // 20
];

// Half casters (Paladin, Ranger) start getting slots at level 2, using the
// "effective full-caster level" of ceil(level/2).
const HALF_CASTER_SLOTS = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],   // 1
  [2, 0, 0, 0, 0, 0, 0, 0, 0],   // 2
  [3, 0, 0, 0, 0, 0, 0, 0, 0],   // 3
  [3, 0, 0, 0, 0, 0, 0, 0, 0],   // 4
  [4, 2, 0, 0, 0, 0, 0, 0, 0],   // 5
  [4, 2, 0, 0, 0, 0, 0, 0, 0],   // 6
  [4, 3, 0, 0, 0, 0, 0, 0, 0],   // 7
  [4, 3, 0, 0, 0, 0, 0, 0, 0],   // 8
  [4, 3, 2, 0, 0, 0, 0, 0, 0],   // 9
  [4, 3, 2, 0, 0, 0, 0, 0, 0],   // 10
  [4, 3, 3, 0, 0, 0, 0, 0, 0],   // 11
  [4, 3, 3, 0, 0, 0, 0, 0, 0],   // 12
  [4, 3, 3, 1, 0, 0, 0, 0, 0],   // 13
  [4, 3, 3, 1, 0, 0, 0, 0, 0],   // 14
  [4, 3, 3, 2, 0, 0, 0, 0, 0],   // 15
  [4, 3, 3, 2, 0, 0, 0, 0, 0],   // 16
  [4, 3, 3, 3, 1, 0, 0, 0, 0],   // 17
  [4, 3, 3, 3, 1, 0, 0, 0, 0],   // 18
  [4, 3, 3, 3, 2, 0, 0, 0, 0],   // 19
  [4, 3, 3, 3, 2, 0, 0, 0, 0],   // 20
];

// Pact magic (Warlock): a small number of slots, but they're always cast at
// the highest level the warlock has access to. Format: [slotCount, slotLevel].
const PACT_MAGIC_SLOTS = [
  [1, 1],  // 1
  [2, 1],  // 2
  [2, 2],  // 3
  [2, 2],  // 4
  [2, 3],  // 5
  [2, 3],  // 6
  [2, 4],  // 7
  [2, 4],  // 8
  [2, 5],  // 9
  [2, 5],  // 10
  [3, 5],  // 11
  [3, 5],  // 12
  [3, 5],  // 13
  [3, 5],  // 14
  [3, 5],  // 15
  [3, 5],  // 16
  [4, 5],  // 17
  [4, 5],  // 18
  [4, 5],  // 19
  [4, 5],  // 20
];

// Cantrips known, by full-caster level (Bard, Cleric, Druid, Sorcerer, Wizard
// all share this curve in the SRD; Warlock has its own below).
const CANTRIPS_KNOWN_FULL = [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
const CANTRIPS_KNOWN_WARLOCK = [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];

export function getSpellSlots(casterType, level) {
  if (!casterType || level < 1) return null;
  const idx = Math.min(level, 20) - 1;
  if (casterType === 'full') return FULL_CASTER_SLOTS[idx];
  if (casterType === 'half') return HALF_CASTER_SLOTS[idx];
  if (casterType === 'pact') {
    const [count, slotLevel] = PACT_MAGIC_SLOTS[idx];
    const slots = new Array(9).fill(0);
    slots[slotLevel - 1] = count;
    return slots;
  }
  return null;
}

export function getCantripsKnown(classKey, level) {
  const idx = Math.min(level, 20) - 1;
  if (classKey === 'warlock') return CANTRIPS_KNOWN_WARLOCK[idx];
  // Half-casters (paladin, ranger) don't get cantrips in the SRD.
  if (classKey === 'paladin' || classKey === 'ranger') return 0;
  return CANTRIPS_KNOWN_FULL[idx];
}

// Spells known, for "known caster" classes (Bard, Ranger, Sorcerer, Warlock).
// Wizards and clerics/druids/paladins "prepare" from their full list instead
// of having a fixed known-spells count, so this only applies to known casters.
const SPELLS_KNOWN = {
  bard: [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22],
  sorcerer: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15],
  warlock: [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
  ranger: [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11],
};

export function getSpellsKnown(classKey, level) {
  const table = SPELLS_KNOWN[classKey];
  if (!table) return null; // prepared casters: not applicable
  return table[Math.min(level, 20) - 1];
}

// Number of spells a prepared caster (Cleric, Druid, Paladin, Wizard) can
// have prepared = caster level + relevant ability modifier (minimum 1).
// The wizard skill expression mirrors the SRD wording exactly.
export function getPreparedSpellCount(level, abilityModifier) {
  return Math.max(1, level + abilityModifier);
}
