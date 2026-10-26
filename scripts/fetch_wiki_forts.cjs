const fs = require('fs');
const path = require('path');
const { ALL_FORTS_350_DIRECTORY } = require('../src/data/allForts350Directory.js');

const unverified = ALL_FORTS_350_DIRECTORY.filter(f => !f.hasVerifiedPhoto);
console.log(`Checking ${unverified.length} forts...`);

async function queryFort(f) {
  const cleanName = f.englishName.replace(/\s+(Fort|Gadhi|Kot|Outpost|Outposts)$/i, '').trim();
  const queries = [cleanName + ' Fort', cleanName + ' Maharashtra', cleanName];

  for (const q of queries) {
    try {
      const url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=' + encodeURIComponent(q) + '&gsrnamespace=6&gsrlimit=3&prop=imageinfo&iiprop=url';
      const res = await fetch(url, { headers: { 'User-Agent': 'ConnectMaratha/2.0 (contact@connectmaratha.com)' } });
      const data = await res.json();
      const pages = data.query?.pages;
      if (pages) {
        for (const p of Object.values(pages)) {
          const imgUrl = p.imageinfo?.[0]?.url;
          if (imgUrl && /\.(jpg|jpeg|png|webp)(\?|$)/i.test(imgUrl)) {
            const lower = imgUrl.toLowerCase();
            if (!lower.includes('gazetteer') && !lower.includes('document') && !lower.includes('map') && !lower.includes('plan') && !lower.includes('newspaper') && !lower.includes('journal') && !lower.includes('pdf') && !lower.includes('sawmai')) {
              return { id: f.id, marathiName: f.marathiName, englishName: f.englishName, url: imgUrl, query: q };
            }
          }
        }
      }
    } catch (err) {}
  }
  return null;
}

async function run() {
  const concurrency = 8;
  const results = {};
  for (let i = 0; i < unverified.length; i += concurrency) {
    const batch = unverified.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(queryFort));
    for (const res of batchResults) {
      if (res) results[res.id] = res;
    }
    process.stdout.write(`Processed ${Math.min(i + concurrency, unverified.length)}/${unverified.length} (Found: ${Object.keys(results).length})\r`);
  }
  console.log(`\nCompleted! Found ${Object.keys(results).length} images.`);
  fs.writeFileSync(path.join(__dirname, '../scratch_wiki_forts.json'), JSON.stringify(results, null, 2));
}

run();
