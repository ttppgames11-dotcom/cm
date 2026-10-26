const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CATEGORIES = [
  'Category:Statues_of_Tarabai',
  'Category:Tarabai',
  'Category:Statues_of_Ahilyabai_Holkar',
  'Category:Statues_of_Jijabai',
  'Category:Jijabai'
];

function listCategoryMembers(category) {
  return new Promise((resolve) => {
    const api = `https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(category)}&cmtype=file&cmlimit=30&format=json`;
    https.get(api, {
      headers: {
        'User-Agent': 'ConnectMarathaApp/1.0 (https://connectmaratha.org; contact@connectmaratha.org)'
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.query.categorymembers || []);
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

async function run() {
  for (const cat of CATEGORIES) {
    console.log(`=== ${cat} ===`);
    const members = await listCategoryMembers(cat);
    members.forEach(m => console.log('  ' + m.title));
  }
}

run();
