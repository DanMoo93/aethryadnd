import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  createCharacter,
  findCharacterById,
  listCharactersForCampaign,
  updateCharacterSheet,
  deleteCharacter,
  approveCharacter,
  rejectCharacter,
  listPendingCharactersForCampaign,
  getMembership,
} from '../db/repository.js';
import { defaultSheet } from '../db/characterSheet.js';
import { getLevelUpPreview, buildLevelUpPatch } from '../rules/levelUp.js';

const router = express.Router();

router.use(requireAuth);

function canEdit(character, userId, membership) {
  return character.userId === userId || membership.role === 'gm';
}

// List characters in a campaign (must be a member)
router.get('/campaign/:campaignId', async (req, res) => {
  const membership = await getMembership(req.params.campaignId, req.userId);
  if (!membership) return res.status(403).json({ error: 'You are not a member of this campaign' });
  const characters = await listCharactersForCampaign(req.params.campaignId);
  res.json({ characters });
});

// Create a character in a campaign
router.post('/', async (req, res) => {
  const { campaignId, name, sheet } = req.body;
  if (!campaignId || !name) {
    return res.status(400).json({ error: 'campaignId and name are required' });
  }
  const membership = await getMembership(campaignId, req.userId);
  if (!membership) return res.status(403).json({ error: 'You are not a member of this campaign' });
  const character = await createCharacter({
    campaignId,
    userId: req.userId,
    name,
    sheet: { ...defaultSheet(), ...sheet },
  });
  res.status(201).json({ character });
});

// Get a single character
router.get('/:id', async (req, res) => {
  const character = await findCharacterById(req.params.id);
  if (!character) return res.status(404).json({ error: 'Character not found' });
  const membership = await getMembership(character.campaignId, req.userId);
  if (!membership) return res.status(403).json({ error: 'You are not a member of this campaign' });
  res.json({ character });
});

// Update a character's sheet (owner or GM only)
router.patch('/:id', async (req, res) => {
  const character = await findCharacterById(req.params.id);
  if (!character) return res.status(404).json({ error: 'Character not found' });
  const membership = await getMembership(character.campaignId, req.userId);
  if (!membership) return res.status(403).json({ error: 'You are not a member of this campaign' });
  const isOwner = character.userId === req.userId;
  const isGm = membership.role === 'gm';
  if (!isOwner && !isGm) {
    return res.status(403).json({ error: 'Only the character owner or the GM can edit this sheet' });
  }
  const updated = await updateCharacterSheet(req.params.id, req.body.sheet || {});
  res.json({ character: updated });
});

// Delete a character (owner or GM only)
router.delete('/:id', async (req, res) => {
  const character = await findCharacterById(req.params.id);
  if (!character) return res.status(404).json({ error: 'Character not found' });
  const membership = await getMembership(character.campaignId, req.userId);
  if (!membership) return res.status(403).json({ error: 'You are not a member of this campaign' });
  const isOwner = character.userId === req.userId;
  const isGm = membership.role === 'gm';
  if (!isOwner && !isGm) {
    return res.status(403).json({ error: 'Only the character owner or the GM can delete this sheet' });
  }
  await deleteCharacter(req.params.id);
  res.status(204).end();
});

// List pending characters for a campaign (GM only)
router.get('/campaign/:campaignId/pending', async (req, res) => {
  const membership = await getMembership(req.params.campaignId, req.userId);
  if (!membership) return res.status(403).json({ error: 'You are not a member of this campaign' });
  if (membership.role !== 'gm') return res.status(403).json({ error: 'Only the GM can view pending character approvals' });
  const pending = await listPendingCharactersForCampaign(req.params.campaignId);
  res.json({ pending });
});

// Approve a pending character (GM only)
router.post('/:id/approve', async (req, res) => {
  const character = await findCharacterById(req.params.id);
  if (!character) return res.status(404).json({ error: 'Character not found' });
  const membership = await getMembership(character.campaignId, req.userId);
  if (!membership) return res.status(403).json({ error: 'You are not a member of this campaign' });
  if (membership.role !== 'gm') return res.status(403).json({ error: 'Only the GM can approve characters' });
  const updated = await approveCharacter(req.params.id, req.userId);
  res.json({ character: updated });
});

// Reject a pending character (GM only)
router.post('/:id/reject', async (req, res) => {
  const { reason } = req.body;
  const character = await findCharacterById(req.params.id);
  if (!character) return res.status(404).json({ error: 'Character not found' });
  const membership = await getMembership(character.campaignId, req.userId);
  if (!membership) return res.status(403).json({ error: 'You are not a member of this campaign' });
  if (membership.role !== 'gm') return res.status(403).json({ error: 'Only the GM can reject characters' });
  const updated = await rejectCharacter(req.params.id, reason, req.userId);
  res.json({ character: updated });
});

// Preview what a level-up to `toLevel` would grant, without changing anything.
// Used by the level-up wizard to show the player what's coming before they
// make ASI/subclass/spell choices.
router.get('/:id/level-up-preview/:toLevel', async (req, res) => {
  const character = await findCharacterById(req.params.id);
  if (!character) return res.status(404).json({ error: 'Character not found' });
  const membership = await getMembership(character.campaignId, req.userId);
  if (!membership) return res.status(403).json({ error: 'You are not a member of this campaign' });
  if (!canEdit(character, req.userId, membership)) {
    return res.status(403).json({ error: 'Only the character owner or the GM can level up this character' });
  }
  try {
    const toLevel = parseInt(req.params.toLevel, 10);
    const preview = getLevelUpPreview(character.sheet, toLevel);
    res.json({ preview });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Apply a level-up: takes the same target level plus the player's choices
// (HP gains per level, subclass pick if newly required, ASI/feat picks),
// computes the patch, and saves it to the character.
router.post('/:id/level-up', async (req, res) => {
  const character = await findCharacterById(req.params.id);
  if (!character) return res.status(404).json({ error: 'Character not found' });
  const membership = await getMembership(character.campaignId, req.userId);
  if (!membership) return res.status(403).json({ error: 'You are not a member of this campaign' });
  if (!canEdit(character, req.userId, membership)) {
    return res.status(403).json({ error: 'Only the character owner or the GM can level up this character' });
  }
  try {
    const { toLevel, hpGains, subclassKey, asiChoices, cantripsToAdd, spellsToAdd } = req.body;
    const finalSubclassKey = subclassKey || character.sheet.subclassKey;
    // Compute the preview against the character's *eventual* subclass, not
    // just what it had before this level-up. Otherwise subclass features
    // unlocked at the same level the subclass was chosen (e.g. a level-2
    // Wizard picking Arcane Tradition also gets that subclass's level-2
    // features) would be silently skipped.
    const sheetWithFinalSubclass = { ...character.sheet, subclassKey: finalSubclassKey };
    const preview = getLevelUpPreview(sheetWithFinalSubclass, toLevel);
    const patch = buildLevelUpPatch(character.sheet, preview, {
      hpGains: hpGains || [],
      subclassKey: finalSubclassKey,
      asiChoices: asiChoices || [],
    });
    if (cantripsToAdd?.length) {
      patch.cantripsKnown = [...(character.sheet.cantripsKnown || []), ...cantripsToAdd];
    }
    if (spellsToAdd?.length) {
      patch.spellsKnown = [...(character.sheet.spellsKnown || []), ...spellsToAdd];
    }
    const updated = await updateCharacterSheet(req.params.id, patch);
    res.json({ character: updated, appliedFeatures: preview.gainedFeatures });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
