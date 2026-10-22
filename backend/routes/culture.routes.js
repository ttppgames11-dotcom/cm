import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
// Oral histories live in the database (utils/directoryStore.js, list "oralHistory"); the old
// JSON file is copied in once on first use and otherwise left untouched.
import { listRecords, insertRecord, importLegacyList } from '../utils/directoryStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ORAL_HISTORY_FILE = path.join(__dirname, '..', 'data_oral_history.json');

const router = Router();

// Shown (and stored) when there is no oral-history file to copy from, as before.
const DEFAULT_ORAL_HISTORY = [
    {
      id: 'oral_01',
      title: 'पाचाड येथील जिजाऊ वाड्याची विहीर व भुयारी पाण्याचा झरा',
      village: 'पाचाड',
      taluka: 'महाड',
      district: 'रायगड',
      region: 'कोकण',
      contributor: 'बाळकृष्ण मोरे (वय ७८ वर्षे, स्थानिक रहिवासी)',
      contributorClan: 'मोरे घराणे (पाचाड)',
      dateSubmitted: '१४ ऑगस्ट २०२६',
      story: 'आमच्या आजोबांनी सांगितल्यानुसार, जिजाऊ वाड्यातून गडावरील गुप्त पहारेकऱ्यांना पाणी व संदेश पोहोचवण्यासाठी एका विशिष्ट झऱ्याचा वापर केला जाई. आजही त्या विहिरीचे पाणी बाराही महिने स्वच्छ आणि थंड असते.',
      historicalReference: 'पाचाड ग्रामपंचायत दप्तर व स्थानिक मौखिक परंपरा',
      tier: 'Tier 4: मौखिक इतिहास व लोकपरंपरा',
      status: 'सत्यापित (Community Verified)'
    },
    {
      id: 'oral_02',
      title: 'पावनखिंडीच्या युद्धातील घोडखिंडीचे स्थानिक वाटाडे',
      village: 'पांढरेपाणी',
      taluka: 'शाहूवाडी',
      district: 'कोल्हापूर',
      region: 'पश्चिम महाराष्ट्र',
      contributor: 'तानाजीराव खोत (वय ८२ वर्षे)',
      contributorClan: 'खोत घराणे',
      dateSubmitted: '२१ जुलै २०२६',
      story: 'बाजीप्रभू देशपांडे आणि शिवा काशिद यांनी सिद्धी जौहरच्या सैन्याला अडवण्यापूर्वी स्थानिक धनगर बांधवांनी जंगलातील चोरवाटा दाखवल्या होत्या. त्या वाटेला आजही "मावळ्यांची वाट" म्हटले जाते.',
      historicalReference: 'विशाळगड परिसर स्थानिक कुटुंब नोंदी',
      tier: 'Tier 4: मौखिक इतिहास व लोकपरंपरा',
      status: 'सत्यापित (Community Verified)'
    }
  ];

async function getOralHistoryData() {
  await importLegacyList('oralHistory', ORAL_HISTORY_FILE, DEFAULT_ORAL_HISTORY);
  return listRecords('oralHistory');
}

// GET /api/culture/oral-history
router.get('/oral-history', async (req, res, next) => {
  try {
    const data = await getOralHistoryData();
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
});

// POST /api/culture/oral-history
router.post('/oral-history', async (req, res, next) => {
  try {
    const { title, village, taluka, district, region, contributor, contributorClan, story, historicalReference } = req.body;
    
    if (!title || !story || !village) {
      return res.status(400).json({ success: false, error: 'शीर्षक, गाव आणि इतिहास कथा आवश्यक आहे.' });
    }

    await getOralHistoryData();
    const newEntry = {
      id: `oral_${Date.now()}`,
      title,
      village,
      taluka: taluka || district,
      district: district || 'महाराष्ट्र',
      region: region || 'महाराष्ट्र',
      contributor: contributor || 'अनाम मराठा बांधव',
      contributorClan: contributorClan || 'मराठा कुळ',
      dateSubmitted: new Date().toLocaleDateString('mr-IN'),
      story,
      historicalReference: historicalReference || 'मौखिक कुटुंब परंपरा',
      tier: 'Tier 4: मौखिक इतिहास व लोकपरंपरा',
      status: 'पडताळणी अंतर्गत (Under Community Review)'
    };

    await insertRecord('oralHistory', newEntry);

    res.status(201).json({
      success: true,
      message: 'आपली मौखिक इतिहास नोंद यशस्वीरित्या संग्रहित करण्यात आली!',
      entry: newEntry
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/culture/stats
router.get('/stats', async (req, res, next) => {
  try {
  res.json({
    success: true,
    stats: {
      totalForts: 350,
      totalTemples: 120,
      totalRegions: 8,
      totalDialects: 7,
      sourceTiers: 4,
      totalOralHistories: (await getOralHistoryData()).length
    }
  });
  } catch (err) {
    next(err);
  }
});

export default router;

