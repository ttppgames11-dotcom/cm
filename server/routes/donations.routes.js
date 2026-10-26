import { Router } from 'express';
import { all, get, runQuery } from '../../database/database.js';
import { db } from '../db/realtimeDb.js';
import { optionalToken } from '../middleware/auth.js';

const router = Router();

// GET /api/donations/campaigns
router.get('/campaigns', async (req, res, next) => {
  try {
    const campaigns = await all('SELECT * FROM campaigns WHERE active = 1 ORDER BY target DESC');
    res.json({
      success: true,
      count: campaigns.length,
      campaigns,
      data: {
        campaigns,
        count: campaigns.length
      }
    });
  } catch (err) {
    try {
      const list = db.getCollection('campaigns') || [];
      res.json({ success: true, count: list.length, campaigns: list, data: { campaigns: list } });
    } catch {
      next(err);
    }
  }
});

// GET /api/donations/campaigns/:id
router.get('/campaigns/:id', async (req, res, next) => {
  try {
    const campaign = await get('SELECT * FROM campaigns WHERE id = ?', [req.params.id]);
    if (!campaign) {
      const fallback = db.findById('campaigns', req.params.id);
      if (!fallback) {
        return res.status(404).json({ success: false, error: 'अभियान सापडले नाही.' });
      }
      return res.json({ success: true, campaign: fallback, data: { campaign: fallback } });
    }

    const donations = await all(
      'SELECT donor_name, amount, is_anonymous, created_at FROM donations WHERE campaign_id = ? ORDER BY created_at DESC LIMIT 15',
      [req.params.id]
    );
    campaign.recentDonations = donations;

    const progressPercent = Math.min(100, Math.round(((campaign.collected || 0) / (campaign.target || 1)) * 100));

    res.json({
      success: true,
      campaign,
      data: {
        campaign,
        donations,
        progressPercent,
        totalDonors: campaign.donors || donations.length
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/donations/donate
router.post('/donate', optionalToken, async (req, res, next) => {
  try {
    const { campaign_id, campaignId, campaign_title, donor_name, donorName, donor_id, amount, payment_method, paymentMethod, phone, is_anonymous, anonymous, pan, email } = req.body;

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ success: false, error: 'कृपया वैध देणगी रक्कम प्रविष्ट करा.' });
    }

    const cId = campaign_id || campaignId || 'C01';
    const dName = anonymous ? 'गुप्त दान' : (donor_name || donorName || req.user?.name || 'समाज बांधव');
    const dId = donor_id || req.user?.id || 'M1001';
    const txId = 'TXN-' + Math.random().toString(36).slice(2, 10).toUpperCase();
    const donationId = 'DON-' + Date.now().toString().slice(-6);
    const receiptNo = 'CM-80G-' + Math.floor(10000 + Math.random() * 90000);

    await runQuery(`
      INSERT INTO donations (id, campaign_id, campaign_title, donor_name, donor_id, amount, payment_method, phone, is_anonymous, tx_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [
      donationId,
      cId,
      campaign_title || 'रायगड संवर्धन अभियान',
      dName,
      dId,
      parsedAmount,
      payment_method || paymentMethod || 'UPI',
      phone || req.user?.phone || '',
      (is_anonymous || anonymous) ? 1 : 0,
      txId
    ]);

    // Update campaign stats in SQLite
    if (cId) {
      await runQuery('UPDATE campaigns SET collected = COALESCE(collected, 0) + ?, donors = COALESCE(donors, 0) + 1 WHERE id = ?', [parsedAmount, cId]);
    }

    // Mirror to realtimeDb
    db.insert('donations', {
      id: donationId,
      campaignId: cId,
      donorName: dName,
      amount: parsedAmount,
      receiptNo,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'देणगी यशस्वीरित्या स्वीकारली! आपले मनःपूर्वक आभार.',
      receipt: {
        donationId,
        txId,
        amount: parsedAmount,
        donor_name: dName,
        campaign_title: campaign_title || 'रायगड संवर्धन अभियान',
        date: new Date().toISOString().split('T')[0],
        taxDeduction80G: '80G(5)(vi) अंतर्गत आयकर सवलत पात्र',
        receiptNumber: receiptNo
      },
      data: {
        donationId,
        receiptNo,
        amount: parsedAmount
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

    res.json({
      success: true,
      count: recent.length,
      donations: recent,
      data: {
        recentDonations: recent,
        totalCount: recent.length
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
