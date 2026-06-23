import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  createEncounter,
  listEncountersForScene,
  findEncounterById,
  updateEncounter,
  deleteEncounter,
  addCombatant,
  updateCombatant,
  removeCombatant,
  sortByInitiative,
  advanceTurn,
  findSceneById,
  getMembership,
  findCharacterById,
} from '../db/repository.js';
import { broadcastEncounterUpdate } from '../sockets/index.js';
import { buildCombatantPayload } from './combatantDefaults.js';

const router = express.Router();
router.use(requireAuth);

async function requireGmForScene(req, res, sceneId) {
  const scene = await findSceneById(sceneId);
  if (!scene) {
    res.status(404).json({ error: 'Scene not found' });
    return null;
  }
  const membership = await getMembership(scene.campaignId, req.userId);
  if (!membership) {
    res.status(403).json({ error: 'You are not a member of this campaign' });
    return null;
  }
  if (membership.role !== 'gm') {
    res.status(403).json({ error: 'Only the GM can do that' });
    return null;
  }
  return { scene, membership };
}

async function requireMemberForEncounter(req, res, encounterId) {
  const encounter = await findEncounterById(encounterId);
  if (!encounter) {
    res.status(404).json({ error: 'Encounter not found' });
    return null;
  }
  const scene = await findSceneById(encounter.sceneId);
  if (!scene) {
    res.status(404).json({ error: 'Scene not found' });
    return null;
  }
  const membership = await getMembership(scene.campaignId, req.userId);
  if (!membership) {
    res.status(403).json({ error: 'You are not a member of this campaign' });
    return null;
  }
  return { encounter, scene, membership };
}

// List encounters for a scene (any member)
router.get('/scene/:sceneId', async (req, res) => {
  const scene = await findSceneById(req.params.sceneId);
  if (!scene) return res.status(404).json({ error: 'Scene not found' });
  const membership = await getMembership(scene.campaignId, req.userId);
  if (!membership) return res.status(403).json({ error: 'You are not a member of this campaign' });
  const encounters = await listEncountersForScene(req.params.sceneId);
  res.json({ encounters });
});

// Create an encounter (GM only)
router.post('/', async (req, res) => {
  const { sceneId, name } = req.body;
  if (!sceneId || !name) return res.status(400).json({ error: 'sceneId and name are required' });
  const ctx = await requireGmForScene(req, res, sceneId);
  if (!ctx) return;
  const encounter = await createEncounter({ sceneId, name });
  res.status(201).json({ encounter });
});

// Get a single encounter (any member)
router.get('/:id', async (req, res) => {
  const ctx = await requireMemberForEncounter(req, res, req.params.id);
  if (!ctx) return;
  res.json({ encounter: ctx.encounter, isGm: ctx.membership.role === 'gm' });
});

// Update encounter fields (name, isActive) — GM only
router.patch('/:id', async (req, res) => {
  const ctx = await requireMemberForEncounter(req, res, req.params.id);
  if (!ctx) return;
  if (ctx.membership.role !== 'gm') return res.status(403).json({ error: 'Only the GM can do that' });
  const allowed = ['name', 'isActive', 'round', 'currentTurnIndex'];
  const patch = {};
  for (const key of allowed) {
    if (key in req.body) patch[key] = req.body[key];
  }
  const updated = await updateEncounter(req.params.id, patch);
  broadcastEncounterUpdate(req.params.id, updated);
  res.json({ encounter: updated });
});

// Delete an encounter — GM only
router.delete('/:id', async (req, res) => {
  const ctx = await requireMemberForEncounter(req, res, req.params.id);
  if (!ctx) return;
  if (ctx.membership.role !== 'gm') return res.status(403).json({ error: 'Only the GM can do that' });
  await deleteEncounter(req.params.id);
  res.status(204).end();
});

// Add a combatant — GM only
router.post('/:id/combatants', async (req, res) => {
  const ctx = await requireMemberForEncounter(req, res, req.params.id);
  if (!ctx) return;
  if (ctx.membership.role !== 'gm') return res.status(403).json({ error: 'Only the GM can do that' });
  const { name, tokenId, characterId, initiative, hp, ac } = req.body;
  let token = null;
  if (tokenId) {
    token = ctx.scene.tokens.find((t) => t.id === tokenId) || null;
    if (!token) return res.status(404).json({ error: 'Token not found' });
  }

  let character = null;
  if (characterId) {
    character = await findCharacterById(characterId);
    if (!character) return res.status(404).json({ error: 'Character not found' });
    if (character.campaignId !== ctx.scene.campaignId) {
      return res.status(400).json({ error: 'Character does not belong to this scene' });
    }
    if (token && token.characterId && token.characterId !== characterId) {
      return res.status(400).json({ error: 'Selected token already belongs to a different character' });
    }
  } else if (token?.characterId) {
    character = await findCharacterById(token.characterId);
  }

  const combatantPayload = buildCombatantPayload({ token, character, name, initiative, hp, ac });
  const combatant = await addCombatant(req.params.id, combatantPayload);
  const encounter = await findEncounterById(req.params.id);
  broadcastEncounterUpdate(req.params.id, encounter);
  res.status(201).json({ combatant });
});

// Update a combatant (HP, AC, initiative, conditions) — GM only.
// (Players don't get write access here; if you want players to update
// their own HP, that's a deliberate follow-up — keeping it GM-only for now
// avoids letting one player edit another's HP, and matches how most tables run it.)
router.patch('/:id/combatants/:combatantId', async (req, res) => {
  const ctx = await requireMemberForEncounter(req, res, req.params.id);
  if (!ctx) return;
  if (ctx.membership.role !== 'gm') return res.status(403).json({ error: 'Only the GM can do that' });
  const allowed = ['name', 'initiative', 'hp', 'ac', 'conditions', 'tokenId', 'characterId'];
  const patch = {};
  for (const key of allowed) {
    if (key in req.body) patch[key] = req.body[key];
  }
  const updated = await updateCombatant(req.params.id, req.params.combatantId, patch);
  if (!updated) return res.status(404).json({ error: 'Combatant not found' });
  const encounter = await findEncounterById(req.params.id);
  broadcastEncounterUpdate(req.params.id, encounter);
  res.json({ combatant: updated });
});

// Remove a combatant — GM only
router.delete('/:id/combatants/:combatantId', async (req, res) => {
  const ctx = await requireMemberForEncounter(req, res, req.params.id);
  if (!ctx) return;
  if (ctx.membership.role !== 'gm') return res.status(403).json({ error: 'Only the GM can do that' });
  await removeCombatant(req.params.id, req.params.combatantId);
  const encounter = await findEncounterById(req.params.id);
  broadcastEncounterUpdate(req.params.id, encounter);
  res.status(204).end();
});

// Sort combatants by initiative and reset the turn cursor — GM only
router.post('/:id/sort', async (req, res) => {
  const ctx = await requireMemberForEncounter(req, res, req.params.id);
  if (!ctx) return;
  if (ctx.membership.role !== 'gm') return res.status(403).json({ error: 'Only the GM can do that' });
  const updated = await sortByInitiative(req.params.id);
  broadcastEncounterUpdate(req.params.id, updated);
  res.json({ encounter: updated });
});

// Advance to the next turn — GM only
router.post('/:id/next-turn', async (req, res) => {
  const ctx = await requireMemberForEncounter(req, res, req.params.id);
  if (!ctx) return;
  if (ctx.membership.role !== 'gm') return res.status(403).json({ error: 'Only the GM can do that' });
  const updated = await advanceTurn(req.params.id);
  broadcastEncounterUpdate(req.params.id, updated);
  res.json({ encounter: updated });
});

export default router;
