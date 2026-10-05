const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PUNE_TARGET_FILES = [
  { filename: 'real-afmc-pune.jpg', wikiFile: 'File:AFMC Main Building.jpg' },
  { filename: 'real-sp-college-pune.jpg', wikiFile: 'File:Sp main building.jpg' },
  { filename: 'real-agri-pune.jpg', wikiFile: 'File:College of Agriculture Centenary Building, Pune.jpg' },
  { filename: 'real-aissms-pune.jpg', wikiFile: 'File:AISSMS College Building.jpg' },
  { filename: 'real-mmcoe-pune.jpg', wikiFile: 'File:Mmcoe.jpg' },
  { filename: 'real-deccan-college-pune.jpg', wikiFile: 'File:NEO-GOTHIC LOOK.jpg' },
  { filename: 'real-gokhale-pune.jpg', wikiFile: 'File:Full view of Gokhale Institute of Politics and Economics main building.jpg' },
  { filename: 'real-iiser-pune.jpg', wikiFile: 'File:Main Gate, IISER, Pune 1.jpg' },
  { filename: 'real-iucaa-pune.jpg', wikiFile: 'File:Entrance of IUCAA.jpg' },
  { filename: 'real-nda-pune.jpg', wikiFile: 'File:Aerial view of the National Defence Academy, Pune.jpg' },
  { filename: 'real-mit-adt-pune.jpg', wikiFile: 'File:MIT Building Loni,Pune.JPG' }
];

function fetchImageUrl(wikiFile) {
  return new Promise((resolve) => {
    const api = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiFile)}&prop=imageinfo&iiprop=url&format=json`;
    const req = https.get(api, {
      headers: {
        'User-Agent': 'ConnectMarathaApp/2.4 (https://connectmaratha.org; contact@connectmaratha.org)'
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
            'User-Agent': 'ConnectMarathaApp/2.4 (https://connectmaratha.org; contact@connectmaratha.org)'
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
  console.log(`Starting real Pune college photo downloads (${PUNE_TARGET_FILES.length})...`);
  const publicDir = path.join(__dirname, 'public', 'assets', 'images');
  const frontDir = path.join(__dirname, 'frontend', 'public', 'assets', 'images');

  let success = 0;
  for (const item of PUNE_TARGET_FILES) {
    const dest1 = path.join(publicDir, item.filename);
    const dest2 = path.join(frontDir, item.filename);

    if (fs.existsSync(dest1) && fs.statSync(dest1).size > 10000) {
      console.log(`[EXISTS] ${item.filename}`);
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

  console.log(`\nCompleted! Successfully obtained ${success}/${PUNE_TARGET_FILES.length} verified Pune photos.`);
}

main();
