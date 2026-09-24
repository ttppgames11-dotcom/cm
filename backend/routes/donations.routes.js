import { Router } from 'express';
import { all, get } from '../../database/database.js';

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
      return res.status(404).json({ success: false, code: 'NOT_FOUND', error: 'अभियान सापडले नाही.' });
    }
    campaign.recentDonations = await all(
      `SELECT CASE WHEN is_anonymous = 1 THEN 'गुप्त दान' ELSE donor_name END AS donor_name, amount, is_anonymous, created_at
       FROM donations WHERE campaign_id = ? ORDER BY created_at DESC LIMIT 10`,
      [req.params.id]
    );
    res.json({ success: true, campaign });
  } catch (err) {
    next(err);
  }
});

// POST /api/donations/donate
//
// DISABLED: there is no payment gateway integration, so this endpoint must not
// record donations, change campaign totals or issue 80G tax receipts. Enable it
// only after a real payment provider (server-side verified, idempotent) and the
// required legal/tax review are in place.
router.post('/donate', (req, res) => {
  res.status(503).json({
    success: false,
    code: 'DONATIONS_UNAVAILABLE',
    error: 'ऑनलाइन देणगी सध्या उपलब्ध नाही.'
  });
});

// GET /api/donations/recent  (anonymous donors are masked server-side)
router.get('/recent', async (req, res, next) => {
  try {
    const recent = await all(`
      SELECT id, campaign_title,
             CASE WHEN is_anonymous = 1 THEN 'गुप्त दान' ELSE donor_name END AS donor_name,
             amount, is_anonymous, created_at
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
