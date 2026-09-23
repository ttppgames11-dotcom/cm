import { Router } from 'express';
import { all, get, runQuery } from '../db/database.js';

const router = Router();

// GET /api/donations/campaigns
router.get('/campaigns', async (req, res, next) => {
  try {
    const campaigns = await all('SELECT * FROM campaigns WHERE active = 1 ORDER BY target DESC');
    res.json({ success: true, count: campaigns.length, campaigns });
  } catch (err) {
    next(err);
  }
});

// GET /api/donations/campaigns/:id
router.get('/campaigns/:id', async (req, res, next) => {
  try {
    const campaign = await get('SELECT * FROM campaigns WHERE id = ?', [req.params.id]);
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'अभियान सापडले नाही.' });
    }

    const donations = await all('SELECT donor_name, amount, is_anonymous, created_at FROM donations WHERE campaign_id = ? ORDER BY created_at DESC LIMIT 10', [req.params.id]);
    campaign.recentDonations = donations;

    res.json({ success: true, campaign });
  } catch (err) {
    next(err);
  }
});

// POST /api/donations/donate
router.post('/donate', async (req, res, next) => {
  try {
    const { campaign_id, campaign_title, donor_name, donor_id, amount, payment_method, phone, is_anonymous } = req.body;

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ success: false, error: 'कृपया वैध देणगी रक्कम प्रविष्ट करा.' });
    }

    const txId = 'TXN-' + Math.random().toString(36).slice(2, 10).toUpperCase();
    const donationId = 'DON-' + Date.now();

    await runQuery(`
      INSERT INTO donations (id, campaign_id, campaign_title, donor_name, donor_id, amount, payment_method, phone, is_anonymous, tx_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [donationId, campaign_id || 'C01', campaign_title || 'रायगड संवर्धन', donor_name || 'समाज बांधव', donor_id || 'M1001', parsedAmount, payment_method || 'UPI', phone || '', is_anonymous ? 1 : 0, txId]);

    // Update campaign stats
    if (campaign_id) {
      await runQuery('UPDATE campaigns SET collected = collected + ?, donors = donors + 1 WHERE id = ?', [parsedAmount, campaign_id]);
    }

    res.status(201).json({
      success: true,
      message: 'देणगी यशस्वीरित्या स्वीकारली! आपले मनःपूर्वक आभार.',
      receipt: {
        donationId,
        txId,
        amount: parsedAmount,
        donor_name: is_anonymous ? 'गुप्त दान' : (donor_name || 'समाज बांधव'),
        campaign_title: campaign_title || 'रायगड संवर्धन अभियान',
        date: new Date().toISOString().split('T')[0],
        taxDeduction80G: '80G(5)(vi) अंतर्गत आयकर सवलत पात्र',
        receiptNumber: 'CM-80G-' + Math.floor(10000 + Math.random() * 90000)
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/donations/recent
router.get('/recent', async (req, res, next) => {
  try {
    const recent = await all(`
      SELECT id, campaign_title, donor_name, amount, is_anonymous, created_at 
      FROM donations 
      ORDER BY created_at DESC 
      LIMIT 15
    `);
    res.json({ success: true, count: recent.length, donations: recent });
  } catch (err) {
    next(err);
  }
});

export default router;
