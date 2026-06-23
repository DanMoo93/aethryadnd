// Repository layer: all reads/writes to the data store go through these
// functions. Routes and sockets call these, never `db` directly. This is
// the seam to replace when moving from lowdb to Postgres.

import db from './index.js';
import { v4 as uuid } from 'uuid';

function now() {
  return new Date().toISOString();
}

// ---------- Users ----------

export async function createUser({ email, passwordHash, displayName }) {
  await db.read();
  const user = { id: uuid(), email, passwordHash, displayName, createdAt: now() };
  db.data.users.push(user);
  await db.write();
  return user;
}

export async function findUserByEmail(email) {
  await db.read();
  return db.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function findUserById(id) {
  await db.read();
  return db.data.users.find((u) => u.id === id) || null;
}

// ---------- Campaigns ----------

function generateInviteCode() {
  // Short, readable code like "BX7K2Q"
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function createCampaign({ name, description, gmId }) {
  await db.read();
  const campaign = {
    id: uuid(),
    name,
    description: description || '',
    gmId,
    inviteCode: generateInviteCode(),
    createdAt: now(),
  };
  db.data.campaigns.push(campaign);
  db.data.memberships.push({ id: uuid(), campaignId: campaign.id, userId: gmId, role: 'gm' });
  await db.write();
  return campaign;
}

export async function findCampaignById(id) {
  await db.read();
  return db.data.campaigns.find((c) => c.id === id) || null;
}

export async function findCampaignByInviteCode(code) {
  await db.read();
  return db.data.campaigns.find((c) => c.inviteCode === code.toUpperCase()) || null;
}

export async function listCampaignsForUser(userId) {
  await db.read();
  const membershipCampaignIds = db.data.memberships
    .filter((m) => m.userId === userId)
    .map((m) => m.campaignId);
  return db.data.campaigns.filter((c) => membershipCampaignIds.includes(c.id));
}

export async function getMembership(campaignId, userId) {
  await db.read();
  return (
    db.data.memberships.find((m) => m.campaignId === campaignId && m.userId === userId) || null
  );
}

export async function joinCampaign({ campaignId, userId, role = 'player' }) {
  await db.read();
  const existing = await getMembership(campaignId, userId);
  if (existing) return existing;
  const membership = { id: uuid(), campaignId, userId, role };
  db.data.memberships.push(membership);
  await db.write();
  return membership;
}

export async function listMembers(campaignId) {
  await db.read();
  const members = db.data.memberships.filter((m) => m.campaignId === campaignId);
  return members.map((m) => {
    const user = db.data.users.find((u) => u.id === m.userId);
    return { userId: m.userId, role: m.role, displayName: user?.displayName || 'Unknown' };
  });
}

// ---------- Characters ----------

export async function createCharacter({ campaignId, userId, name, sheet }) {
  await db.read();
  const character = {
    id: uuid(),
    campaignId,
    userId,
    name,
    sheet,
    status: 'pending',
    statusReason: null,
    createdAt: now(),
    updatedAt: now(),
  };
  db.data.characters.push(character);
  await db.write();
  return character;
}

export async function findCharacterById(id) {
  await db.read();
  return db.data.characters.find((c) => c.id === id) || null;
}

export async function listCharactersForCampaign(campaignId) {
  await db.read();
  return db.data.characters.filter((c) => c.campaignId === campaignId);
}

export async function listCharactersForUser(userId) {
  await db.read();
  return db.data.characters.filter((c) => c.userId === userId);
}

export async function updateCharacterSheet(id, sheet) {
  await db.read();
  const character = db.data.characters.find((c) => c.id === id);
  if (!character) return null;
  character.sheet = { ...character.sheet, ...sheet };
  character.updatedAt = now();
  await db.write();
  return character;
}

export async function approveCharacter(id, approverId) {
  await db.read();
  const character = db.data.characters.find((c) => c.id === id);
  if (!character) return null;
  character.status = 'approved';
  character.statusReason = null;
  character.approvedAt = now();
  character.approvedBy = approverId || null;
  character.updatedAt = now();
  await db.write();
  return character;
}

export async function rejectCharacter(id, reason, approverId) {
  await db.read();
  const character = db.data.characters.find((c) => c.id === id);
  if (!character) return null;
  character.status = 'rejected';
  character.statusReason = reason || null;
  character.approvedAt = null;
  character.approvedBy = approverId || null;
  character.updatedAt = now();
  await db.write();
  return character;
}

export async function listPendingCharactersForCampaign(campaignId) {
  await db.read();
  return db.data.characters.filter((c) => c.campaignId === campaignId && c.status === 'pending');
}

export async function deleteCharacter(id) {
  await db.read();
  const idx = db.data.characters.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  db.data.characters.splice(idx, 1);
  await db.write();
  return true;
}

// ---------- Scenes (virtual tabletop) ----------

function defaultSceneFields() {
  return {
    gridWidth: 30,
    gridHeight: 20,
    cellSize: 50,
    fogEnabled: true,
    revealedCells: [], // array of [col, row] pairs that are NOT fogged
    tokens: [],          // [{ id, name, x, y, color, size, imageUrl, ownerUserId, characterId }]
  };
}

export async function createScene({ campaignId, name, mapUrl }) {
  await db.read();
  const scene = {
    id: uuid(),
    campaignId,
    name,
    mapUrl: mapUrl || null,
    ...defaultSceneFields(),
    createdAt: now(),
  };
  db.data.scenes.push(scene);
  await db.write();
  return scene;
}

export async function listScenesForCampaign(campaignId) {
  await db.read();
  return db.data.scenes.filter((s) => s.campaignId === campaignId);
}

export async function findSceneById(id) {
  await db.read();
  return db.data.scenes.find((s) => s.id === id) || null;
}

export async function updateScene(id, patch) {
  await db.read();
  const scene = db.data.scenes.find((s) => s.id === id);
  if (!scene) return null;
  Object.assign(scene, patch);
  await db.write();
  return scene;
}

export async function deleteScene(id) {
  await db.read();
  const idx = db.data.scenes.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  db.data.scenes.splice(idx, 1);
  await db.write();
  return true;
}

export async function addToken(sceneId, token) {
  await db.read();
  const scene = db.data.scenes.find((s) => s.id === sceneId);
  if (!scene) return null;
  const newToken = { id: uuid(), size: 1, color: '#8b2e2e', ...token };
  scene.tokens.push(newToken);
  await db.write();
  return newToken;
}

export async function updateToken(sceneId, tokenId, patch) {
  await db.read();
  const scene = db.data.scenes.find((s) => s.id === sceneId);
  if (!scene) return null;
  const token = scene.tokens.find((t) => t.id === tokenId);
  if (!token) return null;
  Object.assign(token, patch);
  await db.write();
  return token;
}

export async function removeToken(sceneId, tokenId) {
  await db.read();
  const scene = db.data.scenes.find((s) => s.id === sceneId);
  if (!scene) return false;
  const idx = scene.tokens.findIndex((t) => t.id === tokenId);
  if (idx === -1) return false;
  scene.tokens.splice(idx, 1);
  await db.write();
  return true;
}

// Reveal or hide a set of cells. `mode` is 'reveal' | 'hide'.
export async function updateFog(sceneId, cells, mode) {
  await db.read();
  const scene = db.data.scenes.find((s) => s.id === sceneId);
  if (!scene) return null;
  const key = ([c, r]) => `${c},${r}`;
  const revealedSet = new Set(scene.revealedCells.map(key));
  for (const cell of cells) {
    if (mode === 'reveal') revealedSet.add(key(cell));
    else revealedSet.delete(key(cell));
  }
  scene.revealedCells = Array.from(revealedSet).map((k) => k.split(',').map(Number));
  await db.write();
  return scene;
}

// ---------- Encounters (combat tracker) ----------

export async function createEncounter({ sceneId, name }) {
  await db.read();
  const encounter = {
    id: uuid(),
    sceneId,
    name,
    round: 1,
    currentTurnIndex: 0,
    isActive: false,
    combatants: [], // [{ id, tokenId, characterId, name, initiative, hp: {current, max}, ac, conditions: [] }]
    createdAt: now(),
  };
  db.data.encounters.push(encounter);
  await db.write();
  return encounter;
}

export async function listEncountersForScene(sceneId) {
  await db.read();
  return db.data.encounters.filter((e) => e.sceneId === sceneId);
}

export async function findEncounterById(id) {
  await db.read();
  return db.data.encounters.find((e) => e.id === id) || null;
}

export async function updateEncounter(id, patch) {
  await db.read();
  const encounter = db.data.encounters.find((e) => e.id === id);
  if (!encounter) return null;
  Object.assign(encounter, patch);
  await db.write();
  return encounter;
}

export async function deleteEncounter(id) {
  await db.read();
  const idx = db.data.encounters.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  db.data.encounters.splice(idx, 1);
  await db.write();
  return true;
}

export async function addCombatant(encounterId, combatant) {
  await db.read();
  const encounter = db.data.encounters.find((e) => e.id === encounterId);
  if (!encounter) return null;
  const newCombatant = {
    id: uuid(),
    initiative: 0,
    hp: { current: 10, max: 10 },
    ac: 10,
    conditions: [],
    ...combatant,
  };
  encounter.combatants.push(newCombatant);
  await db.write();
  return newCombatant;
}

export async function updateCombatant(encounterId, combatantId, patch) {
  await db.read();
  const encounter = db.data.encounters.find((e) => e.id === encounterId);
  if (!encounter) return null;
  const combatant = encounter.combatants.find((c) => c.id === combatantId);
  if (!combatant) return null;
  Object.assign(combatant, patch);
  await db.write();
  return combatant;
}

export async function removeCombatant(encounterId, combatantId) {
  await db.read();
  const encounter = db.data.encounters.find((e) => e.id === encounterId);
  if (!encounter) return false;
  const idx = encounter.combatants.findIndex((c) => c.id === combatantId);
  if (idx === -1) return false;
  encounter.combatants.splice(idx, 1);
  // Keep currentTurnIndex in bounds if we removed someone before/at the cursor
  if (encounter.currentTurnIndex >= encounter.combatants.length) {
    encounter.currentTurnIndex = Math.max(0, encounter.combatants.length - 1);
  }
  await db.write();
  return true;
}

// Sort combatants by initiative descending (ties keep insertion order) and
// reset the turn cursor to the top. Call this when starting combat or
// whenever initiative values change and the GM wants to re-sort.
export async function sortByInitiative(encounterId) {
  await db.read();
  const encounter = db.data.encounters.find((e) => e.id === encounterId);
  if (!encounter) return null;
  encounter.combatants = [...encounter.combatants]
    .map((c, i) => ({ c, i }))
    .sort((a, b) => b.c.initiative - a.c.initiative || a.i - b.i)
    .map(({ c }) => c);
  encounter.currentTurnIndex = 0;
  await db.write();
  return encounter;
}

// Advance to the next combatant's turn, incrementing the round when it
// wraps back to the top.
export async function advanceTurn(encounterId) {
  await db.read();
  const encounter = db.data.encounters.find((e) => e.id === encounterId);
  if (!encounter || encounter.combatants.length === 0) return encounter;
  const next = encounter.currentTurnIndex + 1;
  if (next >= encounter.combatants.length) {
    encounter.currentTurnIndex = 0;
    encounter.round += 1;
  } else {
    encounter.currentTurnIndex = next;
  }
  await db.write();
  return encounter;
}
