const fs = require('fs');
const https = require('https');
const path = require('path');

const downloads = [
  // 1. Dr. Anandibai Joshi authentic 1886 archival photograph (the famous historic graduation portrait)
  {
    name: 'real-anandibai-joshi-archive.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Anandibai_Joshee_%281886%29.jpg/640px-Anandibai_Joshee_%281886%29.jpg'
  },
  // 2. Maharani Tarabai historic equestrian bronze statue in Kolhapur
  {
    name: 'real-tarabai-statue-kolhapur.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Maharani_Tarabai_Statue%2C_Kolhapur.jpg/800px-Maharani_Tarabai_Statue%2C_Kolhapur.jpg'
  },
  // 3. Alternative Maharani Tarabai
  {
    name: 'real-tarabai-equestrian.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Statue_of_Maharani_Tarabai.jpg/800px-Statue_of_Maharani_Tarabai.jpg'
  },
  // 4. Ahilyabai Holkar Maheshwar fort statue
  {
    name: 'real-ahilyabai-maheshwar-statue.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Statue_of_Ahilya_Bai_Holkar_at_Maheshwar.jpg/800px-Statue_of_Ahilya_Bai_Holkar_at_Maheshwar.jpg'
  },
  // 5. Jijamata & Bal Shivaji statue (Sindkhed Raja / Pune)
  {
    name: 'real-jijabai-sculpture.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Jijamata_statue_Pune.jpg/800px-Jijamata_statue_Pune.jpg'
  }
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with status ${res.statusCode} for ${url}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  for (const item of downloads) {
    const pubDest = path.join(__dirname, 'public', 'assets', 'images', item.name);
    const frontDest = path.join(__dirname, 'frontend', 'public', 'assets', 'images', item.name);
    try {
      await download(item.url, pubDest);
      fs.copyFileSync(pubDest, frontDest);
      console.log(`Downloaded ${item.name} (${fs.statSync(pubDest).size} bytes)`);
    } catch (e) {
      console.error(`Error downloading ${item.name}: ${e.message}`);
    }
  }
}

main();
