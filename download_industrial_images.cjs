const fs = require('fs');
const path = require('path');
const https = require('https');

// Curated high quality industrial manufacturing / heavy engineering plants
// matching the first two cards (Card 1: Automotive assembly plant, Card 2: Steel foundry molten metal)
const downloads = [
  {
    // Nashik Chapter: Agro & Industrial Heavy Machinery Assembly / Manufacturing Floor
    file: 'sangam-ch-nashik.jpg',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'
  },
  {
    // CSMB / Sambhajinagar Chapter: CNC precision machining & metal lathe industrial workshop
    file: 'sangam-ch-csmb.jpg',
    url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80'
  },
  {
    // Thane-Mumbai Chapter: Modern industrial manufacturing & logistics infrastructure plant
    file: 'sangam-ch-thane.jpg',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80'
  }
];

const destDirs = [
  path.join(__dirname, 'public', 'assets', 'images'),
  path.join(__dirname, 'frontend', 'public', 'assets', 'images')
];

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with status ${res.statusCode}`));
      }
      const stream = fs.createWriteStream(destPath);
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function run() {
  for (const item of downloads) {
    console.log(`Downloading ${item.file}...`);
    for (const dir of destDirs) {
      const target = path.join(dir, item.file);
      await downloadFile(item.url, target);
      console.log(`Saved to ${target} (${fs.statSync(target).size} bytes)`);
    }
  }
  console.log('All 3 industrial plant images successfully downloaded!');
}

run().catch(console.error);
