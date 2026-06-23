import express from 'express';
import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail } from '../db/repository.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { findUserById } from '../db/repository.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, displayName } = req.body;
  if (!email || !password || !displayName) {
    return res.status(400).json({ error: 'email, password, and displayName are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  const existing = await findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with that email already exists' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser({ email, passwordHash, displayName });
  const token = signToken(user);
  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, displayName: user.displayName },
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const token = signToken(user);
  res.json({ token, user: { id: user.id, email: user.email, displayName: user.displayName } });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await findUserById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, email: user.email, displayName: user.displayName });
});

export default router;
