// Parses standard dice notation like "1d20+5", "2d6", "1d8-1", "4d6kh3" (keep highest 3).
// Returns { total, rolls, notation, modifier }.

const DICE_REGEX = /^(\d+)d(\d+)(kh\d+|kl\d+)?([+-]\d+)?$/i;

export function rollDice(notation) {
  const match = notation.replace(/\s+/g, '').match(DICE_REGEX);
  if (!match) {
    throw new Error(`Invalid dice notation: "${notation}". Try formats like "1d20+5" or "2d6".`);
  }
  const [, countStr, sidesStr, keepStr, modStr] = match;
  const count = parseInt(countStr, 10);
  const sides = parseInt(sidesStr, 10);
  const modifier = modStr ? parseInt(modStr, 10) : 0;

  if (count < 1 || count > 100) throw new Error('Dice count must be between 1 and 100');
  if (sides < 2 || sides > 1000) throw new Error('Dice sides must be between 2 and 1000');

  const rolls = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * sides));

  let keptRolls = rolls;
  if (keepStr) {
    const keepCount = parseInt(keepStr.slice(2), 10);
    const sorted = [...rolls].sort((a, b) => b - a);
    keptRolls = keepStr.toLowerCase().startsWith('kh')
      ? sorted.slice(0, keepCount)
      : sorted.slice(-keepCount);
  }

  const total = keptRolls.reduce((sum, r) => sum + r, 0) + modifier;

  return { notation, rolls, keptRolls, modifier, total };
}
