import express from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import {
  createScene,
  listScenesForCampaign,
  findSceneById,
  updateScene,
  deleteScene,
  addToken,
  updateToken,
  removeToken,
  updateFog,
  getMembership,
} from '../db/repository.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only PNG, JPEG, WEBP, or GIF images are allowed'));
    }
    cb(null, true);
  },
});

const router = express.Router();
router.use(requireAuth);

async function requireGm(req, res, campaignId) {
  const membership = await getMembership(campaignId, req.userId);
  if (!membership) {
    res.status(403).json({ error: 'You are not a member of this campaign' });
    return null;
  }
  if (membership.role !== 'gm') {
    res.status(403).json({ error: 'Only the GM can do that' });
    return null;
  }
  return membership;
}

// List scenes in a campaign
router.get('/campaign/:campaignId', async (req, res) => {
  const membership = await getMembership(req.params.campaignId, req.userId);
  if (!membership) return res.status(403).json({ error: 'You are not a member of this campaign' });
  const scenes = await listScenesForCampaign(req.params.campaignId);
  res.json({ scenes });
});

// Create a scene (GM only)
router.post('/', async (req, res) => {
  const { campaignId, name, mapUrl } = req.body;
  if (!campaignId || !name) return res.status(400).json({ error: 'campaignId and name are required' });
  const membership = await requireGm(req, res, campaignId);
  if (!membership) return;
  const scene = await createScene({ campaignId, name, mapUrl });
  res.status(201).json({ scene });
});

// Upload a map image (GM only) — returns a URL to use as a scene's mapUrl
router.post('/upload-map', upload.single('map'), async (req, res) => {
  const { campaignId } = req.body;
  if (!campaignId) return res.status(400).json({ error: 'campaignId is required' });
  const membership = await requireGm(req, res, campaignId);
  if (!membership) return;
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  res.status(201).json({ url });
});

// Get a single scene
router.get('/:id', async (req, res) => {
  const scene = await findSceneById(req.params.id);
  if (!scene) return res.status(404).json({ error: 'Scene not found' });
  const membership = await getMembership(scene.campaignId, req.userId);
  if (!membership) return res.status(403).json({ error: 'You are not a member of this campaign' });
  res.json({ scene, isGm: membership.role === 'gm' });
});

// Update scene settings (grid size, fog toggle, name) — GM only
router.patch('/:id', async (req, res) => {
  const scene = await findSceneById(req.params.id);
  if (!scene) return res.status(404).json({ error: 'Scene not found' });
  const membership = await requireGm(req, res, scene.campaignId);
  if (!membership) return;
  const allowed = ['name', 'mapUrl', 'gridWidth', 'gridHeight', 'cellSize', 'fogEnabled'];
  const patch = {};
  for (const key of allowed) {
    if (key in req.body) patch[key] = req.body[key];
  }
  const updated = await updateScene(req.params.id, patch);
  res.json({ scene: updated });
});

// Delete a scene — GM only
router.delete('/:id', async (req, res) => {
  const scene = await findSceneById(req.params.id);
  if (!scene) return res.status(404).json({ error: 'Scene not found' });
  const membership = await requireGm(req, res, scene.campaignId);
  if (!membership) return;
  await deleteScene(req.params.id);
  res.status(204).end();
});

// Add a token to a scene — GM only (players get tokens placed for them;
// live movement after that happens over sockets, not this REST route)
router.post('/:id/tokens', async (req, res) => {
  const scene = await findSceneById(req.params.id);
  if (!scene) return res.status(404).json({ error: 'Scene not found' });
  const membership = await requireGm(req, res, scene.campaignId);
  if (!membership) return;
  const { name, x, y, color, size, imageUrl, ownerUserId, characterId } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const token = await addToken(scene.id, {
    name,
    x: x ?? 0,
    y: y ?? 0,
    color,
    size,
    imageUrl,
    ownerUserId,
    characterId,
  });
  res.status(201).json({ token });
});

// Remove a token — GM only
router.delete('/:id/tokens/:tokenId', async (req, res) => {
  const scene = await findSceneById(req.params.id);
  if (!scene) return res.status(404).json({ error: 'Scene not found' });
  const membership = await requireGm(req, res, scene.campaignId);
  if (!membership) return;
  await removeToken(scene.id, req.params.tokenId);
  res.status(204).end();
});

export default router;
