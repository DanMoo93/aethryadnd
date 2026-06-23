// Database layer.
//
// NOTE: This uses lowdb (a JSON-file-backed store) because the sandbox this
// was prototyped in can't compile native modules (better-sqlite3 / sqlite3 / pg
// all require node-gyp). For real deployment, swap this file for a Postgres
// connection (e.g. using `pg` or an ORM like Prisma/Drizzle) — every other
// module only talks to the functions exported here, never to lowdb directly,
// so that swap should not require touching routes or sockets.

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { mkdirSync } from 'fs';
import { dataDir } from '../config/paths.js';

mkdirSync(dataDir, { recursive: true });
const file = path.join(dataDir, 'db.json');

const defaultData = {
  users: [],        // { id, email, passwordHash, displayName, createdAt }
  campaigns: [],     // { id, name, description, gmId, inviteCode, createdAt }
  memberships: [],   // { id, campaignId, userId, role: 'gm' | 'player' }
  characters: [],    // { id, campaignId, userId, name, sheet: {...}, createdAt }
  scenes: [],        // { id, campaignId, name, mapUrl, gridSize, fogGrid, tokens: [...], createdAt }
  encounters: [],    // { id, sceneId, name, round, currentTurnIndex, isActive, combatants: [...], createdAt }
};

const adapter = new JSONFile(file);
const db = new Low(adapter, defaultData);

export async function initDb() {
  await db.read();
  db.data ||= structuredClone(defaultData);
  await db.write();
  return db;
}

export default db;
