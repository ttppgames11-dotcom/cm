import https from 'https';

function searchDDG() {
  const query = encodeURIComponent('Manoj Jarange Patil Antarwali Sarati speech stage crowd');
  const url = `https://html.duckduckgo.com/html/?q=${query}`;

  const req = https.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5'
    }
  }, (res) => {
    let html = '';
    res.on('data', chunk => html += chunk);
    res.on('end', () => {
      const urls = [...html.matchAll(/https?:\/\/[^"'\s<>]+\.(?:jpg|jpeg|png|webp)/gi)].map(m => m[0]);
      console.log('Found image URLs:', [...new Set(urls)].slice(0, 15));
    });
  });

  req.on('error', err => console.error(err));
}

searchDDG();
