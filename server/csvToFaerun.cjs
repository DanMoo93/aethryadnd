// csvToFaerun.cjs
// Converts a CSV of races into server/src/rules/faerun.json
// CSV columns: key,name,abilityBonuses,size,speed,languages,notes,source
// abilityBonuses can be JSON (e.g. {"STR":2}) or pairs like STR:2;CHA:1

const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
if (argv.length < 2) {
  console.error('Usage: node csvToFaerun.cjs <in.csv> <out.json>');
  process.exit(2);
}

const inPath = path.resolve(process.cwd(), argv[0]);
const outPath = path.resolve(process.cwd(), argv[1]);

if (!fs.existsSync(inPath)) {
  console.error('Input CSV not found:', inPath);
  process.exit(2);
}

const text = fs.readFileSync(inPath, 'utf8');
const lines = text.split(/\r?\n/).filter(Boolean);
const header = lines.shift().split(',').map(h=>h.trim());

function parseAbilityBonuses(s) {
  s = s.trim();
  if (!s) return {};
  try { return JSON.parse(s); } catch(e) {}
  const obj = {};
  s.split(';').forEach(pair => {
    const [k,v] = pair.split(':').map(x=>x && x.trim());
    if (k) obj[k] = Number(v) || 0;
  });
  return obj;
}

const entries = lines.map(line => {
  // naive CSV split (commas in fields will break this). For simple input it's fine.
  const cols = line.split(',');
  const row = {};
  for (let i=0;i<header.length;i++) row[header[i]] = (cols[i]||'').trim();
  return {
    key: row.key || (row.name || '').toLowerCase().replace(/[^a-z0-9]+/g,'-'),
    name: row.name || row.key,
    abilityBonuses: parseAbilityBonuses(row.abilityBonuses||''),
    size: row.size || 'Medium',
    speed: Number(row.speed) || 30,
    languages: (row.languages||'').split(';').map(s=>s.trim()).filter(Boolean),
    notes: row.notes || '',
    source: row.source || 'Races of Faerun'
  };
});

const out = { races: entries };
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
console.log('Wrote', outPath);
