import { verifyToken } from '../middleware/auth.js';
import { findUserById, getMembership, findSceneById, updateToken, updateFog } from '../db/repository.js';
import { rollDice } from '../dice.js';

// In-memory roll history per campaign (resets on server restart — fine for now,
// move to the repository layer if persistent history matters later).
const rollHistory = new Map(); // campaignId -> array of roll entries

// Set once registerSocketHandlers runs, so REST routes (encounters.js) can
// broadcast combat updates without each route handler needing its own
// socket plumbing. This is the same `io` instance used everywhere else.
let ioInstance = null;

export function broadcastEncounterUpdate(encounterId, encounter) {
  if (!ioInstance) return;
  ioInstance.to(encounterRoom(encounterId)).emit('encounter:updated', { encounter });
}

export function registerSocketHandlers(io) {
  ioInstance = io;

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Missing auth token'));
      const payload = verifyToken(token);
      const user = await findUserById(payload.sub);
      if (!user) return next(new Error('User not found'));
      socket.userId = user.id;
      socket.displayName = user.displayName;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('campaign:join', async ({ campaignId }, callback) => {
      const membership = await getMembership(campaignId, socket.userId);
      if (!membership) {
        return callback?.({ error: 'You are not a member of this campaign' });
      }
      socket.join(roomName(campaignId));
      socket.campaignId = campaignId;
      socket.campaignRole = membership.role;
      const history = rollHistory.get(campaignId) || [];
      callback?.({ ok: true, history });
      socket.to(roomName(campaignId)).emit('campaign:presence', {
        userId: socket.userId,
        displayName: socket.displayName,
        status: 'joined',
      });
    });

    socket.on('dice:roll', ({ campaignId, notation, label }, callback) => {
      try {
        const result = rollDice(notation);
        const entry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          userId: socket.userId,
          displayName: socket.displayName,
          label: label || null,
          ...result,
          rolledAt: new Date().toISOString(),
        };
        const history = rollHistory.get(campaignId) || [];
        history.push(entry);
        if (history.length > 200) history.shift(); // cap memory usage
        rollHistory.set(campaignId, history);

        io.to(roomName(campaignId)).emit('dice:result', entry);
        callback?.({ ok: true, entry });
      } catch (err) {
        callback?.({ error: err.message });
      }
    });

    socket.on('chat:message', ({ campaignId, text }) => {
      if (!text || !text.trim()) return;
      io.to(roomName(campaignId)).emit('chat:message', {
        userId: socket.userId,
        displayName: socket.displayName,
        text: text.trim(),
        sentAt: new Date().toISOString(),
      });
    });

    // ---------- Virtual tabletop: scenes, tokens, fog ----------

    // Join a scene's live room (separate from the campaign room so token
    // chatter doesn't spam players not currently looking at the map).
    socket.on('scene:join', async ({ sceneId }, callback) => {
      const scene = await findSceneById(sceneId);
      if (!scene) return callback?.({ error: 'Scene not found' });
      const membership = await getMembership(scene.campaignId, socket.userId);
      if (!membership) return callback?.({ error: 'You are not a member of this campaign' });
      socket.join(sceneRoom(sceneId));
      socket.activeSceneId = sceneId;
      callback?.({ ok: true, scene, isGm: membership.role === 'gm' });
    });

    socket.on('scene:leave', ({ sceneId }) => {
      socket.leave(sceneRoom(sceneId));
      if (socket.activeSceneId === sceneId) socket.activeSceneId = null;
    });

    // Move a token. Players may move tokens they own; the GM may move any token.
    socket.on('token:move', async ({ sceneId, tokenId, x, y }, callback) => {
      const scene = await findSceneById(sceneId);
      if (!scene) return callback?.({ error: 'Scene not found' });
      const membership = await getMembership(scene.campaignId, socket.userId);
      if (!membership) return callback?.({ error: 'You are not a member of this campaign' });
      const token = scene.tokens.find((t) => t.id === tokenId);
      if (!token) return callback?.({ error: 'Token not found' });
      const isOwner = token.ownerUserId === socket.userId;
      const isGm = membership.role === 'gm';
      if (!isOwner && !isGm) {
        return callback?.({ error: 'You can only move your own token' });
      }
      const updated = await updateToken(sceneId, tokenId, { x, y });
      io.to(sceneRoom(sceneId)).emit('token:moved', { tokenId, x: updated.x, y: updated.y });
      callback?.({ ok: true });
    });

    // GM reveals or hides fog-of-war cells. `cells` is an array of [col, row].
    socket.on('fog:update', async ({ sceneId, cells, mode }, callback) => {
      const scene = await findSceneById(sceneId);
      if (!scene) return callback?.({ error: 'Scene not found' });
      const membership = await getMembership(scene.campaignId, socket.userId);
      if (!membership || membership.role !== 'gm') {
        return callback?.({ error: 'Only the GM can update fog of war' });
      }
      const updated = await updateFog(sceneId, cells, mode);
      io.to(sceneRoom(sceneId)).emit('fog:updated', { revealedCells: updated.revealedCells });
      callback?.({ ok: true });
    });

    // Camera / view broadcasting: GM can set a scene camera (x, y, scale)
    socket.on('camera:set', async ({ sceneId, camera }, callback) => {
      const scene = await findSceneById(sceneId);
      if (!scene) return callback?.({ error: 'Scene not found' });
      const membership = await getMembership(scene.campaignId, socket.userId);
      if (!membership || membership.role !== 'gm') {
        return callback?.({ error: 'Only the GM can set the camera' });
      }
      // Broadcast camera to all clients in the scene
      io.to(sceneRoom(sceneId)).emit('camera:moved', camera);
      callback?.({ ok: true });
    });

    // ---------- Combat tracker ----------
    // Encounter writes happen over REST (encounters.js) since they're
    // infrequent and benefit from normal request/response error handling.
    // Sockets here are just for joining the live room so every connected
    // player gets `encounter:updated` broadcasts the moment the GM acts.

    socket.on('encounter:join', async ({ encounterId }, callback) => {
      // Lightweight room join — REST route already validated membership
      // when the encounter was fetched, so we just need the room joined.
      socket.join(encounterRoom(encounterId));
      callback?.({ ok: true });
    });

    socket.on('encounter:leave', ({ encounterId }) => {
      socket.leave(encounterRoom(encounterId));
    });

    socket.on('disconnect', () => {
      if (socket.campaignId) {
        socket.to(roomName(socket.campaignId)).emit('campaign:presence', {
          userId: socket.userId,
          displayName: socket.displayName,
          status: 'left',
        });
      }
    });
  });
}

function roomName(campaignId) {
  return `campaign:${campaignId}`;
}

function sceneRoom(sceneId) {
  return `scene:${sceneId}`;
}

function encounterRoom(encounterId) {
  return `encounter:${encounterId}`;
}
