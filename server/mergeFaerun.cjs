// mergeFaerun.cjs
// CommonJS script to copy a private Faerûn JSON into server/src/rules/faerun.json

const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, 'private', 'faerun.json');
const destDir = path.resolve(__dirname, 'src', 'rules');
const dest = path.join(destDir, 'faerun.json');

if (!fs.existsSync(src)) {
  console.error(`Source not found: ${src}`);
  console.error('Place your licensed Faerûn JSON at this path and re-run this script.');
  process.exit(2);
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

try {
  fs.copyFileSync(src, dest);
  console.log(`Merged faerun.json -> ${dest}`);
  console.log('Restart your dev server or run tests to load the new bundle.');
} catch (err) {
  console.error('Failed to copy file:', err);
  process.exit(1);
}
