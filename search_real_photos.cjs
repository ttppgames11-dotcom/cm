const https = require('https');

async function searchWikiFile(term) {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' + encodeURIComponent(term) + '&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|size&format=json';
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
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
          })).filter(p => !p.title.endsWith('.pdf') && !p.title.endsWith('.djvu')));
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

(async () => {
  const terms = [
    'Indian woman farmer',
    'Indian woman dairy',
    'Indian lawyer woman',
    'advocate court India woman',
    'Indian woman official',
    'officer India woman civil',
    'women self help India group',
    'women spice processing India'
  ];

  for (const t of terms) {
    const res = await searchWikiFile(t);
    console.log(`=== "${t}": ${res.length} results ===`);
    res.forEach(r => console.log(`- ${r.title} (${r.width}x${r.height})\n  ${r.url}`));
  }
})();
