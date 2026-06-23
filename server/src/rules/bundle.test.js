import test from 'node:test';
import assert from 'node:assert/strict';
import { getRulesBundle } from './index.js';

test('default edition is 5e and includes wizard class', () => {
  const bundle = getRulesBundle();
  assert.equal(bundle.edition, '5e');
  const hasWizard = bundle.classes.some((c) => c.key === 'wizard');
  assert.ok(hasWizard, 'Wizard should be present in default 5e bundle');
});

test('tasha edition extends bundle', () => {
  const t = getRulesBundle('5e+tasha');
  const hasOrder = t.classes.find((c) => c.key === 'wizard')?.subclasses?.some((s) => s.key === 'order-of-scribes');
  assert.ok(hasOrder, 'Order of the Scribes should be present in 5e+tasha');
});
