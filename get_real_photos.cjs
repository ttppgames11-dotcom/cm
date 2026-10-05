const https = require('https');
const fs = require('fs');
const path = require('path');

const list = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Anandibai_Joshee_%281886%29.jpg',
    filename: 'real-anandibai-photo.jpg'
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Maharani_Tarabai_Statue%2C_Kolhapur.jpg',
    filename: 'real-tarabai-kolhapur-statue.jpg'
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Statue_of_Maharani_Tarabai.jpg',
    filename: 'real-tarabai-statue2.jpg'
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Statue_of_Ahilya_Bai_Holkar_at_Maheshwar.jpg',
    filename: 'real-ahilyabai-maheshwar.jpg'
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Jijamata_statue_Pune.jpg',
    filename: 'real-jijabai-pune.jpg'
  }
];

function fetchFile(item) {
  return new Promise((resolve) => {
    const pubPath = path.join(__dirname, 'public', 'assets', 'images', item.filename);
    const frontPath = path.join(__dirname, 'frontend', 'public', 'assets', 'images', item.filename);
    const req = https.get(item.url, {
      headers: {
        'User-Agent': 'ConnectMaratha/1.0 (educational maratha historical project; contact@connectmaratha.com)'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, {
          headers: { 'User-Agent': 'ConnectMaratha/1.0' }
        }, (res2) => {
          if (res2.statusCode === 200) {
            const out = fs.createWriteStream(pubPath);
            res2.pipe(out);
            out.on('finish', () => {
              out.close();
              fs.copyFileSync(pubPath, frontPath);
              console.log('SUCCESS redirected:', item.filename, fs.statSync(pubPath).size);
              resolve(true);
            });
          } else {
            console.log('REDIRECT FAIL', item.filename, res2.statusCode);
            resolve(false);
          }
        });
        return;
      }
      if (res.statusCode === 200) {
        const out = fs.createWriteStream(pubPath);
        res.pipe(out);
        out.on('finish', () => {
          out.close();
          fs.copyFileSync(pubPath, frontPath);
          console.log('SUCCESS:', item.filename, fs.statSync(pubPath).size);
          resolve(true);
        });
      } else {
        console.log('FAIL:', item.filename, res.statusCode);
        resolve(false);
      }
    });
    req.on('error', (err) => {
      console.log('REQ ERROR:', item.filename, err.message);
      resolve(false);
    });
  });
}

async function run() {
  for (const item of list) {
    await fetchFile(item);
  }
}

run();
