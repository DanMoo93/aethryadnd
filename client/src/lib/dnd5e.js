export const ABILITIES = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
export const ABILITY_LABELS = {
  strength: 'Strength', dexterity: 'Dexterity', constitution: 'Constitution',
  intelligence: 'Intelligence', wisdom: 'Wisdom', charisma: 'Charisma',
};

export function abilityModifier(score) {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod) {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function proficiencyBonusForLevel(level) {
  return Math.ceil(level / 4) + 1;
}

export function rollDie(sides) {
  return 1 + Math.floor(Math.random() * sides);
}

// Roll 4d6, drop the lowest — the classic "roll for stats" method.
export function roll4d6DropLowest() {
  const rolls = [rollDie(6), rollDie(6), rollDie(6), rollDie(6)];
  rolls.sort((a, b) => a - b);
  rolls.shift(); // drop lowest
  return rolls.reduce((sum, r) => sum + r, 0);
}

export function rollAbilityScoreSet() {
  return ABILITIES.reduce((acc, ability) => {
    acc[ability] = roll4d6DropLowest();
    return acc;
  }, {});
}
