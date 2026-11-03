import React, { useEffect, useRef, useState } from 'react';
import apiClient from '../../services/apiClient';
import { kpiValue, placeName } from './crmUnitsHelp';

const ITEMS = [
  ['members', '👥 सदस्य'],
  ['businesses', '🏪 व्यवसाय'],
  ['jobsOpen', '💼 खुल्या नोकऱ्या'],
  ['eventsCount', '📅 कार्यक्रम'],
  ['ticketsTotal', '🎫 तक्रारी (एकूण)'],
  ['ticketsOpen', '🎫 तक्रारी (खुल्या)']
];

// The area of a unit in numbers: members in its places (exact, by id) and businesses, jobs, events and tickets typed with
// those districts. Read-only; the server sends counts only.
export default function AreaKpisSection({ unit, version = 0 }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const request = useRef(0);

  useEffect(() => {
    const mine = ++request.current;
    setLoading(true);
    apiClient.crmUnitAreaKpis(unit.id)
      .then((res) => { if (mine === request.current) { setData(res); setError(''); } })
      .catch((e) => { if (mine === request.current) { setData(null); setError(e.message || 'क्षेत्राची माहिती लोड करता आली नाही.'); } })
      .finally(() => { if (mine === request.current) setLoading(false); });
  }, [unit.id, version]);

  const places = data ? [...data.places.districts, ...data.places.talukas].map((p) => placeName(p.name)) : [];

  return (
    <div style={{ marginTop: '16px', borderTop: '1px solid #FED7AA', paddingTop: '14px' }} data-testid="area-kpis-section">
      <h4 style={{ margin: '0 0 8px', color: '#7C2D12', fontWeight: 900 }}>🗺️ क्षेत्र (Area)</h4>
      {loading && <p style={{ margin: 0, fontWeight: 700 }}>लोड होत आहे…</p>}
      {error && <div role="alert" style={{ color: '#991B1B', fontWeight: 800 }}>{error}</div>}
      {data && (
        <>
          <p style={{ margin: '0 0 8px', color: '#64748B', fontWeight: 700, fontSize: '0.82rem' }}>
            {places.length ? `ठिकाणे: ${places.join(', ')}` : 'या युनिटला अजून ठिकाण निवडलेले नाही.'}
            {data.unitsCounted > 1 ? ` · ${data.unitsCounted} युनिट्स` : ''}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
            {ITEMS.map(([key, label]) => (
              <div key={key} style={{ border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '8px 10px', background: '#FFFDF9' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#9A3412' }}>{label}</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#7C2D12' }}>{kpiValue(data.kpis[key])}</div>
                {data.kpis[key]?.byName && <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700 }}>जिल्ह्याच्या नावानुसार</div>}
              </div>
            ))}
          </div>
          {data.talukaOnly && (
            <p style={{ margin: '8px 0 0', color: '#64748B', fontWeight: 700, fontSize: '0.78rem' }}>
              तालुका युनिटसाठी व्यवसाय, नोकऱ्या व कार्यक्रम दाखवता येत नाहीत (त्यात तालुका नसतो); तक्रारी तालुक्याच्या नावानुसार मोजल्या आहेत.
            </p>
          )}
        </>
      )}
    </div>
  );
}
