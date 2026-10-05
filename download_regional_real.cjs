const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const MORE_CAMPUS_DOWNLOADS = [
  { filename: 'real-ict-wadala-mumbai.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/0/02/UDCT_Wadala.jpg' },
  { filename: 'real-spit-andheri-mumbai.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Spit.jpg' },
  { filename: 'real-willingdon-sangli.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Willingdon_College%2C_Sangli.jpg' },
  { filename: 'real-wce-campus-sangli.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/9/96/WCE_Sangli_Campus.jpg' },
  { filename: 'real-wce-library-sangli.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/d/da/WCE_Sangli_Library.jpg' },
  { filename: 'real-gmc-miraj-ipd.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/GMC_Miraj_IPD.jpg' },
  { filename: 'real-gcek-hostel-karad.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Staff_hostel.jpg' },
  { filename: 'real-xaviers-arches-mumbai.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Second_Quadrant_Arches%2C_St._Xavier%27s_College%2C_Mumbai.JPG' },
  { filename: 'real-kc-building-mumbai.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Kishinchand_Chellaram_College_building.jpg' },
  { filename: 'real-somaiya-engg-mumbai.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Kjsieit2012.jpg' },
  { filename: 'real-wilson-gymkhana-mumbai.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/9/90/The_Wilson_College_Gymkhana.png' }
];

function downloadItem(item) {
  return new Promise((resolve) => {
    function req(u) {
      try {
        const parsed = new URL(u);
        const mod = parsed.protocol === 'https:' ? https : http;
        mod.get(u, {
          headers: {
            'User-Agent': 'ConnectMarathaEdu/2.6 (https://connectmaratha.org; contact@connectmaratha.org)'
          }
        }, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            let next = res.headers.location;
            if (!next.startsWith('http')) next = new URL(next, u).href;
            return req(next);
          }
          if (res.statusCode !== 200) {
            console.log(`[SKIP] Status ${res.statusCode} for ${item.filename}`);
            return resolve(false);
          }
          const chunks = [];
          res.on('data', c => chunks.push(c));
          res.on('end', () => {
            const buf = Buffer.concat(chunks);
            const p1 = path.join(__dirname, 'public', 'assets', 'images', item.filename);
            const p2 = path.join(__dirname, 'frontend', 'public', 'assets', 'images', item.filename);
            fs.writeFileSync(p1, buf);
            if (fs.existsSync(path.dirname(p2))) {
              fs.writeFileSync(p2, buf);
            }
            console.log(`[OK] Downloaded ${item.filename} (${Math.round(buf.length / 1024)} KB)`);
            resolve(true);
          });
        }).on('error', () => resolve(false));
      } catch (e) {
        resolve(false);
      }
    }
    req(item.url);
  });
}

(async () => {
  console.log(`Downloading ${MORE_CAMPUS_DOWNLOADS.length} verified campus images...`);
  for (const item of MORE_CAMPUS_DOWNLOADS) {
    await downloadItem(item);
  }
  console.log('All downloads finished.');
})();
