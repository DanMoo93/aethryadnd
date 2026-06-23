// pdfToText.cjs
// Usage: from server folder:
//  npm install pdf-parse --no-save
//  node ./pdfToText.cjs private/Races_of_Faerun.pdf private/faerun.txt

const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const argv = process.argv.slice(2);
if (argv.length < 2) {
  console.error('Usage: node pdfToText.cjs <in.pdf> <out.txt>');
  process.exit(2);
}

const inPath = path.resolve(process.cwd(), argv[0]);
const outPath = path.resolve(process.cwd(), argv[1]);

if (!fs.existsSync(inPath)) {
  console.error('Input PDF not found:', inPath);
  process.exit(2);
}

const dataBuffer = fs.readFileSync(inPath);

pdf(dataBuffer).then(function(data) {
  fs.writeFileSync(outPath, data.text, 'utf8');
  console.log('Wrote text to', outPath);
}).catch((err) => {
  console.error('pdf-parse error:', err);
  process.exit(1);
});
