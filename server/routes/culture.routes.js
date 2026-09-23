import { Router } from 'express';
import { runQuery, all, get } from '../db/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ORAL_HISTORY_FILE = path.join(__dirname, '..', 'data_oral_history.json');

const router = Router();

// In-memory / JSON file fallback for community oral history contributions
function getOralHistoryData() {
  if (fs.existsSync(ORAL_HISTORY_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(ORAL_HISTORY_FILE, 'utf8'));
    } catch {
      return [];
    }
  }
  return [
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
}

function saveOralHistoryData(data) {
  try {
    fs.writeFileSync(ORAL_HISTORY_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving oral history:', err);
  }
}

// GET /api/culture/oral-history
router.get('/oral-history', (req, res) => {
  const data = getOralHistoryData();
  res.json({ success: true, count: data.length, data });
});

// POST /api/culture/oral-history
router.post('/oral-history', (req, res) => {
  try {
    const { title, village, taluka, district, region, contributor, contributorClan, story, historicalReference } = req.body;
    
    if (!title || !story || !village) {
      return res.status(400).json({ success: false, error: 'शीर्षक, गाव आणि इतिहास कथा आवश्यक आहे.' });
    }

    const current = getOralHistoryData();
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

    current.unshift(newEntry);
    saveOralHistoryData(current);

    res.status(201).json({
      success: true,
      message: 'आपली मौखिक इतिहास नोंद यशस्वीरित्या संग्रहित करण्यात आली!',
      entry: newEntry
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/culture/stats
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    stats: {
      totalForts: 350,
      totalTemples: 120,
      totalRegions: 8,
      totalDialects: 7,
      sourceTiers: 4,
      totalOralHistories: getOralHistoryData().length
    }
  });
});

export default router;
