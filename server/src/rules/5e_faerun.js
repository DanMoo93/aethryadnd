import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Extend the base bundle with Faerûn content provided by a local
// faerun.json file. This file must be supplied by the user and may
// contain proprietary WotC content. This module does not embed any
// copyrighted text itself — it only merges user-provided licensed data.

export function extendWithFaerun(bundle) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const jsonPath = path.join(__dirname, 'faerun.json');
  if (!fs.existsSync(jsonPath)) {
    // No licensed content provided — return unchanged bundle.
    return bundle;
  }

  try {
    const raw = fs.readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(raw);

    const classes = (bundle.classes || []).slice();
    if (Array.isArray(data.classes)) {
      for (const c of data.classes) {
        const i = classes.findIndex((x) => x.key === c.key);
        if (i >= 0) classes[i] = { ...classes[i], ...c };
        else classes.push(c);
      }
    }

    const races = Array.isArray(data.races) ? (bundle.races || []).concat(data.races) : (bundle.races || []);
    const backgrounds = Array.isArray(data.backgrounds) ? (bundle.backgrounds || []).concat(data.backgrounds) : (bundle.backgrounds || []);
    const feats = Array.isArray(data.feats) ? (bundle.feats || []).concat(data.feats) : (bundle.feats || []);
    const allSpells = Array.isArray(data.allSpells) ? (bundle.allSpells || []).concat(data.allSpells) : (bundle.allSpells || []);

    return { ...bundle, classes, races, backgrounds, feats, allSpells };
  } catch (err) {
    // On parse error or other issues, return the original bundle.
    return bundle;
  }
}
