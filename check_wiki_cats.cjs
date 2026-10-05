const https = require('https');

async function checkWikiCategory(cat) {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtitle=' + encodeURIComponent(cat) + '&cmtype=file&cmlimit=20&format=json';
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.query?.categorymembers || []);
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

(async () => {
  const cats = [
    'Category:Female farmers from India',
    'Category:Women in agriculture in India',
    'Category:Female judges from India',
    'Category:Female lawyers from India',
    'Category:Indian Administrative Service officers',
    'Category:Women entrepreneurs of India',
    'Category:Women of Maharashtra'
  ];
  for (const c of cats) {
    const members = await checkWikiCategory(c);
    console.log(c, members.length);
    members.slice(0, 3).forEach(m => console.log('  ', m.title));
  }
})();
