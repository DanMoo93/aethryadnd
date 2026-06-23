import express from 'express';
import {
  getRulesBundle, getSpellSlots, getCantripsKnown, getSpellsKnown, getPreparedSpellCount,
} from '../rules/index.js';

const router = express.Router();

// Rules content is public reference data — no auth required to read it.

function editionFromReq(req) {
  return req.query.edition || '5e';
}

// Full bundle — used by the wizard on first load so it only needs one request.
router.get('/', (req, res) => {
  const edition = editionFromReq(req);
  const bundle = getRulesBundle(edition);
  res.json({
    classes: bundle.classes.map(stripFeatureDescriptionsForList),
    races: bundle.races,
    backgrounds: bundle.backgrounds,
    feats: bundle.feats,
    skills: bundle.skills,
    alignments: bundle.alignments,
    weapons: bundle.weapons,
    armor: bundle.armor,
    adventuringGear: bundle.adventuringGear,
    equipmentPacks: bundle.equipmentPacks,
    abilityScoreMethods: {
      standardArray: bundle.standardArray,
      pointBuy: { costs: bundle.pointBuyCost, totalPoints: bundle.pointBuyTotalPoints },
    },
  });
});

router.get('/classes', (req, res) => {
  const edition = editionFromReq(req);
  const { classes } = getRulesBundle(edition);
  res.json({ classes });
});

router.get('/classes/:key', (req, res) => {
  const edition = editionFromReq(req);
  const { classes } = getRulesBundle(edition);
  const cls = classes.find((c) => c.key === req.params.key);
  if (!cls) return res.status(404).json({ error: 'Class not found' });
  res.json({ class: cls });
});

router.get('/classes/:key/subclasses/:subKey', (req, res) => {
  const edition = editionFromReq(req);
  const { classes } = getRulesBundle(edition);
  const cls = classes.find((c) => c.key === req.params.key);
  if (!cls) return res.status(404).json({ error: 'Class not found' });
  const sub = (cls.subclasses || []).find((s) => s.key === req.params.subKey);
  if (!sub) return res.status(404).json({ error: 'Subclass not found' });
  res.json({ subclass: sub });
});

// Spellcasting profile for a class at a given level — slots, cantrips known,
// spells known/preparable. Used by the wizard's spell-selection step.
router.get('/classes/:key/spellcasting/:level', (req, res) => {
  const edition = editionFromReq(req);
  const { classes } = getRulesBundle(edition);
  const cls = classes.find((c) => c.key === req.params.key);
  if (!cls) return res.status(404).json({ error: 'Class not found' });
  if (!cls.spellcasting) return res.json({ casts: false });
  const level = parseInt(req.params.level, 10) || 1;
  const abilityModifier = parseInt(req.query.abilityModifier, 10) || 0;
  const slots = getSpellSlots(cls.spellcasting.type, level);
  const cantripsKnown = getCantripsKnown(cls.key, level);
  const spellsKnown = getSpellsKnown(cls.key, level);
  const preparedCount =
    cls.spellcasting.knownOrPrepared === 'prepared' ? getPreparedSpellCount(level, abilityModifier) : null;
  res.json({
    casts: true,
    ability: cls.spellcasting.ability,
    type: cls.spellcasting.type,
    knownOrPrepared: cls.spellcasting.knownOrPrepared,
    slots,
    cantripsKnown,
    spellsKnown,
    preparedCount,
  });
});

router.get('/races', (req, res) => {
  const edition = editionFromReq(req);
  const { races } = getRulesBundle(edition);
  res.json({ races });
});

router.get('/races/:key', (req, res) => {
  const edition = editionFromReq(req);
  const { races } = getRulesBundle(edition);
  const race = (races || []).find((r) => r.key === req.params.key);
  if (!race) return res.status(404).json({ error: 'Race not found' });
  res.json({ race });
});

router.get('/backgrounds', (req, res) => {
  const edition = editionFromReq(req);
  const { backgrounds } = getRulesBundle(edition);
  res.json({ backgrounds });
});

router.get('/backgrounds/:key', (req, res) => {
  const edition = editionFromReq(req);
  const { backgrounds } = getRulesBundle(edition);
  const bg = (backgrounds || []).find((b) => b.key === req.params.key);
  if (!bg) return res.status(404).json({ error: 'Background not found' });
  res.json({ background: bg });
});

router.get('/feats', (req, res) => {
  const edition = editionFromReq(req);
  const { feats } = getRulesBundle(edition);
  res.json({ feats });
});

router.get('/equipment', (req, res) => {
  const edition = editionFromReq(req);
  const { weapons, armor, adventuringGear, equipmentPacks } = getRulesBundle(edition);
  res.json({ weapons, armor, gear: adventuringGear, packs: equipmentPacks });
});

// Spells, filterable by class and/or level via query params, e.g.
// /api/rules/spells?class=wizard&level=1
router.get('/spells', (req, res) => {
  const edition = editionFromReq(req);
  let spells = (getRulesBundle(edition).allSpells || []);
  if (req.query.class) {
    spells = spells.filter((s) => s.classes.includes(req.query.class));
  }
  if (req.query.level !== undefined) {
    const level = parseInt(req.query.level, 10);
    spells = spells.filter((s) => s.level === level);
  }
  res.json({ spells });
});

router.get('/spells/:key', (req, res) => {
  const edition = editionFromReq(req);
  const spell = (getRulesBundle(edition).allSpells || []).find((s) => s.key === req.params.key);
  if (!spell) return res.status(404).json({ error: 'Spell not found' });
  res.json({ spell });
});

// Batch lookup: /api/rules/spells-by-keys?keys=fire-bolt,mage-hand,shield
// Used by the character sheet view to resolve a character's known spells
// without firing one request per spell.
router.get('/spells-by-keys', (req, res) => {
  const edition = editionFromReq(req);
  const keys = (req.query.keys || '').split(',').map((k) => k.trim()).filter(Boolean);
  const spells = (getRulesBundle(edition).allSpells || []).filter((s) => keys.includes(s.key));
  res.json({ spells });
});

// Trim subclass feature descriptions out of the top-level class list
// response — the full text comes through the per-class endpoint instead,
// keeping the list payload lighter for the initial wizard load.
function stripFeatureDescriptionsForList(cls) {
  return {
    key: cls.key,
    name: cls.name,
    hitDie: cls.hitDie,
    savingThrows: cls.savingThrows,
    spellcasting: cls.spellcasting,
    subclasses: (cls.subclasses || []).map((s) => ({ key: s.key, name: s.name })),
  };
}

export default router;
