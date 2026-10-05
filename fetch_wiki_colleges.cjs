const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Target File names from Wikimedia Commons
const TARGET_FILES = [
  // Engineering & Tech
  { filename: 'real-coep-pune.jpg', wikiFile: 'File:COEP Main building.JPG' },
  { filename: 'real-vjti-mumbai.jpg', wikiFile: 'File:VJTI Quadrangle.jpg' },
  { filename: 'real-vit-pune.jpg', wikiFile: 'File:Vit image.jpg' },
  { filename: 'real-gcek-karad.jpg', wikiFile: 'File:GCEKPhoto.jpg' },
  { filename: 'real-sggs-nanded.jpg', wikiFile: 'File:SGGS.jpg' },
  { filename: 'real-vnit-nagpur.jpg', wikiFile: 'File:VNIT Nagpur Auditorium.jpg' },
  { filename: 'real-kkw-nashik.jpg', wikiFile: 'File:K. K. Wagh Institute of Engineering Education & Research.jpg' },
  { filename: 'real-walchand-sangli.jpg', wikiFile: 'File:Walchand College of Engineering, Sangli.jpg' },
  { filename: 'real-gcoea-amravati.jpg', wikiFile: 'File:Government College of Engineering Amravati.jpg' },
  { filename: 'real-geca-csmb.jpg', wikiFile: 'File:Geca entrance.jpg' },
  { filename: 'real-pict-pune.jpg', wikiFile: 'File:PICT building.jpg' },
  { filename: 'real-ict-mumbai.jpg', wikiFile: 'File:ICT Mumbai (UDCT).jpg' },

  // Universities
  { filename: 'real-sppu-pune.jpg', wikiFile: 'File:University of Pune, Pune.jpg' },
  { filename: 'real-mu-fort-mumbai.jpg', wikiFile: 'File:Mumbai University Fort Campus.jpg' },
  { filename: 'real-bamu-csmb.jpg', wikiFile: 'File:Dr Babasaheb Ambedkar\'s statue in Dr. Babasaheb Ambedkar Marathwada University.jpg' },
  { filename: 'real-solapur-uni.jpg', wikiFile: 'File:Solapur University Administrative Building.jpg' },
  { filename: 'real-srtm-nanded.jpg', wikiFile: 'File:Swami Ramanand Teerth Marathwada University Nanded.jpg' },
  { filename: 'real-nmu-jalgaon.jpg', wikiFile: 'File:Kavayitri Bahinabai Chaudhari North Maharashtra University.jpg' },
  { filename: 'real-sgbau-amravati.jpg', wikiFile: 'File:Sant Gadge Baba Amravati University.jpg' },
  { filename: 'real-rtmnu-nagpur.jpg', wikiFile: 'File:Rashtrasant Tukadoji Maharaj Nagpur University Convocation Hall.jpg' },
  { filename: 'real-mpkv-rahuri.jpg', wikiFile: 'File:MPKV Main Administrative Building.JPG' },

  // Law, Commerce, Arts & Science
  { filename: 'real-glc-mumbai.jpg', wikiFile: 'File:Government Law College, Mumbai.jpg' },
  { filename: 'real-symbiosis-pune.jpg', wikiFile: 'File:Symbiosis Law School, Pune.jpg' },
  { filename: 'real-xaviers-mumbai.jpg', wikiFile: 'File:St. Xavier’s College, Mumbai 02.jpg' },
  { filename: 'real-ruia-mumbai.jpg', wikiFile: 'File:Ramnarain Ruia Senior College Quadrangle.jpg' },
  { filename: 'real-fergusson-pune.jpg', wikiFile: 'File:Main Building of Fergusson College.jpg' },
  { filename: 'real-rajaram-kolhapur.jpg', wikiFile: 'File:Rajaram College Kolhapur.jpg' },
  { filename: 'real-yc-satara.jpg', wikiFile: 'File:Yashwantrao Chavan Institute of Science, Satara.jpg' },
  { filename: 'real-dayanand-latur.jpg', wikiFile: 'File:Dayanand Science College Latur.jpg' },
  { filename: 'real-tiss-mumbai.jpg', wikiFile: 'File:Tata Institute of Social Sciences, Mumbai.jpg' },

  // Medical, Business & Management
  { filename: 'real-gmc-miraj.jpg', wikiFile: 'File:GMC Miraj OPD.png' },
  { filename: 'real-iim-nagpur.jpg', wikiFile: 'File:IIM Nagpur-1500x900.jpg' },
  { filename: 'real-bharati-pune.jpg', wikiFile: 'File:Bharti vidyapith (2).JPG' },
  { filename: 'real-grant-medical-mumbai.jpg', wikiFile: 'File:Grant Medical College, Mumbai.jpg' },
  { filename: 'real-bj-medical-pune.jpg', wikiFile: 'File:BJ Medical College, Pune.jpg' }
];

function fetchImageUrl(wikiFile) {
  return new Promise((resolve) => {
    const api = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiFile)}&prop=imageinfo&iiprop=url&format=json`;
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
            'User-Agent': 'ConnectMarathaApp/1.0 (https://connectmaratha.org; contact@connectmaratha.org)'
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
  console.log(`Starting resolution and download for ${TARGET_FILES.length} college campus photos...`);
  const publicDir = path.join(__dirname, 'public', 'assets', 'images');
  const frontDir = path.join(__dirname, 'frontend', 'public', 'assets', 'images');

  let success = 0;
  for (const item of TARGET_FILES) {
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

  console.log(`\nCompleted! Successfully obtained ${success}/${TARGET_FILES.length} verified college photos.`);
}

main();
