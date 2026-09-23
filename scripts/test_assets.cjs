const fs = require('fs');
const http = require('http');

const homeContent = fs.readFileSync('src/pages/home/HomePage.jsx', 'utf8');
const urls = new Set();
const re = /['"](\/assets\/[^'"]+)['"]/g;
let m;
while ((m = re.exec(homeContent)) !== null) {
  urls.add(m[1]);
}

// Also check home.css and style.css
if (fs.existsSync('src/styles/home.css')) {
  const css = fs.readFileSync('src/styles/home.css', 'utf8');
  while ((m = re.exec(css)) !== null) {
    urls.add(m[1]);
  }
}

console.log(`Found ${urls.size} asset URLs to test against http://localhost:3000...`);

async function testAll() {
  let failed = 0;
  for (const u of urls) {
    await new Promise((resolve) => {
      http.get('http://localhost:3000' + u, (res) => {
        const ct = res.headers['content-type'] || '';
        const isHtmlFallback = ct.includes('text/html');
        if (res.statusCode === 200 && !isHtmlFallback) {
          // OK
        } else {
          console.log(`FAIL [${res.statusCode}] (Content-Type: ${ct}) -> ${u}`);
          failed++;
        }
        res.resume();
        resolve();
      }).on('error', (err) => {
        console.log(`ERR ${u}: ${err.message}`);
        failed++;
        resolve();
      });
    });
  }
  console.log(`\nTest complete: ${urls.size - failed} OK, ${failed} FAILED.`);
}

testAll();
