import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import { initDb } from './db/index.js';
import { uploadsDir } from './config/paths.js';
import authRoutes from './routes/auth.js';
import campaignRoutes from './routes/campaigns.js';
import characterRoutes from './routes/characters.js';
import sceneRoutes from './routes/scenes.js';
import encounterRoutes from './routes/encounters.js';
import rulesRoutes from './routes/rules.js';
import { registerSocketHandlers } from './sockets/index.js';

dotenv.config();

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

async function main() {
  await initDb();

  const app = express();
  app.use(cors({ origin: CLIENT_ORIGIN }));
  app.use(express.json());
  app.use('/uploads', express.static(uploadsDir));

  app.get('/api/health', (req, res) => res.json({ ok: true }));
  app.use('/api/auth', authRoutes);
  app.use('/api/campaigns', campaignRoutes);
  app.use('/api/characters', characterRoutes);
  app.use('/api/scenes', sceneRoutes);
  app.use('/api/encounters', encounterRoutes);
  app.use('/api/rules', rulesRoutes);

  // Fallback error handler
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: CLIENT_ORIGIN },
  });
  registerSocketHandlers(io);

  httpServer.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
