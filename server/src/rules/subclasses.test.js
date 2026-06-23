import { test } from 'node:test';
import { strict as assert } from 'assert';
import { getRulesBundle } from './index.js';

// Basic checks that official subclasses/archetypes were added to the bundle.
// These are structural tests only: existence of keys and placements.

test('bundle includes expected subclasses', () => {
  const b = getRulesBundle('5e');
  const classes = b.classes || [];

  function find(classKey, subKey) {
    const cls = classes.find((c) => c.key === classKey);
    assert.ok(cls, `Missing class ${classKey}`);
    const sub = (cls.subclasses || []).find((s) => s.key === subKey);
    assert.ok(sub, `Missing subclass ${subKey} on ${classKey}`);
  }

  // Paladin oaths
  find('paladin', 'oath-of-devotion');
  find('paladin', 'oath-of-vengeance');
  find('paladin', 'oath-of-the-crown');
  find('paladin', 'oath-of-conquest');
  find('paladin', 'oath-of-the-ancients');
  find('paladin', 'oath-of-redemption');

  // Fighter archetypes
  find('fighter', 'battle-master');
  find('fighter', 'eldritch-knight');

  // Bard
  find('bard', 'college-of-valor');

  // Ranger
  find('ranger', 'beast-master');

  // Rogue
  find('rogue', 'assassin');
  find('rogue', 'arcane-trickster');

  // Sorcerer
  find('sorcerer', 'wild-magic');

  // Cleric domains
  find('cleric', 'war-domain');
  find('cleric', 'trickery-domain');
  find('cleric', 'light-domain');
});
