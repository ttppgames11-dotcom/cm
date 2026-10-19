import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Locate MarathaDairyPage.jsx
const candidateJsx = [
  path.resolve(process.cwd(), 'frontend/src/pages/business/MarathaDairyPage.jsx'),
  path.resolve(__dirname, '../../frontend/src/pages/business/MarathaDairyPage.jsx'),
  path.resolve(__dirname, '../frontend/src/pages/business/MarathaDairyPage.jsx'),
  path.resolve(__dirname, '../../.kilo/worktrees/giant-starburst/frontend/src/pages/business/MarathaDairyPage.jsx'),
];

let jsxPath = null;
for (const p of candidateJsx) {
  if (fs.existsSync(p)) {
    jsxPath = p;
    break;
  }
}

if (!jsxPath) {
  console.error('❌ Could not locate MarathaDairyPage.jsx in candidate paths.');
  process.exit(1);
}

console.log(`📖 Reading centres and products from: ${jsxPath}`);

// 2. Locate backend/db.json
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

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
db.dairy = db.dairy || [];
db.dairyProducts = db.dairyProducts || [];

// 3. Define the detailed collection centres derived from MarathaDairyPage.jsx
const centresToSeed = [
  {
    id: 'DRY-CTR-1',
    dairyName: 'संकलन केंद्र - इस्लामपूर',
    village: 'इस्लामपूर',
    taluka: 'वाळवा',
    district: 'सांगली',
    morningTiming: 'सकाळी ५:०० ते ११:००',
    eveningTiming: 'संध्याकाळी ५:०० ते ९:००',
    timing: 'सकाळी ५:०० ते ११:००',
    registeredFarmers: 310,
    centerHead: 'शंकरराव पाटील',
    contact: '9865432100',
    phone: '9865432100',
    facilities: [
      'ऑटोमॅटिक फॅट टेस्टिंग मशिन',
      'चिलिंग युनिट (BMC)',
      'थेट बँक खात्यात पैसे जमा',
      'पशुखाद्य वितरण केंद्र'
    ],
    dailyCollection: '१,२५० लिटर',
    milkRateCow: '₹३८ / लिटर',
    milkRateBuffalo: '₹५६ / लिटर',
    kind: 'centre',
    verified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'DRY-CTR-2',
    dairyName: 'संकलन केंद्र - शिरोळ',
    village: 'शिरोळ',
    taluka: 'शिरोळ',
    district: 'कोल्हापूर',
    morningTiming: 'सकाळी ५:३० ते ११:३०',
    eveningTiming: 'संध्याकाळी ५:३० ते ९:३०',
    timing: 'सकाळी ५:३० ते ११:३०',
    registeredFarmers: 240,
    centerHead: 'विश्वासराव माने',
    contact: '9422087654',
    phone: '9422087654',
    facilities: [
      'बल्क मिल्क कुलर (BMC)',
      'डिजिटल वजनकाटा',
      'अमृत पशुखाद्य विक्री'
    ],
    dailyCollection: '९८० लिटर',
    milkRateCow: '₹३८ / लिटर',
    milkRateBuffalo: '₹५६ / लिटर',
    kind: 'centre',
    verified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'DRY-CTR-3',
    dairyName: 'संकलन केंद्र - कागल',
    village: 'कागल',
    taluka: 'कागल',
    district: 'कोल्हापूर',
    morningTiming: 'सकाळी ६:०० ते ११:००',
    eveningTiming: 'संध्याकाळी ५:०० ते ८:३०',
    timing: 'सकाळी ६:०० ते ११:००',
    registeredFarmers: 195,
    centerHead: 'तानाजीराव घाटगे',
    contact: '9158011223',
    phone: '9158011223',
    facilities: [
      'दूध शीतकरण सुविधा',
      'फॅट व एसएनएफ टेस्टिंग',
      'कृषी सल्लागार मार्गदर्शन'
    ],
    dailyCollection: '७६५ लिटर',
    milkRateCow: '₹३८ / लिटर',
    milkRateBuffalo: '₹५६ / लिटर',
    kind: 'centre',
    verified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'DRY-CTR-4',
    dairyName: 'संकलन केंद्र - हातकणंगले',
    village: 'हातकणंगले',
    taluka: 'हातकणंगले',
    district: 'कोल्हापूर',
    morningTiming: 'सकाळी ५:०० ते १०:३०',
    eveningTiming: 'संध्याकाळी ५:०० ते ९:००',
    timing: 'सकाळी ५:०० ते १०:३०',
    registeredFarmers: 285,
    centerHead: 'बाळासाहेब शिंदे',
    contact: '8805699887',
    phone: '8805699887',
    facilities: [
      'ऑटोमॅटिक मिल्क कलेक्शन युनिट',
      'बल्क मिल्क चिलर',
      'शेतकरी प्रशिक्षण केंद्र'
    ],
    dailyCollection: '१,१२० लिटर',
    milkRateCow: '₹३८ / लिटर',
    milkRateBuffalo: '₹५६ / लिटर',
    kind: 'centre',
    verified: true,
    createdAt: new Date().toISOString()
  }
];

// 4. Define productsData derived from MarathaDairyPage.jsx
const productsToSeed = [
  {
    id: 'PROD-001',
    name: 'ताजे गाईचे दूध (५०० मि.ली.)',
    category: 'दूध',
    packSize: '500 ml',
    price: 28,
    description: '३.८% फॅट, नैसर्गिक व शुद्ध ताज्या गाईचे पाश्चराइज्ड दूध',
    sellerId: 'DRY-CTR-1',
    available: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'PROD-002',
    name: 'ताजे गाईचे दूध (१ लिटर)',
    category: 'दूध',
    packSize: '1 Litre',
    price: 54,
    description: '३.८% फॅट, रोजच्या चहा व आरोग्यासाठी पोषक ताजं दूध',
    sellerId: 'DRY-CTR-1',
    available: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'PROD-003',
    name: 'ताजे गोड दही (५०० ग्रॅम)',
    category: 'दही',
    packSize: '500 gm',
    price: 30,
    description: 'नैसर्गिक चव, दाट साय आणि पारंपरिक चवीचे ताजे दही',
    sellerId: 'DRY-CTR-2',
    available: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'PROD-004',
    name: 'शुद्ध मलाई पनीर (२०० ग्रॅम)',
    category: 'पनीर',
    packSize: '200 gm',
    price: 30,
    description: 'उच्च प्रोटिन, मऊ व स्वादिष्ट शुद्ध मलाई पनीर',
    sellerId: 'DRY-CTR-2',
    available: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'PROD-005',
    name: 'शुद्ध गाईचे तूप (५०० मि.ली.)',
    category: 'तूप',
    packSize: '500 ml',
    price: 320,
    description: 'पारंपरिक दाणेदार सुगंधी व सात्विक गाईचे कढवलेले तूप',
    sellerId: 'DRY-CTR-3',
    available: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'PROD-006',
    name: 'मसाला ताक / लस्सी (२५० मि.ली.)',
    category: 'ताक',
    packSize: '250 ml',
    price: 25,
    description: 'थंडगार पाचक मसाला ताक, जिरे व कोथिंबीरयुक्त',
    sellerId: 'DRY-CTR-4',
    available: true,
    createdAt: new Date().toISOString()
  }
];

// 5. Seed Centres into db.dairy (skipping duplicates)
let centresAdded = 0;
for (const centre of centresToSeed) {
  const existing = db.dairy.find(d => 
    (d.id && d.id === centre.id) ||
    (d.dairyName && d.dairyName.toLowerCase() === centre.dairyName.toLowerCase()) ||
    (d.village && d.district && d.village.toLowerCase() === centre.village.toLowerCase() && d.district.toLowerCase() === centre.district.toLowerCase())
  );

  if (!existing) {
    db.dairy.push(centre);
    centresAdded++;
    console.log(`➕ Added centre: ${centre.dairyName} (${centre.village}, ${centre.district})`);
  } else {
    console.log(`ℹ️ Centre already exists: ${centre.dairyName}`);
  }
}

// 6. Seed Products into db.dairyProducts (skipping duplicates)
let productsAdded = 0;
for (const prod of productsToSeed) {
  const existing = db.dairyProducts.find(p => 
    (p.id && p.id === prod.id) ||
    (p.name && p.name.trim().toLowerCase() === prod.name.trim().toLowerCase())
  );

  if (!existing) {
    db.dairyProducts.push(prod);
    productsAdded++;
    console.log(`➕ Added product: ${prod.name} (${prod.category} - ₹${prod.price})`);
  } else {
    console.log(`ℹ️ Product already exists: ${prod.name}`);
  }
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

console.log(`\n🎉 Seeding complete!`);
console.log(`   Centres added: ${centresAdded} (Total: ${db.dairy.length})`);
console.log(`   Products added: ${productsAdded} (Total: ${db.dairyProducts.length})`);
