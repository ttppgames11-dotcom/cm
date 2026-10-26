import { runQuery, saveDatabase, get, all } from '../database/database.js';
import { db } from '../backend/db/realtimeDb.js';

async function seed() {
  const jsonProfiles = db.getCollection('matrimony') || [];
  console.log(`Found ${jsonProfiles.length} profiles in db.json to migrate/enrich.`);

  const sampleEnriched = [
    {
      id: 'CM-M-801',
      member_id: 'M1001',
      name: 'इंजि. रोहन संभाजीराव कदम',
      gender: 'वर (Groom)',
      birth_date: '1998-05-14',
      birth_time: 'सकाळी ०८:३०',
      birth_place: 'कराड, सातारा',
      age: 28,
      height: "5' 10\"",
      caste: '९६ कुळी मराठा',
      kul: 'कदम',
      gotra: 'भारद्वाज',
      devak: 'कळंब / सूर्यफूल',
      rashi: 'वृश्चिक',
      nakshatra: 'अनुराधा',
      mangal: 'नाही',
      education: 'B.Tech (Computer Science), COEP Pune',
      profession: 'Senior Software Engineer, MNC',
      company: 'TCS Pune / Magarpatta',
      income: '₹२२ लाख वार्षिक',
      city: 'पुणे',
      district: 'पुणे',
      taluka: 'हवेली',
      native_place: 'कराड (सातारा)',
      father_name: 'संभाजीराव यशवंत कदम',
      father_occupation: 'निवृत्त मुख्याध्यापक / शेती',
      mother_maher_kul: 'मोरे (पाटण)',
      mama_kul: 'मोरे घराणे',
      siblings_info: '१ लहान बहीण (विवाहित)',
      expectations: 'सुशिक्षित, पदवीधर, कौटुंबिक मूल्यांची जाण असणारी अनुरूप ९६ कुळी मराठा वधू.',
      photo: '/assets/images/matrimony/groom_rohan.jpg',
      contact: '9822112233',
      about: 'शांत, सुसंस्कृत आणि प्रगतीशील विचारसरणीचा. कौटुंबिक संस्कारांना मानणारा.',
      verified: 1,
      status: 'approved',
      created_at: new Date().toISOString()
    },
    {
      id: 'CM-F-802',
      member_id: 'M1002',
      name: 'डॉ. स्नेहल विक्रमराव पाटील',
      gender: 'वधू (Bride)',
      birth_date: '2000-09-22',
      birth_time: 'दुपारी ०२:१५',
      birth_place: 'कोल्हापूर',
      age: 26,
      height: "5' 5\"",
      caste: '९६ कुळी मराठा',
      kul: 'पाटील',
      gotra: 'वसिष्ठ',
      devak: 'पंचपल्लव',
      rashi: 'मिथुन',
      nakshatra: 'पुनर्वसु',
      mangal: 'नाही',
      education: 'M.B.B.S., D.G.O. (Gynecologist)',
      profession: 'वैद्यकीय अधिकारी, शासकीय रुग्णालय',
      company: 'सीपीआर रुग्णालय, कोल्हापूर',
      income: '₹१५ लाख वार्षिक',
      city: 'कोल्हापूर',
      district: 'कोल्हापूर',
      taluka: 'करवीर',
      native_place: 'शाहूवाडी, कोल्हापूर',
      father_name: 'विक्रमराव तानाजी पाटील',
      father_occupation: 'उद्योगपती / साखर कारखाना संचालक',
      mother_maher_kul: 'गायकवाड (सांगली)',
      mama_kul: 'गायकवाड घराणे',
      siblings_info: '१ लहान भाऊ (MBA चालू)',
      expectations: 'डॉक्टर किंवा उच्चशिक्षित मराठा वर, व्यसनमुक्त, समविचारी व सुसंस्कृत.',
      photo: '/assets/images/matrimony/bride_snehal.jpg',
      contact: '9822998877',
      about: 'सद्गुणी, वैद्यकीय सेवेची आवड असणारी. संगीत व वाचनाची आवड.',
      verified: 1,
      status: 'approved',
      created_at: new Date().toISOString()
    },
    {
      id: 'CM-M-803',
      member_id: 'M1003',
      name: 'अभिषेक जयसिंगराव मोरे',
      gender: 'वर (Groom)',
      birth_date: '1996-03-10',
      birth_time: 'पहाटे ०५:४५',
      birth_place: 'नाशिक',
      age: 30,
      height: "5' 11\"",
      caste: '९६ कुळी मराठा',
      kul: 'मोरे',
      gotra: 'गौतम',
      devak: 'रुद्राक्ष',
      rashi: 'मेष',
      nakshatra: 'अश्विनी',
      mangal: 'सौम्य',
      education: 'M.B.A. (Finance) & B.E. Mechanical',
      profession: 'उद्योजक (ऑटोमोबाईल पार्ट्स फॅक्टरी)',
      company: 'सह्याद्री ऑटो कॉम्पोनंट्स MIDC',
      income: '₹४५ लाख वार्षिक',
      city: 'नाशिक',
      district: 'नाशिक',
      taluka: 'नाशिक',
      native_place: 'धुळे',
      father_name: 'जयसिंगराव दादासाहेब मोरे',
      father_occupation: 'व्यवसायिक',
      mother_maher_kul: 'भोसले (सातारा)',
      mama_kul: 'भोसले घराणे',
      siblings_info: '१ मोठा भाऊ (व्यवसायात भागीदार)',
      expectations: 'पदवीधर किंवा उच्चशिक्षित, कुटुंब व व्यवसाय समजून घेणारी सुसंस्कृत वधू.',
      photo: '/assets/images/matrimony/groom_abhishek.jpg',
      contact: '9890112233',
      about: 'उद्योजक वृत्ती, गडकिल्ले भटकंतीची आवड आणि सामाजिक कार्यात सक्रिय.',
      verified: 1,
      status: 'approved',
      created_at: new Date().toISOString()
    },
    {
      id: 'CM-F-804',
      member_id: 'M1004',
      name: 'प्रा. मधुरा तानाजी देशमुख',
      gender: 'वधू (Bride)',
      birth_date: '1999-11-05',
      birth_time: 'संध्याकाळी ०६:२०',
      birth_place: 'पुणे',
      age: 27,
      height: "5' 4\"",
      caste: '९६ कुळी मराठा',
      kul: 'देशमुख',
      gotra: 'कश्यप',
      devak: 'बेलपत्र',
      rashi: 'तूळ',
      nakshatra: 'स्वाती',
      mangal: 'नाही',
      education: 'M.Sc. (Mathematics), NET/SET',
      profession: 'सहाय्यक प्राध्यापिका, पुणे विद्यापीठ',
      company: 'सावित्रीबाई फुले पुणे विद्यापीठ',
      income: '₹१० लाख वार्षिक',
      city: 'पुणे',
      district: 'पुणे',
      taluka: 'बारामती',
      native_place: 'बारामती',
      father_name: 'तानाजी बाबुराव देशमुख',
      father_occupation: 'वर्ग-१ राजपत्रित अधिकारी',
      mother_maher_kul: 'जाधव (फलटण)',
      mama_kul: 'जाधव घराणे',
      siblings_info: 'एकुलती एक मुलगी',
      expectations: 'इंजिनिअर, प्रोफेसर किंवा शासकीय सेवेतील सुविद्य मराठा वर.',
      photo: '/assets/images/matrimony/bride_madhura.jpg',
      contact: '9820556677',
      about: 'शिक्षणाची आवड, साधी राहणी व उच्च विचारसरणी.',
      verified: 1,
      status: 'approved',
      created_at: new Date().toISOString()
    },
    {
      id: 'CM-M-805',
      member_id: 'M1005',
      name: 'अजिंक्य दादासाहेब शिंदे',
      gender: 'वर (Groom)',
      birth_date: '1997-07-19',
      birth_time: 'दुपारी १२:०५',
      birth_place: 'बीड',
      age: 29,
      height: "5' 9\"",
      caste: '९६ कुळी मराठा',
      kul: 'शिंदे',
      gotra: 'कौंडिण्य',
      devak: 'रुई / सूर्यफूल',
      rashi: 'धनु',
      nakshatra: 'मूळ',
      mangal: 'नाही',
      education: 'M.P.S.C. उत्तीर्ण (राज्य कर निरीक्षक - STI)',
      profession: 'राज्य कर निरीक्षक (STI), वित्त विभाग',
      company: 'महाराष्ट्र शासन, मुंबई',
      income: 'शासकीय वर्ग-२ वेतनश्रेणी (₹९ लाख)',
      city: 'मुंबई',
      district: 'मुंबई',
      taluka: 'दक्षिण मुंबई',
      native_place: 'बीड',
      father_name: 'दादासाहेब रामराव शिंदे',
      father_occupation: 'माजी सैनिक (भारतीय सैन्यदल)',
      mother_maher_kul: 'पवार (परभणी)',
      mama_kul: 'पवार घराणे',
      siblings_info: '१ भाऊ (सॉफ्टवेअर इंजिनिअर)',
      expectations: 'सुशिक्षित वधू, कोणत्याही शासकीय, बँक किंवा खाजगी सेवेतील.',
      photo: '👮‍♂️',
      contact: '9890445566',
      about: 'शिस्तप्रिय, देशप्रेमी आणि कर्तव्यनिष्ठ प्रशासकीय अधिकारी.',
      verified: 1,
      status: 'approved',
      created_at: new Date().toISOString()
    },
    {
      id: 'CM-F-806',
      member_id: 'M1006',
      name: 'कु. कल्याणी बाजीराव सावंत',
      gender: 'वधू (Bride)',
      birth_date: '2001-01-30',
      birth_time: 'सकाळी ०९:१०',
      birth_place: 'ठाणे',
      age: 25,
      height: "5' 6\"",
      caste: '९६ कुळी मराठा',
      kul: 'सावंत',
      gotra: 'अंगिरस',
      devak: 'कदंब',
      rashi: 'कुंभ',
      nakshatra: 'शततारका',
      mangal: 'नाही',
      education: 'Chartered Accountant (CA), B.Com',
      profession: 'Senior Audit Associate, Big 4 Firm',
      company: 'Deloitte Mumbai',
      income: '₹१८ लाख वार्षिक',
      city: 'ठाणे / मुंबई',
      district: 'ठाणे',
      taluka: 'ठाणे',
      native_place: 'सिंधुदुर्ग (सावंतवाडी)',
      father_name: 'बाजीराव केशवराव सावंत',
      father_occupation: 'बँक मॅनेजर (निवृत्त)',
      mother_maher_kul: 'राणे (कणकवली)',
      mama_kul: 'राणे घराणे',
      siblings_info: '१ मोठी बहीण (विवाहित, लंडन)',
      expectations: 'सीए, इंजिनिअर किंवा फायनान्स/आयटी क्षेत्रातील अनुरूप मराठा वर.',
      photo: '💼',
      contact: '9819887766',
      about: 'करिअर आणि कुटुंब दोन्ही समतोल ठेवणारी, शास्त्रीय गायनाची आवड.',
      verified: 1,
      status: 'approved',
      created_at: new Date().toISOString()
    }
  ];

  for (const p of sampleEnriched) {
    const existing = await get('SELECT id FROM matrimony_profiles WHERE id = ?', [p.id]);
    if (!existing) {
      await runQuery(`
        INSERT INTO matrimony_profiles (
          id, member_id, name, gender, birth_date, birth_time, birth_place, age, height,
          caste, kul, gotra, devak, rashi, nakshatra, mangal,
          education, profession, company, income, city, district, taluka, native_place,
          father_name, father_occupation, mother_maher_kul, mama_kul, siblings_info,
          expectations, photo, contact, about, verified, status, created_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?
        )
      `, [
        p.id, p.member_id, p.name, p.gender, p.birth_date, p.birth_time, p.birth_place, p.age, p.height,
        p.caste, p.kul, p.gotra, p.devak, p.rashi, p.nakshatra, p.mangal,
        p.education, p.profession, p.company, p.income, p.city, p.district, p.taluka, p.native_place,
        p.father_name, p.father_occupation, p.mother_maher_kul, p.mama_kul, p.siblings_info,
        p.expectations, p.photo, p.contact, p.about, p.verified, p.status, p.created_at
      ]);
      console.log(`Inserted profile ${p.id} (${p.name}) into SQLite`);
    }
  }

  // Also migrate any from json if not already present
  for (const jp of jsonProfiles) {
    const pid = jp.id;
    const exists = await get('SELECT id FROM matrimony_profiles WHERE id = ?', [pid]);
    if (!exists) {
      await runQuery(`
        INSERT INTO matrimony_profiles (
          id, member_id, name, gender, age, height, caste, kul, gotra, native_place,
          education, profession, income, city, district, status, verified, photo, expectations, contact, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        jp.id, jp.memberId || 'GUEST', jp.name, jp.gender, jp.age, jp.height || "5' 8\"",
        jp.caste || '९६ कुळी मराठा', jp.kul || 'मराठा', jp.gotra || 'कश्यप', jp.nativePlace || 'महाराष्ट्र',
        jp.education || 'पदवीधर', jp.profession || 'व्यवसाय', jp.income || 'उत्पन्न खुलासेवार',
        jp.city || 'पुणे', jp.city || 'पुणे', jp.status || 'approved', jp.verified ? 1 : 1,
        jp.photo || '👤', jp.expectations || 'सुशिक्षित व अनुरूप जोडीदार', jp.contact || '9822110000', jp.createdAt || new Date().toISOString()
      ]);
      console.log(`Migrated ${jp.id} from db.json into SQLite`);
    }
  }

  saveDatabase();
  const count = await get('SELECT COUNT(*) as cnt FROM matrimony_profiles');
  console.log(`✅ Total Matrimony Profiles in SQLite: ${count.cnt}`);
}

seed().then(() => process.exit(0)).catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
