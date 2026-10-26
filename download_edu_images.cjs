const fs = require('fs');
const path = require('path');
const https = require('https');

// Premium high-res educational, university campuses and scholarship images from Unsplash
const downloads = [
  {
    // COEP Pune / Iconic Engineering Heritage Campus
    file: 'edu-college-coep.jpg',
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1000&q=80'
  },
  {
    // VJTI Mumbai / Modern Technical Lab & Research Campus
    file: 'edu-college-vjti.jpg',
    url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=80'
  },
  {
    // Grant Medical College Mumbai / Medical Anatomy & Healthcare Campus
    file: 'edu-college-gmc.jpg',
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80'
  },
  {
    // SPPU Pune / Historic Clocktower University Campus
    file: 'edu-college-sppu.jpg',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1000&q=80'
  },
  {
    // IIM Mumbai / Business & Management Corporate Campus
    file: 'edu-college-iim.jpg',
    url: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1000&q=80'
  },
  {
    // Government Law College (GLC) Mumbai / High Court & Judicial Library
    file: 'edu-college-glc.jpg',
    url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=80'
  },
  {
    // Agriculture University Rahuri (MPKV) / Green Agritech & Research Farm
    file: 'edu-college-mpkv.jpg',
    url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1000&q=80'
  },
  {
    // Sarthi Scholarship / Overseas Foreign Education
    file: 'edu-scholarship-sarthi.jpg',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80'
  },
  {
    // Dr. Panjabrao Deshmukh Hostel & Education Fund
    file: 'edu-scholarship-hostel.jpg',
    url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80'
  },
  {
    // MPSC / UPSC Competitive Exam Study Centre & Digital Library
    file: 'edu-scholarship-mpsc.jpg',
    url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1000&q=80'
  },
  {
    // Education Hero Banner: University convocation & student triumph
    file: 'edu-hero-banner.jpg',
    url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80'
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
      console.log(`Saved ${item.file} to ${dir}`);
    }
  }
  console.log('All college and scholarship images downloaded successfully!');
}

run().catch(console.error);
