const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const MORE_FILES = [
  { filename: 'real-bj-medical-pune.jpg', wikiFile: 'File:B J Medical College, Pune.jpg' },
  { filename: 'real-fergusson-pune.jpg', wikiFile: 'File:Fergusson College Main.jpg' },
  { filename: 'real-elphinstone-mumbai.jpg', wikiFile: 'File:Elphinstone College Mumbai.jpg' },
  { filename: 'real-kc-college-mumbai.jpg', wikiFile: 'File:K C College Churchgate Mumbai.jpg' },
  { filename: 'real-ils-law-pune.jpg', wikiFile: 'File:Full view of Saraswati building, ILS Law College, Pune.jpg' },
  { filename: 'real-garware-pune.jpg', wikiFile: 'File:AGC, Main Building.jpg' },
  { filename: 'real-somaiya-mumbai.jpg', wikiFile: 'File:Somaiya Vidyavihar.jpg' },
  { filename: 'real-gmc-csmb.jpg', wikiFile: 'File:GMC Main Building.jpg' },
  { filename: 'real-wilson-mumbai.jpg', wikiFile: 'File:Wilson College.png' },
  { filename: 'real-gmc-nagpur.jpg', wikiFile: 'File:Nagpur Government Medical College and Hospital.jpg' },
  { filename: 'real-walchand-sangli.jpg', wikiFile: 'File:WCE Main Building.jpg' },
  { filename: 'real-pdkv-akola.jpg', wikiFile: 'File:PDKV Akola - Agricultural University.png' },
  { filename: 'real-vnmkv-latur.jpg', wikiFile: 'File:Vilasrao deshmukh college of agricultural biotechnology Latur.jpg' },
  { filename: 'real-bskkv-dapoli.jpg', wikiFile: 'File:College of agriculture dapoli, dr balasaheb konkan krishi vidyapeeth, dr bskkv, library view.jpg' },
  { filename: 'real-seth-gs-mumbai.jpg', wikiFile: 'File:Cropped college building.jpg' },
  { filename: 'real-tiss-mumbai.jpg', wikiFile: 'File:TISS .jpg' }
];

function fetchImageUrl(wikiFile) {
  return new Promise((resolve) => {
    const api = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiFile)}&prop=imageinfo&iiprop=url&format=json`;
    const req = https.get(api, {
      headers: {
        'User-Agent': 'ConnectMarathaApp/2.2 (https://connectmaratha.org; contact@connectmaratha.org)'
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          for (const key in pages) {
            if (pages[key].imageinfo && pages[key].imageinfo[0]) {
              return resolve(pages[key].imageinfo[0].url);
            }
          }
        } catch (e) {}
        resolve(null);
      });
    });
    req.on('error', () => resolve(null));
  });
}

function downloadBinary(fileUrl, dest1, dest2) {
  return new Promise((resolve) => {
    function tryReq(u) {
      try {
        const parsed = new URL(u);
        const mod = parsed.protocol === 'https:' ? https : http;
        const req = mod.get(u, {
          headers: {
            'User-Agent': 'ConnectMarathaApp/2.2 (https://connectmaratha.org; contact@connectmaratha.org)'
          }
        }, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            let next = res.headers.location;
            if (!next.startsWith('http')) next = new URL(next, u).href;
            return tryReq(next);
          }
          if (res.statusCode !== 200) {
            return resolve(false);
          }
          const chunks = [];
          res.on('data', c => chunks.push(c));
          res.on('end', () => {
            const buf = Buffer.concat(chunks);
            if (buf.length < 3000) return resolve(false);
            fs.writeFileSync(dest1, buf);
            if (fs.existsSync(path.dirname(dest2))) {
              fs.writeFileSync(dest2, buf);
            }
            resolve(buf.length);
          });
        });
        req.on('error', () => resolve(false));
      } catch (e) {
        resolve(false);
      }
    }
    tryReq(fileUrl);
  });
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log(`Starting second batch of ${MORE_FILES.length} college campus photos...`);
  const publicDir = path.join(__dirname, 'public', 'assets', 'images');
  const frontDir = path.join(__dirname, 'frontend', 'public', 'assets', 'images');

  let success = 0;
  for (const item of MORE_FILES) {
    const dest1 = path.join(publicDir, item.filename);
    const dest2 = path.join(frontDir, item.filename);

    if (fs.existsSync(dest1) && fs.statSync(dest1).size > 10000) {
      console.log(`[EXISTS] ${item.filename} (${Math.round(fs.statSync(dest1).size / 1024)} KB)`);
      if (fs.existsSync(path.dirname(dest2))) {
        fs.copyFileSync(dest1, dest2);
      }
      success++;
      continue;
    }

    console.log(`Resolving URL for ${item.wikiFile}...`);
    const directUrl = await fetchImageUrl(item.wikiFile);
    await sleep(250);

    if (!directUrl) {
      console.log(`[NO_URL] Could not find URL for ${item.wikiFile}`);
      continue;
    }

    const downloadedSize = await downloadBinary(directUrl, dest1, dest2);
    await sleep(350);

    if (downloadedSize) {
      console.log(`[OK] Downloaded ${item.filename} (${Math.round(downloadedSize / 1024)} KB)`);
      success++;
    } else {
      console.log(`[FAIL] Download failed for ${item.filename}`);
    }
  }

  console.log(`\nCompleted! Successfully obtained ${success}/${MORE_FILES.length} additional verified college photos.`);
}

main();
