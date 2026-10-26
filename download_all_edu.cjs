const fs = require('fs');
const path = require('path');
const https = require('https');

// Verified reliable working URLs for Maharashtra colleges & scholarships
const downloads = [
  {
    // SPPU Pune / University Grand Library & Campus
    file: 'edu-college-sppu.jpg',
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1000&q=80'
  },
  {
    // IIM & Top Business Management B-School
    file: 'edu-college-iim.jpg',
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80'
  },
  {
    // Government Law College (GLC) Legal & Judicial Academy
    file: 'edu-college-glc.jpg',
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1000&q=80'
  },
  {
    // Agriculture University MPKV Rahuri / Agricultural Science
    file: 'edu-college-mpkv.jpg',
    url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1000&q=80'
  },
  {
    // SARTHI Foreign Higher Education Scholarship
    file: 'edu-scholarship-sarthi.jpg',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80'
  },
  {
    // Dr. Panjabrao Deshmukh Hostel & निर्वाह भत्ता
    file: 'edu-scholarship-hostel.jpg',
    url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80'
  },
  {
    // MPSC / UPSC Competitive Exam Study Centre & Digital Library
    file: 'edu-scholarship-mpsc.jpg',
    url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1000&q=80'
  },
  {
    // Maratha Higher Education Portal Hero Banner
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
    try {
      console.log(`Downloading ${item.file}...`);
      for (const dir of destDirs) {
        const target = path.join(dir, item.file);
        await downloadFile(item.url, target);
        console.log(`Saved ${item.file}`);
      }
    } catch (e) {
      console.error(`Failed ${item.file}:`, e.message);
    }
  }
  console.log('Finished downloading all education assets!');
}

run();
