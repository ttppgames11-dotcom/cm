const fs = require('fs');
const path = require('path');

const root = __dirname;
const htmlFiles = fs.readdirSync(root).filter(f => f.endsWith('.html'));

console.log(`Checking ${htmlFiles.length} HTML files in ${root}...\n`);

let issues = [];

htmlFiles.forEach(file => {
  const content = fs.readFileSync(path.join(root, file), 'utf8');

  // 1. Check images
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    let src = match[1];
    if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) continue;
    // strip query params or hashes
    src = src.split('?')[0].split('#')[0];
    const absPath = path.resolve(root, src);
    if (!fs.existsSync(absPath)) {
      issues.push(`[${file}] Broken IMG src: "${match[1]}" -> ${absPath}`);
    }
  }

  // 2. Check CSS and JS
  const linkRegex = /<(link|script)[^>]+(?:href|src)=["']([^"']+)["']/gi;
  while ((match = linkRegex.exec(content)) !== null) {
    let src = match[2];
    if (src.startsWith('http') || src.startsWith('//')) continue;
    src = src.split('?')[0].split('#')[0];
    const absPath = path.resolve(root, src);
    if (!fs.existsSync(absPath)) {
      issues.push(`[${file}] Broken CSS/JS: "${match[2]}" -> ${absPath}`);
    }
  }

  // 3. Check internal links <a href="...">
  const aRegex = /<a[^>]+href=["']([^"']+)["']/gi;
  while ((match = aRegex.exec(content)) !== null) {
    let href = match[1];
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http')) continue;
    let [targetFile, anchor] = href.split('#');
    if (targetFile) {
      const absPath = path.resolve(root, targetFile);
      if (!fs.existsSync(absPath)) {
        issues.push(`[${file}] Broken A href: "${href}"`);
      }
    }
  }

  // 4. Check inline onclick functions
  const onclickRegex = /onclick=["']([^"']+)["']/gi;
  while ((match = onclickRegex.exec(content)) !== null) {
    const fnCall = match[1];
    // check if function name is defined in app.js
  }
});

console.log(`Total issues found: ${issues.length}`);
issues.forEach(i => console.log(' - ' + i));
