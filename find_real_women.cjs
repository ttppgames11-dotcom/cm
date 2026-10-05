const https = require('https');
const fs = require('fs');
const path = require('path');

function searchCommons(srsearch) {
  return new Promise((resolve) => {
    const url = 'https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=' + encodeURIComponent(srsearch) + '&srnamespace=6&srlimit=15&format=json';
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.query?.search || []);
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

function getImageInfo(titles) {
  return new Promise((resolve) => {
    const url = 'https://commons.wikimedia.org/w/api.php?action=query&titles=' + encodeURIComponent(titles.join('|')) + '&prop=imageinfo&iiprop=url|size|mime&format=json';
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = Object.values(json.query?.pages || {});
          resolve(pages.map(p => ({
            title: p.title,
            url: p.imageinfo?.[0]?.url,
            mime: p.imageinfo?.[0]?.mime,
            width: p.imageinfo?.[0]?.width,
            height: p.imageinfo?.[0]?.height
          })));
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

async function findImages(query) {
  console.log('Searching:', query);
  const items = await searchCommons(query);
  const titles = items.map(i => i.title).filter(t => /\.(jpg|jpeg|png|webp)$/i.test(t));
  if (titles.length === 0) return [];
  const infos = await getImageInfo(titles.slice(0, 10));
  return infos.filter(img => img.url && (img.width >= 400));
}

(async () => {
  const categories = [
    { key: 'farmer', q: 'woman farmer Maharashtra India' },
    { key: 'farmer2', q: 'women organic farming India' },
    { key: 'lawyer', q: 'woman lawyer India court' },
    { key: 'lawyer2', q: 'woman advocate India' },
    { key: 'officer', q: 'IAS officer woman Maharashtra' },
    { key: 'officer2', q: 'district magistrate woman India' },
    { key: 'officer3', q: 'female officer India government' },
    { key: 'shg', q: 'women self help group Maharashtra' },
    { key: 'shg2', q: 'women food production India self help' }
  ];

  for (const cat of categories) {
    const results = await findImages(cat.q);
    console.log(`=== ${cat.key} (${results.length} found) ===`);
    results.slice(0, 3).forEach(r => console.log(`- ${r.title} | ${r.width}x${r.height}\n  ${r.url}`));
  }
})();
