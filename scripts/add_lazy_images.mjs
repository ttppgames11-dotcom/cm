import fs from 'fs';

const filePath = 'frontend/src/pages/home/HomePage.jsx';
let code = fs.readFileSync(filePath, 'utf8');

const beforeMatches = code.match(/loading="lazy"/g);
const beforeCount = beforeMatches ? beforeMatches.length : 0;

// Add loading="lazy" decoding="async" to images without loading attribute
code = code.replace(/<img(?![^>]*loading=)([^>]+)>/g, '<img loading="lazy" decoding="async"$1>');

const afterMatches = code.match(/loading="lazy"/g);
const afterCount = afterMatches ? afterMatches.length : 0;

fs.writeFileSync(filePath, code, 'utf8');
console.log(`Added loading="lazy" and decoding="async" to ${afterCount - beforeCount} images in HomePage.jsx`);
