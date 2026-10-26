const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const MORE_FILES = [
  { filename: 'real-jijabai-lal-mahal.jpg', wikiFile: 'File:Lal Mahal 03.JPG' },
  { filename: 'real-jijabai-statue-monument.jpg', wikiFile: 'File:Statue of Jijamata.jpg' },
  { filename: 'real-jijamata-stamp.jpg', wikiFile: 'File:Jijabai 1999 stamp of India.jpg' },
  { filename: 'real-shivaji-jijamata-raje.jpg', wikiFile: 'File:Raje Shivaji with mother Jijamata.jpg' }
];

function fetchCommonsImageUrl(wikiFile) {
  return new Promise((resolve) => {
    const api = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiFile)}&prop=imageinfo&iiprop=url&format=json`;
    https.get(api, {
      headers: { 'User-Agent': 'ConnectMarathaApp/1.0 (https://connectmaratha.org; contact@connectmaratha.org)' }
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
  });
}

function downloadBinary(fileUrl, dest1, dest2) {
  return new Promise((resolve) => {
    function tryReq(u) {
      try {
        const parsed = new URL(u);
        const mod = parsed.protocol === 'https:' ? https : http;
        const req = mod.get(u, {
          headers: { 'User-Agent': 'ConnectMarathaApp/1.0 (contact@connectmaratha.com)' }
        }, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            let next = res.headers.location;
            if (!next.startsWith('http')) next = new URL(next, u).href;
            return tryReq(next);
          }
          if (res.statusCode !== 200) return resolve(false);
          const chunks = [];
          res.on('data', c => chunks.push(c));
          res.on('end', () => {
            const buf = Buffer.concat(chunks);
            if (buf.length < 3000) return resolve(false);
            fs.writeFileSync(dest1, buf);
            if (fs.existsSync(path.dirname(dest2))) fs.writeFileSync(dest2, buf);
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
  for (const item of MORE_FILES) {
    const url = await fetchCommonsImageUrl(item.wikiFile);
    console.log(`${item.wikiFile} -> ${url}`);
    if (url) {
      const p1 = path.join(__dirname, 'public', 'assets', 'images', item.filename);
      const p2 = path.join(__dirname, 'frontend', 'public', 'assets', 'images', item.filename);
      const size = await downloadBinary(url, p1, p2);
      console.log(`Saved ${item.filename} (${size} bytes)`);
    }
  }
}

run();
