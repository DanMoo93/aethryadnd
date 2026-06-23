import { describe, it, expect } from 'vitest';
import { abilityModifier, formatModifier, proficiencyBonusForLevel } from './dnd5e';

describe('dnd5e helpers', () => {
  it('computes ability modifier', () => {
    expect(abilityModifier(10)).toBe(0);
    expect(abilityModifier(18)).toBe(4);
    expect(abilityModifier(7)).toBe(-2);
  });

  it('formats modifier', () => {
    expect(formatModifier(3)).toBe('+3');
    expect(formatModifier(-1)).toBe('-1');
  });

  it('proficiency bonus scales with level', () => {
    expect(proficiencyBonusForLevel(1)).toBe(2);
    expect(proficiencyBonusForLevel(5)).toBe(3);
    expect(proficiencyBonusForLevel(9)).toBe(4);
    expect(proficiencyBonusForLevel(17)).toBe(6);
  });
});
