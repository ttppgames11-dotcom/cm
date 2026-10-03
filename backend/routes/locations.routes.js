import { Router } from 'express';
import { all, get } from '../../database/database.js';

const router = Router();

// GET /api/locations/countries
router.get('/countries', async (req, res, next) => {
  try {
    const countries = await all('SELECT id, name, code FROM countries ORDER BY name ASC');
    res.json({
      success: true,
      data: countries
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/locations/states?countryId={countryId}
router.get('/states', async (req, res, next) => {
  try {
    const { countryId } = req.query;
    if (!countryId) {
      return res.status(400).json({
        success: false,
        error: 'countryId parameter is required'
      });
    }

    // Verify country exists
    const country = await get('SELECT id FROM countries WHERE id = ?', [countryId]);
    if (!country) {
      return res.status(404).json({
        success: false,
        error: 'Country not found'
      });
    }

    const states = await all(
      'SELECT id, country_id as countryId, name, code FROM states WHERE country_id = ? ORDER BY name ASC',
      [countryId]
    );

    res.json({
      success: true,
      data: states
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/locations/districts?stateId={stateId}
router.get('/districts', async (req, res, next) => {
  try {
    const { stateId } = req.query;
    if (!stateId) {
      return res.status(400).json({
        success: false,
        error: 'stateId parameter is required'
      });
    }

    // Verify state exists
    const state = await get('SELECT id FROM states WHERE id = ?', [stateId]);
    if (!state) {
      return res.status(404).json({
        success: false,
        error: 'State not found'
      });
    }

    const districts = await all(
      'SELECT id, state_id as stateId, name, code FROM districts WHERE state_id = ? ORDER BY name ASC',
      [stateId]
    );

    res.json({
      success: true,
      data: districts
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/locations/talukas?districtId={districtId}
router.get('/talukas', async (req, res, next) => {
  try {
    const { districtId } = req.query;
    if (!districtId) {
      return res.status(400).json({
        success: false,
        error: 'districtId parameter is required'
      });
    }

    // Verify district exists
    const district = await get('SELECT id FROM districts WHERE id = ?', [districtId]);
    if (!district) {
      return res.status(404).json({
        success: false,
        error: 'District not found'
      });
    }

    const talukas = await all(
      'SELECT id, district_id as districtId, name, code FROM talukas WHERE district_id = ? ORDER BY name ASC',
      [districtId]
    );

    res.json({
      success: true,
      data: talukas
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/locations/villages?talukaId={talukaId}&search={query}&page={page}&limit={limit}
router.get('/villages', async (req, res, next) => {
  try {
    const { talukaId, search, page, limit } = req.query;
    if (!talukaId) {
      return res.status(400).json({
        success: false,
        error: 'talukaId parameter is required'
      });
    }

    // Verify taluka exists
    const taluka = await get('SELECT id FROM talukas WHERE id = ?', [talukaId]);
    if (!taluka) {
      return res.status(404).json({
        success: false,
        error: 'Taluka not found'
      });
    }

    let query = 'SELECT id, taluka_id as talukaId, name, code FROM villages WHERE taluka_id = ?';
    const params = [talukaId];

    if (search && search.trim().length > 0) {
      query += ' AND name LIKE ?';
      params.push(`%${search.trim()}%`);
    }

    query += ' ORDER BY name ASC';

    // Support pagination if limit is specified
    if (limit) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(500, Math.max(1, parseInt(limit, 10) || 100));
      const offset = (pageNum - 1) * limitNum;
      query += ` LIMIT ${limitNum} OFFSET ${offset}`;
    }

    const villages = await all(query, params);

    res.json({
      success: true,
      data: villages,
      count: villages.length
    });
  } catch (err) {
    next(err);
  }
});

// Helper validation function for registration
export async function validateLocationHierarchy({ countryId, stateId, districtId, talukaId, villageId }) {
  if (countryId) {
    const country = await get('SELECT id FROM countries WHERE id = ?', [countryId]);
    if (!country) return { valid: false, error: 'निवडलेला देश अमान्य आहे (Invalid Country).' };
  }

  if (stateId) {
    const state = await get('SELECT id, country_id FROM states WHERE id = ?', [stateId]);
    if (!state) return { valid: false, error: 'निवडलेले राज्य अमान्य आहे (Invalid State).' };
    if (countryId && state.country_id !== countryId) {
      return { valid: false, error: 'राज्य आणि देशाचा संबंध जुळत नाही (State does not belong to selected Country).' };
    }
  }

  if (districtId) {
    const district = await get('SELECT id, state_id FROM districts WHERE id = ?', [districtId]);
    if (!district) return { valid: false, error: 'निवडलेला जिल्हा अमान्य आहे (Invalid District).' };
    if (stateId && district.state_id !== stateId) {
      return { valid: false, error: 'जिल्हा आणि राज्याचा संबंध जुळत नाही (District does not belong to selected State).' };
    }
  }

  if (talukaId) {
    const taluka = await get('SELECT id, district_id FROM talukas WHERE id = ?', [talukaId]);
    if (!taluka) return { valid: false, error: 'निवडलेला तालुका अमान्य आहे (Invalid Taluka).' };
    if (districtId && taluka.district_id !== districtId) {
      return { valid: false, error: 'तालुका आणि जिल्ह्याचा संबंध जुळत नाही (Taluka does not belong to selected District).' };
    }
  }

  if (villageId) {
    const village = await get('SELECT id, taluka_id FROM villages WHERE id = ?', [villageId]);
    if (!village) return { valid: false, error: 'निवडलेले गाव अमान्य आहे (Invalid Village).' };
    if (talukaId && village.taluka_id !== talukaId) {
      return { valid: false, error: 'गाव आणि तालुक्याचा संबंध जुळत नाही (Village does not belong to selected Taluka).' };
    }
  }

  return { valid: true };
}

export default router;
