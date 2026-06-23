import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..', '..');

export const defaultDataDir = path.join(rootDir, 'data');
export const defaultUploadsDir = path.join(rootDir, 'uploads');

export const dataDir = process.env.DATA_DIR || defaultDataDir;
export const uploadsDir = process.env.UPLOADS_DIR || defaultUploadsDir;
