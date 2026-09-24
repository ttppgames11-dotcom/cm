import { Router } from 'express';
import { all, get, runQuery } from '../../database/database.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

// Mapping for Marathi / English category names
const CATEGORY_MAP = {
  'सर्व': 'ALL',
  'छत्रपती शिवराय व स्वराज्य': 'Chhatrapati Shivaji Maharaj',
  'Chhatrapati Shivaji Maharaj': 'Chhatrapati Shivaji Maharaj',
  'छत्रपती संभाजी महाराज': 'Chhatrapati Sambhaji Maharaj',
  'Chhatrapati Sambhaji Maharaj': 'Chhatrapati Sambhaji Maharaj',
  'छत्रपती राजाराम महाराज': 'Chhatrapati Rajaram Maharaj',
  'Chhatrapati Rajaram Maharaj': 'Chhatrapati Rajaram Maharaj',
  'महारानी ताराबाई': 'Maharani Tarabai',
  'Maharani Tarabai': 'Maharani Tarabai',
  'पेशवे': 'Peshwas',
  'Peshwas': 'Peshwas',
  'मराठा सरदार व सेनापती': 'Maratha Warriors & Commanders',
  'Maratha Warriors & Commanders': 'Maratha Warriors & Commanders',
  'अभेद्य दुर्ग व स्थापत्य': 'Forts & Fort Architecture',
  'Forts & Fort Architecture': 'Forts & Fort Architecture',
  'महापराक्रमी रणसंग्राम': 'Battles & Military Campaigns',
  'Battles & Military Campaigns': 'Battles & Military Campaigns',
  'मराठा प्रशासन व अष्टप्रधान': 'Maratha Administration',
  'Maratha Administration': 'Maratha Administration',
  'मराठा आरमार व जलदुर्ग': 'Maratha Navy',
  'Maratha Navy': 'Maratha Navy',
  'ऐतिहासिक दिनविशेष व कालपट': 'Important Dates & Chronology',
  'Important Dates & Chronology': 'Important Dates & Chronology',
  'मराठा साम्राज्य व नंतरचा इतिहास': 'Maratha Empire / Later History',
  'Maratha Empire / Later History': 'Maratha Empire / Later History',
  'साहित्य, बखरी व संस्कृती': 'Literature, Sources & Culture',
  'Literature, Sources & Culture': 'Literature, Sources & Culture'
};

const DIFFICULTY_MAP = {
  'प्राथमिक': 'easy',
  'easy': 'easy',
  'मध्यम': 'medium',
  'medium': 'medium',
  'प्रगत': 'hard',
  'hard': 'hard'
};

// GET /api/quiz/stats
router.get('/stats', async (req, res, next) => {
  try {
    const totalRow = await get('SELECT COUNT(*) as total FROM quiz_questions');
    const catRows = await all('SELECT category, COUNT(*) as count FROM quiz_questions GROUP BY category ORDER BY count DESC');
    const diffRows = await all('SELECT difficulty, COUNT(*) as count FROM quiz_questions GROUP BY difficulty');

    const categories = {};
    catRows.forEach(r => { categories[r.category] = r.count; });

    const difficulties = {};
    diffRows.forEach(r => { difficulties[r.difficulty] = r.count; });

    return sendSuccess(res, 'क्विझ सांख्यिकी', {
      total_questions: totalRow ? totalRow.total : 0,
      categories,
      difficulties,
      category_list: Object.keys(categories),
      timestamp: new Date()
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/quiz/questions
router.get('/questions', async (req, res, next) => {
  try {
    const { category, difficulty, count = 10, random = 'true' } = req.query;

    let sql = 'SELECT * FROM quiz_questions WHERE 1=1';
    const params = [];

    if (category && category !== 'सर्व' && category !== 'ALL') {
      const mappedCategory = CATEGORY_MAP[category] || category;
      sql += ' AND (category = ? OR category LIKE ?)';
      params.push(mappedCategory, `%${category}%`);
    }

    if (difficulty && difficulty !== 'सर्व' && difficulty !== 'ALL') {
      const mappedDiff = DIFFICULTY_MAP[difficulty] || difficulty;
      sql += ' AND difficulty = ?';
      params.push(mappedDiff);
    }

    if (random === 'true') {
      sql += ' ORDER BY RANDOM()';
    } else {
      sql += ' ORDER BY question_id ASC';
    }

    if (count !== 'all') {
      const limit = parseInt(count, 10) || 10;
      sql += ` LIMIT ${limit}`;
    }

    const questions = await all(sql, params);

    return sendSuccess(res, 'क्विझ प्रश्न प्राप्त झाले', {
      questions,
      count: questions.length
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/quiz/daily
router.get('/daily', async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const questions = await all('SELECT * FROM quiz_questions WHERE category = ? ORDER BY question_id ASC LIMIT 5', ['Chhatrapati Shivaji Maharaj']);
    return sendSuccess(res, 'आजचा दैनिक ऐतिहासिक प्रश्न (Daily Swarajya Challenge)', {
      date: today,
      title: 'आजचा ऐतिहासिक प्रश्न व क्विझ (Daily Swarajya Challenge)',
      questions
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/quiz/submit
router.post('/submit', async (req, res, next) => {
  try {
    const {
      candidate_name,
      city,
      category = 'सर्वसमावेशक',
      score = 0,
      total = 10,
      points = 0,
      streak = 0,
      rank_title = 'जागृत मावळा'
    } = req.body;

    const numScore = Math.max(0, Number(score) || 0);
    const numTotal = Math.max(1, Number(total) || 10);
    const numPoints = Math.max(0, Number(points) || 0);
    const numStreak = Math.max(0, Number(streak) || 0);

    const id = 'SUB-' + Date.now().toString().slice(-6);
    const percentage = Math.round((numScore / numTotal) * 100);

    const safeName = typeof candidate_name === 'string' ? candidate_name.trim().slice(0, 100) : 'मावळा';
    const safeCity = typeof city === 'string' ? city.trim().slice(0, 100) : 'महाराष्ट्र';
    const safeCat = typeof category === 'string' ? category.trim().slice(0, 100) : 'सर्वसमावेशक';
    const safeRank = typeof rank_title === 'string' ? rank_title.trim().slice(0, 100) : 'जागृत मावळा';

    await runQuery(`
      INSERT INTO quiz_submissions (
        id, candidate_name, city, category, score, total, percentage, points, streak, rank_title, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [
      id,
      safeName || 'मावळा',
      safeCity || 'महाराष्ट्र',
      safeCat,
      numScore,
      numTotal,
      percentage,
      numPoints,
      numStreak,
      safeRank
    ]);

    const created = await get('SELECT * FROM quiz_submissions WHERE id = ?', [id]);

    return sendSuccess(res, 'क्विझ निकाल यशस्वीरीत्या नोंदवला गेला!', {
      submission: created,
      rank_title: safeRank,
      badgeEligibility: percentage >= 80 ? 'शिवकालीन इतिहास भूषण पदक' : 'सहभागी मावळा'
    }, 201);
  } catch (err) {
    next(err);
  }
});

// GET /api/quiz/leaderboard
router.get('/leaderboard', async (req, res, next) => {
  try {
    const submissions = await all('SELECT * FROM quiz_submissions ORDER BY points DESC, created_at DESC LIMIT 20');
    return sendSuccess(res, 'इतिहास क्विझ लीडरबोर्ड', {
      leaderboard: submissions,
      count: submissions.length
    });
  } catch (err) {
    next(err);
  }
});

export default router;
