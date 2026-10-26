const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const officersDir = path.join(__dirname, 'public', 'assets', 'images', 'officers');
const frontOfficersDir = path.join(__dirname, 'frontend', 'public', 'assets', 'images', 'officers');

async function searchWikiFile(term) {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' + encodeURIComponent(term) + '&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|size&format=json';
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
    { name: 'Kiran Bedi', target: 'officer_kiran_bedi.jpg' },
    { name: 'Archana Ramasundaram', target: 'officer_archana_ips.jpg' },
    { name: 'V. Venkatesham IPS', target: 'officer_venkatesham.jpg' },
    { name: 'K. Vijay Kumar IPS', target: 'officer_vijay_kumar.jpg' },
    { name: 'U. Sagayam IAS', target: 'officer_sagayam.jpg' },
    { name: 'Armstrong Pame IAS', target: 'officer_armstrong.jpg' },
    { name: 'Hari Chandana Dasari IAS', target: 'officer_hari_chandana.jpg' },
    { name: 'D. Roopa IPS', target: 'officer_roopa_ips.jpg' },
    { name: 'Sanjiv Bhatt IPS', target: 'officer_sanjiv_ips.jpg' },
    { name: 'B. Chandrakala IAS', target: 'officer_chandrakala.jpg' },
    { name: 'Smita Sabharwal IAS', target: 'officer_smita_sabharwal.jpg' },
    { name: 'Tina Dabi IAS', target: 'officer_tina_dabi.jpg' },
    { name: 'Shivdeep Lande IPS', target: 'officer_shivdeep_lande.jpg' },
    { name: 'Manish Kumar Verma IAS', target: 'officer_manish_ias.jpg' },
    { name: 'Ravi Sinha IPS', target: 'officer_ravi_sinha.jpg' },
    { name: 'Hemant Karkare', target: 'officer_karkare.jpg' },
    { name: 'Rameshwar Thakur IAS', target: 'officer_rameshwar.jpg' },
    { name: 'Ajit Doval IPS', target: 'officer_doval.jpg' },
    { name: 'Sunil Arora IAS', target: 'officer_sunil_arora.jpg' },
    { name: 'Rajiv Gauba IAS', target: 'officer_rajiv_gauba.jpg' },
    { name: 'Ajay Kumar Bhalla IAS', target: 'officer_ajay_bhalla.jpg' },
    { name: 'P. K. Mishra IAS', target: 'officer_pk_mishra.jpg' },
    { name: 'Sanjiv Kumar IAS', target: 'officer_sanjiv_kumar.jpg' },
    { name: 'Alok Sharma IPS', target: 'officer_alok_sharma.jpg' },
    { name: 'Tapan Kumar Deka IPS', target: 'officer_tapan_deka.jpg' },
    { name: 'Subodh Kumar Jaiswal IPS', target: 'officer_subodh_jaiswal.jpg' },
    { name: 'Rakesh Asthana IPS', target: 'officer_rakesh_asthana.jpg' },
    { name: 'Director General of Police India', target: 'officer_dgp_india.jpg' },
    { name: 'Indian Police Service medal', target: 'officer_ips_medal.jpg' }
  ];

  console.log('Searching for distinguished real officers...');
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
