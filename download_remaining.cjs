const fs = require('fs');
const path = require('path');
const https = require('https');

// Highly reliable Unsplash industrial & heavy manufacturing machinery photos
const downloads = [
  {
    // CSMB / Sambhajinagar Chapter: CNC precision metal turning & engineering machinery
    file: 'sangam-ch-csmb.jpg',
    url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80'
  },
  {
    // Thane-Mumbai Chapter: Modern high-tech industrial manufacturing & robotic automation floor
    file: 'sangam-ch-thane.jpg',
    url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80'
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
  console.log('All remaining industrial images downloaded successfully!');
}

run().catch(console.error);
