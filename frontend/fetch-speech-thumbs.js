import https from 'https';
import fs from 'fs';

const url = 'https://www.youtube.com/results?search_query=manoj+jarange+patil+antarwali+sarati+sabha+speech';

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, res => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    const ids = [...html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)].map(m => m[1]);
    const uniqueIds = [...new Set(ids)];
    console.log('Video IDs found:', uniqueIds.slice(0, 10));
    
    // Download thumbnail for first valid video
    if (uniqueIds.length > 0) {
      testThumbnails(uniqueIds);
    }
  });
});

function testThumbnails(ids) {
  let index = 0;
  function tryNext() {
    if (index >= ids.length) return;
    const vid = ids[index++];
    const thumbUrl = `https://img.youtube.com/vi/${vid}/maxresdefault.jpg`;
    console.log('Testing thumb:', thumbUrl);
    https.get(thumbUrl, res => {
      console.log(`Video ${vid} status:`, res.statusCode);
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(`public/assets/images/yt_thumb_${vid}.jpg`);
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`Downloaded thumbnail for ${vid}, size:`, fs.statSync(`public/assets/images/yt_thumb_${vid}.jpg`).size);
          tryNext();
        });
      } else {
        tryNext();
      }
    });
  }
  tryNext();
}
