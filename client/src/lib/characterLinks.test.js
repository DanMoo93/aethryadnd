import { describe, it, expect } from 'vitest';
import { characterOptionLabel, findCharacterById, findTokenForCharacter } from './characterLinks';

describe('characterLinks helpers', () => {
  const characters = [
    { id: 'char-1', name: 'Asha', sheet: { class: 'Wizard', level: 3, hp: { current: 10, max: 10 }, armorClass: 12 } },
  ];
  const tokens = [{ id: 'token-1', name: 'Asha Token', characterId: 'char-1' }];

  it('finds characters by id', () => {
    expect(findCharacterById(characters, 'char-1')?.name).toBe('Asha');
    expect(findCharacterById(characters, 'missing')).toBeNull();
  });

  it('finds a token for a character', () => {
    expect(findTokenForCharacter(tokens, 'char-1')?.id).toBe('token-1');
    expect(findTokenForCharacter(tokens, 'missing')).toBeNull();
  });

  it('formats a helpful character label', () => {
    expect(characterOptionLabel(characters[0])).toContain('Asha');
    expect(characterOptionLabel(characters[0])).toContain('Wizard 3');
  });
});
