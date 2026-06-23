// Level-up computation: given a character's current sheet and a target
// level, returns what changes (new features, ASI eligibility, spell
// slot/cantrip/spell-known deltas) without mutating anything — the caller
// decides how to apply the results (e.g. after the player picks ASI vs feat,
// or picks new spells).

import { getClass, featuresUpToLevel } from './classes.js';
import { getSpellSlots, getCantripsKnown, getSpellsKnown, getPreparedSpellCount } from './spellSlots.js';

const ASI_LEVELS = [4, 8, 12, 16, 19];

function proficiencyBonusForLevel(level) {
  return Math.ceil(level / 4) + 1;
}

export function getLevelUpPreview(sheet, targetLevel) {
  const cls = getClass(sheet.classKey);
  if (!cls) throw new Error('Character has no recognized class — can\u2019t compute level-up.');
  if (targetLevel <= sheet.level) throw new Error('Target level must be higher than current level.');
  if (targetLevel > 20) throw new Error('Level 20 is the maximum.');

  const oldFeatures = featuresUpToLevel(sheet.classKey, sheet.subclassKey, sheet.level);
  const newFeatures = featuresUpToLevel(sheet.classKey, sheet.subclassKey, targetLevel);
  const oldKeys = new Set(oldFeatures.map((f) => `${f.source}:${f.name}`));
  const gainedFeatures = newFeatures.filter((f) => !oldKeys.has(`${f.source}:${f.name}`));

  // Does any newly-gained feature require a subclass pick that hasn't been made?
  const needsSubclassChoice =
    !sheet.subclassKey && gainedFeatures.some((f) => f.isSubclassChoice);

  // ASI levels crossed between old and new level (inclusive of target, exclusive of current)
  const asiLevelsGained = ASI_LEVELS.filter((l) => l > sheet.level && l <= targetLevel);

  const hitDieAverage = Math.floor(cls.hitDie / 2) + 1; // standard "average" rule

  let spellDelta = null;
  if (cls.spellcasting) {
    const oldSlots = getSpellSlots(cls.spellcasting.type, sheet.level) || new Array(9).fill(0);
    const newSlots = getSpellSlots(cls.spellcasting.type, targetLevel) || new Array(9).fill(0);
    const oldCantrips = getCantripsKnown(cls.key, sheet.level);
    const newCantrips = getCantripsKnown(cls.key, targetLevel);
    const oldSpellsKnown = getSpellsKnown(cls.key, sheet.level);
    const newSpellsKnown = getSpellsKnown(cls.key, targetLevel);
    spellDelta = {
      slots: { old: oldSlots, new: newSlots },
      cantripsKnown: { old: oldCantrips, new: newCantrips, gained: newCantrips - oldCantrips },
      // null for prepared casters (they don't have a fixed "known" count)
      spellsKnown:
        oldSpellsKnown !== null
          ? { old: oldSpellsKnown, new: newSpellsKnown, gained: newSpellsKnown - oldSpellsKnown }
          : null,
    };
  }

  return {
    fromLevel: sheet.level,
    toLevel: targetLevel,
    gainedFeatures,
    needsSubclassChoice,
    availableSubclasses: needsSubclassChoice ? cls.subclasses : [],
    asiLevelsGained,
    hitDie: cls.hitDie,
    hitDieAverage,
    newProficiencyBonus: proficiencyBonusForLevel(targetLevel),
    spellDelta,
  };
}

// Applies a chosen HP roll (or average), ASI/feat choices, and subclass
// choice to produce the patch to send to the character API. `hpGains` is an
// array of per-level HP gains (one per level crossed), `asiChoices` is an
// array of { type: 'asi', abilities: [a,b] } or { type: 'feat', featKey }
// matching asiLevelsGained in order.
export function buildLevelUpPatch(sheet, preview, { hpGains, subclassKey, asiChoices }) {
  const totalHpGain = hpGains.reduce((sum, n) => sum + n, 0);
  const newMaxHp = sheet.hp.max + totalHpGain;

  const patch = {
    level: preview.toLevel,
    proficiencyBonus: preview.newProficiencyBonus,
    hp: { ...sheet.hp, max: newMaxHp, current: sheet.hp.current + totalHpGain },
  };

  if (subclassKey) patch.subclassKey = subclassKey;

  if (asiChoices && asiChoices.length > 0) {
    const abilities = { ...sheet.abilities };
    const feats = [...(sheet.feats || [])];
    for (const choice of asiChoices) {
      if (choice.type === 'asi') {
        for (const ability of choice.abilities) {
          abilities[ability] = Math.min(20, (abilities[ability] || 10) + 1);
        }
      } else if (choice.type === 'feat' && choice.featKey) {
        feats.push(choice.featKey);
      }
    }
    patch.abilities = abilities;
    patch.feats = feats;
  }

  const gainedFeatureRecords = preview.gainedFeatures.map((f) => ({
    id: `${f.source}-${f.name}-${f.level}`.toLowerCase().replace(/\s+/g, '-'),
    name: f.name,
    description: f.description,
    source: f.source,
    level: f.level,
  }));
  patch.features = [...(sheet.features || []), ...gainedFeatureRecords];

  return patch;
}
