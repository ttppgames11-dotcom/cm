import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Locate frontend/src/pages/business/BuildersDirectoryPage.jsx
const candidatePaths = [
  path.resolve(process.cwd(), 'frontend/src/pages/business/BuildersDirectoryPage.jsx'),
  path.resolve(__dirname, '../frontend/src/pages/business/BuildersDirectoryPage.jsx'),
  path.resolve(__dirname, '../../frontend/src/pages/business/BuildersDirectoryPage.jsx'),
  path.resolve(__dirname, '../.kilo/worktrees/giant-starburst/frontend/src/pages/business/BuildersDirectoryPage.jsx'),
];

let jsxPath = null;
for (const p of candidatePaths) {
  if (fs.existsSync(p)) {
    jsxPath = p;
    break;
  }
}

if (!jsxPath) {
  console.error('❌ Could not locate BuildersDirectoryPage.jsx in expected paths.');
  process.exit(1);
}

console.log(`📖 Reading builders data from: ${jsxPath}`);

// Locate backend/db.json
const dbCandidates = [
  path.resolve(process.cwd(), 'backend/db.json'),
  path.resolve(__dirname, '../backend/db.json'),
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
  console.error('❌ Could not locate db.json.');
  process.exit(1);
}

// Read JSX file and extract initialBuildersData / buildersData
const jsxContent = fs.readFileSync(jsxPath, 'utf8');

function extractArray(content) {
  const marker = content.search(/const\s+(?:initialBuildersData|buildersData)\s*=\s*\[/);
  if (marker === -1) return null;
  const start = content.indexOf('[', marker);
  let depth = 0;
  for (let i = start; i < content.length; i++) {
    if (content[i] === '[') depth++;
    else if (content[i] === ']') {
      depth--;
      if (depth === 0) {
        return content.substring(start, i + 1);
      }
    }
  }
  return null;
}

const arrayCode = extractArray(jsxContent);

let initialBuildersData = [];
if (arrayCode) {
  try {
    const fn = new Function(`return ${arrayCode}`);
    initialBuildersData = fn();
  } catch (err) {
    console.error('❌ Error evaluating buildersData from JSX:', err.message);
  }
}

if (!initialBuildersData || initialBuildersData.length === 0) {
  console.error('❌ Failed to parse initialBuildersData from BuildersDirectoryPage.jsx.');
  process.exit(1);
}

console.log(`🔍 Found ${initialBuildersData.length} builders in BuildersDirectoryPage.jsx.`);

// Read db.json
let db = {};
try {
  db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
} catch (e) {
  db = {};
}

db.builders = db.builders || [];
const existingBuilders = db.builders;

let insertedCount = 0;
let skippedCount = 0;

for (const item of initialBuildersData) {
  const developer = (item.name || item.developer || '').trim();
  const projectName = (item.projects || item.projectName || '').trim();

  // Match on developer + projectName
  const exists = existingBuilders.some(ex => {
    const exDev = (ex.developer || ex.name || '').trim().toLowerCase();
    const exProj = (ex.projectName || ex.projects || '').trim().toLowerCase();
    return exDev === developer.toLowerCase() && exProj === projectName.toLowerCase();
  });

  if (exists) {
    skippedCount++;
    continue;
  }

  const cleanPhone = (item.phone || '').replace(/\D/g, '').slice(-10) || '9822011445';
  const cleanRera = (item.rera || '').trim();
  const reraApproved = Boolean(cleanRera && cleanRera !== 'नोंदणीकृत');

  const newBuilder = {
    id: `BLD-${String(item.id || Date.now()).replace(/\D/g, '').padStart(4, '0').slice(-4)}`,
    developer: developer,
    name: developer,
    projectName: projectName,
    projects: projectName,
    city: item.city || 'महाराष्ट्र',
    location: item.city || 'महाराष्ट्र',
    configuration: item.category || item.specialty || 'गृहनिर्माण',
    category: item.category || 'गृहनिर्माण',
    specialty: item.specialty || 'गृहनिर्माण प्रकल्प तज्ज्ञ',
    phone: cleanPhone,
    rera: cleanRera || (reraApproved ? 'RERA मान्यताप्राप्त' : 'नोंदणीकृत'),
    reraNumber: cleanRera,
    reraApproved: reraApproved,
    experience: item.experience || '१०+ वर्षे',
    icon: item.icon || '🏢',
    desc: item.desc || 'विश्वासार्ह व दर्जेदार गृहप्रकल्प उभारणीतील अग्रगण्य मराठा ब्रँड.',
    discountForMembers: null,
    amenities: ['पार्किंग', '२४ तास पाणी', 'सुरक्षा', 'लिफ्ट'],
    flatsDelivered: 50,
    projectType: item.category === 'लक्झरी प्रोजेक्ट्स' ? 'villas' : (item.category === 'इंडस्ट्रियल' ? 'plots' : 'flats'),
    possessionDate: 'तयार (Ready)',
    createdAt: new Date().toISOString()
  };

  db.builders.push(newBuilder);
  insertedCount++;
}

// Write back to db.json
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

console.log(`✅ Seed complete:`);
console.log(`   - ${insertedCount} builders newly inserted`);
console.log(`   - ${skippedCount} builders already existed`);
console.log(`   - Total builders in db.json: ${db.builders.length}`);
