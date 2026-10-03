import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabase, saveDatabase } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// All 36 official States & Union Territories of India with LGD Codes
const INDIAN_STATES = [
  { code: '27', name: 'Maharashtra / महाराष्ट्र' },
  { code: '30', name: 'Goa / गोवा' },
  { code: '29', name: 'Karnataka / कर्नाटक' },
  { code: '24', name: 'Gujarat / गुजरात' },
  { code: '23', name: 'Madhya Pradesh / मध्य प्रदेश' },
  { code: '22', name: 'Chhattisgarh / छत्तीसगढ' },
  { code: '36', name: 'Telangana / तेलंगणा' },
  { code: '28', name: 'Andhra Pradesh / आंध्र प्रदेश' },
  { code: '33', name: 'Tamil Nadu / तामिळनाडू' },
  { code: '07', name: 'Delhi / दिल्ली' },
  { code: '08', name: 'Rajasthan / राजस्थान' },
  { code: '09', name: 'Uttar Pradesh / उत्तर प्रदेश' },
  { code: '10', name: 'Bihar / बिहार' },
  { code: '19', name: 'West Bengal / पश्चिम बंगाल' },
  { code: '03', name: 'Punjab / पंजाब' },
  { code: '06', name: 'Haryana / हरियाणा' },
  { code: '02', name: 'Himachal Pradesh / हिमाचल प्रदेश' },
  { code: '05', name: 'Uttarakhand / उत्तराखंड' },
  { code: '20', name: 'Jharkhand / झारखंड' },
  { code: '21', name: 'Odisha / ओडिशा' },
  { code: '32', name: 'Kerala / केरळ' },
  { code: '18', name: 'Assam / आसाम' },
  { code: '12', name: 'Arunachal Pradesh / अरुणाचल प्रदेश' },
  { code: '17', name: 'Meghalaya / मेघालय' },
  { code: '14', name: 'Manipur / मणिपूर' },
  { code: '15', name: 'Mizoram / मिझोरम' },
  { code: '13', name: 'Nagaland / नागालँड' },
  { code: '16', name: 'Tripura / त्रिपुरा' },
  { code: '11', name: 'Sikkim / सिक्कीम' },
  { code: '01', name: 'Jammu and Kashmir / जम्मू आणि काश्मीर' },
  { code: '37', name: 'Ladakh / लडाख' },
  { code: '04', name: 'Chandigarh / चंदीगड' },
  { code: '34', name: 'Puducherry / पुडुचेरी' },
  { code: '38', name: 'The Dadra and Nagar Haveli and Daman and Diu / दादरा व नगर हवेली आणि दमण व दीव' },
  { code: '31', name: 'Lakshadweep / लक्षद्वीप' },
  { code: '35', name: 'Andaman and Nicobar Islands / अंदमान आणि निकोबार' }
];

// District Marathi translations map for all 36 Maharashtra districts
const DISTRICT_TRANSLATIONS = {
  'Ahilyanagar': 'अहिल्यानगर (अहमदनगर)',
  'Akola': 'अकोला',
  'Amravati': 'अमरावती',
  'Beed': 'बीड',
  'Bhandara': 'भंडारा',
  'Buldhana': 'बुलढाणा',
  'Chandrapur': 'चंद्रपूर',
  'Chhatrapati Sambhajinagar': 'छत्रपती संभाजीनगर (औरंगाबाद)',
  'Dharashiv': 'धाराशिव (उस्मानाबाद)',
  'Dhule': 'धुळे',
  'Gadchiroli': 'गडचिरोली',
  'Gondia': 'गोंदिया',
  'Hingoli': 'हिंगोली',
  'Jalgaon': 'जळगाव',
  'Jalna': 'जालना',
  'Kolhapur': 'कोल्हापूर',
  'Latur': 'लातूर',
  'Mumbai City': 'मुंबई शहर',
  'Mumbai': 'मुंबई शहर',
  'Mumbai Suburban': 'मुंबई उपनगर',
  'Nagpur': 'नागपूर',
  'Nanded': 'नांदेड',
  'Nandurbar': 'नंदुरबार',
  'Nashik': 'नाशिक',
  'Palghar': 'पालघर',
  'Parbhani': 'परभणी',
  'Pune': 'पुणे',
  'Raigad': 'रायगड',
  'Ratnagiri': 'रत्नागिरी',
  'Sangli': 'सांगली',
  'Satara': 'सातारा',
  'Sindhudurg': 'सिंधुदुर्ग',
  'Solapur': 'सोलापूर',
  'Thane': 'ठाणे',
  'Wardha': 'वर्धा',
  'Washim': 'वाशिम',
  'Yavatmal': 'यवतमाळ'
};

const TALUKA_TRANSLATIONS = {
  'Haveli': 'हवेली', 'Pune City': 'पुणे शहर', 'Baramati': 'बारामती', 'Shirur': 'शिरूर',
  'Indapur': 'इंदापूर', 'Daund': 'दौंड', 'Khed': 'खेड', 'Ambegaon': 'आंबेगाव',
  'Junnar': 'जुन्नर', 'Mawal': 'मावळ', 'Mulshi': 'मुळशी', 'Bhor': 'भोर',
  'Purandhar': 'पुरंदर', 'Velhe': 'वेल्हे', 'Karad': 'कराड', 'Satara': 'सातारा',
  'Patan': 'पाटण', 'Phaltan': 'फलटण', 'Khatav': 'खटाव', 'Man': 'माण',
  'Koregaon': 'कोरेगाव', 'Wai': 'वाई', 'Khandala': 'खंडाळा', 'Mahabaleshwar': 'महाबळेश्वर',
  'Jaoli': 'जावळी', 'Karvir': 'करवीर', 'Panhala': 'पन्हाळा', 'Shahuwadi': 'शाहूवाडी',
  'Kagal': 'कागल', 'Hatkanangle': 'हातकणंगले', 'Shirol': 'शिरोळ', 'Radhanagari': 'राधानगरी',
  'Gaganbawada': 'गगनबावडा', 'Bhudargad': 'भुदरगड', 'Gadhinglaj': 'गडहिंग्लज',
  'Chandgad': 'चंदगड', 'Ajra': 'आजरा', 'Miraj': 'मिरज', 'Walwa': 'वाळवा',
  'Tasgaon': 'तासगाव', 'Khanapur': 'खानापूर', 'Atpadi': 'आटपाडी', 'Jat': 'जत',
  'Kadegaon': 'कडेगाव', 'Shirala': 'शिराळा', 'Palus': 'पलूस', 'Kavathemahankal': 'कवठेमहांकाळ'
};

export async function seedLocations(csvPath) {
  console.log('📍 Seeding Hierarchical Administrative Locations...');
  const db = await getDatabase();

  // Create tables if not exist
  db.run(`
    CREATE TABLE IF NOT EXISTS countries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL
    );
    CREATE TABLE IF NOT EXISTS states (
      id TEXT PRIMARY KEY,
      country_id TEXT NOT NULL,
      name TEXT NOT NULL,
      code TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_states_country_id ON states(country_id);

    CREATE TABLE IF NOT EXISTS districts (
      id TEXT PRIMARY KEY,
      state_id TEXT NOT NULL,
      name TEXT NOT NULL,
      code TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_districts_state_id ON districts(state_id);

    CREATE TABLE IF NOT EXISTS talukas (
      id TEXT PRIMARY KEY,
      district_id TEXT NOT NULL,
      name TEXT NOT NULL,
      code TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_talukas_district_id ON talukas(district_id);

    CREATE TABLE IF NOT EXISTS villages (
      id TEXT PRIMARY KEY,
      taluka_id TEXT NOT NULL,
      name TEXT NOT NULL,
      code TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_villages_taluka_id ON villages(taluka_id);
    CREATE INDEX IF NOT EXISTS idx_villages_name ON villages(name);
  `);

  // 1. Seed Country
  db.run(`INSERT OR REPLACE INTO countries (id, name, code) VALUES ('IN', 'India / भारत', 'IN')`);

  // 2. Seed States
  db.run('BEGIN TRANSACTION');
  const stateStmt = db.prepare(`INSERT OR REPLACE INTO states (id, country_id, name, code) VALUES (?, ?, ?, ?)`);
  for (const st of INDIAN_STATES) {
    stateStmt.run([st.code, 'IN', st.name, st.code]);
  }
  stateStmt.free();
  db.run('COMMIT');
  console.log(`✓ Seeded ${INDIAN_STATES.length} States & UTs`);

  // 3. Process CSV for Maharashtra (State 27)
  if (!fs.existsSync(csvPath)) {
    console.error(`LGD CSV file not found at: ${csvPath}`);
    return;
  }

  const rl = readline.createInterface({
    input: fs.createReadStream(csvPath),
    crlfDelay: Infinity
  });

  const districtsMap = new Map();
  const talukasMap = new Map();
  const villagesList = [];

  let isHeader = true;

  for await (const line of rl) {
    if (isHeader) {
      isHeader = false;
      continue;
    }

    const cols = [];
    let curr = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { inQuotes = !inQuotes; }
      else if (c === ',' && !inQuotes) { cols.push(curr); curr = ''; }
      else { curr += c; }
    }
    cols.push(curr);

    // Columns: S.No.(0), District Code(1), District Name(2), Sub-District Code(3), Sub-District Name(4),
    // Village Code(5), Village Version(6), Village Name English(7), Village Name Local(8)... State Code(14)
    const stateCode = cols[14];
    if (stateCode === '27') {
      const distCode = cols[1];
      const distNameEn = cols[2];
      const subDistCode = cols[3];
      const subDistNameEn = cols[4];
      const villageCode = cols[5];
      const villageNameEn = cols[7];
      const villageNameLocal = cols[8];

      // District
      if (!districtsMap.has(distCode)) {
        const mr = DISTRICT_TRANSLATIONS[distNameEn] || distNameEn;
        const bilingual = mr !== distNameEn ? `${distNameEn} / ${mr}` : distNameEn;
        districtsMap.set(distCode, { id: distCode, stateId: '27', name: bilingual, code: distCode });
      }

      // Taluka
      if (!talukasMap.has(subDistCode)) {
        const mr = TALUKA_TRANSLATIONS[subDistNameEn] || subDistNameEn;
        const bilingual = mr !== subDistNameEn ? `${subDistNameEn} / ${mr}` : subDistNameEn;
        talukasMap.set(subDistCode, { id: subDistCode, districtId: distCode, name: bilingual, code: subDistCode });
      }

      // Village
      const name = villageNameLocal && villageNameLocal.trim().length > 0 && villageNameLocal !== villageNameEn
        ? `${villageNameEn} / ${villageNameLocal.trim()}`
        : villageNameEn;

      villagesList.push({
        id: villageCode,
        talukaId: subDistCode,
        name: name,
        code: villageCode
      });
    }
  }

  // Also ensure Mumbai City (District 482) is included (as urban district)
  if (!districtsMap.has('482')) {
    districtsMap.set('482', {
      id: '482',
      stateId: '27',
      name: 'Mumbai City / मुंबई शहर',
      code: '482'
    });
    // Add primary urban zones
    const urbanTalukas = [
      { id: '482_1', districtId: '482', name: 'Mumbai City / मुंबई शहर (दक्षिण)', code: '4821' },
      { id: '482_2', districtId: '482', name: 'Mumbai Central / मुंबई मध्य', code: '4822' }
    ];
    for (const t of urbanTalukas) talukasMap.set(t.id, t);
    villagesList.push(
      { id: '482_v1', talukaId: '482_1', name: 'Colaba / कुलाबा', code: '48201' },
      { id: '482_v2', talukaId: '482_1', name: 'Fort / फोर्ट', code: '48202' },
      { id: '482_v3', talukaId: '482_2', name: 'Byculla / भायखळा', code: '48203' },
      { id: '482_v4', talukaId: '482_2', name: 'Dadar / दादर', code: '48204' }
    );
  }

  console.log(`Inserting ${districtsMap.size} Districts...`);
  db.run('BEGIN TRANSACTION');
  const distStmt = db.prepare(`INSERT OR REPLACE INTO districts (id, state_id, name, code) VALUES (?, ?, ?, ?)`);
  for (const d of districtsMap.values()) {
    distStmt.run([d.id, d.stateId, d.name, d.code]);
  }
  distStmt.free();
  db.run('COMMIT');

  console.log(`Inserting ${talukasMap.size} Talukas...`);
  db.run('BEGIN TRANSACTION');
  const talStmt = db.prepare(`INSERT OR REPLACE INTO talukas (id, district_id, name, code) VALUES (?, ?, ?, ?)`);
  for (const t of talukasMap.values()) {
    talStmt.run([t.id, t.districtId, t.name, t.code]);
  }
  talStmt.free();
  db.run('COMMIT');

  console.log(`Inserting ${villagesList.length} Villages in batches...`);
  db.run('BEGIN TRANSACTION');
  const vilStmt = db.prepare(`INSERT OR REPLACE INTO villages (id, taluka_id, name, code) VALUES (?, ?, ?, ?)`);
  for (let i = 0; i < villagesList.length; i++) {
    const v = villagesList[i];
    vilStmt.run([v.id, v.talukaId, v.name, v.code]);
    if (i > 0 && i % 5000 === 0) {
      db.run('COMMIT');
      db.run('BEGIN TRANSACTION');
    }
  }
  vilStmt.free();
  db.run('COMMIT');

  saveDatabase();
  console.log(`✅ Successfully seeded:`);
  console.log(`   - 1 Country`);
  console.log(`   - ${INDIAN_STATES.length} States`);
  console.log(`   - ${districtsMap.size} Districts`);
  console.log(`   - ${talukasMap.size} Talukas`);
  console.log(`   - ${villagesList.length} Villages`);
}

// If run directly
const csvArg = process.argv[2] || "C:/Users/abhay/.gemini/antigravity-ide/brain/3edd2a6d-8000-4fb5-8132-aff1fc9f44bb/scratch/villages.31Mar2026.csv";
seedLocations(csvArg).then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
