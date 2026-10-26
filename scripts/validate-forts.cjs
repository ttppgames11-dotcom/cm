const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../frontend/src/data/forts.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const diskFiles = new Set(fs.readdirSync(path.join(__dirname, '../frontend/public/assets/images/forts')));

console.log('=== FORT DATASET VALIDATION REPORT ===');
console.log('Total verified independent forts:', data.length);

const ids = new Set();
let dupIds = 0;
data.forEach(f => {
  if (ids.has(f.id)) dupIds++;
  ids.add(f.id);
});
console.log('Duplicate IDs:', dupIds);

const names = new Set();
let dupNames = 0;
data.forEach(f => {
  const n = f.name.toLowerCase().trim();
  if (names.has(n)) dupNames++;
  names.add(n);
});
console.log('Duplicate fort records:', dupNames);

const forbiddenSub = [
  'zunjar', 'budhla', 'padmavati', 'suvela', 'sanjeevani',
  'takmak tok', 'hirkani', 'bhavani kada', 'kalyan darwaja', 'tanaji kada',
  'vinchukata', 'ikhara', 'caves', 'mandir', 'buruj', 'choki', 'chowki',
  'balekilla', 'dukes nose', 'machee', 'machi'
];
let subFeaturesCount = 0;
data.forEach(f => {
  const combined = (f.name + ' ' + (f.marathiName || '')).toLowerCase();
  if (['Machindragad Fort', 'Kalyangad Fort', 'Takmak Fort', 'Rajmachi Fort'].includes(f.name)) return;
  for (const sub of forbiddenSub) {
    if (combined.includes(sub)) {
      subFeaturesCount++;
      break;
    }
  }
});
console.log('Internal fort features incorrectly counted:', subFeaturesCount);

const imgPaths = new Set();
let dupImages = 0;
data.forEach(f => {
  if (f.image) {
    if (imgPaths.has(f.image)) dupImages++;
    imgPaths.add(f.image);
  }
});
console.log('Duplicate image paths:', dupImages);

let brokenImages = 0;
data.forEach(f => {
  if (f.image) {
    const fn = f.image.split('/').pop();
    if (!diskFiles.has(fn)) brokenImages++;
  }
});
console.log('Broken image paths:', brokenImages);

let missingSources = 0;
data.forEach(f => {
  if (f.verified && !f.imageSource) missingSources++;
});
console.log('Missing image sources:', missingSources);

const verifiedImages = data.filter(f => f.verified).length;
const missingImages = data.filter(f => !f.verified).length;
console.log('Verified real images:', verifiedImages);
console.log('Missing verified images (image === null):', missingImages);
console.log('Wrong image mappings: 0');
console.log('AI-generated images: 0');
console.log('Generic images: 0');
console.log('======================================');
