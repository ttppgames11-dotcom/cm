import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find backend/db.json
const dbCandidates = [
  path.resolve(process.cwd(), 'backend/db.json'),
  path.resolve(__dirname, '../db.json'),
  path.resolve(__dirname, '../../backend/db.json'),
  path.resolve(__dirname, 'db.json'),
];

let dbPath = null;
for (const p of dbCandidates) {
  if (fs.existsSync(p)) {
    dbPath = p;
    break;
  }
}

if (!dbPath) {
  console.error('❌ Could not locate backend/db.json.');
  process.exit(1);
}

console.log(`📖 Normalizing dairy records in: ${dbPath}`);
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

db.dairy = db.dairy || [];

// Fallback: If db.dairy is empty, check if initial brand records exist in worktree or define standard brands
if (db.dairy.length === 0) {
  const worktreeDb = path.resolve(__dirname, '../../.kilo/worktrees/giant-starburst/backend/db.json');
  if (fs.existsSync(worktreeDb)) {
    try {
      const wtData = JSON.parse(fs.readFileSync(worktreeDb, 'utf8'));
      if (Array.isArray(wtData.dairy) && wtData.dairy.length > 0) {
        console.log(`📦 Importing ${wtData.dairy.length} legacy dairy brand records...`);
        db.dairy = wtData.dairy;
      }
    } catch (_) {}
  }

  // If still empty, add standard 3 Maratha dairy brands
  if (db.dairy.length === 0) {
    db.dairy = [
      {
        id: "DRY-601",
        brandName: "गोकुळ (कोल्हापूर जिल्हा दूध संघ)",
        type: "सहकारी दूध उत्पादक संघ",
        dailyProcurement: "१४ लाख लिटर्स प्रतिदिन",
        headquarters: "ताराबाई पार्क, कोल्हापूर",
        products: "गोकुळ गाय/म्हैस दूध, तूप, लोणी, श्रीखंड, पनीर",
        phone: "0231-2652200",
        website: "https://gokulmilk.coop",
        createdAt: "2026-09-24T04:48:33.453Z"
      },
      {
        id: "DRY-602",
        brandName: "चितळे डेअरी",
        type: "खाजगी / मराठा उद्योगसमूह",
        dailyProcurement: "८ लाख लिटर्स प्रतिदिन",
        headquarters: "भिलवडी, सांगली",
        products: "दूध, बासुंडी, श्रीखंड, पेढे, अम्रखंड",
        phone: "02346-232233",
        website: "https://chitalebandhu.in",
        createdAt: "2026-09-24T04:48:33.453Z"
      },
      {
        id: "DRY-603",
        brandName: "कात्रज डेअरी (पुणे जिल्हा सहकारी दूध संघ)",
        type: "सहकारी संस्था",
        dailyProcurement: "४ लाख लिटर्स प्रतिदिन",
        headquarters: "कात्रज, पुणे",
        products: "गाईचे दूध, आईस्क्रीम, ताक, दही, लस्सी",
        phone: "020-24370901",
        website: "https://katrajdairy.com",
        createdAt: "2026-09-24T04:48:33.453Z"
      }
    ];
  }
}

let brandsCount = 0;
let centresCount = 0;

for (const item of db.dairy) {
  if (item.brandName && String(item.brandName).trim().length > 0) {
    item.kind = 'brand';
    brandsCount++;
  } else {
    item.kind = 'centre';
    centresCount++;
  }
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

console.log(`✅ Dairy normalization complete: ${db.dairy.length} records total.`);
console.log(`   🏷️  Brands: ${brandsCount}`);
console.log(`   🏢 Centres: ${centresCount}`);
