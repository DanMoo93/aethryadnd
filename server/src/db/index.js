import { mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { Pool } from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', '..', 'data');
mkdirSync(dataDir, { recursive: true });

const defaultData = {
  users: [], // { id, email, passwordHash, displayName, createdAt }
  campaigns: [], // { id, name, description, gmId, inviteCode, createdAt }
  memberships: [], // { id, campaignId, userId, role }
  characters: [], // { id, campaignId, userId, name, sheet, status, ... }
  scenes: [], // { id, campaignId, name, mapUrl, gridWidth, gridHeight, cellSize, fogEnabled, revealedCells, tokens, createdAt }
  encounters: [], // { id, sceneId, name, round, currentTurnIndex, isActive, combatants, createdAt }
};

function createDbShape() {
  return structuredClone(defaultData);
}

function shouldUseSsl(connectionString) {
  return connectionString && !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1');
}

function toIso(value) {
  return value || new Date().toISOString();
}

function toPgRows(data) {
  return {
    users: data.users.map((row) => ({
      id: row.id,
      email: row.email,
      password_hash: row.passwordHash,
      display_name: row.displayName,
      created_at: toIso(row.createdAt),
    })),
    campaigns: data.campaigns.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description || '',
      gm_id: row.gmId,
      invite_code: row.inviteCode,
      created_at: toIso(row.createdAt),
    })),
    memberships: data.memberships.map((row) => ({
      id: row.id,
      campaign_id: row.campaignId,
      user_id: row.userId,
      role: row.role,
    })),
    characters: data.characters.map((row) => ({
      id: row.id,
      campaign_id: row.campaignId,
      user_id: row.userId,
      name: row.name,
      sheet: row.sheet,
      status: row.status,
      status_reason: row.statusReason,
      approved_at: row.approvedAt,
      approved_by: row.approvedBy,
      created_at: toIso(row.createdAt),
      updated_at: toIso(row.updatedAt),
    })),
    scenes: data.scenes.map((row) => ({
      id: row.id,
      campaign_id: row.campaignId,
      name: row.name,
      map_url: row.mapUrl,
      grid_width: row.gridWidth,
      grid_height: row.gridHeight,
      cell_size: row.cellSize,
      fog_enabled: row.fogEnabled,
      revealed_cells: row.revealedCells || [],
      tokens: row.tokens || [],
      created_at: toIso(row.createdAt),
    })),
    encounters: data.encounters.map((row) => ({
      id: row.id,
      scene_id: row.sceneId,
      name: row.name,
      round: row.round,
      current_turn_index: row.currentTurnIndex,
      is_active: row.isActive,
      combatants: row.combatants || [],
      created_at: toIso(row.createdAt),
    })),
  };
}

function fromPgRows(rowsByTable) {
  return {
    users: rowsByTable.users.map((row) => ({
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      displayName: row.display_name,
      createdAt: row.created_at,
    })),
    campaigns: rowsByTable.campaigns.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description || '',
      gmId: row.gm_id,
      inviteCode: row.invite_code,
      createdAt: row.created_at,
    })),
    memberships: rowsByTable.memberships.map((row) => ({
      id: row.id,
      campaignId: row.campaign_id,
      userId: row.user_id,
      role: row.role,
    })),
    characters: rowsByTable.characters.map((row) => ({
      id: row.id,
      campaignId: row.campaign_id,
      userId: row.user_id,
      name: row.name,
      sheet: row.sheet,
      status: row.status,
      statusReason: row.status_reason,
      approvedAt: row.approved_at,
      approvedBy: row.approved_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    scenes: rowsByTable.scenes.map((row) => ({
      id: row.id,
      campaignId: row.campaign_id,
      name: row.name,
      mapUrl: row.map_url,
      gridWidth: row.grid_width,
      gridHeight: row.grid_height,
      cellSize: row.cell_size,
      fogEnabled: row.fog_enabled,
      revealedCells: row.revealed_cells || [],
      tokens: row.tokens || [],
      createdAt: row.created_at,
    })),
    encounters: rowsByTable.encounters.map((row) => ({
      id: row.id,
      sceneId: row.scene_id,
      name: row.name,
      round: row.round,
      currentTurnIndex: row.current_turn_index,
      isActive: row.is_active,
      combatants: row.combatants || [],
      createdAt: row.created_at,
    })),
  };
}

async function ensurePgSchema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id text PRIMARY KEY,
      email text NOT NULL UNIQUE,
      password_hash text NOT NULL,
      display_name text NOT NULL,
      created_at text NOT NULL
    );

    CREATE TABLE IF NOT EXISTS campaigns (
      id text PRIMARY KEY,
      name text NOT NULL,
      description text NOT NULL DEFAULT '',
      gm_id text NOT NULL,
      invite_code text NOT NULL UNIQUE,
      created_at text NOT NULL
    );

    CREATE TABLE IF NOT EXISTS memberships (
      id text PRIMARY KEY,
      campaign_id text NOT NULL,
      user_id text NOT NULL,
      role text NOT NULL
    );

    CREATE TABLE IF NOT EXISTS characters (
      id text PRIMARY KEY,
      campaign_id text NOT NULL,
      user_id text NOT NULL,
      name text NOT NULL,
      sheet jsonb NOT NULL,
      status text NOT NULL,
      status_reason text,
      approved_at text,
      approved_by text,
      created_at text NOT NULL,
      updated_at text NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scenes (
      id text PRIMARY KEY,
      campaign_id text NOT NULL,
      name text NOT NULL,
      map_url text,
      grid_width integer NOT NULL,
      grid_height integer NOT NULL,
      cell_size integer NOT NULL,
      fog_enabled boolean NOT NULL,
      revealed_cells jsonb NOT NULL,
      tokens jsonb NOT NULL,
      created_at text NOT NULL
    );

    CREATE TABLE IF NOT EXISTS encounters (
      id text PRIMARY KEY,
      scene_id text NOT NULL,
      name text NOT NULL,
      round integer NOT NULL,
      current_turn_index integer NOT NULL,
      is_active boolean NOT NULL,
      combatants jsonb NOT NULL,
      created_at text NOT NULL
    );
  `);
}

async function readPgDb(pool) {
  const [users, campaigns, memberships, characters, scenes, encounters] = await Promise.all([
    pool.query('SELECT * FROM users ORDER BY created_at ASC'),
    pool.query('SELECT * FROM campaigns ORDER BY created_at ASC'),
    pool.query('SELECT * FROM memberships ORDER BY id ASC'),
    pool.query('SELECT * FROM characters ORDER BY created_at ASC'),
    pool.query('SELECT * FROM scenes ORDER BY created_at ASC'),
    pool.query('SELECT * FROM encounters ORDER BY created_at ASC'),
  ]);
  return fromPgRows({
    users: users.rows,
    campaigns: campaigns.rows,
    memberships: memberships.rows,
    characters: characters.rows,
    scenes: scenes.rows,
    encounters: encounters.rows,
  });
}

async function writePgDb(pool, data) {
  const rows = toPgRows(data);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('TRUNCATE encounters, scenes, characters, memberships, campaigns, users');

    for (const row of rows.users) {
      await client.query(
        'INSERT INTO users (id, email, password_hash, display_name, created_at) VALUES ($1, $2, $3, $4, $5)',
        [row.id, row.email, row.password_hash, row.display_name, row.created_at]
      );
    }

    for (const row of rows.campaigns) {
      await client.query(
        'INSERT INTO campaigns (id, name, description, gm_id, invite_code, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [row.id, row.name, row.description, row.gm_id, row.invite_code, row.created_at]
      );
    }

    for (const row of rows.memberships) {
      await client.query(
        'INSERT INTO memberships (id, campaign_id, user_id, role) VALUES ($1, $2, $3, $4)',
        [row.id, row.campaign_id, row.user_id, row.role]
      );
    }

    for (const row of rows.characters) {
      await client.query(
        'INSERT INTO characters (id, campaign_id, user_id, name, sheet, status, status_reason, approved_at, approved_by, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        [
          row.id,
          row.campaign_id,
          row.user_id,
          row.name,
          row.sheet,
          row.status,
          row.status_reason,
          row.approved_at,
          row.approved_by,
          row.created_at,
          row.updated_at,
        ]
      );
    }

    for (const row of rows.scenes) {
      await client.query(
        'INSERT INTO scenes (id, campaign_id, name, map_url, grid_width, grid_height, cell_size, fog_enabled, revealed_cells, tokens, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        [
          row.id,
          row.campaign_id,
          row.name,
          row.map_url,
          row.grid_width,
          row.grid_height,
          row.cell_size,
          row.fog_enabled,
          row.revealed_cells,
          row.tokens,
          row.created_at,
        ]
      );
    }

    for (const row of rows.encounters) {
      await client.query(
        'INSERT INTO encounters (id, scene_id, name, round, current_turn_index, is_active, combatants, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          row.id,
          row.scene_id,
          row.name,
          row.round,
          row.current_turn_index,
          row.is_active,
          row.combatants,
          row.created_at,
        ]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

function createLowDb() {
  const file = path.join(dataDir, 'db.json');
  const adapter = new JSONFile(file);
  return new Low(adapter, defaultData);
}

const usePostgres = !!process.env.DATABASE_URL;

const db = usePostgres
  ? {
      data: createDbShape(),
      pool: new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: shouldUseSsl(process.env.DATABASE_URL) ? { rejectUnauthorized: false } : false,
      }),
      async read() {
        this.data = await readPgDb(this.pool);
      },
      async write() {
        await writePgDb(this.pool, this.data || createDbShape());
      },
    }
  : createLowDb();

export async function initDb() {
  if (usePostgres) {
    await ensurePgSchema(db.pool);
    await db.read();
    db.data ||= createDbShape();
    return db;
  }

  await db.read();
  db.data ||= createDbShape();
  await db.write();
  return db;
}

export default db;
