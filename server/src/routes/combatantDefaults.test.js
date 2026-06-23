import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCombatantPayload } from './combatantDefaults.js';

test('buildCombatantPayload prefers linked character defaults', () => {
  const payload = buildCombatantPayload({
    character: {
      id: 'char-1',
      name: 'Asha',
      sheet: { hp: { current: 17, max: 17 }, armorClass: 15 },
    },
    name: '',
    initiative: '12',
  });

  assert.deepEqual(payload, {
    name: 'Asha',
    tokenId: null,
    characterId: 'char-1',
    initiative: 12,
    hp: { current: 17, max: 17 },
    ac: 15,
  });
});

test('buildCombatantPayload falls back to token link and manual values', () => {
  const payload = buildCombatantPayload({
    token: { id: 'token-1', name: 'Skeleton', characterId: 'char-9' },
    name: 'Skeleton Warrior',
    initiative: 5,
    hp: { current: 8, max: 13 },
    ac: 12,
  });

  assert.deepEqual(payload, {
    name: 'Skeleton Warrior',
    tokenId: 'token-1',
    characterId: 'char-9',
    initiative: 5,
    hp: { current: 8, max: 13 },
    ac: 12,
  });
});
