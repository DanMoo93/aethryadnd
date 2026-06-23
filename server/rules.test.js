import test from 'node:test';
import assert from 'node:assert/strict';
import { getRulesBundle } from './src/rules/index.js';

test('Tasha edition includes artificer', () => {
  const bundle = getRulesBundle('5e+tasha');
  assert(Array.isArray(bundle.classes), 'classes should be an array');
  const hasArtificer = bundle.classes.some((c) => c.key === 'artificer');
  assert.ok(hasArtificer, 'Artificer should be present in 5e+tasha bundle');
});
