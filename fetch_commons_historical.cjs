const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const TARGET_COMMONS = [
  { filename: 'real-anandibai-joshi-historical.jpg', wikiFile: 'File:Anandibai joshi.jpg' },
  { filename: 'real-anandibai-joshi-archive.jpg', wikiFile: 'File:Anandibai gopalrao joshi.jpg' },
  { filename: 'real-ahilyabai-holkar-statue.jpg', wikiFile: 'File:Statue of Ahilyabai Holkar at Maheshwar fort.jpg' },
  { filename: 'real-ahilyabai-statue-indore.jpg', wikiFile: 'File:Ahilyabai Holkar.jpg' },
  { filename: 'real-tarabai-statue-kolhapur.jpg', wikiFile: 'File:Maharani Tarabai Statue, Kolhapur.jpg' },
  { filename: 'real-tarabai-equestrian.jpg', wikiFile: 'File:Statue of Maharani Tarabai.jpg' },
  { filename: 'real-jijabai-pune.jpg', wikiFile: 'File:Jijamata statue Pune.jpg' }
];

function fetchCommonsImageUrl(wikiFile) {
  return new Promise((resolve) => {
    // Query commons.wikimedia.org rather than en.wikipedia.org!
    const api = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiFile)}&prop=imageinfo&iiprop=url&format=json`;
    const req = https.get(api, {
      headers: {
        'User-Agent': 'ConnectMarathaApp/1.0 (https://connectmaratha.org; contact@connectmaratha.org)'
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
        } catch (e) {
          console.error(e);
        }
        resolve(null);
      });
    });
    req.on('error', (err) => {
      console.error(err);
      resolve(null);
    });
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
            'User-Agent': 'ConnectMarathaApp/1.0 (https://connectmaratha.org; contact@connectmaratha.org)'
          }
        }, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            let next = res.headers.location;
            if (!next.startsWith('http')) next = new URL(next, u).href;
            return tryReq(next);
          }
          if (res.statusCode !== 200) {
            console.log(`Failed HTTP ${res.statusCode} for ${u}`);
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
      } catch (err) {
        resolve(false);
      }
    }
    tryReq(fileUrl);
  });
}

async function run() {
  console.log('Fetching Commons images...');
  for (const item of TARGET_COMMONS) {
    const url = await fetchCommonsImageUrl(item.wikiFile);
    console.log(`${item.wikiFile} -> ${url}`);
    if (url) {
      const p1 = path.join(__dirname, 'public', 'assets', 'images', item.filename);
      const p2 = path.join(__dirname, 'frontend', 'public', 'assets', 'images', item.filename);
      const size = await downloadBinary(url, p1, p2);
      if (size) {
        console.log(`[OK] Saved ${item.filename} (${Math.round(size / 1024)} KB)`);
      } else {
        console.log(`[ERR] Failed download binary for ${item.filename}`);
      }
    }
  }
}

run();
