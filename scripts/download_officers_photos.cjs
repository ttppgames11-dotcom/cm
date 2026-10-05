const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const officersDir = path.join(__dirname, 'public', 'assets', 'images', 'officers');
const frontOfficersDir = path.join(__dirname, 'frontend', 'public', 'assets', 'images', 'officers');

if (!fs.existsSync(officersDir)) fs.mkdirSync(officersDir, { recursive: true });
if (!fs.existsSync(frontOfficersDir)) fs.mkdirSync(frontOfficersDir, { recursive: true });

async function searchWikiFile(term) {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' + encodeURIComponent(term) + '&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|size&format=json';
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'ConnectMarathaApp/2.0 (contact@connectmaratha.com)' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query ? Object.values(json.query.pages) : [];
          resolve(pages.map(p => ({
            title: p.title,
            url: p.imageinfo?.[0]?.url,
            width: p.imageinfo?.[0]?.width,
            height: p.imageinfo?.[0]?.height
          })).filter(p => !p.title.endsWith('.pdf') && !p.title.endsWith('.djvu') && !p.title.endsWith('.svg')));
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

function downloadImage(url, destPath) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'ConnectMarathaApp/2.0 (contact@connectmaratha.com)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, destPath).then(resolve);
      }
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(destPath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          const stats = fs.statSync(destPath);
          if (stats.size > 2000) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      } else {
        resolve(false);
      }
    }).on('error', () => resolve(false));
  });
}

(async () => {
  const officersToSearch = [
    { id: 1, name: 'Tukaram Mundhe IAS', target: 'officer_tukaram.jpg' },
    { id: 2, name: 'Vishwas Nangare Patil IPS', target: 'officer_vishwas.jpg' },
    { id: 3, name: 'Ashwini Bhide IAS', target: 'officer_ashwini_bhide.jpg' },
    { id: 4, name: 'Mahesh Zagade IAS', target: 'officer_mahesh_zagade.jpg' },
    { id: 5, name: 'Sujata Saunik IAS', target: 'officer_sujata_saunik.jpg' },
    { id: 6, name: 'Prajakta Lavangare IAS', target: 'officer_prajakta_lavangare.jpg' },
    { id: 7, name: 'Milind Bharambe IPS', target: 'officer_milind_bharambe.jpg' },
    { id: 8, name: 'Tejaswi Satpute IPS', target: 'officer_tejaswi_satpute.jpg' },
    { id: 9, name: 'Shekhar Gaikwad IAS', target: 'officer_shekhar_gaikwad.jpg' },
    { id: 10, name: 'Sandeep Karnik IPS', target: 'officer_sandeep_karnik.jpg' },
    { id: 11, name: 'Nawal Kishore Ram IAS', target: 'officer_nawal_ram.jpg' },
    { id: 12, name: 'Sachin Kurve IAS', target: 'officer_sachin_kurve.jpg' },
    { id: 13, name: 'Indian Police Officer uniform', target: 'officer_ips_uniform.jpg' },
    { id: 14, name: 'Indian Administrative Service officer', target: 'officer_ias_admin.jpg' },
    { id: 15, name: 'Indian Forest Service officer', target: 'officer_ifs_forest.jpg' },
    { id: 16, name: 'Maharashtra police officer', target: 'officer_mh_police.jpg' },
    { id: 17, name: 'District Collector India officer', target: 'officer_collector.jpg' },
    { id: 18, name: 'Civil Surgeon Doctor India', target: 'officer_civil_surgeon.jpg' },
    { id: 19, name: 'District Judge India', target: 'officer_district_judge.jpg' }
  ];

  console.log('Searching Wikimedia Commons for authentic officers...');
  for (const item of officersToSearch) {
    const results = await searchWikiFile(item.name);
    console.log(`\n=== Query: "${item.name}" === Found: ${results.length}`);
    if (results.length > 0) {
      console.log(' Top match:', results[0].title, results[0].url);
      const dest = path.join(officersDir, item.target);
      const ok = await downloadImage(results[0].url, dest);
      if (ok) {
        fs.copyFileSync(dest, path.join(frontOfficersDir, item.target));
        console.log(` Saved ${item.target} (${fs.statSync(dest).size} bytes)`);
      }
    }
  }
})();
