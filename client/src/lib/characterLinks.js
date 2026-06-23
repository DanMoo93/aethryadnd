export function findCharacterById(characters, characterId) {
  return characters.find((character) => character.id === characterId) || null;
}

export function findTokenForCharacter(tokens, characterId) {
  return tokens.find((token) => token.characterId === characterId) || null;
}

export function describeCharacter(character) {
  if (!character) return null;
  const sheet = character.sheet || {};
  return {
    id: character.id,
    name: character.name || 'Unknown character',
    className: sheet.class || 'Unknown class',
    level: sheet.level || 1,
    hpCurrent: sheet.hp?.current ?? null,
    hpMax: sheet.hp?.max ?? null,
    ac: sheet.armorClass ?? null,
  };
}

export function characterOptionLabel(character) {
  const summary = describeCharacter(character);
  if (!summary) return 'Unknown character';
  return `${summary.name} (${summary.className} ${summary.level})`;
}
