const fs = require('fs');
const path = require('path');
const https = require('https');

// Direct high-res, royalty-free business networking & corporate meeting photos from Unsplash
const downloads = [
  {
    file: 'sangam-ch-pune.jpg',
    // Professional corporate business meeting / boardroom discussion
    url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1000&q=80'
  },
  {
    file: 'sangam-ch-kolhapur.jpg',
    // Business partnership handshake and deal closing
    url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1000&q=80'
  },
  {
    file: 'sangam-ch-nashik.jpg',
    // Corporate entrepreneurs networking round table meeting
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80'
  },
  {
    file: 'sangam-ch-csmb.jpg',
    // Professional business team presentation and collaboration
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80'
  },
  {
    file: 'sangam-ch-thane.jpg',
    // Modern corporate commercial skyscraper & financial center
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80'
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
  console.log('All business images successfully downloaded!');
}

run().catch(console.error);
