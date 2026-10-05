const https = require('https');
const fs = require('fs');
const path = require('path');

const titles = [
  { file: 'File:Anandibai_Joshee_(1886).jpg', saveAs: 'real-anandibai-archive-photo.jpg' },
  { file: 'File:Statue_of_Ahilya_Bai_Holkar_at_Maheshwar.jpg', saveAs: 'real-ahilyabai-maheshwar.jpg' },
  { file: 'File:Statue_of_Maharani_Tarabai.jpg', saveAs: 'real-tarabai-equestrian.jpg' },
  { file: 'File:Maharani_Tarabai_Statue,_Kolhapur.jpg', saveAs: 'real-tarabai-statue-kolhapur.jpg' },
  { file: 'File:Jijamata_statue_Pune.jpg', saveAs: 'real-jijamata-pune.jpg' }
];

function getWikimediaUrl(fileTitle) {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url&format=json`;
    https.get(apiUrl, { headers: { 'User-Agent': 'ConnectMaratha/1.0 (contact@connectmaratha.com)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pages[pageId].imageinfo && pages[pageId].imageinfo[0]) {
            resolve(pages[pageId].imageinfo[0].url);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

function downloadDirect(url, dest) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'ConnectMaratha/1.0 (contact@connectmaratha.com)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, { headers: { 'User-Agent': 'ConnectMaratha/1.0' } }, (res2) => {
          if (res2.statusCode === 200) {
            const f = fs.createWriteStream(dest);
            res2.pipe(f);
            f.on('finish', () => { f.close(); resolve(true); });
          } else resolve(false);
        });
        return;
      }
      if (res.statusCode === 200) {
        const f = fs.createWriteStream(dest);
        res.pipe(f);
        f.on('finish', () => { f.close(); resolve(true); });
      } else resolve(false);
    }).on('error', () => resolve(false));
  });
}

async function main() {
  for (const t of titles) {
    const url = await getWikimediaUrl(t.file);
    console.log(`URL for ${t.file}:`, url);
    if (url) {
      const pubPath = path.join(__dirname, 'public', 'assets', 'images', t.saveAs);
      const frontPath = path.join(__dirname, 'frontend', 'public', 'assets', 'images', t.saveAs);
      const ok = await downloadDirect(url, pubPath);
      if (ok) {
        fs.copyFileSync(pubPath, frontPath);
        console.log(`Successfully saved ${t.saveAs} (${fs.statSync(pubPath).size} bytes)`);
      } else {
        console.log(`Failed downloading direct file for ${t.saveAs}`);
      }
    }
  }
}

main();
