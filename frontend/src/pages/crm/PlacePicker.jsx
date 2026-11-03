import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { placeName } from './crmUnitsHelp';

const MAHARASHTRA_STATE_ID = '27';
const selectStyle = { width: '100%', padding: '10px 12px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '0.82rem', color: '#C2410C', fontWeight: 800, marginBottom: '5px' };

// The place of a district or taluka unit, picked from the master location list (Maharashtra). A taluka unit also picks a
// taluka of the chosen district. `value` is { districtId, talukaId }; `onChange` gets the new pair.
export default function PlacePicker({ level, value, onChange }) {
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [error, setError] = useState('');
  const districtId = value?.districtId || '';
  const talukaId = value?.talukaId || '';

  useEffect(() => {
    let alive = true;
    apiClient.getLocationDistricts(MAHARASHTRA_STATE_ID)
      .then((list) => { if (alive) setDistricts(list); })
      .catch(() => { if (alive) setError('जिल्ह्यांची यादी लोड करता आली नाही.'); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    setTalukas([]);
    if (level === 'taluka' && districtId) {
      apiClient.getLocationTalukas(districtId)
        .then((list) => { if (alive) setTalukas(list); })
        .catch(() => { if (alive) setError('तालुक्यांची यादी लोड करता आली नाही.'); });
    }
    return () => { alive = false; };
  }, [level, districtId]);

  return (
    <div style={{ display: 'grid', gap: '10px' }}>
      {error && <div role="alert" style={{ color: '#991B1B', fontWeight: 800 }}>{error}</div>}
      <div>
        <label style={labelStyle}>जिल्हा (ठिकाण)</label>
        <select aria-label="जिल्हा" value={districtId} style={selectStyle}
          onChange={(e) => onChange({ districtId: e.target.value, talukaId: '' })}>
          <option value="">— निवडा —</option>
          {districts.map((d) => <option key={d.id} value={d.id}>{placeName(d.name)}</option>)}
        </select>
      </div>
      {level === 'taluka' && (
        <div>
          <label style={labelStyle}>तालुका (ठिकाण)</label>
          <select aria-label="तालुका" value={talukaId} style={selectStyle} disabled={!districtId}
            onChange={(e) => onChange({ districtId, talukaId: e.target.value })}>
            <option value="">— निवडा —</option>
            {talukas.map((t) => <option key={t.id} value={t.id}>{placeName(t.name)}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}
