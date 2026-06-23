import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  createCampaign,
  findCampaignById,
  findCampaignByInviteCode,
  listCampaignsForUser,
  getMembership,
  joinCampaign,
  listMembers,
} from '../db/repository.js';

const router = express.Router();

router.use(requireAuth);

// List campaigns the current user belongs to (as GM or player)
router.get('/', async (req, res) => {
  const campaigns = await listCampaignsForUser(req.userId);
  res.json({ campaigns });
});

// Create a new campaign (creator becomes GM)
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const campaign = await createCampaign({ name, description, gmId: req.userId });
  res.status(201).json({ campaign });
});

// Get a single campaign (must be a member)
router.get('/:id', async (req, res) => {
  const campaign = await findCampaignById(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
  const membership = await getMembership(campaign.id, req.userId);
  if (!membership) return res.status(403).json({ error: 'You are not a member of this campaign' });
  const members = await listMembers(campaign.id);
  res.json({ campaign, membership, members });
});

// Join a campaign via invite code
router.post('/join', async (req, res) => {
  const { inviteCode } = req.body;
  if (!inviteCode) return res.status(400).json({ error: 'inviteCode is required' });
  const campaign = await findCampaignByInviteCode(inviteCode);
  if (!campaign) return res.status(404).json({ error: 'No campaign found with that invite code' });
  const membership = await joinCampaign({ campaignId: campaign.id, userId: req.userId });
  res.json({ campaign, membership });
});

export default router;
